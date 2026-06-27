"use client";

import { useState, useRef } from "react";

type Job = {
  id: string;
  company: string;
  title: string;
  location: string;
  deadline: string;
  url: string;
  category: "은행" | "증권사" | "대기업";
};

type AnalysisResult = {
  jobId: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
};

const CATEGORY_COLOR: Record<Job["category"], string> = {
  "은행": "rgba(6,182,212,0.15)",
  "증권사": "rgba(139,92,246,0.15)",
  "대기업": "rgba(251,146,60,0.15)",
};
const CATEGORY_BORDER: Record<Job["category"], string> = {
  "은행": "rgba(6,182,212,0.3)",
  "증권사": "rgba(139,92,246,0.3)",
  "대기업": "rgba(251,146,60,0.3)",
};
const CATEGORY_TEXT: Record<Job["category"], string> = {
  "은행": "#06b6d4",
  "증권사": "#a78bfa",
  "대기업": "#fb923c",
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "#4ade80" : score >= 50 ? "#facc15" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2a2a4a" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>{score}</span>
      </div>
      <div>
        <div className="text-xs font-medium" style={{ color }}>
          {score >= 70 ? "합격 가능성 높음" : score >= 50 ? "보완 필요" : "추가 준비 필요"}
        </div>
        <div className="text-xs" style={{ color: "#64748b" }}>서류 합격 예측</div>
      </div>
    </div>
  );
}

export default function JobWatch() {
  const [resumeText, setResumeText] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, AnalysisResult>>({});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<Job["category"] | "전체">("전체");
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/resume", { method: "POST", body: formData });
    const data = await res.json();
    if (data.text) setResumeText(data.text);
  }

  async function fetchJobs() {
    setLoading(true);
    setJobs([]);
    setAnalyses({});
    const res = await fetch(`/api/jobs?keyword=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setLoading(false);
  }

  async function analyzeJob(job: Job) {
    if (!resumeText) {
      alert("먼저 이력서를 업로드해주세요.");
      return;
    }
    setAnalyzing(job.id);
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobTitle: job.title, company: job.company }),
    });
    const data = await res.json();
    if (data.result) {
      setAnalyses(prev => ({ ...prev, [job.id]: { jobId: job.id, ...data.result } }));
    }
    setAnalyzing(null);
  }

  const filtered = filter === "전체" ? jobs : jobs.filter(j => j.category === filter);

  return (
    <main className="min-h-screen pt-24 pb-16 px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "#a78bfa" }}>// job watch</p>
          <h1 className="font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,5vw,2.6rem)" }}>채용 공고 분석</h1>
          <div className="w-12 h-0.5 rounded" style={{ background: "linear-gradient(90deg,#8b5cf6,#06b6d4)" }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel - Resume + Search */}
          <div className="space-y-6">
            {/* Resume upload */}
            <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <span>📄</span> 이력서 업로드
              </h2>
              <input ref={fileRef} type="file" accept=".docx,.pdf" className="hidden" onChange={uploadResume} />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.97]"
                style={{ border: "2px dashed rgba(139,92,246,0.4)", color: "#a78bfa", background: "rgba(139,92,246,0.06)" }}>
                {resumeName ? `✓ ${resumeName}` : "클릭하여 .docx 또는 PDF 업로드"}
              </button>
              {resumeText && (
                <p className="mt-3 text-xs font-mono" style={{ color: "#4ade80" }}>
                  ✓ 이력서 파싱 완료 ({resumeText.length.toLocaleString()}자)
                </p>
              )}
            </div>

            {/* Search */}
            <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <span>🔍</span> 공고 검색
              </h2>
              <input
                type="text"
                placeholder="예: 백엔드, Node.js, IT..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchJobs()}
                className="w-full px-4 py-2.5 rounded-lg text-sm mb-3 outline-none focus:ring-2 transition-all"
                style={{ background: "var(--surface)", border: "1px solid var(--card-border)", color: "var(--text)" }}
              />
              <button
                onClick={fetchJobs}
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}>
                {loading ? "검색 중..." : "공고 검색"}
              </button>
              <p className="mt-2 text-xs" style={{ color: "#64748b" }}>
                은행·증권사·삼성·현대·SK·LG 채용공고 자동 수집
              </p>
            </div>

            {/* Filter */}
            {jobs.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <h2 className="font-semibold mb-3">필터</h2>
                <div className="flex flex-wrap gap-2">
                  {(["전체", "은행", "증권사", "대기업"] as const).map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150"
                      style={{
                        background: filter === cat ? "rgba(139,92,246,0.25)" : "transparent",
                        border: `1px solid ${filter === cat ? "rgba(139,92,246,0.5)" : "var(--card-border)"}`,
                        color: filter === cat ? "#a78bfa" : "#94a3b8",
                      }}>
                      {cat} {cat === "전체" ? `(${jobs.length})` : `(${jobs.filter(j => j.category === cat).length})`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel - Job listings */}
          <div className="lg:col-span-2 space-y-4">
            {!jobs.length && !loading && (
              <div className="rounded-2xl p-12 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div className="text-4xl mb-4">🏢</div>
                <p className="font-medium mb-2">채용공고를 검색해보세요</p>
                <p className="text-sm" style={{ color: "#64748b" }}>이력서 업로드 후 분석하면 서류 합격 확률을 예측합니다</p>
              </div>
            )}

            {loading && (
              <div className="rounded-2xl p-12 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div className="text-4xl mb-4 animate-spin">⚙️</div>
                <p className="font-medium">채용공고 수집 중...</p>
              </div>
            )}

            {filtered.map(job => {
              const analysis = analyses[job.id];
              return (
                <div key={job.id} className="rounded-2xl p-6 transition-all duration-200"
                  style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md"
                          style={{ background: CATEGORY_COLOR[job.category], border: `1px solid ${CATEGORY_BORDER[job.category]}`, color: CATEGORY_TEXT[job.category] }}>
                          {job.category}
                        </span>
                        <span className="text-xs" style={{ color: "#64748b" }}>{job.deadline}</span>
                      </div>
                      <h3 className="font-semibold mb-1">{job.title}</h3>
                      <p className="text-sm" style={{ color: "#94a3b8" }}>{job.company} · {job.location}</p>
                    </div>
                    {analysis && <ScoreBadge score={analysis.score} />}
                  </div>

                  {analysis && (
                    <div className="mb-4 p-4 rounded-xl text-sm space-y-2" style={{ background: "var(--surface)" }}>
                      <div>
                        <span className="font-medium text-xs" style={{ color: "#4ade80" }}>✓ 강점 </span>
                        <span style={{ color: "#94a3b8" }}>{analysis.strengths.join(" · ")}</span>
                      </div>
                      <div>
                        <span className="font-medium text-xs" style={{ color: "#f87171" }}>✗ 보완점 </span>
                        <span style={{ color: "#94a3b8" }}>{analysis.weaknesses.join(" · ")}</span>
                      </div>
                      <div>
                        <span className="font-medium text-xs" style={{ color: "#a78bfa" }}>💡 </span>
                        <span style={{ color: "#94a3b8" }}>{analysis.recommendation}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <a href={job.url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-lg text-xs font-medium text-center transition-all duration-150 hover:scale-[1.01]"
                      style={{ border: "1px solid var(--card-border)", color: "#94a3b8" }}>
                      공고 보기 →
                    </a>
                    <button
                      onClick={() => analyzeJob(job)}
                      disabled={analyzing === job.id || !resumeText}
                      className="flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-150 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}>
                      {analyzing === job.id ? "분석 중..." : analysis ? "재분석" : "합격 확률 분석"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
