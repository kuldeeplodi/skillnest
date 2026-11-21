import { col, type Book, type Note, type ReadingLog, type Skill, type User } from "./db";

export function dateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const NO_ID = { _id: 0 } as const;

export async function getSkills(userId: number): Promise<Skill[]> {
  const skills = (await (await col("skills")).find({ user_id: userId }, { projection: NO_ID }).toArray()) as any[];
  const minutes = await (await col("study_logs"))
    .aggregate([{ $match: { user_id: userId } }, { $group: { _id: "$skill_id", m: { $sum: "$minutes" } } }])
    .toArray();
  const counts = await (await col("notes"))
    .aggregate([
      { $match: { user_id: userId, skill_id: { $ne: null } } },
      { $group: { _id: "$skill_id", c: { $sum: 1 } } },
    ])
    .toArray();
  const minMap = new Map(minutes.map((r) => [r._id as number, r.m as number]));
  const cntMap = new Map(counts.map((r) => [r._id as number, r.c as number]));

  return skills
    .map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      color: s.color,
      target_hours: s.target_hours,
      status: s.status,
      created_at: s.created_at,
      minutes: minMap.get(s.id) ?? 0,
      note_count: cntMap.get(s.id) ?? 0,
    }))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : b.id - a.id)) as Skill[];
}

async function toNotes(rows: any[], viewerId: number): Promise<Note[]> {
  const skillIds = [...new Set(rows.map((r) => r.skill_id).filter((x) => x != null))];
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const skills = skillIds.length
    ? ((await (await col("skills")).find({ id: { $in: skillIds } }, { projection: { _id: 0, id: 1, title: 1 } }).toArray()) as any[])
    : [];
  const users = userIds.length
    ? ((await (await col("users")).find({ id: { $in: userIds } }, { projection: { _id: 0, id: 1, name: 1 } }).toArray()) as any[])
    : [];
  const titles = new Map(skills.map((s) => [s.id as number, s.title as string]));
  const names = new Map(users.map((u) => [u.id as number, u.name as string]));
  return rows.map((n) => {
    const mine = n.user_id === viewerId;
    return {
      id: n.id,
      skill_id: n.skill_id ?? null,
      skill_title: n.skill_id != null ? titles.get(n.skill_id) ?? null : null,
      title: n.title,
      content: n.content,
      tags: n.tags,
      // pinning is personal: other people's pins don't jump to the top of your list
      pinned: mine ? n.pinned : 0,
      created_at: n.created_at,
      updated_at: n.updated_at,
      author_name: names.get(n.user_id) ?? "Unknown",
      is_mine: mine,
    };
  });
}

/** Only the logged-in user's own notes (dashboard, totals, badges). */
export async function getNotes(userId: number): Promise<Note[]> {
  const rows = (await (await col("notes"))
    .find({ user_id: userId }, { projection: NO_ID })
    .sort({ pinned: -1, updated_at: -1, id: -1 })
    .toArray()) as any[];
  return toNotes(rows, userId);
}

/** Every user's notes, each marked with its author. Used by the Notes page and the reader. */
export async function getAllNotes(viewerId: number): Promise<Note[]> {
  const rows = (await (await col("notes"))
    .find({}, { projection: NO_ID })
    .sort({ updated_at: -1, id: -1 })
    .toArray()) as any[];
  const notes = await toNotes(rows, viewerId);
  // own pinned notes first, then newest
  return notes.sort((a, b) => b.pinned - a.pinned || (a.updated_at < b.updated_at ? 1 : a.updated_at > b.updated_at ? -1 : b.id - a.id));
}

/** Any user's note can be opened (read-only unless it's yours). */
export async function getNote(viewerId: number, id: number): Promise<Note | null> {
  if (!Number.isInteger(id)) return null;
  const row = (await (await col("notes")).findOne({ id }, { projection: NO_ID })) as any;
  if (!row) return null;
  return (await toNotes([row], viewerId))[0];
}

export async function getSkillColor(skillId: number | null): Promise<string> {
  if (skillId == null) return "violet";
  const s = (await (await col("skills")).findOne({ id: skillId }, { projection: { _id: 0, color: 1 } })) as any;
  return s?.color ?? "violet";
}

export async function getBooks(userId: number): Promise<Book[]> {
  const rows = (await (await col("books")).find({ user_id: userId }, { projection: NO_ID }).toArray()) as any[];
  const rank: Record<string, number> = { reading: 0, want: 1 };
  return rows
    .map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      total_pages: b.total_pages,
      current_page: b.current_page,
      status: b.status,
      rating: b.rating,
      created_at: b.created_at,
    }))
    .sort((a, b) => (rank[a.status] ?? 2) - (rank[b.status] ?? 2) || b.id - a.id) as Book[];
}

