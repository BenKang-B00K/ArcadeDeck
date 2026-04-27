import React from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import './Home.css'; // Reuse common styles

const About: React.FC = () => {
  return (
    <div className="about-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <>
        <title>About ArcadeDeck | Our Mission & Vision</title>
        <meta name="description" content="Learn more about ArcadeDeck, the ultimate destination for free high-quality browser games. Our mission is to make gaming accessible to everyone, anywhere." />
        <meta property="og:title" content="About ArcadeDeck | Our Mission & Vision" />
        <meta property="og:description" content="Learn about the team behind ArcadeDeck and our goal to provide the best free online gaming experience." />
        <meta property="og:url" content="https://arcadedeck.net/about" />
      </>
      <Navbar />
      <main className="container" style={{ paddingTop: '120px', flex: 1, color: '#fff' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>About <span style={{ color: '#00d2ff' }}>ArcadeDeck</span></h1>
        <div style={{ lineHeight: '1.8', fontSize: '1.1rem', maxWidth: '800px' }}>
          <p>Welcome to ArcadeDeck, your ultimate destination for high-quality web-based gaming experiences. We are a small team of independent game developers and web engineers passionate about creating fun, accessible games that anyone can enjoy instantly in their browser.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Our Mission</h2>
          <p>ArcadeDeck was built on a simple belief: great games should be free, instant, and available to everyone. No downloads, no sign-ups, no app store fees — just open a link and play. We design and develop original browser games spanning multiple genres including Tower Defense, Roguelike, RPG, Strategy, Puzzle, Casual, Arcade, and more.</p>
          <p>Every game on our platform is crafted with care — from deep strategic auto-battlers to quick casual experiences. We focus on gameplay quality over quantity, ensuring each title delivers a polished and engaging experience.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>What Makes Us Different</h2>
          <p><strong>Original Games:</strong> Most titles on ArcadeDeck are original creations, developed in-house by our team. We don't just aggregate games from other sources — we build them from scratch with unique mechanics, art, and storylines.</p>
          <p><strong>Global Leaderboards:</strong> Every game features real-time leaderboards so you can compete with players worldwide. Your scores are tracked, ranked, and archived monthly in our Hall of Fame.</p>
          <p><strong>Cross-Platform:</strong> Our games work on desktops, tablets, and mobile phones. We optimize for touch controls and responsive layouts so you get the best experience regardless of your device.</p>
          <p><strong>Bilingual Support:</strong> ArcadeDeck supports both English and Korean, making our games accessible to a wider audience. Game descriptions, controls, tips, and world lore are available in both languages.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Our Technology</h2>
          <p>ArcadeDeck is built with modern web technologies including React, TypeScript, Firebase, and Vite. Our games run entirely in the browser using HTML5 Canvas and WebGL, delivering smooth performance without plugins. The platform is a Progressive Web App (PWA), meaning you can install it to your home screen for a native app-like experience.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Our Growing Library</h2>
          <p>We are constantly expanding our game catalog. From the intense action of <em>Gate of Hell: Rise of Demons</em> to the strategic depth of <em>Kingdom's Last Stand</em>, from the quick thrills of <em>Fruit Frenzy</em> to the brain-teasing puzzles of <em>Gem Merge</em> — there's something for every type of gamer.</p>
          <p>New games are added regularly, and existing games receive updates with new content, balance changes, and quality-of-life improvements based on player feedback.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Community</h2>
          <p>We value our players' voices. Every game page has a comment section where you can share strategies, give feedback, or just say hello. Our leaderboards create a competitive yet friendly community where players push each other to improve.</p>

          <h2 style={{ marginTop: '3rem', color: '#00d2ff' }}>Contact Us</h2>
          <p>Have a question, suggestion, or business inquiry? We'd love to hear from you. Visit our <Link to="/contact" style={{ color: '#00d2ff' }}>Contact page</Link> to get in touch with the team.</p>
        </div>
      </main>
      <footer className="footer">
        <div className="container footer-container">
          <p>&copy; 2026 ArcadeDeck. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
