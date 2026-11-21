# SkillNest

A personal learning space built with **Next.js 15 (App Router)**, **Tailwind CSS v4** and **React Bits-style animated components**.

## Features

- **Login / signup** with hashed passwords (bcrypt) and signed, httpOnly session cookies (JWT)
- **Per-user data**: skills, reading, focus logs and goals are private. **Notes are shared**: every user can read all notes and sees who wrote them, but only the author can edit, delete or pin a note
- **Skills**: goals in hours, colour tags, status, manual time logging, progress bars
- **Notes**: Markdown with preview, tags, pin, search, filter by skill or tag
- **Note reader** (`/notes/[id]`): distraction-free reading page with library sidebar, table of contents, reading progress, adjustable text size and previous/next. Any logged-in user can read any note; only the author sees Edit.
- **Daily reading tracker**: books (want / reading / finished), page + minute logs, ratings
- **Dashboard**: streak, totals with count-up, daily goal rings, 17-week activity heatmap, weekly chart, quote of the day, badges
- **Focus timer**: Pomodoro-style, logs time automatically to a skill
- **Settings**: change daily page and minute goals

## Run it

```bash
npm install
cp .env.example .env.local      # then set AUTH_SECRET to a long random string
npm run dev                     # http://localhost:3000
```

Data is stored in **MongoDB** (local server or MongoDB Atlas). Set `MONGODB_URI` and `MONGODB_DB` in `.env.local`.
Collections and indexes are created automatically on first use: `users`, `skills`, `notes`, `study_logs`, `books`, `reading_logs`, `counters`.
Passwords are stored only as bcrypt hashes. Each document keeps a numeric `id` (via the `counters` collection), so URLs like `/notes/12` work as before.

Coming from the old SQLite version? Run `scripts/migrate-sqlite-to-mongo.mjs` once (instructions at the top of the file).

## React Bits components

`src/components/reactbits/` holds components written in the same spirit as the components on reactbits.dev (copy-paste, no extra animation library): SpotlightCard, BlurText, CountUp, StarBorder and DotGrid.
To use the original versions, run the install command shown on any component page at reactbits.dev and swap the import.

## Project layout

```
src/app/(app)/*      logged-in pages (dashboard, skills, notes, reading, focus, settings)
src/app/login|signup auth pages
src/lib/db.ts        MongoDB connection, id counters + types
src/lib/actions.ts   server actions (all scoped by user_id)
src/lib/queries.ts   read queries, streaks, badges
src/middleware.ts    redirects logged-out users to /login
```

## Before deploying

- Set a strong `AUTH_SECRET`
- Use a hosted MongoDB (e.g. Atlas) and allow your server's IP; this now works on serverless hosts like Vercel too
- Add rate limiting on login and email verification / password reset if you open signups to the public

## Ideas for next steps

Flashcards with spaced repetition, weekly email summary, public profile / share a note, import books by ISBN, dark/light toggle, export notes to PDF.
