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
        priority: 0.7,
      } as MetadataRoute.Sitemap[number];
    }),
  );
  return [
    {
      url: url('/'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: url('/features'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: url('/how-it-works'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: url('/config-builder'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: url('/community'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: url('/sponsors'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: url('/showcase'),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...items.filter((v) => v !== undefined),
  ];
}
