import { TIERS } from './config.js';
import { S } from './state.js';
import { stepPhysics } from './physics.js';
import { app, twinkles, bgOverlay, isMobile } from './renderer.js';
import { tickFX } from './fx.js';
import { tickAnnouncements, tickCombos } from './celebration.js';
import { checkGameOver, restart } from './game.js';
import { drawGuide } from './input.js';
import { initUI } from './ui.js';
import { toggleMute } from './audio.js';

// Init
drawGuide();

initUI();
document.getElementById('restart-btn').addEventListener('click', restart);
document.getElementById('mute-btn').addEventListener('click', toggleMute);

// Cap frame rate on mobile — 30fps is imperceptible for this game type. Rendering only: physics/FX run on dt.
if (isMobile) app.ticker.maxFPS = 30;

// Hidden tab = paused; Ticker.start() resets its clock, so the first frame back has dt ≈ 0 (no jump)
document.addEventListener('visibilitychange', () => document.hidden ? app.ticker.stop() : app.ticker.start());

// Game loop
app.ticker.add(() => {
  const ms = Math.min(app.ticker.deltaMS, 100); // lag spike → at most 6 physics steps
  const dt = ms / 1000;
  const a  = stepPhysics(ms);
  const t  = performance.now() * 0.001;

  // Sprites drawn between the last two physics states (positionPrev → position) — smooth at any refresh rate
  for (const [id, e] of S.ballMap) {
    const b = e.body;
    e.sprite.x = b.positionPrev.x + (b.position.x - b.positionPrev.x) * a;
    e.sprite.y = b.positionPrev.y + (b.position.y - b.positionPrev.y) * a;
    e.sprite.rotation = b.anglePrev + (b.angle - b.anglePrev) * a;
    if (e.sprite.glowRef) e.sprite.glowRef.alpha = 0.52 + 0.48 * Math.sin(t * 1.8 + id * 0.65);
  }

  for (const tw of twinkles) {
    tw.gfx.alpha = 0.10 + 0.90 * (0.5 + 0.5 * Math.sin(tw.phase + t * tw.spd));
  }

  // Tier overlay pulse
  if (S.currentTier > 0) {
    const tier = TIERS[S.currentTier];
    bgOverlay.alpha = tier.overlayMax * (0.6 + 0.4 * Math.sin(t * 1.3));
  }

  tickFX(dt);
  tickAnnouncements(dt); tickCombos(dt);

  // Screen shake: strongest live shake wins; else-branch also recovers from a restart mid-shake
  if (S.screenShakes.length) {
    let mag = 0;
    S.screenShakes = S.screenShakes.filter(s => { mag = Math.max(mag, s.intensity); return (s.time -= dt) > 0; });
    app.stage.x = (Math.random() - 0.5) * mag;
    app.stage.y = (Math.random() - 0.5) * mag;
  } else app.stage.x = app.stage.y = 0;

  if (!S.gameOver && (S.goTick += dt) >= 0.5) { S.goTick = 0; checkGameOver(); }
});
