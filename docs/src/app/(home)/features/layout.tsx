import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { baseUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Discover the features that make Multiple Cucumber HTML Reporter the preferred reporter for engineering teams. Rich metadata, visual analytics, charts, attachments, and email reporting.',
  alternates: {
    canonical: new URL('/features', baseUrl).toString(),
  },
  openGraph: {
    title: 'Features | Multiple Cucumber HTML Reporter',
    description:
      'Discover the features that make Multiple Cucumber HTML Reporter the preferred reporter for engineering teams. Rich metadata, visual analytics, charts, attachments, and email reporting.',
    url: new URL('/features', baseUrl).toString(),
  },
};

export default function FeaturesLayout({ children }: { children: ReactNode }) {
  return children;
}
