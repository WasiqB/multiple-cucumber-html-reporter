import { Suspense } from 'react';
import { ProjectStatsGrid, ProjectStatsSkeleton } from '@/components/project-stats';
import { getProjectStats } from '@/lib/project-stats';

async function ProjectStatsContent() {
  const stats = await getProjectStats();
  return <ProjectStatsGrid stats={stats} />;
}

export function ProjectStatsSection() {
  return (
    <Suspense fallback={<ProjectStatsSkeleton />}>
      <ProjectStatsContent />
    </Suspense>
  );
}
