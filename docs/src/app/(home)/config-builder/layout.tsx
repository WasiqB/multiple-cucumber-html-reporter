import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { baseUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: 'Config Builder',
  description:
    'Interactive configuration generator for Multiple Cucumber HTML Reporter. Customize options with real-time preview, copy config snippet, or download in JSON, YAML, JS, or TypeScript format.',
  alternates: {
    canonical: new URL('/config-builder', baseUrl).toString(),
  },
  openGraph: {
    title: 'Config Builder | Multiple Cucumber HTML Reporter',
    description:
      'Interactive configuration builder for Multiple Cucumber HTML Reporter. Tailor your options visually, copy snippets, or download ready-to-use config files.',
    url: new URL('/config-builder', baseUrl).toString(),
  },
};

export default function ConfigBuilderLayout({ children }: { children: ReactNode }) {
  return children;
}
