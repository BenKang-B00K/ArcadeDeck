import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import InstallPWA from './components/InstallPWA';
import UpdateNotification from './components/UpdateNotification';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import RouteTransition from './components/RouteTransition';
import { ToastProvider } from './contexts/ToastContext';

// Lazy-load all pages except Home so the initial bundle stays small.
// Each page's JS (and its unique imports) loads only when first navigated to.
const GamePlayer  = lazy(() => import('./pages/GamePlayer'));
const About       = lazy(() => import('./pages/About'));
const Privacy     = lazy(() => import('./pages/Privacy'));
const Contact     = lazy(() => import('./pages/Contact'));
const HallOfFame  = lazy(() => import('./pages/HallOfFame'));
const MyGames     = lazy(() => import('./pages/MyGames'));
const Blog        = lazy(() => import('./pages/Blog'));
const BlogPost    = lazy(() => import('./pages/BlogPost'));
const BlogTag     = lazy(() => import('./pages/BlogTag'));
const Genre       = lazy(() => import('./pages/Genre'));
const NotFound    = lazy(() => import('./pages/NotFound'));

interface AppProps {
  basename?: string;
}

function App({ basename = '/' }: AppProps) {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <Router basename={basename}>
      <ToastProvider>
        <div className="app-main-layout">
          <ScrollToTop />
          <ErrorBoundary>
          <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
            <RouteTransition>
              <Routes>
                <Route path="/"             element={<Home />} />
                <Route path="/play/:slug"    element={<GamePlayer />} />
                <Route path="/about"        element={<About />} />
                <Route path="/privacy"      element={<Privacy />} />
                <Route path="/contact"      element={<Contact />} />
                <Route path="/hall-of-fame" element={<HallOfFame />} />
                <Route path="/my-games"     element={<MyGames />} />
                <Route path="/blog"             element={<Blog />} />
                <Route path="/blog/tag/:tag"    element={<BlogTag />} />
                <Route path="/blog/:slug"       element={<BlogPost />} />
                <Route path="/genre/:slug"      element={<Genre />} />
                <Route path="*"             element={<NotFound />} />
              </Routes>
            </RouteTransition>
          </Suspense>
          </ErrorBoundary>
          <InstallPWA />
          <UpdateNotification />
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
