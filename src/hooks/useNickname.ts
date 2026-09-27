import { useState } from 'react';

export const NICKNAME_KEY = 'player_nickname';

// Word pools sized so Adj + Noun + 2 digits ≤ 12 chars (the Home input cap).
const ADJ = ['Neon', 'Iron', 'Lunar', 'Frost', 'Ember', 'Rogue', 'Hyper', 'Astro', 'Blaze', 'Ghost',
  'Nova', 'Storm', 'Zen', 'Wild', 'Pixel', 'Turbo', 'Cyber', 'Solar', 'Dusk', 'Void'];
const NOUN = ['Fox', 'Wolf', 'Raven', 'Pilot', 'Ninja', 'Tiger', 'Viper', 'Mage', 'Ronin', 'Hawk',
  'Panda', 'Comet', 'Golem', 'Racer', 'Sage', 'Titan', 'Otter', 'Lynx', 'Drake', 'Bolt'];
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

export function generateNickname(): string {
  return `${pick(ADJ)}${pick(NOUN)}${10 + Math.floor(Math.random() * 90)}`;
}

// First visit rolls a nickname and persists it. localStorage can throw
// (private mode, quota, disabled storage) — then keep one in memory so the
// name stays stable for the session instead of re-rolling on every read.
let volatile: string | null = null;

export function readNickname(): string {
  try {
    const saved = localStorage.getItem(NICKNAME_KEY);
    if (saved) return saved;
    const fresh = generateNickname();
    localStorage.setItem(NICKNAME_KEY, fresh);
    return fresh;
  } catch {
    volatile ??= generateNickname();
    return volatile;
  }
}

export function saveNickname(name: string): boolean {
  try { localStorage.setItem(NICKNAME_KEY, name); return true; } catch { return false; }
}

export function useNickname(): string {
  const [nickname] = useState<string>(readNickname);
  return nickname;
}
