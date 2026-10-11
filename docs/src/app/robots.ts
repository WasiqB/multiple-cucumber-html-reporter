import type { MetadataRoute } from 'next';
import { baseUrl } from '@/lib/shared';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: new URL('/sitemap.xml', baseUrl).toString(),
  };
}
