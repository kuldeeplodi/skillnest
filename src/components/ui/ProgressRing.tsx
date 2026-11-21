export default function ProgressRing({
  value,
  max,
  size = 88,
  stroke = 7,
  label,
  sub,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  label: string;
  sub: string;
  id?: string;
  from?: string;
  to?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{ transition: "stroke-dashoffset 0.9s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-white">
          {Math.round(pct * 100)}%
        </div>
      </div>
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-zinc-500">{sub}</div>
      </div>
    </div>
  );
}
