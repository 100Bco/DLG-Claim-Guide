import { Link, useNavigate } from "react-router-dom";
import { TOPICS } from "../types";
import { Search } from "lucide-react";
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
      <div className="max-w-2xl mb-20">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight mb-6">
          Answers to legal process questions.
        </h1>
        <p className="font-body text-xl md:text-2xl text-text-secondary leading-relaxed mb-10">
          We explain how claims and courts actually work. No legal advice, no attorney advertising. Just neutral information about the systems you are navigating.
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

      <div className="space-y-16">
        {TOPICS.map((topic) => {
          const articles = getArticlesByTopic(topic.id);
          const sampleArticles = articles.slice(0, 3);
          
          return (
            <div key={topic.id} className="pt-4 border-b border-border-subtle pb-16">
              <div className="mb-10">
                <Link to={`/topic/${topic.id}`} className="group inline-block">
                  <h2 className="font-display text-[2.5rem] font-normal mb-4 text-text-primary group-hover:text-text-secondary transition-colors leading-tight">
                    {topic.title}
                  </h2>
                </Link>
                <p className="font-ui text-text-secondary leading-relaxed text-lg mb-8 max-w-2xl font-light">
                  {topic.description}
                </p>
                <div className="font-ui text-xs font-semibold tracking-widest text-text-secondary uppercase">
                  {articles.length} {articles.length === 1 ? "QUESTION" : "QUESTIONS"}
                </div>
              </div>

              {sampleArticles.length > 0 && (
                <ul className="space-y-6">
                  {sampleArticles.map((article) => (
                    <li key={article.data.slug}>
                      <Link
                        to={`/${article.data.slug}`}
                        className="font-ui text-[1.125rem] text-[#2B5CA0] hover:text-[#1A3860] hover:underline underline-offset-[6px] decoration-[#2B5CA0]/40 transition-colors"
                      >
                        {article.data.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              
              {articles.length > 3 && (
                <div className="mt-8">
                  <Link 
                    to={`/topic/${topic.id}`}
                    className="font-ui text-sm font-medium text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1"
                  >
                    View all {articles.length} questions &rarr;
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
