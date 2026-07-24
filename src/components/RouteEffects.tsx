import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getSeoForPath } from "../lib/seo";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Client-side head management + scroll restoration for SPA navigation.
 * Prerendered HTML already carries the correct head; this keeps it in sync when
 * the user navigates without a full page load. Renders nothing.
 */
export default function RouteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    const origin = window.location.origin;
    const seo = getSeoForPath(pathname, origin);

    document.title = seo.title;
    upsertMeta("name", "description", seo.description);
    upsertLink("canonical", origin + (pathname === "/" ? "/" : pathname));
    upsertMeta("name", "robots", seo.noindex ? "noindex, follow" : "index, follow");

    upsertMeta("property", "og:title", seo.title);
    upsertMeta("property", "og:description", seo.description);
    upsertMeta("property", "og:type", seo.ogType);
    upsertMeta("property", "og:url", origin + pathname);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", seo.title);
    upsertMeta("name", "twitter:description", seo.description);

    // Refresh managed JSON-LD blocks.
    document.head.querySelectorAll('script[data-managed="jsonld"]').forEach((n) => n.remove());
    for (const block of seo.jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-managed", "jsonld");
      script.textContent = JSON.stringify(block);
      document.head.appendChild(script);
    }
  }, [pathname]);

  // Scroll to top on route change (React Router does not do this by default).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
