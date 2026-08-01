import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const resumePath = path.join(process.cwd(), "public", "cv", "yigit-okur-cv.pdf");

export async function GET() {
  const resume = await readFile(resumePath);

  return new NextResponse(new Uint8Array(resume), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="yigit-okur-cv.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
