import FocusTimer from "@/components/FocusTimer";
import PageHeader from "@/components/PageHeader";
import { getSkills } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Focus — SkillNest" };

export default async function FocusPage() {
  const user = await requireUser();
  const skills = (await getSkills(user.id))
    .filter((s) => s.status !== "completed")
    .map(({ id, title }) => ({ id, title }));
  return (
    <>
      <PageHeader title="Focus timer" subtitle="Pick a skill, start the timer — your time is logged automatically." />
      <FocusTimer skills={skills} />
    </>
  );
}
