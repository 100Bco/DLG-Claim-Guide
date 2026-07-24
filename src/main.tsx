import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Prerendered pages ship real markup inside #root, so hydrate them. During
// `vite dev` the root only holds a placeholder comment (no element children),
// so fall back to a fresh client render.
if (container.childElementCount > 0) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
