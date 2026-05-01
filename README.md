# ArcadeDeck

Curated home for original, free-to-play browser games. No downloads, no sign-up. Global leaderboards on every title. Live at **[arcadedeck.net](https://arcadedeck.net)**.

전 세계의 다양하고 흥미진진한 게임들을 한 곳에서. 11개 언어 지원, 다운로드/가입 없음.

---

## Tech Stack

- **React 19** + **TypeScript** + **Vite 7**
- **Firebase Firestore** — global leaderboards + comments
- **Firebase Hosting** — static SPA + per-route prerender
- **PWA** via `vite-plugin-pwa` (offline shell, installable)
- **i18n** — 11 locales (en, de, es, es-LA, fr, ja, ko, pt, ru, vi, zh) with overlay JSON + lazy loading

## Project Layout

```
src/
├── components/         # Reusable UI (CSS colocated)
├── pages/              # Route components (lazy-loaded except Home)
├── data/
│   ├── games.json      # Structural fields only (id, slug, gameUrl, leaderboard…)
│   └── games.ts        # Type defs + filter for playable games
├── i18n/
│   ├── locales/        # {lang}.json overlays (en.json = canonical)
│   ├── registry.ts     # Locale list, URL helpers, BCP-47 maps
│   ├── store.ts        # useLocale() + URL-prefix-aware boot
│   └── getLocalized.ts # Resolve game text with English fallback
└── firebase.ts         # Firestore init

scripts/
├── validate-games.js       # Sanity-check games.json
├── generate-sitemap.js     # 225+ URLs with xhtml:hreflang alternates
├── generate-rss.js         # Blog RSS feed
└── prerender-pages.js      # Static shells: 17 games × 11 locales
                            # + per-locale home + blog + static routes
```

## Architecture Highlights

### Game data is split

Structural fields live in `src/data/games.json`. Translatable text (`title`, `description`, `fullDescription`, `controls`, `tips`, `lore`, `features`) lives in `src/i18n/locales/en.json` `games[<id>]`. Other locales overlay English; missing fields fall back per-key.

Adding a new game: see [`new-game-template.txt`](./new-game-template.txt) and [`new-game-template.json`](./new-game-template.json). Two files to edit.

### Locale-prefixed URLs (SEO)

- English at root: `/`, `/play/{slug}`
- Other locales prefixed: `/de/`, `/de/play/{slug}`, `/ja/play/{slug}`, etc.
- React Router boots with `basename` derived from URL prefix.
- Language switcher does a full-page navigate so the prerendered shell for the target locale serves directly.
- `prerender-pages.js` emits 11 translated shells per game + 11 home shells, each with the full hreflang map, locale-correct `og:locale`, and JSON-LD `inLanguage`.

### Pre-rendering for crawlers

SPA, but every playable route ships with a static `index.html` containing visible H1/H2/body content + complete JSON-LD (VideoGame, BreadcrumbList, BlogPosting, etc.). React replaces the prerendered subtree on mount — never hide it (cloaking risk).

### Performance

- `Home` is eager; every other page is `React.lazy`.
- Vite `manualChunks` splits `vendor` (react/router) from `firebase`.
- LCP hero shell is hand-written in `index.html` so paint lands ~480 ms before React mounts.
- `GlobalLeaderboard` is lazy + sessionStorage-cached (5-minute TTL).
- Firestore lazy-imported inside `requestIdleCallback` so it never blocks FCP.

## Commands

```bash
npm run dev          # Vite dev server
npm run validate     # Lint games.json (warnings only)
npm run build        # validate → sitemap → rss → tsc → vite build → prerender → 404 copy
npm run lint         # ESLint flat config
npm run preview      # Preview production build
npm run deploy       # Build + Firebase Hosting publish
```

Firestore rules deploy (separate from app deploy):
```bash
firebase deploy --only firestore:rules --project ultragames-website
```

No tests in this repo.

## Adding a New Game

1. Drop a WebP banner into `public/images/{slug}.webp`.
2. Append the structural entry to `src/data/games.json` (see template).
3. Add the matching `games[<id>]` block to `src/i18n/locales/en.json` (English text).
4. **Do not** edit non-English locale files — those are user-translated separately.
5. `npm run validate` then `npm run build`.
6. Verify the new `/play/{slug}` page locally with `npm run dev`.
7. `npm run deploy`.

Sitemap, RSS, and per-locale prerendered pages regenerate automatically on build. Do not edit them by hand.

## Conventions

See [`RULES.md`](./RULES.md) and [`CLAUDE.md`](./CLAUDE.md) for the full set. Highlights:

- **TypeScript:** no `any`, no `// @ts-ignore`. Type-only imports use `import type`.
- **Firestore rules:** `leaderboards.{name, gameId}` immutable post-create. Comments ≤300 chars. Nicknames ≤30 chars.
- **postMessage scoring:** validate `event.origin` against the iframe domain, clamp `score` to `[0, 10_000_000]`, require `isFinite`. Drop silently otherwise.
- **i18n:** new game text goes in `en.json` only — never invent translations for other locales.
- **Images:** WebP only, in `public/images/`. Filename = `{slug}.webp` kebab-case.

## License

Private project. Source is not open for redistribution.

## Contact

`help@arcadedeck.net`
