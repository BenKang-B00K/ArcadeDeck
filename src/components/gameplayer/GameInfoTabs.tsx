import React from 'react';
import { BookOpen, Joystick, Lightbulb, ScrollText, Sparkles } from 'lucide-react';
import type { Game } from '../../data/games';
import type { LocaleOverlay } from '../../i18n';
import { getLocalizedString, getLocalizedArray, useUiText } from '../../i18n';

interface Props {
  game: Game;
  lang: string;
  overlay: LocaleOverlay | null;
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const GameInfoTabs: React.FC<Props> = ({ game, lang, overlay, activeTab, setActiveTab }) => {
  const t = useUiText();
  const fullDescription = getLocalizedString(game, 'fullDescription', lang, overlay);
  const controls = getLocalizedString(game, 'controls', lang, overlay);
  const tips = getLocalizedString(game, 'tips', lang, overlay);
  const lore = getLocalizedString(game, 'lore', lang, overlay);
  const features = getLocalizedArray(game, 'features', lang, overlay);

  const hasTips = tips.length > 0;
  const hasLore = lore.length > 0;
  const hasFeatures = features.length > 0;

  return (
    <div className="game-info-tabs">
      <nav className="tab-nav" aria-label={t('tabNavAriaLabel', 'Jump to game info')}>
        <a href="#section-overview" className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <BookOpen size={14} aria-hidden="true" /> {t('playerOverview', 'Overview')}
        </a>
        <a href="#section-controls" className={`tab-btn ${activeTab === 'controls' ? 'active' : ''}`} onClick={() => setActiveTab('controls')}>
          <Joystick size={14} aria-hidden="true" /> {t('playerControls', 'Controls')}
        </a>
        {hasTips && (
          <a href="#section-tips" className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`} onClick={() => setActiveTab('tips')}>
            <Lightbulb size={14} aria-hidden="true" /> {t('tabTips', 'Tips')}
          </a>
        )}
        {hasLore && (
          <a href="#section-lore" className={`tab-btn ${activeTab === 'lore' ? 'active' : ''}`} onClick={() => setActiveTab('lore')}>
            <ScrollText size={14} aria-hidden="true" /> {t('tabLore', 'Lore')}
          </a>
        )}
        {hasFeatures && (
          <a href="#section-features" className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>
            <Sparkles size={14} aria-hidden="true" /> {t('tabFeatures', 'Features')}
          </a>
        )}
      </nav>

      <section id="section-overview" className="info-section detail-card">
        <h2 className="info-section-title"><BookOpen size={18} aria-hidden="true" /> {t('playerOverview', 'Overview')}</h2>
        <div className="detail-content">{fullDescription}</div>
      </section>
      <section id="section-controls" className="info-section detail-card">
        <h2 className="info-section-title"><Joystick size={18} aria-hidden="true" /> {t('playerControls', 'Controls')}</h2>
        <div className="detail-content highlight">{controls}</div>
      </section>
      {hasTips && (
        <section id="section-tips" className="info-section detail-card">
          <h2 className="info-section-title"><Lightbulb size={18} aria-hidden="true" /> {t('playerTips', 'Pro Tips')}</h2>
          <div className="detail-content tip-highlight">{tips}</div>
        </section>
      )}
      {hasLore && (
        <section id="section-lore" className="info-section detail-card">
          <h2 className="info-section-title"><ScrollText size={18} aria-hidden="true" /> {t('playerLore', 'World Lore')}</h2>
          <div className="detail-content italic">{lore}</div>
        </section>
      )}
      {hasFeatures && (
        <section id="section-features" className="info-section detail-card">
          <h2 className="info-section-title"><Sparkles size={18} aria-hidden="true" /> {t('playerFeatures', 'Key Features')}</h2>
          <ul className="feature-tags">
            {features.map((feat, idx) => (
              <li key={idx} className="feature-tag-item">#{feat}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default GameInfoTabs;
