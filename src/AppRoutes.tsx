import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import TopicPage from "./components/TopicPage";
import ArticlePage from "./components/ArticlePage";
import SearchPage from "./components/SearchPage";
import NotFound from "./components/NotFound";

/**
 * Router-agnostic route tree. Wrapped by <BrowserRouter> on the client
 * (main.tsx) and by <StaticRouter> during prerendering (entry-server.tsx).
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="questions" element={<SearchPage />} />
        <Route path="topic/:topicId" element={<TopicPage />} />
        <Route path=":slug" element={<ArticlePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