export async function getRecentReading(userId: number, limit = 8): Promise<ReadingLog[]> {
  const logs = (await (await col("reading_logs"))
    .find({ user_id: userId }, { projection: NO_ID })
    .sort({ date: -1, id: -1 })
    .limit(limit)
    .toArray()) as any[];
  const books = (await (await col("books")).find({ user_id: userId }, { projection: { _id: 0, id: 1, title: 1 } }).toArray()) as any[];
  const titles = new Map(books.map((b) => [b.id as number, b.title as string]));
  return logs
    .filter((r) => titles.has(r.book_id))
    .map((r) => ({
      id: r.id,
      book_id: r.book_id,
      book_title: titles.get(r.book_id)!,
      date: r.date,
      pages: r.pages,
      minutes: r.minutes,
    }));
}

export type DayStat = { date: string; pages: number; readMin: number; studyMin: number };

export async function getDailyStats(userId: number, days: number): Promise<DayStat[]> {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const from = dateStr(start);

  const reading = (await (await col("reading_logs"))
    .aggregate([
      { $match: { user_id: userId, date: { $gte: from } } },
      { $group: { _id: "$date", pages: { $sum: "$pages" }, minutes: { $sum: "$minutes" } } },
    ])
    .toArray()) as { _id: string; pages: number; minutes: number }[];
  const study = (await (await col("study_logs"))
    .aggregate([
      { $match: { user_id: userId, date: { $gte: from } } },
      { $group: { _id: "$date", minutes: { $sum: "$minutes" } } },
    ])
    .toArray()) as { _id: string; minutes: number }[];

  const map = new Map<string, DayStat>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dateStr(d);
    map.set(key, { date: key, pages: 0, readMin: 0, studyMin: 0 });
  }
  reading.forEach((r) => {
    const s = map.get(r._id);
    if (s) {
      s.pages = r.pages;
      s.readMin = r.minutes;
    }
  });
  study.forEach((r) => {
    const s = map.get(r._id);
    if (s) s.studyMin = r.minutes;
  });
  return [...map.values()];
}

export function computeStreaks(stats: DayStat[]) {
  const active = (s: DayStat) => s.pages > 0 || s.readMin > 0 || s.studyMin > 0;
  // current streak: walk back from today (allow today to be empty)
  let current = 0;
  let i = stats.length - 1;
  if (!active(stats[i])) i--;
  for (; i >= 0 && active(stats[i]); i--) current++;
  // longest within window
  let longest = 0;
  let run = 0;
  for (const s of stats) {
    run = active(s) ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return { current, longest };
}

export async function getTotals(userId: number) {
  const sum = async (name: "reading_logs" | "study_logs", field: string) => {
    const r = await (await col(name))
      .aggregate([{ $match: { user_id: userId } }, { $group: { _id: null, v: { $sum: `$${field}` } } }])
      .toArray();
    return (r[0]?.v as number) ?? 0;
  };
  const [pages, readMin, studyMin, notes, finished, skillsDone] = await Promise.all([
    sum("reading_logs", "pages"),
    sum("reading_logs", "minutes"),
    sum("study_logs", "minutes"),
    (await col("notes")).countDocuments({ user_id: userId }),
    (await col("books")).countDocuments({ user_id: userId, status: "finished" }),
    (await col("skills")).countDocuments({ user_id: userId, status: "completed" }),
  ]);
  return { pages, readMin, studyMin, notes, finishedBooks: finished, skillsDone };
}

export type Badge = { id: string; title: string; description: string; icon: string; earned: boolean };

export function computeBadges(totals: Awaited<ReturnType<typeof getTotals>>, longestStreak: number): Badge[] {
  return [
    { id: "first-note", title: "First Note", description: "Write your first note", icon: "pen", earned: totals.notes >= 1 },
    { id: "note-10", title: "Note Taker", description: "Write 10 notes", icon: "library", earned: totals.notes >= 10 },
    { id: "streak-3", title: "On a Roll", description: "3-day streak", icon: "flame", earned: longestStreak >= 3 },
    { id: "streak-7", title: "Week Warrior", description: "7-day streak", icon: "zap", earned: longestStreak >= 7 },
    { id: "pages-100", title: "Page Turner", description: "Read 100 pages", icon: "book", earned: totals.pages >= 100 },
    { id: "pages-1000", title: "Bookworm", description: "Read 1,000 pages", icon: "books", earned: totals.pages >= 1000 },
    { id: "book-1", title: "Finisher", description: "Finish a book", icon: "flag", earned: totals.finishedBooks >= 1 },
    { id: "study-10h", title: "Deep Focus", description: "Study 10 hours", icon: "target", earned: totals.studyMin >= 600 },
    { id: "skill-1", title: "Skill Unlocked", description: "Complete a skill", icon: "trophy", earned: totals.skillsDone >= 1 },
  ];
}

export async function getDashboard(user: User) {
  const stats = await getDailyStats(user.id, 119); // 17 weeks for the heatmap
  const streaks = computeStreaks(stats);
  const [totals, skills, books, notes] = await Promise.all([
    getTotals(user.id),
    getSkills(user.id),
    getBooks(user.id),
    getNotes(user.id),
  ]);
  const todayStat = stats[stats.length - 1];
  return {
    stats,
    streaks,
    totals,
    today: todayStat,
    week: stats.slice(-7),
    badges: computeBadges(totals, streaks.longest),
    skills,
    reading: books.filter((b) => b.status === "reading"),
    recentNotes: notes.slice(0, 4),
  };
}
