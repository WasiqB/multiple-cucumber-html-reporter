'use client';

import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Activity, BarChart3, Heart, Layers, MessageSquare, Star, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa6';
import { buttonVariants } from '@/components/ui/button';
import homeDataJson from '@/data/home.json';
import imagesDataJson from '@/data/image-links.json';
import statsDataJson from '@/data/stats.json';
import type { HomeData, ImageLinks, ProjectStats } from '@/data/types';
import { cn } from '@/lib/cn';

const iconMap: Record<string, React.ReactNode> = {
  Activity: <Activity className='h-6 w-6 text-emerald-500' />,
  BarChart3: <BarChart3 className='h-6 w-6 text-emerald-500' />,
  Zap: <Zap className='h-6 w-6 text-emerald-500' />,
  Layers: <Layers className='h-6 w-6 text-emerald-500' />,
  Heart: <Heart className='h-8 w-8 text-rose-500' />,
  Star: <Star className='h-8 w-8 text-amber-500' />,
  MessageSquare: <MessageSquare className='h-8 w-8 text-emerald-500' />,
  Download: <Activity className='h-6 w-6 text-emerald-500' />,
  Users: <Layers className='h-6 w-6 text-emerald-500' />,
  StarFill: <Star className='h-6 w-6 text-emerald-500' />,
};

