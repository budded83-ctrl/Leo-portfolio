import { NextResponse } from "next/server";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";

const RESUME_PATH = path.join(
  "C:\\Users\\user\\OneDrive\\Desktop\\채용\\2026",
  "이영민_이력서_2026_개선.docx"
);

export async function GET() {
  try {
    if (!fs.existsSync(RESUME_PATH)) {
      return NextResponse.json({ error: "이력서 파일을 찾을 수 없습니다." }, { status: 404 });
    }

    const buffer = fs.readFileSync(RESUME_PATH);
    const result = await mammoth.extractRawText({ buffer });

    return NextResponse.json({
      text: result.value,
      fileName: "이영민_이력서_2026_개선.docx",
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
