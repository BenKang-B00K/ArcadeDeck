import postsData from './posts.json';

export interface Post {
  slug: string;
  title: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  content: string;
  relatedGames?: string[];
  coverImage?: string;
  coverImageAlt?: string;
  dateModified?: string;
}

export const posts: Post[] = (postsData as Post[])
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const getPostBySlug = (slug: string): Post | undefined =>
  posts.find((p) => p.slug === slug);

export const getAllTags = (): string[] => {
  const set = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
};

export const getPostsByTag = (tag: string): Post[] =>
  posts.filter((p) => p.tags.includes(tag));

export const formatTagLabel = (tag: string): string =>
  tag
    .split('-')
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
