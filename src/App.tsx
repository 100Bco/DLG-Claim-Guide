import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import TopicPage from "./components/TopicPage";
import ArticlePage from "./components/ArticlePage";
import SearchPage from "./components/SearchPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="questions" element={<SearchPage />} />
          <Route path="topic/:topicId" element={<TopicPage />} />
          <Route path=":slug" element={<ArticlePage />} />
        </Route>
      </Routes>
    </Router>
  );
}
