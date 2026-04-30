import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { posts } from '../../data/posts';

interface Props {
  gameSlug: string;
  lang: 'en' | 'ko';
}

const formatDate = (iso: string) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

const RelatedPosts: React.FC<Props> = ({ gameSlug, lang }) => {
  const related = posts.filter(
    (p) => Array.isArray(p.relatedGames) && p.relatedGames.includes(gameSlug),
  );
  if (related.length === 0) return null;

  return (
    <section className="related-posts-section" aria-label="Related blog posts">
      <h3 className="related-posts-title">
        <BookOpen size={18} aria-hidden="true" />{' '}
        {lang === 'ko' ? '관련 블로그 글' : 'From the Blog'}
      </h3>
      <ul className="related-posts-list">
        {related.map((p) => (
          <li key={p.slug}>
            <Link to={`/blog/${p.slug}`}>
              <span className="related-post-date">{formatDate(p.date)}</span>
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
