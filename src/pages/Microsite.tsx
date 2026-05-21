import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

interface MicrositeConfig {
  slug: string;
  title: string;
  description: string;
  embedUrl: string;
  themeColor?: string;
}

interface MicrositeProps {
  config: MicrositeConfig;
}

const Microsite: React.FC<MicrositeProps> = ({ config }) => {
  useEffect(() => {
    document.body.classList.add('no-chrome');
    return () => { document.body.classList.remove('no-chrome'); };
  }, []);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = config.title;

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

    const restoreDesc = setMeta('description', config.description);

    const prevThemeEl = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    const prevTheme = prevThemeEl?.content;
    if (prevThemeEl && config.themeColor) prevThemeEl.content = config.themeColor;

    return () => {
      document.title = prevTitle;
      restoreDesc();
      if (prevThemeEl && prevTheme !== undefined) prevThemeEl.content = prevTheme;
    };
  }, [config]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100dvh',
      background: config.themeColor ?? '#000',
      zIndex: 1
    }}>
      <iframe
        src={config.embedUrl}
        title={config.title}
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

export default Microsite;
