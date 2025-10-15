import "./globals.css";
import type { Metadata } from "next";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = { title: "Brain Heist" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-grid text-[var(--c-text)]">
        <header className="bh-header"><NavBar/></header>
        <main className="bh-main"><div className="bh-shell">{children}</div></main>
      </body>
    </html>
  );
}import '@fontsource/noto-color-emoji';
