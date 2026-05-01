# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

React 19 + TypeScript + Vite 7. Firebase Firestore for leaderboards/comments. Deployed via Firebase Hosting (`firebase deploy --only hosting`, custom domain `arcadedeck.net`). PWA via `vite-plugin-pwa`. Security headers (CSP, HSTS, COOP, XFO) in `firebase.json`.

## Commands

```bash
npm run dev          # Vite dev server
npm run validate     # Lint games.json (warnings only)
npm run build        # validate → sitemap → rss → tsc -b → vite build → prerender → cp 404.html
npm run lint         # ESLint flat config
npm run preview      # Preview production build
npm run deploy       # Build + Firebase Hosting publish
```

Firestore rules deploy (separate from app deploy):
```
firebase deploy --only firestore:rules --project ultragames-website
```

There are no tests in this repo.

## Architecture — Big Picture

**Game data is split between structural config and translatable text:**

- `src/data/games.json` — structural fields only (`id`, `slug`, `thumbnail`, `genres`, `gameUrl`, `aspectRatio`, `status`, `isOriginal`, `language`, `badge`, `leaderboard`). No text.
- `src/i18n/locales/en.json` — canonical English text under `games[<id>]` (`title`, `description`, `fullDescription`, `controls`, `tips`, `lore`, `features`). Source of truth for game copy.
- `src/i18n/locales/{lang}.json` — overlay translations for non-English locales (de, es, es-LA, fr, ja, ko, pt, ru, vi, zh). Same shape. Missing fields fall back to English. The user owns all non-English translations.

Adding a new game: edit `games.json` (structural) + `en.json` `games` block (text) + drop a WebP into `public/images/`. Other locales are translated separately by the user. Code paths read structural config from `games.json` — never hardcode game IDs (`id === '7'` is forbidden by RULES.md). Game text is always resolved via `getLocalizedString` / `getLocalizedArray` from `src/i18n/getLocalized.ts` — direct property access (`game.title`) is not on the `Game` type. Type definitions live in `src/data/games.ts`.

**i18n internals:** `src/i18n/registry.ts` eager-imports `en.json` so English is always available as the fallback. Other overlays lazy-load via `import.meta.glob('./locales/*.json')`. `src/i18n/store.ts` exposes `useLocale()` returning `{ lang, overlay }` and seeds `en` synchronously to avoid a null flash on initial render. Underscore-prefixed locale files (e.g. `_template.json`) are ignored by the glob filter. Backups belong outside `src/i18n/locales/` so the glob does not bundle them.

**Routing & code-splitting:** `src/App.tsx` mounts React Router. `Home` is eager; every other page is `React.lazy`. Vite `manualChunks` splits `vendor` (react/router) from `firebase` so Firestore is a parallel-loadable chunk. `Home.tsx` further dynamic-imports `firebase/firestore` inside effects + uses `requestIdleCallback` so Firestore code never blocks FCP/LCP. `GlobalLeaderboard` is `React.lazy` from Home for the same reason.

**Pre-rendering for SEO:** This is an SPA, but `scripts/prerender-pages.js` runs after `vite build` and emits a static `dist/play/{slug}/index.html` for every playable game (extracts head + script tags from the built `index.html`, injects per-game meta/JSON-LD/visible content). It also re-syncs the home `<noscript>` block with the current playable game list and creates static shells for `/about`, `/privacy`, `/contact`, `/hall-of-fame`, `/my-games`. React replaces the prerendered subtree on mount — do **not** hide the prerendered content with `display:none` (cloaking).

**Sitemap:** `scripts/generate-sitemap.js` writes `public/sitemap.xml` from `games.json` on every build. Do not edit `sitemap.xml` by hand — it's regenerated.

**Game iframes & score postMessage:** Games run in iframes hosted elsewhere (`gameUrl`). `GamePlayer` listens for `postMessage` score events. Validate `event.origin` matches the game's iframe domain; clamp `score` to `[0, 10_000_000]` and `isFinite`; silently drop anything else (no alerts).

**Leaderboard config is data-driven:** `games.json` `leaderboard.{primaryLabel, primaryUnit, secondaryLabel, secondaryUnit, dualSort, subSortAsc}` controls Firestore sort order and UI labels. `dualSort=true` adds `orderBy("subScore")`; `subSortAsc=true` means lower subScore wins ties (Gem Merge style). Score-display strings must come from this config.

**Caching:**
- `GlobalLeaderboard` caches Firestore results in `sessionStorage` (key `arcadedeck_rank_cache`) with a 5-minute TTL. Manual refresh button is the only invalidator. Parallelize with `Promise.all` — never serialize.
- `CommentSection` loads latest 20 with cursor pagination (`startAfter`). Do not switch to `onSnapshot` (cost/perf).

## Conventions (from RULES.md)

- **TypeScript:** no `any`, no `// @ts-ignore`. Use `declare global { interface Window {...} }` for globals. `verbatimModuleSyntax` is on, so type-only imports must use `import type`.
- **Firestore rules:** never `allow update: if true`. `leaderboards.{name, gameId}` are immutable post-create. Comments capped at 300 chars, nicknames at 30.
- **Errors:** every route is wrapped in `<ErrorBoundary>` — don't add per-page try/catch UI.
- **Images:** WebP only, in `public/images/`, referenced as `"images/foo.webp"` from `games.json`. PWA icons: 192×192 and 512×512.
- **i18n:** When adding a new game, only fill `en.json` `games[id]`. The user adds translations for other locales themselves. Never invent translations for `ko.json`, `ja.json`, etc. without explicit instruction.
- **Image optimization:** `scripts/optimize-images.cjs` resizes/re-encodes oversized banners in-place to 640w q70. Skips icons and `arcadedeck-banner.webp`. Run manually after adding large new banners.
- **Image naming:** `{slug}.webp` kebab-case lowercase (matches `games.json` slug). System files: `favicon.webp`, `arcadedeck-banner.webp`, `bg.webp`, `icon-192x192.webp`, `icon-512x512.webp`.

## SEO / verification artifacts

- `index.html` head: `msvalidate.01` (Bing) and `google-adsense-account` meta tags.
- `public/BingSiteAuth.xml` — Bing Webmaster verification file.
- Domain DNS verification for Bing requires a DNS-only (un-proxied) CNAME on Cloudflare.
