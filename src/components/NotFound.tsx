import { Link } from "react-router-dom";
import { TOPICS } from "../types";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 md:py-32">
      <p className="font-mono text-sm font-medium tracking-widest text-text-tertiary uppercase mb-6">
        404 — Not found
      </p>
      <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight mb-6">
        We couldn&rsquo;t find that page.
      </h1>
      <p className="font-body text-xl text-text-secondary leading-relaxed mb-10">
        The question or page you were looking for may have moved or never existed. Try searching, or
        start from one of the topics below.
      </p>
      <div className="flex flex-wrap gap-3 mb-12">
        <Link
          to="/questions"
          className="inline-flex items-center px-5 py-3 bg-accent-strong text-surface-base rounded-sm font-ui font-medium hover:opacity-90 transition-opacity"
        >
          Search all questions
        </Link>
        <Link
          to="/"
          className="inline-flex items-center px-5 py-3 border border-border-strong rounded-sm font-ui font-medium hover:bg-surface-elevated transition-colors"
        >
          Back to home
        </Link>
      </div>
      <div className="border-t border-border-subtle pt-8">
        <h2 className="font-ui text-sm font-semibold tracking-widest text-text-tertiary uppercase mb-4">
          Browse topics
        </h2>
        <ul className="flex flex-col gap-3">
          {TOPICS.map((topic) => (
            <li key={topic.id}>
              <Link
                to={`/topic/${topic.id}`}
                className="font-display text-lg text-text-primary hover:underline underline-offset-4 decoration-border-strong"
              >
                {topic.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
