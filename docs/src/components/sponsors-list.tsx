'use client';

import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { type GitHubSponsor, type SponsorGroup, sponsorGroup, sponsorLabel } from '@/lib/sponsor';

const GROUP_COPY: Record<SponsorGroup | 'current', { title: string; size: 'lg' | 'md' | 'sm' }> = {
  gold: { title: 'Gold Sponsors and above', size: 'lg' },
  silver: { title: 'Company, Silver & Bronze', size: 'md' },
  backer: { title: 'Individual Backers', size: 'sm' },
  current: { title: 'Current sponsors', size: 'md' },
};

const AVATAR_CLASS = {
  lg: 'w-20 h-20 sm:w-24 sm:h-24 border-2 border-emerald-500 shadow-xl mb-2 sm:mb-3',
  md: 'w-14 h-14 sm:w-16 sm:h-16 border border-emerald-500/50 shadow-md mb-1.5 sm:mb-2',
  sm: 'w-9 h-9 sm:w-10 sm:h-10 border border-zinc-200 dark:border-zinc-800 shadow-xs',
} as const;

function SponsorAvatar({ sponsor, size }: { sponsor: GitHubSponsor; size: 'lg' | 'md' | 'sm' }) {
  const dimension = size === 'lg' ? 96 : size === 'md' ? 64 : 40;
  return (
    <div
      className={cn(
        'bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center overflow-hidden',
        AVATAR_CLASS[size],
      )}
    >
      <Image
        src={sponsor.avatarUrl}
        alt={sponsor.name}
        width={dimension}
        height={dimension}
        className='w-full h-full object-cover'
      />
    </div>
  );
}

function SponsorGroupList({ sponsors, size }: { sponsors: GitHubSponsor[]; size: 'lg' | 'md' | 'sm' }) {
  if (size === 'sm') {
    return (
      <div className='flex flex-wrap gap-2.5 sm:gap-3'>
        {sponsors.map((sponsor) => (
          <Link
            key={sponsor.login}
            href={sponsor.url}
            target='_blank'
            title={sponsor.name}
            className='transition-transform hover:scale-105'
          >
            <SponsorAvatar sponsor={sponsor} size='sm' />
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap', size === 'lg' ? 'gap-4 sm:gap-6' : 'gap-3 sm:gap-4')}>
      {sponsors.map((sponsor) => (
        <Link
          key={sponsor.login}
          href={sponsor.url}
          target='_blank'
          title={sponsor.name}
          className='group flex flex-col items-center max-w-36 sm:max-w-40 text-center transition-transform hover:scale-105'
        >
          <SponsorAvatar sponsor={sponsor} size={size} />
          <span
            className={cn(
              'leading-tight group-hover:text-emerald-500',
              size === 'lg'
                ? 'text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300'
                : 'text-[11px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400',
            )}
          >
            {sponsorLabel(sponsor.name)}
          </span>
        </Link>
      ))}
    </div>
  );
}

function EmptySponsors() {
  return (
    <div className='bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 text-center flex flex-col items-center gap-4 sm:gap-6'>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
      >
        <Heart className='h-10 w-10 sm:h-12 sm:w-12 text-rose-500' />
      </motion.div>
      <div>
        <h3 className='text-xl sm:text-2xl font-bold mb-2'>Be the First Sponsor!</h3>
        <p className='text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto'>
          Your support directly funds independent development, ensuring the ecosystem remains modern, secure, and
          sustainable. Join our community of supporters today and help us build the future of Reporting.
        </p>
      </div>
      <Link
        href='https://github.com/sponsors/WasiqB'
        className={cn(
          buttonVariants({ size: 'lg' }),
          'bg-rose-500 hover:bg-rose-600 text-white hover:text-white rounded-full px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto justify-center',
        )}
      >
        Become a Sponsor
      </Link>
    </div>
  );
}

export function SponsorsSkeleton() {
  return (
    <section
      className='container mx-auto px-3 sm:px-6 max-w-4xl py-8 sm:py-12'
      aria-busy='true'
      aria-label='Loading sponsors'
    >
      <div className='h-8 w-56 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-3' />
      <div className='h-4 w-80 max-w-full rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse mb-8' />
      <div className='flex gap-4'>
        {['one', 'two', 'three'].map((item) => (
          <div key={item} className='flex flex-col items-center gap-2'>
            <div className='w-16 h-16 rounded-full bg-emerald-200/80 dark:bg-emerald-900/50 animate-pulse' />
            <div className='h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse' />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SponsorsList({ sponsors }: { sponsors: GitHubSponsor[] }) {
  const priced = sponsors.some((sponsor) => sponsor.monthlyPrice !== null);
  const groups = (['gold', 'silver', 'backer'] as const)
    .map((group) => ({
      group,
      sponsors: sponsors.filter((sponsor) => sponsorGroup(sponsor.monthlyPrice) === group),
    }))
    .filter((group) => group.sponsors.length > 0);
  const current = priced ? [] : sponsors;

  return (
    <section className='container mx-auto px-3 sm:px-6 max-w-4xl py-8 sm:py-12'>
      {sponsors.length === 0 ? (
        <EmptySponsors />
      ) : (
        <div className='flex flex-col gap-8 sm:gap-12'>
          <div className='flex flex-col items-start'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4'>Meet the Curators</h2>
            <p className='text-sm sm:text-base text-zinc-600 dark:text-zinc-400'>
              The organizations and individuals keeping the project alive.
            </p>
          </div>
          {priced ? (
            groups.map(({ group, sponsors: groupSponsors }, index) => (
              <div
                key={group}
                className={index > 0 ? 'border-t border-zinc-200 dark:border-zinc-800 pt-6 sm:pt-8' : undefined}
              >
                <h3 className='text-xs font-bold text-zinc-400 tracking-widest uppercase mb-4 sm:mb-6'>
                  {GROUP_COPY[group].title}
                </h3>
                <SponsorGroupList sponsors={groupSponsors} size={GROUP_COPY[group].size} />
              </div>
            ))
          ) : (
            <div>
              <h3 className='text-xs font-bold text-zinc-400 tracking-widest uppercase mb-4 sm:mb-6'>
                {GROUP_COPY.current.title}
              </h3>
              <SponsorGroupList sponsors={current} size='md' />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
