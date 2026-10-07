import { W, H, WT, GRAVITY } from './config.js';

const { Engine, World, Bodies, Body, Events } = Matter;
export { World, Bodies, Body, Events };
export const engine = Engine.create({ gravity: { x: 0, y: GRAVITY } });

// Fixed 60 Hz step driven from the render loop (Matter 0.19's Runner clamps delta to >= 1000/fps
// per rAF, so it ran 2x fast on 120 Hz screens). Returns 0..1 = how far render is into the next step.
const STEP = 1000 / 60;
let acc = 0;
export function stepPhysics(ms) {
  for (acc += ms; acc >= STEP; acc -= STEP) Engine.update(engine, STEP);
  return acc / STEP;
}

// Simulated ms — the gameplay clock (stops with the loop, steps with physics)
export const now = () => engine.timing.timestamp;

const sWall = { isStatic: true, friction: 0.3, restitution: 0.15 };
// Inner faces match the drawn field: x in [WT, W-WT], floor at H-WT. Thick bodies — polygon corners tunnel easier than circles.
World.add(engine.world, [
  Bodies.rectangle(W / 2, H + WT,  W + WT * 4, WT * 4, sWall), // floor: y in [H-WT, H+3WT]
  Bodies.rectangle(0,     H / 2,   WT * 2,     H * 2,  sWall), // left:  x in [-WT, WT]
  Bodies.rectangle(W,     H / 2,   WT * 2,     H * 2,  sWall), // right: x in [W-WT, W+WT]
]);
