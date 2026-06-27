"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CompanyCategory = "bank" | "securities" | "samsung" | "hyundai" | "sk" | "lg";

type RankedJob = {
  id: string;
  company: string;
  group: string;
  category: CompanyCategory;
  title: string;
  url: string;
  sourceUrl: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  scanStatus: "live" | "fallback";
};

type ScanResponse = {
  scannedAt: string;
  jobs: RankedJob[];
};

const CATEGORY_LABEL: Record<CompanyCategory | "all", string> = {
  all: "전체",
  bank: "은행",
  securities: "증권사",
  samsung: "삼성",
  hyundai: "현대",
  sk: "SK",
  lg: "LG",
};

const CATEGORY_STYLE: Record<CompanyCategory, { bg: string; border: string; text: string }> = {
  bank: { bg: "rgba(6,182,212,0.14)", border: "rgba(6,182,212,0.32)", text: "#22d3ee" },
  securities: { bg: "rgba(139,92,246,0.14)", border: "rgba(139,92,246,0.34)", text: "#a78bfa" },
  samsung: { bg: "rgba(59,130,246,0.14)", border: "rgba(59,130,246,0.34)", text: "#60a5fa" },
  hyundai: { bg: "rgba(20,184,166,0.14)", border: "rgba(20,184,166,0.32)", text: "#2dd4bf" },
  sk: { bg: "rgba(248,113,113,0.14)", border: "rgba(248,113,113,0.32)", text: "#f87171" },
  lg: { bg: "rgba(244,114,182,0.14)", border: "rgba(244,114,182,0.32)", text: "#f472b6" },
};

const DEMO_JOBS: RankedJob[] = [
  {
    id: "demo-kakaobank",
    company: "카카오뱅크",
    group: "인터넷은행",
    category: "bank",
    title: "서버 개발자 - 코어뱅킹 플랫폼",
    url: "https://recruit.kakaobank.com/",
    sourceUrl: "https://recruit.kakaobank.com/",
    score: 91,
    strengths: ["코어뱅킹 경험", "금융 IT 경험", "API/서버 개발 경험", "리딩 경험"],
    weaknesses: ["최근 성과 수치 보강"],
    recommendation: "가장 우선 지원할 만합니다. 코어뱅킹 Tech Lead 경험과 장애 대응, 성능 개선 수치를 첫 화면에 배치하세요.",
    scanStatus: "live",
  },
  {
    id: "demo-kb",
    company: "KB국민은행",
    group: "KB금융",
    category: "bank",
    title: "디지털/ICT 백엔드 개발",
    url: "https://kbstar.incruit.com/",
    sourceUrl: "https://kbstar.incruit.com/",
    score: 86,
    strengths: ["금융 IT 경험", "채널 개발 경험", "운영 안정화 경험"],
    weaknesses: ["Java/Spring 키워드 직접 명시"],
    recommendation: "은행권 경험과 가장 잘 연결됩니다. 채널 개발, 코어뱅킹 연계, 운영 안정성 중심으로 이력서를 조정하세요.",
    scanStatus: "live",
  },
  {
    id: "demo-samsung",
    company: "삼성 채용",
    group: "삼성그룹",
    category: "samsung",
    title: "SW 개발 - 클라우드/플랫폼",
    url: "https://www.samsungcareers.com/",
    sourceUrl: "https://www.samsungcareers.com/",
    score: 78,
    strengths: ["백엔드/플랫폼 역량", "리딩 경험"],
    weaknesses: ["클라우드 전환 성과 수치화", "대규모 플랫폼 사례 보강"],
    recommendation: "삼성SDS 계열로 보면 가능성이 있습니다. 금융 시스템 안정화 경험을 클라우드/플랫폼 운영 언어로 바꿔 표현하세요.",
    scanStatus: "fallback",
  },
  {
    id: "demo-hyundai",
    company: "현대자동차그룹",
    group: "현대",
    category: "hyundai",
    title: "Backend Platform Engineer",
    url: "https://talent.hyundai.com/",
    sourceUrl: "https://talent.hyundai.com/",
    score: 72,
    strengths: ["대규모 업무 시스템 개발", "요구사항 조율 및 리딩 경험"],
    weaknesses: ["모빌리티/제조 도메인 연결"],
    recommendation: "지원은 가능하지만 금융 도메인을 그대로 밀기보다 복잡한 업무 프로세스를 시스템화한 경험으로 풀어야 합니다.",
    scanStatus: "live",
  },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "#4ade80" : score >= 70 ? "#facc15" : "#f87171";
  const label = score >= 80 ? "우선 지원" : score >= 70 ? "검토 추천" : "보완 필요";

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-14 w-14">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2a2a4a" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>{score}</span>
      </div>
      <div>
        <div className="text-xs font-medium" style={{ color }}>{label}</div>
        <div className="text-xs" style={{ color: "#64748b" }}>서류 가능성</div>
      </div>
    </div>
  );
}

