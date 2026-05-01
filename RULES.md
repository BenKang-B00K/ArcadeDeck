# ArcadeDeck Development Rules

## 1. Adding a New Game — Two-File Workflow

A new game touches only two source files plus one image. Other locale files are translated separately by the user.

1. **`src/data/games.json`** — structural data only (`id`, `slug`, `gameUrl`, `leaderboard`, etc.). No text.
2. **`src/i18n/locales/en.json`** (`games[<id>]` block) — canonical English text.

Other languages (`de.json`, `ja.json`, `ko.json`, …) fall back to English per field. Do not auto-fill them.

### `src/data/games.json` (structural fields only)

```json
{
  "id": "22",
  "slug": "my-game",
  "thumbnail": "images/my-game.webp",
  "genres": ["Action"],
  "gameUrl": "https://my-game.pages.dev/",
  "aspectRatio": "16/9",
  "status": "PLAYABLE",
  "isOriginal": true,
  "language": "EN",
  "badge": "POPULAR",
  "leaderboard": {
    "title": "My Game Leaderboard",
    "primaryLabel": "Score",
    "primaryUnit": "",
    "secondaryLabel": "Level",
    "secondaryUnit": "",
    "dualSort": true,
    "subSortAsc": false
  }
}
```

### `src/i18n/locales/en.json` (add a `games["22"]` block)

```json
{
  "title": "Game Title",
  "description": "Short description in English.",
  "fullDescription": "...",
  "controls": "...",
  "tips": "...",
  "lore": "...",
  "features": ["Feature 1", "Feature 2"]
}
```

### `leaderboard` Field Reference

| Field | Type | Description |
|------|------|------|
| `title` | string | Leaderboard heading |
| `primaryLabel` | string | Primary score label (`"Score"`, `"Waves"`, …) |
| `primaryUnit` | string | Primary score unit (`" pts"`, `"%"`, `""`) |
| `secondaryLabel` | string | Secondary score label. `""` if none |
| `secondaryUnit` | string | Secondary score unit prefix (`"Lv."`) |
| `dualSort` | boolean | When `true`, Firestore query adds `orderBy("subScore")` |
| `subSortAsc` | boolean | When `true`, lower `subScore` wins ties (Gem Merge style) |

### After Adding a Game

- [ ] Add a WebP thumbnail under `public/images/` (filename = `{slug}.webp`, kebab-case)
- [ ] Run `npm run validate` and `npm run build` — sitemap, RSS, and prerender shells regenerate automatically
- [ ] `firebase deploy --only firestore:rules` — only when Firestore rules change

Never edit `public/sitemap.xml`, `public/rss.xml`, or any `dist/play/.../index.html` by hand. They are build outputs.

---

## 2. Security Rules

### Firestore

- `leaderboards.{name, gameId}` are **immutable** after create (enforced by rules)
- `score` must satisfy `0 ≤ score ≤ 10_000_000`
- `comments` text capped at **300 chars**, nicknames at **30 chars**
- Deploy rule changes with: `firebase deploy --only firestore:rules --project ultragames-website`

### postMessage Scoring (Game iframes)

- Process the message only when `event.origin` matches the game's iframe domain
- Require `isFinite(score)` and clamp to `[0, 10_000_000]`
- Drop violating messages **silently** — never `alert` or surface an error

### Forbidden

- `allow update: if true` in Firestore rules
- `// @ts-ignore` — extend types via `declare global` instead
- The `any` TypeScript type — define an explicit interface

---

## 3. Performance Rules

### GlobalLeaderboard (Hall of Fame)

- Firestore query results are cached in `sessionStorage` for **5 minutes** (`arcadedeck_rank_cache`)
- The manual refresh (🔄) button is the **only** invalidator
- Run per-game queries in parallel via `Promise.all` — never serialize them

### CommentSection

- Initial load: **20 latest comments** (`limit(20)`)
- Pagination: cursor-based via `startAfter`
- **Do not** switch to `onSnapshot` — cost and performance impact

### Code Splitting

- Every page except `Home` is loaded with `React.lazy`
- `Suspense` fallback stays a blank shell (`<div style={{ minHeight: '100vh' }} />`)
- New routes must use `lazy(() => import('./pages/NewPage'))`

