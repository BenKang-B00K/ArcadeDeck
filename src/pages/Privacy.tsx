import React from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import './Home.css';

const Privacy: React.FC = () => {
  return (
    <div className="privacy-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <>
        <title>Privacy Policy | ArcadeDeck</title>
        <meta name="description" content="Read our privacy policy to understand how ArcadeDeck collects, uses, and protects your data, including cookies, Google AdSense, Google Analytics, and Firebase services." />
        <meta property="og:title" content="Privacy Policy | ArcadeDeck" />
        <meta property="og:url" content="https://arcadedeck.net/privacy" />
      </>
      <Navbar />
      <main className="container" style={{ paddingTop: '120px', flex: 1, color: 'var(--text-primary)', paddingBottom: '60px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Privacy <span style={{ color: '#00d2ff' }}>Policy</span></h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Last Updated: April 16, 2026</p>
        <div style={{ lineHeight: '1.8', fontSize: '1rem', maxWidth: '900px', background: 'var(--surface-2)', padding: '40px', borderRadius: '15px' }}>
          <h2>1. Introduction</h2>
          <p>ArcadeDeck ("we," "us," or "our") operates the website <strong>arcadedeck.net</strong> (the "Service"). This Privacy Policy explains what information we collect when you use ArcadeDeck, how we use it, who we share it with, and the choices you have. By accessing or using the Service, you agree to the practices described below.</p>

          <h2 style={{ marginTop: '24px' }}>2. Information We Collect</h2>
          <p>We collect only the minimum information needed to operate the Service.</p>
          <h3 style={{ marginTop: '16px', color: '#00d2ff' }}>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Gamer ID (nickname):</strong> A self-chosen display name shown on leaderboards and comments. We never ask for your real name.</li>
            <li><strong>Game scores:</strong> Scores submitted from the games you play, associated with your Gamer ID.</li>
            <li><strong>Comments:</strong> Any text you voluntarily post in a game's comment section.</li>
          </ul>
          <h3 style={{ marginTop: '16px', color: '#00d2ff' }}>2.2 Information Collected Automatically</h3>
          <ul>
            <li><strong>Browser & device data:</strong> User-agent, screen size, language, and approximate location derived from IP address — collected by Google Analytics for traffic measurement.</li>
            <li><strong>Cookies and local storage:</strong> Small data files stored in your browser to remember your Gamer ID, recently played games, language preference, and like state. See Section 4 for details.</li>
            <li><strong>Advertising identifiers:</strong> Google AdSense and its partners may set cookies to deliver and measure ads. See Section 5.</li>
          </ul>

          <h2 style={{ marginTop: '24px' }}>3. How We Use Your Information</h2>
          <ul>
            <li>Operate the Service (display leaderboards, save preferences, render comments).</li>
            <li>Maintain and improve the Service (debug errors, measure usage trends).</li>
            <li>Serve relevant advertisements through Google AdSense.</li>
            <li>Detect, prevent, and address abuse, spam, or unauthorized use.</li>
            <li>Comply with applicable legal obligations.</li>
          </ul>
          <p>We do <strong>not</strong> sell your personal information.</p>

          <h2 style={{ marginTop: '24px' }}>4. Cookies and Local Storage</h2>
          <p>We use the following categories of client-side storage:</p>
          <ul>
            <li><strong>Strictly necessary (localStorage):</strong> Stores your Gamer ID, language toggle, recently played games, and "liked" games. Cannot be disabled without breaking core features.</li>
            <li><strong>Analytics (cookies set by Google Analytics):</strong> Helps us understand aggregate traffic. See <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" style={{ color: '#00d2ff' }}>How Google uses data</a>.</li>
            <li><strong>Advertising (cookies set by Google AdSense and ad partners):</strong> Used to serve and measure ads, and may be used for personalization where permitted.</li>
          </ul>
          <p>You can clear cookies and localStorage at any time through your browser's settings. Doing so will reset your Gamer ID and game preferences.</p>

          <h2 style={{ marginTop: '24px' }}>5. Third-Party Services</h2>
          <p>We rely on the following third-party services. Each has its own privacy policy that governs the data they collect.</p>
          <ul>
            <li><strong>Google AdSense</strong> — serves ads on the Service. Google, as a third-party vendor, uses cookies to serve ads based on your visit to this and other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#00d2ff' }}>Google Ads Settings</a>, or use <a href="https://www.aboutads.info/" target="_blank" rel="noopener noreferrer" style={{ color: '#00d2ff' }}>aboutads.info</a> to opt out of third-party vendor cookies.</li>
            <li><strong>Google Analytics</strong> — measures site traffic and engagement. Data is processed per the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#00d2ff' }}>Google Privacy Policy</a>.</li>
            <li><strong>Google Firebase (Firestore)</strong> — stores leaderboard scores and comments. Hosted by Google; subject to the <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#00d2ff' }}>Firebase Privacy Notice</a>.</li>
            <li><strong>Google Fonts</strong> — serves typography assets used on the Service.</li>
          </ul>

          <h2 style={{ marginTop: '24px' }}>6. Children's Privacy</h2>
          <p>The Service is not directed at children under the age of 13 (or the equivalent minimum age in your jurisdiction). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us at <a href="mailto:help@arcadedeck.net" style={{ color: '#00d2ff' }}>help@arcadedeck.net</a> and we will take steps to remove it.</p>

          <h2 style={{ marginTop: '24px' }}>7. Your Rights (GDPR / CCPA)</h2>
          <p>Depending on where you live, you may have the right to:</p>
          <ul>
            <li>Request access to the personal data we hold about you.</li>
            <li>Request correction or deletion of your data.</li>
            <li>Object to or restrict certain processing.</li>
            <li>Withdraw consent for personalized advertising at any time.</li>
            <li>Lodge a complaint with your local data protection authority.</li>
          </ul>
          <p>To exercise any of these rights, email us at <a href="mailto:help@arcadedeck.net" style={{ color: '#00d2ff' }}>help@arcadedeck.net</a>. Because we identify users only by self-chosen Gamer IDs, please include your Gamer ID and the affected game(s) so we can locate the relevant records.</p>

          <h2 style={{ marginTop: '24px' }}>8. Data Retention</h2>
          <p>Leaderboard scores and comments are retained indefinitely so the competitive history of the Service remains intact. You may request deletion of records associated with your Gamer ID at any time (see Section 7).</p>

          <h2 style={{ marginTop: '24px' }}>9. Data Security</h2>
          <p>We use industry-standard security measures provided by Google Cloud / Firebase to protect data in transit and at rest. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

          <h2 style={{ marginTop: '24px' }}>10. International Transfers</h2>
          <p>Our infrastructure is hosted by Google. Data may be processed in countries outside your country of residence, including the United States. By using the Service, you consent to such transfers.</p>

          <h2 style={{ marginTop: '24px' }}>11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. The "Last Updated" date at the top reflects the most recent revision. Material changes will be highlighted on the homepage when reasonably possible. Continued use of the Service after changes take effect constitutes acceptance of the revised policy.</p>

          <h2 style={{ marginTop: '24px' }}>12. Contact</h2>
          <p>For any questions about this Privacy Policy or our data practices, contact us at:</p>
          <p style={{ fontSize: '1.2rem', color: '#00d2ff' }}>help@arcadedeck.net</p>
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

export default Privacy;
