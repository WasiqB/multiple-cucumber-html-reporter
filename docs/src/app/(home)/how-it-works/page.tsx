'use client';

import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { CheckCircle2, ChevronDown, FileJson, PieChart } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { FaGithub, FaGitlab, FaJenkins } from 'react-icons/fa6';
import { Terminal } from '@/components/ui/terminal';
import imageDataJson from '@/data/image-links.json';
import type { ImageLinks } from '@/data/types';
import { cn } from '@/lib/cn';

type Command = {
  command: string;
  tabValue?: string;
  output?: string;
};

const howItWorksData = {
  hero: {
    titleLine1: 'From Test Run to',
    titleLine2: 'Visual Insight.',
    description:
      'Streamline your Cucumber testing workflow with our lightweight, high-performance reporting engine. Zero dependencies, maximum clarity.',
  },
  steps: [
    {
      number: 1,
      title: 'Simple Installation',
      description:
        'Get started in seconds. Cucumber Reporter is distributed via NPM as a command line tool and is also able to integrate seamlessly into your existing JavaScript or TypeScript project.',
      badges: ['lightweight', 'insightful', 'fast'],
      lang: 'shell',
      commands: [
        {
          command: 'npm install multiple-cucumber-html-reporter --global',
        },
      ],
    },
    {
      number: 2,
      title: 'Declarative Configuration',
      description:
        'Customize your HTML report with metadata about your environment and report branding by adding options in report options.',
      checklist: [
        'Customize the report branding',
        'Add metadata about your environment',
        'Attach logs on each test step',
        'Attach screenshots on failure',
        'Attach video on failure',
      ],
      lang: 'typescript',
      commands: [
        {
          command: `// .multiple-cucumber-html-reporter.js
const config = {
  jsonDir: './.run/reports/json/',
  reportPath: './.run/html-report/',
  openReportInBrowser: true,
  useCDN: true,
  metadataFilePath: './.run/reports/json/metadata.json',
  customData: {
    projectName: 'Cypress sample project',
    release: '1.2.0',
    testCycle: process.env.GITHUB_RUN_ID || 'Cycle 1',
    buildNumber: process.env.GITHUB_RUN_NUMBER || 'Build 1',
    environment: 'production',
    ciPipeline: 'GitHub Actions',
  },
  pageTitle: 'Cypress Sample',
  reportName: 'Cypress Sample',
  displayDuration: true,
  displayReportTime: true,
};

module.exports = config;`,
          tabValue: 'Javascript',
        },
        {
          command: `// .multiple-cucumber-html-reporter.ts
import type { Options } from 'multiple-cucumber-html-reporter';

const config: Option = {
  jsonDir: './.run/reports/json/',
  reportPath: './.run/html-report/',
  openReportInBrowser: true,
  useCDN: true,
  metadataFilePath: './.run/reports/json/metadata.json',
  customData: {
    projectName: 'Cypress sample project',
    release: '1.2.0',
    testCycle: process.env.GITHUB_RUN_ID || 'Cycle 1',
    buildNumber: process.env.GITHUB_RUN_NUMBER || 'Build 1',
    environment: 'production',
    ciPipeline: 'GitHub Actions',
  },
  pageTitle: 'Cypress Sample',
  reportName: 'Cypress Sample',
  displayDuration: true,
  displayReportTime: true,
};

export default config;`,
          tabValue: 'Typescript',
        },
        {
          command: `// .multiple-cucumber-html-reporter.yml
jsonDir: './.run/reports/json/'
reportPath: './.run/html-report/'
openReportInBrowser: true
useCDN: true
metadataFilePath: './.run/reports/json/metadata.json'
customData:
  projectName: 'Cypress sample project'
  release: '1.2.0'
  testCycle: "$\{GITHUB_RUN_ID:'Cycle 1'}"
  buildNumber: "$\{GITHUB_RUN_NUMBER:'Build 1'}"
  environment: 'production'
  ciPipeline: 'GitHub Actions'
pageTitle: 'Cypress Sample'
reportName: 'Cypress Sample'
displayDuration: true
displayReportTime: true`,
          tabValue: 'Yaml',
        },
        {
          command: `// .multiple-cucumber-html-reporter.json
{
  "jsonDir": "./.run/reports/json/",
  "reportPath": "./.run/html-report/",
  "openReportInBrowser": true,
  "useCDN": true,
  "metadataFilePath": "./.run/reports/json/metadata.json",
  "customData": {
    "projectName": "Cypress sample project",
    "release": "1.2.0",
    "testCycle": "$\{GITHUB_RUN_ID:'Cycle 1'}",
    "buildNumber": "$\{GITHUB_RUN_NUMBER:'Build 1'}",
    "environment": "production",
    "ciPipeline": "GitHub Actions",
  },
  "pageTitle": "Cypress Sample",
  "reportName": "Cypress Sample",
  "displayDuration": true,
  "displayReportTime": true,
}`,
          tabValue: 'JSON',
        },
      ],
    },
    {
      number: 3,
      title: 'Execute & Generate',
      description:
        'Run your tests as you normally would. Then execute the Cucumber Reporter method, it will parse the Cucumber JSON output and transforms it into a beautiful interactive dashboard instantly.',
      lang: 'bash',
      commands: [
        {
          command: 'mchr --no-logging',
          output: `┌  Multiple Cucumber HTML Reporter v4.2.0
  Config: .multiple-cucumber-html-reporter.ts
│
◇  Report generated successfully!
│
└  Report ready: /Users/wasiqbhamla/Developer/github/multiple-cucumber-html-reporter/examples/cypress/.run/html-report/index.html`,
        },
      ],
    },
  ],
  analysis: {
    stepNumber: 4,
    title: 'Interactive Analysis',
    description:
      'Experience the results through a sophisticated lens. High-density data curated for clarity, featuring real-time filtering, failure diagnostics, and performance trends.',
    cards: [
      {
        icon: 'PieChart',
        title: 'Visual Analytics',
        description: 'Beautiful charts providing an immediate overview of test pass/fail rates and suite health.',
      },
      {
        icon: 'ChevronDown',
        title: 'Smart Filtering',
        description:
          'Drill down into specific features, and scenarios with lightning-fast navigation, search and filters.',
      },
      {
        icon: 'FileJson',
        title: 'Rich Artifacts',
        description: 'Embedded screenshots and videos attached directly to failed test steps for rapid debugging.',
      },
    ],
    image: 'featureListPage' as keyof ImageLinks,
  },
  cicd: {
    stepNumber: 5,
    title: 'CI/CD Ready',
    description:
      'Automate your quality reporting. Perfect for GitHub Actions, GitLab CI, or Jenkins. Generate and publish reports automatically on every push.',
    platforms: ['GitHub Actions', 'Jenkins', 'GitLab'],
  },
};

