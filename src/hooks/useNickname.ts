import { useState } from 'react';

export const NICKNAME_KEY = 'player_nickname';
export const DEFAULT_NICKNAME = 'Explorer';

// localStorage can throw (private mode, quota, disabled storage) — never let the
// nickname take the page down with it.
export function readNickname(): string {
  try { return localStorage.getItem(NICKNAME_KEY) || DEFAULT_NICKNAME; } catch { return DEFAULT_NICKNAME; }
}

export function saveNickname(name: string): boolean {
  try { localStorage.setItem(NICKNAME_KEY, name); return true; } catch { return false; }
}

export function useNickname(): string {
  const [nickname] = useState<string>(readNickname);
  return nickname;
}
