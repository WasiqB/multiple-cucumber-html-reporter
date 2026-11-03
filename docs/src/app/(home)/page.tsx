import type { Metadata } from 'next';
import { baseUrl, getReporterVersion } from '@/lib/shared';
import HomePageClient from './_home-client';

export const metadata: Metadata = {
  title: 'Cucumber HTML Reporter & Dashboard | Shareable Reports',
  description:
    'Generate beautiful, interactive HTML reports for Cucumber. Features include shareable email reports, multi-language support, and deep BDD insights.',
  alternates: {
    canonical: new URL('/', baseUrl).toString(),
  },
};

export default function HomePage() {
  const version = getReporterVersion();
  const siteUrl = baseUrl.toString();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        name: 'Multiple Cucumber HTML Reporter',
        alternateName: ['multiple-cucumber-html-reporter', 'MCHR'],
        url: siteUrl,
        description:
          'Generate beautiful, interactive HTML reports for Cucumber. Features include shareable email reports, multi-language support, and deep BDD insights.',
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}#organization`,
        name: 'Multiple Cucumber HTML Reporter',
        url: siteUrl,
        logo: `${siteUrl}/images/logo.png`,
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}#primary-nav`,
        name: 'Main Navigation',
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: [
          {
            '@type': 'SiteNavigationElement',
            position: 1,
            name: 'Documentation',
            description: 'Comprehensive guides, CLI setup, and framework integrations.',
            url: new URL('/docs', baseUrl).toString(),
          },
          {
            '@type': 'SiteNavigationElement',
            position: 2,
            name: 'Features',
            description: 'Rich metadata, visual analytics, charts, attachments, and email reporting.',
            url: new URL('/features', baseUrl).toString(),
          },
          {
            '@type': 'SiteNavigationElement',
            position: 3,
            name: 'How It Works',
            description: 'Learn how Multiple Cucumber HTML Reporter turns Cucumber JSON outputs into visual reports.',
            url: new URL('/how-it-works', baseUrl).toString(),
          },
          {
            '@type': 'SiteNavigationElement',
            position: 4,
            name: 'Installation',
            description: 'Step-by-step installation instructions for npm, pnpm, and yarn.',
            url: new URL('/docs/installation', baseUrl).toString(),
          },
          {
            '@type': 'SiteNavigationElement',
            position: 5,
            name: 'CLI',
            description: 'Command line interface configuration and usage options.',
            url: new URL('/docs/cli', baseUrl).toString(),
          },
          {
            '@type': 'SiteNavigationElement',
            position: 6,
            name: 'Config Generator',
            description:
              'Update the config file as per your requirements and copy the config file snipper or simply download the file.',
            url: new URL('/config-builder', baseUrl).toString(),
          },
          {
            '@type': 'SiteNavigationElement',
            position: 7,
            name: 'Showcase',
            description: 'Companies, organizations, and open-source projects using Multiple Cucumber HTML Reporter.',
            url: new URL('/showcase', baseUrl).toString(),
          },
          {
            '@type': 'SiteNavigationElement',
            position: 8,
            name: 'Community',
            description: 'Connect on Discord, GitHub Discussions, and contribute.',
            url: new URL('/community', baseUrl).toString(),
          },
        ],
      },
    ],
  };

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomePageClient version={version} />
    </>
  );
}
