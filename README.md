# The Claims Guide

A static, question-based legal information site explaining how claims and courts
actually work. Built with **React 19 + Vite 6 + Tailwind CSS v4 + React Router 7**,
and **prerendered to static HTML** at build time so every page is fully
crawlable by search engines and AI crawlers (Google, ChatGPT, Claude,
Perplexity, etc.) without executing JavaScript.

## Run locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev        # dev server at http://localhost:3000
```

## Build

```bash
npm run build      # client build → SSR build → prerender
npm run preview    # serve the built ./dist
```

`npm run build` runs three steps (`build:client`, `build:server`, `prerender`)
and outputs a fully static `./dist` you can host anywhere. Set the canonical
domain so absolute URLs (canonical tags, Open Graph, sitemap, JSON feeds) are
correct:

```bash
SITE_URL=https://www.yourdomain.com npm run build
```

The default lives in `src/lib/site.ts` — update it once the real domain is known.

### What the build generates

| Output | Purpose |
| --- | --- |
| `dist/**/index.html` | Prerendered HTML for every page (real content, no JS needed) |
| Per-page `<title>`, meta, canonical, Open Graph, Twitter | SEO + social previews |
| JSON-LD (`Article`, `FAQPage`, `BreadcrumbList`, `WebSite`, `CollectionPage`) | Rich results + AI understanding |
| `dist/sitemap.xml` | Search-engine discovery |
| `dist/robots.txt` | Explicitly allows all major AI crawlers |
| `dist/llms.txt`, `dist/llms-full.txt` | LLM-friendly content index + full text |
| `dist/index.json` | Machine-readable catalog of every topic + article |
| `dist/<slug>.json` | Per-article JSON (frontmatter + markdown + plain text + citations) |

## Adding content

Every question is a Markdown file under `content/<topic>/<slug>.md` with YAML
frontmatter. New files are picked up automatically — no code changes needed —
and flow into the prerendered pages, sitemap, JSON feeds, and llms.txt.

```markdown
---
title: "What happens during a personal injury lawsuit?"
slug: "what-happens-during-personal-injury-lawsuit"   # must match the URL path
topic: "personal-injury"                               # one of the ids in src/types.ts
short_answer: "One or two sentences shown in the highlighted answer block and used as the meta description."
excerpt: "Short summary shown in listings."
related:
  - "why-do-injury-cases-settle"                        # slugs of related articles
sources:
  - name: "Cornell Legal Information Institute"          # citations render in the footer + JSON-LD
    url: "https://www.law.cornell.edu/wex/negligence"
statute:                                                 # optional highlighted statute block
  citation: "Tex. Civ. Prac. & Rem. Code § 16.003"
  text: "A person must bring suit ... not later than two years after..."
outbound_link:                                           # optional call-to-action link
  url: "https://example.com"
  anchor: "Read the full guide"
author: "Editorial Team — The Claims Guide"
published: true                                          # set false to keep it out of the build
date: "2026-07-24"
updated: "2026-07-24"                                    # optional; used for sitemap lastmod
---

Markdown body goes here...
```

Topics are defined in `src/types.ts` (`TOPICS`). Add an entry there to create a
new topic section.

## Deployment

The `./dist` output is fully static. It works on Netlify, Cloudflare Pages,
GitHub Pages, and Vercel (a `vercel.json` with clean URLs is included). Point
the host's publish directory at `dist` and the build command at
`SITE_URL=https://your-domain npm run build`.

> **Disclaimer:** This site provides general legal information, not legal advice.
