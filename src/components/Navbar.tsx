import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Gamepad2, Sun, Moon, Heart, BookOpen, MessageSquare, Swords } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useUiText } from '../i18n';
import './Navbar.css';

type Theme = 'light' | 'dark';
const THEME_KEY = 'arcadedeck-theme';

const getInitialTheme = (): Theme => {
  if (typeof document === 'undefined') return 'dark';
  const current = document.documentElement.getAttribute('data-theme');
  if (current === 'dark' || current === 'light') return current;
  return 'dark';
};

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const location = useLocation();
  const t = useUiText();

  // Auto-close menu on route change. Sync from external system (router) → local UI state.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close menu on Escape key
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMenuOpen(false); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  // Apply theme to <html> and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const closeMenu  = useCallback(() => setIsMenuOpen(false), []);
  const toggleTheme = useCallback(() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark')), []);

  // Scroll-aware shrink: write `data-scrolled` attribute (no setState → no re-render).
  useEffect(() => {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    let pending = false;
    const update = () => {
      pending = false;
      if (window.scrollY > 40) nav.setAttribute('data-scrolled', 'true');
      else nav.removeAttribute('data-scrolled');
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="logo" onClick={closeMenu}>
          <Gamepad2 size={20} className="logo-icon" aria-hidden="true" />
          Arcade<span data-text="Deck">Deck</span>
        </Link>

        {/* Right cluster: language + theme toggle + hamburger */}
        <div className="navbar-actions">
          <LanguageSwitcher />
          <button
            className={`theme-toggle theme-${theme}`}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('themeToLight', 'Switch to light mode') : t('themeToDark', 'Switch to dark mode')}
            title={theme === 'dark' ? t('themeLightLabel', 'Light mode') : t('themeDarkLabel', 'Dark mode')}
            type="button"
          >
            <span className="theme-toggle-icon theme-toggle-sun" aria-hidden="true">
              <Sun size={16} />
            </span>
            <span className="theme-toggle-icon theme-toggle-moon" aria-hidden="true">
              <Moon size={16} />
            </span>
          </button>

          <button
            className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <li><Link to="/"           className={isActive('/')           ? 'nav-active' : ''} onClick={closeMenu}>{t('navGames', 'Games')}</Link></li>
          <li><Link to="/my-games"   className={isActive('/my-games')   ? 'nav-active' : ''} onClick={closeMenu}><User size={16} aria-hidden="true" /> {t('navMyGames', 'My Games')}</Link></li>
          <li><Link to="/forum" className={isActive('/forum') ? 'nav-active' : ''} onClick={closeMenu}><MessageSquare size={16} aria-hidden="true" /> {t('navForum', 'Forum')}</Link></li>
          <li><Link to="/blog" className={isActive('/blog') ? 'nav-active' : ''} onClick={closeMenu}><BookOpen size={16} aria-hidden="true" /> {t('navBlog', 'Blog')}</Link></li>
          <li><Link to="/fractured-realm" className={isActive('/fractured-realm') ? 'nav-active' : ''} onClick={closeMenu}><Swords size={16} aria-hidden="true" /> {t('navFracturedRealm', 'Fractured Realm')}</Link></li>
          <li><a href="https://ko-fi.com/developer_benjamink" target="_blank" rel="noopener noreferrer" className="nav-support" onClick={closeMenu}><Heart size={16} aria-hidden="true" /> {t('navSupport', 'Support')}</a></li>
        </ul>
      </div>
      {/* Overlay for mobile menu */}
      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </nav>
  );
};

export default Navbar;
