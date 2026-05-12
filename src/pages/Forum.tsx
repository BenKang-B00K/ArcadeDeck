import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useUiText } from '../i18n';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore/lite';
import {
  FORUM_CATEGORIES,
  FORUM_THREAD_PAGE_SIZE,
  isValidCategory,
  timeAgo,
  type ForumCategoryId,
  type ForumThread,
} from '../data/forum';
import './Forum.css';

const Forum: React.FC = () => {
  const t = useUiText();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRaw = searchParams.get('c');
  const selectedCategory: ForumCategoryId | 'all' =
    selectedRaw && isValidCategory(selectedRaw) ? selectedRaw : 'all';

  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  const buildQuery = useCallback((after: QueryDocumentSnapshot<DocumentData> | null) => {
    const col = collection(db, 'forum_threads');
    const baseConstraints = selectedCategory === 'all'
      ? [orderBy('lastActivity', 'desc'), limit(FORUM_THREAD_PAGE_SIZE)]
      : [where('category', '==', selectedCategory), orderBy('lastActivity', 'desc'), limit(FORUM_THREAD_PAGE_SIZE)];
    return after
      ? query(col, ...baseConstraints.slice(0, -1), startAfter(after), limit(FORUM_THREAD_PAGE_SIZE))
      : query(col, ...baseConstraints);
  }, [selectedCategory]);

  const fetchThreads = useCallback(async (reset: boolean) => {
    const q = buildQuery(reset ? null : lastDocRef.current);
    const snap = await getDocs(q);
    const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ForumThread[];
    if (snap.docs.length > 0) {
      lastDocRef.current = snap.docs[snap.docs.length - 1];
    }
    setHasMore(snap.docs.length === FORUM_THREAD_PAGE_SIZE);
    setThreads(prev => reset ? fetched : [...prev, ...fetched]);
  }, [buildQuery]);

  useEffect(() => {
    lastDocRef.current = null;
    setThreads([]);
    setLoading(true);
    setHasMore(false);
    fetchThreads(true).catch(err => {
      console.error('Failed to load forum threads:', err);
    }).finally(() => setLoading(false));
  }, [fetchThreads]);

  const handleSelectCategory = (cat: ForumCategoryId | 'all') => {
    if (cat === 'all') {
      searchParams.delete('c');
    } else {
      searchParams.set('c', cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await fetchThreads(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderCategoryLabel = (id: ForumCategoryId) => {
    const cat = FORUM_CATEGORIES.find(c => c.id === id);
    return cat ? t(cat.uiKey, cat.fallback) : id;
  };

  return (
    <>
      <Navbar />
      <main className="forum-page">
        <header className="forum-header">
          <div>
            <h1>{t('forumTitle', 'Player Forum')} <span>·</span></h1>
            <p>{t('forumSubtitle', 'Talk about games, share tips, and meet other players.')}</p>
          </div>
          <Link to="/forum/new" className="forum-new-btn">+ {t('forumNewThread', 'New Thread')}</Link>
        </header>

        <div className="forum-categories" role="tablist" aria-label="Forum categories">
          <button
            type="button"
            className={`forum-category-chip${selectedCategory === 'all' ? ' active' : ''}`}
            onClick={() => handleSelectCategory('all')}
            role="tab"
            aria-selected={selectedCategory === 'all'}
          >
            {t('forumCategoryAll', 'All')}
          </button>
          {FORUM_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`forum-category-chip${selectedCategory === cat.id ? ' active' : ''}`}
              onClick={() => handleSelectCategory(cat.id)}
              role="tab"
              aria-selected={selectedCategory === cat.id}
            >
              {t(cat.uiKey, cat.fallback)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="forum-empty">{t('forumLoading', 'Loading...')}</p>
        ) : threads.length === 0 ? (
          <p className="forum-empty">{t('forumEmpty', 'No threads yet. Start the first conversation!')}</p>
        ) : (
          <>
            <div className="forum-thread-list">
              {threads.map(thread => {
                const last = thread.lastActivity?.toDate?.();
                return (
                  <Link to={`/forum/t/${thread.id}`} key={thread.id} className="forum-thread-card">
                    <h3 className="forum-thread-title">{thread.title}</h3>
                    <div className="forum-thread-replies">
                      <strong>{thread.replyCount ?? 0}</strong>
                      <span>{t('forumColReplies', 'Replies')}</span>
                    </div>
                    <div className="forum-thread-meta">
                      <span className="forum-category-pill">{renderCategoryLabel(thread.category)}</span>
                      <span>{thread.nickname}</span>
                      <span>{last ? timeAgo(last) : ''}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {hasMore && (
              <button
                type="button"
                className="forum-load-more"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? t('forumLoading', 'Loading...') : t('forumLoadMore', 'Load More')}
              </button>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default Forum;
