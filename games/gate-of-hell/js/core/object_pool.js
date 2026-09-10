/* object_pool.js - High Performance Object Reuse System */

class ObjectPool {
    constructor(createFn, initialSize = 20) {
        this.createFn = createFn;
        this.pool = [];
        this.active = [];

        // Pre-warm the pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    /**
     * Obtains an object from the pool.
     */
    get() {
        const obj = this.pool.length > 0 ? this.pool.pop() : this.createFn();
        this.active.push(obj);
        return obj;
    }

    /**
     * Returns an object to the pool for later reuse.
     */
    release(obj) {
        const idx = this.active.indexOf(obj);
        if (idx !== -1) {
            this.active.splice(idx, 1);
            this.pool.push(obj);
        }
    }

    /**
     * Convenience method to release by index to avoid indexOf overhead.
     */
    releaseAt(idx) {
        const obj = this.active.splice(idx, 1)[0];
        if (obj) this.pool.push(obj);
    }

    /**
     * Clears all active objects (useful for game reset).
     */
    reset() {
        while (this.active.length > 0) {
            this.pool.push(this.active.pop());
        }
    }
}

// Global Pools Registry
window.Pools = {
    particles: new ObjectPool(() => ({ x: 0, y: 0, vx: 0, vy: 0, g: 0, fr: 1, color: '', size: 0, life: 0, decay: 0 }), 200),
    floatingTexts: new ObjectPool(() => ({ text: '', lx: 0, ly: 0, color: '', size: 0, life: 0, age: 0, punch: 1, rot: 0, vx: 0, vy: 0 }), 40),
    soulEssences: new ObjectPool(() => ({ x: 0, y: 0, vx: 0, vy: 0, gravity: 0, life: 0, decay: 0, rotation: 0, rotSpeed: 0 }), 30),
    itemDrops: new ObjectPool(() => ({ x: 0, y: 0, vx: 0, vy: 0, gravity: 0, life: 0, decay: 0, rotation: 0, rotSpeed: 0, icon: '', shadowColor: '' }), 10),
    projectiles: new ObjectPool(() => ({ x: 0, y: 0, sx: 0, sy: 0, ox: 0, oy: 0, arc: 0, travelled: 0, target: null, tower: null, speed: 0, life: 0, angle: 0, trail: [] }), 50),
    hitEffects: new ObjectPool(() => ({ x: 0, y: 0, color: '', life: 0, radius: 0, maxRadius: 0 }), 100),
    promotionBursts: new ObjectPool(() => ({ x: 0, y: 0, life: 0, tier: 1 }), 10),
    banishEffects: new ObjectPool(() => ({ x: 0, y: 0, life: 0 }), 10),
    purgeEffects: new ObjectPool(() => ({ x: 0, y: 0, life: 0 }), 5),
    summonCircles: new ObjectPool(() => ({ x: 0, y: 0, life: 0, rot: 0 }), 10)
};
