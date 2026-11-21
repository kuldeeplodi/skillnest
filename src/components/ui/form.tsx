import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

const field =
  "w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] transition focus:border-accent/60 focus:ring-4 focus:ring-accent/10";

export function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-xs font-medium text-zinc-400">{children}</span>;
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${field} ${props.className ?? ""}`} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${field} ${props.className ?? ""}`} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${field} ${props.className ?? ""}`} />;
}

type Variant = "primary" | "ghost" | "danger";
export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: "bg-accent text-accent-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.4)] hover:brightness-110",
    ghost: "border border-white/10 bg-white/[0.04] text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-white/[0.08]",
    danger: "border border-rose-400/20 bg-rose-400/[0.07] text-rose-300 hover:bg-rose-400/15",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    />
  );
}
