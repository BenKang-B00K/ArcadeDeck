import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getPostsByTag, formatTagLabel } from '../data/posts';
import './Blog.css';
import './Home.css';

const formatDate = (iso: string) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

const BlogTag: React.FC = () => {
  const { tag = '' } = useParams<{ tag: string }>();
  const normalized = tag.toLowerCase();
  const matches = getPostsByTag(normalized);

  if (matches.length === 0) {
    return <Navigate to="/blog" replace />;
  }

  const label = formatTagLabel(normalized);
  const url = `https://arcadedeck.net/blog/tag/${normalized}`;
  const title = `${label} | ArcadeDeck Blog`;
  const description = `All ArcadeDeck blog posts tagged "${label}" — strategy guides, design notes, patch notes, and recaps.`;

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    url,
    description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: matches.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://arcadedeck.net/blog/${p.slug}`,
        name: p.title,
      })),
    },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://arcadedeck.net/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://arcadedeck.net/blog' },
      { '@type': 'ListItem', position: 3, name: label, item: url },
    ],
  };

  return (
    <div className="blog-page">
      <>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <link rel="canonical" href={url} />
        <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </>
      <Navbar />
      <main className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link to="/blog">Blog</Link>
          <span aria-hidden="true">›</span>
          <span className="breadcrumb-current">#{normalized}</span>
        </nav>
        <header className="blog-header">
          <h1>
            #<span>{label}</span>
          </h1>
          <p>
            {matches.length} post{matches.length === 1 ? '' : 's'} tagged{' '}
            <strong>{label}</strong>.
          </p>
        </header>
        <div className="blog-list">
          {matches.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="blog-card">
              <div className="blog-card-meta">
                <time dateTime={p.date}>{formatDate(p.date)}</time>
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t} className="blog-tag">
                    {t}
                  </span>
                ))}
              </div>
              <h2>{p.title}</h2>
              <p>{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </main>
      <footer className="footer">
        <div className="container footer-container">
          <p>&copy; 2026 ArcadeDeck. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
            <Link to="/blog" className="footer-link">Blog</Link>
            <a
              href="https://ko-fi.com/developer_benjamink"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link footer-link-support"
            >
              Support ♥
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogTag;
