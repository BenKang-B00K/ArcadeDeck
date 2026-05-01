import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { posts, getAllTags } from '../data/posts';
import { useUiText } from '../i18n';
import './Blog.css';
import './Home.css';

const formatDate = (iso: string) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

const Blog: React.FC = () => {
  const t = useUiText();
  React.useEffect(() => {
    document.title = 'Blog | ArcadeDeck Devlog & Game Updates';
  }, []);
  const blogLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'ArcadeDeck Blog',
    url: 'https://arcadedeck.net/blog',
    description:
      'Patch notes, game design deep-dives, strategy guides, and monthly Hall of Fame recaps from the ArcadeDeck team.',
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `https://arcadedeck.net/blog/${p.slug}`,
      datePublished: p.date,
      description: p.excerpt,
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://arcadedeck.net/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://arcadedeck.net/blog' },
    ],
  };
  return (
    <div className="blog-page">
      <>
        <meta
          name="description"
          content="The ArcadeDeck devlog: patch notes, game design deep-dives, strategy guides, and monthly Hall of Fame recaps."
        />
        <meta property="og:title" content="Blog | ArcadeDeck Devlog & Game Updates" />
        <meta
          property="og:description"
          content="Patch notes, design deep-dives, and Hall of Fame recaps from the ArcadeDeck team."
        />
        <meta property="og:url" content="https://arcadedeck.net/blog" />
        <link rel="canonical" href="https://arcadedeck.net/blog" />
        <script type="application/ld+json">{JSON.stringify(blogLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </>
      <Navbar />
      <main className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">{t('breadcrumbHome', 'Home')}</Link>
          <span aria-hidden="true">›</span>
          <span className="breadcrumb-current">{t('navBlog', 'Blog')}</span>
        </nav>
        <header className="blog-header">
          <h1>
            ArcadeDeck <span>{t('blogTitle', 'Blog')}</span>
          </h1>
          <p>{t('blogSubtitle', 'Patch notes, design deep-dives, and monthly Hall of Fame recaps.')}</p>
        </header>
        <nav className="blog-tag-cloud" aria-label="Browse by tag">
          {getAllTags().map((t) => (
            <Link key={t} to={`/blog/tag/${t}`} className="blog-tag blog-tag-link">
              #{t}
            </Link>
          ))}
        </nav>
        <div className="blog-list">
          {posts.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="blog-card">
              <div className="blog-card-meta">
                <time dateTime={p.date}>{formatDate(p.date)}</time>
                {p.tags.slice(0, 2).map((t) => (
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
          <p>&copy; 2026 ArcadeDeck. {t('footerAllRights', 'All rights reserved.')}</p>
          <div className="footer-links">
            <Link to="/about" className="footer-link">{t('footerAbout', 'About Us')}</Link>
            <Link to="/privacy" className="footer-link">{t('footerPrivacy', 'Privacy Policy')}</Link>
            <Link to="/contact" className="footer-link">{t('footerContact', 'Contact')}</Link>
            <Link to="/blog" className="footer-link">{t('navBlog', 'Blog')}</Link>
            <a
              href="https://ko-fi.com/developer_benjamink"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link footer-link-support"
            >
              {t('footerSupport', 'Support')} ♥
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;
