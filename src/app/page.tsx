import Link from "next/link";
import { ArrowRight, BookOpen, Flame, NotebookPen, ShieldCheck, Target, Timer } from "lucide-react";
import BlurText from "@/components/reactbits/BlurText";
import DotGrid from "@/components/reactbits/DotGrid";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import StarBorder from "@/components/reactbits/StarBorder";
import { Logo } from "@/components/Sidebar";
import { getUser } from "@/lib/session";

// Deterministic fake activity for the preview (no randomness, so server render is stable)
const heat = Array.from({ length: 12 * 7 }, (_, i) => {
  const v = (Math.sin(i * 12.9898) * 43758.5453) % 1;
  const n = Math.abs(v);
  return n < 0.35 ? 0 : n < 0.6 ? 1 : n < 0.8 ? 2 : n < 0.93 ? 3 : 4;
});
const HEAT = ["bg-white/[0.05]", "bg-accent/25", "bg-accent/45", "bg-accent/70", "bg-accent"];

export default async function Home() {
  const user = await getUser();

  return (
    <main className="relative overflow-hidden">
      <DotGrid className="h-[640px]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/"><Logo /></Link>
        <nav className="flex items-center gap-1 text-sm">
          {user ? (
            <Link href="/dashboard" className="rounded-lg bg-white/[0.07] px-4 py-2 font-medium text-white hover:bg-white/10">
              Open app
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-4 py-2 text-zinc-400 hover:text-white">Log in</Link>
              <Link href="/signup" className="rounded-lg bg-white/[0.07] px-4 py-2 font-medium text-white hover:bg-white/10">Sign up</Link>
            </>
          )}
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-6 pb-32 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div>
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-accent">Notes · Skills · Reading</p>
          <h1 className="text-5xl font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl">
            A quiet place to learn, every day.
          </h1>
          <BlurText
            className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400"
            text="Keep your notes, track the skills you are building and log your daily reading in one private workspace."
          />
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href={user ? "/dashboard" : "/signup"}>
              <StarBorder>
                {user ? "Open dashboard" : "Get started free"} <ArrowRight size={16} />
              </StarBorder>
            </Link>
            {!user && (
              <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white">
                I already have an account
              </Link>
            )}
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-zinc-600">
            <ShieldCheck size={14} /> Each account is private. Nobody else can see your notes.
          </p>
        </div>

        {/* Product preview */}
        <div className="relative">
          <div className="surface-raised rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-500">Current streak</div>
                <div className="mt-0.5 flex items-baseline gap-1.5 text-3xl font-semibold text-white">
                  12 <span className="text-sm font-normal text-zinc-500">days</span>
                </div>
              </div>
              <div className="flex gap-2">
                {["Notes 24", "Pages 1,310"].map((t) => (
                  <span key={t} className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300">{t}</span>
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-flow-col grid-rows-7 gap-1">
              {heat.map((l, i) => (
                <span key={i} className={`h-3 w-3 rounded-[3px] ${HEAT[l]}`} />
              ))}
            </div>
            <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-4">
              {[["TypeScript", 72], ["Spanish", 38]].map(([n, p]) => (
                <div key={n}>
                  <div className="mb-1.5 flex justify-between text-xs"><span className="text-zinc-300">{n}</span><span className="text-zinc-600">{p}%</span></div>
                  <div className="h-1.5 rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-accent" style={{ width: `${p}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="surface-raised absolute -bottom-14 -left-8 hidden w-64 rounded-xl p-4 sm:block" style={{ backgroundColor: "var(--color-ink-800)", backgroundImage: "none" }}>
            <div className="font-serif text-[15px] font-semibold text-white">React Server Components</div>
            <p className="mt-1.5 font-serif text-xs leading-relaxed text-zinc-500">Components render on the server by default, which keeps the client bundle small…</p>
            <div className="mt-2.5 text-[11px] text-zinc-600">3 min read</div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: NotebookPen, title: "Notes you can actually read", text: "Write in Markdown, tag and pin. Every note opens in a clean reading view with a table of contents." },
            { icon: Target, title: "Skills with a finish line", text: "Set a goal in hours, log your time and watch each skill progress." },
            { icon: BookOpen, title: "A daily reading habit", text: "Log pages and minutes after every session and move books from want-to-read to finished." },
            { icon: Flame, title: "Streaks and heatmap", text: "A 17-week activity map shows how consistent you have been." },
            { icon: Timer, title: "Focus timer", text: "Start a session and the time is logged to the skill you picked." },
            { icon: ShieldCheck, title: "Private by design", text: "Passwords are hashed and every query is scoped to your account." },
          ].map((f) => (
            <SpotlightCard key={f.title} className="p-6">
              <div className="mb-4 grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-accent">
                <f.icon size={17} />
              </div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.text}</p>
            </SpotlightCard>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] py-8 text-center text-xs text-zinc-600">
        SkillNest · Next.js & Tailwind CSS
      </footer>
    </main>
  );
}
