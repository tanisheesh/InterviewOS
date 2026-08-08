import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AttemptWithDetails } from "@/lib/types";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("attempts")
    .select(`*, questions (*), evaluations (*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) console.error("Dashboard fetch error:", error);

  const attempts = ((data ?? []) as unknown[])
    .map((row) => {
      const r = row as {
        id: string;
        user_id: string;
        question_id: string;
        answer_text: string;
        input_mode: "text" | "voice";
        created_at: string;
        questions: AttemptWithDetails["question"];
        evaluations: AttemptWithDetails["evaluation"][] | AttemptWithDetails["evaluation"] | null;
      };
      const evaluation = Array.isArray(r.evaluations) ? r.evaluations[0] : r.evaluations;
      return { ...r, question: r.questions, evaluation };
    })
    .filter((a) => a.evaluation != null) as AttemptWithDetails[];

  return <DashboardClient attempts={attempts} />;
}
