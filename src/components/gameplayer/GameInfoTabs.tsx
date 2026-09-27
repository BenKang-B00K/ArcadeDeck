import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { BookOpen, Check, Joystick, Lightbulb, ScrollText, Sparkles, Trophy } from 'lucide-react';
import type { Game } from '../../data/games';
import type { LocaleOverlay } from '../../i18n';
import {
  getLocalizedString,
  getLocalizedArray,
  getLocalizedObjects,
  useUiText,
} from '../../i18n';
import HelpfulThumbs from './HelpfulThumbs';
import { TIERS, tierLabel, tierMeta, tierOf, tierThresholds } from '../../utils/pb';

interface Props {
  game: Game;
  lang: string;
  overlay: LocaleOverlay | null;
  activeTab: string;
  setActiveTab: (id: string) => void;
  /** Current personal best — highlights the reached tier in the tier table. */
  pb: number;
}

type Section = 'overview' | 'controls' | 'tips' | 'lore';
type ViewMode = 'long' | 'short';

// **term** -> <strong class="kw">. Odd split() indices are the captures.
// Author rule: never span ** across a newline or sentence end
// (scripts/validate-games.js enforces it at build time).
const RICH = /\*\*(.+?)\*\*/g;
function renderRich(text: string): ReactNode[] {
  return text.split(RICH).map((part, i) => (i % 2 ? <strong key={i} className="kw">{part}</strong> : part));
}

// Sentence end = .!? followed by whitespace, or CJK 。！？ with optional
// whitespace. "v3.0", "1.3s", "Lv.2", "1.3초" never have whitespace after
// the dot, so they stay intact.
const SENT = /(?<=[.!?])\s+|(?<=[。！？])\s*/;
const sentences = (text: string) => text.split(SENT).map(s => s.trim()).filter(Boolean);
const paragraphs = (text: string) => text.split('\n').map(s => s.trim()).filter(Boolean);

// Multi-paragraph: first sentence per paragraph. Single-line: every sentence.
function bulletize(text: string): string[] {
  const lines = paragraphs(text);
  return lines.length > 1 ? lines.map(l => sentences(l)[0] ?? l) : sentences(text);
}

// "Key: Action / Key: Action" -> [[key, action]]. ja/ko use fullwidth "：".
function controlPairs(controls: string): [string, string][] {
  return controls.split(/\s*\/\s*/).filter(Boolean).map(item => {
    const i = item.search(/[:：]/);
    return i < 0 ? [item, ''] : [item.slice(0, i).trim(), item.slice(i + 1).trim()];
  });
}

const DEFAULT_VIEW: Record<Section, ViewMode> = {
  overview: 'short', controls: 'long', tips: 'long', lore: 'long',
};

function loadView(gameId: string): Record<Section, ViewMode> {
  if (typeof window === 'undefined') return DEFAULT_VIEW;
  try {
    const parsed = JSON.parse(localStorage.getItem(`gameView_${gameId}`) ?? '{}') as Partial<Record<Section, string>>;
    const pick = (s: Section): ViewMode => {
      const v = parsed[s];
      return v === 'short' || v === 'long' ? v : DEFAULT_VIEW[s];
    };
    return { overview: pick('overview'), controls: pick('controls'), tips: pick('tips'), lore: pick('lore') };
  } catch {
    return DEFAULT_VIEW;
  }
}

