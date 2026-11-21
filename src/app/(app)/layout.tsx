import Sidebar from "@/components/Sidebar";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen">
      <Sidebar name={user.name} email={user.email} />
      <main className="px-4 pb-28 pt-8 sm:px-8 lg:ml-60 lg:pb-12">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
