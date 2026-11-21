export function fmtMinutes(m: number) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export function fmtDate(iso: string) {
  const d = new Date(iso.includes("T") || iso.length > 10 ? iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z") : iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export const QUOTES = [
  ["The expert in anything was once a beginner.", "Helen Hayes"],
  ["We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "Will Durant"],
  ["Live as if you were to die tomorrow. Learn as if you were to live forever.", "Mahatma Gandhi"],
  ["It does not matter how slowly you go as long as you do not stop.", "Confucius"],
  ["A reader lives a thousand lives before he dies.", "George R.R. Martin"],
  ["Tell me and I forget. Teach me and I remember. Involve me and I learn.", "Benjamin Franklin"],
  ["The more that you read, the more things you will know.", "Dr. Seuss"],
] as const;

export function quoteOfTheDay() {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  const day = Math.floor((Date.now() - start) / 86400000);
  return QUOTES[day % QUOTES.length];
}

export function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.round(words / 200)) };
}
