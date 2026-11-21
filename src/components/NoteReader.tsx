"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { ArrowLeft, ArrowRight, Clock, Minus, Pencil, Pin, Plus } from "lucide-react";
import type { Note } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { SKILL_COLORS } from "./ui/colors";

type LibItem = Pick<Note, "id" | "title" | "pinned" | "skill_title" | "author_name" | "is_mine">;
type Heading = { id: string; text: string; level: number };

export default function NoteReader({
  note,
  skillColor,
  words,
  minutes,
  library,
  prev,
  next,
}: {
  note: Note;
  skillColor: string;
  words: number;
  minutes: number;
  library: LibItem[];
  prev: LibItem | null;
  next: LibItem | null;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState(18);
  const [progress, setProgress] = useState(0);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");
  const tags = note.tags.split(",").filter(Boolean);
  const chip = (SKILL_COLORS[skillColor] ?? SKILL_COLORS.violet).chip;

  // remembered font size
  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem("skillnest-reader-size") ?? "", 10);
      if (saved >= 15 && saved <= 24) setSize(saved);
    } catch {}
  }, []);
  const changeSize = (delta: number) => {
    const n = Math.min(24, Math.max(15, size + delta));
    setSize(n);
    try {
      localStorage.setItem("skillnest-reader-size", String(n));
    } catch {}
  };

  // table of contents, read from the rendered headings (ids come from rehype-slug)
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    const hs = Array.from(el.querySelectorAll<HTMLElement>("h1[id],h2[id],h3[id]")).map((h) => ({
      id: h.id,
      text: h.textContent ?? "",
      level: Number(h.tagName[1]),
    }));
    setHeadings(hs);
    setActive(hs[0]?.id ?? "");
    if (!hs.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-72px 0px -65% 0px" }
    );
    el.querySelectorAll("h1[id],h2[id],h3[id]").forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [note.id, note.content]);

  // reading progress
  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.5;
      setProgress(total > 0 ? Math.min(Math.max(-r.top / total, 0), 1) : 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [note.id]);

  return (
    <>
      {/* reading progress */}
      <div className="fixed inset-x-0 top-0 z-40 h-[2px] bg-transparent lg:left-60">
        <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_210px]">
        {/* Library */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pr-1">
            <Link href="/notes" className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-white">
              <ArrowLeft size={13} /> All notes
            </Link>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-600">All notes</div>
            <ul className="space-y-0.5">
              {library.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/notes/${n.id}`}
                    className={`flex items-start gap-2 rounded-lg px-3 py-2 text-[13px] leading-snug transition ${
                      n.id === note.id ? "bg-white/[0.07] text-white" : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    <span className="flex-1">
                      <span className="line-clamp-2">{n.title}</span>
                      {!n.is_mine && <span className="mt-0.5 block text-[11px] text-zinc-600">by {n.author_name}</span>}
                    </span>
                    {n.pinned ? <Pin size={11} className="mt-1 shrink-0 text-accent" /> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Article */}
        <div className="min-w-0">
          <div className="mb-8 flex items-center justify-between gap-3 lg:hidden">
            <Link href="/notes" className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-white">
              <ArrowLeft size={13} /> All notes
            </Link>
          </div>

          <article ref={articleRef} className="mx-auto max-w-[44rem]">
            <header className="mb-10 border-b border-white/[0.07] pb-8">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {note.skill_title && <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${chip}`}>{note.skill_title}</span>}
                {tags.map((t) => (
                  <span key={t} className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-500">#{t}</span>
                ))}
              </div>
              <h1 className="font-serif text-4xl font-semibold leading-[1.15] tracking-tight text-white sm:text-[2.6rem]">{note.title}</h1>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {minutes} min read</span>
                  <span>{words.toLocaleString()} words</span>
                  <span>Updated {fmtDate(note.updated_at)}</span>
                  <span className="font-medium text-zinc-300">By {note.is_mine ? "you" : note.author_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03]">
                    <button onClick={() => changeSize(-1)} aria-label="Smaller text" className="p-2 text-zinc-400 hover:text-white"><Minus size={14} /></button>
                    <span className="px-1 text-[11px] font-medium tabular-nums text-zinc-500">{size}px</span>
                    <button onClick={() => changeSize(1)} aria-label="Larger text" className="p-2 text-zinc-400 hover:text-white"><Plus size={14} /></button>
                  </div>
                  {note.is_mine && (
                    <Link
                      href={`/notes?edit=${note.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-medium text-zinc-200 hover:bg-white/[0.08]"
                    >
                      <Pencil size={13} /> Edit
                    </Link>
                  )}
                </div>
              </div>
            </header>

            <div className="reader" style={{ fontSize: `${size}px` }}>
              {note.content.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
                  {note.content}
                </ReactMarkdown>
              ) : (
                <p className="text-zinc-600">{note.is_mine ? "This note is empty. Use Edit to start writing." : "This note is empty."}</p>
              )}
            </div>

            {(prev || next) && (
              <nav className="mt-16 grid gap-3 border-t border-white/[0.07] pt-8 sm:grid-cols-2">
                {prev ? (
                  <Link href={`/notes/${prev.id}`} className="surface group rounded-xl p-4 transition hover:border-white/15">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-600"><ArrowLeft size={12} /> Previous</div>
                    <div className="mt-1 line-clamp-2 font-serif text-[15px] font-semibold text-zinc-200 group-hover:text-white">{prev.title}</div>
                  </Link>
                ) : <span />}
                {next ? (
                  <Link href={`/notes/${next.id}`} className="surface group rounded-xl p-4 text-right transition hover:border-white/15">
                    <div className="flex items-center justify-end gap-1.5 text-[11px] text-zinc-600">Next <ArrowRight size={12} /></div>
                    <div className="mt-1 line-clamp-2 font-serif text-[15px] font-semibold text-zinc-200 group-hover:text-white">{next.title}</div>
                  </Link>
                ) : <span />}
              </nav>
            )}
          </article>
        </div>

        {/* Table of contents */}
        <aside className="hidden xl:block">
          {headings.length > 1 && (
            <div className="sticky top-8">
              <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-zinc-600">On this page</div>
              <ul className="space-y-0.5 border-l border-white/[0.07]">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      style={{ paddingLeft: `${12 + (h.level - 1) * 12}px` }}
                      className={`-ml-px block border-l py-1 pr-2 text-[12.5px] leading-snug transition ${
                        active === h.id ? "border-accent text-white" : "border-transparent text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-[11px] text-zinc-600">{Math.round(progress * 100)}% read</div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
