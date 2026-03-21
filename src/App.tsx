import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import GamePlayer from './pages/GamePlayer';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import HallOfFame from './pages/HallOfFame';
import MyGames from './pages/MyGames';
import NotFound from './pages/NotFound';

function App() {
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
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play/:id" element={<GamePlayer />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
          <Route path="/my-games" element={<MyGames />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
