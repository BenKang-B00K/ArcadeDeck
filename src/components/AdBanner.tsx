import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AD_CLIENT_ID = "ca-pub-2461804849200179";
// Set to true once AdSense site approval moves from "Getting ready" to "Ready".
// While false the component renders nothing — no script load, no adsbygoogle.push,
// which avoids 400 Bad Request console noise during review. It also keeps the
// dashed "ADVERTISEMENT SPACE" boxes off the live site: empty ad frames read as
// an unfinished page to an AdSense reviewer.
const ADSENSE_APPROVED = false;

interface AdBannerProps {
  slot?: string;
  style?: React.CSSProperties;
  format?: 'auto' | 'fluid' | 'rectangle';
}

const AdBanner: React.FC<AdBannerProps> = ({ slot, style, format = 'auto' }) => {
  const adPushed = useRef(false);

  useEffect(() => {
    if (!slot) return;
    if (!ADSENSE_APPROVED) return;

    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT_ID}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    if (!adPushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adPushed.current = true;
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [slot]);

  // Nothing to render until the account is approved. Reserving an empty box
  // would only advertise that the page is unfinished.
  if (!slot || !ADSENSE_APPROVED) return null;

  // Filter out margin from style so the container does not double it up.
  const { margin, marginTop, marginBottom, marginLeft, marginRight } = style || {};

  return (
    <div className="ad-container" style={{
      width: '100%',
      textAlign: 'center',
      margin: margin || '20px 0',
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      minHeight: '120px'
    }}>
      <ins className="adsbygoogle"
           style={{
             display: 'block',
             width: '100%',
             height: 'auto',
             minHeight: '120px',
             textDecoration: 'none'
           }}
           data-ad-client={AD_CLIENT_ID}
           data-ad-slot={slot}
           data-ad-format={format}
           data-full-width-responsive="true">
      </ins>
    </div>
  );
};

export default AdBanner;
