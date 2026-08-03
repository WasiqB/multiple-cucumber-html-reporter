'use client';

import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Activity, BarChart3, Heart, Layers, MessageSquare, Star, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa6';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { buttonVariants } from '@/components/ui/button';
import imagesDataJson from '@/data/image-links.json';
import statsDataJson from '@/data/stats.json';
import type { ImageLinks, ProjectStats } from '@/data/types';
import { cn } from '@/lib/cn';

const heroData = {
  badge: 'Released!! Version 4.2.0',
  titleLine1: 'Beautiful Cucumber Reports,',
  titleLine2: 'Made Easy',
  description:
    'The ultimate open-source HTML reporter for Cucumber. Transform messy JSON output into sleek, interactive, and insightful test reports that your team will actually love to read.',
  primaryLink: { label: 'Try It Now', url: '/docs/latest' },
  secondaryLink: {
    label: 'Check out on GitHub',
    url: 'https://github.com/WasiqB/multiple-cucumber-html-reporter',
  },
  image: 'featureListPage' as keyof ImageLinks,
  installCommands: [
    { label: 'npm', code: 'npm install multiple-cucumber-html-reporter --save-dev' },
    { label: 'yarn', code: 'yarn add multiple-cucumber-html-reporter --dev' },
    { label: 'pnpm', code: 'pnpm add -D multiple-cucumber-html-reporter' },
  ],
};

const featuresData = {
  title: 'Precision Reporting',
  description:
    'Stop digging through log files. Our reporter visualizes every step of your BDD journey with precision and clarity.',
  items: [
    {
      icon: 'Activity',
      title: 'Detailed Metrics',
      description: 'Get visual feedback on your test execution with interactive pie charts and trend lines.',
    },
    {
      icon: 'BarChart3',
      title: 'Insightful Reports',
      description: 'Get detailed insights into your test execution with interactive charts and tables.',
    },
    {
      icon: 'Zap',
      title: 'Lightning Fast',
      description: 'Optimized, fast loading and smooth interactions.',
    },
    {
      icon: 'Layers',
      title: 'Deep Integration',
      description:
        'Supports screenshots, videos, text, json and logs attachments, and custom metadata for every scenario.',
    },
  ],
};

const setupData = {
  titleLine1: 'Sample Usage,',
  titleLine2: 'Quick Setup',
  description:
    'Generate comprehensive reports in a few simple steps. Follow these setup steps to integrate the reporter into your project.',
  link: { label: 'Read the full usage guide', url: '/docs/latest' },
  steps: [
    {
      stepNumber: 1,
      title: 'Install Command line tool',
      description: 'Install the reporter CLI tool on your machine using your preferred package manager.',
      lang: 'bash',
      code: `npm install multiple-cucumber-html-reporter --save-dev`,
    },
    {
      stepNumber: 2,
      title: 'Update reporter config file',
      description: 'Update the reporter configuration file. This config file can be in JSON, Yaml, JS or TS format.',
      lang: 'yaml',
      code: `# .multiple-cucumber-html-reporter.yml
jsonDir: 'reports/'
reportPath: 'reports/report/'
useCDN: false
openReportInBrowser: true
saveCollectedJSON: false
displayReportTime: true
durationAggregation: 'wallClock'
displayChartPercentages: true
durationInMS: false
displayDuration: true
pageTitle: 'My Playwright Typescript Sample'
reportName: 'Cucumber JS Report'
metadata:
  'saucedemo.feature':
    browser:
      name: 'firefox'
      version: '148'
  'restful-booker.feature':
    browser:
      name: 'api'
      version: ''
customData:
  projectName: 'Playwright sample project'
  release: '1.2.0'
  testCycle: $\{GITHUB_RUN_ID:'Cycle 1'}
  buildNumber: $\{GITHUB_RUN_NUMBER:'Build 1'}
  environment: 'production'
  ciPipeline: 'GitHub Actions'
`,
    },
    {
      stepNumber: 3,
      title: 'Generate the report',
      description: 'Call the CLI tool from your project directory.',
      lang: 'bash',
      code: 'mchr',
    },
  ],
};

const communityData = {
  title: 'Support the Open Source Ecosystem',
  items: [
    {
      icon: 'Heart',
      color: 'rose',
      title: 'Sponsor',
      description: 'Help us maintain the project with your support.',
      buttonText: 'Support Project',
      href: '/sponsors',
    },
    {
      icon: 'Star',
      color: 'amber',
      title: 'Star on GitHub',
      description: 'Show your love! A simple star helps us grow our community and gain visibility.',
      buttonText: 'Star Repository',
      href: 'https://github.com/WasiqB/multiple-cucumber-html-reporter',
    },
    {
      icon: 'MessageSquare',
      color: 'emerald',
      title: 'Contribute',
      description: 'Found a bug or have a feature idea? Join our discord and open a pull request.',
      buttonText: 'Join Discord',
      href: 'https://discord.gg/d6rfHkSDjc',
    },
  ],
};

