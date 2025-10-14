import "@/styles/neon.css";
import type { Metadata } from "next";
import AudioController from "@/components/AudioController";

export const metadata: Metadata = {
  title: "Brain Heist",
  description: "Neon hacker vibes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-grid" suppressHydrationWarning>
        {children}
        <AudioController />
      </body>
    </html>
  );
}