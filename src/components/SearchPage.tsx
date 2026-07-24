import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Filter } from "lucide-react";
import { TOPICS } from "../types";
import { getAllArticles } from "../lib/content";
import { cn } from "../lib/utils";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialTopic = searchParams.get("topic") || "all";

  const [query, setQuery] = useState(initialQuery);
  const [activeTopic, setActiveTopic] = useState(initialTopic);

  const articles = useMemo(() => getAllArticles(), []);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesTopic = activeTopic === "all" || article.data.topic === activeTopic;
      const q = query.toLowerCase();
      const matchesQuery = !query || 
        article.data.title.toLowerCase().includes(q) || 
        article.content.toLowerCase().includes(q) ||
        article.data.short_answer.toLowerCase().includes(q);
      
      return matchesTopic && matchesQuery;
    });
  }, [articles, query, activeTopic]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set("q", newQuery);
    } else {
      params.delete("q");
    }
    setSearchParams(params, { replace: true });
  };

  const handleTopicChange = (topicId: string) => {
    setActiveTopic(topicId);
    
    const params = new URLSearchParams(searchParams);
    if (topicId !== "all") {
      params.set("topic", topicId);
    } else {
      params.delete("topic");
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row gap-12">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="sticky top-24">
          <div className="mb-8">
            <h2 className="font-ui text-sm font-semibold tracking-widest text-text-tertiary uppercase flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4" />
              Filter by Topic
            </h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleTopicChange("all")}
                className={cn(
                  "text-left px-4 py-2 rounded-sm font-medium transition-colors text-sm",
                  activeTopic === "all" 
                    ? "bg-text-primary text-surface-base" 
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                )}
              >
                All Topics
              </button>
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicChange(topic.id)}
                  className={cn(
                    "text-left px-4 py-2 rounded-sm font-medium transition-colors text-sm",
                    activeTopic === topic.id 
                      ? "bg-text-primary text-surface-base" 
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                  )}
                >
                  {topic.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow">
        <div role="search" className="relative mb-12">
          <label htmlFor="questions-search" className="sr-only">
            Search all questions
          </label>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
          </div>
          <input
            id="questions-search"
            name="q"
            type="search"
            enterKeyHint="search"
            className="block w-full pl-12 pr-4 py-4 bg-surface-elevated border border-border-strong rounded-sm text-lg focus:border-text-primary transition-colors placeholder:text-text-tertiary"
            placeholder="Search all questions..."
            value={query}
            onChange={handleQueryChange}
          />
        </div>

        <div className="mb-6 flex justify-between items-center text-sm font-ui text-text-tertiary">
          <span aria-live="polite">Showing {filteredArticles.length} {filteredArticles.length === 1 ? "question" : "questions"}</span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="py-12 text-center border border-border-subtle rounded-sm border-dashed">
            <p className="text-text-secondary font-medium text-lg">No questions found matching your criteria.</p>
            <button 
              onClick={() => {
                setQuery("");
                setActiveTopic("all");
                setSearchParams({});
              }}
              className="mt-4 text-text-primary hover:underline underline-offset-4 decoration-border-strong"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="space-y-10">
            {filteredArticles.map((article) => {
              const topic = TOPICS.find(t => t.id === article.data.topic);
              
              return (
                <li key={article.data.slug} className="group">
                  <Link to={`/${article.data.slug}`} className="block">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-ui text-xs font-semibold tracking-wider text-text-secondary uppercase">
                        {topic?.title || article.data.topic}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-medium mb-3 group-hover:underline underline-offset-4 decoration-border-strong text-text-primary">
                      {article.data.title}
                    </h3>
                    <p className="font-body text-text-secondary leading-relaxed text-lg line-clamp-2">
                      {article.data.excerpt || article.data.short_answer}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
