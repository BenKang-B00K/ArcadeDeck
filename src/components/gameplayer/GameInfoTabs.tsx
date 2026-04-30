import React from 'react';
import { BookOpen, Joystick, Lightbulb, ScrollText, Sparkles } from 'lucide-react';
import type { Game } from '../../data/games';

interface Props {
  game: Game;
  lang: 'en' | 'ko';
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const GameInfoTabs: React.FC<Props> = ({ game, lang, activeTab, setActiveTab }) => {
  const hasTips = !!(game.tips || game.tipsKo);
  const hasLore = !!(game.lore || game.loreKo);
  const hasFeatures = (game.features?.length ?? 0) > 0;

  return (
    <div className="game-info-tabs">
      <nav className="tab-nav" aria-label={lang === 'ko' ? '게임 정보 바로가기' : 'Jump to game info'}>
        <a href="#section-overview" className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <BookOpen size={14} aria-hidden="true" /> {lang === 'ko' ? '개요' : 'Overview'}
        </a>
        <a href="#section-controls" className={`tab-btn ${activeTab === 'controls' ? 'active' : ''}`} onClick={() => setActiveTab('controls')}>
          <Joystick size={14} aria-hidden="true" /> {lang === 'ko' ? '조작법' : 'Controls'}
        </a>
        {hasTips && (
          <a href="#section-tips" className={`tab-btn ${activeTab === 'tips' ? 'active' : ''}`} onClick={() => setActiveTab('tips')}>
            <Lightbulb size={14} aria-hidden="true" /> {lang === 'ko' ? '팁' : 'Tips'}
          </a>
        )}
        {hasLore && (
          <a href="#section-lore" className={`tab-btn ${activeTab === 'lore' ? 'active' : ''}`} onClick={() => setActiveTab('lore')}>
            <ScrollText size={14} aria-hidden="true" /> {lang === 'ko' ? '세계관' : 'Lore'}
          </a>
        )}
        {hasFeatures && (
          <a href="#section-features" className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>
            <Sparkles size={14} aria-hidden="true" /> {lang === 'ko' ? '특징' : 'Features'}
          </a>
        )}
      </nav>

      <section id="section-overview" className="info-section detail-card">
        <h2 className="info-section-title"><BookOpen size={18} aria-hidden="true" /> {lang === 'ko' ? '개요' : 'Overview'}</h2>
        <div className="detail-content">{lang === 'ko' ? game.fullDescriptionKo : game.fullDescription}</div>
      </section>
      <section id="section-controls" className="info-section detail-card">
        <h2 className="info-section-title"><Joystick size={18} aria-hidden="true" /> {lang === 'ko' ? '조작법' : 'Controls'}</h2>
        <div className="detail-content highlight">{lang === 'ko' ? game.controlsKo : game.controls}</div>
      </section>
      {hasTips && (
        <section id="section-tips" className="info-section detail-card">
          <h2 className="info-section-title"><Lightbulb size={18} aria-hidden="true" /> {lang === 'ko' ? '팁' : 'Pro Tips'}</h2>
          <div className="detail-content tip-highlight">{lang === 'ko' ? game.tipsKo : game.tips}</div>
        </section>
      )}
      {hasLore && (
        <section id="section-lore" className="info-section detail-card">
          <h2 className="info-section-title"><ScrollText size={18} aria-hidden="true" /> {lang === 'ko' ? '세계관' : 'World Lore'}</h2>
          <div className="detail-content italic">{lang === 'ko' ? game.loreKo : game.lore}</div>
        </section>
      )}
      {hasFeatures && (
        <section id="section-features" className="info-section detail-card">
          <h2 className="info-section-title"><Sparkles size={18} aria-hidden="true" /> {lang === 'ko' ? '특징' : 'Key Features'}</h2>
          <ul className="feature-tags">
            {(lang === 'ko' ? game.featuresKo : game.features)?.map((feat, idx) => (
              <li key={idx} className="feature-tag-item">#{feat}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default GameInfoTabs;
