import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role, Question } from "@/lib/types";
import InterviewSession from "./InterviewSession";

interface PageProps {
  params: Promise<{ role: string }>;
}

const validRoles: Role[] = ["sde", "pm", "data"];

export default async function InterviewPage({ params }: PageProps) {
  const { role } = await params;
  if (!validRoles.includes(role as Role)) redirect("/select-role");

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const supabase = createAdminClient();

  // Exclude questions already attempted for this role
  const { data: attempted } = await supabase
    .from("attempts")
    .select("question_id, questions!inner(role)")
    .eq("user_id", userId)
    .eq("questions.role", role as Role);

  const attemptedIds = (attempted ?? []).map(
    (a: { question_id: string }) => a.question_id
  );

  let query = supabase
    .from("questions")
    .select("*")
    .eq("role", role as Role);

  if (attemptedIds.length > 0) {
    query = query.not("id", "in", attemptedIds);
  }

  const { data: questions } = await query;

  let question: Question | null = null;

  if (questions && questions.length > 0) {
    question = questions[Math.floor(Math.random() * questions.length)] as Question;
  } else {
    // All questions attempted — pick any random one to allow more practice
    const { data: allQ } = await supabase
      .from("questions")
      .select("*")
      .eq("role", role as Role);
    if (allQ && allQ.length > 0) {
      question = allQ[Math.floor(Math.random() * allQ.length)] as Question;
    }
  }

  if (!question) {
    return (
      <div className="flex flex-col items-start gap-4 py-16">
        <p className="text-[#666] text-sm uppercase tracking-wider font-bold">No questions available</p>
        <p className="text-[#444] text-sm">No questions found for this role yet.</p>
        <a href="/select-role" className="btn-secondary">← Back to roles</a>
      </div>
    );
  }

  // key={question.id} forces React to fully unmount/remount InterviewSession
  // when the server picks a new question, clearing all client state
  return <InterviewSession key={question.id} question={question} role={role as Role} />;
}
