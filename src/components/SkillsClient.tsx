"use client";
import { useState } from "react";
import { Clock, NotebookPen, Pencil, Plus, Trash2 } from "lucide-react";
import type { Skill } from "@/lib/db";
import { deleteSkill, logStudyForm, saveSkill } from "@/lib/actions";
import { fmtMinutes } from "@/lib/format";
import SpotlightCard from "./reactbits/SpotlightCard";
import Modal from "./ui/Modal";
import { Button, Input, Label, Select, Textarea } from "./ui/form";
import { COLOR_KEYS, SKILL_COLORS } from "./ui/colors";

const STATUS_LABEL: Record<string, string> = { learning: "Learning", paused: "Paused", completed: "Completed" };

export default function SkillsClient({ skills }: { skills: Skill[] }) {
  const [editing, setEditing] = useState<Skill | "new" | null>(null);
  const [logging, setLogging] = useState<Skill | null>(null);
  const [color, setColor] = useState("violet");

  const openEdit = (s: Skill | "new") => {
    setColor(s === "new" ? "violet" : s.color);
    setEditing(s);
  };
  const cur = editing && editing !== "new" ? editing : null;

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => openEdit("new")}>
          <Plus size={16} /> New skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <SpotlightCard className="p-10 text-center text-zinc-400">
          No skills yet. Add something you want to learn — like "TypeScript", "Guitar" or "Public speaking".
        </SpotlightCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {skills.map((s) => {
            const c = SKILL_COLORS[s.color] ?? SKILL_COLORS.violet;
            const pct = Math.min((s.minutes / 60 / s.target_hours) * 100, 100);
            return (
              <SpotlightCard key={s.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${c.dot}`} />
                      <h3 className="truncate text-lg font-semibold text-white">{s.title}</h3>
                    </div>
                    <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${c.chip}`}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} aria-label="Edit skill" className="rounded-lg p-2 text-zinc-500 hover:bg-white/10 hover:text-white">
                      <Pencil size={15} />
                    </button>
                    <form
                      action={deleteSkill}
                      onSubmit={(e) => {
                        if (!confirm(`Delete "${s.title}" and its study logs? Linked notes will be kept.`)) e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="id" value={s.id} />
                      <button aria-label="Delete skill" className="rounded-lg p-2 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-300">
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>
                </div>

                {s.description && <p className="mt-3 line-clamp-2 text-sm text-zinc-400">{s.description}</p>}

                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs text-zinc-400">
                    <span>{fmtMinutes(s.minutes)} studied</span>
                    <span>{Math.round(pct)}% of {s.target_hours}h</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className={`h-full rounded-full ${c.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <NotebookPen size={13} /> {s.note_count} {s.note_count === 1 ? "note" : "notes"}
                  </span>
                  <Button variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => setLogging(s)}>
                    <Clock size={13} /> Log time
                  </Button>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={cur ? "Edit skill" : "New skill"}>
        <form
          action={async (fd) => {
            await saveSkill(fd);
            setEditing(null);
          }}
          className="space-y-4"
        >
          {cur && <input type="hidden" name="id" value={cur.id} />}
          <label className="block">
            <Label>Skill name</Label>
            <Input name="title" required defaultValue={cur?.title} placeholder="e.g. Next.js, Spanish, Piano" />
          </label>
          <label className="block">
            <Label>Description</Label>
            <Textarea name="description" rows={2} defaultValue={cur?.description} placeholder="Why are you learning this?" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <Label>Target (hours)</Label>
              <Input name="target_hours" type="number" min={1} max={10000} defaultValue={cur?.target_hours ?? 20} />
            </label>
            <label className="block">
              <Label>Status</Label>
              <Select name="status" defaultValue={cur?.status ?? "learning"}>
                <option value="learning">Learning</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </Select>
            </label>
          </div>
          <div>
            <Label>Colour</Label>
            <input type="hidden" name="color" value={color} />
            <div className="flex gap-2.5">
              {COLOR_KEYS.map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setColor(k)}
                  aria-label={k}
                  className={`h-8 w-8 rounded-full ${SKILL_COLORS[k].dot} ${color === k ? "ring-2 ring-white ring-offset-2 ring-offset-ink-800" : "opacity-60 hover:opacity-100"}`}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full">{cur ? "Save changes" : "Add skill"}</Button>
        </form>
      </Modal>

      <Modal open={logging !== null} onClose={() => setLogging(null)} title={logging ? `Log time · ${logging.title}` : ""}>
        <form
          action={async (fd) => {
            await logStudyForm(fd);
            setLogging(null);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="skill_id" value={logging?.id ?? ""} />
          <label className="block">
            <Label>Minutes studied</Label>
            <Input name="minutes" type="number" min={1} max={1440} required autoFocus defaultValue={30} />
          </label>
          <Button type="submit" className="w-full">Add to today</Button>
        </form>
      </Modal>
    </>
  );
}
