"use client";
import { useEffect, useRef, useState } from "react";

// React Bits "Blur Text": words resolve from a blur one by one
export default function BlurText({
  text,
  className = "",
  delay = 70,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <p ref={ref} className={`flex flex-wrap gap-x-[0.28em] ${className}`}>
      {text.split(" ").map((w, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-700 ease-out"
          style={{
            transitionDelay: `${i * delay}ms`,
            opacity: show ? 1 : 0,
            filter: show ? "blur(0px)" : "blur(8px)",
            transform: show ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {w}
        </span>
      ))}
    </p>
  );
}
