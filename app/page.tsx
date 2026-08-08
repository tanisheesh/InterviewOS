import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/select-role");

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav bar */}
      <header className="border-b-2 border-[#1A1A1A] px-6 h-12 flex items-center justify-between">
        <span className="font-black text-sm tracking-tight uppercase">
          Interview<span className="text-brand-500">OS</span>
        </span>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="btn-ghost">Sign in</Link>
          <Link href="/sign-up" className="btn-primary">Get started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-start justify-center px-6 py-24 max-w-4xl mx-auto w-full">
        <p className="label mb-6">AI-powered interview practice — free, no fluff</p>

        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-none mb-8">
          CRACK<br />
          YOUR<br />
          <span className="text-brand-500">INTERVIEW.</span>
        </h1>

        <p className="text-base text-[#777] max-w-md leading-relaxed mb-12">
          Answer real interview questions. Get structured AI feedback on correctness,
          clarity, and edge-case handling. Watch your scores improve over time.
        </p>

        <div className="flex items-center gap-3 flex-wrap mb-16">
          <Link href="/sign-up" className="btn-primary text-sm px-8 py-3">
            Start for free →
          </Link>
          <Link href="/sign-in" className="btn-secondary text-sm px-8 py-3">
            Sign in
          </Link>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 w-full border-2 border-[#1E1E1E]">
          {[
            {
              label: "SDE",
              title: "Software Engineer",
              items: ["Data Structures & Algo", "System Design", "CS Fundamentals", "OOP & Patterns"],
            },
            {
              label: "PM",
              title: "Product Manager",
              items: ["Product Sense", "Prioritization", "Metrics & Analytics", "Estimation"],
            },
            {
              label: "Data",
              title: "Data / ML",
              items: ["SQL & Databases", "Statistics", "ML Concepts", "Case Analysis"],
            },
          ].map((role, i) => (
            <div
              key={role.label}
              className={`p-6 ${i < 2 ? "border-b-2 sm:border-b-0 sm:border-r-2 border-[#1E1E1E]" : ""}`}
            >
              <div className="badge text-brand-500 border-brand-500/40 mb-4">
                {role.label}
              </div>
              <h3 className="font-black text-sm uppercase tracking-wide text-[#DDDDDD] mb-4">
                {role.title}
              </h3>
              <ul className="space-y-1.5">
                {role.items.map((item) => (
                  <li key={item} className="text-xs text-[#555] flex items-center gap-2">
                    <span className="text-brand-500 font-bold">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
