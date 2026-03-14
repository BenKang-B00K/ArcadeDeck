import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const Privacy: React.FC = () => {
  return (
    <div className="privacy-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '120px', flex: 1, color: '#fff', paddingBottom: '60px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Privacy <span style={{ color: '#00d2ff' }}>Policy</span></h1>
        <div style={{ lineHeight: '1.8', fontSize: '1rem', maxWidth: '900px', background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '15px' }}>
          <h2>1. Introduction</h2>
          <p>At ArcadeDeck, we value your privacy. This policy explains how we collect and use information when you visit our website.</p>
          
          <h2 style={{ marginTop: '20px' }}>2. Google AdSense & Cookies</h2>
          <p>We use Google AdSense to serve ads. Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.</p>
          <p>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" style={{ color: '#00d2ff' }}>Google Ads Settings</a>.</p>

          <h2 style={{ marginTop: '20px' }}>3. Data Collection</h2>
          <p>We do not collect personally identifiable information unless voluntarily provided by the user (e.g., setting a Gamer ID). Game scores and leaderboards are stored to enhance the competitive experience.</p>

          <h2 style={{ marginTop: '20px' }}>4. Security</h2>
          <p>We implement security measures to protect your data, but please remember that no method of transmission over the internet is 100% secure.</p>

          <h2 style={{ marginTop: '20px' }}>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at help@arcadedeck.net.</p>
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

export default Privacy;
