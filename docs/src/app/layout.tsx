import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Geist, Inter } from 'next/font/google';
import { Suspense } from 'react';
import analytics from '@/data/analytics.json';
import { isProd } from '@/lib/shared';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  subsets: ['latin'],
});

async function AnalyticsWrapper() {
  if (!isProd) return null;
  const analyticsId = analytics?.gaId;
  if (!analyticsId) return null;
  return <GoogleAnalytics gaId={analyticsId} />;
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
