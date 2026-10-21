import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import changelog from '../../CHANGELOG.md?raw';
import { games } from '../data/games';
import { useUiText, useLocale } from '../i18n';
import { getLocalizedString } from '../i18n/getLocalized';
import { formatPostDate } from '../utils/dates';
import './Blog.css';
import './Home.css';

// One `## History` line per release: `- **vM.m.p** (YYYY-MM-DD) — a; b; c`.
// CHANGELOG.md is the single source — no second copy of release data.
const LINE = /^- \*\*v(\d+)\.(\d+)\.(\d+)\*\* \((\d{4}-\d{2}-\d{2})\) — (.+)$/gm;

const TIER_COLOR: Record<Tier, string> = { major: '#ff4d80', minor: '#00d2ff', patch: '#9aa0b4' };

// Game names in changelog text → /play links. Names are matched against the
// English catalogue title (changelog is English), plus the half before / after
// a `:` or ` - ` so "Dice War" and "Tank Battle" resolve. Version suffixes and
// trailing "!" are dropped, spaces are optional ("AshenKeys" ⇄ "Ashen Keys"), and a trailing
// "s" per word is tolerated ("Mythic Defenders"). A short form shared by two
// games ("Fallen Era", "Kingdom of Ashes") is dropped as ambiguous.
// ponytail: derived from titles, no alias table to maintain.
const clean = (t: string) =>
  t.replace(/\s+v\d[\d.]*$/, '').replace(/[!]+$/, '').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
const variantsOf = (title: string) => {
  const full = clean(title);
  const [head, tail] = full.split(/\s*(?::|\s-\s)\s*/);
  return [...new Set([full, head, tail])].filter((v): v is string => !!v && v.length > 3);
};
const bySlug = new Map<string, string>();
const seen = new Map<string, number>();
for (const g of games) {
  for (const v of variantsOf(getLocalizedString(g, 'title', 'en', null))) {
    const k = v.toLowerCase();
    seen.set(k, (seen.get(k) ?? 0) + 1);
    bySlug.set(k, g.slug);
  }
}
const names = [...seen].filter(([, n]) => n === 1).map(([k]) => k).sort((a, b) => b.length - a.length);
const toPattern = (k: string) =>
  k.split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?').join('\\s*');
// (?!\w) closes a title, not \b: a title may end in "?" ("Are You Trickster?"), and \b never matches after it
const GAME_RE = names.length ? new RegExp(`\\b(?:${names.map(toPattern).join('|')})(?!\\w)`, 'gi') : null;
const exact = names.map((k) => [k, new RegExp(`^${toPattern(k)}$`, 'i')] as const);

const linkGames = (text: string): React.ReactNode[] => {
  if (!GAME_RE) return [text];
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(GAME_RE)) {
    const hit = exact.find(([, re]) => re.test(m[0]));
    const slug = hit && bySlug.get(hit[0]);
    if (!slug) continue;
    out.push(text.slice(last, m.index), <Link key={m.index} to={`/play/${slug}`}>{m[0]}</Link>);
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
};
// `code` spans → <code>, everything else → game links.
const rich = (text: string): React.ReactNode[] =>
  text.split('`').flatMap((seg, i): React.ReactNode[] => (i % 2 ? [<code key={`c${i}`}>{seg}</code>] : linkGames(seg)));

