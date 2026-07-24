import { Link, Outlet } from "react-router-dom";
import { Search } from "lucide-react";
import { TOPICS } from "../types";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col font-ui text-text-primary bg-surface-base selection:bg-text-primary selection:text-surface-base">
      <header className="border-b border-border-subtle py-4 px-6 sticky top-0 bg-surface-base/95 backdrop-blur-sm z-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link to="/" className="text-xl font-display font-semibold tracking-tight hover:text-text-secondary transition-colors">
            The Claims Guide
          </Link>
          
          <nav className="flex items-center gap-6 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {TOPICS.map(topic => (
              <Link key={topic.id} to={`/topic/${topic.id}`} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap">
                {topic.title}
              </Link>
            ))}
            <div className="w-px h-4 bg-border-strong hidden md:block"></div>
            <Link to="/questions" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Search</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="border-t border-border-subtle py-12 px-6 mt-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-text-tertiary leading-relaxed max-w-3xl">
            <strong>Disclaimer:</strong> The information provided here is for general reference purposes only and does not constitute legal advice. Laws and regulations vary by jurisdiction and may have changed since publication. Consult a licensed attorney regarding your specific situation.
          </p>
          <p className="text-sm text-text-tertiary mt-6">
            &copy; {new Date().getFullYear()} The Claims Guide.
          </p>
        </div>
      </footer>
    </div>
  );
}
