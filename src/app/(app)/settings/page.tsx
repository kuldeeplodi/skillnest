import { LogOut } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { Button, Input, Label } from "@/components/ui/form";
import { saveGoals } from "@/lib/actions";
import { logout } from "@/lib/auth-actions";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Settings — SkillNest" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="Settings" subtitle="Tune your daily goals and manage your account." />
      <div className="grid max-w-3xl gap-4">
        <SpotlightCard className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Daily goals</h2>
          <form action={saveGoals} className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <Label>Pages per day</Label>
              <Input name="pages" type="number" min={1} max={2000} defaultValue={user.daily_goal_pages} />
            </label>
            <label className="block">
              <Label>Learning minutes per day</Label>
              <Input name="minutes" type="number" min={5} max={1440} defaultValue={user.daily_goal_minutes} />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit">Save goals</Button>
            </div>
          </form>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Account</h2>
          <dl className="mb-5 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-zinc-500">Name</dt><dd className="mt-0.5 text-white">{user.name}</dd></div>
            <div><dt className="text-xs text-zinc-500">Email</dt><dd className="mt-0.5 text-white">{user.email}</dd></div>
          </dl>
          <form action={logout}>
            <Button variant="danger"><LogOut size={15} /> Log out</Button>
          </form>
        </SpotlightCard>
      </div>
    </>
  );
}
