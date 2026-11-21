import type { DayStat } from "@/lib/queries";

function level(s: DayStat) {
  const m = s.readMin + s.studyMin + (s.pages > 0 && s.readMin === 0 ? 10 : 0);
  if (m === 0) return 0;
  if (m <= 20) return 1;
  if (m <= 45) return 2;
  if (m <= 90) return 3;
  return 4;
}
const COLORS = ["bg-white/[0.05]", "bg-accent/25", "bg-accent/45", "bg-accent/70", "bg-accent"];

export default function Heatmap({ stats }: { stats: DayStat[] }) {
  const first = new Date(stats[0].date + "T00:00:00");
  const pad = first.getDay(); // align first column to its weekday
  const cells: (DayStat | null)[] = [...Array(pad).fill(null), ...stats];
  const weeks: (DayStat | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div>
      <div className="flex gap-1 pb-1">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex min-w-0 flex-1 flex-col gap-1">
            {Array.from({ length: 7 }).map((_, di) => {
              const s = w[di];
              if (!s) return <div key={di} className="aspect-square w-full" />;
              return (
                <div
                  key={di}
                  title={`${s.date}: ${s.readMin + s.studyMin} min, ${s.pages} pages`}
                  className={`aspect-square w-full max-h-5 rounded-sm ${COLORS[level(s)]}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-zinc-600">
        Less
        {COLORS.map((c, i) => (
          <span key={i} className={`h-3 w-3 rounded-[3px] ${c}`} />
        ))}
        More
      </div>
    </div>
  );
}