const GameInfoTabs: React.FC<Props> = ({ game, lang, overlay, activeTab, setActiveTab, pb }) => {
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

  const tiers = tierThresholds(game.id);
  const hasTips = tips.length > 0;
  const hasLore = lore.length > 0;
  const hasFeatures = features.length > 0;
  // ja/ko often lack controlsTable; the English fallback table would then hide
  // the only localized control text, so prefer the raw string in that case.
  const tableLocalized = lang === 'en' || Boolean(overlay?.games?.[game.id]?.controlsTable?.length);

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

  const controlsList = (
    <ul className="short-list highlight">
      {controlPairs(controls).map(([k, a], i) => <li key={i}><kbd>{k}</kbd> {a}</li>)}
    </ul>
  );

  const tipsList = (
    <ol className="tips-list">
      {sentences(tips).map((s, i) => <li key={i}>{renderRich(s)}</li>)}
    </ol>
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
        {tiers && (
          <a href="#section-tiers" className={`tab-btn ${activeTab === 'tiers' ? 'active' : ''}`} onClick={() => setActiveTab('tiers')}>
            <Trophy size={14} aria-hidden="true" /> {t('tabTiers', 'Tiers')}
          </a>
        )}
      </nav>

      <section id="section-overview" className={`info-section detail-card view-${viewMode.overview}`}>
        <header className="info-section-header">
          <h2 className="info-section-title"><BookOpen size={18} aria-hidden="true" /> {t('playerOverview', 'Overview')}</h2>
          {renderPill('overview')}
        </header>
        {viewMode.overview === 'long' ? (
          <div className="detail-content">
            {paragraphs(fullDescription).map((p, i) => <p key={i}>{renderRich(p)}</p>)}
          </div>
        ) : (
          <ul className="short-list">
            {bulletize(fullDescription).map((line, i) => <li key={i}>{renderRich(line)}</li>)}
          </ul>
        )}
        {objectives && (
          <aside className="objectives-callout">
            <span className="objectives-label">🎯 {t('playerObjectives', 'Objectives')}</span>
            <p>{renderRich(objectives)}</p>
          </aside>
        )}
      </section>

      <section id="section-controls" className={`info-section detail-card view-${viewMode.controls}`}>
        <header className="info-section-header">
          <h2 className="info-section-title"><Joystick size={18} aria-hidden="true" /> {t('playerControls', 'Controls')}</h2>
          {renderPill('controls')}
        </header>
        {viewMode.controls === 'long' && controlsTable.length > 0 && tableLocalized ? (
          <div className="controls-table-wrap">
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
                    <td className="key"><kbd>{row.key}</kbd></td>
                    <td>{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : controlsList}
      </section>

      {hasTips && (
        <section id="section-tips" className={`info-section detail-card view-${viewMode.tips}`}>
          <header className="info-section-header">
            <h2 className="info-section-title"><Lightbulb size={18} aria-hidden="true" /> {t('playerTips', 'Pro Tips')}</h2>
            {renderPill('tips')}
          </header>
          {tipsList}
          {viewMode.tips === 'long' && faq.length > 0 && (
            <div className="faq-wrap">
              <h3 className="faq-heading">{t('faqHeading', 'FAQ')}</h3>
              <div className="faq-list">
                {faq.map((entry, i) => (
                  <details key={i} className="faq-item">
                    <summary>{entry.q}</summary>
                    <p>{renderRich(entry.a)}</p>
                  </details>
                ))}
              </div>
            </div>
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
              <div className="detail-content">
                {paragraphs(lore).map((p, i) => <p key={i}>{renderRich(p)}</p>)}
              </div>
              {characters.length > 0 && (
                <div className="characters-wrap">
                  <h3 className="characters-heading">{t('charactersHeading', 'Cast')}</h3>
                  <ul className="characters-list">
                    {characters.map((c, i) => (
                      <li key={i}>
                        <span className="char-name">{c.name}</span>
                        <span className="char-role">{c.role}</span>
                        <p className="char-desc">{renderRich(c.desc)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <ul className="short-list">
              {bulletize(lore).map((line, i) => <li key={i}>{renderRich(line)}</li>)}
            </ul>
          )}
          <HelpfulThumbs gameId={game.id} section="lore" />
        </section>
      )}

      {hasFeatures && (
        <section id="section-features" className="info-section detail-card">
          <h2 className="info-section-title"><Sparkles size={18} aria-hidden="true" /> {t('playerFeatures', 'Key Features')}</h2>
          <ul className="feature-list">
            {features.map((feat, idx) => (
              <li key={idx}><Check size={16} aria-hidden="true" /> {feat}</li>
            ))}
          </ul>
        </section>
      )}

      {tiers && (() => {
        // 3 bands × 10 divisions, then Diamond alone. Compact numbers keep
        // 1,000,000,000-scale games readable ("1B", "10億").
        const bands = [0, 1, 2].map(b => tiers.slice(b * 10, b * 10 + 10));
        const compact = new Intl.NumberFormat(lang, { notation: 'compact', maximumFractionDigits: 1 });
        const current = tierOf(game.id, pb);
        const scoreLabel = getLocalizedString(game, 'scoreLabel', lang, overlay) || t('pbScore', 'Score');
        const diamond = tierMeta(TIERS)!;
        const cell = (tier: number, score: number) => (
          <td key={tier} className={tier === current ? 'current' : tier < current ? 'reached' : ''} aria-current={tier === current ? 'true' : undefined}>
            {compact.format(score)}
          </td>
        );
        return (
          <section id="section-tiers" className="info-section detail-card">
            <h2 className="info-section-title"><Trophy size={18} aria-hidden="true" /> {t('playerTiers', 'Score Tiers')}</h2>
            <p className="tiers-caption">{t('tiersCaption', '{label} needed to reach each tier. Your current tier is highlighted.').replace('{label}', scoreLabel)}</p>
            <div className="tiers-table-wrap">
              <table className="controls-table tiers-table">
                <thead>
                  <tr>
                    <th>{t('tiersColTier', 'Tier')}</th>
                    {bands[0].map((_, d) => <th key={d}>{d + 1}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {bands.map((row, b) => {
                    const meta = tierMeta(b * 10 + 1)!;
                    return (
                      <tr key={b} className={meta.cls}>
                        <th scope="row">{t(meta.key, meta.en)}</th>
                        {row.map((score, d) => cell(b * 10 + d + 1, score))}
                      </tr>
                    );
                  })}
                  <tr className={diamond.cls}>
                    <th scope="row">{tierLabel(diamond, t)}</th>
                    {cell(TIERS, tiers[TIERS - 1])}
                    <td colSpan={9} />
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        );
      })()}
    </div>
  );
};

export default GameInfoTabs;
