import { NextRequest, NextResponse } from "next/server";

type CompanyCategory = "bank" | "securities" | "samsung" | "hyundai" | "sk" | "lg";

type CompanySource = {
  id: string;
  company: string;
  group: string;
  category: CompanyCategory;
  url: string;
  keywords: string[];
};

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

const SOURCES: CompanySource[] = [
  { id: "kb", company: "KB국민은행", group: "KB금융", category: "bank", url: "https://kbstar.incruit.com/", keywords: ["IT", "디지털", "백엔드", "코어뱅킹", "플랫폼", "Java", "금융"] },
  { id: "shinhan", company: "신한은행", group: "신한금융", category: "bank", url: "https://shinhanbank.recruiter.co.kr/", keywords: ["ICT", "디지털", "금융", "서버", "API", "Java"] },
  { id: "hana", company: "하나은행", group: "하나금융", category: "bank", url: "https://hanabank.recruiter.co.kr/", keywords: ["ICT", "디지털", "금융", "플랫폼", "Java"] },
  { id: "woori", company: "우리은행", group: "우리금융", category: "bank", url: "https://wooribank.recruiter.co.kr/", keywords: ["IT", "디지털", "채널", "금융", "서버"] },
  { id: "kakaobank", company: "카카오뱅크", group: "인터넷은행", category: "bank", url: "https://recruit.kakaobank.com/", keywords: ["서버", "백엔드", "코어뱅킹", "플랫폼", "Java", "금융"] },
  { id: "tossbank", company: "토스뱅크", group: "인터넷은행", category: "bank", url: "https://toss.im/career/jobs", keywords: ["Server", "Backend", "Bank", "Platform", "Java", "금융"] },
  { id: "mirae", company: "미래에셋증권", group: "증권사", category: "securities", url: "https://miraeassetdaewoo.recruiter.co.kr/", keywords: ["IT", "디지털", "MTS", "HTS", "서버", "금융투자"] },
  { id: "koreainvest", company: "한국투자증권", group: "증권사", category: "securities", url: "https://recruit.truefriend.com/", keywords: ["IT", "금융투자", "플랫폼", "API", "서버"] },
  { id: "samsung", company: "삼성 채용", group: "삼성그룹", category: "samsung", url: "https://www.samsungcareers.com/", keywords: ["SW", "Backend", "Cloud", "SDS", "금융", "서버"] },
  { id: "hyundai", company: "현대자동차그룹", group: "현대", category: "hyundai", url: "https://talent.hyundai.com/", keywords: ["Backend", "Cloud", "Platform", "Mobility", "AutoEver", "서버"] },
  { id: "sk", company: "SK Careers", group: "SK그룹", category: "sk", url: "https://www.skcareers.com/", keywords: ["Backend", "Cloud", "Data", "AI", "Platform", "서버"] },
  { id: "lg", company: "LG Careers", group: "LG그룹", category: "lg", url: "https://careers.lg.com/", keywords: ["Backend", "Cloud", "CNS", "DX", "Platform", "서버"] },
];

const RESUME_SIGNALS = [
  "금융",
  "코어뱅킹",
  "Tech Lead",
  "백엔드",
  "서버",
  "Java",
  "API",
  "채널",
  "플랫폼",
  "운영",
  "장애",
  "대용량",
  "클라우드",
  "AWS",
  "Docker",
  "리딩",
];

const JOB_TITLE_HINTS = [
  "채용",
  "개발",
  "IT",
  "ICT",
  "디지털",
  "Backend",
  "Back-end",
  "Server",
  "서버",
  "백엔드",
  "SW",
  "Software",
  "Engineer",
  "Cloud",
  "클라우드",
  "플랫폼",
  "금융",
  "코어뱅킹",
];

function cleanText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#40;/g, "(")
    .replace(/&#41;/g, ")")
    .replace(/\s+/g, " ")
    .trim();
}

function toAbsoluteUrl(href: string, baseUrl: string) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

async function fetchHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 JobWatchBot/1.0",
        accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!response.ok) return "";
    return await response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

function extractJobCandidates(html: string, source: CompanySource) {
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const candidates: Array<{ title: string; url: string }> = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(anchorPattern)) {
    const href = match[1];
    const title = cleanText(match[2]);
    if (!href || !title || title.length < 3 || title.length > 120) continue;

    const haystack = `${title} ${href}`.toLowerCase();
    const looksLikeJob = JOB_TITLE_HINTS.some((hint) => haystack.includes(hint.toLowerCase()));
    if (!looksLikeJob) continue;

    const url = toAbsoluteUrl(href, source.url);
    const key = `${title}|${url}`;
    if (seen.has(key)) continue;

    seen.add(key);
    candidates.push({ title, url });
  }

  return candidates.slice(0, 4);
}

