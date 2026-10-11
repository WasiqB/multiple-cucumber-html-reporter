import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { baseUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Showcase',
  description:
    'Discover companies, organizations, and open-source projects using Multiple Cucumber HTML Reporter in production test automation pipelines.',
  alternates: {
    canonical: new URL('/showcase', baseUrl).toString(),
  },
  openGraph: {
    title: 'Showcase | Multiple Cucumber HTML Reporter',
    description:
      'Discover companies, organizations, and open-source projects using Multiple Cucumber HTML Reporter in production test automation pipelines.',
    url: new URL('/showcase', baseUrl).toString(),
  },
};

export default function ShowcaseLayout({ children }: { children: ReactNode }) {
  return children;
}