export default function HomePage() {
  const { hero, features, setup, community, trustedBy } = homeDataJson as HomeData;
  const { stats } = statsDataJson as ProjectStats;
  const heroImage = (imagesDataJson as ImageLinks)[hero.image];

  return (
    <main className='flex flex-col gap-24 pb-20 overflow-x-hidden m-10'>
      {/* Hero Section */}
      {hero && (
        <section className='relative pt-20 md:pt-32 px-6'>
          <div className='container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className='flex flex-col gap-6'
            >
              {hero.badge && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold w-fit border border-emerald-500/20'
                >
                  <span className='flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                  {hero.badge}
                </motion.div>
              )}

              <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-balance'>
                {hero.titleLine1} <br />
                {hero.titleLine2 && (
                  <span className='bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent'>
                    {hero.titleLine2}
                  </span>
                )}
              </h1>

              {hero.description && (
                <p className='text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed'>
                  {hero.description}
                </p>
              )}

              <div className='flex flex-wrap gap-4 mt-4'>
                {hero.primaryLink && (
                  <Link
                    href={hero.primaryLink.url}
                    className={cn(
                      buttonVariants({ size: 'default' }),
                      'bg-emerald-600 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 text-white hover:text-white rounded-xl px-8 h-12 text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]',
                    )}
                  >
                    {hero.primaryLink.label}
                  </Link>
                )}
                {hero.secondaryLink && (
                  <Link
                    href={hero.secondaryLink.url}
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'default' }),
                      'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-8 h-12 text-base font-semibold group',
                    )}
                  >
                    <FaGithub className='mr-2 h-5 w-5 transition-transform group-hover:scale-110' />
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
              <div className='absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full opacity-50' />
              <div className='relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm overflow-hidden shadow-2xl p-1'>
                <Image
                  src={heroImage}
                  alt='Cucumber Report Dashboard'
                  width={800}
                  height={500}
                  className='rounded-xl object-contain w-full h-auto'
                  priority
                />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {stats && (
        <section className='container mx-auto px-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-[2rem] px-8 md:px-16'>
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className='flex flex-col items-center md:items-start text-center md:text-left gap-2'
              >
                <div className='flex items-center gap-3 mb-1'>
                  {stat.icon && (
                    <div className='p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'>
                      {iconMap[stat.icon === 'Star' ? 'StarFill' : stat.icon] || iconMap.Activity}
                    </div>
                  )}
                  <div className='text-3xl md:text-4xl font-black text-emerald-600 dark:text-emerald-500'>
                    {stat.value}
                  </div>
                </div>
                <div className='text-sm font-bold text-zinc-500 uppercase tracking-widest leading-tight'>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      {features && (
        <section id='features' className='container mx-auto px-6'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-5xl font-bold mb-4'>{features.title}</h2>
            <p className='text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto'>{features.description}</p>
          </div>

          {features.items && features.items.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {features.items.map((feature, idx) => (
                <FeatureCard
                  key={idx}
                  icon={iconMap[feature.icon] || <Activity className='h-6 w-6 text-emerald-500' />}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Code Snippet Section */}
      {setup && (
        <section className='container mx-auto px-6'>
          <div className='bg-zinc-950 rounded-3xl border border-zinc-800 p-8 md:p-12 shadow-2xl relative overflow-hidden group'>
            <div className='absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-3xl opacity-50 -mr-48 -mt-48' />

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10'>
              <div className='flex flex-col gap-6'>
                <h2 className='text-3xl md:text-4xl font-bold text-white leading-tight'>
                  {setup.titleLine1 || 'Simple Setup,'} <br />
                  {setup.titleLine2 || 'Powerful Results'}
                </h2>
                <p className='text-zinc-400 text-lg'>{setup.description}</p>
                {setup.link && (
                  <Link
                    href={setup.link.url}
                    className='text-emerald-400 font-bold flex items-center group-hover:gap-2 transition-all'
                  >
                    {setup.link.label} <span className='ml-2'>→</span>
                  </Link>
                )}
              </div>

              {setup.code && (
                <DynamicCodeBlock
                  lang='ts'
                  code={setup.code}
                  options={{
                    themes: {
                      light: 'github-light',
                      dark: 'github-dark',
                    },
                  }}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Community / Support Section */}
      {community && (
        <section id='community' className='container mx-auto px-6 mb-12'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-5xl font-bold mb-4'>{community.title}</h2>
          </div>

          {community.items && community.items.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {community.items.map((item, idx) => (
                <SupportCard
                  key={idx}
                  icon={iconMap[item.icon] || <Heart className='h-8 w-8 text-emerald-500' />}
                  title={item.title}
                  description={item.description}
                  buttonText={item.buttonText}
                  href={item.href}
                  color={item.color}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Trusted By / Logos Section */}
      {trustedBy?.companies?.length > 0 && (
        <section className='border-t border-zinc-200 dark:border-zinc-800 pt-20 px-6'>
          <div className='container mx-auto'>
            <p className='text-center text-sm font-bold tracking-widest text-zinc-500 dark:text-zinc-500 uppercase mb-12'>
              {trustedBy.title}
            </p>
            {trustedBy.companies && trustedBy.companies.length > 0 && (
              <div className='flex flex-wrap justify-center gap-x-16 gap-y-10 opacity-50 grayscale contrast-125 dark:invert'>
                {trustedBy.companies.map((company, idx) => (
                  <span key={idx} className={company.className || ''}>
                    {company.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className='p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 transition-all shadow-sm hover:shadow-xl group'
    >
      <div className='mb-4 group-hover:scale-110 transition-transform'>{icon}</div>
      <h3 className='text-xl font-bold mb-2'>{title}</h3>
      <p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>{description}</p>
    </motion.div>
  );
}

function SupportCard({
  icon,
  title,
  description,
  buttonText,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  color: string;
}) {
  const colorMap = {
    rose: 'border-rose-500 text-rose-500 hover:bg-rose-500 shadow-rose-500/20',
    amber: 'border-amber-500 text-amber-500 hover:bg-amber-500 shadow-amber-500/20',
    emerald: 'border-emerald-500 text-emerald-500 hover:bg-emerald-500 shadow-emerald-500/20',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className='flex flex-col items-center text-center p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-2xl transition-all'
    >
      <div className='mb-6'>{icon}</div>
      <h3 className='text-2xl font-bold mb-4'>{title}</h3>
      <p className='text-zinc-600 dark:text-zinc-400 mb-8 text-sm leading-relaxed'>{description}</p>
      <Link
        href={href}
        className={cn(
          'w-full py-4 rounded-xl border font-bold transition-all hover:text-white shadow-lg',
          colorMap[color as keyof typeof colorMap] || colorMap.emerald,
        )}
      >
        {buttonText}
      </Link>
    </motion.div>
  );
}
