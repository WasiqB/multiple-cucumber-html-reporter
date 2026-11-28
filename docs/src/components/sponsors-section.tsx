import { Suspense } from 'react';
import { SponsorsList, SponsorsSkeleton } from '@/components/sponsors-list';
import { getSponsors } from '@/lib/sponsors';

async function SponsorsContent() {
  const sponsors = await getSponsors();
  return <SponsorsList sponsors={sponsors} />;
}

export function SponsorsSection() {
  return (
    <Suspense fallback={<SponsorsSkeleton />}>
      <SponsorsContent />
    </Suspense>
  );
}
