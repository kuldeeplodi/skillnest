"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { logStudy } from "@/lib/actions";
import SpotlightCard from "./reactbits/SpotlightCard";
import { Button, Input, Label, Select } from "./ui/form";

type S = { id: number; title: string };
const PRESETS = [15, 25, 45, 60];

export default function FocusTimer({ skills }: { skills: S[] }) {
  const [skillId, setSkillId] = useState<number | "">(skills[0]?.id ?? "");
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60); // seconds
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const endAt = useRef<number>(0);
  const total = minutes * 60;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = Math.max(Math.round((endAt.current - Date.now()) / 1000), 0);
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);
        setRunning(false);
        finish(minutes, true);
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    document.title = running ? `${fmt(remaining)} · Focus — SkillNest` : "Focus — SkillNest";
  }, [running, remaining]);

  function fmt(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  function finish(mins: number, completed: boolean) {
    if (!skillId || mins < 1) {
      setMessage(completed ? "Session complete!" : "Too short to log (under 1 minute).");
      return;
    }
    start(async () => {
      const res = await logStudy(Number(skillId), mins, "focus");
      setMessage(res?.ok ? `${completed ? "Session complete! " : ""}Logged ${mins} min to your skill.` : "Could not log this session.");
    });
  }

  const begin = () => {
    setMessage("");
    endAt.current = Date.now() + remaining * 1000;
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = (m = minutes) => {
    setRunning(false);
    setMinutes(m);
    setRemaining(m * 60);
  };
  const stopEarly = () => {
    const elapsedMin = Math.floor((total - remaining) / 60);
    setRunning(false);
    finish(elapsedMin, false);
    setRemaining(total);
  };

  const pct = total ? ((total - remaining) / total) * 100 : 0;
  const R = 120;
  const C = 2 * Math.PI * R;
  const started = remaining !== total;

  return (
    <div className="mx-auto max-w-xl">
      <SpotlightCard className="p-8 text-center">
        <div className="relative mx-auto h-72 w-72">
          <svg viewBox="0 0 280 280" className="-rotate-90">
            <circle cx="140" cy="140" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
            <circle
              cx="140" cy="140" r={R} fill="none" stroke="var(--color-accent)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} style={{ transition: "stroke-dashoffset 0.3s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-semibold tabular-nums tracking-tight text-white">{fmt(remaining)}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-600">{running ? "Focusing" : started ? "Paused" : "Ready"}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          {!running ? (
            <Button onClick={begin} disabled={!skillId} className="!px-8">
              <Play size={16} /> {started ? "Resume" : "Start"}
            </Button>
          ) : (
            <Button onClick={pause} variant="ghost" className="!px-8">
              <Pause size={16} /> Pause
            </Button>
          )}
          {started && (
            <>
              <Button onClick={stopEarly} variant="ghost" title="Stop and log the time so far">
                <Square size={16} /> Finish
              </Button>
              <Button onClick={() => reset()} variant="ghost" aria-label="Reset" title="Reset without logging">
                <RotateCcw size={16} />
              </Button>
            </>
          )}
        </div>

        {message && <p role="status" className="mt-5 text-sm text-accent">{message}</p>}
        {pending && <p className="mt-5 text-sm text-zinc-400">Saving…</p>}
      </SpotlightCard>

      <SpotlightCard className="mt-4 p-6">
        <div className="space-y-4">
          <label className="block">
            <Label>Skill to log time to</Label>
            {skills.length === 0 ? (
              <p className="text-sm text-zinc-400">Create a skill first on the Skills page — focus time is logged against it.</p>
            ) : (
              <Select value={skillId} onChange={(e) => setSkillId(Number(e.target.value))} disabled={running}>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </Select>
            )}
          </label>
          <div>
            <Label>Duration</Label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  disabled={running || started}
                  onClick={() => reset(p)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-40 ${
                    minutes === p ? "bg-white/[0.1] text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  {p} min
                </button>
              ))}
              <Input
                type="number" min={1} max={240} value={minutes} disabled={running || started}
                onChange={(e) => reset(Math.min(Math.max(parseInt(e.target.value || "1", 10), 1), 240))}
                className="!w-24" aria-label="Custom minutes"
              />
            </div>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
