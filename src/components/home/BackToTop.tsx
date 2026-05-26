import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useUiText } from '../../i18n';
import './BackToTop.css';

const BackToTop: React.FC = () => {
  const t = useUiText();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let pending = false;
    const update = () => {
      pending = false;
      setVisible(window.scrollY > 600);
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      aria-label={t('homeBackToTopAria', 'Back to top')}
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
};

export default BackToTop;
