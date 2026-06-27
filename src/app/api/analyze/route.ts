import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobTitle, company } = await req.json();

    if (!resumeText || !jobTitle) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `당신은 HR 전문가입니다. 아래 이력서와 채용 정보를 분석하여 서류 합격 가능성을 평가해주세요.

회사: ${company}
직무: ${jobTitle}

이력서 내용:
${resumeText.slice(0, 3000)}

아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "score": 75,
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["보완점1", "보완점2"],
  "recommendation": "한 줄 조언"
}

score는 0~100 사이 정수입니다.`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Parse error" }, { status: 500 });

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ result });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
