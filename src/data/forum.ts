export const FORUM_CATEGORIES = [
  { id: 'general', uiKey: 'forumCategoryGeneral', fallback: 'General' },
  { id: 'games', uiKey: 'forumCategoryGames', fallback: 'Game Talk' },
  { id: 'suggestions', uiKey: 'forumCategorySuggestions', fallback: 'Suggestions' },
  { id: 'off-topic', uiKey: 'forumCategoryOffTopic', fallback: 'Off-Topic' },
] as const;

export type ForumCategoryId = (typeof FORUM_CATEGORIES)[number]['id'];

export const FORUM_TITLE_MAX = 120;
export const FORUM_BODY_MAX = 5000;
export const FORUM_REPLY_MAX = 2000;
export const FORUM_SUBMIT_COOLDOWN_MS = 10_000;
export const FORUM_THREAD_PAGE_SIZE = 20;
export const FORUM_REPLY_PAGE_SIZE = 30;

export interface FirestoreTimestamp {
  toDate(): Date;
}

export interface ForumThread {
  id: string;
  title: string;
  body: string;
  category: ForumCategoryId;
  nickname: string;
  replyCount: number;
  createdAt: FirestoreTimestamp | null;
  lastActivity: FirestoreTimestamp | null;
}

export interface ForumPost {
  id: string;
  threadId: string;
  nickname: string;
  body: string;
  createdAt: FirestoreTimestamp | null;
  pending?: boolean;
}

export function isValidCategory(c: string): c is ForumCategoryId {
  return FORUM_CATEGORIES.some(cat => cat.id === c);
}

export function timeAgo(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString();
}

export function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}
