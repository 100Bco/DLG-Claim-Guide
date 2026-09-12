import { Link, useParams } from "react-router-dom";
import { TOPICS } from "../types";
import { getTopicGroups } from "../lib/content";
import { ChevronRight, ArrowRight } from "lucide-react";
import NotFound from "./NotFound";

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const topic = TOPICS.find((t) => t.id === topicId);

  if (!topic) {
    return <NotFound />;
  }

  const { groups, ungrouped } = getTopicGroups(topic.id);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
      <div className="mb-16">
        <nav aria-label="Breadcrumb" className="flex items-center text-sm font-medium text-text-tertiary mb-6">
          <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-text-primary">{topic.title}</span>
        </nav>

        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight mb-4">
          {topic.title}
        </h1>
        <p className="font-body text-xl text-text-secondary max-w-2xl">
          {topic.description}
        </p>
      </div>

      {/* Accident-type / sub-topic clusters */}
      {groups.length > 0 && (
        <div className="mb-16">
          <h2 className="font-ui text-sm font-semibold tracking-widest text-text-tertiary uppercase mb-6">
            Browse by area
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map(({ cluster, articles }) => (
              <Link
                key={cluster.id}
                to={`/topic/${topic.id}/${cluster.id}`}
                className="group block border border-border-subtle rounded-sm p-5 hover:border-text-primary transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-medium group-hover:underline underline-offset-4 decoration-border-strong">
                    {cluster.title}
                  </h3>
                  <ArrowRight className="w-4 h-4 text-text-tertiary shrink-0 group-hover:text-text-primary transition-colors" aria-hidden="true" />
                </div>
                <p className="font-body text-text-secondary leading-relaxed mt-2">
                  {cluster.description}
                </p>
                <span className="font-ui text-xs text-text-tertiary mt-3 inline-block">
                  {articles.length} {articles.length === 1 ? "question" : "questions"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* General / basics questions (not in a cluster) */}
      <div className="space-y-8 border-t border-border-subtle pt-12">
        <h2 className="font-ui text-sm font-semibold tracking-widest text-text-tertiary uppercase mb-8">
          {groups.length > 0 ? "Claims process & basics" : "Questions in this topic"}
        </h2>

        {ungrouped.length === 0 ? (
          <p className="text-text-secondary">No questions published yet.</p>
        ) : (
          <ul className="space-y-6">
            {ungrouped.map((article) => (
              <li key={article.data.slug}>
                <Link to={`/${article.data.slug}`} className="group block py-2">
                  <h3 className="font-display text-2xl font-medium mb-2 group-hover:underline underline-offset-4 decoration-border-strong">
                    {article.data.title}
                  </h3>
                  <p className="font-body text-text-secondary leading-relaxed text-lg max-w-3xl">
                    {article.data.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
