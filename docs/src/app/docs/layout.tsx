import { GithubInfo } from 'fumadocs-ui/components/github-info';
import { DocsLayout, type DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

function docsOptions(): DocsLayoutProps {
  return {
    ...baseOptions(),
    tree: source.getPageTree(),
    links: [
      {
        type: 'custom',
        children: <GithubInfo owner='WasiqB' repo='multiple-cucumber-html-reporter' />,
      },
    ],
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DocsLayout {...docsOptions()}>{children}</DocsLayout>;
}
