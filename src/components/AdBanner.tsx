import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AD_CLIENT_ID = "ca-pub-6365186183616155";

interface AdBannerProps {
  slot?: string;
  style?: React.CSSProperties;
  format?: 'auto' | 'fluid' | 'rectangle';
  placeholderText?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ slot, style, format = 'auto', placeholderText = "ADVERTISEMENT SPACE" }) => {
  const adPushed = useRef(false);

  useEffect(() => {
    // Only proceed if a slot is provided
    if (!slot) return;

    // Load AdSense script dynamically if not already present
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT_ID}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // Push the ad
    if (!adPushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adPushed.current = true;
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [slot]);

  // Filter out margin from style for the placeholder to avoid double margin
  const { margin, marginTop, marginBottom, marginLeft, marginRight, ...otherStyles } = style || {};

  // Placeholder style
  const placeholderStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px dashed rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: 'rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    minHeight: '120px',
    width: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '700',
    ...otherStyles
  };

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
      {slot ? (
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
      ) : (
        <div style={placeholderStyle}>
           {placeholderText}
        </div>
      )}
    </div>
  );
};

export default AdBanner;
