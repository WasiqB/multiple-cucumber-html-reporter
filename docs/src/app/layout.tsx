import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Geist, Inter } from 'next/font/google';
import { Suspense } from 'react';
import analytics from '@/data/analytics.json';
import { cn } from '@/lib/cn';
import { baseUrl, createMetadata } from '@/lib/metadata';
import { isProd } from '@/lib/shared';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = createMetadata({
  title: {
    template: '%s | Multiple Cucumber HTML Reporter',
    default: 'Cucumber HTML Reporter & Dashboard | Shareable Reports',
  },
  applicationName: 'Multiple Cucumber HTML Reporter',
  description:
    'Generate beautiful, interactive HTML reports for Cucumber. Features include shareable email reports, multi-language support, and deep BDD insights.',
  metadataBase: baseUrl,
  keywords: [
    'Multiple Cucumber HTML Reporter',
    'cucumber html report',
    'cucumber dashboard',
    'bdd test report',
    'playwright cucumber reporter',
    'webdriverio cucumber reporter',
    'cypress cucumber reporter',
    'cucumber json to html',
    'shareable test report',
    'email test report',
  ],
  authors: [{ name: 'Wasiq Bhamla', url: 'https://www.wasiqbhamla.com' }],
  creator: 'Wasiq Bhamla',
  publisher: 'Wasiq Bhamla',
  alternates: {
    canonical: new URL('/', baseUrl).toString(),
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/images/logo.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Multiple Cucumber HTML Reporter',
    title: 'Cucumber HTML Reporter & Dashboard | Shareable Reports',
    description:
      'Generate beautiful, interactive HTML reports for Cucumber. Features include shareable email reports, multi-language support, and deep BDD insights.',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Multiple Cucumber HTML Reporter Dashboard Preview',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    creator: 'Wasiq Bhamla',
    title: 'Cucumber HTML Reporter & Dashboard | Shareable Reports',
    description:
      'Generate beautiful, interactive HTML reports for Cucumber. Features include shareable email reports, multi-language support, and deep BDD insights.',
    images: ['/images/logo.png'],
  },
});

function AnalyticsWrapper() {
  const analyticsId = analytics?.gaId;
  return (
    <>
      {isProd && analyticsId && <GoogleAnalytics gaId={analyticsId} />}
      {isProd && (
        <>
          <SpeedInsights />
          <Analytics />
        </>
      )}
    </>
  );
}

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='en' className={cn(inter.className, 'font-sans', geist.variable)} suppressHydrationWarning>
      <body className='flex flex-col min-h-screen'>
        <RootProvider>{children}</RootProvider>
        <Suspense>
          <AnalyticsWrapper />
        </Suspense>
      </body>
    </html>
  );
}
