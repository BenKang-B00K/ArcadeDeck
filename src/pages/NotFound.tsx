import React from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import './Home.css';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <>
        <title>404 - Universe Not Found | ArcadeDeck</title>
        <meta name="robots" content="noindex, follow" />
      </>
      <Navbar />
      <main className="container" style={{ paddingTop: '150px', textAlign: 'center', flex: 1 }}>
        <h1 style={{ fontSize: '5rem', color: '#00d2ff', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '2rem' }}>Universe Not Found</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          It seems the gaming dimension you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="back-button-modern" style={{ display: 'inline-block', padding: '15px 30px', background: 'var(--primary-glow)', borderRadius: '30px', color: '#000', fontWeight: 'bold', textDecoration: 'none' }}>
          Back to ArcadeDeck Home
        </Link>
      </main>
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <div className="container footer-container">
          <p>&copy; 2026 ArcadeDeck. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
