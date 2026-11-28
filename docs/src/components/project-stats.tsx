'use client';

import { Activity, Download, type LucideIcon, Star, Users } from 'lucide-react';
import { animate, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { formatStatValue, type ProjectStatSnapshot } from '@/lib/format-stat';

const STATS: readonly {
  key: keyof ProjectStatSnapshot;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: 'stars', label: 'GitHub Stars', icon: Star },
  { key: 'dependents', label: 'Dependents', icon: Users },
  { key: 'monthlyDownloads', label: 'NPM Monthly Downloads', icon: Download },
  { key: 'weeklyDownloads', label: 'NPM Weekly Downloads', icon: Activity },
];

function StatValue({ value, delay }: { value: number; delay: number }) {
  const [display, setDisplay] = useState<number | null>(null);
  const started = useRef(false);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  const rounded = display === null ? 0 : Math.round(display);
  const isVisible = rounded > 0;

  useEffect(() => {
    return () => controlsRef.current?.stop();
  }, []);

  function play() {
    if (started.current) return;
    started.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    controlsRef.current = animate(0, value, {
      duration: 1.2,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(latest),
    });
  }

  return (
    <motion.span
      className='relative inline-grid tabular-nums'
      onViewportEnter={play}
      viewport={{ once: true, amount: 0.6 }}
    >
      <span className='invisible col-start-1 row-start-1' aria-hidden>
        {formatStatValue(value)}
      </span>
      <span className='col-start-1 row-start-1'>
        {isVisible ? (
          <span aria-hidden>{formatStatValue(rounded)}</span>
        ) : (
          <span
            className='block h-[1em] w-full rounded-md bg-emerald-200/80 dark:bg-emerald-900/50 animate-pulse'
            aria-hidden
          />
        )}
      </span>
      <span className='sr-only'>{formatStatValue(value)}</span>
    </motion.span>
  );
}

function StatsGrid({ stats }: { stats?: ProjectStatSnapshot }) {
  return (
    <section className='container mx-auto px-3 sm:px-6' aria-label='Project stats' aria-busy={stats ? undefined : true}>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 py-8 sm:py-12 border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl sm:rounded-[2rem] px-4 sm:px-8 md:px-16'>
        {STATS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className='flex flex-col items-center md:items-start text-center md:text-left gap-1 sm:gap-2'
            >
              <div className='flex items-center gap-2 sm:gap-3 mb-1'>
                <div className='p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'>
                  <Icon className='h-6 w-6' />
                </div>
                <div className='text-2xl sm:text-3xl md:text-4xl font-black text-emerald-600 dark:text-emerald-500'>
                  {stats ? (
                    <StatValue value={stats[stat.key]} delay={index * 0.08} />
                  ) : (
                    <span className='inline-block h-[1em] w-[2.6em] rounded-md bg-emerald-200/80 dark:bg-emerald-900/50 animate-pulse align-middle' />
                  )}
                </div>
              </div>
              <div className='text-xs sm:text-sm font-bold text-zinc-500 uppercase tracking-widest leading-tight'>
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export function ProjectStatsSkeleton() {
  return <StatsGrid />;
}

export function ProjectStatsGrid({ stats }: { stats: ProjectStatSnapshot }) {
  return <StatsGrid stats={stats} />;
}
