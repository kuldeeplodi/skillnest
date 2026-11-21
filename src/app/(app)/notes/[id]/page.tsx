import { notFound } from "next/navigation";
import NoteReader from "@/components/NoteReader";
import { readingTime } from "@/lib/format";
import { getAllNotes, getNote, getSkillColor } from "@/lib/queries";
import { getUser, requireUser } from "@/lib/session";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  const { id } = await params;
  const note = user ? await getNote(user.id, parseInt(id, 10)) : null;
  return { title: note ? `${note.title} — SkillNest` : "Note — SkillNest" };
}

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  // Any user's note can be read; only its author sees the Edit button
  const note = await getNote(user.id, parseInt(id, 10));
  if (!note) notFound();

  const all = await getAllNotes(user.id);
  const idx = all.findIndex((n) => n.id === note.id);
  const lite = (n: (typeof all)[number] | undefined) =>
    n ? { id: n.id, title: n.title, pinned: n.pinned, skill_title: n.skill_title, author_name: n.author_name, is_mine: n.is_mine } : null;
  const skillColor = await getSkillColor(note.skill_id);
  const { words, minutes } = readingTime(note.content);

  return (
    <NoteReader
      note={note}
      skillColor={skillColor}
      words={words}
      minutes={minutes}
      library={all.map((n) => lite(n)!)}
      prev={lite(all[idx - 1])}
      next={lite(all[idx + 1])}
    />
  );
}
