import { ImageResponse } from "next/og";

import { siteConfig } from "@/content/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "radial-gradient(circle at top right, rgba(0,212,255,0.16), transparent 35%), linear-gradient(135deg, #06060e 0%, #12122a 50%, #003347 100%)",
          color: "white",
          padding: "64px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            border: "1px solid rgba(0, 212, 255, 0.22)",
            padding: "48px",
          }}
        >
          <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#7ddfff" }}>
            {siteConfig.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: 76,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              <span>Backend systems.</span>
              <span>Cloud workflows.</span>
              <span>AI-native tooling.</span>
            </div>
            <div style={{ fontSize: 32, color: "#d0d0e0", maxWidth: "80%" }}>
              Software engineer focused on high-ownership product delivery, DevOps automation, and durable platform thinking.
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 24, color: "#7ddfff" }}>
            <span>NETAS</span>
            <span>IsikSchedule</span>
            <span>IEEE</span>
            <span>AdaLab</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
