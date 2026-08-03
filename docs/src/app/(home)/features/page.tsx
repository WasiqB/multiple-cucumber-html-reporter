'use client';

import { Activity, CheckCircle2, Layers, Star } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { buttonVariants } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import imagesDataJson from '@/data/image-links.json';
import statsDataJson from '@/data/stats.json';
import type { ImageLinks, ProjectStats } from '@/data/types';
import { cn } from '@/lib/cn';

const heroData = {
  badge: 'Open Source Reporter',
  titleLine1: 'Powerful reporting for',
  titleLine2: 'modern BDD',
  description:
    'Discover the features that make multiple CucumberHTML reporter the preferred reporter for engineering teams. Build trust through visibility.',
  primaryLink: { label: 'Install Library', url: '/docs/latest/installation' },
  image: 'featureCharts1' as keyof ImageLinks,
};

const accordionData = {
  title: 'Unmatched Capabilities',
  description: 'Deep dive into the specialized features that set us apart from standard reporters.',
  items: [
    {
      title: 'Rich Metadata and Environment Info',
      pointers: [
        'Capture OS, Browser, and Device information automatically',
        'Custom metadata fields for CI/CD pipeline details',
        'Environment-specific tags and labels',
        'Automated platform detection',
      ],
      images: ['featureListMetadata', 'featureDetailMetadata'] as (keyof ImageLinks)[],
    },
    {
      title: 'Interactive Analytics Dashboards',
      pointers: [
        'Detailed pass/fail distribution charts',
        'Test performance trend analysis',
        'Detailed charts for features, scenarios and scenario steps',
        'OS, Browser, and Device-specific charts',
        'Top tags and slow steps featured charts',
      ],
      images: ['featureCharts1', 'featureCharts2', 'featureDetailChart'] as (keyof ImageLinks)[],
    },
    {
      title: 'Advanced Diagnostics',
      pointers: [
        'Clean, formatted stack traces with syntax highlighting',
        'Attached screenshots and video capture on failure',
        'Attached logs for better debugging',
        'Step-by-step execution logs',
      ],
      images: [
        'scenarioSuccess',
        'attachErrorLog',
        'attachLog',
        'attachScreenshot',
        'attachJson',
        'attachVideo',
      ] as (keyof ImageLinks)[],
    },
    {
      title: 'Rich and Detailed Feature and Scenario Tables',
      pointers: [
        'Detailed table for feature and scenario',
        'Easy to understand stats for each features and scenarios',
        'User friendly filtering of records',
        'Quick navigation between features and scenarios',
      ],
      images: ['featureListTable', 'scenarioListTable'] as (keyof ImageLinks)[],
    },
    {
      title: 'Customize report to your Brand',
      pointers: [
        'Customize the report title and sub title',
        'Customize the report logo (Coming soon!)',
        'Customize the report footer',
      ],
      images: ['reportHeader', 'reportFooter'] as (keyof ImageLinks)[],
    },
  ],
};

const ctaData = {
  title: 'Ready to upgrade your reports?',
  description: 'Join over 6K+ engineers and teams delivering clearer BDD results every single day.',
  primaryLink: { label: 'Get Started', url: '/docs/latest' },
};

const iconMap: Record<string, React.ReactNode> = {
  Download: <Activity className='h-6 w-6' />,
  Users: <Layers className='h-6 w-6' />,
  Star: <Star className='h-6 w-6' />,
  Activity: <Activity className='h-6 w-6' />,
};

