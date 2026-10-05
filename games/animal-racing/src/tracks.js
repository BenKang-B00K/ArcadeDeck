// Pure track data (no DOM, no three.js). Points: [x, y, z, width?, bankDeg?] in metres, y up, a closed loop that
// starts mid start-straight (s = 0 is the finish line). Feature positions are lap fractions; lengths are metres.
// Bank: + lowers the right edge (right-hand turns), - lowers the left edge.

export const toy = {
  id: 'toy', song: 'toy', width: 14,
  points: [
    [0, 6, 9], [0, 6, -56], // start straight on the desk
    [-12, 5, -90, 14, -6], [-41, 2, -111, 14, -8], [-76, 0, -114], // left sweeper down the book stack (-6 m)
    [-107, 0.8, -102], [-138, 0, -117], [-168, 0.8, -104], // blanket esses
    [-199, 1.2, -102, 13], [-240, 1.2, -102, 13], // ramp jump between two books
    [-264, 1, -93, 15, -10], [-275, 1, -73, 15, -12], [-264, 1, -54, 15, -10], [-242, 0.8, -50], // hairpin round the d20
    [-195, 0.5, -48], [-135, 0.5, -46], [-84, 0.5, -46], // back straight (rung strip)
    [-52, 1, -37, 15], [-43, 2, -9, 15], // vinyl record turntable
    [-45, 4, 28], [-43, 5, 65, 14, -6], [-23, 6, 86, 14, -8], [-2, 6, 71, 14, -4], // climb back onto the desk, U-turn
  ],
  features: [
    { type: 'ramp', s: 0.372 },
    { type: 'rungs', s: 0.615, len: 36, n: 8 },
    { type: 'carousel', s: 0.757, len: 22, spin: 1 },
    { type: 'mover', s: 0.69 }, // a moving wall at the end of the back straight
    { type: 'wormhole', a: 0.412, b: 0.585, side: 1 }, // A on the right before the hairpin, B on the left of the back straight
    { type: 'items', s: 0.05 }, { type: 'items', s: 0.335 }, { type: 'items', s: 0.55 },
    { type: 'coins', s: 0.015, d: -3.5 }, { type: 'coins', s: 0.1, d: 3 }, { type: 'coins', s: 0.2, d: -2 }, { type: 'coins', s: 0.265, d: 2.5 },
    { type: 'coins', s: 0.43, d: -4 }, { type: 'coins', s: 0.49, d: 3 }, { type: 'coins', s: 0.67, d: -3 }, { type: 'coins', s: 0.71, d: 3 },
    { type: 'coins', s: 0.84, d: 2.5 }, { type: 'coins', s: 0.9, d: -3 },
  ],
  theme: {
    sky: ['#1d0f45', '#0f0828', '#080720'], fog: '#110a2c', fogNear: 90, fogFar: 430,
    road: '#150a33', edge: '#ff5d8f', rails: ['#ff5d8f', '#9b6bff', '#4fd8ff'], ground: '#1c1250',
    hemi: ['#a99cf0', '#140b30', 0.7], key: ['#ffe2c4', 1.35],
  },
};

