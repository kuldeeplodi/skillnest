import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getUser } from "@/lib/session";

export const metadata = { title: "Sign up — SkillNest" };

export default async function SignupPage() {
  // Only skip the form if the user really exists in the database
  if (await getUser()) redirect("/dashboard");
  return <AuthForm mode="signup" />;
}