---

## 4. Code Quality Rules

### TypeScript

- No `any`. Define explicit interfaces.
- Globals (e.g. `window`) live in `declare global { interface Window {…} }`.
- `verbatimModuleSyntax` is on — type-only imports must use `import type`.

### Components

- Every route is wrapped in `<ErrorBoundary>` — do not add per-page try/catch UI.
- Score display strings come from `games.json` `leaderboard` config — never hardcode them.
- Hardcoding game IDs (`id === '7'`) is forbidden. Branch on configuration instead.
- Game text (`title`, `description`, `fullDescription`, `controls`, `tips`, `lore`, `features`) must always be resolved through `getLocalizedString` / `getLocalizedArray`. Direct property access (`game.title`) is not on the `Game` type.

### File Layout

```
src/
├── components/   # Reusable components (CSS colocated)
├── pages/        # Route components
├── data/
│   ├── games.json    # Structural game data (id/slug/gameUrl/leaderboard) — no text
│   └── games.ts      # Game / LeaderboardConfig types + exports
├── i18n/
│   ├── locales/      # Per-language overlays. en.json is canonical.
│   ├── registry.ts   # Supported locales, URL helpers, BCP-47 maps
│   └── store.ts      # useLocale() + URL-prefix-aware boot
├── constants/    # Static config (banned word list, …)
└── firebase.ts   # Firestore initialization
```

---

## 5. i18n Rules

- 11 locales supported: `en`, `de`, `es`, `es-LA`, `fr`, `ja`, `ko`, `pt`, `ru`, `vi`, `zh`.
- `en.json` is the canonical source. Every translatable string lives there first.
- Missing keys in any other locale fall back to English per-field.
- **Never invent translations** for non-English locales without explicit instruction. The user owns those files.
- New UI strings must be added to `en.json` `ui` block. Reference them via `useUiText()` / `ui()` helpers — never hardcode strings in components.
- URL prefix routing is automatic: English at root (`/`, `/play/{slug}`); other locales at `/{lang}/…` (e.g. `/de/play/foo`, `/es-la/`).
- Backups must live **outside** `src/i18n/locales/` (the glob bundles every `*.json` in that dir into the build).

---

## 6. SEO / Prerender Rules

- Every playable route ships a static `index.html` shell with visible H1/body + JSON-LD. **Never** hide the prerendered content with `display:none` or off-screen tricks — that triggers cloaking penalties (Google webspam, AdSense review).
- Per-locale prerender is automatic for `/` and `/play/{slug}`. Each shell carries the full hreflang map, locale-correct `og:locale`, and JSON-LD `inLanguage`.
- When a locale has **no** translation for a given game, the prerender sets `canonical` to the English URL and `<meta name="robots" content="noindex,follow">` to consolidate signals.
- Sitemap (`public/sitemap.xml`) is regenerated on every build — **do not** edit by hand.
- `index.html` head meta tags (`msvalidate.01`, `google-adsense-account`, theme colors, preloads) are managed in source. Per-locale shells inherit them.

---

## 7. Deployment

```bash
# 1. Build (validate → sitemap → rss → tsc → vite build → prerender → 404)
npm run build

# 2. Firestore rules only (when rules change)
firebase deploy --only firestore:rules --project ultragames-website

# 3. Full deploy (Hosting + rules)
firebase deploy --project ultragames-website

# Convenience: build + Firebase Hosting deploy
npm run deploy
```

If Firebase CLI is missing: `npm install -g firebase-tools` then `firebase login`.

---

## 8. Image Rules

- **Format:** WebP only. Use `scripts/optimize-images.cjs` for batch resizing (640w q70).
- **Path:** `public/images/`. Reference from `games.json` as `"images/{slug}.webp"`.
- **Naming:** kebab-case lowercase, matching the game `slug`.
- **PWA icons:** `192×192` and `512×512` are both required (manifest).
- **Aspect ratio:** thumbnail aspect should match the game's `aspectRatio` field.
- **System images:** `favicon.webp`, `arcadedeck-banner.webp`, `bg.webp`, `icon-192x192.webp`, `icon-512x512.webp`. The optimizer skips these.
