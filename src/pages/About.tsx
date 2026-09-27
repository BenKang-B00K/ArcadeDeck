import React from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { useUiText } from '../i18n';
import './Home.css'; // Reuse common styles

const About: React.FC = () => {
  const t = useUiText();
  React.useEffect(() => {
    document.title = 'About ArcadeDeck | Our Mission & Vision';
  }, []);
  return (
    <div className="about-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <>
        <meta name="description" content="Learn more about ArcadeDeck, the ultimate destination for free high-quality browser games. Our mission is to make gaming accessible to everyone, anywhere." />
        <meta property="og:title" content="About ArcadeDeck | Our Mission & Vision" />
        <meta property="og:description" content="Learn about the team behind ArcadeDeck and our goal to provide the best free online gaming experience." />
        <meta property="og:url" content="https://arcadedeck.net/about" />
      </>
      <Navbar />
      <main className="container" style={{ paddingTop: '120px', flex: 1, color: '#fff' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>About <span style={{ color: '#00d2ff' }}>ArcadeDeck</span></h1>
        <div style={{ lineHeight: '1.8', fontSize: '1.1rem', maxWidth: '800px' }}>
          <p>Welcome to ArcadeDeck, your destination for high-quality web-based gaming. We're a small team of independent game developers and web engineers building original browser games that anyone can play instantly, on any device, with zero friction.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Our Mission</h2>
          <p>ArcadeDeck was built on a simple belief: great games should be free, instant, and available to everyone. No downloads, no sign-ups, no app store fees — just open a link and play. We design and develop original browser games spanning Tower Defense, Roguelike, RPG, Strategy, Puzzle, Casual, Arcade, and more.</p>
          <p>Every game on ArcadeDeck is crafted with care — from deep strategic auto-battlers to quick casual experiences. We prioritize gameplay quality over catalog size, so every title we ship is polished, balanced, and worth your time.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>What Makes Us Different</h2>
          <p><strong>Original Games:</strong> Most titles on ArcadeDeck are original creations, developed in-house. We don't just aggregate games from other sources — we build them from scratch with unique mechanics, art, and storylines.</p>
          <p><strong>No Accounts, No Friction:</strong> No sign-up, no email capture, no paywall. Pick a nickname if you want to comment — everything else stays in your browser.</p>
          <p><strong>Cross-Platform:</strong> Our games run on desktops, tablets, and phones. We optimize for touch controls and responsive layouts so you get the best experience regardless of device.</p>
          <p><strong>3 Languages:</strong> ArcadeDeck is localized in English, Korean, and Japanese. Game titles, descriptions, controls, tips, and world lore are translated per locale, and every locale has its own URL path for SEO.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Our Technology</h2>
          <p>ArcadeDeck is built with React 19, TypeScript, Firebase, and Vite. Games run entirely in the browser via HTML5 Canvas and WebGL — no plugins, no installs. The site is a Progressive Web App (PWA), so you can install it to your home screen for a native app-like experience and offline access to recently played titles.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Our Growing Library</h2>
          <p>We're constantly expanding the catalog. From the deck-building tower defense of <em>Mythic Defender: Heroes Returns</em> and the intense action of <em>Gate of Hell: Rise of Demons</em>, to the strategic depth of <em>Kingdom's Last Stand</em>, the quick thrills of <em>Fruit Frenzy</em>, and the brain-teasing puzzles of <em>Gem Merge</em> — there's something for every type of gamer.</p>
          <p>New games ship regularly, and existing games receive balance patches, new content, and quality-of-life improvements based on player feedback.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Community</h2>
          <p>We value our players' voices. Every game page has a comment section where you can share strategies, give feedback, or just say hello.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Support ArcadeDeck</h2>
          <p>ArcadeDeck is independently developed and runs without paywalls or required sign-ups. If you enjoy the games and want to help keep the servers running, fund new game development, or just buy the team a coffee, you can support us on Ko-fi.</p>
          <p style={{ marginTop: '1.5rem' }}>
            <a
              href="https://ko-fi.com/developer_benjamink"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #ff5e5b 0%, #ff2e63 100%)',
                color: '#fff',
                borderRadius: '999px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(255, 46, 99, 0.35)',
              }}
            >
              ♥ Support on Ko-fi
            </a>
          </p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Contact Us</h2>
          <p>Have a question, suggestion, or business inquiry? We'd love to hear from you. Visit our <Link to="/contact" style={{ color: '#00d2ff' }}>Contact page</Link> to get in touch with the team.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Verified Profiles</h2>
          <p>ArcadeDeck is registered as a public knowledge entity on Wikidata. Verified external profiles:</p>
          <ul>
            <li>
              <a
                href="https://www.wikidata.org/wiki/Q141473972"
                target="_blank"
                rel="me noopener noreferrer"
                style={{ color: '#00d2ff' }}
              >
                Wikidata: Q141473972
              </a>
            </li>
            <li>
              <a
                href="https://arcadedeck.itch.io"
                target="_blank"
                rel="me noopener noreferrer"
                style={{ color: '#00d2ff' }}
              >
                itch.io: arcadedeck.itch.io
              </a>
            </li>
            <li>
              <a
                href="https://ko-fi.com/developer_benjamink"
                target="_blank"
                rel="me noopener noreferrer"
                style={{ color: '#00d2ff' }}
              >
                Ko-fi: developer_benjamink
              </a>
            </li>
          </ul>
        </div>
      </main>
      <footer className="footer">
        <div className="container footer-container">
          <p>&copy; 2026 ArcadeDeck. {t('footerAllRights', 'All rights reserved.')}</p>
          <div className="footer-links">
            <Link to="/about" className="footer-link">{t('footerAbout', 'About Us')}</Link>
            <Link to="/privacy" className="footer-link">{t('footerPrivacy', 'Privacy Policy')}</Link>
            <Link to="/contact" className="footer-link">{t('footerContact', 'Contact')}</Link>
            <a href="https://ko-fi.com/developer_benjamink" target="_blank" rel="noopener noreferrer" className="footer-link footer-link-support">{t('footerSupport', 'Support')} ♥</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
