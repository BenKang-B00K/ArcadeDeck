# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Shorthand commands

When the user's whole message is one of these phrases, run the mapped action right away. Don't ask for confirmation. Report results briefly when it's done. Add new phrases to this table as the user defines them.

| Phrase | Action | Report |
|---|---|---|
| "update leaderboard" | `timeout 90 node scripts/seed-leaderboard.mjs update`: advances the fake Global Leaderboard players (doc ids in gitignored `scripts/.leaderboard-bots.json`; if that file is missing, stop and tell the user; no CHANGELOG entry, data only) | rows changed, top 5, user's own rank (row "Ben") |

## Stack

React 19 + TypeScript + Vite 7. Firebase Firestore for comments/leaderboard. Site deployed via Firebase Hosting (`firebase deploy --only hosting`, custom domain `arcadedeck.net`); hosted game builds deployed separately to Cloudflare Pages (see **Hosted games**). PWA via `vite-plugin-pwa`. Security headers (CSP, HSTS, COOP, XFO) in `firebase.json`.

Locales on disk are `en`, `ja`, `ko` only — README.md and RULES.md still say "11 locales"; that list is stale, trust `src/i18n/locales/`.

## Commands

```bash
npm run dev          # Vite dev server
npm run validate     # Lint games.json (warnings only)
npm run build        # validate → sitemap → rss → tsc -b → vite build → prerender
npm run lint         # ESLint flat config
npm run preview      # Preview production build
npm run deploy       # Build + Firebase Hosting publish (site only)
npm run deploy:games # wrangler pages deploy games/ → Cloudflare Pages project arcadedeck-games
npm run indexnow         # Ping IndexNow for changed URLs (full set)
npm run indexnow:posts   # Ping IndexNow for blog posts only
npm run indexnow:all     # Ping IndexNow for every URL in sitemap
```

Firestore rules deploy (separate from app deploy):
```
firebase deploy --only firestore:rules --project ultragames-website
```

There are no tests in this repo.

