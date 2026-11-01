import { ImageResponse } from "next/og";

export const alt = "PMPrep AI: practice PM interview questions and get instant feedback";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 90,
        background: "#f5f6f2",
        color: "#1f2a24",
      }}
    >
      <div style={{ fontSize: 36, fontWeight: 600, color: "#3f6659" }}>PMPrep AI</div>
      <div style={{ marginTop: 28, fontSize: 76, fontWeight: 600, lineHeight: 1.1, maxWidth: 950 }}>
        Practice PM interviews. Get instant feedback.
      </div>
      <div style={{ marginTop: 48, display: "flex", alignItems: "center", gap: 14 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              background: i < 4 ? "#3f6659" : "#e1e5dd",
            }}
          />
        ))}
        <div style={{ marginLeft: 10, fontSize: 36, color: "#667066" }}>Scored on every answer</div>
      </div>
    </div>,
    size,
  );
}
