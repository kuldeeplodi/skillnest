import Link from "next/link";

export default function NoteNotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="font-serif text-3xl font-semibold text-white">Note not found</h1>
      <p className="mt-3 text-sm text-zinc-500">It may have been deleted, or it doesn't belong to your account.</p>
      <Link href="/notes" className="mt-6 inline-block rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg">
        Back to notes
      </Link>
    </div>
  );
}
