import type { ReactNode } from "react";

// React Bits "Star Border": a thin light travels around the button edge (accent coloured, subtle)
export default function StarBorder({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative inline-flex overflow-hidden rounded-xl p-px ${className}`}>
      <span className="absolute inset-[-100%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_70%,var(--color-accent)_100%)]" />
      <span className="relative inline-flex items-center justify-center gap-2 rounded-[11px] bg-accent px-6 py-3 text-sm font-semibold text-accent-fg">
        {children}
      </span>
    </span>
  );
}