const trustedByData = {
  title: 'Trusted by Engineering Teams at',
  companies: [],
};

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
  const { stats } = statsDataJson as ProjectStats;
  const heroImage = (imagesDataJson as ImageLinks)[heroData.image];

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
            {heroData.badge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold w-fit border border-emerald-500/20'
              >
                <span className='flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                {heroData.badge}
              </motion.div>
            )}

            <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-balance'>
              {heroData.titleLine1} <br />
              {heroData.titleLine2 && (
                <span className='bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent'>
                  {heroData.titleLine2}
                </span>
              )}
            </h1>

            {heroData.description && (
              <p className='text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed'>
                {heroData.description}
              </p>
            )}

            <div className='w-full max-w-xl mt-2'>
              <Tabs items={heroData.installCommands.map((c) => c.label)}>
                {heroData.installCommands.map((cmd) => (
                  <Tab key={cmd.label} value={cmd.label}>
                    <DynamicCodeBlock
                      lang='bash'
                      code={cmd.code}
                      options={{
                        themes: {
                          light: 'github-light',
                          dark: 'github-dark',
                        },
                      }}
                    />
                  </Tab>
                ))}
              </Tabs>
            </div>

            <div className='flex flex-wrap gap-4 mt-2'>
              {heroData.primaryLink && (
                <Link
                  href={heroData.primaryLink.url}
                  className={cn(
                    buttonVariants({ size: 'default' }),
                    'bg-emerald-600 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 text-white hover:text-white rounded-full px-8 h-12 text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98]',
                  )}
                >
                  {heroData.primaryLink.label}
                </Link>
              )}
              {heroData.secondaryLink && (
                <Link
                  href={heroData.secondaryLink.url}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'default' }),
                    'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-8 h-12 text-base font-semibold group',
                  )}
                >
                  <FaGithub className='mr-2 h-5 w-5 transition-transform group-hover:scale-110' />
                  {heroData.secondaryLink.label}
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
      <section id='features' className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-5xl font-bold mb-4'>{featuresData.title}</h2>
          <p className='text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto'>{featuresData.description}</p>
        </div>

        {featuresData.items && featuresData.items.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {featuresData.items.map((feature, idx) => (
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

      {/* Accordion Usage Steps Section */}
      <section className='container mx-auto px-6 max-w-5xl'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-5xl font-bold mb-4'>
            {setupData.titleLine1} {setupData.titleLine2}
          </h2>
          <p className='text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg'>{setupData.description}</p>
        </div>

        <Accordion type='single' collapsible className='w-full space-y-4' defaultValue='step-0'>
          {setupData.steps.map((step, idx) => (
            <AccordionItem
              key={idx}
              value={`step-${idx}`}
              className='border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden px-2 data-[state=open]:bg-emerald-50/30 dark:data-[state=open]:bg-emerald-950/10 transition-all duration-300'
            >
              <AccordionTrigger className='hover:no-underline py-6 px-4 md:px-8 group'>
                <div className='flex items-center gap-4 text-left'>
                  <span className='flex size-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold shrink-0'>
                    {step.stepNumber}
                  </span>
                  <h3 className='text-xl md:text-2xl font-bold group-data-[state=open]:text-emerald-600 dark:group-data-[state=open]:text-emerald-400 transition-colors'>
                    {step.title}
                  </h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className='px-4 md:px-8 pb-8'>
                <div className='flex flex-col gap-4'>
                  <p className='text-zinc-600 dark:text-zinc-400 text-base leading-relaxed'>{step.description}</p>
                  {step.code && (
                    <DynamicCodeBlock
                      lang={step.lang || 'ts'}
                      code={step.code}
                      options={{
                        themes: {
                          light: 'github-light',
                          dark: 'github-dark',
                        },
                      }}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {setupData.link && (
          <div className='flex justify-center mt-8'>
            <Link
              href={setupData.link.url}
              className='text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 hover:gap-3 transition-all'
            >
              {setupData.link.label} <span>→</span>
            </Link>
          </div>
        )}
      </section>

      {/* Community / Support Section */}
      <section id='community' className='container mx-auto px-6 mb-12'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-5xl font-bold mb-4'>{communityData.title}</h2>
        </div>

        {communityData.items && communityData.items.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {communityData.items.map((item, idx) => (
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

      {/* Trusted By / Logos Section */}
      {trustedByData.companies.length > 0 && (
        <section className='border-t border-zinc-200 dark:border-zinc-800 pt-20 px-6'>
          <div className='container mx-auto'>
            <p className='text-center text-sm font-bold tracking-widest text-zinc-500 dark:text-zinc-500 uppercase mb-12'>
              {trustedByData.title}
            </p>
            <div className='flex flex-wrap justify-center gap-x-16 gap-y-10 opacity-50 grayscale contrast-125 dark:invert'>
              {trustedByData.companies.map((company: { name: string; className?: string }, idx) => (
                <span key={idx} className={company.className || ''}>
                  {company.name}
                </span>
              ))}
            </div>
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
