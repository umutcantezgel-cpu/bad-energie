import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy ohne Nonce, damit die öffentlichen Seiten statisch bleiben.
 * Drittquellen nur wegen Calendly (/beratung) und consent-gesteuertem Tracking.
 * Blob-URLs erreichen den Browser nie (Auslieferung nur über eigene Route Handler).
 */
const cspDirectives = (frameAncestors: string): string =>
  [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://assets.calendly.com https://www.googletagmanager.com https://connect.facebook.net`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.calendly.com https://www.facebook.com",
    "font-src 'self' data:",
    "frame-src 'self' https://calendly.com https://*.calendly.com",
    `connect-src 'self'${isProd ? "" : " ws://localhost:* http://localhost:*"} https://calendly.com https://*.calendly.com https://*.google-analytics.com`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    "/api/intern/[...slug]": ["src/lib/dokumente/assets/**/*"],
    "/api/jobs/[job]": ["src/lib/dokumente/assets/**/*"],
    "/api/estimate": ["src/lib/dokumente/assets/**/*"],
    "/intern/[[...slug]]": ["src/lib/dokumente/assets/**/*"],
  },
  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "@phosphor-icons/react/dist/ssr",
      "framer-motion",
    ],
  },
  async redirects() {
    return [
      { source: "/login", destination: "/intern", permanent: true },
      { source: "/cockpit", destination: "/intern", permanent: true },
      { source: "/cockpit/:path*", destination: "/intern", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...baseSecurityHeaders,
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: cspDirectives("'none'") },
        ],
      },
      {
        // Spätere Regel ersetzt bei gleichem Header-Key den ganzen Wert:
        // Der Intern-Bereich darf sich selbst einbetten (A4-Vorschau) und braucht Kamera/Mikrofon.
        source: "/intern/:path*",
        headers: [
          ...baseSecurityHeaders,
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=()" },
          { key: "Content-Security-Policy", value: cspDirectives("'self'") },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
