# Changelog

All notable changes to ArcadeDeck are documented here.

## Versioning

`vMAJOR.MINOR.PATCH` — counters never reset; each bumps independently.

- **MAJOR** (`v+1.x.x`) — major update: new systems, breaking saves, big content drops, new game added (one bump per game).
- **MINOR** (`vx.+1.x`) — minor update: new features, UI/UX changes, non-breaking additions, existing game updated.
- **PATCH** (`vx.x.+1`) — balance update: stat/number tuning, bug fixes

## History

- **v34.18.2** (2026-09-15) — Kingdom's Last Stand renamed Kingdom of Ashes - Colosseum (slug kingdom-of-ashes-colosseum, 301 from the old URL in EN/JA/KO): v7.7.2 build with Japanese locale, enemy AI that drafts against your elements, bench + sacrifice + evolution (★3 evolve / ★5 ascend), 2026-09-15 balance pass (SPD as action rate, DEF curve, synergy tiers that fire), cut-in star escalation, perf pass; hosted build now resolves loading/battle/cut-in art under the slug path and skips its own fullscreen when embedded; score posts SCORE_UPDATE on every stage clear; catalogue copy rewritten against the real build in EN/JA/KO (105 heroes, 8 elements, 7-round stages, 33 artifacts); score label Score, tiers 600/2000/4000; blog references renamed; Skyfall v1.4: 2x crisp rendering, level-gated hazards (pillars L2, cracks L3, homing seekers L8), softer difficulty curve, orb drops (Shield / Speed / Score x2 / Ghost / Nova), meteor telegraph rework, mobile fixes (touch anywhere, safe-area canvas, pause on portrait, iOS audio); catalogue copy rewritten against the real build in EN/JA/KO (free movement, close-call combos, Starshards); score label Score, tiers 3000/8000/20000; Polygon Invasion TD v4.6.1 (from v4.1): tiered prism tower bodies with floating evolution crests, HiDPI render scale, additive glow / shockwave rings / status visuals, ~35% fewer blur passes, WebAudio mix rebalance with bus limiter, touch layout (edge docks, drag-to-place, pause button, auto-pause, rotate hint), in-game English / Korean / Japanese, fix for freeze on SPECIAL/BOSS leak, skips own fullscreen when embedded; catalogue copy rewritten against the real build in EN/JA/KO (8 towers, 24 evolutions, 29 enemies, EVO cores, corruption); language EN/KO/JA; peak-wave tiers 10/20/30 to match in-game D/B/S ranks; Kingdom of Ashes - Endless War v0.6.1 (from the May build): matter-js dropped for a grid push-apart step, visual pass (crisp HiDPI render, real vignette, y-sorted units, fixed 32px attack sheets), perf pass (unit leak across waves fixed, 332 → 30 draw calls on a 300-unit field), 13 synthesized SFX with stereo pan + limiter and a mute button, phone pass (tap-to-pan fix, anchored pinch zoom, landscape/portrait HUD docks, iOS audio unlock), in-game English / Korean / Japanese, HUD relayout (info top, actions bottom) and Ascendant Tree X-layout; hosted build now resolves every sprite under the slug path (root-absolute asset paths were 404ing); catalogue copy rewritten against the real build in EN/JA/KO (8 ally classes, 17 enemy types, DPS-matched reinforcements, souls decaying per kill, Aether Shards → Ascendant Tree); language EN/KO/JA
- **v34.17.2** (2026-09-15) — Mythic Defenders: fullscreen gate no longer blocks the game when embedded on arcadedeck.net (host already owns fullscreen; nested request never resolved in Chrome); hero and enemy card art now loads under the hosted slug path (React overlays used root-absolute /heroes, /enemies URLs)
- **v34.17.1** (2026-09-15) — Patch Notes page (/patchnote) rendered from CHANGELOG.md, nav link, prerender + sitemap; My Games layout: full-width progression wall on top (giant Deck Level, bg art moved from header), then My Best Games (top 5 by tier, #ranked) beside Recently Played (last 5); More to Play section removed, empty states link to catalogue; compact title band; readability pass: larger 16:9 thumbs + titles, labelled Gold/Silver/Bronze tier pill with tier-tinted card edge, bold best score, progress bar + "N to Silver" hint per game, Deck stats as tiles, section counts, mobile wrap; JA/KO streak badge strings translated
- **v34.16.1** (2026-09-15) — score postMessage on every hosted game: 11 new hooks (Dice War, Mythic Defenders, Vault of Ashes, Fallen Era, Barrack Defense, Shadow Runner, Omok, Ashen Keys, Debt & Dragons, Tank Battle, Spirit Duel), 5 fixes (Void Survivor origin, Timing Chef keys, Fruit Frenzy/Gem Merge run score, Gate of Hell origin); Dice War PB now counts stages; Omok v1.1 lobby redesign shipped; blog posts renamed Dicefall Chronicles → Kingdom of Ashes - Dice War; blog: Fruit Frenzy v1.3 patch notes post, Personal Bests + mastery badges post
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
