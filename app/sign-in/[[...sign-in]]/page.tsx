"use client";

import { useState } from "react";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isLoading = fetchStatus === "fetching";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn || isLoading) return;

    setError("");

    const { error: signInError } = await signIn.create({
      identifier: email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setError(finalizeError.message);
        return;
      }
      router.push("/select-role");
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#060606]">
      <header className="border-b-2 border-[#1A1A1A] px-6 h-12 flex items-center shrink-0">
        <Link href="/" className="font-black text-sm tracking-tight uppercase">
          Interview<span className="text-brand-500">OS</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="border-2 border-[#1E1E1E]">
            <div className="border-b-2 border-[#1E1E1E] px-6 py-5">
              <p className="label mb-1">Welcome back</p>
              <h1 className="text-2xl font-black tracking-tight">Sign in</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="border-2 border-red-500/30 bg-red-500/5 px-3 py-2">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wide text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !signIn}
                className="btn-primary w-full py-3 mt-2"
              >
                {isLoading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            <div className="border-t-2 border-[#1A1A1A] px-6 py-4">
              <p className="text-[0.7rem] font-bold uppercase tracking-wide text-[#444]">
                No account?{" "}
                <Link href="/sign-up" className="text-brand-500 hover:underline">
                  Sign up free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
