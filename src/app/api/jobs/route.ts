import { NextRequest, NextResponse } from "next/server";

const SARAMIN_KEY = process.env.SARAMIN_API_KEY;

const TARGET_COMPANIES = [
  "KB국민은행", "신한은행", "하나은행", "우리은행", "NH농협은행",
  "IBK기업은행", "카카오뱅크", "토스뱅크",
  "미래에셋증권", "한국투자증권", "삼성증권", "키움증권", "NH투자증권",
  "삼성전자", "삼성SDS", "삼성생명",
  "현대자동차", "현대모비스", "현대오토에버",
  "SK텔레콤", "SK하이닉스", "SK C&C",
  "LG전자", "LG CNS", "LG유플러스",
];

type SaraminJob = {
  id: string;
  position: { title: string; location: { name: string } };
  company: { detail: { name: string } };
  active: string;
  url: string;
};

function categorize(company: string): "은행" | "증권사" | "대기업" {
  if (company.includes("은행") || company.includes("뱅크")) return "은행";
  if (company.includes("증권")) return "증권사";
  return "대기업";
}

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword") || "IT 개발";

  if (!SARAMIN_KEY) {
    return NextResponse.json({ error: "SARAMIN_API_KEY not set" }, { status: 500 });
  }

  try {
    const params = new URLSearchParams({
      keywords: keyword,
      count: "40",
      fields: "count,page",
    });
    params.set("access-key", SARAMIN_KEY);

    const res = await fetch(`https://oapi.saramin.co.kr/job-search?${params}`, {
      headers: { Accept: "application/json" },
    });

    const data = await res.json();
    const jobs = (data?.jobs?.job || []) as SaraminJob[];

    const filtered = jobs
      .filter((j) => TARGET_COMPANIES.some((c) => j.company.detail.name.includes(c.replace(/[가-힣]/g, m => m))))
      .map((j) => ({
        id: j.id,
        company: j.company.detail.name,
        title: j.position.title,
        location: j.position.location.name,
        deadline: j.active,
        url: j.url,
        category: categorize(j.company.detail.name),
      }));

    if (filtered.length === 0) {
      const all = jobs.slice(0, 10).map((j) => ({
        id: j.id,
        company: j.company.detail.name,
        title: j.position.title,
        location: j.position.location.name,
        deadline: j.active,
        url: j.url,
        category: categorize(j.company.detail.name),
      }));
      return NextResponse.json({ jobs: all });
    }

    return NextResponse.json({ jobs: filtered });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
