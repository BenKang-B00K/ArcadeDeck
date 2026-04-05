import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Auto-close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close menu on Escape key
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMenuOpen(false); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const closeMenu  = useCallback(() => setIsMenuOpen(false), []);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="logo" onClick={closeMenu}>
          Arcade<span>Deck</span>
        </Link>

        {/* Hamburger Menu Toggle */}
        <button className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <li><Link to="/"           className={isActive('/')           ? 'nav-active' : ''} onClick={closeMenu}>Home</Link></li>
          <li><Link to="/my-games"   className={isActive('/my-games')   ? 'nav-active' : ''} onClick={closeMenu}>👤 My Games</Link></li>
          <li><Link to="/hall-of-fame" className={isActive('/hall-of-fame') ? 'nav-active' : ''} onClick={closeMenu}>🏆 Hall of Fame</Link></li>
          <li><Link to="/about"      className={isActive('/about')      ? 'nav-active' : ''} onClick={closeMenu}>About</Link></li>
          <li><Link to="/privacy"    className={isActive('/privacy')    ? 'nav-active' : ''} onClick={closeMenu}>Privacy</Link></li>
          <li><Link to="/contact"    className={isActive('/contact')    ? 'nav-active' : ''} onClick={closeMenu}>Contact</Link></li>
        </ul>
      </div>
      {/* Overlay for mobile menu */}
      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </nav>
  );
};

export default Navbar;
