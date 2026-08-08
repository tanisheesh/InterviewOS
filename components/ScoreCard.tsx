import type { Evaluation } from "@/lib/types";

interface ScoreCardProps {
  evaluation: Evaluation;
}

const dimensions = [
  {
    key: "correctness_score" as const,
    justificationKey: "correctness" as const,
    label: "Correctness",
    sub: "Technical accuracy & completeness",
  },
  {
    key: "clarity_score" as const,
    justificationKey: "clarity" as const,
    label: "Clarity",
    sub: "Communication & structure",
  },
  {
    key: "edge_case_score" as const,
    justificationKey: "edge_cases" as const,
    label: "Edge Cases",
    sub: "Tradeoffs, failure modes, depth",
  },
];

function scoreColor(score: number) {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-yellow-400";
  return "text-red-400";
}

function scoreLabel(score: number) {
  if (score >= 8) return "Strong";
  if (score >= 6) return "Good";
  if (score >= 4) return "Developing";
  return "Weak";
}

function ScoreBar({ score }: { score: number }) {
  const filled = Math.round(score);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 ${i < filled ? "bg-brand-500" : "bg-[#1E1E1E]"}`}
        />
      ))}
    </div>
  );
}

export default function ScoreCard({ evaluation }: ScoreCardProps) {
  const avg = Math.round(
    (evaluation.correctness_score +
      evaluation.clarity_score +
      evaluation.edge_case_score) /
      3
  );

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-6 border-b-2 border-[#1A1A1A]">
        <div className="flex-1">
          <p className="label">AI Evaluation</p>
          <p className="text-sm text-[#999] leading-relaxed mt-2">
            {evaluation.overall_summary}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className={`font-black text-5xl tabular-nums leading-none ${scoreColor(avg)}`}>
            {avg}
          </div>
          <p className="text-[0.6rem] font-bold tracking-widest uppercase text-[#555] mt-1">
            / 10 avg
          </p>
        </div>
      </div>

      {/* Dimension scores */}
      <div className="divide-y-2 divide-[#1A1A1A]">
        {dimensions.map((dim) => {
          const score = evaluation[dim.key];
          const notes = evaluation.justification[dim.justificationKey];
          return (
            <div key={dim.key} className="p-5 space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-[0.8rem] font-bold text-[#DDDDDD] uppercase tracking-wide">
                    {dim.label}
                  </span>
                  <span className="text-[0.65rem] text-[#555] ml-2 normal-case tracking-normal font-normal">
                    {dim.sub}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 shrink-0">
                  <span className={`font-black text-xl tabular-nums leading-none ${scoreColor(score)}`}>
                    {score}
                  </span>
                  <span className={`text-[0.6rem] font-bold tracking-wider uppercase ${scoreColor(score)}`}>
                    {scoreLabel(score)}
                  </span>
                </div>
              </div>
              <ScoreBar score={score} />
              {notes && (
                <p className="text-xs text-[#666] leading-relaxed">{notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
