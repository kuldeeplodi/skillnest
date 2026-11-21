import PageHeader from "@/components/PageHeader";
import ReadingClient from "@/components/ReadingClient";
import { getBooks, getRecentReading } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Reading — SkillNest" };

export default async function ReadingPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="Daily reading" subtitle="Log pages and minutes after every session to keep your streak alive." />
      <ReadingClient books={await getBooks(user.id)} logs={await getRecentReading(user.id, 10)} />
    </>
  );
}
