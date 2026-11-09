import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { publishedEntries, typeInfo } from '../lib/entries';
import { profile } from '../lib/data';
import { url } from '../lib/url';

export async function GET(context: APIContext) {
  const entries = publishedEntries(await getCollection('posts'));
  return rss({
    title: profile.name,
    description: `${profile.name}: projects, writing, work and photos.`,
    site: new URL(url(''), context.site!).toString(),
    items: entries.map((e) => ({
      title: e.data.title,
      pubDate: e.data.date,
      description: e.data.summary,
      categories: [typeInfo(e.data.type).label],
      link: new URL(url(`posts/${e.id}`), context.site!).toString(),
    })),
  });
}
