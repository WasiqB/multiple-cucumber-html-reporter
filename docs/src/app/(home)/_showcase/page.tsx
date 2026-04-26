'use client';

import { Activity, Bug, GitFork, Layout, MonitorPlay, Rocket, Search, ShieldCheck, Star, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import showcaseDataJson from '@/data/showcase.json';
import type { ShowcaseData } from '@/data/types';
import { cn } from '@/lib/cn';

const iconMap: Record<string, React.ReactNode> = {
  MonitorPlay: <MonitorPlay className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />,
  Bug: <Bug className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />,
  Rocket: <Rocket className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />,
  Zap: <Zap className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />,
  Layout: <Layout className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />,
  Activity: <Activity className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />,
};

export default function ShowcasePage() {
  const { hero, filters, projects } = showcaseDataJson as ShowcaseData;

  const [activeFilter, setActiveFilter] = useState('All Frameworks');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All Frameworks' || project.framework === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [projects, searchQuery, activeFilter]);

  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

  return (
    <main className='flex flex-col overflow-x-hidden pt-10 pb-20'>
      {/* Hero Section */}
      {hero && (
        <section className='pt-10 md:pt-20 px-6'>
          <div className='container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center max-w-6xl'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className='flex flex-col gap-6 items-start'
            >
              {hero.badge && (
                <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400 text-emerald-950 text-xs font-bold w-fit uppercase tracking-wider mb-2'>
                  <span className='flex items-center justify-center bg-white/30 rounded-full h-4 w-4'>
                    <div className='bg-emerald-950 w-1.5 h-1.5 rounded-full' />
                  </span>
                  {hero.badge}
                </div>
              )}

              <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-white'>
                {hero.titleLine1} <br />
                {hero.titleLine2}
              </h1>

              <p className='text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed'>
                {hero.description}
              </p>

              <div className='flex flex-wrap gap-4 mt-2'>
                {hero.primaryLink && (
                  <Link
                    href={hero.primaryLink.url}
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white rounded-full px-8 h-12 text-base font-bold transition-all shadow-md group',
                    )}
                  >
                    {hero.primaryLink.label}
                    <span className='ml-2 transition-transform group-hover:translate-x-1'>→</span>
                  </Link>
                )}
                {hero.secondaryLink && (
                  <Link
                    href={hero.secondaryLink.url}
                    className={cn(
                      buttonVariants({ variant: 'secondary', size: 'lg' }),
                      'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-full px-8 h-12 text-base font-semibold',
                    )}
                  >
                    {hero.secondaryLink.label}
                  </Link>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className='relative'
            >
              <div className='relative rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden aspect-4/3 max-w-lg ml-auto bg-zinc-900'>
                <Image
                  src={hero.image}
                  alt='IDE Screenshot'
                  width={800}
                  height={600}
                  className='object-cover w-full h-full opacity-80 mix-blend-screen'
                />
              </div>

              {/* Overlapping Badge */}
              {hero.verifiedProjects && (
                <div className='absolute -bottom-8 -left-8 md:-bottom-6 md:-left-12 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-4'>
                  <div className='w-12 h-12 bg-emerald-400 rounded-xl flex items-center justify-center text-emerald-950 shadow-inner'>
                    <ShieldCheck className='h-6 w-6' strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className='text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1'>
                      {hero.verifiedProjects.label}
                    </div>
                    <div className='text-3xl font-black text-zinc-900 dark:text-white leading-none'>
                      {hero.verifiedProjects.count}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Main Content Area: Filters, Search, Grid */}
      <section className='container mx-auto px-6 mt-32 max-w-7xl'>
        {/* Filters and Search Bar */}
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12'>
          <div className='flex flex-wrap items-center gap-2'>
            {filters?.map((filter, idx) => (
              <Button
                key={idx}
                onClick={() => {
                  setActiveFilter(filter);
                  setVisibleCount(6);
                }}
                className={cn(
                  'px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm',
                  activeFilter === filter
                    ? 'bg-emerald-800 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
                )}
              >
                {filter}
              </Button>
            ))}
          </div>

          <div className='relative w-full lg:w-72'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(6);
              }}
              placeholder='Search repositories...'
              className='w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm transition-all'
            />
          </div>
        </div>

        {/* Project Grid */}
        {visibleProjects.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16'>
            {visibleProjects.map((project, idx) => (
              <motion.a
                href={project.url}
                key={idx}
                whileHover={{ y: -4 }}
                className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-xl transition-all h-full group outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
              >
                {/* Card Header */}
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-lg'>
                      {iconMap[project.icon] || <Activity className='h-5 w-5 text-emerald-600' />}
                    </div>
                    <h3 className='font-bold text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors'>
                      {project.name}
                    </h3>
                  </div>
                  <div className='px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 text-[10px] font-bold rounded-full uppercase tracking-wider'>
                    {project.framework}
                  </div>
                </div>

                {/* Description */}
                <p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-10 grow'>
                  {project.description}
                </p>

                {/* Card Footer */}
                <div className='flex items-center justify-between mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800'>
                  {/* Stats */}
                  <div className='flex items-center gap-4 text-xs font-bold text-zinc-500 dark:text-zinc-400'>
                    <div className='flex items-center gap-1.5'>
                      <Star className='h-3.5 w-3.5' /> {project.stars}
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <GitFork className='h-3.5 w-3.5' /> {project.forks}
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        ) : (
          <div className='text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-16'>
            <p className='text-zinc-500 font-medium'>No projects found matching your criteria.</p>
          </div>
        )}

        {/* View More Button */}
        {hasMore && (
          <div className='flex justify-center'>
            <Button
              onClick={() => setVisibleCount((c) => c + 6)}
              className='bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold px-8 py-3.5 rounded-full transition-colors shadow-sm'
            >
              View More Projects
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