export default function FeaturesPage() {
  const images = imagesDataJson as ImageLinks;
  const { stats } = statsDataJson as ProjectStats;

  return (
    <main className='flex flex-col gap-24 pb-20 overflow-x-hidden m-10'>
      {/* Hero Section */}
      <section className='pt-20 md:pt-32 px-6'>
        <div className='container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className='flex flex-col gap-6'
          >
            {heroData.badge && (
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold w-fit border border-emerald-500/20 uppercase tracking-wider'>
                {heroData.badge}
              </div>
            )}
            <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight'>
              {heroData.titleLine1 || 'Powerful reporting for'} <br className='hidden md:block' />
              {heroData.titleLine2 || 'modern BDD'}
            </h1>
            <p className='text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed mt-2'>
              {heroData.description}
            </p>
            <div className='flex flex-wrap gap-4 mt-4'>
              {heroData.primaryLink && (
                <Link
                  href={heroData.primaryLink.url}
                  className={cn(
                    buttonVariants({ size: 'default' }),
                    'bg-emerald-700 hover:bg-emerald-800 text-white hover:text-white rounded-full px-8 h-12 text-base font-bold transition-all shadow-lg',
                  )}
                >
                  {heroData.primaryLink.label}
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
            <div className='absolute -inset-4 bg-sky-500/10 blur-3xl rounded-full opacity-50' />
            <div className='relative rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden aspect-4/3'>
              <Image
                src={images[heroData.image]}
                alt='Analytics Dashboard'
                width={2070}
                height={1552}
                className='object-cover w-full h-full filter brightness-90 contrast-125'
              />
              <div className='absolute inset-0 bg-linear-to-tr from-emerald-900/40 to-transparent' />
            </div>
          </motion.div>
        </div>
      </section>

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
                      {iconMap[stat.icon] || iconMap.Activity}
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

      {/* Detailed Features Accordion Section */}
      <section className='container mx-auto px-6 max-w-6xl py-12'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-5xl font-bold mb-6'>{accordionData.title}</h2>
          <p className='text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg'>{accordionData.description}</p>
        </div>

        <Accordion type='single' collapsible className='w-full space-y-4' defaultValue='item-0'>
          {accordionData.items.map((item, idx) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className='border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden px-2 data-[state=open]:bg-emerald-50/30 dark:data-[state=open]:bg-emerald-950/10 transition-all duration-300'
            >
              <AccordionTrigger className='hover:no-underline py-6 px-4 md:px-8 group'>
                <div className='flex items-center gap-4 text-left'>
                  <span className='flex size-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold'>
                    {idx + 1}
                  </span>
                  <h3 className='text-xl md:text-2xl font-bold group-data-[state=open]:text-emerald-600 dark:group-data-[state=open]:text-emerald-400 transition-colors'>
                    {item.title}
                  </h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className='px-4 md:px-8 pb-8'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                  <div className='flex flex-col gap-6'>
                    <ul className='space-y-4'>
                      {item.pointers.map((pointer, pIdx) => (
                        <motion.li
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: pIdx * 0.1 }}
                          key={pIdx}
                          className='flex items-start gap-3 text-zinc-600 dark:text-zinc-400'
                        >
                          <CheckCircle2 className='h-5 w-5 text-emerald-500 shrink-0 mt-0.5' />
                          <span className='text-base leading-relaxed'>{pointer}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className='relative group'>
                    <Carousel className='w-full'>
                      <CarouselContent>
                        {item.images.map((img, imgIdx) => (
                          <CarouselItem key={imgIdx}>
                            <Dialog>
                              <DialogTrigger asChild>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  whileInView={{ opacity: 1, scale: 1 }}
                                  className='relative rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl aspect-video cursor-zoom-in group/img'
                                >
                                  <Image
                                    src={images[img]}
                                    alt={`${item.title} - ${imgIdx + 1}`}
                                    fill
                                    className='object-cover transition-transform duration-500 group-hover/img:scale-105'
                                  />
                                  <div className='absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100'>
                                    <div className='bg-white/90 dark:bg-zinc-900/90 p-2 rounded-full shadow-lg text-xs font-bold uppercase tracking-wider scale-90 group-hover/img:scale-100 transition-transform'>
                                      Click to enlarge
                                    </div>
                                  </div>
                                </motion.div>
                              </DialogTrigger>
                              <DialogContent className='max-w-[95vw] sm:max-w-[95vw] h-[90vh] p-0 border-none bg-black/40 backdrop-blur-sm shadow-none focus:outline-none flex items-center justify-center'>
                                <div className='relative w-full h-full p-4 md:p-12'>
                                  <Image
                                    src={images[img]}
                                    alt={item.title}
                                    fill
                                    className='object-contain transition-all duration-300'
                                    priority
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {item.images.length > 1 && (
                        <>
                          <CarouselPrevious
                            className='left-2 opacity-70 hover:opacity-100 transition-all bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-md'
                            size='icon'
                          />
                          <CarouselNext
                            className='right-2 opacity-70 hover:opacity-100 transition-all bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-md'
                            size='icon'
                          />
                        </>
                      )}
                    </Carousel>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Ready to Upgrade CTA */}
      <section className='container mx-auto px-6 max-w-5xl mb-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='bg-emerald-900 rounded-[3rem] p-16 text-center flex flex-col items-center shadow-2xl relative overflow-hidden'
        >
          {/* subtle decorative blur */}
          <div className='absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 blur-3xl rounded-full' />

          <h2 className='text-3xl md:text-5xl font-extrabold text-white mb-6 relative z-10'>{ctaData.title}</h2>
          <p className='text-emerald-100/90 text-lg md:text-xl leading-relaxed max-w-2xl mb-10 relative z-10'>
            {ctaData.description}
          </p>

          <div className='flex flex-wrap justify-center gap-4 relative z-10'>
            {ctaData.primaryLink && (
              <Link
                href={ctaData.primaryLink.url}
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'bg-emerald-400 hover:bg-emerald-300 text-emerald-950 hover:text-emerald-950 rounded-full font-bold px-8 shadow-lg',
                )}
              >
                {ctaData.primaryLink.label}
              </Link>
            )}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
