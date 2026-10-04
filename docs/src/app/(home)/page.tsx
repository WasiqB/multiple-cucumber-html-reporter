import { getReporterVersion } from '@/lib/shared';
import HomePageClient from './_home-client';

export default function HomePage() {
  const version = getReporterVersion();
  return <HomePageClient version={version} />;
}
