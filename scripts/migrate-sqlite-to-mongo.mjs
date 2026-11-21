// One-time import of the old SQLite data (data/skillnest.db) into MongoDB.
// Usage:
//   npm install --no-save better-sqlite3
//   MONGODB_URI="mongodb://127.0.0.1:27017" MONGODB_DB=skillnest node scripts/migrate-sqlite-to-mongo.mjs
// IDs are preserved, so existing sessions and links keep working. Safe to re-run (upserts by id).
import Database from "better-sqlite3";
import { MongoClient } from "mongodb";

const sqlite = new Database("data/skillnest.db", { readonly: true });
const client = await new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017").connect();
const db = client.db(process.env.MONGODB_DB || "skillnest");

for (const name of ["users", "skills", "notes", "study_logs", "books", "reading_logs"]) {
  const rows = sqlite.prepare(`SELECT * FROM ${name}`).all();
  if (rows.length) {
    await db.collection(name).bulkWrite(
      rows.map((r) => ({ replaceOne: { filter: { id: r.id }, replacement: r, upsert: true } }))
    );
  }
  const max = rows.reduce((m, r) => Math.max(m, r.id), 0);
  await db.collection("counters").updateOne({ _id: name }, { $set: { seq: max } }, { upsert: true });
  console.log(`${name}: ${rows.length} migrated`);
}
await client.close();
