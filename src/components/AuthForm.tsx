"use client";
import { useActionState } from "react";
import Link from "next/link";
import { login, signup, type AuthState } from "@/lib/auth-actions";
import DotGrid from "./reactbits/DotGrid";
import { Logo } from "./Sidebar";
import { Button, Input, Label } from "./ui/form";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, undefined);
  const isLogin = mode === "login";

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <DotGrid />
      <div className="animate-fade-up relative z-10 w-full max-w-[400px]">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>

        <div className="surface-raised rounded-2xl p-8">
          <h1 className="text-xl font-semibold tracking-tight text-white">{isLogin ? "Log in to SkillNest" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isLogin ? "Pick up where you left off." : "Your notes and logs stay private to you."}
          </p>

          <form action={action} className="mt-6 space-y-4">
            {!isLogin && (
              <label className="block">
                <Label>Name</Label>
                <Input name="name" required minLength={2} autoComplete="name" placeholder="Your name" />
              </label>
            )}
            <label className="block">
              <Label>Email</Label>
              <Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
            </label>
            <label className="block">
              <Label>Password</Label>
              <Input
                name="password"
                type="password"
                required
                minLength={isLogin ? undefined : 8}
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder={isLogin ? "Your password" : "At least 8 characters"}
              />
            </label>

            {state?.error && (
              <p role="alert" className="rounded-lg border border-rose-400/20 bg-rose-400/[0.07] px-3 py-2 text-sm text-rose-300">
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Please wait…" : isLogin ? "Log in" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          {isLogin ? "New here? " : "Already have an account? "}
          <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-zinc-200 underline decoration-white/20 underline-offset-4 hover:decoration-accent">
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </p>
      </div>
    </main>
  );
}
