import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

// The one microsite this site hosts. A second one earns a config object; one
// does not.
const TITLE = 'The Fractured Realm — Web MMO';
const DESCRIPTION = 'Explore The Fractured Realm, a browser-based MMO adventure on ArcadeDeck. Quest, fight, and level up alongside other players — no download or install required.';
const EMBED_URL = 'https://the-fractured-realm-webmmo.pages.dev/';
const THEME_COLOR = '#0a0a12';

const FracturedRealm: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('no-chrome');
    return () => { document.body.classList.remove('no-chrome'); };
  }, []);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = TITLE;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      const prev = el.content;
      el.content = content;
      return () => { el!.content = prev; };
    };

    const restoreDesc = setMeta('description', DESCRIPTION);

    const prevThemeEl = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    const prevTheme = prevThemeEl?.content;
    if (prevThemeEl) prevThemeEl.content = THEME_COLOR;

    return () => {
      document.title = prevTitle;
      restoreDesc();
      if (prevThemeEl && prevTheme !== undefined) prevThemeEl.content = prevTheme;
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100dvh',
      background: THEME_COLOR,
      zIndex: 1
    }}>
      <iframe
        src={EMBED_URL}
        title={TITLE}
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          display: 'block'
        }}
        allow="fullscreen; autoplay; gamepad; clipboard-write"
        allowFullScreen
      />
      <Link
        to="/"
        aria-label="Back to ArcadeDeck"
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.55)',
          color: '#fff',
          borderRadius: 999,
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 600,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <Home size={14} aria-hidden="true" /> ArcadeDeck
      </Link>
    </div>
  );
};

export default FracturedRealm;
