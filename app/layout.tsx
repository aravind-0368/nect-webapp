import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nect",
  description: "A life gamification command center for habits, money, learning, and tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
