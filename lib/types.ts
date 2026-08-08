// ─── Domain types ────────────────────────────────────────────────────────────

export type Role = "sde" | "pm" | "data";
export type InputMode = "text" | "voice";
export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  role: Role;
  category: string;
  difficulty: Difficulty;
  prompt_text: string;
  expected_concepts: string[];
  created_at: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  question_id: string;
  answer_text: string;
  input_mode: InputMode;
  created_at: string;
  question?: Question;
  evaluation?: Evaluation;
}

export interface Evaluation {
  id: string;
  attempt_id: string;
  correctness_score: number;
  clarity_score: number;
  edge_case_score: number;
  justification: {
    correctness: string;
    clarity: string;
    edge_cases: string;
  };
  overall_summary: string;
  created_at: string;
}

// ─── AI evaluation response schema ───────────────────────────────────────────

export interface AIEvaluation {
  correctness: { score: number; notes: string };
  clarity: { score: number; notes: string };
  edge_cases: { score: number; notes: string };
  overall_summary: string;
}

// ─── API request / response shapes ───────────────────────────────────────────

export interface CreateAttemptRequest {
  question_id: string;
  answer_text: string;
  input_mode: InputMode;
}

export interface CreateAttemptResponse {
  attempt_id: string;
}

export interface EvaluateRequest {
  attempt_id: string;
}

export interface EvaluateResponse {
  evaluation: Evaluation;
}

// ─── Dashboard helpers ────────────────────────────────────────────────────────

export interface AttemptWithDetails extends Attempt {
  question: Question;
  evaluation: Evaluation;
}

export interface TrendPoint {
  date: string;
  correctness: number;
  clarity: number;
  edge_cases: number;
  attempt_id: string;
}
