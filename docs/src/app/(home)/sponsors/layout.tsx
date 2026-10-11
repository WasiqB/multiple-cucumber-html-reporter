import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { baseUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Sponsors',
  description:
    'Support the open-source development and maintenance of Multiple Cucumber HTML Reporter. Explore sponsorship tiers and benefits.',
  alternates: {
    canonical: new URL('/sponsors', baseUrl).toString(),
  },
  openGraph: {
    title: 'Sponsors | Multiple Cucumber HTML Reporter',
    description:
      'Support the open-source development and maintenance of Multiple Cucumber HTML Reporter. Explore sponsorship tiers and benefits.',
    url: new URL('/sponsors', baseUrl).toString(),
  },
};

export default function SponsorsLayout({ children }: { children: ReactNode }) {
  return children;
}
