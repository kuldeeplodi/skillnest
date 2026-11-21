// Muted, flat skill colours (no gradients). Keys match what is stored in the database.
export const SKILL_COLORS: Record<string, { bar: string; chip: string; dot: string }> = {
  violet: { bar: "bg-violet-400", chip: "bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-400/20", dot: "bg-violet-400" },
  blue: { bar: "bg-sky-400", chip: "bg-sky-400/10 text-sky-300 ring-1 ring-inset ring-sky-400/20", dot: "bg-sky-400" },
  emerald: { bar: "bg-emerald-400", chip: "bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20", dot: "bg-emerald-400" },
  amber: { bar: "bg-amber-400", chip: "bg-amber-400/10 text-amber-300 ring-1 ring-inset ring-amber-400/20", dot: "bg-amber-400" },
  rose: { bar: "bg-rose-400", chip: "bg-rose-400/10 text-rose-300 ring-1 ring-inset ring-rose-400/20", dot: "bg-rose-400" },
  cyan: { bar: "bg-cyan-400", chip: "bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/20", dot: "bg-cyan-400" },
};
export const COLOR_KEYS = Object.keys(SKILL_COLORS);
