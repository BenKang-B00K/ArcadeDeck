import { W, H, WT, GRAVITY } from './config.js';

const { Engine, World, Bodies, Body, Runner, Events } = Matter;
export { World, Bodies, Body, Events };
export const engine = Engine.create({ gravity: { x: 0, y: GRAVITY } });
Runner.run(Runner.create({ fps: 60 }), engine);

const sWall = { isStatic: true, friction: 0.3, restitution: 0.15 };
// Inner faces match the drawn field: x in [WT, W-WT], floor at H-WT. Thick bodies — polygon corners tunnel easier than circles.
World.add(engine.world, [
  Bodies.rectangle(W / 2, H + WT,  W + WT * 4, WT * 4, sWall), // floor: y in [H-WT, H+3WT]
  Bodies.rectangle(0,     H / 2,   WT * 2,     H * 2,  sWall), // left:  x in [-WT, WT]
  Bodies.rectangle(W,     H / 2,   WT * 2,     H * 2,  sWall), // right: x in [W-WT, W+WT]
]);
