"use client";
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`animate-fade-up surface-raised relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-ink-800 p-6 sm:rounded-2xl ${
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        }`}
        style={{ backgroundColor: "var(--color-ink-800)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white">
            <X size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
