import type { Metadata } from 'next';
import { baseUrl, getReporterVersion } from '@/lib/shared';
import HomePageClient from './_home-client';

export const metadata: Metadata = {
  title: 'Multiple Cucumber HTML Reporter: Beautiful, interactive HTML test reports',
  description:
    'Multiple Cucumber HTML Reporter is a powerful reporting module for Cucumber to transform standard JSON output into beautiful, interactive, and insightful test reports.',
  alternates: {
    canonical: baseUrl.toString(),
  },
};

export default function HomePage() {
  const version = getReporterVersion();
  const siteUrl = baseUrl.toString();

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Multiple Cucumber HTML Reporter',
    alternateName: ['multiple-cucumber-html-reporter', 'MCHR'],
    url: siteUrl,
    description:
      'Multiple Cucumber HTML Reporter transforms Cucumber JSON test outputs into beautiful, interactive HTML reports.',
  };

  const navigationSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Main Navigation',
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
        name: 'Showcase',
        description: 'Companies, organizations, and open-source projects using Multiple Cucumber HTML Reporter.',
        url: new URL('/showcase', baseUrl).toString(),
      },
      {
        '@type': 'SiteNavigationElement',
        position: 7,
        name: 'Community',
        description: 'Connect on Discord, GitHub Discussions, and contribute.',
        url: new URL('/community', baseUrl).toString(),
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Multiple Cucumber HTML Reporter',
    alternateName: ['multiple-cucumber-html-reporter', 'mchr'],
    operatingSystem: 'Cross-platform (Windows, macOS, Linux)',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'TestReportingApplication',
    softwareVersion: version,
    url: siteUrl,
    description:
      'Multiple Cucumber HTML Reporter is a feature-rich, fast, and highly configurable HTML reporter for CucumberJS reports, optimized for performance and user experience.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Wasiq Bhamla',
      url: 'https://www.wasiqbhamla.com',
    },
  };

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationSchema) }} />
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <HomePageClient version={version} />
    </>
  );
}
