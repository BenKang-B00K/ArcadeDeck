import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Clock, List, Gamepad2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getPostBySlug } from '../data/posts';
import { games } from '../data/games';
import type { Game } from '../data/games';
import { useUiText, useLocale, getLocalizedString } from '../i18n';
import { thumb360, SRCSET_SIZES } from '../utils/thumb';
import { formatPostDate } from '../utils/dates';
import { markPostRead } from '../utils/readPosts';
import './Blog.css';
import './Home.css';

const slugifyHeading = (text: string): string =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);

interface TocEntry {
  id: string;
  text: string;
}

const processContent = (html: string): { html: string; toc: TocEntry[]; wordCount: number } => {
  const toc: TocEntry[] = [];
  const seen = new Set<string>();
  const processed = html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g, (_, attrs = '', inner) => {
    const text = String(inner).replace(/<[^>]+>/g, '').trim();
    let id = slugifyHeading(text);
    if (!id) return `<h2${attrs}>${inner}</h2>`;
    let n = 2;
    const base = id;
    while (seen.has(id)) {
      id = `${base}-${n++}`;
    }
    seen.add(id);
    toc.push({ id, text });
    const cleanedAttrs = String(attrs).replace(/\sid="[^"]*"/i, '');
    return `<h2${cleanedAttrs} id="${id}"><a class="heading-anchor" href="#${id}" aria-label="Link to section">#</a> ${inner}</h2>`;
  });
  const wordCount = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length;
  return { html: processed, toc, wordCount };
};

const BlogPost: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug);
  const articleRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const t = useUiText();
  const { lang, overlay } = useLocale();

  const processed = useMemo(
    () => (post ? processContent(post.content) : null),
    [post],
  );

  useEffect(() => {
    if (!processed) return;
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setProgress(rect.bottom <= window.innerHeight ? 100 : 0);
        return;
      }
      const scrolled = Math.max(0, -rect.top);
      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [processed]);

  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} | ArcadeDeck Blog`;
    markPostRead(post.slug);
  }, [post]);

  if (!post || !processed) {
    return <Navigate to="/blog" replace />;
  }

  const url = `https://arcadedeck.net/blog/${post.slug}`;
  const readingMinutes = Math.max(1, Math.round(processed.wordCount / 220));
  const relatedGameForImage = (post.relatedGames || [])
    .map((s) => games.find((g) => g.slug === s))
    .find((g): g is Game => g !== undefined);
  const ogImage = post.coverImage
    ? (post.coverImage.startsWith('http')
        ? post.coverImage
        : `https://arcadedeck.net/${encodeURI(post.coverImage.replace(/^\//, ''))}`)
    : relatedGameForImage
      ? `https://arcadedeck.net/${encodeURI(relatedGameForImage.thumbnail)}`
      : 'https://arcadedeck.net/images/blog/blog-default-cover.webp';
  const ogImageAlt = post.coverImageAlt
    || (relatedGameForImage
      ? `${getLocalizedString(relatedGameForImage, 'title', 'en', null)} cover art`
      : `${post.title} — ArcadeDeck Blog`);
  const articleSection = post.tags[0] || 'News';
  const dateModified = post.dateModified || post.date;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [ogImage],
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: 'https://arcadedeck.net/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ArcadeDeck',
      url: 'https://arcadedeck.net',
      logo: {
        '@type': 'ImageObject',
        url: 'https://arcadedeck.net/images/icon-512x512.webp',
      },
      sameAs: ['https://www.wikidata.org/wiki/Q141473972'],
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection,
    articleBody: post.excerpt,
    keywords: post.tags.join(', '),
    wordCount: processed.wordCount,
    timeRequired: `PT${readingMinutes}M`,
    inLanguage: 'en',
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://arcadedeck.net/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://arcadedeck.net/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  return (
    <div className="blog-page">
      <>
        <meta name="description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${post.title} | ArcadeDeck Blog`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={ogImageAlt} />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | ArcadeDeck Blog`} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={ogImageAlt} />
        <meta name="twitter:label1" content="Reading time" />
        <meta name="twitter:data1" content={`${readingMinutes} min`} />
        <meta name="twitter:label2" content="Filed under" />
        <meta name="twitter:data2" content={articleSection} />
        <meta name="keywords" content={post.tags.join(', ')} />
        <meta name="author" content={post.author} />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:modified_time" content={dateModified} />
        <meta property="article:section" content={articleSection} />
        <meta property="article:author" content={post.author} />
        {post.tags.map((t) => (
          <meta key={t} property="article:tag" content={t} />
        ))}
        <link rel="canonical" href={url} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </>
      <div
        className="reading-progress"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
      <Navbar />
      <main className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">{t('breadcrumbHome', 'Home')}</Link>
          <span aria-hidden="true">›</span>
          <Link to="/blog">{t('navBlog', 'Blog')}</Link>
          <span aria-hidden="true">›</span>
          <span className="breadcrumb-current">{post.title}</span>
        </nav>
        <Link to="/blog" className="blog-back">
          ← {t('blogAllPosts', 'All posts')}
        </Link>
        <article className="blog-post" ref={articleRef}>
          <h1>{post.title}</h1>
          <div className="post-meta">
            <time dateTime={post.date}>{formatPostDate(post.date, lang)}</time>
            <span>· {post.author}</span>
            <span className="post-reading-time">
              <Clock size={14} aria-hidden="true" /> {readingMinutes} {t('blogMinRead', 'min read')}
            </span>
            {post.tags.map((t) => (
              <Link key={t} to={`/blog/tag/${t}`} className="blog-tag blog-tag-link">
                #{t}
              </Link>
            ))}
          </div>
          {processed.toc.length >= 3 && (
            <nav className="post-toc" aria-label="Table of contents">
              <p className="post-toc-title">
                <List size={14} aria-hidden="true" /> {t('blogInThisPost', 'In this post')}
              </p>
              <ol>
                {processed.toc.map((e) => (
                  <li key={e.id}>
                    <a href={`#${e.id}`}>{e.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div
            className="post-body"
            dangerouslySetInnerHTML={{ __html: processed.html }}
          />
          {(() => {
            const related = (post.relatedGames || [])
              .map((s) => games.find((g) => g.slug === s))
              .filter((g): g is Game => g !== undefined);
            if (related.length === 0) return null;
            return (
              <section className="post-related" aria-label="Related games">
                <h2 className="post-related-title">
                  <Gamepad2 size={18} aria-hidden="true" /> {t('blogPlayGames', 'Play the games')}
                </h2>
                <div className="post-related-grid">
                  {related.map((g) => {
                    const title = getLocalizedString(g, 'title', lang, overlay);
                    const desc = getLocalizedString(g, 'description', lang, overlay);
                    return (
                      <Link
                        key={g.slug}
                        to={`/play/${g.slug}`}
                        className="post-related-card"
                      >
                        <img
                          src={`/${g.thumbnail}`}
                          srcSet={`/${thumb360(g.thumbnail)} 360w, /${g.thumbnail} 640w`}
                          sizes={SRCSET_SIZES}
                          alt={title}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="post-related-card-body">
                          <h3>{title}</h3>
                          <p>{desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })()}
        </article>
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

export default BlogPost;
