import { MongoClient, type Db, type Collection } from "mongodb";

/**
 * MongoDB data layer.
 *
 * To keep every page, form and URL working exactly as before, each document keeps a numeric
 * `id` (auto-incremented through a `counters` collection) next to Mongo's own `_id`.
 */

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "skillnest";

type Cache = { client?: Promise<MongoClient>; indexes?: Promise<void> };
const g = globalThis as unknown as { _skillnestMongo?: Cache };
const cache: Cache = g._skillnestMongo ?? (g._skillnestMongo = {});

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection("users").createIndex({ id: 1 }, { unique: true }),
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("skills").createIndex({ id: 1 }, { unique: true }),
    db.collection("skills").createIndex({ user_id: 1 }),
    db.collection("notes").createIndex({ id: 1 }, { unique: true }),
    db.collection("notes").createIndex({ user_id: 1, pinned: -1, updated_at: -1 }),
    db.collection("study_logs").createIndex({ user_id: 1, date: 1 }),
    db.collection("study_logs").createIndex({ skill_id: 1 }),
    db.collection("books").createIndex({ id: 1 }, { unique: true }),
    db.collection("books").createIndex({ user_id: 1 }),
    db.collection("reading_logs").createIndex({ user_id: 1, date: 1 }),
    db.collection("reading_logs").createIndex({ book_id: 1 }),
  ]);
}

export async function getDb(): Promise<Db> {
  if (!cache.client) {
    cache.client = new MongoClient(uri).connect().catch((e) => {
      cache.client = undefined; // allow retry on next request
      throw e;
    });
  }
  const db = (await cache.client).db(dbName);
  if (!cache.indexes) {
    cache.indexes = ensureIndexes(db).catch((e) => {
      cache.indexes = undefined;
      throw e;
    });
  }
  await cache.indexes;
  return db;
}

export type CollectionName = "users" | "skills" | "notes" | "study_logs" | "books" | "reading_logs";

export async function col<T extends object = Record<string, unknown>>(name: CollectionName): Promise<Collection<T & Record<string, unknown>>> {
  const db = await getDb();
  return db.collection(name) as unknown as Collection<T & Record<string, unknown>>;
}

/** Next auto-increment integer id for a collection (same behaviour as SQLite AUTOINCREMENT). */
export async function nextId(name: CollectionName): Promise<number> {
  const db = await getDb();
  const res = await db
    .collection<{ _id: string; seq: number }>("counters")
    .findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: "after" });
  return res!.seq;
}

/** Timestamp in the same "YYYY-MM-DD HH:MM:SS" (UTC) format SQLite's datetime('now') produced. */
export function nowStr(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export type User = {
  id: number;
  name: string;
  email: string;
  daily_goal_pages: number;
  daily_goal_minutes: number;
};

export type Skill = {
  id: number;
  title: string;
  description: string;
  color: string;
  target_hours: number;
  status: string;
  created_at: string;
  minutes: number;
  note_count: number;
};

export type Note = {
  id: number;
  skill_id: number | null;
  skill_title: string | null;
  title: string;
  content: string;
  tags: string;
  pinned: number;
  created_at: string;
  updated_at: string;
  /** Name of the user who wrote the note (notes are visible to all users, editable only by the author). */
  author_name: string;
  /** True when the logged-in user wrote this note. */
  is_mine: boolean;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  total_pages: number;
  current_page: number;
  status: string;
  rating: number;
  created_at: string;
};

export type ReadingLog = {
  id: number;
  book_id: number;
  book_title: string;
  date: string;
  pages: number;
  minutes: number;
};
