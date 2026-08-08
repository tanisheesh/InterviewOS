import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "InterviewOS — AI Mock Interview Practice",
  description:
    "Pick a role, answer real interview questions, and get structured AI feedback on correctness, clarity, and edge-case handling.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={`dark ${inter.className}`}>
        <body className="min-h-screen">{children}</body>
      </html>
    </ClerkProvider>
  );
}
