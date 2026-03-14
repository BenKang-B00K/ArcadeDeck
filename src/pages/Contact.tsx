import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const Contact: React.FC = () => {
  return (
    <div className="contact-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '120px', flex: 1, color: '#fff' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Contact <span style={{ color: '#00d2ff' }}>Us</span></h1>
        <div style={{ lineHeight: '1.8', fontSize: '1.1rem', maxWidth: '800px' }}>
          <p>Have a question, feedback, or a game suggestion? We'd love to hear from you!</p>
          
          <div style={{ marginTop: '40px', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '15px' }}>
            <h3 style={{ color: '#00d2ff' }}>Support Email</h3>
            <p style={{ fontSize: '1.5rem' }}>help@arcadedeck.net</p>
            
            <h3 style={{ marginTop: '30px', color: '#00d2ff' }}>Collaboration</h3>
            <p>If you are a developer and want to feature your game on ArcadeDeck, reach out to biz@arcadedeck.net.</p>
          </div>

          <p style={{ marginTop: '40px' }}>We typically respond within 24-48 hours during business days.</p>
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
