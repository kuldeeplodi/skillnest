"use client";
import { useState } from "react";
import { BookMarked, CheckCircle2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { Book, ReadingLog } from "@/lib/db";
import { deleteBook, logReading, rateBook, saveBook, setBookStatus } from "@/lib/actions";
import { fmtDate } from "@/lib/format";
import SpotlightCard from "./reactbits/SpotlightCard";
import Modal from "./ui/Modal";
import { Button, Input, Label } from "./ui/form";

const TABS = [
  { key: "reading", label: "Reading" },
  { key: "want", label: "Want to read" },
  { key: "finished", label: "Finished" },
] as const;

export default function ReadingClient({ books, logs }: { books: Book[]; logs: ReadingLog[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("reading");
  const [editing, setEditing] = useState<Book | "new" | null>(null);
  const [logging, setLogging] = useState<Book | null>(null);

  const shown = books.filter((b) => b.status === tab);
  const cur = editing && editing !== "new" ? editing : null;
  const count = (k: string) => books.filter((b) => b.status === k).length;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === t.key ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              {t.label} <span className="ml-1 text-xs opacity-70">{count(t.key)}</span>
            </button>
          ))}
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus size={16} /> Add book
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {shown.length === 0 ? (
            <SpotlightCard className="p-10 text-center text-zinc-400">
              {tab === "reading" ? "You're not reading anything right now. Add a book to begin." : "Nothing here yet."}
            </SpotlightCard>
          ) : (
            shown.map((b) => {
              const pct = b.total_pages ? Math.min((b.current_page / b.total_pages) * 100, 100) : 0;
              return (
                <SpotlightCard key={b.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-4">
                      <div className="grid h-20 w-14 shrink-0 place-items-center rounded-lg bg-ink-700 font-serif text-xl font-semibold text-accent ring-1 ring-inset ring-white/10 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.8)]">
                        {b.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-white">{b.title}</h3>
                        <p className="text-sm text-zinc-400">{b.author || "Unknown author"}</p>
                        {b.status === "finished" && (
                          <div className="mt-2 flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <form action={rateBook} key={n}>
                                <input type="hidden" name="id" value={b.id} />
                                <input type="hidden" name="rating" value={b.rating === n ? 0 : n} />
                                <button aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`} className="p-0.5">
                                  <Star size={16} className={n <= b.rating ? "fill-amber-300 text-amber-300" : "text-zinc-600"} />
                                </button>
                              </form>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0">
                      <button onClick={() => setEditing(b)} aria-label="Edit book" className="rounded-lg p-2 text-zinc-500 hover:bg-white/10 hover:text-white">
                        <Pencil size={15} />
                      </button>
                      <form
                        action={deleteBook}
                        onSubmit={(e) => {
                          if (!confirm(`Delete "${b.title}" and its reading logs?`)) e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={b.id} />
                        <button aria-label="Delete book" className="rounded-lg p-2 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-300">
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </div>

                  {b.status !== "want" && (
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs text-zinc-400">
                        <span>{b.total_pages ? `Page ${b.current_page} of ${b.total_pages}` : `Page ${b.current_page}`}</span>
                        {b.total_pages > 0 && <span>{Math.round(pct)}%</span>}
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {b.status === "reading" && (
                      <>
                        <Button className="!px-3 !py-1.5 text-xs" onClick={() => setLogging(b)}>
                          <BookMarked size={14} /> Log today's reading
                        </Button>
                        <form action={setBookStatus}>
                          <input type="hidden" name="id" value={b.id} />
                          <input type="hidden" name="status" value="finished" />
                          <Button variant="ghost" className="!px-3 !py-1.5 text-xs"><CheckCircle2 size={14} /> Mark finished</Button>
                        </form>
                      </>
                    )}
                    {b.status === "want" && (
                      <form action={setBookStatus}>
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="status" value="reading" />
                        <Button className="!px-3 !py-1.5 text-xs">Start reading</Button>
                      </form>
                    )}
                    {b.status === "finished" && (
                      <form action={setBookStatus}>
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="status" value="reading" />
                        <Button variant="ghost" className="!px-3 !py-1.5 text-xs">Read again</Button>
                      </form>
                    )}
                  </div>
                </SpotlightCard>
              );
            })
          )}
        </div>

        <SpotlightCard className="h-fit p-5">
          <h2 className="mb-4 font-semibold text-white">Recent sessions</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-zinc-500">Your reading sessions will show up here.</p>
          ) : (
            <ul className="space-y-3">
              {logs.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-zinc-200">{l.book_title}</div>
                    <div className="text-xs text-zinc-500">{fmtDate(l.date)}</div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-zinc-400">
                    {l.pages > 0 && <div>{l.pages} pages</div>}
                    {l.minutes > 0 && <div>{l.minutes} min</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SpotlightCard>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={cur ? "Edit book" : "Add book"}>
        <form
          action={async (fd) => {
            await saveBook(fd);
            setEditing(null);
          }}
          className="space-y-4"
        >
          {cur && <input type="hidden" name="id" value={cur.id} />}
          <label className="block">
            <Label>Title</Label>
            <Input name="title" required defaultValue={cur?.title} placeholder="Atomic Habits" />
          </label>
          <label className="block">
            <Label>Author</Label>
            <Input name="author" defaultValue={cur?.author} placeholder="James Clear" />
          </label>
          <label className="block">
            <Label>Total pages</Label>
            <Input name="total_pages" type="number" min={0} defaultValue={cur?.total_pages ?? ""} placeholder="320" />
          </label>
          <Button type="submit" className="w-full">{cur ? "Save changes" : "Add book"}</Button>
        </form>
      </Modal>

      <Modal open={logging !== null} onClose={() => setLogging(null)} title={logging ? `Log reading · ${logging.title}` : ""}>
        <form
          action={async (fd) => {
            await logReading(fd);
            setLogging(null);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="book_id" value={logging?.id ?? ""} />
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <Label>Pages read</Label>
              <Input name="pages" type="number" min={0} max={5000} defaultValue={10} autoFocus />
            </label>
            <label className="block">
              <Label>Minutes</Label>
              <Input name="minutes" type="number" min={0} max={1440} defaultValue={20} />
            </label>
          </div>
          <Button type="submit" className="w-full">Save session</Button>
        </form>
      </Modal>
    </>
  );
}
