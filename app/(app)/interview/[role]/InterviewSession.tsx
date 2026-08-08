"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import type { Role, Question, Evaluation } from "@/lib/types";
import ScoreCard from "@/components/ScoreCard";
import RoleBadge from "@/components/RoleBadge";
import Spinner from "@/components/Spinner";
import { createClient } from "@/lib/supabase/client";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
}
interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface Props {
  question: Question;
  role: Role;
}

type Status = "answering" | "submitting" | "evaluating" | "scored" | "error";

const difficultyStyles: Record<string, string> = {
  easy: "text-emerald-400 border-emerald-400/40",
  medium: "text-yellow-400 border-yellow-400/40",
  hard: "text-red-400 border-red-400/40",
};

const answerGuidance: Record<Role, string> = {
  sde: "Walk through your approach step by step. Name the data structures you'd use. State time and space complexity. Cover at least one edge case.",
  pm: "Structure: context → problem → solution → success metrics. Address tradeoffs. Consider what could go wrong.",
  data: "State your assumptions upfront. Explain your reasoning. Validate conclusions with numbers or examples where possible.",
};

const MIN_CHARS = 80;
const MAX_CHARS = 2000;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function InterviewSession({ question, role }: Props) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<Status>("answering");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const scoredRef = useRef(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setVoiceSupported(supported);
  }, []);

  useEffect(() => {
    if (!attemptId) return;

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let active = true;

    // Authenticate the Realtime connection with the user's Clerk JWT so the
    // tightened RLS policy (auth.jwt() ->> 'sub' = user_id) is satisfied.
    getToken({ template: "supabase" }).then((token) => {
      if (!active) return;
      if (token) supabase.realtime.setAuth(token);

      channel = supabase
        .channel(`attempt-${attemptId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "evaluations",
            filter: `attempt_id=eq.${attemptId}`,
          },
          (payload: { new: Evaluation }) => {
            if (scoredRef.current) return;
            scoredRef.current = true;
            setEvaluation(payload.new);
            setStatus("scored");
          }
        )
        .subscribe();
    });

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [attemptId, getToken]);

  const startVoice = useCallback(() => {
    const win = window as Window &
      typeof globalThis & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
    const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = answer;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + " ";
        } else {
          interim = t;
        }
      }
      setAnswer((finalTranscript + interim).slice(0, MAX_CHARS));
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: Event & { error?: string }) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        setErrorMsg("Microphone access denied — allow it in browser settings and try again.");
        setStatus("error");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setInputMode("voice");
  }, [answer]);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  async function handleSubmit() {
    if (!answer.trim()) return;
    if (isListening) stopVoice();

    setStatus("submitting");
    setErrorMsg("");
    scoredRef.current = false;

    try {
      let resolvedAttemptId = attemptId;

      if (!resolvedAttemptId) {
        const attemptRes = await fetch("/api/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_id: question.id,
            answer_text: answer.trim().slice(0, MAX_CHARS),
            input_mode: inputMode,
          }),
        });

        if (!attemptRes.ok) throw new Error("Failed to save attempt");

        const { attempt_id } = await attemptRes.json();
        resolvedAttemptId = attempt_id;
        setAttemptId(attempt_id);
      }

      setStatus("evaluating");

      const evalRes = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempt_id: resolvedAttemptId }),
      });

      if (!evalRes.ok) throw new Error("Evaluation failed");

      const { evaluation: evalData } = await evalRes.json();
      if (!scoredRef.current) {
        scoredRef.current = true;
        setEvaluation(evalData);
        setStatus("scored");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  // Navigate to a new question — timestamp busts Next.js router cache,
  // forcing the server component to re-run and pick a fresh random question.
  function goToNextQuestion() {
    router.push(`/interview/${role}?r=${Date.now()}`);
  }

  const words = wordCount(answer);
  const charsLeft = MAX_CHARS - answer.length;
  const canSubmit = answer.trim().length >= MIN_CHARS && (status === "answering" || status === "error");
  const isAnswering = status === "answering" || status === "error";

  return (
    <div className="max-w-3xl mx-auto space-y-0">
      {/* Question header */}
      <div className="border-2 border-[#1E1E1E] p-5">
        <div className="flex items-center gap-2 flex-wrap mb-0">
          <RoleBadge role={role} />
          <span className={`badge ${difficultyStyles[question.difficulty]}`}>
            {question.difficulty}
          </span>
          <span className="badge text-[#555] border-[#333]">
            {question.category}
          </span>
          <button
            onClick={goToNextQuestion}
            className="btn-ghost ml-auto text-[0.65rem]"
          >
            Skip →
          </button>
        </div>
      </div>

      {/* Question body */}
      <div className="border-x-2 border-b-2 border-[#1E1E1E] p-6">
        <p className="label mb-4">Question</p>
        <p className="text-lg font-semibold text-[#EEEEEE] leading-snug">
          {question.prompt_text}
        </p>

        {question.expected_concepts.length > 0 && (
          <div className="mt-5 pt-4 border-t-2 border-[#1A1A1A]">
            <p className="label mb-2">Expected concepts</p>
            <div className="flex flex-wrap gap-1.5">
              {question.expected_concepts.map((concept) => (
                <span
                  key={concept}
                  className="text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 border border-[#2A2A2A] text-[#555]"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Answer guidance */}
      <div className="border-x-2 border-b-2 border-[#1E1E1E] px-6 py-3 bg-[#0A0A0A]">
        <p className="text-[0.7rem] text-[#555] leading-relaxed">
          <span className="text-brand-500 font-bold uppercase tracking-wider text-[0.6rem]">
            How to answer —{" "}
          </span>
          {answerGuidance[role]}
        </p>
      </div>

      {/* Answer area */}
      {isAnswering && (
        <div className="border-x-2 border-b-2 border-[#1E1E1E] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="label mb-0">Your answer</p>
            {voiceSupported && (
              <button
                onClick={isListening ? stopVoice : startVoice}
                aria-label={isListening ? "Stop recording" : "Start voice input"}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wide border-2 transition-colors ${
                  isListening
                    ? "border-red-500 text-red-400 bg-red-500/5 hover:bg-red-500/10"
                    : "border-[#222] text-[#666] hover:border-[#444] hover:text-[#AAA]"
                }`}
              >
                {isListening ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Stop
                  </>
                ) : (
                  <>
                    <MicIcon />
                    Speak
                  </>
                )}
              </button>
            )}
          </div>

          <textarea
            className="input min-h-[220px] leading-relaxed"
            placeholder="Type your full answer here. Be thorough — explain your reasoning, not just the conclusion."
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value.slice(0, MAX_CHARS));
              setInputMode("text");
            }}
            disabled={isListening}
            aria-label="Your answer"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[0.65rem] font-bold uppercase tracking-wide">
              <span className={words >= 15 ? "text-brand-500" : "text-[#444]"}>
                {words} {words === 1 ? "word" : "words"}
              </span>
              <span className={charsLeft < 200 ? "text-yellow-400" : "text-[#333]"}>
                {charsLeft} chars left
              </span>
            </div>
            {status === "error" && (
              <span className="text-[0.7rem] text-red-400 font-medium">{errorMsg}</span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-primary w-full py-3 text-sm"
          >
            Submit for AI evaluation →
          </button>

          {answer.trim().length > 0 && answer.trim().length < MIN_CHARS && (
            <p className="text-[0.65rem] text-[#444] text-center font-bold uppercase tracking-wide">
              Keep going — write at least {MIN_CHARS} characters ({MIN_CHARS - answer.trim().length} more)
            </p>
          )}
        </div>
      )}

      {/* Loading states */}
      {status === "submitting" && (
        <div className="border-x-2 border-b-2 border-[#1E1E1E] p-16 flex flex-col items-center gap-4 text-[#555]">
          <Spinner size={28} />
          <p className="text-[0.7rem] font-bold uppercase tracking-wider">Saving answer…</p>
        </div>
      )}

      {status === "evaluating" && (
        <div className="border-x-2 border-b-2 border-[#1E1E1E] p-16 flex flex-col items-center gap-4 text-[#555]">
          <Spinner size={28} />
          <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[#777]">
            AI is evaluating your answer
          </p>
          <p className="text-[0.65rem] text-[#333]">This takes 5–10 seconds</p>
        </div>
      )}

      {/* Results */}
      {status === "scored" && evaluation && (
        <>
          <div className="border-x-2 border-b-2 border-[#1E1E1E]">
            <ScoreCard evaluation={evaluation} />
          </div>

          {/* Your submitted answer */}
          <div className="border-x-2 border-b-2 border-[#1E1E1E] p-6">
            <p className="label mb-3">Your answer</p>
            <p className="text-sm text-[#888] leading-relaxed whitespace-pre-wrap">{answer}</p>
          </div>

          {/* Actions */}
          <div className="border-x-2 border-b-2 border-[#1E1E1E] p-4 flex gap-3">
            <button onClick={goToNextQuestion} className="btn-primary flex-1 py-3">
              Next question →
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-secondary px-6"
            >
              Dashboard
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
