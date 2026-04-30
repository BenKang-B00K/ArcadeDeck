# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

React 19 + TypeScript + Vite 7. Firebase Firestore for leaderboards/comments. Deployed via Firebase Hosting (`firebase deploy --only hosting`, custom domain `arcadedeck.net`). PWA via `vite-plugin-pwa`. Security headers (CSP, HSTS, COOP, XFO) in `firebase.json`.

## Commands

```bash
npm run dev          # Vite dev server
npm run validate     # Lint games.json (warnings only)
npm run build        # validate → split-games → sitemap → tsc -b → vite build → prerender → cp 404.html
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

**Single source of truth for games:** `src/data/games.json`. Adding a game means editing only this file (+ adding a WebP to `public/images/`). Code paths read configuration from the JSON entry — never hardcode game IDs (`id === '7'` is forbidden by RULES.md). Type definitions and a typed `games` array live in `src/data/games.ts`.

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
- **Image optimization:** `scripts/optimize-images.cjs` resizes/re-encodes oversized banners in-place to 640w q70. Skips icons and `arcadedeck-banner.webp`. Run manually after adding large new banners.
- **Image naming:** `{slug}.webp` kebab-case lowercase (matches `games.json` slug). System files: `favicon.webp`, `arcadedeck-banner.webp`, `bg.webp`, `icon-192x192.webp`, `icon-512x512.webp`.

## SEO / verification artifacts

- `index.html` head: `msvalidate.01` (Bing) and `google-adsense-account` meta tags.
- `public/BingSiteAuth.xml` — Bing Webmaster verification file.
- Domain DNS verification for Bing requires a DNS-only (un-proxied) CNAME on Cloudflare.
