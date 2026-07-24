import { TOPICS } from "../types";
import { getAllArticles, getArticleBySlug, getArticlesByTopic, markdownToPlainText } from "./content";
import { SITE, absoluteUrl } from "./site";

export interface SeoData {
  title: string;
  description: string;
  canonical: string;
  /** og:type — "website" or "article" */
  ogType: string;
  /** JSON-LD blocks to embed in the page. */
  jsonLd: Record<string, unknown>[];
  /** Whether crawlers should index this route. */
  noindex?: boolean;
}

function clamp(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

const organization = {
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
};

function breadcrumb(items: { name: string; path: string }[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path, baseUrl),
    })),
  };
}

/**
 * Compute all SEO metadata for a given route. Shared by the client (which sets
 * document head on SPA navigation) and the prerender script (which bakes it
 * into static HTML). `baseUrl` lets the client use its live origin while the
 * build uses the canonical SITE_URL.
 */
export function getSeoForPath(pathname: string, baseUrl: string = SITE.url): SeoData {
  const path = pathname.replace(/\/+$/, "") || "/";

  // Home
  if (path === "/") {
    return {
      title: `${SITE.name} — ${SITE.tagline}`,
      description: SITE.description,
      canonical: absoluteUrl("/", baseUrl),
      ogType: "website",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: absoluteUrl("/", baseUrl),
          description: SITE.description,
          publisher: organization,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: absoluteUrl("/questions?q={search_term_string}", baseUrl),
            },
            "query-input": "required name=search_term_string",
          },
        },
      ],
    };
  }

  // Search / all questions
  if (path === "/questions") {
    return {
      title: `All questions — ${SITE.name}`,
      description:
        "Search and browse every question about legal claims, courts, and procedure across all topics.",
      canonical: absoluteUrl("/questions", baseUrl),
      ogType: "website",
      jsonLd: [breadcrumb([{ name: "Home", path: "/" }, { name: "All questions", path: "/questions" }], baseUrl)],
    };
  }

  // Topic pages
  const topicMatch = path.match(/^\/topic\/([^/]+)$/);
  if (topicMatch) {
    const topic = TOPICS.find((t) => t.id === topicMatch[1]);
    if (topic) {
      const articles = getArticlesByTopic(topic.id);
      return {
        title: `${topic.title} — ${SITE.name}`,
        description: clamp(topic.description),
        canonical: absoluteUrl(`/topic/${topic.id}`, baseUrl),
        ogType: "website",
        jsonLd: [
          breadcrumb(
            [
              { name: "Home", path: "/" },
              { name: topic.title, path: `/topic/${topic.id}` },
            ],
            baseUrl
          ),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: topic.title,
            description: topic.description,
            url: absoluteUrl(`/topic/${topic.id}`, baseUrl),
            hasPart: articles.map((a) => ({
              "@type": "Question",
              name: a.data.title,
              url: absoluteUrl(`/${a.data.slug}`, baseUrl),
            })),
          },
        ],
        noindex: articles.length === 0,
      };
    }
  }

  // Article pages: /:slug
  const slugMatch = path.match(/^\/([^/]+)$/);
  if (slugMatch) {
    const article = getArticleBySlug(slugMatch[1]);
    if (article) {
      const { data, content } = article;
      const topic = TOPICS.find((t) => t.id === data.topic);
      const description = clamp(data.short_answer || data.excerpt || markdownToPlainText(content));
      const crumbs = [{ name: "Home", path: "/" }];
      if (topic) crumbs.push({ name: topic.title, path: `/topic/${topic.id}` });
      crumbs.push({ name: data.title, path: `/${data.slug}` });

      const jsonLd: Record<string, unknown>[] = [
        breadcrumb(crumbs, baseUrl),
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: data.title,
              acceptedAnswer: { "@type": "Answer", text: data.short_answer },
            },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: data.title,
          description,
          articleBody: markdownToPlainText(content),
          author: { "@type": "Organization", name: data.author || SITE.publisher },
          publisher: organization,
          datePublished: data.date,
          dateModified: data.updated || data.date,
          mainEntityOfPage: absoluteUrl(`/${data.slug}`, baseUrl),
          url: absoluteUrl(`/${data.slug}`, baseUrl),
          isAccessibleForFree: true,
          ...(topic ? { articleSection: topic.title } : {}),
          ...(data.sources && data.sources.length
            ? { citation: data.sources.map((s) => ({ "@type": "CreativeWork", name: s.name, url: s.url })) }
            : {}),
        },
      ];

      return {
        title: `${data.title} — ${SITE.name}`,
        description,
        canonical: absoluteUrl(`/${data.slug}`, baseUrl),
        ogType: "article",
        jsonLd,
      };
    }
  }

  // Unknown route → 404
  return {
    title: `Page not found — ${SITE.name}`,
    description: "The page you are looking for could not be found.",
    canonical: absoluteUrl(path, baseUrl),
    ogType: "website",
    jsonLd: [],
    noindex: true,
  };
}

/** Every URL path that should be prerendered to static HTML. */
export function getStaticRoutes(): string[] {
  const routes = ["/", "/questions"];
  for (const topic of TOPICS) routes.push(`/topic/${topic.id}`);
  for (const article of getAllArticles()) routes.push(`/${article.data.slug}`);
  return routes;
}
