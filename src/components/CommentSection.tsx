import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Star } from 'lucide-react';
import { useUiText } from '../i18n';
import type { FeaturedComment } from '../i18n';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  startAfter,
  limit,
  serverTimestamp,
  QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore/lite";
import { COMMENT_PAGE_SIZE as PAGE_SIZE } from '../constants/gameConstants';
import { safeRead, safeWrite, circuitOpen } from '../utils/firestoreCircuit';
import './CommentSection.css';

const COMMENT_MAX = 300;
const SUBMIT_COOLDOWN_MS = 10_000;

const timeAgo = (date: Date): string => {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60)  return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60)  return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24)   return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7)   return `${day}d ago`;
  return date.toLocaleDateString();
};

interface FirestoreTimestamp {
  toDate(): Date;
}

interface Comment {
  id: string;
  gameId: string;
  nickname: string;
  text: string;
  createdAt: FirestoreTimestamp | null;
  pending?: boolean;
}

interface CommentSectionProps {
  gameId: string;
  currentNickname: string;
  featured?: FeaturedComment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ gameId, currentNickname, featured }) => {
  const t = useUiText();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const lastSubmitRef = useRef<number>(0);

  const charCount = newComment.length;
  const charNearLimit = charCount >= COMMENT_MAX - 30;
  const charAtLimit = charCount >= COMMENT_MAX;

  const fetchComments = useCallback(async (reset: boolean) => {
    const q = reset || !lastDocRef.current
      ? query(
          collection(db, "comments"),
          where("gameId", "==", gameId),
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE)
        )
      : query(
          collection(db, "comments"),
          where("gameId", "==", gameId),
          orderBy("createdAt", "desc"),
          startAfter(lastDocRef.current),
          limit(PAGE_SIZE)
        );

    const snapshot = await safeRead(() => getDocs(q), null);
    if (!snapshot) {
      // Quota cooldown or read failure — leave comments empty, no error UI.
      setHasMore(false);
      return;
    }
    const fetched = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];

    if (snapshot.docs.length > 0) {
      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
    }
    setHasMore(snapshot.docs.length === PAGE_SIZE);

    if (reset) {
      // Preserve any pending optimistic comments not yet confirmed by server
      setComments(prev => {
        const pending = prev.filter(c => c.pending);
        return [...pending, ...fetched];
      });
    } else {
      setComments(prev => [...prev, ...fetched]);
    }
  }, [gameId]);

  useEffect(() => {
    lastDocRef.current = null;
    setComments([]);
    setHasMore(false);
    fetchComments(true);
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    const now = Date.now();
    if (now - lastSubmitRef.current < SUBMIT_COOLDOWN_MS) {
      setSubmitError(`Please wait ${Math.ceil((SUBMIT_COOLDOWN_MS - (now - lastSubmitRef.current)) / 1000)}s before posting again.`);
      setTimeout(() => setSubmitError(null), 3000);
      return;
    }

    // Strip HTML tags as defense-in-depth (React escapes by default, but Firestore data is shared)
    const sanitizedText = newComment.trim().replace(/<[^>]*>/g, '');
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const localDate = new Date();
    const optimistic: Comment = {
      id: tempId,
      gameId,
      nickname: currentNickname,
      text: sanitizedText,
      createdAt: { toDate: () => localDate },
      pending: true,
    };

    setIsSubmitting(true);
    lastSubmitRef.current = Date.now();
    setComments(prev => [optimistic, ...prev]);
    setNewComment('');
    // Dismiss keyboard on mobile
    (document.activeElement as HTMLElement)?.blur();

    // Quota cooldown — short-circuit write and tell user.
    if (circuitOpen()) {
      setComments(prev => prev.filter(c => c.id !== tempId));
      setNewComment(sanitizedText);
      setSubmitError("Comments temporarily unavailable. Please try again later.");
      setTimeout(() => setSubmitError(null), 4000);
      setIsSubmitting(false);
      return;
    }

    try {
      const w = await safeWrite(() => addDoc(collection(db, "comments"), {
        gameId,
        nickname: currentNickname,
        text: sanitizedText,
        createdAt: serverTimestamp()
      }));
      if (!w.ok) {
        // Rollback + show message
        setComments(prev => prev.filter(c => c.id !== tempId));
        setNewComment(sanitizedText);
        setSubmitError(w.quotaExhausted
          ? "Comments temporarily unavailable. Please try again later."
          : "Failed to post comment. Please try again.");
        setTimeout(() => setSubmitError(null), 4000);
        return;
      }
      // Replace optimistic with confirmed server data
      setComments(prev => prev.filter(c => c.id !== tempId));
      lastDocRef.current = null;
      await fetchComments(true);
    } catch (error) {
      console.error("Error adding comment: ", error);
      // Rollback optimistic + restore input
      setComments(prev => prev.filter(c => c.id !== tempId));
      setNewComment(sanitizedText);
      setSubmitError("Failed to post comment. Please try again.");
      setTimeout(() => setSubmitError(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await fetchComments(false);
    setIsLoadingMore(false);
  };

  const featuredCount = featured?.length ?? 0;
  const countLabel = `${featuredCount + comments.length}${hasMore ? '+' : ''}`;
  const hasFeatured = featuredCount > 0;

  return (
    <div className="comment-section">
      <h3>{t('commentCommunity', 'Community')} <span>{t('commentComments', 'Comments')}</span> ({countLabel})</h3>

      <form onSubmit={handleSubmit} className="comment-form">
        <div className="textarea-wrapper">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('commentPlaceholder', 'Share your thoughts about this game...')}
            aria-label={t('commentAriaLabel', 'Comment text')}
            maxLength={COMMENT_MAX}
          />
          <span className={`char-count ${charAtLimit ? 'at-limit' : charNearLimit ? 'near-limit' : ''}`}>
            {charCount}/{COMMENT_MAX}
          </span>
        </div>
        <div className="form-footer">
          <span>{t('commentPostingAs', 'Posting as')}: <strong>{currentNickname}</strong></span>
          <button type="submit" disabled={isSubmitting || charCount === 0}>
            {isSubmitting ? t('commentPosting', 'Posting...') : t('commentSubmit', 'Post Comment')}
          </button>
        </div>
        {submitError && <p className="comment-submit-error">{submitError}</p>}
      </form>

      <div className="comments-list">
        {hasFeatured && featured!.map((fc, i) => (
          <div key={`featured-${i}`} className="comment-item featured">
            <div className="comment-header">
              <span className="comment-author">{fc.name}</span>
              <span className="featured-badge">
                <Star size={12} aria-hidden="true" />
                {fc.badge || t('commentFeaturedBadge', 'Featured')}
              </span>
            </div>
            <p className="comment-text">{fc.text}</p>
          </div>
        ))}
        {comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className={`comment-item${comment.pending ? ' comment-pending' : ''}`}>
                <div className="comment-header">
                  <span className="comment-author">{comment.nickname}</span>
                  <span className="comment-date" title={comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : ''}>
                    {comment.pending ? t('commentPosting', 'Posting...') : (comment.createdAt?.toDate ? timeAgo(comment.createdAt.toDate()) : 'Just now')}
                  </span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
            {hasMore && (
              <button
                className="load-more-btn"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? t('commentLoadingMore', 'Loading...') : t('commentLoadMore', 'Load More Comments')}
              </button>
            )}
          </>
        ) : (
          !hasFeatured && (
            <p className="no-comments">{t('commentEmpty', 'No comments yet. Be the first to share your thoughts!')}</p>
          )
        )}
      </div>
    </div>
  );
};

export default CommentSection;
