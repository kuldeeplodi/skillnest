import Link from "next/link";
import {
  BookOpen, Clock, Flag, Flame, Library, NotebookPen, Pen, Quote, Target, Trophy, Zap, type LucideIcon,
} from "lucide-react";
import CountUp from "@/components/reactbits/CountUp";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import Heatmap from "@/components/Heatmap";
import PageHeader from "@/components/PageHeader";
import ProgressRing from "@/components/ui/ProgressRing";
import { SKILL_COLORS } from "@/components/ui/colors";
import { getDashboard } from "@/lib/queries";
import { fmtMinutes, quoteOfTheDay, readingTime } from "@/lib/format";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Dashboard — SkillNest" };

const BADGE_ICONS: Record<string, LucideIcon> = {
  pen: Pen, library: Library, flame: Flame, zap: Zap, book: BookOpen, books: Library, flag: Flag, target: Target, trophy: Trophy,
};

export default async function Dashboard() {
  const user = await requireUser();
  const d = await getDashboard(user);
  const [quote, author] = quoteOfTheDay();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const weekMax = Math.max(60, ...d.week.map((s) => s.readMin + s.studyMin));
  const dayName = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
  const earned = d.badges.filter((b) => b.earned).length;

  const stats = [
    { label: "Day streak", value: d.streaks.current, suffix: "", icon: Flame },
    { label: "Pages read", value: d.totals.pages, suffix: "", icon: BookOpen },
    { label: "Study time", value: Math.round(d.totals.studyMin / 60), suffix: "h", icon: Clock },
    { label: "Notes", value: d.totals.notes, suffix: "", icon: NotebookPen },
  ];

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user.name.split(" ")[0]}`}
        subtitle="Here's how your learning is going."
        action={
          <Link href="/focus" className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] hover:brightness-110">
            Start focus session
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <SpotlightCard key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">{s.label}</span>
              <s.icon size={15} className="text-zinc-600" />
            </div>
            <div className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-white">
              <CountUp to={s.value} suffix={s.suffix} />
            </div>
          </SpotlightCard>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SpotlightCard className="p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Today</h2>
            <span className="text-xs text-zinc-600">Longest streak {d.streaks.longest} days</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <ProgressRing value={d.today.pages} max={user.daily_goal_pages} label="Reading" sub={`${d.today.pages} / ${user.daily_goal_pages} pages`} />
            <ProgressRing
              value={d.today.readMin + d.today.studyMin}
              max={user.daily_goal_minutes}
              label="Learning time"
              sub={`${fmtMinutes(d.today.readMin + d.today.studyMin)} / ${fmtMinutes(user.daily_goal_minutes)}`}
            />
          </div>
        </SpotlightCard>

        <SpotlightCard className="flex flex-col justify-between p-6">
          <Quote size={18} className="text-accent" />
          <p className="mt-4 font-serif text-[17px] leading-relaxed text-zinc-200">{quote}</p>
          <p className="mt-4 text-xs text-zinc-600">{author}</p>
        </SpotlightCard>
      </div>

      <SpotlightCard className="mt-4 p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Activity · last 17 weeks</h2>
        <Heatmap stats={d.stats} />
      </SpotlightCard>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SpotlightCard className="p-6">
          <h2 className="mb-5 text-sm font-semibold text-white">This week</h2>
          <div className="flex h-36 items-end justify-between gap-3">
            {d.week.map((s) => {
              const total = s.readMin + s.studyMin;
              return (
                <div key={s.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-28 w-full items-end">
                    <div
                      title={`${total} min`}
                      className="w-full rounded-t-md bg-accent"
                      style={{ height: `${Math.max((total / weekMax) * 100, total ? 6 : 2)}%`, opacity: total ? 0.85 : 0.12 }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-600">{dayName(s.date)}</span>
                </div>
              );
            })}
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Skills in progress</h2>
            <Link href="/skills" className="text-xs text-zinc-500 hover:text-white">View all</Link>
          </div>
          {d.skills.filter((s) => s.status === "learning").length === 0 ? (
            <p className="text-sm text-zinc-500">No active skills yet. <Link href="/skills" className="text-accent">Add one</Link>.</p>
          ) : (
            <div className="space-y-4">
              {d.skills.filter((s) => s.status === "learning").slice(0, 4).map((s) => {
                const pct = Math.min((s.minutes / 60 / s.target_hours) * 100, 100);
                const c = SKILL_COLORS[s.color] ?? SKILL_COLORS.violet;
                return (
                  <div key={s.id}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="flex items-center gap-2 text-zinc-200"><span className={`h-2 w-2 rounded-full ${c.dot}`} />{s.title}</span>
                      <span className="text-xs text-zinc-600">{fmtMinutes(s.minutes)} / {s.target_hours}h</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SpotlightCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SpotlightCard className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Currently reading</h2>
            <Link href="/reading" className="text-xs text-zinc-500 hover:text-white">Open</Link>
          </div>
          {d.reading.length === 0 ? (
            <p className="text-sm text-zinc-500">Nothing in progress. <Link href="/reading" className="text-accent">Add a book</Link>.</p>
          ) : (
            <div className="space-y-4">
              {d.reading.slice(0, 3).map((b) => {
                const pct = b.total_pages ? (b.current_page / b.total_pages) * 100 : 0;
                return (
                  <div key={b.id}>
                    <div className="flex justify-between text-sm">
                      <span className="truncate text-zinc-200">{b.title}</span>
                      <span className="shrink-0 pl-3 text-xs text-zinc-600">{b.total_pages ? `${Math.round(pct)}%` : `p.${b.current_page}`}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Achievements</h2>
            <span className="text-xs text-zinc-600">{earned} of {d.badges.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {d.badges.map((b) => {
              const Icon = BADGE_ICONS[b.icon] ?? Trophy;
              return (
                <div
                  key={b.id}
                  title={b.description}
                  className={`rounded-xl border p-3 text-center ${b.earned ? "border-accent/25 bg-accent/[0.07]" : "border-white/[0.05] bg-white/[0.015] opacity-45"}`}
                >
                  <Icon size={18} className={`mx-auto ${b.earned ? "text-accent" : "text-zinc-600"}`} />
                  <div className="mt-1.5 text-[11px] font-medium text-zinc-300">{b.title}</div>
                </div>
              );
            })}
          </div>
        </SpotlightCard>
      </div>

      {d.recentNotes.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent notes</h2>
            <Link href="/notes" className="text-xs text-zinc-500 hover:text-white">All notes</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {d.recentNotes.map((n) => (
              <Link key={n.id} href={`/notes/${n.id}`}>
                <SpotlightCard className="h-full p-4">
                  <div className="truncate font-serif text-[15px] font-semibold text-white">{n.title}</div>
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-zinc-500">{n.content.replace(/[#>*`_\-\[\]]/g, "").slice(0, 140) || "Empty note"}</p>
                  <div className="mt-3 text-[11px] text-zinc-600">{readingTime(n.content).minutes} min read</div>
                </SpotlightCard>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
