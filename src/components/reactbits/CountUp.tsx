"use client";
import { useEffect, useRef, useState } from "react";

// React Bits style "Count Up"
export default function CountUp({
  to,
  duration = 1200,
  suffix = "",
  className = "",
}: {
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const [val, setVal] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const startVal = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(startVal + (to - startVal) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return (
    <span className={className}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}
