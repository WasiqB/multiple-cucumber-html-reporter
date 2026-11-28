import { ProjectStatsSection } from '@/components/project-stats-section';
import FeaturesPageClient from './_features-client';

export default function FeaturesPage() {
  return <FeaturesPageClient stats={<ProjectStatsSection />} />;
}
