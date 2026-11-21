import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillNest — learn, take notes, read daily",
  description: "A personal learning space: skill tracking, markdown notes, daily reading streaks and a focus timer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
