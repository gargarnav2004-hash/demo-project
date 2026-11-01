import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (key && host) {
  posthog.init(key, {
    // Sent through the /ingest rewrite in next.config.ts so ad blockers lose fewer events.
    api_host: "/ingest",
    ui_host: host.replace(".i.posthog.com", ".posthog.com"),
    capture_pageview: "history_change",
    person_profiles: "identified_only",
    // Only the events in src/lib/analytics.ts are sent, so answers never reach PostHog.
    autocapture: false,
    disable_session_recording: true,
    disable_surveys: true,
  });
}
