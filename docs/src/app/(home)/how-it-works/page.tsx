'use client';

import { CheckCircle2, ChevronDown, FileJson, PieChart, TerminalSquare } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub, FaGitlab, FaJenkins } from 'react-icons/fa6';
import { cn } from '@/lib/cn';

export default function HowItWorksPage() {
  return (
    <main className='flex flex-col overflow-x-hidden m-10'>
      {/* Header Section */}
      <section className='pt-20 md:pt-32 pb-16 px-6 text-center max-w-4xl mx-auto'>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6'>
            From Test Run to{' '}
            <span className='bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent italic'>
              Visual Insight.
            </span>
          </h1>
          <p className='text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
            Streamline your Cucumber testing workflow with our lightweight, high-performance reporting engine. Zero
            dependencies, maximum clarity.
          </p>
        </motion.div>
      </section>

      {/* Steps Content */}
      <div className='flex flex-col gap-24 container mx-auto px-6 max-w-5xl'>
        {/* Step 1: Installation */}
        <section className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='flex flex-col gap-6'
          >
            <StepNumber number={1} />
            <h2 className='text-3xl md:text-4xl font-bold'>Simple Installation</h2>
            <p className='text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed'>
              Get started in seconds. Cucumber Reporter is distributed via NPM and integrates seamlessly into your
              existing JavaScript or TypeScript project.
            </p>
            <div className='flex gap-3 mt-2'>
              <Badge>zero dependencies</Badge>
              <Badge>lightweight</Badge>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className='relative'
          >
            <div className='absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full opacity-50' />
            <div className='relative font-mono text-sm leading-relaxed overflow-x-auto rounded-2xl bg-[#0d1117] p-8 shadow-2xl border border-zinc-800/50'>
              <div className='flex gap-1.5 mb-6'>
                <div className='w-3 h-3 rounded-full bg-red-500/80' />
                <div className='w-3 h-3 rounded-full bg-amber-500/80' />
                <div className='w-3 h-3 rounded-full bg-emerald-500/80' />
              </div>
              <pre>
                <code className='text-zinc-300'>
                  <span className='text-emerald-400'>$</span> npm install cucumber-html-reporter --save-dev
                  <br />
                  <br />
                  <span className='text-zinc-500'># or using yarn</span>
                  <br />
                  <span className='text-emerald-400'>$</span> yarn add cucumber-html-reporter -D
                </code>
              </pre>
            </div>
          </motion.div>
        </section>

        {/* Step 2: Configuration */}
        <section className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-col-reverse lg:flex-row-reverse'>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='flex flex-col gap-6 lg:pl-12'
          >
            <StepNumber number={2} />
            <h2 className='text-3xl md:text-4xl font-bold'>Declarative Configuration</h2>
            <p className='text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed'>
              Customize your output with a simple JSON object. Define themes, file paths, and metadata about your
              environment in
              <code className='bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md text-sm mx-1'>cucumber.conf.js</code>.
            </p>
            <div className='flex flex-col gap-3 mt-2'>
              <div className='flex items-center gap-3'>
                <CheckCircle2 className='text-emerald-500 h-5 w-5' />
                <span className='text-zinc-700 dark:text-zinc-300'>Multiple UI Themes supported</span>
              </div>
              <div className='flex items-center gap-3'>
                <CheckCircle2 className='text-emerald-500 h-5 w-5' />
                <span className='text-zinc-700 dark:text-zinc-300'>Attach screenshots on failure</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className='relative'
          >
            <div className='absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full opacity-50' />
            <div className='relative font-mono text-sm leading-relaxed overflow-x-auto rounded-2xl bg-[#0d1117] p-8 shadow-2xl border border-zinc-800/50'>
              <pre className='text-zinc-300'>
                <code className='language-javascript'>
                  <span className='text-pink-400'>const</span> reporter = <span className='text-sky-400'>require</span>(
                  <span className='text-emerald-300'>'cucumber-html-reporter'</span>);
                  <br />
                  <br />
                  <span className='text-pink-400'>const</span> options = {'{'}
                  <br />
                  {'  '}theme: <span className='text-emerald-300'>'bootstrap'</span>,
                  <br />
                  {'  '}jsonFile: <span className='text-emerald-300'>'test/report/cucumber_report.json'</span>,
                  <br />
                  {'  '}output: <span className='text-emerald-300'>'test/report/cucumber_report.html'</span>,
                  <br />
                  {'  '}reportSuiteAsScenarios: <span className='text-amber-400'>true</span>,
                  <br />
                  {'  '}launchReport: <span className='text-amber-400'>true</span>
                  <br />
                  {'}'}
                  <br />
                  <br />
                  reporter.<span className='text-sky-400'>generate</span>(options);
                </code>
              </pre>
            </div>
          </motion.div>
        </section>

        {/* Step 3: Execute */}
        <section className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='flex flex-col gap-6'
          >
            <StepNumber number={3} />
            <h2 className='text-3xl md:text-4xl font-bold'>Execute & Generate</h2>
            <p className='text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed'>
              Run your tests as you normally would. Cucumber Reporter intercepts the JSON output and transforms it into
              a beautiful interactive dashboard instantly.
            </p>
            <div className='flex items-center gap-4 mt-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 w-fit shadow-sm'>
              <div className='flex items-center gap-2 font-mono font-medium text-emerald-600 dark:text-emerald-400'>
                <TerminalSquare className='h-5 w-5' /> npm test
              </div>
              <span className='text-zinc-400 italic text-sm border-l border-zinc-200 dark:border-zinc-800 pl-4'>
                Generating report... done.
              </span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className='relative flex justify-center lg:justify-end'
          >
            <div className='w-64 h-64 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-inner overflow-hidden relative'>
              <TerminalSquare className='h-32 w-32 text-zinc-200 dark:text-zinc-800' strokeWidth={1} />
              <div className='absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full' />
            </div>
          </motion.div>
        </section>

        {/* Step 4: Interactive Analysis */}
        <section className='pt-12 text-center'>
          <div className='flex flex-col items-center gap-6 mb-16 max-w-3xl mx-auto'>
            <StepNumber number={4} />
            <h2 className='text-3xl md:text-4xl font-bold'>Interactive Analysis</h2>
            <p className='text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed'>
              Experience the results through a sophisticated lens. High-density data curated for clarity, featuring
              real-time filtering, failure diagnostics, and performance trends.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left'>
            <InfoCard
              icon={<PieChart className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />}
              iconBg='bg-emerald-100 dark:bg-emerald-500/20'
              title='Visual Analytics'
              description='Beautiful charts providing an immediate overview of test pass/fail rates and suite health.'
            />
            <InfoCard
              icon={<ChevronDown className='h-5 w-5 text-sky-600 dark:text-sky-400' />}
              iconBg='bg-sky-100 dark:bg-sky-500/20'
              title='Smart Filtering'
              description='Drill down into specific tags, features, or failure reasons with lightning-fast search and filters.'
            />
            <InfoCard
              icon={<FileJson className='h-5 w-5 text-indigo-600 dark:text-indigo-400' />}
              iconBg='bg-indigo-100 dark:bg-indigo-500/20'
              title='Rich Artifacts'
              description='Embedded screenshots and video links attached directly to failed test steps for rapid debugging.'
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-2 shadow-2xl overflow-hidden'
          >
            {/* Using the feature-list-page.png as representation or simple UI block */}
            <Image
              src='/feature-list-page.png'
              alt='Cucumber Report Dashboard'
              width={1200}
              height={600}
              className='rounded-xl object-cover w-full h-auto opacity-90'
            />
          </motion.div>
        </section>

        {/* Step 5: CI/CD Ready */}
        <section className='mt-12'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='bg-emerald-100/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-3xl p-12 text-center flex flex-col items-center shadow-lg'
          >
            <StepNumber number={5} />
            <h2 className='text-3xl md:text-4xl font-bold mt-6 mb-4'>CI/CD Ready</h2>
            <p className='text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed max-w-2xl mb-12'>
              Automate your quality reporting. Perfect for GitHub Actions, GitLab CI, or Jenkins. Generate and publish
              reports automatically on every push.
            </p>

            <div className='flex flex-wrap justify-center gap-8 md:gap-16'>
              <div className='flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300'>
                <FaGithub className='h-6 w-6' /> GitHub Actions
              </div>
              <div className='flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300'>
                <FaJenkins className='h-6 w-6' /> Jenkins
              </div>
              <div className='flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300'>
                <FaGitlab className='h-6 w-6' /> GitLab
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Footer Branding */}
      <footer className='border-t border-zinc-200 dark:border-zinc-800 pt-12 px-6 mt-32'>
        <div className='container mx-auto flex flex-col md:flex-row justify-between items-center gap-8'>
          <div className='flex flex-col gap-2 text-center md:text-left'>
            <span className='text-2xl font-bold flex items-center justify-center md:justify-start'>
              Cucumber<span className='text-emerald-500'>HTML</span>
            </span>
            <p className='text-sm text-zinc-500'>© 2024 Precision Curator. Open source under MIT License.</p>
          </div>
          <div className='flex flex-wrap justify-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400'>
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

function StepNumber({ number }: { number: number }) {
  return (
    <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/20'>
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
