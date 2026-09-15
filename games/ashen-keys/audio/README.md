# Audio assets

Drop audio files here and they light up automatically — the engine
(`src/game/audio.ts`) fetch+decodes each slot at battle mount and **degrades
silently** if a file is missing (that slot just stays quiet), exactly like a
not-yet-authored VFX sheet. No code change needed to add the real audio; the
paths below are the contract.

Author the per-slot generation prompts in **`docs/audio-vfx.html`** (the audio
sibling of `docs/skill-sprites.html`).

## Layout (22 slots)

```
public/audio/
├── basic/
│   └── strike.mp3            one basic-strike clip — pitch-varied per hit by the sink
├── elements/                 skill-cast SFX, keyed by the skill's PRIMARY element
│   ├── fire.mp3
│   ├── ice.mp3
│   ├── shadow.mp3
│   ├── lightning.mp3
│   ├── blood.mp3
│   ├── nature.mp3
│   ├── holy.mp3
│   └── neutral.mp3
├── enemy/                    "attacked" impact, by enemy tier (throttled per foe)
│   ├── hit-fodder.mp3
│   ├── hit-common.mp3
│   ├── hit-elite.mp3
│   └── hit-boss.mp3
├── bgm/                      looping battle music, by current-foe tier (crossfaded)
│   ├── fodder.mp3
│   ├── common.mp3
│   ├── elite.mp3
│   └── boss.mp3
└── ui/
    ├── node-allocate.mp3     upgrade-node purchased
    ├── level-up.mp3          Attack Level up
    ├── crit-cap.mp3          combo first pushes CRIT chance to 100% (rare sting)
    ├── double-cap.mp3        combo first pushes DOUBLE-STRIKE chance to 100% (rare sting)
    └── enemy-die.mp3         a foe dies
```

## Format

- **Container:** `.mp3` (broad browser support; `decodeAudioData` handles it). `.ogg`/`.wav` also decode — keep the `.mp3` name in the path or update `AUDIO` in `src/game/audio.ts`.
- **SFX (basic / elements / enemy hit / ui):** short one-shots, ≤ ~1s, punchy transient, trimmed silence, normalized.
- **BGM (bgm/*):** seamless **loops**, ~30–90s, no lead-in silence (the engine sets `loop = true` and crossfades on tier change).
- Keep levels consistent across SFX; the enemy-hit layer is played a touch under the weapon/cast layer (gain 0.7 in the sink). Master/SFX/BGM volume + mute are user-controlled (HUD control) and persist to the `ashenkeys-audio` localStorage key.

## Sources

All clips from [Pixabay](https://pixabay.com) (Pixabay Content License — free for
commercial use, no attribution required). SFX were trimmed (leading/trailing
silence) and loudness-normalized to −14 LUFS; BGM re-encoded to 96 kbps @ −18 LUFS.

| slot | Pixabay title | source |
|---|---|---|
| basic/strike | Single Key Press | audio/2025/08/23/audio_b7ff018461.mp3 |
| elements/fire | Fireball Impact | audio/2025/05/30/audio_6af56c1252.mp3 |
| elements/ice | Ice Spell Impact | audio/2025/12/13/audio_94bed4eb73.mp3 |
| elements/shadow | Epic Spell Impact | audio/2026/02/02/audio_bcd3b5a8b6.mp3 |
| elements/lightning | Lightning Spell | audio/2025/08/07/audio_fa49b5bb27.mp3 |
| elements/blood | Blood Splatter | audio/2022/10/09/audio_11c9a721fe.mp3 |
| elements/nature | Earth Spell | audio/2025/08/23/audio_6fde8cd005.mp3 |
| elements/holy | Magic Twinkle | audio/2024/09/27/audio_13e824e22a.mp3 |
| elements/neutral | Magic Teleport Whoosh | audio/2025/06/02/audio_62fa4e6890.mp3 |
| enemy/hit-fodder | Punch Impact Hit | audio/2026/07/14/audio_aba33aba5f.mp3 |
| enemy/hit-common | Sword Blade Slicing Flesh | audio/2025/06/02/audio_58f7e1a157.mp3 |
| enemy/hit-elite | Hard Heavy Impact | audio/2026/04/06/audio_e64b6942ee.mp3 |
| enemy/hit-boss | Giant insect monster | audio/2026/08/06/audio_a7fa8fd63d.mp3 |
| ui/node-allocate | UI Button Click | audio/2023/04/23/audio_4de3f97248.mp3 |
| ui/level-up | Level Up 06 | audio/2025/07/04/audio_5ed2f66d0d.mp3 |
| ui/crit-cap | dramatic sting | audio/2022/09/02/audio_adce41af91.mp3 |
| ui/double-cap | Twinkle/Sparkle | audio/2022/07/15/audio_89f13f8631.mp3 |
| ui/enemy-die | Giant insect death 3 | audio/2026/08/06/audio_f6aa3ea863.mp3 |
| bgm/fodder | Dark Fantasy Ambient (Dungeon Synth) | audio/2024/10/07/audio_5dbdeb2487.mp3 |
| bgm/common | Battle | audio/2024/03/26/audio_c0cda49984.mp3 |
| bgm/elite | Intense - Intense Music | audio/2026/07/30/audio_9b5fa5d338.mp3 |
| bgm/boss | Battle Boss Fight Game Music | audio/2026/08/10/audio_c4d25be510.mp3 |

Paths above are relative to `https://cdn.pixabay.com/`.
