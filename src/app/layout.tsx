import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import PostHogIdentify from "@/components/PostHogIdentify";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "PMPrep AI: PM interview practice with instant feedback";
const DESCRIPTION =
  "Practice product sense, metrics, root cause analysis, guesstimate, and strategy questions, and get a score and specific AI feedback on every answer.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  // Without this, Next.js uses the Vercel production URL for absolute links.
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: { default: TITLE, template: "%s | PMPrep AI" },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "PMPrep AI",
    type: "website",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
      appearance={{ variables: { colorPrimary: "#3f6659" } }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          {children}
          <PostHogIdentify />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
