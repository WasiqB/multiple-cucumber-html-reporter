import type { Metadata } from 'next';
import { baseUrl, getReporterVersion } from '@/lib/shared';
import HomePageClient from './_home-client';

export const metadata: Metadata = {
  title: 'Multiple Cucumber HTML Reporter: Beautiful, interactive HTML test reports',
  description:
    'Multiple Cucumber HTML Reporter is a powerful reporting module for Cucumber to transform standard JSON output into beautiful, interactive, and insightful test reports.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  const version = getReporterVersion();

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Multiple Cucumber HTML Reporter',
    url: baseUrl.toString(),
    description:
      'Multiple Cucumber HTML Reporter transforms Cucumber JSON test outputs into beautiful, interactive HTML reports.',
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
    url: baseUrl.toString(),
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
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <HomePageClient version={version} />
    </>
  );
}
