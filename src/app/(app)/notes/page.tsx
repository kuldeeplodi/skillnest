import NotesClient from "@/components/NotesClient";
import PageHeader from "@/components/PageHeader";
import { getAllNotes, getSkills } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Notes — SkillNest" };

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { edit } = await searchParams;
  const skills = (await getSkills(user.id)).map(({ id, title, color }) => ({ id, title, color }));
  const editId = edit ? parseInt(edit, 10) : undefined;
  return (
    <>
      <PageHeader title="Notes" subtitle="Write in Markdown, tag them and link each one to a skill. Open any note to read it." />
      {/* key resets the editor state when arriving from the reader's Edit button */}
      <NotesClient key={editId ?? "list"} notes={await getAllNotes(user.id)} skills={skills} initialEditId={Number.isFinite(editId) ? editId : undefined} />
    </>
  );
}
