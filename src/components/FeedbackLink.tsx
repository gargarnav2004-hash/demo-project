import { FEEDBACK_HREF } from "@/lib/site";

export default function FeedbackLink({ className }: { className?: string }) {
  return (
    <a href={FEEDBACK_HREF} target="_blank" rel="noopener noreferrer" className={className}>
      Give feedback
    </a>
  );
}
