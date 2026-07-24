import React, { useState } from 'react';
import { BookOpen, Joystick, Lightbulb, ScrollText, Sparkles } from 'lucide-react';
import type { Game } from '../../data/games';
import type { LocaleOverlay } from '../../i18n';
import {
  getLocalizedString,
  getLocalizedArray,
  getLocalizedObjects,
  useUiText,
} from '../../i18n';
import HelpfulThumbs from './HelpfulThumbs';

interface Props {
  game: Game;
  lang: string;
  overlay: LocaleOverlay | null;
  activeTab: string;
  setActiveTab: (id: string) => void;
}

type Section = 'overview' | 'controls' | 'tips' | 'lore';
type ViewMode = 'long' | 'short';

// Multi-paragraph: each line/paragraph -> first sentence.
// Single-line: split on common separators (/, ·, ;) then sentence boundaries.
function bulletize(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  const lines = t.split(/\n+/).map(s => s.trim()).filter(Boolean);
  if (lines.length > 1) {
    return lines.map(line => {
      const m = line.match(/^[^.!?]*[.!?]/);
      return (m ? m[0] : line).trim();
    });
  }
  const sep = t.split(/\s*[/·;]\s*|(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  return sep.length > 1 ? sep : [t];
}

const DEFAULT_VIEW: Record<Section, ViewMode> = {
  overview: 'long', controls: 'long', tips: 'long', lore: 'long',
};

function loadView(gameId: string): Record<Section, ViewMode> {
  if (typeof window === 'undefined') return DEFAULT_VIEW;
  try {
    const raw = localStorage.getItem(`gameView_${gameId}`);
    if (!raw) return DEFAULT_VIEW;
    const parsed = JSON.parse(raw) as Partial<Record<Section, ViewMode>>;
    return {
      overview: parsed.overview === 'short' ? 'short' : 'long',
      controls: parsed.controls === 'short' ? 'short' : 'long',
      tips: parsed.tips === 'short' ? 'short' : 'long',
      lore: parsed.lore === 'short' ? 'short' : 'long',
    };
  } catch {
    return DEFAULT_VIEW;
  }
}

const GameInfoTabs: React.FC<Props> = ({ game, lang, overlay, activeTab, setActiveTab }) => {
  const t = useUiText();
  const fullDescription = getLocalizedString(game, 'fullDescription', lang, overlay);
  const controls = getLocalizedString(game, 'controls', lang, overlay);
  const tips = getLocalizedString(game, 'tips', lang, overlay);
  const lore = getLocalizedString(game, 'lore', lang, overlay);
  const features = getLocalizedArray(game, 'features', lang, overlay);
  const objectives = getLocalizedString(game, 'objectives', lang, overlay);
  const controlsTable = getLocalizedObjects(game, 'controlsTable', lang, overlay);
  const faq = getLocalizedObjects(game, 'faq', lang, overlay);
  const characters = getLocalizedObjects(game, 'characters', lang, overlay);

  const hasTips = tips.length > 0;
  const hasLore = lore.length > 0;
  const hasFeatures = features.length > 0;

  const [viewMode, setViewMode] = useState<Record<Section, ViewMode>>(() => loadView(game.id));

  const setSectionView = (section: Section, mode: ViewMode) => {
    setViewMode(prev => {
      const next = { ...prev, [section]: mode };
      try {
        localStorage.setItem(`gameView_${game.id}`, JSON.stringify(next));
      } catch {
        // localStorage may be unavailable (private mode, quota). Ignore.
      }
      return next;
    });
  };

  const longLabel = t('viewLong', 'Long');
  const shortLabel = t('viewShort', 'Short');
  const viewAria = t('viewToggleAria', 'Switch view mode');

  const renderPill = (section: Section) => (
    <div className="view-pill" role="tablist" aria-label={viewAria}>
      <button
        type="button"
        role="tab"
        aria-selected={viewMode[section] === 'long'}
        className={`view-pill-btn ${viewMode[section] === 'long' ? 'active' : ''}`}
        onClick={() => setSectionView(section, 'long')}
      >{longLabel}</button>
      <button
        type="button"
        role="tab"
        aria-selected={viewMode[section] === 'short'}
        className={`view-pill-btn ${viewMode[section] === 'short' ? 'active' : ''}`}
        onClick={() => setSectionView(section, 'short')}
      >{shortLabel}</button>
    </div>
  );

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

      <section id="section-overview" className={`info-section detail-card view-${viewMode.overview}`}>
        <header className="info-section-header">
          <h2 className="info-section-title"><BookOpen size={18} aria-hidden="true" /> {t('playerOverview', 'Overview')}</h2>
          {renderPill('overview')}
        </header>
        {viewMode.overview === 'long' ? (
          <>
            <div className="detail-content">{fullDescription}</div>
            {objectives && (
              <aside className="objectives-callout">
                <span className="objectives-label">🎯 {t('playerObjectives', 'Objectives')}</span>
                <p>{objectives}</p>
              </aside>
            )}
          </>
        ) : (
          <ul className="short-list">
            {bulletize(fullDescription).map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        )}
      </section>

      <section id="section-controls" className={`info-section detail-card view-${viewMode.controls}`}>
        <header className="info-section-header">
          <h2 className="info-section-title"><Joystick size={18} aria-hidden="true" /> {t('playerControls', 'Controls')}</h2>
          {renderPill('controls')}
        </header>
        {viewMode.controls === 'long' ? (
          <>
            <div className="detail-content highlight">{controls}</div>
            {controlsTable.length > 0 && (
              <div className="controls-table-wrap">
                <h3>{t('controlsTableHeading', 'Quick Reference')}</h3>
                <table className="controls-table">
                  <thead>
                    <tr>
                      <th>{t('controlsTableKey', 'Input')}</th>
                      <th>{t('controlsTableAction', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {controlsTable.map((row, i) => (
                      <tr key={i}>
                        <td className="key">{row.key}</td>
                        <td>{row.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <ul className="short-list highlight">
            {bulletize(controls).map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        )}
      </section>

      {hasTips && (
        <section id="section-tips" className={`info-section detail-card view-${viewMode.tips}`}>
          <header className="info-section-header">
            <h2 className="info-section-title"><Lightbulb size={18} aria-hidden="true" /> {t('playerTips', 'Pro Tips')}</h2>
            {renderPill('tips')}
          </header>
          {viewMode.tips === 'long' ? (
            <>
              <div className="detail-content tip-highlight">{tips}</div>
              {faq.length > 0 && (
                <div className="faq-wrap">
                  <h3 className="faq-heading">{t('faqHeading', 'FAQ')}</h3>
                  <dl className="faq-list">
                    {faq.map((entry, i) => (
                      <div key={i} className="faq-item">
                        <dt>{entry.q}</dt>
                        <dd>{entry.a}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </>
          ) : (
            <ul className="short-list tip-highlight">
              {bulletize(tips).map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          )}
          <HelpfulThumbs gameId={game.id} section="tips" />
        </section>
      )}

      {hasLore && (
        <section id="section-lore" className={`info-section detail-card view-${viewMode.lore}`}>
          <header className="info-section-header">
            <h2 className="info-section-title"><ScrollText size={18} aria-hidden="true" /> {t('playerLore', 'World Lore')}</h2>
            {renderPill('lore')}
          </header>
          {viewMode.lore === 'long' ? (
            <>
              <div className="detail-content italic">{lore}</div>
              {characters.length > 0 && (
                <div className="characters-wrap">
                  <h3 className="characters-heading">{t('charactersHeading', 'Cast')}</h3>
                  <ul className="characters-list">
                    {characters.map((c, i) => (
                      <li key={i}>
                        <span className="char-name">{c.name}</span>
                        <span className="char-role">{c.role}</span>
                        <p className="char-desc">{c.desc}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <ul className="short-list italic">
              {bulletize(lore).map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          )}
          <HelpfulThumbs gameId={game.id} section="lore" />
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
