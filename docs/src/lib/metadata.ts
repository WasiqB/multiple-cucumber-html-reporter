import type { Metadata } from 'next';
import { baseUrl } from './shared';
import type { Page } from './source';

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: baseUrl.toString(),
      images: '/images/multiple-cucumber-html-reporter-banner.png',
      siteName: 'Multiple Cucumber HTML Reporter',
      ...override.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@wasiqbhamla',
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: '/images/multiple-cucumber-html-reporter-banner.png',
      ...override.twitter,
    },
    alternates: {
      ...override.alternates,
    },
  };
}

export function getPageImage(page: Page) {
  const segments = [...page.slugs, 'image.webp'];

  return {
    segments,
    url: `/og/${segments.join('/')}`,
  };
}

export { baseUrl } from './shared';
