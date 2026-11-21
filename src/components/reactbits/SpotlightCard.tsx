"use client";
import { useRef, type ReactNode, type MouseEvent } from "react";

// React Bits "Spotlight Card", toned down: a faint neutral light follows the cursor over a lifted surface
export default function SpotlightCard({
  children,
  className = "",
  raised = false,
}: {
  children: ReactNode;
  className?: string;
  raised?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`group relative overflow-hidden rounded-2xl transition-colors hover:border-white/15 ${raised ? "surface-raised" : "surface"} ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.055), transparent 65%)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
