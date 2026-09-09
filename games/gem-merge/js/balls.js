import { GEMS } from './config.js';
import { S, addGemCount } from './state.js';
import { Bodies, World, engine } from './physics.js';
import { makeBallSprite } from './gems.js';
import { layerBalls } from './renderer.js';

export function createBall(x, y, level) {
  const gem   = GEMS[level - 1];
  const mBody = Bodies.circle(x, y, gem.r, {
    restitution: 0.2, friction: 0.5, frictionAir: 0.012,
    density: 0.002, label: 'ball',
  });
  mBody.gameLevel = level;
  World.add(engine.world, mBody);
  const sprite = makeBallSprite(level);
  sprite.x = x; sprite.y = y;
  layerBalls.addChild(sprite);
  S.ballMap.set(mBody.id, { body: mBody, sprite, level, born: Date.now() });

  // Track lifetime acquisition of gems
  try { addGemCount(level); } catch (e) { /* ignore */ }

  return mBody;
}

export function removeBall(id) {
  const e = S.ballMap.get(id);
  if (!e) return;
  World.remove(engine.world, e.body);
  layerBalls.removeChild(e.sprite);
  e.sprite.destroy({ children: true });
  S.ballMap.delete(id);
}
