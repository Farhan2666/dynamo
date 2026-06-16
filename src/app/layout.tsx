import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dynamo — AI-Crafted Pages That Feel Human",
  description:
    "First landing page generator that researches your market before designing. Multi-agent AI with human-like design principles.",
  keywords: [
    "landing page generator",
    "AI landing page",
    "context-aware design",
    "multi-agent AI",
  ],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scrollbar-thin">
      <body className="min-h-screen bg-surface text-text-primary">
        {children}
      </body>
    </html>
  );
}
