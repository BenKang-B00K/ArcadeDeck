import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { posts } from '../../data/posts';
import { useUiText, useLocale } from '../../i18n';
import { formatPostDate } from '../../utils/dates';

interface Props {
  gameSlug: string;
}

const RelatedPosts: React.FC<Props> = ({ gameSlug }) => {
  const t = useUiText();
  const { lang } = useLocale();
  const related = posts.filter(
    (p) => Array.isArray(p.relatedGames) && p.relatedGames.includes(gameSlug),
  );
  if (related.length === 0) return null;

  return (
    <section className="related-posts-section" aria-label="Related blog posts">
      <h3 className="related-posts-title">
        <BookOpen size={18} aria-hidden="true" />{' '}
        {t('relatedPostsTitle', 'From the Blog')}
      </h3>
      <ul className="related-posts-list">
        {related.map((p) => (
          <li key={p.slug}>
            <Link to={`/blog/${p.slug}`}>
              <span className="related-post-date">{formatPostDate(p.date, lang, 'short')}</span>
              <span className="related-post-title">{p.title}</span>
              <span className="related-post-excerpt">{p.excerpt}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RelatedPosts;
