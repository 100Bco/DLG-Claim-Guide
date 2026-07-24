/**
 * Central site configuration.
 *
 * SITE_URL is the canonical production origin used to build absolute URLs for
 * canonical tags, Open Graph, sitemap.xml, JSON feeds and llms.txt. Override it
 * at build time with the SITE_URL environment variable, e.g.
 *
 *   SITE_URL=https://www.yoursite.com npm run build
 *
 * Update the default below once the real domain is known.
 */
export const SITE_URL: string = (
  (typeof process !== "undefined" && process.env && process.env.SITE_URL) ||
  "https://theclaimsguide.com"
).replace(/\/$/, "");

export const SITE = {
  name: "The Claims Guide",
  url: SITE_URL,
  tagline: "Answers to legal process questions.",
  description:
    "Neutral, question-based explanations of how legal claims and courts actually work — personal injury, workers' compensation, insurance claims, and small claims. No legal advice, no attorney advertising.",
  locale: "en_US",
  publisher: "The Claims Guide",
};

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path: string, baseUrl: string = SITE_URL): string {
  const base = baseUrl.replace(/\/$/, "");
  if (!path || path === "/") return base + "/";
  return base + (path.startsWith("/") ? path : "/" + path);
}
