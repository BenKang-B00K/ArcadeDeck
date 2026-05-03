const STORAGE_KEY = 'play_streak';

export interface StreakState {
  count: number;
  best: number;
  lastDate: string;
}

function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayDiff(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export function readStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, best: 0, lastDate: '' };
    const parsed = JSON.parse(raw) as Partial<StreakState>;
    return {
      count: Number(parsed.count) || 0,
      best: Number(parsed.best) || 0,
      lastDate: typeof parsed.lastDate === 'string' ? parsed.lastDate : '',
    };
  } catch {
    return { count: 0, best: 0, lastDate: '' };
  }
}

export function recordPlayToday(): StreakState {
  const today = todayLocalISO();
  const prev = readStreak();
  let count = prev.count;
  if (!prev.lastDate) {
    count = 1;
  } else if (prev.lastDate === today) {
    count = Math.max(prev.count, 1);
  } else {
    const diff = dayDiff(prev.lastDate, today);
    count = diff === 1 ? prev.count + 1 : 1;
  }
  const best = Math.max(prev.best, count);
  const next: StreakState = { count, best, lastDate: today };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full — ignore
  }
  return next;
}

export function getCurrentStreak(): number {
  const s = readStreak();
  if (!s.lastDate) return 0;
  const diff = dayDiff(s.lastDate, todayLocalISO());
  if (diff > 1) return 0;
  return s.count;
}
