import { W, H, WT, GRAVITY } from './config.js';

export const { Engine, World, Bodies, Body, Runner, Events } = Matter;
export const engine = Engine.create({ gravity: { x: 0, y: GRAVITY } });
const runner = Runner.create({ fps: 60 });
Runner.run(runner, engine);

const sWall = { isStatic: true, label: 'wall', friction: 0.3, restitution: 0.15 };
World.add(engine.world, [
  Bodies.rectangle(W / 2,      H + WT / 2,    W + WT * 4, WT,    sWall),
  Bodies.rectangle(-WT / 2,    H / 2,         WT,         H * 2, sWall),
  Bodies.rectangle(W + WT / 2, H / 2,         WT,         H * 2, sWall),
]);
