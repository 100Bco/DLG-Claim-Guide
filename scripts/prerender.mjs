// Static prerender + machine-readable export step.
//
// Runs after the client build and the SSR build. For every content route it
// renders real HTML (so search engines and AI crawlers see full text without
// executing JS), bakes per-page <head> metadata + JSON-LD, and emits
// sitemap.xml, robots.txt, llms.txt / llms-full.txt, and JSON feeds.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const ssrEntry = pathToFileURL(path.join(root, "dist-ssr", "entry-server.js")).href;

const {
  render,
  getStaticRoutes,
  getSeoForPath,
  getAllArticles,
  markdownToPlainText,
  TOPICS,
  SITE,
  absoluteUrl,
} = await import(ssrEntry);

const BASE_URL = (process.env.SITE_URL || SITE.url).replace(/\/$/, "");

const templatePath = path.join(distDir, "index.html");
// Strip the placeholder <title> and default description so per-page head
// injection doesn't produce duplicates.
const template = fs
  .readFileSync(templatePath, "utf8")
  .replace(/[ \t]*<title>[\s\S]*?<\/title>\r?\n?/, "")
  .replace(/[ \t]*<meta\s+name="description"[\s\S]*?\/>\r?\n?/, "");

const escapeHtml = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Escape "<" inside JSON-LD so it can't terminate the <script> element.
const jsonLdSafe = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");

function buildHead(seo) {
  const lines = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`,
    `<meta name="robots" content="${seo.noindex ? "noindex, follow" : "index, follow"}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE.name)}" />`,
    `<meta property="og:locale" content="${SITE.locale}" />`,
    `<meta property="og:type" content="${seo.ogType}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(seo.canonical)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
  ];
  for (const block of seo.jsonLd) {
    // data-managed lets the client refresh these on SPA navigation without
    // leaving duplicate structured-data blocks behind.
    lines.push(`<script type="application/ld+json" data-managed="jsonld">${jsonLdSafe(block)}</script>`);
  }
  return lines.join("\n    ");
}

function outputPathFor(route) {
  if (route === "/") return path.join(distDir, "index.html");
  return path.join(distDir, route.replace(/^\//, ""), "index.html");
}

// ---- 1. Prerender every route to static HTML -------------------------------
const routes = getStaticRoutes();
let pageCount = 0;
for (const route of routes) {
  const appHtml = render(route);
  const seo = getSeoForPath(route, BASE_URL);
  const html = template
    .replace("<!--app-head-->", buildHead(seo))
    .replace("<!--app-html-->", appHtml);
  const outPath = outputPathFor(route);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  pageCount++;
}

// ---- 2. sitemap.xml --------------------------------------------------------
const articles = getAllArticles();
const sitemapEntries = routes.map((route) => {
  const article = articles.find((a) => `/${a.data.slug}` === route);
  const lastmod = article ? article.data.updated || article.data.date : undefined;
  return (
    `  <url>\n` +
    `    <loc>${absoluteUrl(route, BASE_URL)}</loc>\n` +
    (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : "") +
    `    <changefreq>${route === "/" ? "weekly" : "monthly"}</changefreq>\n` +
    `    <priority>${route === "/" ? "1.0" : article ? "0.8" : "0.6"}</priority>\n` +
    `  </url>`
  );
});
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sitemapEntries.join("\n") +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);

// ---- 3. robots.txt (explicitly welcomes AI crawlers) -----------------------
const aiBots = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Meta-ExternalAgent",
  "cohere-ai",
];
const robots =
  `# Robots — all content is public and free to index.\n` +
  `User-agent: *\nAllow: /\n\n` +
  aiBots.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n") +
  `\n\nSitemap: ${absoluteUrl("/sitemap.xml", BASE_URL)}\n`;
fs.writeFileSync(path.join(distDir, "robots.txt"), robots);

