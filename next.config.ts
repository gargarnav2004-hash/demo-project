import type { NextConfig } from "next";

const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  // PostHog's API paths end in a slash, which must reach it unchanged.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    if (!posthogHost) return [];
    const assetsHost = posthogHost.replace(".i.posthog.com", "-assets.i.posthog.com");
    return [
      { source: "/ingest/static/:path*", destination: `${assetsHost}/static/:path*` },
      { source: "/ingest/array/:path*", destination: `${assetsHost}/array/:path*` },
      { source: "/ingest/:path*", destination: `${posthogHost}/:path*` },
    ];
  },
};

export default nextConfig;
