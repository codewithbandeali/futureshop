/**
 * Sentry browser SDK config — only initialises when SENTRY_DSN is set so
 * local development stays clean. Wire DSN per environment in your hosting
 * platform (Vercel env vars / Cloudflare secrets / etc).
 */
import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
    Sentry.init({
        dsn,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: 0,
        debug: false,
        environment: process.env.NEXT_PUBLIC_ENV ?? process.env.NODE_ENV,
    })
}
