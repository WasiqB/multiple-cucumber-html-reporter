import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { baseUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Community',
  description:
    'Join thousands of developers and teams using Multiple Cucumber HTML Reporter. Connect on Discord, GitHub Discussions, and contribute to open source testing tools.',
  alternates: {
    canonical: new URL('/community', baseUrl).toString(),
  },
  openGraph: {
    title: 'Community | Multiple Cucumber HTML Reporter',
    description:
      'Join thousands of developers and teams using Multiple Cucumber HTML Reporter. Connect on Discord, GitHub Discussions, and contribute to open source testing tools.',
    url: new URL('/community', baseUrl).toString(),
  },
};

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return children;
}