// Neon Arcade Circuit: a floating track in deep space, the fastest of the four. Long start straight, banked
// high-speed sweepers, a chicane of rung strips, a long arcing wormhole section and a big drop jump
export const neon = {
  id: 'neon', song: 'neon', width: 15,
  points: [
    [0, 20, 0], [114, 20, 0], // start straight
    [179, 23, 21, 15, 12], [211, 27, 80, 15, 18], [190, 30, 141, 15, 16], // banked right-hand sweepers
    [133, 29, 173, 15, -12], [72, 27, 169, 15, -6], // left sweeper
    [34, 25, 184, 14], [4, 25, 169, 14], [-27, 25, 185, 14], // chicane (rung strips)
    [-87, 27, 194, 15, 8], [-150, 31, 163, 15, 14], [-184, 33, 106, 15, 16], [-176, 31, 52, 15, 12], // long arcing wormhole section
    [-156, 30, 27, 15], [-122, 21, 11, 15], [-72, 20, 2, 15, 4], // big drop jump, then the last turn onto the straight
  ],
  features: [
    { type: 'items', s: 0.07 }, { type: 'items', s: 0.42 }, { type: 'items', s: 0.66 },
    { type: 'rungs', s: 0.455, len: 30, n: 8 }, { type: 'rungs', s: 0.505, len: 30, n: 8 },
    { type: 'ramp', s: 0.875 },
    { type: 'mover', s: 0.6 }, // a moving wall after the chicane
    { type: 'wormhole', a: 0.72, b: 0.935, side: -1 }, // A mid-track, B on the inside of the last turn
    { type: 'coins', s: 0.02, d: 3 }, { type: 'coins', s: 0.13, d: -3 }, { type: 'coins', s: 0.22, d: 3.5 }, { type: 'coins', s: 0.31, d: -3 },
    { type: 'coins', s: 0.38, d: 2 }, { type: 'coins', s: 0.56, d: -3.5 }, { type: 'coins', s: 0.7, d: 3 }, { type: 'coins', s: 0.78, d: -2 },
    { type: 'coins', s: 0.84, d: 0 }, { type: 'coins', s: 0.96, d: -3 },
  ],
  theme: {
    sky: ['#171046', '#0e0a30', '#080720'], fog: '#0a0826', fogNear: 160, fogFar: 760,
    road: '#0b0820', edge: '#4fd8ff', rails: ['#ff5d8f', '#4fd8ff', '#9b6bff'], ground: null, slab: 1.4,
    hemi: ['#9b8cff', '#0a0626', 0.75], key: ['#d8e4ff', 1.3], roadGloss: true, env: 'space',
  },
};

// Storybook Meadow: the only daytime track, the technical one. A dirt road with grass shoulders (off-road slows you)
// over rolling hills, a narrow wooden ladder bridge over a stream (no rails there: fall in and you're fished out),
// a gift-box slalom, a ramp over the paper-boat stream, and a spinning music-box stage
export const story = {
  id: 'story', song: 'story', width: 13, shoulder: 3,
  points: [
    [-60, 2, -90], [0, 2, -108], // start straight along the top of the meadow
    [50, 2, -110], // paper-boat stream ramp
    [100, 3, -92, 13], [128, 5, -50, 13, 6], // music-box stage, then the right sweeper down
    [150, 7, 0, 13, 6], [168, 9, 60, 13, 8], [140, 8, 112], // over the hilltop
    [85, 4, 128], [64, 1.6, 136, 13], [40, 1, 142, 9], [-10, 1, 150, 9], [-34, 1.6, 147, 13], // down to the wooden ladder bridge (narrow) over the stream
    [-55, 4, 140], [-95, 7, 112], // climb
    [-110, 6, 70, 14], [-98, 5, 30, 14], [-120, 4, -8, 14], [-104, 3, -48, 14], // gift-box slalom, back to the line
  ],
  features: [
    { type: 'water', s: 0.545, len: 88 }, // the bridge over the stream: off the planks = splash
    { type: 'items', s: 0.045 }, { type: 'items', s: 0.4 }, { type: 'items', s: 0.665 },
    { type: 'ramp', s: 0.13 },
    { type: 'carousel', s: 0.17, len: 20, spin: -1 },
    { type: 'mover', s: 0.495 }, // a moving wall on the way down to the bridge
    { type: 'wormhole', a: 0.3, b: 0.705, side: -1 }, // a swirl-portal arch before the hilltop, its twin after the climb
    { type: 'prop', kind: 'gift', s: 0.8, d: -3 }, { type: 'prop', kind: 'gift', s: 0.835, d: 3.2 }, { type: 'prop', kind: 'gift', s: 0.87, d: -3.2 }, { type: 'prop', kind: 'gift', s: 0.905, d: -3.5 }, // on the outside of each bend, so the slalom line threads them
    { type: 'coins', s: 0.02, d: 2 }, { type: 'coins', s: 0.09, d: -2.5 }, { type: 'coins', s: 0.24, d: 3 }, { type: 'coins', s: 0.35, d: -3 },
    { type: 'coins', s: 0.46, d: 2 }, { type: 'coins', s: 0.57, d: 0 }, { type: 'coins', s: 0.64, d: -2 }, { type: 'coins', s: 0.76, d: 3 },
    { type: 'coins', s: 0.885, d: 0 }, { type: 'coins', s: 0.96, d: -2 },
  ],
  theme: {
    sky: ['#9fd0ff', '#d9ecff', '#fbf3e2'], fog: '#f3ead6', fogNear: 120, fogFar: 520,
    road: '#c9a06a', edge: '#fff6dc', rails: ['#b07a4a', '#c98a5a', '#a86e40'], ground: '#9ed77f',
    hemi: ['#fffbe8', '#7fb36a', 1.5], key: ['#fff1d6', 2.4], env: 'day', toon: true, wood: true, day: true, carousel: 'musicbox',
  },
};