export default function JobWatch() {
  const [resumeText, setResumeText] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CompanyCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<RankedJob[]>([]);
  const [scannedAt, setScannedAt] = useState("");
  const [scanError, setScanError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    autoLoadResume();
  }, []);

  async function autoLoadResume() {
    setResumeLoading(true);
    try {
      const res = await fetch("/api/resume/local");
      const data = await res.json();
      if (data.text) {
        setResumeText(data.text);
        setResumeName(data.fileName);
      }
    } catch {
      // Local resume loading is available on localhost only.
    } finally {
      setResumeLoading(false);
    }
  }

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

  async function scanCompanySites() {
    setScanLoading(true);
    setScanError("");
    try {
      const res = await fetch("/api/company-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = (await res.json()) as ScanResponse;
      setJobs(data.jobs || []);
      setScannedAt(data.scannedAt || new Date().toISOString());
    } catch {
      setScanError("공식 채용 사이트 스캔 중 오류가 발생했습니다. 예시 결과로 화면을 확인할 수 있습니다.");
    } finally {
      setScanLoading(false);
    }
  }

  function showDemoJobs() {
    setJobs(DEMO_JOBS);
    setScannedAt(new Date().toISOString());
    setScanError("");
  }

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const categoryMatch = selectedCategory === "all" || job.category === selectedCategory;
      const queryMatch = !normalizedQuery || [job.company, job.group, job.title, ...job.strengths, ...job.weaknesses]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      return categoryMatch && queryMatch;
    });
  }, [jobs, query, selectedCategory]);

  const liveCount = jobs.filter((job) => job.scanStatus === "live").length;
  const fallbackCount = jobs.filter((job) => job.scanStatus === "fallback").length;

  return (
    <main className="min-h-screen px-6 pb-16 pt-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest" style={{ color: "#a78bfa" }}>// job watch</p>
            <h1 className="mb-3 font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,5vw,2.7rem)" }}>
              채용공고 자동 분석
            </h1>
            <div className="h-0.5 w-12 rounded" style={{ background: "linear-gradient(90deg,#8b5cf6,#06b6d4)" }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={showDemoJobs}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}
            >
              예시 결과 보기
            </button>
            <button
              onClick={scanCompanySites}
              disabled={scanLoading}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-55"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}
            >
              {scanLoading ? "공식 사이트 스캔 중..." : "공식 사이트 스캔"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <section className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <h2 className="mb-4 font-semibold">이력서</h2>
              {resumeLoading ? (
                <div className="rounded-xl py-3 text-center font-mono text-sm" style={{ border: "1px solid var(--card-border)", color: "#64748b" }}>
                  로컬 이력서 불러오는 중...
                </div>
              ) : resumeText ? (
                <div>
                  <div className="rounded-xl px-3 py-3 text-center text-sm font-medium" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", color: "#4ade80" }}>
                    {resumeName}
                  </div>
                  <p className="mt-2 font-mono text-xs" style={{ color: "#4ade80" }}>
                    파싱 완료 ({resumeText.length.toLocaleString()}자)
                  </p>
                </div>
              ) : (
                <div>
                  <input ref={fileRef} type="file" accept=".docx,.pdf" className="hidden" onChange={uploadResume} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full rounded-xl py-3 text-sm font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.97]"
                    style={{ border: "2px dashed rgba(139,92,246,0.4)", color: "#a78bfa", background: "rgba(139,92,246,0.06)" }}
                  >
                    .docx 이력서 선택
                  </button>
                  <p className="mt-2 text-xs" style={{ color: "#64748b" }}>로컬 이력서가 없을 때만 사용합니다.</p>
                </div>
              )}
            </section>

            <section className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <h2 className="mb-4 font-semibold">필터</h2>
              <input
                type="text"
                placeholder="예: 코어뱅킹, 클라우드, Java"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mb-4 w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
                style={{ background: "var(--surface)", border: "1px solid var(--card-border)", color: "var(--text)" }}
              />
              <div className="flex flex-wrap gap-2">
                {(["all", "bank", "securities", "samsung", "hyundai", "sk", "lg"] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-lg px-3 py-1 text-xs font-medium transition-all duration-150"
                    style={{
                      background: selectedCategory === category ? "rgba(139,92,246,0.25)" : "transparent",
                      border: `1px solid ${selectedCategory === category ? "rgba(139,92,246,0.5)" : "var(--card-border)"}`,
                      color: selectedCategory === category ? "#a78bfa" : "#94a3b8",
                    }}
                  >
                    {CATEGORY_LABEL[category]}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <h2 className="mb-3 font-semibold">스캔 상태</h2>
              <div className="space-y-2 text-sm" style={{ color: "#94a3b8" }}>
                <p>결과: {jobs.length}개</p>
                <p>공고 감지: {liveCount}개</p>
                <p>홈페이지 확인 필요: {fallbackCount}개</p>
                {scannedAt && <p className="text-xs" style={{ color: "#64748b" }}>마지막 스캔: {new Date(scannedAt).toLocaleString("ko-KR")}</p>}
              </div>
            </section>
          </aside>

          <section className="space-y-4">
            {scanError && (
              <div className="rounded-2xl p-4 text-sm" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.28)", color: "#fca5a5" }}>
                {scanError}
              </div>
            )}

            {!jobs.length && !scanLoading && (
              <div className="rounded-2xl p-10 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <p className="mb-2 font-semibold">아직 스캔 결과가 없습니다.</p>
                <p className="text-sm leading-6" style={{ color: "#94a3b8" }}>
                  공식 사이트 스캔을 누르면 은행, 증권사, 삼성, 현대, SK, LG 채용 페이지를 확인하고 서류 가능성이 높은 순서로 정렬합니다.
                </p>
              </div>
            )}

            {scanLoading && (
              <div className="rounded-2xl p-10 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <p className="mb-2 font-semibold">공식 채용 사이트 확인 중...</p>
                <p className="text-sm" style={{ color: "#94a3b8" }}>일부 사이트는 응답이 느릴 수 있어요. 잠깐만 기다려주세요.</p>
              </div>
            )}

            {filteredJobs.map((job, index) => {
              const categoryStyle = CATEGORY_STYLE[job.category];

              return (
                <article key={job.id} className="rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs" style={{ color: "#64748b" }}>#{index + 1}</span>
                        <span className="rounded-md px-2 py-0.5 text-xs font-medium" style={{ background: categoryStyle.bg, border: `1px solid ${categoryStyle.border}`, color: categoryStyle.text }}>
                          {CATEGORY_LABEL[job.category]}
                        </span>
                        <span className="text-xs" style={{ color: "#64748b" }}>{job.group}</span>
                        <span className="rounded-md px-2 py-0.5 text-xs" style={{ background: job.scanStatus === "live" ? "rgba(74,222,128,0.1)" : "rgba(250,204,21,0.1)", color: job.scanStatus === "live" ? "#4ade80" : "#facc15" }}>
                          {job.scanStatus === "live" ? "공고 감지" : "홈페이지 확인"}
                        </span>
                      </div>
                      <h3 className="mb-1 text-lg font-semibold">{job.title}</h3>
                      <p className="text-sm" style={{ color: "#94a3b8" }}>{job.company}</p>
                    </div>
                    <ScoreBadge score={job.score} />
                  </div>

                  <div className="mb-4 space-y-2 rounded-xl p-4 text-sm" style={{ background: "var(--surface)" }}>
                    <div><span className="text-xs font-medium" style={{ color: "#4ade80" }}>강점 </span><span style={{ color: "#94a3b8" }}>{job.strengths.join(" · ") || "이력서 키워드 추가 확인 필요"}</span></div>
                    <div><span className="text-xs font-medium" style={{ color: "#f87171" }}>보완점 </span><span style={{ color: "#94a3b8" }}>{job.weaknesses.join(" · ") || "공고 상세 조건 확인 필요"}</span></div>
                    <div><span className="text-xs font-medium" style={{ color: "#a78bfa" }}>추천 </span><span style={{ color: "#94a3b8" }}>{job.recommendation}</span></div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg py-2 text-center text-xs font-medium transition-all duration-150 hover:scale-[1.01]"
                      style={{ border: "1px solid var(--card-border)", color: "#94a3b8" }}
                    >
                      공고 또는 채용 페이지 열기
                    </a>
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg py-2 text-center text-xs font-medium transition-all duration-150 hover:scale-[1.01]"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}
                    >
                      회사 채용 홈
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </div>
    </main>
  );
}
