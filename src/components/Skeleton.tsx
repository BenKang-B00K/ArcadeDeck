import React from 'react';
import './Skeleton.css';

export const SkeletonCard: React.FC = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton-thumb shimmer" />
    <div className="skeleton-line shimmer skeleton-line-title" />
    <div className="skeleton-line shimmer skeleton-line-meta" />
  </div>
);

interface SkeletonGridProps {
  count?: number;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 8 }) => (
  <section className="game-grid-section" aria-busy="true" aria-label="Loading games">
    <div className="container">
      <div className="skeleton-line shimmer skeleton-section-title" />
      <div className="game-grid">
        {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  </section>
);
