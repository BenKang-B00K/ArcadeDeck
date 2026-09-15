import { TIERS } from './config.js';
import { S } from './state.js';
import { app, twinkles, bgOverlay, isMobile } from './renderer.js';
import { tickFX } from './fx.js';
import { tickAnnouncements, tickCombos } from './celebration.js';
import { checkGameOver, restart } from './game.js';
import { drawGuide } from './input.js';
import { initUI } from './ui.js';
import { toggleMute } from './audio.js';

// Init
document.getElementById('best').textContent = S.best.toLocaleString();
drawGuide();
window.addEventListener('beforeunload', () => localStorage.setItem('gmBest', S.best));

initUI();
document.getElementById('restart-btn').addEventListener('click', restart);
document.getElementById('mute-btn').addEventListener('click', toggleMute);

// Cap frame rate on mobile — 30fps is imperceptible for this game type
if (isMobile) app.ticker.maxFPS = 30;

// Game loop
let _frameCount = 0;
app.ticker.add(() => {
  _frameCount++;
  const t = Date.now() * 0.001;
  // Throttle flag: cosmetic-only animations run every 3rd frame
  const cosmetic = (_frameCount % 3 === 0);

  for (const [id, e] of S.ballMap) {
    e.sprite.x = e.body.position.x;
    e.sprite.y = e.body.position.y;
    e.sprite.rotation = e.body.angle;
    if (cosmetic && e.sprite.glowRef) {
      e.sprite.glowRef.alpha = 0.52 + 0.48 * Math.sin(t * 1.8 + id * 0.65);
    }
  }

  if (cosmetic) {
    for (const tw of twinkles) {
      tw.gfx.alpha = 0.10 + 0.90 * (0.5 + 0.5 * Math.sin(tw.phase + t * tw.spd));
    }

    // Tier overlay pulse
    if (S.currentTier > 0) {
      const tier = TIERS[S.currentTier];
      bgOverlay.alpha = tier.overlayMax * (0.6 + 0.4 * Math.sin(t * 1.3));
    }
  }

  tickFX();
  tickAnnouncements(); tickCombos();

  // Screen shake: strongest live shake wins; else-branch also recovers from a restart mid-shake
  if (S.screenShakes.length) {
    let mag = 0;
    S.screenShakes = S.screenShakes.filter(s => { mag = Math.max(mag, s.intensity); return --s.frames > 0; });
    app.stage.x = (Math.random() - 0.5) * mag;
    app.stage.y = (Math.random() - 0.5) * mag;
  } else app.stage.x = app.stage.y = 0;

  if (!S.gameOver && ++S.goTick >= 30) { S.goTick = 0; checkGameOver(); }
});
