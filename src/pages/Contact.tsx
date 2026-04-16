import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import './Home.css';

const Contact: React.FC = () => {
  return (
    <div className="contact-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>Contact Us | ArcadeDeck Support & Feedback</title>
        <meta name="description" content="Get in touch with the ArcadeDeck team for support, feedback, or game submissions. We'd love to hear from you!" />
        <meta property="og:title" content="Contact Us | ArcadeDeck" />
        <meta property="og:url" content="https://arcadedeck.net/contact" />
      </Helmet>
      <Navbar />
      <div className="container" style={{ paddingTop: '120px', flex: 1, color: '#fff' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Contact <span style={{ color: '#00d2ff' }}>Us</span></h1>
        <div style={{ lineHeight: '1.8', fontSize: '1.1rem', maxWidth: '800px' }}>
          <p>We love hearing from our players. Whether you spotted a bug, want to suggest a feature, have a question about a game, or want to talk about a partnership, the inboxes below all reach a human.</p>

          <div style={{ marginTop: '40px', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '15px' }}>
            <h3 style={{ color: '#00d2ff' }}>Player Support &amp; Bug Reports</h3>
            <p>For account issues, leaderboard problems, gameplay bugs, or general questions:</p>
            <p style={{ fontSize: '1.4rem' }}><a href="mailto:help@arcadedeck.net" style={{ color: '#fff', textDecoration: 'none' }}>help@arcadedeck.net</a></p>
            <p style={{ fontSize: '0.95rem', opacity: 0.8 }}>When reporting a bug, please include: your Gamer ID, the game name, the device and browser you were using, and a brief description of what went wrong. Screenshots or short screen recordings help us reproduce the problem faster.</p>

            <h3 style={{ marginTop: '30px', color: '#00d2ff' }}>Business &amp; Game Submissions</h3>
            <p>If you're an indie developer interested in publishing your browser game on ArcadeDeck, or you'd like to discuss advertising or sponsorship opportunities:</p>
            <p style={{ fontSize: '1.4rem' }}><a href="mailto:biz@arcadedeck.net" style={{ color: '#fff', textDecoration: 'none' }}>biz@arcadedeck.net</a></p>

            <h3 style={{ marginTop: '30px', color: '#00d2ff' }}>Privacy &amp; Data Requests</h3>
            <p>For data access, deletion, or any privacy-related question covered by our <Link to="/privacy" style={{ color: '#00d2ff' }}>Privacy Policy</Link>, write to <a href="mailto:help@arcadedeck.net" style={{ color: '#00d2ff' }}>help@arcadedeck.net</a> with your Gamer ID and the affected game(s).</p>
          </div>

          <h2 style={{ marginTop: '50px', color: '#00d2ff' }}>Response Times</h2>
          <p>We typically respond within 24–48 hours on business days. Replies may take longer on weekends and public holidays. If your message is time-sensitive (e.g., an inappropriate comment or leaderboard entry that needs moderation), please mention "urgent" in the subject line.</p>

          <h2 style={{ marginTop: '40px', color: '#00d2ff' }}>Frequently Asked Questions</h2>
          <p><strong>Are the games really free?</strong> Yes. Every game on ArcadeDeck is free to play with no downloads, sign-ups, or paywalls. The site is supported by ads.</p>
          <p><strong>Why can't I see my score on the leaderboard?</strong> Scores are submitted automatically when a game ends. If yours doesn't appear, try refreshing the page. If the issue persists, email us with your Gamer ID and the game name.</p>
          <p><strong>How do I change my Gamer ID?</strong> Click the edit icon next to your name on the homepage. Past leaderboard entries keep the name they were submitted under.</p>
          <p><strong>Can I submit my own game?</strong> Yes — see the Business &amp; Game Submissions email above. Include a playable build link, a short description, and your contact info.</p>
        </div>
      </div>
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

export default Contact;
