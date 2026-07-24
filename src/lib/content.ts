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

export function getAllArticles(): Article[] {
  const articles: Article[] = [];
  
  for (const path in markdownFiles) {
    const rawContent = markdownFiles[path] as string;
    const article = parseMarkdown(rawContent);
    if (article.data.published) {
      articles.push(article);
    }
  }

  // Sort by date descending
  return articles.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find((article) => article.data.slug === slug);
}

export function getArticlesByTopic(topicId: string): Article[] {
  return getAllArticles().filter((article) => article.data.topic === topicId);
}
