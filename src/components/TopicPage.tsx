import { Link, useParams } from "react-router-dom";
import { TOPICS } from "../types";
import { getArticlesByTopic } from "../lib/content";
import { ChevronRight } from "lucide-react";
import NotFound from "./NotFound";

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const topic = TOPICS.find((t) => t.id === topicId);

  if (!topic) {
    return <NotFound />;
  }

  const articles = getArticlesByTopic(topic.id);

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

      <div className="space-y-8 border-t border-border-subtle pt-12">
        <h2 className="font-ui text-sm font-semibold tracking-widest text-text-tertiary uppercase mb-8">
          Questions in this topic
        </h2>
        
        {articles.length === 0 ? (
          <p className="text-text-secondary">No questions published yet.</p>
        ) : (
          <ul className="space-y-6">
            {articles.map((article) => (
              <li key={article.data.slug}>
                <Link
                  to={`/${article.data.slug}`}
                  className="group block py-2"
                >
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
