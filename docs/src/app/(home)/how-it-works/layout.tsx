import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { baseUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Learn how Multiple Cucumber HTML Reporter turns Cucumber JSON outputs into interactive visual reports. Easy installation, declarative configuration, and CI/CD integration.',
  alternates: {
    canonical: new URL('/how-it-works', baseUrl).toString(),
  },
  openGraph: {
    title: 'How It Works | Multiple Cucumber HTML Reporter',
    description:
      'Learn how Multiple Cucumber HTML Reporter turns Cucumber JSON outputs into interactive visual reports. Easy installation, declarative configuration, and CI/CD integration.',
    url: new URL('/how-it-works', baseUrl).toString(),
  },
};

export default function HowItWorksLayout({ children }: { children: ReactNode }) {
  return children;
}
