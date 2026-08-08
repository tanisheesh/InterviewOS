import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/types";

const roles: {
  id: Role;
  label: string;
  title: string;
  categories: string[];
  accent: string;
}[] = [
  {
    id: "sde",
    label: "SDE",
    title: "Software Engineer",
    categories: ["Data Structures & Algorithms", "System Design", "CS Fundamentals", "OOP & Patterns"],
    accent: "text-sky-400 border-sky-400/40",
  },
  {
    id: "pm",
    label: "PM",
    title: "Product Manager",
    categories: ["Product Sense", "Prioritization", "Metrics & Analytics", "Estimation"],
    accent: "text-violet-400 border-violet-400/40",
  },
  {
    id: "data",
    label: "Data",
    title: "Data / ML",
    categories: ["SQL & Databases", "Statistics & Probability", "ML Concepts", "Case Analysis"],
    accent: "text-emerald-400 border-emerald-400/40",
  },
];

export default async function SelectRolePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await currentUser();
  const supabase = createAdminClient();

  const { data: counts } = await supabase
    .from("attempts")
    .select("question_id, questions!inner(role)")
    .eq("user_id", userId);

  const roleCounts: Record<Role, number> = { sde: 0, pm: 0, data: 0 };
  if (counts) {
    for (const row of counts as unknown as { questions: { role: Role } }[]) {
      const r = row.questions.role;
      if (r in roleCounts) roleCounts[r]++;
    }
  }

  const firstName =
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress?.split("@")[0] ??
    "there";

  const totalAttempts = Object.values(roleCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b-2 border-[#1A1A1A] pb-8">
        <p className="label mb-2">Welcome back</p>
        <h1 className="text-5xl font-black tracking-tighter">
          Hey, {firstName}.
        </h1>
        <p className="text-[#666] mt-3 text-sm">
          Pick a role and start practicing. You get a fresh question every session with structured AI feedback.
        </p>
      </div>

      {/* Role grid */}
      <div className="grid sm:grid-cols-3 gap-0 border-2 border-[#1E1E1E]">
        {roles.map((role, i) => (
          <Link
            key={role.id}
            href={`/interview/${role.id}`}
            className={`group block p-6 hover:bg-[#0F0F0F] transition-colors ${
              i < 2 ? "border-b-2 sm:border-b-0 sm:border-r-2 border-[#1E1E1E]" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <span className={`badge ${role.accent}`}>{role.label}</span>
              {roleCounts[role.id] > 0 && (
                <span className="text-[0.6rem] font-bold tracking-widest uppercase text-[#444]">
                  {roleCounts[role.id]} done
                </span>
              )}
            </div>

            <h2 className="font-black text-sm uppercase tracking-wide text-[#DDDDDD] mb-4 group-hover:text-brand-500 transition-colors">
              {role.title}
            </h2>

            <ul className="space-y-2 mb-6">
              {role.categories.map((cat) => (
                <li key={cat} className="text-xs text-[#555] flex items-center gap-2">
                  <span className="text-[#333] font-bold">—</span>
                  {cat}
                </li>
              ))}
            </ul>

            <div className="text-xs font-bold tracking-wide uppercase text-brand-500 group-hover:translate-x-1 transition-transform inline-block">
              Practice →
            </div>
          </Link>
        ))}
      </div>

      {/* Stats bar */}
      <div className="border-2 border-[#1E1E1E] p-5 flex items-center justify-between gap-4">
        <div>
          <p className="label mb-0.5">Your progress</p>
          <p className="text-2xl font-black tabular-nums">
            {totalAttempts}
            <span className="text-sm font-normal text-[#555] ml-1">
              total attempt{totalAttempts !== 1 ? "s" : ""}
            </span>
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary shrink-0">
          Dashboard →
        </Link>
      </div>
    </div>
  );
}
