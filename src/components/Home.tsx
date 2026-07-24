import { Link, useNavigate } from "react-router-dom";
import { TOPICS } from "../types";
import { Search, ArrowRight } from "lucide-react";
import { useState } from "react";
import { getArticlesByTopic } from "../lib/content";

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/questions?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <div className="max-w-2xl mb-16">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight mb-6">
          How claims and courts actually work
        </h1>
        <p className="font-body text-xl md:text-2xl text-text-secondary leading-relaxed mb-10">
          Plain answers on insurance claims, workers&rsquo; compensation, injury lawsuits, and small claims court &mdash; with cited sources.
        </p>

        <form onSubmit={handleSearch} role="search" className="relative max-w-lg">
          <label htmlFor="home-search" className="sr-only">
            Search questions
          </label>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
          </div>
          <input
            id="home-search"
            name="q"
            type="search"
            enterKeyHint="search"
            className="block w-full pl-12 pr-4 py-4 bg-surface-elevated border border-border-strong rounded-sm text-lg focus:border-text-primary transition-colors placeholder:text-text-tertiary"
            placeholder="Search questions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="sr-only">
            Search
          </button>
        </form>
      </div>

      <h2 className="font-ui text-sm font-semibold tracking-widest text-text-tertiary uppercase mb-6">
        Browse by topic
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TOPICS.map((topic, i) => {
          const count = getArticlesByTopic(topic.id).length;

          return (
            <Link
              key={topic.id}
              to={`/topic/${topic.id}`}
              className="group block rounded-sm border border-border-subtle bg-surface-elevated p-7 md:p-8 hover:border-border-strong transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <span
                  className="font-mono text-3xl md:text-4xl font-light leading-none tabular-nums text-border-strong group-hover:text-text-tertiary transition-colors"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ArrowRight
                  className="w-5 h-5 mt-1 shrink-0 text-text-tertiary group-hover:text-text-primary group-hover:translate-x-0.5 transition-all"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-display text-2xl font-normal text-text-primary leading-tight group-hover:text-text-secondary transition-colors">
                {topic.title}
              </h3>
              <p className="font-ui text-text-secondary leading-relaxed mt-3 mb-6 font-light">
                {topic.description}
              </p>
              <div className="font-mono text-xs font-medium tracking-widest text-text-tertiary uppercase">
                {count} {count === 1 ? "question" : "questions"}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        <Link
          to="/questions"
          className="font-ui text-sm font-medium text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1"
        >
          Browse all questions &rarr;
        </Link>
      </div>
    </div>
  );
}
