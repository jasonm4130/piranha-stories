import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

function getSlug(id: string): string {
  return id.replace(/\.md$/, '');
}

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  
  // Sort posts by date (newest first)
  const sortedPosts = posts
    .filter((post) => post.data.date)
    .sort((a, b) => (b.data.date?.getTime() || 0) - (a.data.date?.getTime() || 0));
  
  return rss({
    title: 'Piranha Stories',
    description: 'A collection of original short stories by Brian_AP',
    site: context.site?.toString() || 'https://piranhastories.com',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt || '',
      link: `/${getSlug(post.id)}/`,
      categories: [...(post.data.categories || []), ...(post.data.tags || [])],
    })),
    customData: `<language>en-us</language>`,
  });
}
