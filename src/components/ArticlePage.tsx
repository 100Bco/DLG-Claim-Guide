import { Link, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import { TOPICS } from "../types";
import { getArticleBySlug, getArticlesByTopic } from "../lib/content";
import { ChevronRight, ExternalLink } from "lucide-react";
import NotFound from "./NotFound";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return <NotFound />;
  }

  const { content, data } = article;
  const topic = TOPICS.find((t) => t.id === data.topic);

  // Resolve related articles
  const relatedArticles = (data.related || [])
    .map((relatedSlug) => getArticleBySlug(relatedSlug))
    .filter((a): a is NonNullable<typeof a> => a !== undefined);

  // Other questions in this topic
  const otherQuestions = getArticlesByTopic(data.topic)
    .filter(a => a.data.slug !== data.slug)
    .slice(0, 3);

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      <nav aria-label="Breadcrumb" className="flex items-center text-sm font-medium text-text-tertiary mb-12">
        <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        {topic && (
          <>
            <Link to={`/topic/${topic.id}`} className="hover:text-text-primary transition-colors">
              {topic.title}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
          </>
        )}
        <span className="text-text-secondary truncate max-w-[200px] md:max-w-sm" title={data.title}>
          {data.title}
        </span>
      </nav>

      <header className="mb-12">
        <h1 className="font-display text-4xl md:text-5xl lg:text-5xl tracking-tight leading-tight mb-10 text-text-primary">
          {data.title}
        </h1>
        
        {/* Short Answer Block */}
        <div className="bg-surface-elevated border-l-4 border-text-primary p-6 md:p-8">
          <p className="font-body text-xl md:text-2xl leading-relaxed text-text-primary">
            {data.short_answer}
          </p>
        </div>
      </header>

      <div className="font-body text-lg text-text-primary markdown-body">
        <Markdown>{content}</Markdown>
      </div>

      {/* Statute Block */}
      {data.statute && (
        <div className="my-12">
          <h3 className="font-ui text-sm font-semibold tracking-widest text-text-tertiary uppercase mb-4">
            Relevant Statute
          </h3>
          <div className="bg-surface-base border border-border-strong rounded-sm p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#40403C]"></div>
            <p className="font-ui text-xs font-semibold text-text-secondary mb-3">
              {data.statute.citation}
            </p>
            <blockquote className="font-mono text-[15px] leading-relaxed text-text-secondary">
              "{data.statute.text}"
            </blockquote>
          </div>
        </div>
      )}

      {/* Outbound Link */}
      {data.outbound_link && (
        <div className="my-10">
          <a
            href={data.outbound_link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-surface-elevated hover:bg-surface-highlight border border-border-strong rounded-sm font-ui font-medium transition-colors"
          >
            <span>{data.outbound_link.anchor}</span>
            <ExternalLink className="w-4 h-4 text-text-secondary" />
          </a>
        </div>
      )}

      <footer className="mt-20 pt-10 border-t border-border-subtle grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          {/* Related Questions */}
          {relatedArticles.length > 0 && (
            <div className="mb-10">
              <h3 className="font-ui text-sm font-semibold tracking-widest text-text-tertiary uppercase mb-4">
                Related Questions
              </h3>
              <ul className="space-y-4">
                {relatedArticles.map((related) => (
                  <li key={related.data.slug}>
                    <Link
                      to={`/${related.data.slug}`}
                      className="font-display text-lg text-text-primary hover:underline underline-offset-4 decoration-border-strong"
                    >
                      {related.data.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {data.sources && data.sources.length > 0 && (
            <div>
              <h3 className="font-ui text-sm font-semibold tracking-widest text-text-tertiary uppercase mb-4">
                Sources
              </h3>
              <ul className="space-y-2">
                {data.sources.map((source, i) => (
                  <li key={i}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-ui text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <span>{source.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          {/* Topic Context */}
          {otherQuestions.length > 0 && (
            <div>
              <h3 className="font-ui text-sm font-semibold tracking-widest text-text-tertiary uppercase mb-4">
                More in {topic?.title}
              </h3>
              <ul className="space-y-4">
                {otherQuestions.map((q) => (
                  <li key={q.data.slug}>
                    <Link
                      to={`/${q.data.slug}`}
                      className="font-display text-lg text-text-primary hover:underline underline-offset-4 decoration-border-strong"
                    >
                      {q.data.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </footer>

      {/* Author block appended visually */}
      <div className="mt-16 pt-8 border-t border-border-subtle">
        <p className="font-ui text-sm text-text-tertiary">
          Written by {data.author}
        </p>
      </div>
    </article>
  );
}
