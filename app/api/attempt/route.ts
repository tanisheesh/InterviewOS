import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const bodySchema = z.object({
  question_id: z.string().uuid(),
  answer_text: z.string().min(1).max(2000),
  input_mode: z.enum(["text", "voice"]),
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
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { question_id, answer_text, input_mode } = parsed.data;
    const supabase = createAdminClient();

    // Ensure a users row exists for this Clerk user (idempotent)
    await supabase
      .from("users")
      .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true });

    const { data: question, error: qError } = await supabase
      .from("questions")
      .select("id")
      .eq("id", question_id)
      .single();

    if (qError || !question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const { data: attempt, error: aError } = await supabase
      .from("attempts")
      .insert({ user_id: userId, question_id, answer_text, input_mode })
      .select("id")
      .single();

    if (aError || !attempt) {
      console.error("Attempt insert error:", aError);
      return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
    }

    return NextResponse.json({ attempt_id: attempt.id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/attempt error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