function scoreCandidate(source: CompanySource, title: string, resumeText: string) {
  const resume = resumeText.toLowerCase();
  const titleText = `${source.company} ${source.group} ${title} ${source.keywords.join(" ")}`.toLowerCase();

  const matchedSourceKeywords = source.keywords.filter((keyword) => {
    const lower = keyword.toLowerCase();
    return resume.includes(lower) || titleText.includes(lower);
  });
  const matchedResumeSignals = RESUME_SIGNALS.filter((signal) => {
    const lower = signal.toLowerCase();
    return resume.includes(lower) && titleText.includes(lower);
  });

  let score = 48;
  score += Math.min(matchedSourceKeywords.length * 5, 25);
  score += Math.min(matchedResumeSignals.length * 4, 24);

  if (source.category === "bank" && resume.includes("코어뱅킹")) score += 12;
  if ((source.category === "bank" || source.category === "securities") && resume.includes("금융")) score += 8;
  if (titleText.includes("backend") || titleText.includes("백엔드") || titleText.includes("서버")) score += 6;
  if (titleText.includes("cloud") || titleText.includes("클라우드")) score += resume.includes("aws") || resume.includes("cloud") || resume.includes("클라우드") ? 5 : -2;

  return Math.max(35, Math.min(96, score));
}

function withTopicParticle(value: string) {
  const last = value.trim().at(-1);
  if (!last) return value;
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return `${value}는`;
  return (code - 0xac00) % 28 === 0 ? `${value}는` : `${value}은`;
}

function buildAnalysis(source: CompanySource, title: string, score: number, resumeText: string) {
  const resume = resumeText.toLowerCase();
  const strengths = [];
  const weaknesses = [];

  if (resume.includes("금융")) strengths.push("금융 IT 경험");
  if (resume.includes("코어뱅킹")) strengths.push("코어뱅킹 경험");
  if (resume.includes("tech lead") || resume.includes("리드")) strengths.push("리딩 경험");
  if (resume.includes("api")) strengths.push("API/서버 개발 경험");
  if (resume.includes("운영") || resume.includes("장애")) strengths.push("운영 안정화 경험");

  if (source.category === "securities") weaknesses.push("증권 도메인 키워드 보강");
  if (source.category === "hyundai") weaknesses.push("모빌리티/제조 도메인 연결");
  if (source.category === "samsung" || source.category === "lg" || source.category === "sk") weaknesses.push("클라우드·대규모 플랫폼 성과 수치화");
  if (!resume.includes("aws") && !resume.includes("클라우드")) weaknesses.push("클라우드 경험 명시");

  return {
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 3),
    recommendation:
      score >= 80
        ? `${withTopicParticle(source.company)} 현재 이력서와 결이 좋습니다. ${title}에 맞춰 금융 시스템 안정성, 코어뱅킹, 리딩 경험을 앞쪽에 배치하세요.`
        : score >= 70
          ? `${withTopicParticle(source.company)} 지원 검토 가치가 있습니다. 공고 키워드에 맞춰 프로젝트 성과와 기술 스택을 조금 더 직접적으로 연결하세요.`
          : `${withTopicParticle(source.company)} 보완 후 지원이 좋습니다. 공고의 핵심 도메인과 이력서 경험 사이의 연결 문장을 먼저 만들어야 합니다.`,
  };
}

function fallbackJob(source: CompanySource, resumeText: string): RankedJob {
  const title = `${source.company} 공식 채용 페이지 확인 필요`;
  const score = Math.max(35, scoreCandidate(source, title, resumeText) - 10);
  const analysis = buildAnalysis(source, title, score, resumeText);

  return {
    id: `${source.id}-fallback`,
    company: source.company,
    group: source.group,
    category: source.category,
    title,
    url: source.url,
    sourceUrl: source.url,
    score,
    ...analysis,
    scanStatus: "fallback",
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const resumeText = typeof body.resumeText === "string" ? body.resumeText : "";

  const rankedJobsNested = await Promise.all(
    SOURCES.map(async (source) => {
      const html = await fetchHtml(source.url);
      const candidates = html ? extractJobCandidates(html, source) : [];

      if (candidates.length === 0) {
        return [fallbackJob(source, resumeText)];
      }

      return candidates.map((candidate, index): RankedJob => {
        const score = scoreCandidate(source, candidate.title, resumeText);
        const analysis = buildAnalysis(source, candidate.title, score, resumeText);

        return {
          id: `${source.id}-${index}`,
          company: source.company,
          group: source.group,
          category: source.category,
          title: candidate.title,
          url: candidate.url,
          sourceUrl: source.url,
          score,
          ...analysis,
          scanStatus: "live",
        };
      });
    }),
  );

  const jobs = rankedJobsNested
    .flat()
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  return NextResponse.json({
    scannedAt: new Date().toISOString(),
    jobs,
  });
}
