"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AttemptWithDetails, Role, TrendPoint } from "@/lib/types";
import RoleBadge from "@/components/RoleBadge";

interface Props {
  attempts: AttemptWithDetails[];
}

const roleFilters: { id: Role | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sde", label: "SDE" },
  { id: "pm", label: "PM" },
  { id: "data", label: "Data" },
];

const difficultyStyles: Record<string, string> = {
  easy: "text-emerald-400 border-emerald-400/40",
  medium: "text-yellow-400 border-yellow-400/40",
  hard: "text-red-400 border-red-400/40",
};

function ScoreNum({ score }: { score: number }) {
  const color =
    score >= 7 ? "text-emerald-400" : score >= 5 ? "text-yellow-400" : "text-red-400";
  return <span className={`font-black tabular-nums ${color}`}>{score}</span>;
}

export default function DashboardClient({ attempts }: Props) {
  const [activeRole, setActiveRole] = useState<Role | "all">("all");

  const filtered =
    activeRole === "all"
      ? attempts
      : attempts.filter((a) => a.question.role === activeRole);

  const trendData: TrendPoint[] = [...filtered]
    .reverse()
    .map((a) => ({
      date: new Date(a.created_at).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      correctness: a.evaluation.correctness_score,
      clarity: a.evaluation.clarity_score,
      edge_cases: a.evaluation.edge_case_score,
      attempt_id: a.id,
    }));

  const totalAttempts = filtered.length;
  const avgCorrectness =
    totalAttempts > 0
      ? (filtered.reduce((s, a) => s + a.evaluation.correctness_score, 0) / totalAttempts).toFixed(1)
      : "—";
  const avgClarity =
    totalAttempts > 0
      ? (filtered.reduce((s, a) => s + a.evaluation.clarity_score, 0) / totalAttempts).toFixed(1)
      : "—";
  const avgEdge =
    totalAttempts > 0
      ? (filtered.reduce((s, a) => s + a.evaluation.edge_case_score, 0) / totalAttempts).toFixed(1)
      : "—";

  if (attempts.length === 0) {
    return (
      <div className="flex flex-col items-start gap-6 py-16 border-2 border-[#1E1E1E] p-10">
        <p className="label">No attempts yet</p>
        <h2 className="text-4xl font-black tracking-tighter">
          Nothing to show — yet.
        </h2>
        <p className="text-[#555] text-sm max-w-sm">
          Complete your first interview session to see scores and trend data here.
        </p>
        <Link href="/select-role" className="btn-primary">
          Start practicing →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="border-2 border-[#1E1E1E] p-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label mb-2">Performance overview</p>
          <h1 className="text-4xl font-black tracking-tighter">Dashboard</h1>
        </div>
        <Link href="/select-role" className="btn-primary mt-1">
          Practice now →
        </Link>
      </div>

      {/* Role filter */}
      <div className="border-x-2 border-b-2 border-[#1E1E1E] px-4 py-3 flex items-center gap-0">
        {roleFilters.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveRole(r.id)}
            className={`px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider border-r-2 border-[#1E1E1E] last:border-r-0 transition-colors ${
              activeRole === r.id
                ? "bg-brand-500 text-black"
                : "text-[#555] hover:text-[#AAA]"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-x-2 border-b-2 border-[#1E1E1E]">
        {[
          { label: "Attempts", value: totalAttempts, unit: "" },
          { label: "Correctness", value: avgCorrectness, unit: "avg" },
          { label: "Clarity", value: avgClarity, unit: "avg" },
          { label: "Edge Cases", value: avgEdge, unit: "avg" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`p-5 ${i < 3 ? `border-r-2 border-[#1E1E1E]${i === 1 ? " max-sm:border-r-0" : ""}` : ""} ${i >= 2 ? "border-t-2 sm:border-t-0 border-[#1E1E1E]" : ""}`}
          >
            <p className="label mb-1">{stat.label}</p>
            <p className="text-3xl font-black tabular-nums text-[#EEEEEE]">
              {stat.value}
              {stat.unit && (
                <span className="text-xs text-[#444] font-bold ml-1">{stat.unit}</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      {trendData.length >= 2 && (
        <div className="border-x-2 border-b-2 border-[#1E1E1E] p-6">
          <p className="label mb-6">Score trend</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="0" stroke="#141414" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 5, 10]}
                tick={{ fill: "#444", fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0A0A",
                  border: "2px solid #1E1E1E",
                  borderRadius: 0,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
                labelStyle={{ color: "#666" }}
                itemStyle={{ color: "#AAA" }}
              />
              <Line
                type="linear"
                dataKey="correctness"
                name="Correctness"
                stroke="#38BDF8"
                strokeWidth={2}
                dot={{ r: 3, fill: "#38BDF8", strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="linear"
                dataKey="clarity"
                name="Clarity"
                stroke="#A78BFA"
                strokeWidth={2}
                dot={{ r: 3, fill: "#A78BFA", strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="linear"
                dataKey="edge_cases"
                name="Edge Cases"
                stroke="#BCFF5E"
                strokeWidth={2}
                dot={{ r: 3, fill: "#BCFF5E", strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-4">
            {[
              { color: "#38BDF8", label: "Correctness" },
              { color: "#A78BFA", label: "Clarity" },
              { color: "#BCFF5E", label: "Edge Cases" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: l.color }} />
                <span className="text-[0.6rem] font-bold uppercase tracking-widest text-[#555]">
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {trendData.length === 1 && (
        <div className="border-x-2 border-b-2 border-[#1E1E1E] p-5 text-[0.7rem] font-bold uppercase tracking-wider text-[#333]">
          Complete 2+ sessions to see your score trend.
        </div>
      )}

      {/* Attempt history */}
      <div className="border-x-2 border-b-2 border-[#1E1E1E]">
        <div className="border-b-2 border-[#1E1E1E] px-6 py-3">
          <p className="label mb-0">
            History{" "}
            <span className="text-[#333] normal-case tracking-normal font-normal">
              ({filtered.length})
            </span>
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[0.7rem] font-bold uppercase tracking-wider text-[#333]">
              No attempts for this role yet.{" "}
              <Link
                href={activeRole === "all" ? "/select-role" : `/interview/${activeRole}`}
                className="text-brand-500 hover:underline"
              >
                Start one →
              </Link>
            </p>
          </div>
        ) : (
          filtered.map((attempt, i) => (
            <div
              key={attempt.id}
              className={`p-5 ${i < filtered.length - 1 ? "border-b-2 border-[#1A1A1A]" : ""}`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <RoleBadge role={attempt.question.role} />
                    <span className={`badge ${difficultyStyles[attempt.question.difficulty]}`}>
                      {attempt.question.difficulty}
                    </span>
                    <span className="badge text-[#444] border-[#222]">
                      {attempt.question.category}
                    </span>
                    <span className="text-[0.6rem] font-bold tracking-wider uppercase text-[#333]">
                      {new Date(attempt.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-[#888] leading-snug">
                    {attempt.question.prompt_text}
                  </p>
                </div>

                {/* Score summary */}
                <div className="flex items-center gap-0 border-2 border-[#1E1E1E] shrink-0">
                  {[
                    { score: attempt.evaluation.correctness_score, label: "Corr" },
                    { score: attempt.evaluation.clarity_score, label: "Clar" },
                    { score: attempt.evaluation.edge_case_score, label: "Edge" },
                  ].map((s, si) => (
                    <div
                      key={s.label}
                      className={`px-3 py-2 text-center border-r-2 border-[#1E1E1E]`}
                    >
                      <ScoreNum score={s.score} />
                      <p className="text-[0.55rem] font-bold tracking-widest uppercase text-[#333] mt-0.5">
                        {s.label}
                      </p>
                    </div>
                  ))}
                  <div className="px-3 py-2 text-center bg-[#0F0F0F]">
                    <ScoreNum
                      score={Math.round(
                        (attempt.evaluation.correctness_score +
                          attempt.evaluation.clarity_score +
                          attempt.evaluation.edge_case_score) / 3
                      )}
                    />
                    <p className="text-[0.55rem] font-bold tracking-widest uppercase text-brand-500 mt-0.5">
                      Avg
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[0.7rem] text-[#444] mt-3 pt-3 border-t-2 border-[#111] leading-relaxed">
                {attempt.evaluation.overall_summary}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
