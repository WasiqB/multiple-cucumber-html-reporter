import { GithubInfo } from 'fumadocs-ui/components/github-info';
import { DocsLayout, type DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { cacheLife, cacheTag } from 'next/cache';
import { Suspense } from 'react';
import { baseOptions } from '@/lib/layout.shared';
import { gitConfig } from '@/lib/shared';
import { source } from '@/lib/source';

async function CachedGithubInfo() {
  'use cache';
  cacheLife('days');
  cacheTag('github-repo');

  return <GithubInfo owner={gitConfig.user} repo={gitConfig.repo} fetchOptions={{ cache: 'no-store' }} />;
}

function GithubInfoFallback() {
  return <div className='h-14 animate-pulse rounded-lg bg-fd-muted' aria-hidden='true' />;
}

function docsOptions(): DocsLayoutProps {
  return {
    ...baseOptions(),
    tree: source.getPageTree(),
    links: [
      {
        type: 'custom',
        children: (
          <Suspense fallback={<GithubInfoFallback />}>
            <CachedGithubInfo />
          </Suspense>
        ),
      },
    ],
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DocsLayout {...docsOptions()}>{children}</DocsLayout>;
}
