import { Article, ArticleFrontmatter } from "../types";
import { parse } from "yaml";

export function parseMarkdown(rawContent: string): Article {
  const frontmatterRegex = /---\n([\s\S]*?)\n---/;
  const match = rawContent.match(frontmatterRegex);

  if (!match) {
    throw new Error("No frontmatter found");
  }

  const frontmatterString = match[1];
  const content = rawContent.replace(frontmatterRegex, "").trim();
  const data = parse(frontmatterString) as ArticleFrontmatter;

  return { content, data };
}

// Vite glob import of all markdown files as raw strings
const markdownFiles = import.meta.glob("../../content/**/*.md", { query: "?raw", import: "default", eager: true });

// Parse every markdown file exactly once at module load, then reuse the
// cached result. Previously getAllArticles() re-parsed + re-sorted every file
// on each call, and getArticleBySlug/getArticlesByTopic each called it again —
// so a single article page parsed the whole corpus many times over.
const ALL_ARTICLES: Article[] = Object.values(markdownFiles)
  .map((raw) => parseMarkdown(raw as string))
  .filter((article) => article.data.published)
  .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

const BY_SLUG = new Map(ALL_ARTICLES.map((a) => [a.data.slug, a]));

export function getAllArticles(): Article[] {
  return ALL_ARTICLES;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return BY_SLUG.get(slug);
}

export function getArticlesByTopic(topicId: string): Article[] {
  return ALL_ARTICLES.filter((article) => article.data.topic === topicId);
}

/**
 * Strip markdown syntax down to readable plain text. Used for meta
 * descriptions, JSON feeds, and the llms.txt export so machine readers get
 * clean prose instead of raw markup.
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/[*_>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