// Split on `; ` at paren depth 0 so "(a; b)" stays one item.
const splitItems = (s: string): string[] => {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth = Math.max(0, depth - 1);
    else if (c === ';' && !depth && s[i + 1] === ' ') {
      out.push(s.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(s.slice(start).trim());
  return out.filter(Boolean);
};

// An item that opens with a game title and a `:` ("Skyfall v1.4: …",
// "New game: Flux Tower Defense … : …") heads a group; the items after it
// nest under it until the next head. Items before the first head stay flat.
interface Item { text: string; head: boolean; sub: string[] }
const HEAD_RE = names.length ? new RegExp(`^(?:new game: )?(?:${names.map(toPattern).join('|')})(?!\\w)[^:]*:`, 'i') : null;
const group = (items: string[]): Item[] => {
  const out: Item[] = [];
  for (const text of items) {
    const head = !!HEAD_RE?.test(text);
    const last = out[out.length - 1];
    if (!head && last?.head) last.sub.push(text);
    else out.push({ text, head, sub: [] });
  }
  return out;
};

type Tier = 'major' | 'minor' | 'patch';
interface Entry { version: string; nums: [number, number, number]; date: string; items: Item[]; tier: Tier }

const entries: Entry[] = [...changelog.matchAll(LINE)].map(([, M, m, p, date, body]) => ({
  version: `v${M}.${m}.${p}`,
  nums: [+M, +m, +p],
  date,
  items: group(splitItems(body)),
  tier: 'patch',
}));
// Tier = which counter moved vs. the previous (older) release. Oldest = launch.
entries.forEach((e, i) => {
  const prev = entries[i + 1];
  e.tier = !prev || e.nums[0] !== prev.nums[0] ? 'major' : e.nums[1] !== prev.nums[1] ? 'minor' : 'patch';
});

const PatchNote: React.FC = () => {
  const t = useUiText();
  const { lang } = useLocale();
  React.useEffect(() => {
    document.title = 'Patch Notes | ArcadeDeck';
  }, []);
  const tierLabel: Record<Tier, string> = {
    major: t('patchTierMajor', 'MAJOR'),
    minor: t('patchTierMinor', 'MINOR'),
    patch: t('patchTierPatch', 'PATCH'),
  };
  return (
    <div className="blog-page">
      <>
        <meta name="description" content="Every ArcadeDeck release in one place: new games, features, UI changes, and balance fixes, newest first. MAJOR for games, MINOR for features, PATCH for fixes." />
        <meta property="og:title" content="Patch Notes | ArcadeDeck" />
        <meta property="og:description" content="Every ArcadeDeck release: new games, features, and balance fixes, newest first." />
        <meta property="og:url" content="https://arcadedeck.net/patchnote" />
        <link rel="canonical" href="https://arcadedeck.net/patchnote" />
      </>
      <Navbar />
      <main className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">{t('breadcrumbHome', 'Home')}</Link>
          <span aria-hidden="true">›</span>
          <span className="breadcrumb-current">{t('navPatchNotes', 'Patch Notes')}</span>
        </nav>
        <header className="blog-header">
          <h1>
            {t('patchNotesTitle', 'Patch')} <span>{t('patchNotesSpan', 'Notes')}</span>
          </h1>
          <p>{t('patchNotesSubtitle', 'Every release, newest first. New games bump MAJOR, features bump MINOR, fixes bump PATCH.')}</p>
        </header>
        <div className="blog-list">
          {entries.map((e) => (
            <article key={e.version} className="blog-card" id={e.version}>
              <div className="blog-card-meta">
                <time dateTime={e.date}>{formatPostDate(e.date, lang)}</time>
                <span className="blog-tag" style={{ color: TIER_COLOR[e.tier] }}>{tierLabel[e.tier]}</span>
              </div>
              <h2>{e.version}</h2>
              <ul className="patch-items">
                {e.items.map((it, i) => (
                  <li key={i} className={it.head ? 'patch-head' : undefined}>
                    {rich(it.text)}
                    {it.sub.length > 0 && <ul>{it.sub.map((t, j) => <li key={j}>{rich(t)}</li>)}</ul>}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
      <footer className="footer">
        <div className="container footer-container">
          <p>&copy; 2026 ArcadeDeck. {t('footerAllRights', 'All rights reserved.')}</p>
          <div className="footer-links">
            <Link to="/about" className="footer-link">{t('footerAbout', 'About Us')}</Link>
            <Link to="/privacy" className="footer-link">{t('footerPrivacy', 'Privacy Policy')}</Link>
            <Link to="/contact" className="footer-link">{t('footerContact', 'Contact')}</Link>
            <Link to="/blog" className="footer-link">{t('navBlog', 'Blog')}</Link>
            <a
              href="https://ko-fi.com/developer_benjamink"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link footer-link-support"
            >
              {t('footerSupport', 'Support')} ♥
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatchNote;
