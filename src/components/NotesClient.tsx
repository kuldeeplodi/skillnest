"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, Pencil, Pin, PinOff, Plus, Search, Trash2 } from "lucide-react";
import type { Note, Skill } from "@/lib/db";
import { deleteNote, saveNote, togglePin } from "@/lib/actions";
import { fmtDate, readingTime } from "@/lib/format";
import SpotlightCard from "./reactbits/SpotlightCard";
import Modal from "./ui/Modal";
import { Button, Input, Label, Select, Textarea } from "./ui/form";
import { SKILL_COLORS } from "./ui/colors";

type SkillLite = Pick<Skill, "id" | "title" | "color">;

export default function NotesClient({
  notes,
  skills,
  initialEditId,
}: {
  notes: Note[];
  skills: SkillLite[];
  initialEditId?: number;
}) {
  const startNote = initialEditId ? notes.find((n) => n.id === initialEditId && n.is_mine) ?? null : null;
  const [q, setQ] = useState("");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [owner, setOwner] = useState<"all" | "mine">("all");
  const [editing, setEditing] = useState<Note | "new" | null>(startNote);
  const [preview, setPreview] = useState(false);
  const [draft, setDraft] = useState(startNote?.content ?? "");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.split(",").filter(Boolean).forEach((t) => set.add(t)));
    return [...set].sort();
  }, [notes]);

  const filtered = notes.filter((n) => {
    if (owner === "mine" && !n.is_mine) return false;
    if (skillFilter !== "all" && String(n.skill_id ?? "none") !== skillFilter) return false;
    if (tag && !n.tags.split(",").includes(tag)) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!(n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s) || n.tags.includes(s) || n.author_name.toLowerCase().includes(s))) return false;
    }
    return true;
  });

  const openEditor = (n: Note | "new") => {
    setEditing(n);
    setPreview(false);
    setDraft(n === "new" ? "" : n.content);
  };
  const cur = editing && editing !== "new" ? editing : null;
  const chip = (id: number | null) => (SKILL_COLORS[skills.find((s) => s.id === id)?.color ?? "violet"] ?? SKILL_COLORS.violet).chip;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes or authors…" className="!pl-10" />
        </div>
        <Select value={owner} onChange={(e) => setOwner(e.target.value as "all" | "mine")} className="!w-auto">
          <option value="all">All authors</option>
          <option value="mine">My notes</option>
        </Select>
        <Select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="!w-auto">
          <option value="all">All skills</option>
          <option value="none">No skill</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </Select>
        <Button onClick={() => openEditor("new")}>
          <Plus size={16} /> New note
        </Button>
      </div>

      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(tag === t ? null : t)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                tag === t ? "border-accent/40 bg-accent/10 text-accent" : "border-white/[0.08] text-zinc-500 hover:text-zinc-200"
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <SpotlightCard className="p-10 text-center text-sm text-zinc-500">
          {notes.length === 0 ? "No notes yet. Capture what you learn. Markdown is supported." : "No notes match your filters."}
        </SpotlightCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((n) => {
            const rt = readingTime(n.content);
            return (
              <SpotlightCard key={n.id} className="flex flex-col p-5">
                <Link href={`/notes/${n.id}`} className="block">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 font-serif text-[17px] font-semibold leading-snug text-white">{n.title}</h3>
                    {n.pinned ? <Pin size={13} className="mt-1.5 shrink-0 text-accent" /> : null}
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-500">
                    {n.content.replace(/[#>*`_\-\[\]]/g, "").trim() || "Empty note"}
                  </p>
                </Link>
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {n.skill_title && <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${chip(n.skill_id)}`}>{n.skill_title}</span>}
                  {n.tags.split(",").filter(Boolean).map((t) => (
                    <span key={t} className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-zinc-500">#{t}</span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between pt-4 text-xs text-zinc-600">
                  <span>
                    <span className={n.is_mine ? "text-accent" : "text-zinc-400"}>By {n.is_mine ? "you" : n.author_name}</span>
                    {" · "}{fmtDate(n.updated_at)} · {rt.minutes} min read
                  </span>
                  <div className="flex">
                    <Link href={`/notes/${n.id}`} aria-label="Read note" title="Read" className="rounded-md p-2 hover:bg-white/10 hover:text-white">
                      <Eye size={15} />
                    </Link>
                    {n.is_mine && (
                      <>
                        <form action={togglePin}>
                          <input type="hidden" name="id" value={n.id} />
                          <button aria-label={n.pinned ? "Unpin" : "Pin"} className="rounded-md p-2 hover:bg-white/10 hover:text-white">
                            {n.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                          </button>
                        </form>
                        <button onClick={() => openEditor(n)} aria-label="Edit note" className="rounded-md p-2 hover:bg-white/10 hover:text-white">
                          <Pencil size={15} />
                        </button>
                        <form
                          action={deleteNote}
                          onSubmit={(e) => {
                            if (!confirm(`Delete "${n.title}"?`)) e.preventDefault();
                          }}
                        >
                          <input type="hidden" name="id" value={n.id} />
                          <button aria-label="Delete note" className="rounded-md p-2 hover:bg-rose-400/10 hover:text-rose-300">
                            <Trash2 size={15} />
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={cur ? "Edit note" : "New note"} wide>
        <form
          action={async (fd) => {
            await saveNote(fd);
            setEditing(null);
          }}
          className="space-y-4"
        >
          {cur && <input type="hidden" name="id" value={cur.id} />}
          <label className="block">
            <Label>Title</Label>
            <Input name="title" required defaultValue={cur?.title} placeholder="What did you learn?" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <Label>Skill</Label>
              <Select name="skill_id" defaultValue={cur?.skill_id ?? ""}>
                <option value="">None</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </Select>
            </label>
            <label className="block">
              <Label>Tags (comma separated)</Label>
              <Input name="tags" defaultValue={cur?.tags} placeholder="react, hooks, tips" />
            </label>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label>Content (Markdown)</Label>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="mb-1.5 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-accent hover:bg-white/5"
              >
                {preview ? <Pencil size={13} /> : <Eye size={13} />} {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {/* Textarea stays mounted so its value is always submitted */}
            <Textarea
              name="content"
              rows={12}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={`font-mono !text-[13px] ${preview ? "hidden" : ""}`}
              placeholder={"## Heading\n- bullet\n```js\nconsole.log('hello')\n```"}
            />
            {preview && (
              <div className="prose-note min-h-[16rem] rounded-lg border border-white/10 bg-black/30 p-4">
                {draft.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft}</ReactMarkdown> : <span className="text-zinc-600">Nothing to preview.</span>}
              </div>
            )}
          </div>
          <Button type="submit" className="w-full">{cur ? "Save changes" : "Create note"}</Button>
        </form>
      </Modal>
    </>
  );
}
