import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useUiText } from '../i18n';
import { useNickname } from '../hooks/useNickname';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  increment,
  serverTimestamp,
  QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore/lite';
import {
  FORUM_CATEGORIES,
  FORUM_REPLY_MAX,
  FORUM_REPLY_PAGE_SIZE,
  FORUM_SUBMIT_COOLDOWN_MS,
  stripHtml,
  timeAgo,
  type ForumPost,
  type ForumThread as ForumThreadDoc,
} from '../data/forum';
import './Forum.css';

const ForumThread: React.FC = () => {
  const t = useUiText();
  const { id } = useParams<{ id: string }>();
  const nickname = useNickname();

  const [thread, setThread] = useState<ForumThreadDoc | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const lastSubmitRef = useRef<number>(0);

  const charCount = replyText.length;
  const nearLimit = charCount >= FORUM_REPLY_MAX - 50;
  const atLimit = charCount >= FORUM_REPLY_MAX;

  const fetchPosts = useCallback(async (threadId: string, reset: boolean) => {
    const col = collection(db, 'forum_posts');
    const q = reset || !lastDocRef.current
      ? query(col, where('threadId', '==', threadId), orderBy('createdAt', 'asc'), limit(FORUM_REPLY_PAGE_SIZE))
      : query(col, where('threadId', '==', threadId), orderBy('createdAt', 'asc'), startAfter(lastDocRef.current), limit(FORUM_REPLY_PAGE_SIZE));
    const snap = await getDocs(q);
    const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() })) as ForumPost[];
    if (snap.docs.length > 0) lastDocRef.current = snap.docs[snap.docs.length - 1];
    setHasMore(snap.docs.length === FORUM_REPLY_PAGE_SIZE);
    setPosts(prev => reset ? fetched : [...prev, ...fetched]);
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setThread(null);
    setPosts([]);
    lastDocRef.current = null;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'forum_threads', id));
        if (cancelled) return;
        if (!snap.exists()) {
          setNotFound(true);
        } else {
          setThread({ id: snap.id, ...snap.data() } as ForumThreadDoc);
          await fetchPosts(id, true);
        }
      } catch (err) {
        console.error('Failed to load thread:', err);
        setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, fetchPosts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !thread) return;
    const text = replyText.trim();
    if (!text || submitting) return;
    const now = Date.now();
    if (now - lastSubmitRef.current < FORUM_SUBMIT_COOLDOWN_MS) {
      setSubmitError(t('forumComposeCooldown', 'Please wait before posting again.'));
      setTimeout(() => setSubmitError(null), 3000);
      return;
    }

    const sanitized = stripHtml(text);
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const localDate = new Date();
    const optimistic: ForumPost = {
      id: tempId,
      threadId: id,
      nickname,
      body: sanitized,
      createdAt: { toDate: () => localDate },
      pending: true,
    };

    setSubmitting(true);
    lastSubmitRef.current = now;
    setPosts(prev => [...prev, optimistic]);
    setReplyText('');
    (document.activeElement as HTMLElement)?.blur();

    try {
      await addDoc(collection(db, 'forum_posts'), {
        threadId: id,
        nickname,
        body: sanitized,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'forum_threads', id), {
        replyCount: increment(1),
        lastActivity: serverTimestamp(),
      });
      setPosts(prev => prev.filter(p => p.id !== tempId));
      lastDocRef.current = null;
      await fetchPosts(id, true);
      setThread(prev => prev ? { ...prev, replyCount: (prev.replyCount ?? 0) + 1 } : prev);
    } catch (err) {
      console.error('Failed to post reply:', err);
      setPosts(prev => prev.filter(p => p.id !== tempId));
      setReplyText(sanitized);
      setSubmitError(t('forumComposeError', 'Failed to post. Please try again.'));
      setTimeout(() => setSubmitError(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = async () => {
    if (!id) return;
    setLoadingMore(true);
    try {
      await fetchPosts(id, false);
    } finally {
      setLoadingMore(false);
    }
  };

  const categoryLabel = (cat: string) => {
    const c = FORUM_CATEGORIES.find(x => x.id === cat);
    return c ? t(c.uiKey, c.fallback) : cat;
  };

  return (
    <>
      <Navbar />
      <main className="forum-page">
        <Link to="/forum" className="forum-back">← {t('forumBack', 'Back to forum')}</Link>

        {loading ? (
          <p className="forum-empty">{t('forumLoading', 'Loading...')}</p>
        ) : notFound || !thread ? (
          <p className="forum-empty">{t('forumThreadNotFound', 'Thread not found.')}</p>
        ) : (
          <>
            <article className="forum-thread-view">
              <h1>{thread.title}</h1>
              <div className="forum-thread-view-meta">
                <span className="forum-category-pill">{categoryLabel(thread.category)}</span>
                <span>{thread.nickname}</span>
                <span>{thread.createdAt?.toDate ? timeAgo(thread.createdAt.toDate()) : ''}</span>
              </div>
              <div className="forum-thread-view-body">{thread.body}</div>
            </article>

            <section className="forum-replies" aria-label="Replies">
              <h2>
                {t('forumReplies', 'Replies')} <span>({thread.replyCount ?? 0})</span>
              </h2>

              {posts.length === 0 ? (
                <p className="forum-empty">{t('forumReplyEmpty', 'No replies yet. Be the first to reply.')}</p>
              ) : (
                <div className="forum-reply-list">
                  {posts.map(post => (
                    <div key={post.id} className={`forum-reply-item${post.pending ? ' pending' : ''}`}>
                      <div className="forum-reply-header">
                        <strong>{post.nickname}</strong>
                        <span className="forum-reply-date">
                          {post.pending
                            ? t('forumReplySubmitting', 'Posting…')
                            : (post.createdAt?.toDate ? timeAgo(post.createdAt.toDate()) : '')}
                        </span>
                      </div>
                      <div className="forum-reply-body">{post.body}</div>
                    </div>
                  ))}
                </div>
              )}

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

              <form onSubmit={handleSubmit} className="forum-compose" style={{ marginTop: 28 }}>
                <div className="forum-field">
                  <label htmlFor="forum-reply-body">{t('forumReplyPlaceholder', 'Write a reply…')}</label>
                  <div className="forum-textarea-wrapper">
                    <textarea
                      id="forum-reply-body"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t('forumReplyPlaceholder', 'Write a reply…')}
                      maxLength={FORUM_REPLY_MAX}
                    />
                    <span className={`forum-char-count ${atLimit ? 'at-limit' : nearLimit ? 'near-limit' : ''}`}>
                      {charCount}/{FORUM_REPLY_MAX}
                    </span>
                  </div>
                </div>
                <div className="forum-form-footer">
                  <span className="forum-author">
                    {t('forumPostingAs', 'Posting as')}: <strong>{nickname}</strong>
                  </span>
                  <button type="submit" disabled={submitting || charCount === 0}>
                    {submitting ? t('forumReplySubmitting', 'Posting…') : t('forumReplySubmit', 'Post Reply')}
                  </button>
                </div>
                {submitError && <p className="forum-form-error">{submitError}</p>}
              </form>
            </section>
          </>
        )}
      </main>
    </>
  );
};

export default ForumThread;
