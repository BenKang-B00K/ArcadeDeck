import React from 'react';
import { useUiText } from '../i18n';

const RouteFallback: React.FC = () => {
  const t = useUiText();
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <div className="route-fallback-ring" aria-hidden="true" />
      <span>{t('pageLoading', 'Loading...')}</span>
    </div>
  );
};

export default RouteFallback;
