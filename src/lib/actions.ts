"use server";

import { revalidatePath } from "next/cache";
import { col, nextId, nowStr } from "./db";
import { requireUser } from "./session";

// Every query below is scoped with user_id so one user can never touch another user's documents.

const COLORS = ["violet", "blue", "emerald", "amber", "rose", "cyan"];
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const int = (v: FormDataEntryValue | null, fallback = 0) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
};
const refresh = () => revalidatePath("/", "layout");

/* ───────── Skills ───────── */

export async function saveSkill(formData: FormData) {
  const user = await requireUser();
  const id = int(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const description = String(formData.get("description") ?? "").trim();
  const color = COLORS.includes(String(formData.get("color"))) ? String(formData.get("color")) : "violet";
  const target = Math.min(Math.max(int(formData.get("target_hours"), 20), 1), 10000);
  const status = ["learning", "paused", "completed"].includes(String(formData.get("status")))
    ? String(formData.get("status"))
    : "learning";

  const skills = await col("skills");
  if (id) {
    await skills.updateOne(
      { id, user_id: user.id },
      { $set: { title, description, color, target_hours: target, status } }
    );
  } else {
    await skills.insertOne({
      id: await nextId("skills"),
      user_id: user.id,
      title,
      description,
      color,
      target_hours: target,
      status,
      created_at: nowStr(),
    });
  }
  refresh();
}

export async function deleteSkill(formData: FormData) {
  const user = await requireUser();
  const id = int(formData.get("id"));
  const skills = await col("skills");
  const res = await skills.deleteOne({ id, user_id: user.id });
  if (res.deletedCount) {
    // Same as the old foreign keys: study logs cascade, notes keep existing but lose the skill link
    await (await col("study_logs")).deleteMany({ skill_id: id, user_id: user.id });
    await (await col("notes")).updateMany({ skill_id: id, user_id: user.id }, { $set: { skill_id: null } });
  }
  refresh();
}

export async function logStudy(skillId: number, minutes: number, source: "manual" | "focus" = "manual") {
  const user = await requireUser();
  const mins = Math.min(Math.max(Math.round(minutes), 1), 24 * 60);
  const owned = await (await col("skills")).findOne({ id: skillId, user_id: user.id }, { projection: { id: 1 } });
  if (!owned) return { ok: false };
  await (await col("study_logs")).insertOne({
    id: await nextId("study_logs"),
    user_id: user.id,
    skill_id: skillId,
    date: today(),
    minutes: mins,
    source,
    created_at: nowStr(),
  });
  refresh();
  return { ok: true };
}

export async function logStudyForm(formData: FormData) {
  await logStudy(int(formData.get("skill_id")), int(formData.get("minutes"), 0));
}

/* ───────── Notes ───────── */

export async function saveNote(formData: FormData) {
  const user = await requireUser();
  const id = int(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim() || "Untitled note";
  const content = String(formData.get("content") ?? "");
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8)
    .join(",");
  const skillRaw = int(formData.get("skill_id"), 0);
  let skillId: number | null = null;
  if (skillRaw) {
    const owned = await (await col("skills")).findOne({ id: skillRaw, user_id: user.id }, { projection: { id: 1 } });
    skillId = owned ? skillRaw : null;
  }

  const notes = await col("notes");
  if (id) {
    await notes.updateOne(
      { id, user_id: user.id },
      { $set: { title, content, tags, skill_id: skillId, updated_at: nowStr() } }
    );
  } else {
    const ts = nowStr();
    await notes.insertOne({
      id: await nextId("notes"),
      user_id: user.id,
      skill_id: skillId,
      title,
      content,
      tags,
      pinned: 0,
      created_at: ts,
      updated_at: ts,
    });
  }
  refresh();
}

export async function deleteNote(formData: FormData) {
  const user = await requireUser();
  await (await col("notes")).deleteOne({ id: int(formData.get("id")), user_id: user.id });
  refresh();
}

export async function togglePin(formData: FormData) {
  const user = await requireUser();
  // pinned = 1 - pinned (atomic, done inside Mongo)
  await (await col("notes")).updateOne({ id: int(formData.get("id")), user_id: user.id }, [
    { $set: { pinned: { $subtract: [1, "$pinned"] } } },
  ]);
  refresh();
}

/* ───────── Reading ───────── */

export async function saveBook(formData: FormData) {
  const user = await requireUser();
  const id = int(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const author = String(formData.get("author") ?? "").trim();
  const total = Math.max(int(formData.get("total_pages"), 0), 0);

  const books = await col("books");
  if (id) {
    await books.updateOne({ id, user_id: user.id }, { $set: { title, author, total_pages: total } });
  } else {
    await books.insertOne({
      id: await nextId("books"),
      user_id: user.id,
      title,
      author,
      total_pages: total,
      current_page: 0,
      status: "reading",
      rating: 0,
      created_at: nowStr(),
    });
  }
  refresh();
}

export async function deleteBook(formData: FormData) {
  const user = await requireUser();
  const id = int(formData.get("id"));
  const res = await (await col("books")).deleteOne({ id, user_id: user.id });
  if (res.deletedCount) await (await col("reading_logs")).deleteMany({ book_id: id, user_id: user.id });
  refresh();
}

export async function setBookStatus(formData: FormData) {
  const user = await requireUser();
  const status = String(formData.get("status"));
  if (!["want", "reading", "finished"].includes(status)) return;
  const id = int(formData.get("id"));
  const books = await col("books");
  await books.updateOne({ id, user_id: user.id }, { $set: { status } });
  if (status === "finished") {
    await books.updateOne({ id, user_id: user.id, total_pages: { $gt: 0 } }, [
      { $set: { current_page: "$total_pages" } },
    ]);
  }
  refresh();
}

export async function rateBook(formData: FormData) {
  const user = await requireUser();
  const rating = Math.min(Math.max(int(formData.get("rating")), 0), 5);
  await (await col("books")).updateOne({ id: int(formData.get("id")), user_id: user.id }, { $set: { rating } });
  refresh();
}

export async function logReading(formData: FormData) {
  const user = await requireUser();
  const bookId = int(formData.get("book_id"));
  const pages = Math.min(Math.max(int(formData.get("pages")), 0), 5000);
  const minutes = Math.min(Math.max(int(formData.get("minutes")), 0), 24 * 60);
  if (!pages && !minutes) return;

  const books = await col("books");
  const book = (await books.findOne(
    { id: bookId, user_id: user.id },
    { projection: { id: 1, total_pages: 1, current_page: 1 } }
  )) as unknown as { id: number; total_pages: number; current_page: number } | null;
  if (!book) return;

  await (await col("reading_logs")).insertOne({
    id: await nextId("reading_logs"),
    user_id: user.id,
    book_id: bookId,
    date: today(),
    pages,
    minutes,
    created_at: nowStr(),
  });

  let current = book.current_page + pages;
  if (book.total_pages > 0) current = Math.min(current, book.total_pages);
  const finished = book.total_pages > 0 && current >= book.total_pages;
  await books.updateOne(
    { id: bookId, user_id: user.id },
    { $set: { current_page: current, status: finished ? "finished" : "reading" } }
  );
  refresh();
}

/* ───────── Settings ───────── */

export async function saveGoals(formData: FormData) {
  const user = await requireUser();
  const pages = Math.min(Math.max(int(formData.get("pages"), 20), 1), 2000);
  const minutes = Math.min(Math.max(int(formData.get("minutes"), 60), 5), 1440);
  await (await col("users")).updateOne(
    { id: user.id },
    { $set: { daily_goal_pages: pages, daily_goal_minutes: minutes } }
  );
  refresh();
}
