import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getSharedScore } from "@/lib/attemptsDb";
import { questionLabel, scoreOutOfTen } from "@/lib/scoreCard";

export const alt = "A PMPrep AI score card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ id: string }>;
}

export default async function ScoreCardImage({ params }: ImageProps) {
  const id = z.uuid().safeParse((await params).id);
  const shared = id.success ? await getSharedScore(id.data) : null;
  if (!shared) notFound();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#f5f6f2",
        color: "#1f2a24",
      }}
    >
      <div style={{ fontSize: 36, fontWeight: 600, color: "#3f6659" }}>PMPrep AI</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 40, color: "#667066" }}>I scored</div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 4 }}>
          <div style={{ fontSize: 170, fontWeight: 600, lineHeight: 1, color: "#3f6659" }}>
            {scoreOutOfTen(shared.score)}
          </div>
          <div style={{ fontSize: 70, color: "#667066", marginLeft: 12 }}>/10</div>
        </div>
        <div style={{ fontSize: 46, fontWeight: 600, marginTop: 20 }}>
          {`on ${questionLabel(shared.company, shared.category)}`}
        </div>
      </div>
      <div style={{ fontSize: 34, color: "#667066" }}>Try PMPrep AI and practice your next PM interview</div>
    </div>,
    size,
  );
}