One-off helpers (run manually, not part of build): `python scripts/sync_i18n.py` reports ja/ko keys missing vs `en.json`; `node scripts/seed-leaderboard.mjs [n]` seeds fake leaderboard rows through the client SDK, `… update` advances the existing fakes (ids in gitignored `scripts/.leaderboard-bots.json` — lose it and they can't be told apart from real rows); `scripts/sky-puff-textures.cjs` keys black-background cloud art to alpha WebP.

## CHANGELOG (mandatory)

Every user-visible change updates `CHANGELOG.md` in the same commit — do not wait to be asked. Prepend one line to `## History`:

```
- **vMAJOR.MINOR.PATCH** (YYYY-MM-DD) — short summary; semicolon-separated
```

Bump rule (counters never reset, each bumps independently — see the Versioning block in `CHANGELOG.md`): new game → MAJOR; feature / UI change / existing game update → MINOR; tuning or bug fix → PATCH. Same-day changes of the same tier fold into the existing top line instead of adding a new one. Docs-only, tooling, and refactors with no visible effect skip the changelog.

The format is load-bearing: `src/pages/PatchNote.tsx` imports `CHANGELOG.md?raw` and renders `/patchnote` from the regex `^- \*\*v(\d+)\.(\d+)\.(\d+)\*\* \((\d{4}-\d{2}-\d{2})\) — (.+)$` — bold version, ISO date in parens, an em dash (`—`, not `-`), one line per release. Items split on `; ` outside parentheses/brackets (so `(a; b)` stays one item); an item that opens with a catalogue game title and a `:` (`Skyfall v1.4: …`, `New game: X …: …`) heads a group and the items after it nest under it until the next such head — keep a game's sub-items contiguous and put site-wide items before the first game head. Backtick spans render as `<code>`. Tier colour is derived from which counter moved vs. the previous line. English game titles in the text auto-link to `/play/{slug}` (matched against `en.json` titles), so write titles as they appear in the catalogue. Keep line endings LF.

## Game reviews (mandatory)

Run these on the game source (outside this repo) before copying the build into `games/{slug}/`; fix findings in the same job and list them in the report. Don't wait to be asked.

**Every new game → mobile touch hygiene review (iOS Safari + Android Chrome).** Check and fix:
- Viewport meta `width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no`; layout respects `env(safe-area-inset-*)` (notch, home bar); `100dvh` not `100vh`.
- Play surface: `touch-action: none`, `user-select: none`, `-webkit-user-select: none`, `-webkit-touch-callout: none`, `-webkit-tap-highlight-color: transparent`; page `overscroll-behavior: none` (no pull-to-refresh / rubber-band mid-game); menus/buttons at least `touch-action: manipulation` (no double-tap zoom, no 300 ms delay).
- Pointer Events, not mouse-only; track by `pointerId` for multi-touch (stick + fire at once); handle `pointercancel` and `lostpointercapture` so a stick never sticks; block `contextmenu` (long-press menu); `preventDefault` only in listeners registered `{ passive: false }`.
- No hover-only affordances; tap targets ≥ 44 px; controls stay reachable in portrait and landscape, and on a resize/rotation mid-game.
- Audio unlocks on the first `pointerdown`/`touchend` (iOS keeps `AudioContext` suspended until a gesture) and resumes after `visibilitychange`; the game pauses when hidden.
- Test with Chrome DevTools device emulation (touch on) at a phone width before shipping.

**Adding a HOST-JOIN (phone link) system → QoL + performance review.** Tank Battle: 1v1 is the reference (see the co-op phone link memory). Check and fix:
- QoL: room code input `inputmode="email" autocapitalize="characters" autocomplete="off"` (email mode opens a Latin keyboard on most KO/JA phones), letters only, auto-uppercase, submit on the last char without double-submitting with Enter; ambiguous letters (`0/O`, `1/I/L`) dropped from the code alphabet; clear states for waiting / connecting / connected / failed with a cancel or back button on each; plain error text (room server unreachable vs. peers can't connect → try a hotspot); disconnect mid-match pauses with a "partner left" message and a way back to the menu, never a frozen screen; host can start again without reloading.
- Performance: high-rate state on an unordered, unreliable channel (`{ ordered: false, maxRetransmits: 0 }`) and one-off events (start, score, game over) on a reliable one; cap snapshot rate (~20–30 Hz), send deltas or quantized numbers, not full JSON object trees every frame; guest interpolates between snapshots instead of snapping; guest input sent on change plus a low-rate keepalive, not every frame; `bufferedAmount` check so a slow link drops frames instead of queueing; no Firestore polling once the DataChannel is open; close the `RTCPeerConnection` and listeners on leave / `pagehide`.

## Architecture — Big Picture

**Game data is split between structural config and translatable text:**

- `src/data/games.json` — structural fields only (`id`, `slug`, `thumbnail`, `genres`, `gameUrl`, `aspectRatio`, `status`, `isOriginal`, `language`, `badge`). No text.
- `src/i18n/locales/en.json` — canonical English text under `games[<id>]` (`title`, `description`, `fullDescription`, `controls`, `tips`, `lore`, `features`). Source of truth for game copy.
- `src/i18n/locales/{lang}.json` — overlay translations for non-English locales (ja, ko). Same shape. Missing fields fall back to English. Keep ja and ko at parity with `en.json` — every new key gets translated in the same change.

Adding a new game: edit `games.json` (structural) + `en.json` `games` block (text) + drop a WebP into `public/images/`. Templates: `new-game-template.txt`, `new-game-template.json`. Translate the same block into `ja.json` and `ko.json` in the same change. Code paths read structural config from `games.json` — never hardcode game IDs (`id === '7'` is forbidden by RULES.md). Game text is always resolved via `getLocalizedString` / `getLocalizedArray` / `getLocalizedObjects` (structured fields: `controlsTable`, `faq`, `characters`, `featuredComments`) from `src/i18n/getLocalized.ts` — direct property access (`game.title`) is not on the `Game` type. Type definitions live in `src/data/games.ts`.

**i18n internals:** `src/i18n/registry.ts` eager-imports `en.json` so English is always available as the fallback. Other overlays lazy-load via `import.meta.glob('./locales/*.json')`. `src/i18n/store.ts` exposes `useLocale()` returning `{ lang, overlay }` and seeds `en` synchronously to avoid a null flash on initial render. Underscore-prefixed locale files (e.g. `_template.json`) are ignored by the glob filter. Backups belong outside `src/i18n/locales/` so the glob does not bundle them.

**Locale-prefixed URLs:** English serves at root (`/`, `/play/{slug}`); other locales prefixed (`/ja/`, `/ja/play/{slug}`, `/ko/…`). React Router boots with `basename` derived from the URL prefix. The language switcher does a full-page navigate so the prerendered shell for the target locale serves directly (no client-side hydration mismatch).

**Routing & code-splitting:** `src/App.tsx` mounts React Router. `Home` is eager; every other page is `React.lazy`. Vite `manualChunks` splits `vendor` (react/router) from `firebase` and `icons` (lucide-react) so Firestore is a parallel-loadable chunk. Firestore is only touched by `CommentSection` and `leaderboard.ts`, so it never blocks FCP/LCP on Home. `vite.config.ts` injects a `<link rel="modulepreload">` for the entry chunk near the top of `<head>` (custom `preloadEntry()` plugin) so the entry fetch starts in parallel with HTML parsing.

**Pre-rendering for SEO:** This is an SPA, but `scripts/prerender-pages.js` runs after `vite build` and emits a static `dist/play/{slug}/index.html` for every playable game (extracts head + script tags from the built `index.html`, injects per-game meta/JSON-LD/visible content). It also emits **per-locale shells**: 3 translated shells per game, 3 home shells, plus blog and static routes (`/about`, `/privacy`, `/contact`, `/my-games`). Each shell carries the full hreflang map, locale-correct `og:locale`, and JSON-LD `inLanguage`. When a locale has no translation for a given game, the prerender sets `canonical` to the English URL and `<meta name="robots" content="noindex,follow">` to consolidate signals. React replaces the prerendered subtree on mount — do **not** hide the prerendered content with `display:none` (cloaking).

**Sitemap:** `scripts/generate-sitemap.js` writes `public/sitemap.xml` from `games.json` on every build, with `xhtml:hreflang` alternates per locale. `scripts/generate-rss.js` emits the blog feed. Do not edit either output by hand — they're regenerated.

**Hosted games (`games/`):** Games run in iframes (`gameUrl`) behind a click-to-start gate in `GamePlayer` (split into `src/components/gameplayer/*`). Most `gameUrl`s point at `https://games.arcadedeck.net/{slug}/` (custom domain on the CF Pages project; `arcadedeck-games.pages.dev` still serves the same files) — that origin is one Cloudflare Pages project served from the `games/` directory of this repo (`games/{slug}/` = **built** output only; game sources are not in this repo). Every catalogue game is hosted there (The Fractured Realm page embeds its own external build). Deploy with `npm run deploy:games` (independent of the site deploy). `games/_headers` sets immutable caching for `/:slug/assets/*`; `games/_redirects` holds 200-rewrites for games whose builds hardcode root-absolute asset paths (`/sound`, `/fonts` → Kingdom of Ashes; `/equip`, `/shop`, … → Shadow Runner). Those roots are taken — a new game must ship relative or slug-prefixed asset paths, not another rewrite. Hosted games must not gate on their own `requestFullscreen` when embedded (the host owns fullscreen; nested requests hang in Chrome).

**Personal bests + global leaderboard:** Every hosted game posts `{ type: 'GAME_OVER', score, subScore }` to the parent frame with targetOrigin `'*'` (`GAME_SCORE` / `SCORE_UPDATE` / `gameOver` also accepted; `subScore` is a secondary stat, unused today, reserved for a future leaderboard). Hot-seat titles post only human-vs-AI results; idle titles post a 5 s heartbeat + `pagehide`. `GamePlayer` accepts the message only from the game's own origin and stores the best run in `localStorage` via `src/utils/pb.ts`. Raw scores never leave the browser; the only thing published is the derived Deck XP: `src/utils/leaderboard.ts` upserts one Firestore `leaderboard/{uuid}` row per browser (nickname, xp, level, played, mastered) on new PB / nickname change / My Games visit, and rank = `getCount(xp > mine) + 1`. No auth, so rules validate shape only (see the `ponytail:` note in that file). Home shows the cached rank chip and refreshes it via dynamic import so Firestore stays out of the Home chunk. `scoreTiers` in `games.json` (5 non-decreasing anchors `[Bronze 1, Silver 1, Gold 1, Gold 10, Diamond]`, expanded to 31 tiers by `pb.ts`; capped games repeat the cap so a full clear is Diamond — a tuning knob) drives the mastery badge; `scoreLabel` in `en.json` names the score. Deck Level on `/my-games` is XP summed from games played, tiers earned, and best streak.

**Caching:** `CommentSection` loads latest 20 with cursor pagination (`startAfter`). Do not switch to `onSnapshot` (cost/perf).

**Firestore circuit breaker:** `src/utils/firestoreCircuit.ts` — on `resource-exhausted` / `unavailable` it sets a localStorage flag and short-circuits Firestore calls for 1 h so the UI degrades to cached/empty instead of red errors. `CommentSection` and `leaderboard.ts` already go through it; any new Firestore read/write must too (`circuitOpen()` before, `isQuotaError()` in the catch).

**Blog:** `src/data/posts.json` is the whole blog — one object per post (`slug`, `title`, `date`, `author`, `tags`, `relatedGames` (game ids), `coverImage`, `coverImageAlt`, `excerpt`, `content`). Posts are English-only (no `posts` block in the locales); `generate-rss.js` and the prerender read the same file. `src/utils/readPosts.ts` drives the NEW badge (unread + < 30 days, localStorage). `RelatedPosts` on a game page = posts whose `relatedGames` include that id.

**Toasts:** global `ToastContext` (`src/contexts/`) — use `useToast()`; don't add per-component toast state.

## Conventions (from RULES.md)

- **TypeScript:** no `any`, no `// @ts-ignore`. Use `declare global { interface Window {...} }` for globals. `verbatimModuleSyntax` is on, so type-only imports must use `import type`.
- **Firestore rules:** never `allow update: if true`. Comments capped at 300 chars, nicknames at 30.
- **Errors:** every route is wrapped in `<ErrorBoundary>` — don't add per-page try/catch UI.
- **Images:** WebP only, in `public/images/`, referenced as `"images/foo.webp"` from `games.json`. PWA icons: 192×192 and 512×512.
- **i18n:** `en.json` is canonical — write text there first, then translate it into `ja.json` and `ko.json` in the same change. Never leave ja/ko behind on a new game or a new UI string.
- **UI strings:** new UI copy goes into `en.json` `ui` block, accessed via `useUiText()` / `ui()`. Never hardcode user-facing strings in components.
- **Image optimization:** `scripts/optimize-images.cjs` resizes/re-encodes oversized banners in-place to 640w q70 and emits `{slug}-360.webp` variants. Skips icons and `arcadedeck-banner.webp`. Pass `--blog` to run the same loop over `public/images/blog/` (1600w inline, 1200w hero, q72). Run manually after adding large new images.
- **Image naming:** `{slug}.webp` kebab-case lowercase (matches `games.json` slug). System files: `favicon.webp`, `arcadedeck-banner.webp`, `bg.webp`, `icon-192x192.webp`, `icon-512x512.webp`.

## SEO / verification artifacts

- `index.html` head: `msvalidate.01` (Bing), `naver-site-verification` (Naver Search Advisor) and `google-adsense-account` meta tags.
- `public/BingSiteAuth.xml` — Bing Webmaster verification file.
- Domain DNS verification for Bing requires a DNS-only (un-proxied) CNAME on Cloudflare.
- Wikidata entity for the site is **Q141473972** — referenced as `sameAs` / `identifier` in the WebSite + Organization JSON-LD (`prerender-pages.js`, `GameHeadMeta.tsx`, `BlogPost.tsx`) and linked from `/about`. Change it in all four places or nowhere.
