import { useState } from "react";
import { questionProps, track, type ShareChannel } from "@/lib/analytics";
import { shareHeadline } from "@/lib/scoreCard";
import type { Question } from "@/types";

interface ShareScoreProps {
  attemptId: string;
  score: number;
  question: Question;
}

const LINK_CLASS =
  "flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:border-primary";

export default function ShareScore({ attemptId, score, question }: ShareScoreProps) {
  const [shareId, setShareId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The link is only created when asked for, and the buttons appear afterwards as
  // plain links, because browsers block new windows opened after a network request.
  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId }),
      });
      if (!res.ok) throw new Error("Failed to create your share link");
      const data: { shareId: string } = await res.json();
      setShareId(data.shareId);
    } catch {
      setError("Couldn't create your score card. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  function handleShared(channel: ShareChannel) {
    track("score_card_shared", {
      ...questionProps(question),
      attempt_id: attemptId,
      channel,
      score,
    });
  }

  if (!shareId) {
    return (
      <div className="mt-5 border-t border-border pt-4">
        <button onClick={handleCreate} disabled={creating} className={`${LINK_CLASS} disabled:opacity-50`}>
          {creating ? "Creating your card…" : "Share your score"}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/s/${shareId}`;
  const imageUrl = `/s/${shareId}/opengraph-image`;
  const message = `${shareHeadline(score, question.company, question.category)}. Try PMPrep AI: ${shareUrl}`;

  return (
    <div className="mt-5 border-t border-border pt-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- a generated image route */}
      <img
        src={imageUrl}
        alt={shareHeadline(score, question.company, question.category)}
        width={1200}
        height={630}
        className="h-auto w-full rounded-2xl border border-border"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShared("linkedin")}
          className={LINK_CLASS}
        >
          Share on LinkedIn
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleShared("whatsapp")}
          className={LINK_CLASS}
        >
          Share on WhatsApp
        </a>
        <a
          href={imageUrl}
          download="pmprep-score.png"
          onClick={() => handleShared("download")}
          className={LINK_CLASS}
        >
          Download image
        </a>
      </div>
      <p className="mt-2 text-xs text-muted">
        Anyone with the link sees this score, not your answer.
      </p>
    </div>
  );
}
