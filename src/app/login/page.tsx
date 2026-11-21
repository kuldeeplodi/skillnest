import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getUser } from "@/lib/session";

export const metadata = { title: "Log in — SkillNest" };

export default async function LoginPage() {
  // Only skip the form if the user really exists in the database
  if (await getUser()) redirect("/dashboard");
  return <AuthForm mode="login" />;
}
