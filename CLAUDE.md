# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

React 19 + TypeScript + Vite 7. Firebase Firestore for comments/forum. Deployed via Firebase Hosting (`firebase deploy --only hosting`, custom domain `arcadedeck.net`). PWA via `vite-plugin-pwa`. Security headers (CSP, HSTS, COOP, XFO) in `firebase.json`.

## Commands

```bash
npm run dev          # Vite dev server
npm run validate     # Lint games.json (warnings only)
npm run build        # validate → sitemap → rss → tsc -b → vite build → prerender
npm run lint         # ESLint flat config
npm run preview      # Preview production build
npm run deploy       # Build + Firebase Hosting publish
npm run indexnow         # Ping IndexNow for changed URLs (full set)
npm run indexnow:posts   # Ping IndexNow for blog posts only
npm run indexnow:all     # Ping IndexNow for every URL in sitemap
```

Firestore rules deploy (separate from app deploy):
```
firebase deploy --only firestore:rules --project ultragames-website
```

There are no tests in this repo.

## Architecture — Big Picture

**Game data is split between structural config and translatable text:**

- `src/data/games.json` — structural fields only (`id`, `slug`, `thumbnail`, `genres`, `gameUrl`, `aspectRatio`, `status`, `isOriginal`, `language`, `badge`). No text.
- `src/i18n/locales/en.json` — canonical English text under `games[<id>]` (`title`, `description`, `fullDescription`, `controls`, `tips`, `lore`, `features`). Source of truth for game copy.
- `src/i18n/locales/{lang}.json` — overlay translations for non-English locales (de, fr, ja, ko, zh). Same shape. Missing fields fall back to English. The user owns all non-English translations.

Adding a new game: edit `games.json` (structural) + `en.json` `games` block (text) + drop a WebP into `public/images/`. Templates: `new-game-template.txt`, `new-game-template.json`. Other locales are translated separately by the user. Code paths read structural config from `games.json` — never hardcode game IDs (`id === '7'` is forbidden by RULES.md). Game text is always resolved via `getLocalizedString` / `getLocalizedArray` / `getLocalizedObjects` (structured fields: `controlsTable`, `faq`, `characters`, `featuredComments`) from `src/i18n/getLocalized.ts` — direct property access (`game.title`) is not on the `Game` type. Type definitions live in `src/data/games.ts`.

**i18n internals:** `src/i18n/registry.ts` eager-imports `en.json` so English is always available as the fallback. Other overlays lazy-load via `import.meta.glob('./locales/*.json')`. `src/i18n/store.ts` exposes `useLocale()` returning `{ lang, overlay }` and seeds `en` synchronously to avoid a null flash on initial render. Underscore-prefixed locale files (e.g. `_template.json`) are ignored by the glob filter. Backups belong outside `src/i18n/locales/` so the glob does not bundle them.

**Locale-prefixed URLs:** English serves at root (`/`, `/play/{slug}`); other locales prefixed (`/de/`, `/de/play/{slug}`, `/es-la/…`). React Router boots with `basename` derived from the URL prefix. The language switcher does a full-page navigate so the prerendered shell for the target locale serves directly (no client-side hydration mismatch).

**Routing & code-splitting:** `src/App.tsx` mounts React Router. `Home` is eager; every other page is `React.lazy`. Vite `manualChunks` splits `vendor` (react/router) from `firebase` and `icons` (lucide-react) so Firestore is a parallel-loadable chunk. Firestore is only touched by `CommentSection` and the forum pages, so it never blocks FCP/LCP on Home. `vite.config.ts` injects a `<link rel="modulepreload">` for the entry chunk near the top of `<head>` (custom `preloadEntry()` plugin) so the entry fetch starts in parallel with HTML parsing.

**Pre-rendering for SEO:** This is an SPA, but `scripts/prerender-pages.js` runs after `vite build` and emits a static `dist/play/{slug}/index.html` for every playable game (extracts head + script tags from the built `index.html`, injects per-game meta/JSON-LD/visible content). It also emits **per-locale shells**: 6 translated shells per game, 6 home shells, plus blog and static routes (`/about`, `/privacy`, `/contact`, `/my-games`). Each shell carries the full hreflang map, locale-correct `og:locale`, and JSON-LD `inLanguage`. When a locale has no translation for a given game, the prerender sets `canonical` to the English URL and `<meta name="robots" content="noindex,follow">` to consolidate signals. React replaces the prerendered subtree on mount — do **not** hide the prerendered content with `display:none` (cloaking).

**Sitemap:** `scripts/generate-sitemap.js` writes `public/sitemap.xml` from `games.json` on every build, with `xhtml:hreflang` alternates per locale. `scripts/generate-rss.js` emits the blog feed. Do not edit either output by hand — they're regenerated.

**Game iframes:** Games run in iframes hosted elsewhere (`gameUrl`). There is no score/leaderboard plumbing — `GamePlayer` just mounts the frame behind a click-to-start gate.

**Caching:** `CommentSection` loads latest 20 with cursor pagination (`startAfter`). Do not switch to `onSnapshot` (cost/perf).

## Conventions (from RULES.md)

- **TypeScript:** no `any`, no `// @ts-ignore`. Use `declare global { interface Window {...} }` for globals. `verbatimModuleSyntax` is on, so type-only imports must use `import type`.
- **Firestore rules:** never `allow update: if true`. Comments capped at 300 chars, nicknames at 30.
- **Errors:** every route is wrapped in `<ErrorBoundary>` — don't add per-page try/catch UI.
- **Images:** WebP only, in `public/images/`, referenced as `"images/foo.webp"` from `games.json`. PWA icons: 192×192 and 512×512.
- **i18n:** When adding a new game, only fill `en.json` `games[id]`. The user adds translations for other locales themselves. Never invent translations for `ko.json`, `ja.json`, etc. without explicit instruction.
- **UI strings:** new UI copy goes into `en.json` `ui` block, accessed via `useUiText()` / `ui()`. Never hardcode user-facing strings in components.
- **Image optimization:** `scripts/optimize-images.cjs` resizes/re-encodes oversized banners in-place to 640w q70 and emits `{slug}-360.webp` variants. Skips icons and `arcadedeck-banner.webp`. Pass `--blog` to run the same loop over `public/images/blog/` (1600w inline, 1200w hero, q72). Run manually after adding large new images.
- **Image naming:** `{slug}.webp` kebab-case lowercase (matches `games.json` slug). System files: `favicon.webp`, `arcadedeck-banner.webp`, `bg.webp`, `icon-192x192.webp`, `icon-512x512.webp`.

## SEO / verification artifacts

- `index.html` head: `msvalidate.01` (Bing) and `google-adsense-account` meta tags.
- `public/BingSiteAuth.xml` — Bing Webmaster verification file.
- Domain DNS verification for Bing requires a DNS-only (un-proxied) CNAME on Cloudflare.
