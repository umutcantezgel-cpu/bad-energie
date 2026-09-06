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
  // PGlite bleibt außerhalb des Bundlers (nur lokal vorhanden); der Ausschluss unten hält seine Dateien aus dem Trace.
  serverExternalPackages: ["@electric-sql/pglite", "@sparticuz/chromium", "puppeteer-core"],
  compress: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  // Die Schlüssel sind Globs auf den Routennamen: Klammern eines dynamischen Segments würden
  // als Zeichenklasse gelesen und träfen keine Route. Darum die Präfixe mit `**`.
  outputFileTracingIncludes: {
    "/api/intern/**": [
      "src/lib/dokumente/assets/**/*",
      "node_modules/@puppeteer/browsers/**/*",
      "node_modules/@sparticuz/chromium/bin/**/*",
    ],
    "/intern/**": [
      "src/lib/dokumente/assets/**/*",
      "node_modules/@puppeteer/browsers/**/*",
      "node_modules/@sparticuz/chromium/bin/**/*",
    ],
    "/api/jobs/**": [
      "src/lib/dokumente/assets/**/*",
      "node_modules/@puppeteer/browsers/**/*",
      "node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },
  // Die entpackte Function darf 250 MB nicht überschreiten. Ausgeschlossen wird alles, was die
  // Function nie liest: PGlite (nur Entwicklungsabhängigkeit, 25 MB), die Bilder aus `public`
  // (liefert das CDN aus), die Laufzeitdaten unter `data`, das Altsystem sowie die lokalen
  // Material- und Belegordner, die nicht im Repository liegen.
  outputFileTracingExcludes: {
    // Achtung: Next vergleicht diese Muster als Teilstring des Pfads (picomatch mit contains).
    // Ein Muster wie "data/**/*" träfe auch node_modules/@puppeteer/browsers/lib/browser-data/…
    // und ließ das PDF auf Vercel scheitern. Deshalb nur eindeutige Ordnerpfade.
    "/*": [
      "node_modules/@electric-sql/pglite/**/*",
      "public/images/**/*",
      "public/videos/**/*",
      "public/fonts/**/*",
      "legacy/kostenschaetzung-altsystem/**/*",
      "data/pglite/**/*",
      "data/pglite.defekt-*/**/*",
      "data/outbox/**/*",
      "data/blob/**/*",
      "data/e2e/**/*",
      ".next/cache/**/*",
      "Arbeitsweise Chef/**/*",
      "Pipeline Kopie 5/**/*",
      "Angebote Bad und energie GmbH Kopie/**/*",
      "01a05849-bf12-774d-8e7f-0b0c17933e1d*/**/*",
      "01a0584a-6791-702d-a2c5-8ab6088b219d*/**/*",
    ],
  },
  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "@phosphor-icons/react/dist/ssr",
      "framer-motion",
    ],
  },
  async rewrites() {
    return [
      { source: "/api/estimate", destination: "/api/intern/estimate" },
      { source: "/api/jobs/:job", destination: "/api/intern/jobs/:job" },
      { source: "/api/webhooks/resend", destination: "/api/intern/webhooks/resend" },
    ];
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