// Festival Night: the Grand Prix finale, a Korean lotus-lantern festival. A stone-lantern path, a tunnel of hongsalmun gates
// hung with lanterns (the rung strip), a stone arch bridge over a lotus pond with a crest jump, a whirlpool wormhole pair,
// a spinning buk-drum stage and giant lotus lanterns on the last straight
export const fest = {
  id: 'fest', song: 'fest', width: 14,
  points: [
    [0, 2, 0], [130, 2, 0], // stone-lantern path (start)
    [195, 3, 28, 14, 10], [215, 4, 95, 14, 10], [195, 4, 160], // right sweeper
    [130, 3, 185], [30, 3, 190], // hongsalmun gate tunnel
    [-35, 3.5, 175], [-80, 7.5, 145, 13], [-115, 3, 115], // stone arch bridge over the lotus pond, crest jump
    [-160, 2, 70, 15, -8], [-172, 2, 10, 15, -6], // whirlpools
    [-150, 2, -40, 15], [-100, 2, -55], // buk drum stage
    [-50, 2, -25], // lotus-lantern straight onto the line
  ],
  features: [
    { type: 'items', s: 0.06 }, { type: 'items', s: 0.37 }, { type: 'items', s: 0.69 },
    { type: 'rungs', s: 0.425, len: 72, n: 8 }, // a gate overhead, a lit rung under each
    { type: 'ramp', s: 0.612 }, // the bridge's crest
    { type: 'wormhole', a: 0.725, b: 0.915, side: -1 }, // whirlpools: A on the west curve, B after the drum stage (the stage spins you away from it)
    { type: 'carousel', s: 0.855, len: 22, spin: 1 },
    { type: 'mover', s: 0.565 }, // a moving wall on the run up to the bridge
    { type: 'prop', kind: 'lotus', s: 0.952, d: -3.2, r: 1.1 }, { type: 'prop', kind: 'lotus', s: 0.976, d: 3.2, r: 1.1 },
    { type: 'coins', s: 0.02, d: -3 }, { type: 'coins', s: 0.1, d: 3 }, { type: 'coins', s: 0.22, d: -3 }, { type: 'coins', s: 0.3, d: 2.5 },
    { type: 'coins', s: 0.53, d: 0 }, { type: 'coins', s: 0.58, d: -2.5 }, { type: 'coins', s: 0.66, d: 2.5 }, { type: 'coins', s: 0.77, d: -3 },
    { type: 'coins', s: 0.83, d: 3 }, { type: 'coins', s: 0.93, d: 0 },
  ],
  theme: {
    sky: ['#0e1838', '#1d2f5a', '#2b3f70'], fog: '#18264a', fogNear: 120, fogFar: 600,
    road: '#6a1418', edge: '#ffb547', rails: ['#c8321e', '#d9442c', '#b42a18'], ground: '#15302c',
    hemi: ['#9fb4ff', '#1a1430', 0.9], key: ['#ffd9b0', 1.3], env: 'dusk', lacquer: true, carousel: 'buk', holes: ['#2f6fd1', '#e8f4ff'],
  },
};

export const TRACKS = { toy, neon, story, fest };
