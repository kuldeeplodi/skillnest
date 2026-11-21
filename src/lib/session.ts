import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { col, type User } from "./db";

export const COOKIE_NAME = "skillnest_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const uid = Number(payload.uid);
    if (!uid) return null;
    const users = await col("users");
    const user = (await users.findOne(
      { id: uid },
      { projection: { _id: 0, id: 1, name: 1, email: 1, daily_goal_pages: 1, daily_goal_minutes: 1 } }
    )) as unknown as User | null;
    return user ?? null;
  } catch {
    return null;
  }
}

/** Use in server components / actions: returns the user or redirects to /login. */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