const iconMap: Record<string, React.ReactNode> = {
  PieChart: <PieChart className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />,
  ChevronDown: <ChevronDown className='h-5 w-5 text-sky-600 dark:text-sky-400' />,
  FileJson: <FileJson className='h-5 w-5 text-indigo-600 dark:text-indigo-400' />,
};

const iconBgMap: Record<string, string> = {
  PieChart: 'bg-emerald-100 dark:bg-emerald-500/20',
  ChevronDown: 'bg-sky-100 dark:bg-sky-500/20',
  FileJson: 'bg-indigo-100 dark:bg-indigo-500/20',
};

const platformIconMap: Record<string, React.ReactNode> = {
  'GitHub Actions': <FaGithub className='h-6 w-6' />,
  Jenkins: <FaJenkins className='h-6 w-6' />,
  GitLab: <FaGitlab className='h-6 w-6' />,
};

export default function HowItWorksPage() {
  const { hero, steps, analysis, cicd } = howItWorksData;
  const image = (imageDataJson as ImageLinks)[analysis.image];

  return (
    <main className='flex flex-col gap-24 pb-20 overflow-x-hidden m-10'>
      {/* Header Section */}
      {hero && (
        <section className='pt-20 md:pt-32 pb-16 px-6 text-center max-w-4xl mx-auto'>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6 text-balance'>
              {hero.titleLine1}{' '}
              <span className='bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent italic'>
                {hero.titleLine2}
              </span>
            </h1>
            <p className='text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
              {hero.description}
            </p>
          </motion.div>
        </section>
      )}

      {/* Steps Content */}
      <div className='flex flex-col gap-24 container mx-auto px-6 max-w-5xl'>
        {steps &&
          Array.isArray(steps) &&
          steps.map((step, idx) => {
            // If odd step, layout is left = text, right = feature block
            // If even step, layout is reversed (flex-col-reverse lg:flex-row-reverse)
            const isReversed = idx % 2 !== 0;

            return (
              <section key={idx} className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center'>
                <motion.div
                  initial={{ opacity: 0, x: isReversed ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={cn('flex flex-col gap-6', isReversed && 'lg:order-2')}
                >
                  <StepNumber number={step.number} />
                  <h2 className='text-3xl md:text-4xl font-bold text-balance'>{step.title}</h2>
                  <p className='text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed'>{step.description}</p>

                  {step.badges && (
                    <div className='flex flex-wrap gap-3 mt-2'>
                      {step.badges.map((b, i) => (
                        <Badge key={i}>{b}</Badge>
                      ))}
                    </div>
                  )}

                  {step.checklist && (
                    <div className='flex flex-col gap-3 mt-2'>
                      {step.checklist.map((item, i) => (
                        <div key={i} className='flex items-center gap-3'>
                          <div className='flex-none rounded-full bg-emerald-500/10 p-1'>
                            <CheckCircle2 className='text-emerald-500 h-4 w-4' />
                          </div>
                          <span className='text-zinc-700 dark:text-zinc-300'>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: isReversed ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={cn('w-full', isReversed && 'lg:order-1')}
                >
                  {step.commands?.map((command: Command, i) => {
                    return (
                      <div key={i}>
                        {command.output && (
                          <Terminal
                            commands={[command.command]}
                            outputs={{ 0: [command.output] }}
                            typingSpeed={45}
                            enableSound
                            initialDelay={3}
                            delayBetweenCommands={1000}
                          />
                        )}
                      </div>
                    );
                  })}

                  {(step.commands?.filter((command: Command) => !command.output).length ?? 0) > 0 && (
                    <div className='relative group'>
                      <div className='absolute -inset-1 bg-linear-to-r from-emerald-500/20 to-sky-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none' />
                      <Tabs
                        items={step.commands
                          ?.filter((c: Command) => !c.output)
                          .map((command: Command) => command.tabValue ?? '')}
                      >
                        {step.commands
                          ?.filter((c: Command) => !c.output)
                          .map((command: Command, i) => {
                            if (command.tabValue) {
                              return (
                                <Tab key={i} value={command.tabValue}>
                                  <DynamicCodeBlock code={command.command} lang={step.lang || 'js'} />
                                </Tab>
                              );
                            }
                            return <DynamicCodeBlock key={i} code={command.command} lang={step.lang || 'js'} />;
                          })}
                      </Tabs>
                    </div>
                  )}
                </motion.div>
              </section>
            );
          })}

        {/* Step 4: Interactive Analysis */}
        {analysis && (
          <section className='pt-12 text-center'>
            <div className='flex flex-col items-center gap-6 mb-16 max-w-3xl mx-auto'>
              <StepNumber number={analysis.stepNumber || 4} />
              <h2 className='text-3xl md:text-4xl font-bold'>{analysis.title}</h2>
              <p className='text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed'>{analysis.description}</p>
            </div>

            {analysis.cards && analysis.cards.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left'>
                {analysis.cards.map((card, idx) => (
                  <InfoCard
                    key={idx}
                    icon={iconMap[card.icon]}
                    iconBg={iconBgMap[card.icon] || 'bg-zinc-100 dark:bg-zinc-800'}
                    title={card.title}
                    description={card.description}
                  />
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-2 shadow-2xl overflow-hidden'
            >
              <Image
                src={image}
                alt='Cucumber Report Dashboard'
                width={1200}
                height={600}
                className='rounded-xl object-cover w-full h-auto opacity-90'
              />
            </motion.div>
          </section>
        )}

        {/* Step 5: CI/CD Ready */}
        {cicd && (
          <section className='mt-12'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='bg-emerald-100/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-3xl p-12 text-center flex flex-col items-center shadow-lg'
            >
              <StepNumber number={cicd.stepNumber || 5} />
              <h2 className='text-3xl md:text-4xl font-bold mt-6 mb-4'>{cicd.title}</h2>
              <p className='text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed max-w-2xl mb-12'>
                {cicd.description}
              </p>

              {cicd.platforms && cicd.platforms.length > 0 && (
                <div className='flex flex-wrap justify-center gap-8 md:gap-16'>
                  {cicd.platforms.map((platform, idx) => (
                    <div key={idx} className='flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300'>
                      {platformIconMap[platform]} {platform}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </section>
        )}
      </div>
    </main>
  );
}

function StepNumber({ number }: { number: number }) {
  return (
    <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 z-10'>
      {number}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className='px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-500/20 w-fit'>
      {children}
    </span>
  );
}

function InfoCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all'
    >
      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-6', iconBg)}>{icon}</div>
      <h3 className='text-xl font-bold mb-3'>{title}</h3>
      <p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>{description}</p>
    </motion.div>
  );
}
