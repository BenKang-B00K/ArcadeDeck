import { TIERS } from './config.js';
import { S, rndLevel } from './state.js';
import { app, twinkles, bgOverlay, isMobile } from './renderer.js';
import { tickParticles, tickRings, tickFlashes, tickPopups } from './fx.js';
import { tickAnnouncements, tickCombos } from './celebration.js';
import { checkGameOver, restart } from './game.js';
import { drawGuide } from './input.js';
import { drawNextUI, buildPanels, buildHelpModal, buildFloatingGems, applyScale, buildInventory, buildCatalog, openCatalog } from './ui.js';
import { toggleMute } from './audio.js';

// Init
S.nextLevel = rndLevel();
document.getElementById('best').textContent = S.best.toLocaleString();
drawGuide();
drawNextUI();
window.addEventListener('beforeunload', () => localStorage.setItem('gmBest', S.best));

applyScale();
window.addEventListener('resize', applyScale);

buildPanels();
buildHelpModal();
buildFloatingGems();
buildInventory();
buildCatalog();

document.getElementById('restart-btn').addEventListener('click', restart);
document.getElementById('mute-btn').addEventListener('click', toggleMute);
document.getElementById('catalog-btn').addEventListener('click', openCatalog);

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

  tickParticles(); tickRings(); tickFlashes(); tickPopups();
  tickAnnouncements(); tickCombos();

  // Screen shake
  if (S.screenShakes.length) {
    const s = S.screenShakes[S.screenShakes.length - 1];
    app.stage.x = (Math.random() - 0.5) * s.intensity;
    app.stage.y = (Math.random() - 0.5) * s.intensity;
    s.frames--;
    if (s.frames <= 0) { S.screenShakes.pop(); app.stage.x = 0; app.stage.y = 0; }
  }

  if (!S.gameOver && ++S.goTick >= 30) { S.goTick = 0; checkGameOver(); }
});
