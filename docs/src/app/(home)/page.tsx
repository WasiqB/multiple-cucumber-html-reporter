'use client';

import { Activity, Heart, Layers, List, MessageSquare, Star, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa6';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function HomePage() {
  return (
    <main className='flex flex-col gap-24 pb-20 overflow-x-hidden m-10'>
      {/* Hero Section */}
      <section className='relative pt-20 md:pt-32 px-6'>
        <div className='container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className='flex flex-col gap-6'
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold w-fit border border-emerald-500/20'
            >
              <span className='flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
              New in Version 4.0
            </motion.div>

            <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight'>
              Beautiful Cucumber Reports, <br />
              <span className='bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent'>
                Made Easy
              </span>
            </h1>

            <p className='text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed'>
              The ultimate open-source HTML reporter for Cucumber. Transform messy JSON output into sleek, interactive,
              and insightful test reports that your team will actually love to read.
            </p>

            <div className='flex flex-wrap gap-4 mt-4'>
              <Link
                href='/docs'
                className={cn(
                  buttonVariants({ size: 'default' }),
                  'bg-emerald-600 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]',
                )}
              >
                Try It Now
              </Link>
              <Link
                href='https://github.com/WasiqB/multiple-cucumber-html-reporter'
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'default' }),
                  'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-8 h-12 text-base font-semibold group',
                )}
              >
                <FaGithub className='mr-2 h-5 w-5 transition-transform group-hover:scale-110' />
                GitHub Docs
              </Link>
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
                src='/feature-list-page.png'
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

      {/* Features Section */}
      <section id='features' className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-5xl font-bold mb-4'>Precision Reporting</h2>
          <p className='text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto'>
            Stop digging through log files. Our reporter visualizes every step of your BDD journey with precision and
            clarity.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <FeatureCard
            icon={<Activity className='h-6 w-6 text-emerald-500' />}
            title='Live Pass/Fail Metrics'
            description='Get instant visual feedback on your build health with interactive pie charts and trend lines.'
          />
          <FeatureCard
            icon={<List className='h-6 w-6 text-emerald-500' />}
            title='Interactive Steps'
            description='Filter steps by status, duration, or tags with high-performance searchable tables.'
          />
          <FeatureCard
            icon={<Zap className='h-6 w-6 text-emerald-500' />}
            title='Lightning Fast'
            description='Optimized for reports with 50k+ scenarios. Fast loading, smooth interactions.'
          />
          <FeatureCard
            icon={<Layers className='h-6 w-6 text-emerald-500' />}
            title='Deep Integration'
            description='Supports screenshots, video attachments, and custom metadata for every failing scenario.'
          />
        </div>
      </section>

      {/* Code Snippet Section */}
      <section className='container mx-auto px-6'>
        <div className='bg-zinc-950 rounded-3xl border border-zinc-800 p-8 md:p-12 shadow-2xl relative overflow-hidden group'>
          <div className='absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-3xl opacity-50 -mr-48 -mt-48' />

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div className='flex flex-col gap-6'>
              <h2 className='text-3xl md:text-4xl font-bold text-white leading-tight'>
                Simple Setup, <br />
                Powerful Results
              </h2>
              <p className='text-zinc-400 text-lg'>
                Integration takes minutes. Just pass your JSON output files and let our engine handle the rest.
              </p>
              <Link
                href='/docs'
                className='text-emerald-400 font-bold flex items-center group-hover:gap-2 transition-all'
              >
                Read the full installation guide <span className='ml-2'>→</span>
              </Link>
            </div>

            <div className='relative font-mono text-sm leading-relaxed overflow-x-auto rounded-xl bg-zinc-900/50 p-6 border border-zinc-800'>
              <div className='flex gap-1.5 mb-4'>
                <div className='w-3 h-3 rounded-full bg-red-500/50' />
                <div className='w-3 h-3 rounded-full bg-amber-500/50' />
                <div className='w-3 h-3 rounded-full bg-emerald-500/50' />
              </div>
              <pre className='text-zinc-300'>
                <code className='language-javascript'>
                  {`const report = require('multiple-cucumber-html-reporter');

report.generate({
  jsonDir: './reports/json/',
  reportPath: './reports/html/',
  metadata: {
    browser: {
      name: 'chrome',
      version: '112'
    },
    platform: {
      name: 'osx',
      version: 'Ventura'
    }
  }
});`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Community / Support Section */}
      <section id='community' className='container mx-auto px-6 mb-12'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-5xl font-bold mb-4'>Support the Open Source Ecosystem</h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <SupportCard
            icon={<Heart className='h-8 w-8 text-rose-500' />}
            title='Sponsor'
            description='Help us keep the servers running and maintain the project with a monthly contribution.'
            buttonText='Support Project'
            href='https://github.com/sponsors/WasiqB'
            color='rose'
          />
          <SupportCard
            icon={<Star className='h-8 w-8 text-amber-500' />}
            title='Star on GitHub'
            description='Show your love! A simple star helps us grow our community and gain visibility.'
            buttonText='Star Repository'
            href='https://github.com/WasiqB/multiple-cucumber-html-reporter'
            color='amber'
          />
          <SupportCard
            icon={<MessageSquare className='h-8 w-8 text-emerald-500' />}
            title='Contribute'
            description='Found a bug or have a feature idea? Join our discord and open a pull request.'
            buttonText='Join Discord'
            href='https://discord.gg/d6rfHkSDjc'
            color='emerald'
          />
        </div>
      </section>

      {/* Trusted By / Logos Section */}
      <section className='border-t border-zinc-200 dark:border-zinc-800 pt-20 px-6'>
        <div className='container mx-auto'>
          <p className='text-center text-sm font-bold tracking-widest text-zinc-500 dark:text-zinc-500 uppercase mb-12'>
            Trusted by Engineering Teams at
          </p>
          <div className='flex flex-wrap justify-center gap-x-16 gap-y-10 opacity-50 grayscale contrast-125 dark:invert'>
            <span className='text-2xl font-black italic tracking-tighter'>TECHFLOW</span>
            <span className='text-2xl font-extrabold tracking-tight'>DataGrid</span>
            <span className='text-2xl font-medium uppercase tracking-widest underline decoration-wavy decoration-emerald-500'>
              VELOCITY
            </span>
            <span className='text-2xl font-mono uppercase font-bold tracking-widest border-2 border-zinc-900 dark:border-zinc-100 p-1'>
              STACKWARE
            </span>
            <span className='text-2xl font-sans tracking-tight leading-4'>
              Cloud<span className='font-bold underline decoration-4 decoration-emerald-500'>Pave</span>
            </span>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className='border-t border-zinc-200 dark:border-zinc-800 pt-12 px-6'>
        <div className='container mx-auto flex flex-col md:flex-row justify-between items-center gap-8'>
          <div className='flex flex-col gap-2'>
            <span className='text-2xl font-bold flex items-center'>
              Cucumber<span className='text-emerald-500'>HTML</span>
            </span>
            <p className='text-sm text-zinc-500'>© 2024 Precision Curator. Open source under MIT License.</p>
          </div>
          <div className='flex flex-wrap gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400'>
            <Link href='/docs' className='hover:text-emerald-500 transition-colors'>
              Documentation
            </Link>
            <Link href='#' className='hover:text-emerald-500 transition-colors'>
              Changelog
            </Link>
            <Link href='#' className='hover:text-emerald-500 transition-colors'>
              Status
            </Link>
            <Link href='#' className='hover:text-emerald-500 transition-colors'>
              Sponsor
            </Link>
            <Link href='#' className='hover:text-emerald-500 transition-colors'>
              Contributing
            </Link>
          </div>
        </div>
      </footer>
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
          colorMap[color as keyof typeof colorMap],
        )}
      >
        {buttonText}
      </Link>
    </motion.div>
  );
}
