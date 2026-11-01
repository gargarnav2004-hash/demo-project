import Link from "next/link";
import FeedbackLink from "@/components/FeedbackLink";
import SiteHeader from "@/components/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <footer className="flex items-center justify-center gap-6 border-t border-border px-4 py-5 text-sm text-muted">
        <FeedbackLink className="py-1 hover:text-foreground" />
        <Link href="/#privacy" className="py-1 hover:text-foreground">
          Privacy
        </Link>
      </footer>
    </>
  );
}
