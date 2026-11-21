import PageHeader from "@/components/PageHeader";
import SkillsClient from "@/components/SkillsClient";
import { getSkills } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Skills — SkillNest" };

export default async function SkillsPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="Skills" subtitle="Everything you're learning, with a goal and progress for each." />
      <SkillsClient skills={await getSkills(user.id)} />
    </>
  );
}
