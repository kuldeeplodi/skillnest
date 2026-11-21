"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { col, nextId, nowStr } from "./db";
import { createSession, destroySession } from "./session";

export type AuthState = { error?: string } | undefined;

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Please enter your name." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const users = await col("users");
  const exists = await users.findOne({ email }, { projection: { id: 1 } });
  if (exists) return { error: "An account with this email already exists." };

  const hash = await bcrypt.hash(password, 12);
  const userId = await nextId("users");
  try {
    await users.insertOne({
      id: userId,
      name,
      email,
      password_hash: hash,
      daily_goal_pages: 20,
      daily_goal_minutes: 60,
      created_at: nowStr(),
    });
  } catch (e) {
    // unique index on email (two signups racing)
    if ((e as { code?: number }).code === 11000) return { error: "An account with this email already exists." };
    throw e;
  }

  // Starter content so the new account doesn't feel empty
  const skillId = await nextId("skills");
  const skills = await col("skills");
  await skills.insertOne({
    id: skillId,
    user_id: userId,
    title: "Getting started",
    description: "Your first skill. Edit or delete it any time.",
    color: "violet",
    target_hours: 10,
    status: "learning",
    created_at: nowStr(),
  });
  const notes = await col("notes");
  const ts = nowStr();
  await notes.insertOne({
    id: await nextId("notes"),
    user_id: userId,
    skill_id: skillId,
    title: "Welcome to SkillNest",
    content:
      "## Your learning space\n\n- Write notes in **Markdown**\n- Link notes to a skill\n- Log reading and study time daily to build a streak\n\n> Small steps every day beat big steps once in a while.",
    tags: "welcome,tips",
    pinned: 1,
    created_at: ts,
    updated_at: ts,
  });

  await createSession(userId);
  redirect("/dashboard");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const users = await col("users");
  const row = (await users.findOne({ email }, { projection: { id: 1, password_hash: 1 } })) as unknown as
    | { id: number; password_hash: string }
    | null;

  // Same message for unknown email and wrong password
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    return { error: "Incorrect email or password." };
  }

  await createSession(row.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
