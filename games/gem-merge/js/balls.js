import { S, addGemCount } from './state.js';
import { Bodies, Body, World, engine } from './physics.js';
import { makeBallSprite, gemVerts } from './gems.js';
import { layerBalls } from './renderer.js';

export function createBall(x, y, level, angle = Math.random() * Math.PI * 2) {
  // ponytail: concave stars decompose via poly-decomp (index.html); drop that script and Matter falls back to convex hulls
  const mBody = Bodies.fromVertices(x, y, gemVerts(level), {
    restitution: 0.2, friction: 0.5, frictionAir: 0.012, density: 0.002,
  });
  Body.setAngle(mBody, angle);
  World.add(engine.world, mBody);
  const sprite = makeBallSprite(level);
  sprite.x = x; sprite.y = y; sprite.rotation = angle;
  layerBalls.addChild(sprite);
  S.ballMap.set(mBody.id, { body: mBody, sprite, level, born: Date.now() });
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
