import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import AppRoutes from "./AppRoutes";

/** Render a single route to an HTML string for prerendering. */
export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>
  );
}

// Re-export the data helpers the prerender script needs, so everything runs
// through Vite's module graph (import.meta.glob, path aliases, etc.).
export { getSeoForPath, getStaticRoutes } from "./lib/seo";
export { getAllArticles, getArticlesByTopic, markdownToPlainText } from "./lib/content";
export { TOPICS } from "./types";
export { SITE, absoluteUrl } from "./lib/site";
