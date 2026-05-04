import type { MetadataRoute } from 'next';
import { baseUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string): string => new URL(path, baseUrl).toString();
  const items = await Promise.all(
    source.getPages().map(async (page) => {
      if (page.type === 'openapi') return;
      const { lastModified } = page.data;

      return {
        url: url(page.url),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.5,
      } as MetadataRoute.Sitemap[number];
    }),
  );
  return [
    {
      url: url('/'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: url('/features'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: url('/how-it-works'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: url('/community'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: url('/sponsors'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: url('/docs'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...items.filter((v) => v !== undefined),
  ];
}
