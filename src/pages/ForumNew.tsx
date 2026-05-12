import React, { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useUiText } from '../i18n';
import { useNickname } from '../hooks/useNickname';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore/lite';
import {
  FORUM_BODY_MAX,
  FORUM_CATEGORIES,
  FORUM_SUBMIT_COOLDOWN_MS,
  FORUM_TITLE_MAX,
  isValidCategory,
  stripHtml,
  type ForumCategoryId,
} from '../data/forum';
import './Forum.css';

const ForumNew: React.FC = () => {
  const t = useUiText();
  const navigate = useNavigate();
  const nickname = useNickname();
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('c');
  const defaultCategory: ForumCategoryId =
    initialCat && isValidCategory(initialCat) ? initialCat : 'general';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ForumCategoryId>(defaultCategory);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSubmitRef = useRef<number>(0);

  const titleChars = title.length;
  const bodyChars = body.length;
  const titleNear = titleChars >= FORUM_TITLE_MAX - 10;
  const titleAt = titleChars >= FORUM_TITLE_MAX;
  const bodyNear = bodyChars >= FORUM_BODY_MAX - 100;
  const bodyAt = bodyChars >= FORUM_BODY_MAX;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody || submitting) return;

    const now = Date.now();
    if (now - lastSubmitRef.current < FORUM_SUBMIT_COOLDOWN_MS) {
      setError(t('forumComposeCooldown', 'Please wait before posting again.'));
      setTimeout(() => setError(null), 3000);
      return;
    }

    const safeTitle = stripHtml(trimmedTitle);
    const safeBody = stripHtml(trimmedBody);

    setSubmitting(true);
    lastSubmitRef.current = now;
    setError(null);

    try {
      const ref = await addDoc(collection(db, 'forum_threads'), {
        title: safeTitle,
        body: safeBody,
        category,
        nickname,
        replyCount: 0,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
      });
      navigate(`/forum/t/${ref.id}`);
    } catch (err) {
      console.error('Failed to create thread:', err);
      setError(t('forumComposeError', 'Failed to post. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="forum-page">
        <Link to="/forum" className="forum-back">← {t('forumBack', 'Back to forum')}</Link>

        <header className="forum-header">
          <div>
            <h1>{t('forumNewThread', 'New Thread')}</h1>
            <p>{t('forumSubtitle', 'Talk about games, share tips, and meet other players.')}</p>
          </div>
        </header>

        <form className="forum-compose" onSubmit={handleSubmit}>
          <div className="forum-field">
            <label htmlFor="forum-new-title">{t('forumComposeTitle', 'Title')}</label>
            <div className="forum-textarea-wrapper">
              <input
                id="forum-new-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('forumComposeTitlePlaceholder', 'Short, descriptive title…')}
                maxLength={FORUM_TITLE_MAX}
                required
              />
              <span className={`forum-char-count ${titleAt ? 'at-limit' : titleNear ? 'near-limit' : ''}`}>
                {titleChars}/{FORUM_TITLE_MAX}
              </span>
            </div>
          </div>

          <div className="forum-field">
            <label htmlFor="forum-new-category">{t('forumComposeCategory', 'Category')}</label>
            <select
              id="forum-new-category"
              value={category}
              onChange={(e) => {
                const v = e.target.value;
                if (isValidCategory(v)) setCategory(v);
              }}
            >
              {FORUM_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{t(cat.uiKey, cat.fallback)}</option>
              ))}
            </select>
          </div>

          <div className="forum-field">
            <label htmlFor="forum-new-body">{t('forumComposeBody', 'Body')}</label>
            <div className="forum-textarea-wrapper">
              <textarea
                id="forum-new-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t('forumComposeBodyPlaceholder', 'Share your thoughts…')}
                maxLength={FORUM_BODY_MAX}
                required
              />
              <span className={`forum-char-count ${bodyAt ? 'at-limit' : bodyNear ? 'near-limit' : ''}`}>
                {bodyChars}/{FORUM_BODY_MAX}
              </span>
            </div>
          </div>

          <div className="forum-form-footer">
            <span className="forum-author">
              {t('forumPostingAs', 'Posting as')}: <strong>{nickname}</strong>
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/forum" className="forum-cancel">{t('forumComposeCancel', 'Cancel')}</Link>
              <button type="submit" disabled={submitting || !title.trim() || !body.trim()}>
                {submitting ? t('forumComposeSubmitting', 'Posting…') : t('forumComposeSubmit', 'Post Thread')}
              </button>
            </div>
          </div>
          {error && <p className="forum-form-error">{error}</p>}
        </form>
      </main>
    </>
  );
};

export default ForumNew;
