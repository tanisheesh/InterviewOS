"use client";

import { useState } from "react";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

type Step = "details" | "verify";

export default function SignUpPage() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const isLoading = fetchStatus === "fetching";

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!signUp || isLoading) return;

    setError("");

    const { error: signUpError } = await signUp.create({
      emailAddress: email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (signUp.status === "complete") {
      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) { setError(finalizeError.message); return; }
      router.push("/select-role");
    } else {
      // Email verification required
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) { setError(sendError.message); return; }
      setStep("verify");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!signUp || isLoading) return;

    setError("");

    const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    if (signUp.status === "complete") {
      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) { setError(finalizeError.message); return; }
      router.push("/select-role");
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#060606]">
      <header className="border-b-2 border-[#1A1A1A] px-6 h-12 flex items-center">
        <Link href="/" className="font-black text-sm tracking-tight uppercase">
          Interview<span className="text-brand-500">OS</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="border-2 border-[#1E1E1E]">
            {step === "details" ? (
              <>
                <div className="border-b-2 border-[#1E1E1E] px-6 py-5">
                  <p className="label mb-1">Free — no credit card</p>
                  <h1 className="text-2xl font-black tracking-tight">Create account</h1>
                </div>

                <form onSubmit={handleSignUp} className="p-6 space-y-4">
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
                      placeholder="8+ characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
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
                    disabled={isLoading || !signUp}
                    className="btn-primary w-full py-3 mt-2"
                  >
                    {isLoading ? "Creating account…" : "Create account →"}
                  </button>
                </form>

                <div className="border-t-2 border-[#1A1A1A] px-6 py-4">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wide text-[#444]">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-brand-500 hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="border-b-2 border-[#1E1E1E] px-6 py-5">
                  <p className="label mb-1">One more step</p>
                  <h1 className="text-2xl font-black tracking-tight">Verify email</h1>
                  <p className="text-xs text-[#555] mt-2 font-normal normal-case tracking-normal">
                    We sent a 6-digit code to{" "}
                    <span className="text-[#888] font-bold">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerify} className="p-6 space-y-4">
                  <div>
                    <label className="label" htmlFor="code">Verification code</label>
                    <input
                      id="code"
                      type="text"
                      className="input text-center tracking-[0.3em] text-xl font-black"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      maxLength={6}
                      autoComplete="one-time-code"
                      inputMode="numeric"
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
                    disabled={isLoading || !signUp || code.length < 6}
                    className="btn-primary w-full py-3"
                  >
                    {isLoading ? "Verifying…" : "Verify & enter →"}
                  </button>
                </form>

                <div className="border-t-2 border-[#1A1A1A] px-6 py-4">
                  <button
                    onClick={() => { setStep("details"); setError(""); setCode(""); }}
                    className="text-[0.7rem] font-bold uppercase tracking-wide text-[#444] hover:text-[#888] transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
