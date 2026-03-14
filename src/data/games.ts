import gamesData from './games.json';

export interface Game {
  id: string;
  title: string;
  titleKo?: string;
  description: string;
  descriptionKo?: string;
  fullDescription: string;
  fullDescriptionKo?: string;
  controls?: string;
  controlsKo?: string;
  tips?: string;
  tipsKo?: string;
  lore?: string;
  loreKo?: string;
  features?: string[];
  featuresKo?: string[];
  thumbnail: string;
  genres: string[];
  gameUrl: string;
  aspectRatio?: string; 
  status?: string;
  isOriginal?: boolean;
}

const allGames: Game[] = gamesData as Game[];

// Filter out games that are still in production
export const games = allGames.filter(game => game.status !== 'IN PRODUCTION');
