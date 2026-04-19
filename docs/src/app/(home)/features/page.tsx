'use client';

import { BarChart3, CheckCircle2, Network, Search, Terminal, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import featuresDataJson from '@/data/features.json';
import type { FeaturesData } from '@/data/types';
import { cn } from '@/lib/cn';

const iconMap: Record<string, React.ReactNode> = {
  BarChart3: <BarChart3 className='h-6 w-6' />,
  Network: <Network className='h-6 w-6' />,
  Search: <Search className='h-6 w-6' />,
  Terminal: <Terminal className='h-6 w-6' />,
};

export default function FeaturesPage() {
  const { hero, precision, preview, upgrade, cta } = featuresDataJson as FeaturesData;

  return (
    <main className='flex flex-col gap-24 pb-20 overflow-x-hidden m-10'>
      {/* Hero Section */}
      {hero && (
        <section className='pt-20 md:pt-32 px-6'>
          <div className='container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className='flex flex-col gap-6'
            >
              {hero.badge && (
                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold w-fit border border-emerald-500/20 uppercase tracking-wider'>
                  {hero.badge}
                </div>
              )}
              <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight'>
                {hero.titleLine1 || 'Powerful reporting for'} <br className='hidden md:block' />
                {hero.titleLine2 || 'modern BDD'}
              </h1>
              <p className='text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed mt-2'>
                {hero.description}
              </p>
              <div className='flex flex-wrap gap-4 mt-4'>
                {hero.primaryLink && (
                  <Link
                    href={hero.primaryLink.url}
                    className={cn(
                      buttonVariants({ size: 'default' }),
                      'bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-8 h-12 text-base font-bold transition-all shadow-lg',
                    )}
                  >
                    {hero.primaryLink.label}
                  </Link>
                )}
                {hero.secondaryLink && (
                  <Link
                    href={hero.secondaryLink.url}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'default' }),
                      'rounded-full px-8 h-12 text-base font-semibold group border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all',
                    )}
                  >
                    <span className='mr-2 font-black'>▶</span> {hero.secondaryLink.label}
                  </Link>
                )}
              </div>
            </motion.div>

            {hero.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className='relative'
              >
                <div className='absolute -inset-4 bg-sky-500/10 blur-3xl rounded-full opacity-50' />
                <div className='relative rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden aspect-4/3'>
                  <Image
                    src={hero.image}
                    alt='Analytics Dashboard'
                    width={2070}
                    height={1552}
                    className='object-cover w-full h-full filter brightness-90 contrast-125'
                  />
                  <div className='absolute inset-0 bg-linear-to-tr from-emerald-900/40 to-transparent' />
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Precision at Scale Section */}
      {precision && (
        <section className='container mx-auto px-6 max-w-6xl'>
          <div className='mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>{precision.title}</h2>
            <p className='text-zinc-600 dark:text-zinc-400'>{precision.description}</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {precision.cards?.map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className={cn(
                  'rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all flex flex-col items-start border',
                  card.type === 'dark'
                    ? 'bg-emerald-800 dark:bg-emerald-900 border-emerald-700 dark:border-emerald-800 text-white'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-6',
                    card.type === 'dark'
                      ? 'bg-emerald-700/50 dark:bg-emerald-800 text-emerald-200'
                      : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                  )}
                >
                  {iconMap[card.icon]}
                </div>
                <h3 className='text-xl font-bold mb-3'>{card.title}</h3>
                <p
                  className={cn(
                    'text-sm leading-relaxed mb-6',
                    card.type === 'dark' ? 'text-emerald-100/80' : 'text-zinc-600 dark:text-zinc-400',
                  )}
                >
                  {card.description}
                </p>
                {card.linkText && (
                  <Link
                    href={card.linkUrl || '#'}
                    className='mt-auto font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 group hover:text-emerald-700'
                  >
                    {card.linkText} <span className='transition-transform group-hover:translate-x-1 font-sans'>→</span>
                  </Link>
                )}
              </motion.div>
            ))}

            {precision.developerFirst && (
              <motion.div
                whileHover={{ y: -5 }}
                className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-8 items-center overflow-hidden'
              >
                <div className='flex flex-col items-start flex-1'>
                  <div className='w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6'>
                    {iconMap[precision.developerFirst.icon] || <Terminal className='h-6 w-6' />}
                  </div>
                  <h3 className='text-xl font-bold mb-3'>{precision.developerFirst.title}</h3>
                  <p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>
                    {precision.developerFirst.description}
                  </p>
                </div>
                <div className='w-full md:w-64 bg-zinc-950 rounded-xl p-4 md:p-5 border border-zinc-800 shrink-0 font-mono text-[10px] md:text-xs text-zinc-300 shadow-inner'>
                  <div className='flex gap-1.5 mb-3'>
                    <div className='w-2 h-2 rounded-full bg-red-500/80'></div>
                    <div className='w-2 h-2 rounded-full bg-amber-500/80'></div>
                    <div className='w-2 h-2 rounded-full bg-emerald-500/80'></div>
                  </div>
                  {precision.developerFirst.code && (
                    <div dangerouslySetInnerHTML={{ __html: precision.developerFirst.code }} />
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Interactive Preview Section */}
      {preview && (
        <section className='container mx-auto px-6 max-w-5xl text-center py-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>{preview.title}</h2>
          <p className='text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12'>
            {preview.description}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden shadow-2xl relative max-w-4xl mx-auto'
          >
            {/* Header */}
            <div className='bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between px-6'>
              <div className='flex items-center gap-6'>
                <div className='flex gap-2'>
                  <div className='w-3 h-3 rounded-full bg-red-400'></div>
                  <div className='w-3 h-3 rounded-full bg-amber-400'></div>
                  <div className='w-3 h-3 rounded-full bg-emerald-400'></div>
                </div>
                <span className='text-xs font-bold text-zinc-500 tracking-widest'>LIVE REPORT JSON</span>
              </div>
              <div className='px-3 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold'>
                Passing 98.4%
              </div>
            </div>

            <div className='p-6 md:p-10 grid grid-cols-1 md:grid-cols-4 gap-8'>
              {/* Left Stats column */}
              {preview.stats && (
                <div className='flex flex-col gap-4 text-left'>
                  <div className='bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm'>
                    <div className='text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1'>
                      Total scenarios
                    </div>
                    <div className='text-2xl font-black'>{preview.stats.total}</div>
                  </div>
                  <div className='bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 shadow-sm'>
                    <div className='text-[10px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider mb-1'>
                      Passed
                    </div>
                    <div className='text-2xl font-black text-emerald-700 dark:text-emerald-400'>
                      {preview.stats.passed}
                    </div>
                  </div>
                  <div className='bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm'>
                    <div className='text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1'>Duration</div>
                    <div className='text-2xl font-black'>{preview.stats.duration}</div>
                  </div>
                </div>
              )}

              {/* Right Feed & Chart column */}
              <div className='md:col-span-3 flex flex-col gap-6 text-left relative'>
                {preview.features?.map((feature, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center justify-between',
                      idx !== preview.features.length - 1 && 'border-b border-zinc-200 dark:border-zinc-800 pb-4',
                    )}
                  >
                    <div className='flex items-center gap-3'>
                      {feature.status === 'passed' ? (
                        <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                      ) : (
                        <XCircle className='h-5 w-5 text-red-500' />
                      )}
                      <span
                        className={cn(
                          'font-bold text-sm',
                          feature.status === 'failed' && 'text-red-600 dark:text-red-400',
                        )}
                      >
                        {feature.name}
                      </span>
                    </div>
                    <span className='text-xs text-zinc-500 font-mono'>{feature.time}</span>
                  </div>
                ))}

                {/* Decorative Chart Area */}
                <div className='mt-4 h-32 w-full bg-linear-to-t from-emerald-100 to-transparent dark:from-emerald-900/20 dark:to-transparent rounded-lg flex items-end justify-between px-2 gap-1 overflow-hidden relative'>
                  {/* Lines to simulate chart */}
                  <div className='absolute bottom-0 left-0 w-full h-full opacity-30'>
                    <svg viewBox='0 0 100 100' preserveAspectRatio='none' className='w-full h-full text-emerald-500'>
                      <path
                        d='M0,100 L20,80 L40,90 L60,40 L80,60 L100,20 L100,100 Z'
                        fill='currentColor'
                        opacity='0.2'
                      />
                      <path
                        d='M0,80 L20,60 L40,70 L60,20 L80,40 L100,0'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1'
                      />
                    </svg>
                  </div>
                  {/* Bars */}
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className='w-full bg-emerald-400 dark:bg-emerald-600 rounded-t-sm z-10'
                      style={{ height: `${Math.max(10, Math.random() * 100)}%`, opacity: i > 18 ? 0.3 : 0.8 }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* The Upgrade Path Section */}
      {upgrade && (
        <section className='container mx-auto px-6 max-w-4xl text-center py-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12'>{upgrade.title}</h2>

          <div className='bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden text-left'>
            <div className='grid grid-cols-3 p-6 px-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/50'>
              <div className='text-[10px] font-bold text-zinc-500 uppercase tracking-widest'>Feature Capability</div>
              <div className='text-[10px] font-bold text-zinc-500 uppercase tracking-widest'>Standard JSON</div>
              <div className='text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest'>
                CucumberHTML
              </div>
            </div>

            {upgrade.rows?.map((row, idx) => (
              <div
                key={idx}
                className={cn(
                  'grid grid-cols-3 p-6 px-10 items-center hover:bg-white dark:hover:bg-zinc-900/80 transition-colors',
                  idx !== upgrade.rows.length - 1 && 'border-b border-zinc-200 dark:border-zinc-800',
                )}
              >
                <div className='font-semibold text-sm'>{row.feature}</div>
                <div className='text-sm text-zinc-500 italic'>{row.standard}</div>
                <div className='text-sm font-bold flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-emerald-500' /> {row.improved}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ready to Upgrade CTA */}
      {cta && (
        <section className='container mx-auto px-6 max-w-5xl mb-12'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='bg-emerald-900 rounded-[3rem] p-16 text-center flex flex-col items-center shadow-2xl relative overflow-hidden'
          >
            {/* subtle decorative blur */}
            <div className='absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 blur-3xl rounded-full' />

            <h2 className='text-3xl md:text-5xl font-extrabold text-white mb-6 relative z-10'>{cta.title}</h2>
            <p className='text-emerald-100/90 text-lg md:text-xl leading-relaxed max-w-2xl mb-10 relative z-10'>
              {cta.description}
            </p>

            <div className='flex flex-wrap justify-center gap-4 relative z-10'>
              {cta.primaryLink && (
                <Link
                  href={cta.primaryLink.url}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-full font-bold px-8 shadow-lg',
                  )}
                >
                  {cta.primaryLink.label}
                </Link>
              )}
              {cta.secondaryLink && (
                <Link
                  href={cta.secondaryLink.url}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'border-emerald-700 bg-emerald-950/50 text-emerald-100 hover:bg-emerald-800 hover:text-white rounded-full font-bold px-8',
                  )}
                >
                  {cta.secondaryLink.label}
                </Link>
              )}
            </div>
          </motion.div>
        </section>
      )}
    </main>
  );
}
