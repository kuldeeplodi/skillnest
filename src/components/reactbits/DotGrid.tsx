// React Bits "Dot Grid" style background, CSS only
export default function DotGrid({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.11) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 75%)",
      }}
    />
  );
}
