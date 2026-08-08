import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateAnswer } from "@/lib/groq";
import { z } from "zod";
import type { Role } from "@/lib/types";

const bodySchema = z.object({
  attempt_id: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { attempt_id } = parsed.data;
    const supabase = createAdminClient();

    // Fetch attempt + question, verify ownership
    const { data: attempt, error: aError } = await supabase
      .from("attempts")
      .select("*, questions(*)")
      .eq("id", attempt_id)
      .eq("user_id", userId)
      .single();

    if (aError || !attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Return existing evaluation if already scored
    const { data: existing } = await supabase
      .from("evaluations")
      .select("*")
      .eq("attempt_id", attempt_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ evaluation: existing });
    }

    const question = attempt.questions as { role: Role; prompt_text: string };

    let claudeResult;
    try {
      claudeResult = await evaluateAnswer(
        question.role,
        question.prompt_text,
        attempt.answer_text
      );
    } catch {
      return NextResponse.json(
        { error: "AI evaluation failed. Your answer was saved — please try again." },
        { status: 503 }
      );
    }

    const { data: evaluation, error: eError } = await supabase
      .from("evaluations")
      .insert({
        attempt_id,
        correctness_score: claudeResult.correctness.score,
        clarity_score: claudeResult.clarity.score,
        edge_case_score: claudeResult.edge_cases.score,
        justification: {
          correctness: claudeResult.correctness.notes,
          clarity: claudeResult.clarity.notes,
          edge_cases: claudeResult.edge_cases.notes,
        },
        overall_summary: claudeResult.overall_summary,
      })
      .select("*")
      .single();

    if (eError) {
      // Unique constraint violation (23505) = concurrent request already inserted
      if (eError.code === "23505") {
        const { data: concurrent } = await supabase
          .from("evaluations")
          .select("*")
          .eq("attempt_id", attempt_id)
          .single();
        if (concurrent) return NextResponse.json({ evaluation: concurrent });
      }
      console.error("Evaluation insert error:", eError);
      return NextResponse.json({ error: "Failed to save evaluation" }, { status: 500 });
    }

    return NextResponse.json({ evaluation }, { status: 201 });
  } catch (err) {
    console.error("POST /api/evaluate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
