#!/usr/bin/env node
// Citation / link checker for The Claims Guide content.
//
// Scans every Markdown file under the content directory and verifies:
//   1. Every URL (in frontmatter `sources`, `outbound_link`, and body links)
//      resolves to a healthy HTTP status.
//   2. Every `related:` slug points to an article that actually exists.
//
// Zero dependencies — runs on plain Node 18+ (global fetch), so CI needs no
// install step. Designed to gate publishing: a broken citation fails the build.
//
// Usage:
//   node scripts/check-links.mjs                 # check all content
//   node scripts/check-links.mjs --strict        # also fail on 403/429/5xx
//   node scripts/check-links.mjs --dry-run       # list URLs, no network calls
//   node scripts/check-links.mjs --timeout=20000 --concurrency=6
//   node scripts/check-links.mjs content/personal-injury/foo.md   # specific files
//
// Exit code 0 = healthy, 1 = broken links or (in --strict) warnings.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// ---- config ----------------------------------------------------------------
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, def) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : def;
};

const STRICT = flag("strict");
const DRY_RUN = flag("dry-run");
const TIMEOUT = parseInt(opt("timeout", "20000"), 10);
const CONCURRENCY = parseInt(opt("concurrency", "6"), 10);
const CONTENT_DIR = opt("content", "content");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 ClaimsGuideLinkCheck/1.0";

const explicitFiles = args.filter((a) => !a.startsWith("--"));

// Hosts known to reject automated requests (bot protection). A non-2xx from
// these is reported as a warning, never a hard failure, because the page is
// very likely fine in a real browser. Verify these manually before publishing.
const SOFT_403_HOSTS = new Set([
  "www.law.cornell.edu",
  "law.cornell.edu",
  "www.americanbar.org",
  "americanbar.org",
  "leginfo.legislature.ca.gov",
  "www.calbar.ca.gov",
]);

// URLs to skip entirely (edit as needed). Exact match.
const SKIP = new Set([]);

// ---- helpers ---------------------------------------------------------------
async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (e.name.endsWith(".md")) out.push(full);
  }
  return out;
}

const URL_RE = /https?:\/\/[^\s"'<>)\]]+/g;
const stripTrailing = (u) => u.replace(/[.,;:]+$/, "");

function splitFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  return m ? { fm: m[1], body: raw.slice(m[0].length) } : { fm: "", body: raw };
}

// Pull the slug and related-slug list out of a frontmatter block with a small
// line parser (no YAML dependency).
function parseFrontmatterMeta(fm) {
  const slugMatch = fm.match(/^slug:\s*"?([^"\n]+)"?/m);
  const slug = slugMatch ? slugMatch[1].trim() : null;
  const related = [];
  const lines = fm.split("\n");
  let inRelated = false;
  for (const line of lines) {
    if (/^related:\s*$/.test(line)) { inRelated = true; continue; }
    if (inRelated) {
      const item = line.match(/^\s+-\s*"?([^"\n]+?)"?\s*$/);
      if (item) related.push(item[1].trim());
      else if (/^\S/.test(line)) inRelated = false; // next top-level key
    }
  }
  return { slug, related };
}

async function collect() {
  const files =
    explicitFiles.length > 0 ? explicitFiles : await walk(CONTENT_DIR);
  const urlMap = new Map(); // url -> [{file,line}]
  const slugSet = new Set(); // every slug that has a file
  const relatedRefs = []; // {file, slug}

  for (const file of files) {
    const raw = await readFile(file, "utf8");
    const { fm } = splitFrontmatter(raw);
    const meta = parseFrontmatterMeta(fm);
    if (meta.slug) slugSet.add(meta.slug);
    for (const r of meta.related) relatedRefs.push({ file, slug: r });

    raw.split("\n").forEach((line, i) => {
      const matches = line.match(URL_RE);
      if (!matches) return;
      for (let u of matches) {
        u = stripTrailing(u);
        if (SKIP.has(u)) continue;
        if (!urlMap.has(u)) urlMap.set(u, []);
        urlMap.get(u).push({ file, line: i + 1 });
      }
    });
  }
  return { files, urlMap, slugSet, relatedRefs };
}

