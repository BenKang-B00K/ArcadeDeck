import {
  collection,
  query,
  where,
  orderBy,
  limit as limitFn,
} from 'firebase/firestore/lite';
import type { Firestore, Query, DocumentData, QueryConstraint } from 'firebase/firestore/lite';

export interface LeaderboardQueryOpts {
  dualSort?: boolean;
  subSortAsc?: boolean;
  limit: number;
}

export function buildLeaderboardQuery(
  db: Firestore,
  gameId: string,
  opts: LeaderboardQueryOpts
): Query<DocumentData> {
  const { dualSort = false, subSortAsc = false, limit } = opts;
  const subDir = subSortAsc ? 'asc' : 'desc';
  const constraints: QueryConstraint[] = [
    where('gameId', '==', gameId),
    orderBy('score', 'desc'),
  ];
  if (dualSort) constraints.push(orderBy('subScore', subDir));
  constraints.push(limitFn(limit));
  return query(collection(db, 'leaderboards'), ...constraints);
}
