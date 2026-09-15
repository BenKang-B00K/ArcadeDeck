# Changelog

All notable changes to ArcadeDeck are documented here.

## Versioning

`vMAJOR.MINOR.PATCH` — counters never reset; each bumps independently.

- **MAJOR** (`v+1.x.x`) — major update: new systems, breaking saves, big content drops, new game added (one bump per game).
- **MINOR** (`vx.+1.x`) — minor update: new features, UI/UX changes, non-breaking additions, existing game updated.
- **PATCH** (`vx.x.+1`) — balance update: stat/number tuning, bug fixes

## History

- **v34.17.2** (2026-09-15) — Mythic Defenders: fullscreen gate no longer blocks the game when embedded on arcadedeck.net (host already owns fullscreen; nested request never resolved in Chrome); hero and enemy card art now loads under the hosted slug path (React overlays used root-absolute /heroes, /enemies URLs)
- **v34.16.1** (2026-09-15) — score postMessage on every hosted game: 11 new hooks (Dice War, Mythic Defenders, Vault of Ashes, Fallen Era, Barrack Defense, Shadow Runner, Omok, Ashen Keys, Debt & Dragons, Tank Battle, Spirit Duel), 5 fixes (Void Survivor origin, Timing Chef keys, Fruit Frenzy/Gem Merge run score, Gate of Hell origin); Dice War PB now counts stages; Omok v1.1 lobby redesign shipped; blog posts renamed Dicefall Chronicles → Kingdom of Ashes - Dice War
- **v34.15.1** (2026-09-15) — Kingdom of Ashes - Dice War: stage-select Dungeon map, JA locale, all-18-unit sprite art pass, 2.5D dice, rendering overhaul, tooltips + hover previews, catalogue copy rewritten against the real build; Triangle Battle v3.1: 2–6 players, +2 all-own-color bonus, timeout hands opponent a free line, How-to-Play guide, HiDPI + perf pass, catalogue copy rewritten
- **v34.14.1** (2026-09-15) — game cards: all genres as pills with gold ring on main genre, 2-line titles, PC / Mobile badge; language dropdown order English / Korean / Japanese
- **v34.13.1** (2026-09-15) — Fruit Frenzy v1.3: shoot bombs, ammo crates, fruit moves, seeking bombs, JA locale, HiDPI + pointer lock
- **v34.12.1** (2026-09-14) — Shadow Runner, AshenKeys, Debt & Dragons, Endless Runner; game page header redesign, read-friendly info sections
- **v30.11.1** (2026-09-10) — Barrack Defense, Kingdom of Ashes - Fallen Era; Gate of Hell v3.0
- **v28.11.1** (2026-09-08) — game builds hosted in-repo on one Pages project
- **v28.10.1** (2026-07-24) — ranking system removed; locales trimmed to en/ko/ja; ja/ko parity
- **v27.10.1** (2026-06-21) — Neon Stack, Vault of Ashes: Fallen Era
- **v25.10.1** (2026-05-26) — Firestore quota failsafe; Endless War URL fix
- **v25.10.0** (2026-05-25) — Home hero/trending/sticky filters, click-to-start player, structured i18n game content
- **v25.9.0** (2026-05-21) — Entrepreneur Tycoon; Fractured Realm microsite; AdSense content fixes
- **v24.9.0** (2026-05-17) — Falling Dodger; UPDATE badges
- **v23.9.0** (2026-05-16) — Recently Updated section; Gate of Hell v2.0 + art refresh
- **v23.8.0** (2026-05-12) — player forum (threads, replies)
- **v22.8.0** (2026-05-03) — skeletons, toasts, transitions, achievements, prefetch; 11-locale static pages
- **v22.7.0** (2026-05-01) — Mythic Defender: Heroes Returns, Just Jump; genre page; responsive srcset
- **v20.7.0** (2026-04-29) — blog system, i18n, GamePlayer split
- **v19.7.0** (2026-04-27) — Ko-fi links
- **v19.6.0** (2026-04-26) — Polygon Invasion TD; Firebase Hosting + security headers; perf/a11y pass
- **v18.6.0** (2026-04-19) — Spirit Duel
- **v17.6.0** (2026-04-18) — Fredoka font, light/dark theme toggle
- **v17.5.0** (2026-04-17) — Skyfall
- **v16.5.0** (2026-04-16) — Tank Battle: 1v1; cloaking removed, deeper SEO content
- **v15.5.0** (2026-04-10) — design system, accessibility, layout overhaul
- **v15.4.0** (2026-04-07) — Triangle Battle!; Local Co-op badge
- **v14.4.0** (2026-04-05) — iOS compat, mobile portrait/landscape overhaul, code quality pass
- **v14.3.0** (2026-04-03) — Kingdom's Last Stand; new-game template
- **v13.3.0** (2026-04-02) — slug URLs, SEO, social sharing, game page UX
- **v13.2.0** (2026-03-29) — Fruit Frenzy; PWA (install banner, update toast); WebP images
- **v12.2.0** (2026-03-28) — Global Leaderboard UI
- **v12.1.0** (2026-03-27) — Timing Chef; dynamic aspect ratio; language badges; refresh white-screen fix
- **v11.1.0** (2026-03-21) — 404 page; AdSense compliance; 4×2 grid
- **v11.0.0** (2026-03-14) — launch with 11 games: Gate of Hell, Galaxy Launch, Idle Avatar RPG, GEM MERGE, Trade Tycoon, 15s Click Challenge, OMOK, 40th Century: Void Survivor, Endless War, Dicefall Chronicles, Heroes of the Last Nexus; leaderboard