// ---- 4. JSON feeds ---------------------------------------------------------
const catalog = {
  site: { name: SITE.name, url: BASE_URL, description: SITE.description },
  generated: articles.length,
  topics: TOPICS.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    url: absoluteUrl(`/topic/${t.id}`, BASE_URL),
    questionCount: articles.filter((a) => a.data.topic === t.id).length,
  })),
  articles: articles.map((a) => ({
    title: a.data.title,
    slug: a.data.slug,
    topic: a.data.topic,
    url: absoluteUrl(`/${a.data.slug}`, BASE_URL),
    json: absoluteUrl(`/${a.data.slug}.json`, BASE_URL),
    short_answer: a.data.short_answer,
    excerpt: a.data.excerpt,
    date: a.data.date,
    updated: a.data.updated || a.data.date,
  })),
};
fs.writeFileSync(path.join(distDir, "index.json"), JSON.stringify(catalog, null, 2));

for (const a of articles) {
  const plain = markdownToPlainText(a.content);
  const record = {
    ...a.data,
    url: absoluteUrl(`/${a.data.slug}`, BASE_URL),
    topic_url: absoluteUrl(`/topic/${a.data.topic}`, BASE_URL),
    content_markdown: a.content,
    content_text: plain,
    word_count: plain ? plain.split(/\s+/).length : 0,
  };
  fs.writeFileSync(path.join(distDir, `${a.data.slug}.json`), JSON.stringify(record, null, 2));
}

// ---- 5. llms.txt + llms-full.txt (AI discovery) ----------------------------
let llms = `# ${SITE.name}\n\n> ${SITE.description}\n\n`;
llms += `Base URL: ${BASE_URL}\nFull machine-readable index: ${absoluteUrl("/index.json", BASE_URL)}\n\n`;
llms += `## Topics\n\n`;
for (const t of TOPICS) {
  llms += `- [${t.title}](${absoluteUrl(`/topic/${t.id}`, BASE_URL)}): ${t.description}\n`;
}
llms += `\n## Questions\n\n`;
for (const a of articles) {
  llms += `- [${a.data.title}](${absoluteUrl(`/${a.data.slug}`, BASE_URL)}): ${a.data.short_answer}\n`;
}
fs.writeFileSync(path.join(distDir, "llms.txt"), llms);

let llmsFull = `# ${SITE.name}\n\n> ${SITE.description}\n\n`;
for (const a of articles) {
  const topic = TOPICS.find((t) => t.id === a.data.topic);
  llmsFull += `\n---\n\n# ${a.data.title}\n\n`;
  llmsFull += `URL: ${absoluteUrl(`/${a.data.slug}`, BASE_URL)}\n`;
  if (topic) llmsFull += `Topic: ${topic.title}\n`;
  llmsFull += `Published: ${a.data.date}${a.data.updated ? ` (updated ${a.data.updated})` : ""}\n\n`;
  llmsFull += `**${a.data.short_answer}**\n\n`;
  llmsFull += `${a.content}\n`;
  if (a.data.statute) {
    llmsFull += `\n> ${a.data.statute.citation}: "${a.data.statute.text}"\n`;
  }
  if (a.data.sources && a.data.sources.length) {
    llmsFull += `\nSources:\n`;
    for (const s of a.data.sources) llmsFull += `- ${s.name}: ${s.url}\n`;
  }
}
fs.writeFileSync(path.join(distDir, "llms-full.txt"), llmsFull);

// Clean up the SSR bundle — not needed in the deployed output.
fs.rmSync(path.join(root, "dist-ssr"), { recursive: true, force: true });

console.log(
  `\n✓ Prerendered ${pageCount} pages\n` +
    `✓ sitemap.xml, robots.txt, llms.txt, llms-full.txt\n` +
    `✓ index.json + ${articles.length} article JSON files\n` +
    `  Base URL: ${BASE_URL}${process.env.SITE_URL ? "" : "  (set SITE_URL to override)"}\n`
);