async function fetchStatus(url, method) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: ac.signal,
      headers: { "User-Agent": UA, Accept: "*/*" },
    });
    return { status: res.status, finalUrl: res.url };
  } catch (e) {
    return { status: 0, error: e.name === "AbortError" ? "timeout" : e.code || e.message };
  } finally {
    clearTimeout(timer);
  }
}

async function checkUrl(url) {
  // Try HEAD first (cheap); fall back to GET when HEAD is blocked/unsupported
  // or errors out. Retry once on a network-level failure to reduce flakiness.
  let r = await fetchStatus(url, "HEAD");
  const headBlocked = r.status === 0 || [403, 405, 429, 501].includes(r.status);
  if (headBlocked) r = await fetchStatus(url, "GET");
  if (r.status === 0) r = await fetchStatus(url, "GET"); // one retry
  return r;
}

function classify(url, status) {
  const host = (() => {
    try { return new URL(url).host; } catch { return ""; }
  })();
  if (status >= 200 && status < 400) return "ok";
  if (status === 404 || status === 410) return "fail";
  if (status === 0) return "fail"; // DNS / connection / timeout
  // Other non-2xx (401/403/405/429/5xx): usually bot protection or transient.
  if (SOFT_403_HOSTS.has(host)) return "warn";
  return STRICT ? "fail" : "warn";
}

async function pool(items, size, worker) {
  const results = new Array(items.length);
  let idx = 0;
  const run = async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await worker(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, run));
  return results;
}

// ---- main ------------------------------------------------------------------
const { files, urlMap, slugSet, relatedRefs } = await collect();
const urls = [...urlMap.keys()].sort();

console.log(`Scanned ${files.length} file(s), found ${urls.length} unique URL(s).\n`);

// Related-slug validation (offline). Missing slugs are warnings, not failures,
// because a related article may be planned but not yet published.
const missingRelated = relatedRefs.filter((r) => !slugSet.has(r.slug));
if (missingRelated.length) {
  console.log("Related slugs with no matching article yet (warning):");
  for (const r of missingRelated) {
    console.log(`  - "${r.slug}"   referenced in ${r.file}`);
  }
  console.log("");
}

if (DRY_RUN) {
  for (const u of urls) console.log(`  ${u}`);
  console.log(`\nDry run — no network calls made. ${urls.length} URL(s) listed.`);
  process.exit(0);
}

const buckets = { ok: [], warn: [], fail: [] };

await pool(urls, CONCURRENCY, async (url) => {
  const r = await checkUrl(url);
  const verdict = classify(url, r.status);
  buckets[verdict].push({ url, ...r });
  const label = verdict === "ok" ? "ok  " : verdict === "warn" ? "WARN" : "FAIL";
  const detail = r.status ? r.status : r.error || "no-response";
  console.log(`  [${label}] ${String(detail).padEnd(8)} ${url}`);
});

// ---- report ----------------------------------------------------------------
console.log("\n" + "─".repeat(60));
console.log(`OK: ${buckets.ok.length}   WARN: ${buckets.warn.length}   FAIL: ${buckets.fail.length}`);

const report = (list) => {
  for (const { url, status, error } of list) {
    console.log(`\n  ${url}  (${status || error})`);
    for (const loc of urlMap.get(url)) console.log(`      ${loc.file}:${loc.line}`);
  }
};

if (buckets.warn.length) {
  console.log("\nWARNINGS (verify manually — often bot protection, not a dead link):");
  report(buckets.warn);
}
if (buckets.fail.length) {
  console.log("\nFAILURES (broken — fix before publishing):");
  report(buckets.fail);
}

const failed = buckets.fail.length > 0 || (STRICT && buckets.warn.length > 0);
console.log("");
if (failed) {
  console.log("✗ Link check failed.");
  process.exit(1);
} else {
  console.log("✓ Link check passed" + (buckets.warn.length ? " (with warnings)." : "."));
  process.exit(0);
}
