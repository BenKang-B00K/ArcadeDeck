import React from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { games } from '../data/games';
import { useUiText } from '../i18n';
import './Home.css'; // Reuse common styles

const ABOUT_DESCRIPTION = 'ArcadeDeck is a one-person indie game studio: every free browser game on the site is designed, built and updated by a solo developer working in Godot and HTML5 since 2025.';
const GAME_COUNT = games.filter(g => g.kind !== 'app').length;
const linkStyle: React.CSSProperties = { color: '#00d2ff' };
const play = (slug: string, title: string) => <Link to={`/play/${slug}`} style={linkStyle}>{title}</Link>;

const About: React.FC = () => {
  const t = useUiText();
  React.useEffect(() => {
    document.title = 'About | ArcadeDeck';
  }, []);
  return (
    <div className="about-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <>
        <meta name="description" content={ABOUT_DESCRIPTION} />
        <meta property="og:title" content="About | ArcadeDeck" />
        <meta property="og:description" content={ABOUT_DESCRIPTION} />
        <meta property="og:url" content="https://arcadedeck.net/about" />
      </>
      <Navbar />
      <main className="container" style={{ paddingTop: '120px', flex: 1, color: '#fff' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>About <span style={{ color: '#00d2ff' }}>ArcadeDeck</span></h1>
        <div style={{ lineHeight: '1.8', fontSize: '1.1rem', maxWidth: '800px' }}>
          <p>ArcadeDeck is a one-person indie game studio. Every game in the catalogue — {GAME_COUNT} of them today — is designed, programmed, tested and updated by one solo developer, who started making games in 2025 and works in Godot and HTML5. Nothing here is licensed, scraped or embedded from another portal: if a game is listed on ArcadeDeck, it was made for ArcadeDeck.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>How the Games Are Made</h2>
          <p>Each game starts as a small prototype and ships only once it plays well in a browser tab, on a desktop and on a phone. Games are built either in Godot or directly in HTML5 with TypeScript, Canvas and WebGL, and they run without plugins or installs.</p>
          <p>Launch is not the end. Balance patches, new modes, controller support and bug fixes keep coming after release, and every one is logged on the <Link to="/patchnote" style={linkStyle}>Patch Notes</Link> page. Longer write-ups — launch posts, design notes and update breakdowns — go on the <Link to="/blog" style={linkStyle}>Blog</Link>.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>What You Will Find</h2>
          <p>Tower defense like {play('flux-tower-defense', 'Flux Tower Defense')} and {play('mythic-defenders-heroes-returns', 'Mythic Defenders: Heroes Returns')}; roguelikes and auto-battlers set in the shared Kingdom of Ashes world, starting with {play('kingdom-of-ashes-fallen-era', 'Kingdom of Ashes - Fallen Era')}; arcade games such as {play('climb-up', 'Climb Up!')} and {play('skyfall', 'Skyfall')}; a logic-gate puzzle in {play('only-nand', 'Only NAND')}; Gomoku with seven AI levels in {play('omok', 'OMOK')}; and party games for a group around one screen, like {play('ladder-game', 'Ladder Game')} and {play('trick-or-lose', 'Trick or Lose')}.</p>
          <p>Some titles — {play('kingdom-of-ashes-fallen-era', 'Kingdom of Ashes - Fallen Era')}, {play('shadow-runner', 'Shadow Runner')} and {play('flux-tower-defense', 'Flux Tower Defense')} — also have full versions on Steam. The browser editions stay free.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>No Accounts, No Friction</h2>
          <p>No sign-up, no email capture, no paywall. Pick a nickname if you want to comment — everything else, including your personal bests, stays in your browser.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Desktop and Mobile</h2>
          <p>Games are checked at phone sizes for touch controls, layout and screen rotation. The few that need a keyboard or a gamepad are labelled on their page. The site is also a Progressive Web App, so you can add it to your home screen.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Three Languages</h2>
          <p>ArcadeDeck is localized in English, Korean, and Japanese. Game titles, descriptions, controls and tips are translated per locale, and every locale has its own URL.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Community</h2>
          <p>Every game page has a comment section for strategies, feedback and bug reports. Personal bests earn Deck XP, which ranks you on the global leaderboard.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Support ArcadeDeck</h2>
          <p>ArcadeDeck is independently developed and runs without paywalls or required sign-ups. If you enjoy the games and want to help keep the servers running, fund the next game, or just buy the developer a coffee, you can support ArcadeDeck on Ko-fi.</p>
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

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Contact</h2>
          <p>Questions, bug reports or business inquiries: email <a href="mailto:help@arcadedeck.net" style={linkStyle}>help@arcadedeck.net</a> or use the <Link to="/contact" style={linkStyle}>Contact page</Link>.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Verified Profiles</h2>
          <p>ArcadeDeck is registered as a public knowledge entity on Wikidata. Verified external profiles:</p>
          <ul>
            <li>
              <a
                href="https://www.wikidata.org/wiki/Q141473972"
                target="_blank"
                rel="me noopener noreferrer"
                style={linkStyle}
              >
                Wikidata: Q141473972
              </a>
            </li>
            <li>
              <a
                href="https://arcadedeck.itch.io"
                target="_blank"
                rel="me noopener noreferrer"
                style={linkStyle}
              >
                itch.io: arcadedeck.itch.io
              </a>
            </li>
            <li>
              <a
                href="https://ko-fi.com/developer_benjamink"
                target="_blank"
                rel="me noopener noreferrer"
                style={linkStyle}
              >
                Ko-fi: developer_benjamink
              </a>
            </li>
            <li>
              <a
                href="https://www.moddb.com/company/arcadedeck"
                target="_blank"
                rel="me noopener noreferrer"
                style={linkStyle}
              >
                ModDB: ArcadeDeck
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
