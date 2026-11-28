import { SponsorsSection } from '@/components/sponsors-section';
import SponsorsPageClient from './_sponsors-client';

export default function SponsorsPage() {
  return <SponsorsPageClient curators={<SponsorsSection />} />;
}
