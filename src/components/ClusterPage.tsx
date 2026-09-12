import { Link, useParams } from "react-router-dom";
import { TOPICS, CLUSTERS } from "../types";
import { getArticlesByCluster } from "../lib/content";
import { ChevronRight } from "lucide-react";
import NotFound from "./NotFound";

export default function ClusterPage() {
  const { topicId, clusterId } = useParams<{ topicId: string; clusterId: string }>();
  const topic = TOPICS.find((t) => t.id === topicId);
  const cluster = CLUSTERS.find((c) => c.id === clusterId && c.topic === topicId);

  if (!topic || !cluster) {
    return <NotFound />;
  }

  const articles = getArticlesByCluster(cluster.id);
  const pillar = cluster.pillar ? articles.find((a) => a.data.slug === cluster.pillar) : undefined;
  const rest = articles.filter((a) => a.data.slug !== pillar?.data.slug);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
      <div className="mb-16">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center text-sm font-medium text-text-tertiary mb-6">
          <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to={`/topic/${topic.id}`} className="hover:text-text-primary transition-colors">{topic.title}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-text-primary">{cluster.title}</span>
        </nav>

        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight mb-4">
          {cluster.title}
        </h1>
        <p className="font-body text-xl text-text-secondary max-w-2xl">
          {cluster.description}
        </p>
      </div>

      {pillar && (
        <Link
          to={`/${pillar.data.slug}`}
          className="group block border border-border-strong rounded-sm p-6 md:p-8 mb-12 hover:border-text-primary transition-colors"
        >
          <span className="font-ui text-xs font-semibold tracking-widest text-text-tertiary uppercase">
            Start here
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-medium mt-2 mb-3 group-hover:underline underline-offset-4 decoration-border-strong">
            {pillar.data.title}
          </h2>
          <p className="font-body text-text-secondary leading-relaxed text-lg max-w-3xl">
            {pillar.data.excerpt || pillar.data.short_answer}
          </p>
        </Link>
      )}

      <div className="space-y-8 border-t border-border-subtle pt-12">
        <h2 className="font-ui text-sm font-semibold tracking-widest text-text-tertiary uppercase mb-8">
          {pillar ? "More in this area" : "Questions in this area"}
        </h2>

        {rest.length === 0 ? (
          <p className="text-text-secondary">More questions in this area are on the way.</p>
        ) : (
          <ul className="space-y-6">
            {rest.map((article) => (
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
