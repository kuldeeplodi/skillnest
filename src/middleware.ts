import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "skillnest_session";
const PROTECTED = ["/dashboard", "/notes", "/skills", "/reading", "/focus", "/settings"];

async function isValid(token?: string) {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me");
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const valid = await isValid(req.cookies.get(COOKIE_NAME)?.value);

  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/")) && !valid) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  // Note: /login and /signup are NOT redirected here. A token can be valid while its user no longer
  // exists in the database (stale cookie), which caused a /login <-> /dashboard loop. Those pages
  // check the real user in the database instead.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/notes/:path*", "/skills/:path*", "/reading/:path*", "/focus/:path*", "/settings/:path*"],
};
