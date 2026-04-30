import React from 'react';
import { Crown, Flame } from 'lucide-react';

interface RankIconOpts {
  flameRange?: [number, number];
}

export function getRankIcon(rank: number, opts?: RankIconOpts): React.ReactNode {
  if (rank === 1) return <Crown size={18} className="rank-icon gold" aria-hidden="true" />;
  if (rank === 2) return <Crown size={16} className="rank-icon silver" aria-hidden="true" />;
  if (rank === 3) return <Crown size={16} className="rank-icon bronze" aria-hidden="true" />;
  const [lo, hi] = opts?.flameRange ?? [4, Infinity];
  if (rank >= lo && rank <= hi) return <Flame size={16} className="rank-icon fire" aria-hidden="true" />;
  return rank;
}
