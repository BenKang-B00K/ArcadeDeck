import { useState } from 'react';

export const NICKNAME_KEY = 'player_nickname';
export const DEFAULT_NICKNAME = 'Explorer';

export function useNickname(): string {
  const [nickname] = useState<string>(() => localStorage.getItem(NICKNAME_KEY) || DEFAULT_NICKNAME);
  return nickname;
}
