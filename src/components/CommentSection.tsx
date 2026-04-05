import React, { useEffect, useState, useRef, useCallback } from 'react';
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
} from "firebase/firestore";
import './CommentSection.css';

const PAGE_SIZE = 20;
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

interface Comment {
  id: string;
  gameId: string;
  nickname: string;
  text: string;
  createdAt: any;
}

interface CommentSectionProps {
  gameId: string;
  currentNickname: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ gameId, currentNickname }) => {
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

    const snapshot = await getDocs(q);
    const fetched = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];

    if (snapshot.docs.length > 0) {
      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
    }
    setHasMore(snapshot.docs.length === PAGE_SIZE);

    if (reset) {
      setComments(fetched);
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

    setIsSubmitting(true);
    lastSubmitRef.current = Date.now();
    try {
      await addDoc(collection(db, "comments"), {
        gameId,
        nickname: currentNickname,
        text: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment('');
      // Dismiss keyboard on mobile
      (document.activeElement as HTMLElement)?.blur();
      // Re-fetch from the top so the new comment appears immediately
      lastDocRef.current = null;
      await fetchComments(true);
    } catch (error) {
      console.error("Error adding comment: ", error);
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

  const countLabel = `${comments.length}${hasMore ? '+' : ''}`;

  return (
    <div className="comment-section">
      <h3>Community <span>Comments</span> ({countLabel})</h3>

      <form onSubmit={handleSubmit} className="comment-form">
        <div className="textarea-wrapper">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this game..."
            maxLength={COMMENT_MAX}
          />
          <span className={`char-count ${charAtLimit ? 'at-limit' : charNearLimit ? 'near-limit' : ''}`}>
            {charCount}/{COMMENT_MAX}
          </span>
        </div>
        <div className="form-footer">
          <span>Posting as: <strong>{currentNickname}</strong></span>
          <button type="submit" disabled={isSubmitting || charCount === 0}>
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
        {submitError && <p className="comment-submit-error">{submitError}</p>}
      </form>

      <div className="comments-list">
        {comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{comment.nickname}</span>
                  <span className="comment-date" title={comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : ''}>
                    {comment.createdAt?.toDate ? timeAgo(comment.createdAt.toDate()) : 'Just now'}
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
                {isLoadingMore ? 'Loading...' : 'Load More Comments'}
              </button>
            )}
          </>
        ) : (
          <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
