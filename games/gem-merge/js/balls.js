import { GEMS, GEM_GAP } from './config.js';
import { S, addGemCount } from './state.js';
import { Bodies, Body, World, engine, now } from './physics.js';
import { makeBallSprite } from './gems.js';
import { layerBalls } from './renderer.js';

export function createBall(x, y, level, angle = Math.random() * Math.PI * 2) {
  // Circle body so gems roll; the sprite draws a rounded cut shape inside it (GEM_ROUNDNESS)
  const mBody = Bodies.circle(x, y, GEMS[level - 1].r + GEM_GAP, {
    restitution: 0.2, friction: 0.5, frictionAir: 0.012, density: 0.002,
  });
  Body.setAngle(mBody, angle);
  World.add(engine.world, mBody);
  const sprite = makeBallSprite(level);
  sprite.x = x; sprite.y = y; sprite.rotation = angle;
  layerBalls.addChild(sprite);
  S.ballMap.set(mBody.id, { body: mBody, sprite, level, born: now() });
  addGemCount(level);
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
