import { NextResponse } from "next/server";

import { resumeText } from "@/content/site";

export async function GET() {
  return new NextResponse(resumeText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="yigit-okur-cv.txt"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
