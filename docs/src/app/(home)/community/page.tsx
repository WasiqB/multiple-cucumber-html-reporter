'use client';

import { Calendar, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaDiscord, FaGithub, FaStackOverflow } from 'react-icons/fa6';
import { FiBookOpen } from 'react-icons/fi';
import { buttonVariants } from '@/components/ui/button';
import { Terminal } from '@/components/ui/terminal';
import { cn } from '@/lib/cn';

const communityData = {
  hero: {
    badge: 'Open Source First',
    titleLine1: 'Join the',
    titleLine2: 'Multiple CucumberHTML Reporter',
    titleLine3: 'Community',
    description:
      'We believe in the power of precision and collaboration. Join thousands of developers building the future of clean, automated HTML scaffolding. Every line of code counts.',
    primaryLink: { label: 'Become a Contributor', url: '/docs/latest/contributing' },
    secondaryLink: {
      label: 'View Roadmap',
      url: 'https://github.com/WasiqB/multiple-cucumber-html-reporter/milestones',
    },
  },
  supportChannels: {
    title: 'Support Channels',
    description:
      "Whether you're stuck on a bug or looking for architectural advice, our community is here to help you move faster.",
    items: [
      {
        icon: 'Discord',
        title: 'Discord',
        description: 'Join our vibrant real-time chat for quick questions, community hangouts, and live announcements.',
        linkText: 'Join Server',
        href: 'https://discord.gg/d6rfHkSDjc',
      },
      {
        icon: 'GitHub',
        title: 'GitHub Issues',
        description: 'Found a bug or have a feature request? Open an issue on our repository to track progress.',
        linkText: 'Submit Issue',
        href: 'https://github.com/WasiqB/multiple-cucumber-html-reporter/issues',
      },
      {
        icon: 'GitHub',
        title: 'GitHub Discussions',
        description: 'Join our GitHub Discussions to ask questions, share ideas, and connect with other users.',
        linkText: 'Join Discussions',
        href: 'https://github.com/WasiqB/multiple-cucumber-html-reporter/discussions',
      },
    ],
  },
  contributing: {
    title: 'Start contributing today',
    description:
      'New to open source? No problem. We have a dedicated path for beginners to help you make your first pull request.',
    primaryLink: {
      label: 'Good First Issues',
      url: 'https://github.com/WasiqB/multiple-cucumber-html-reporter/issues',
    },
    secondaryLink: { label: 'Contributing Guide', url: '/docs/latest/contributing' },
    code: [
      'git clone git@github.com:WasiqB/multiple-cucumber-html-reporter.git',
      'cd multiple-cucumber-html-reporter',
      'pnpm install',
    ],
  },
  spotlight: {
    title: 'Community Spotlight',
    description:
      'Recognizing the incredible individuals who dedicate their time to making Multiple CucumberHTML Reporter better for everyone.',
    items: [
      {
        name: 'Wasiq Bhamla',
        role: 'Core Maintainer',
        avatarUrl: 'https://avatars.githubusercontent.com/u/9130909?v=4',
        link: 'https://github.com/WasiqB',
      },
      {
        name: 'Mat Walker',
        role: 'Contributor',
        avatarUrl: 'https://avatars.githubusercontent.com/u/12616918?v=4',
        link: 'https://github.com/v-mwalk',
      },
    ],
  },
  alumni: {
    title: 'Alumni Community',
    description:
      'A huge thank you to the former contributors and maintainers whose efforts built the foundation of Multiple CucumberHTML Reporter.',
    items: [
      {
        name: 'Wim Selles',
        role: 'Former Core Maintainer',
        avatarUrl: 'https://avatars.githubusercontent.com/u/11979740?v=4',
        link: 'https://github.com/wswebcreation',
      },
      {
        name: 'Federico Buti',
        role: 'Contributor',
        avatarUrl: 'https://avatars.githubusercontent.com/u/10329968?v=4',
        link: 'https://github.com/BaCaRoZzo',
      },
      {
        name: 'Basker Peram Subramaniyan',
        role: 'Contributor',
        avatarUrl: 'https://avatars.githubusercontent.com/u/6072775?v=4',
        link: 'https://github.com/Baskercarrer',
      },
      {
        name: 'Stefano Tamagnini',
        role: 'Contributor',
        avatarUrl: 'https://avatars.githubusercontent.com/u/226824?v=4',
        link: 'https://github.com/yoghi',
      },
      {
        name: "Henri d'Orgeval",
        role: 'Contributor',
        avatarUrl: 'https://avatars.githubusercontent.com/u/9698924?v=4',
        link: 'https://github.com/hdorgeval',
      },
      {
        name: 'Kevin Kuszyk',
        role: 'Contributor',
        avatarUrl: 'https://avatars.githubusercontent.com/u/2734580?v=4',
        link: 'https://github.com/kevinkuszyk',
      },
    ],
  },
  eventsAndUpdates: {
    eventsTitle: 'Upcoming Events',
    events: [] as {
      month?: string;
      day?: string;
      title: string;
      description: string;
      link?: { text: string; url: string };
      status?: string;
    }[],
    updatesTitle: 'Latest Updates',
    updates: [] as {
      category: string;
      title: string;
      description: string;
      type?: string;
      link?: { text: string; url: string };
    }[],
  },
};

const supportIconMap: Record<string, React.ReactNode> = {
  Discord: <FaDiscord className='h-6 w-6 text-indigo-500' />,
  GitHub: <FaGithub className='h-6 w-6 text-zinc-800 dark:text-zinc-200' />,
  StackOverflow: <FaStackOverflow className='h-6 w-6 text-amber-500' />,
};

const supportBgMap: Record<string, string> = {
  Discord: 'bg-indigo-100 dark:bg-indigo-500/20',
  GitHub: 'bg-zinc-200 dark:bg-zinc-800',
  StackOverflow: 'bg-amber-100 dark:bg-amber-500/20',
};

export default function CommunityPage() {
  const { hero, supportChannels, contributing, spotlight, alumni, eventsAndUpdates } = communityData;

  return (
    <main className='flex flex-col gap-24 pb-20 overflow-x-hidden m-10'>
      {/* Hero Section */}
      {hero && (
        <section className='pt-20 md:pt-32 px-6 flex flex-col items-center text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='flex flex-col items-center'
          >
            {hero.badge && (
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold w-fit border border-emerald-500/20 mb-6 uppercase tracking-wider'>
                {hero.badge}
              </div>
            )}
            <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6'>
              {hero.titleLine1} <br />
              {hero.titleLine2 && (
                <span className='text-emerald-600 dark:text-emerald-500 italic'>{hero.titleLine2}</span>
              )}{' '}
              {hero.titleLine3 && (
                <>
                  <br />
                  {hero.titleLine3}
                </>
              )}
            </h1>
            {hero.description && (
              <p className='text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10'>
                {hero.description}
              </p>
            )}
            <div className='flex flex-wrap justify-center gap-4'>
              {hero.primaryLink && (
                <Link
                  href={hero.primaryLink.url}
                  className={cn(
                    buttonVariants({ size: 'default' }),
                    'bg-emerald-600 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 text-white hover:text-white rounded-full px-8 h-12 text-base font-bold transition-all',
                  )}
                >
                  <FaGithub className='mr-2 h-5 w-5' /> {hero.primaryLink.label}
                </Link>
              )}
              {hero.secondaryLink && (
                <Link
                  href={hero.secondaryLink.url}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'default' }),
                    'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full px-8 h-12 text-base font-semibold group hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100',
                  )}
                >
                  {hero.secondaryLink.label}
                </Link>
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* Support Channels Section */}
      {supportChannels && (
        <section className='container mx-auto px-6 max-w-5xl'>
          <div className='mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>{supportChannels.title}</h2>
            <p className='text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed'>{supportChannels.description}</p>
          </div>
          {supportChannels.items && supportChannels.items.length > 0 && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-left'>
              {supportChannels.items.map((item, idx) => (
                <SupportChannelCard
                  key={idx}
                  icon={supportIconMap[item.icon] || <FaDiscord className='h-6 w-6' />}
                  iconBg={supportBgMap[item.icon] || 'bg-zinc-100 dark:bg-zinc-800'}
                  title={item.title}
                  description={item.description}
                  linkText={item.linkText}
                  href={item.href}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Start Contributing Block */}
      {contributing && (
        <section className='container mx-auto px-6 max-w-5xl'>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='bg-[#0c1115] dark:bg-zinc-950 rounded-[2rem] border border-zinc-800/80 shadow-2xl overflow-hidden p-10 md:p-14 flex flex-col lg:flex-row gap-12 items-center relative'
          >
            <div className='absolute -left-48 -bottom-48 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full' />

            <div className='flex-1 flex flex-col gap-6 relative z-10'>
              <h2 className='text-3xl md:text-5xl font-extrabold text-white tracking-tight'>{contributing.title}</h2>
              <p className='text-zinc-400 text-lg leading-relaxed max-w-md'>{contributing.description}</p>
              <div className='flex flex-wrap gap-4 mt-4'>
                {contributing.primaryLink && (
                  <Link
                    href={contributing.primaryLink.url}
                    className={cn(
                      buttonVariants({ size: 'default' }),
                      'bg-emerald-400 hover:bg-emerald-500 text-emerald-950 hover:text-emerald-950 border-none rounded-xl font-bold px-6',
                    )}
                  >
                    <FiBookOpen className='mr-2 h-5 w-5' /> {contributing.primaryLink.label}
                  </Link>
                )}
                {contributing.secondaryLink && (
                  <Link
                    href={contributing.secondaryLink.url}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'default' }),
                      'border-zinc-700 bg-zinc-900/50 text-white hover:bg-zinc-800 hover:text-white rounded-xl font-semibold px-6',
                    )}
                  >
                    <FiBookOpen className='mr-2 h-5 w-5' /> {contributing.secondaryLink.label}
                  </Link>
                )}
              </div>
            </div>

            {contributing.code && (
              <div className='w-full lg:w-105 relative z-10'>
                <Terminal
                  commands={contributing.code}
                  typingSpeed={45}
                  enableSound
                  initialDelay={3}
                  delayBetweenCommands={1000}
                />
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Community Spotlight Section */}
      {spotlight && (
        <section className='container mx-auto px-6 max-w-5xl text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>{spotlight.title}</h2>
          <p className='text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-16'>
            {spotlight.description}
          </p>

          <div className='flex flex-wrap justify-center gap-6 gap-y-10'>
            {spotlight.items.map((item, idx) => (
              <AvatarProfile
                key={idx}
                name={item.name}
                sponsorRole={item.role}
                avatarUrl={item.avatarUrl}
                link={item.link}
              />
            ))}

            <div className='flex flex-col items-center gap-3 w-28'>
              <Link href='/docs/latest/contributing' className='text-center mt-2'>
                <div className='w-20 h-20 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:border-emerald-500 transition-colors cursor-pointer group'>
                  <Plus className='h-8 w-8 group-hover:scale-110 transition-transform' />
                </div>
                <div className='text-sm font-bold'>You!</div>
                <div className='text-[10px] uppercase font-bold text-zinc-500 tracking-wider mt-0.5'>JOIN US</div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Alumni Community Section */}
      {alumni && (
        <section className='container mx-auto px-6 max-w-5xl text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>{alumni.title}</h2>
          <p className='text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-16'>
            {alumni.description}
          </p>

          <div className='flex flex-wrap justify-center gap-6 gap-y-10'>
            {alumni.items.map((item, idx) => (
              <AvatarProfile
                key={idx}
                name={item.name}
                sponsorRole={item.role}
                avatarUrl={item.avatarUrl}
                link={item.link}
              />
            ))}
            {alumni.items.length === 0 && <div className='text-zinc-500 italic'>No alumni records yet.</div>}
          </div>
        </section>
      )}

      {/* Events and Updates Section */}
      {(eventsAndUpdates?.events?.length > 0 || eventsAndUpdates?.updates?.length > 0) && (
        <section className='container mx-auto px-6 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-16 text-left mb-12'>
          {eventsAndUpdates?.events?.length > 0 && (
            <div className='flex flex-col gap-6'>
              <div className='flex items-center gap-3 mb-2 text-xl font-bold'>
                <Calendar className='h-6 w-6 text-emerald-600' /> {eventsAndUpdates.eventsTitle}
              </div>

              {eventsAndUpdates.events?.map((evt, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'border rounded-2xl p-6 flex gap-6 transition-shadow',
                    evt.status
                      ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md',
                  )}
                >
                  <div
                    className={cn(
                      'flex flex-col items-center justify-center rounded-xl px-4 py-2 h-fit border',
                      evt.status
                        ? 'bg-zinc-200/50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                    )}
                  >
                    <span className='text-xs font-bold uppercase tracking-wider'>{evt.month}</span>
                    <span className='text-2xl font-black'>{evt.day}</span>
                  </div>
                  <div className='flex flex-col gap-2 flex-1'>
                    <div className='flex items-center justify-between gap-2'>
                      <h3 className='font-bold text-lg'>{evt.title}</h3>
                      {evt.status && (
                        <span className='text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700'>
                          {evt.status}
                        </span>
                      )}
                    </div>
                    <p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>{evt.description}</p>
                    {evt.link && (
                      <Link
                        href={evt.link.url}
                        className='text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-2 hover:underline inline-flex items-center gap-1'
                      >
                        {evt.link.text} <span>→</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {eventsAndUpdates?.updates?.length > 0 && (
            <div className='flex flex-col gap-6'>
              <div className='flex items-center gap-3 mb-2 text-xl font-bold'>{eventsAndUpdates.updatesTitle}</div>

              {eventsAndUpdates.updates?.map((upd, idx) => (
                <div
                  key={idx}
                  className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3'
                >
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider'>
                      {upd.category}
                    </span>
                    {upd.type && (
                      <span className='text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
                        {upd.type}
                      </span>
                    )}
                  </div>
                  <h3 className='font-bold text-lg'>{upd.title}</h3>
                  <p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>{upd.description}</p>
                  {upd.link && (
                    <Link
                      href={upd.link.url}
                      className='text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-2 hover:underline inline-flex items-center gap-1'
                    >
                      {upd.link.text} <span>→</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function SupportChannelCard({
  icon,
  iconBg,
  title,
  description,
  linkText,
  href,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  linkText: string;
  href: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all flex flex-col items-start'
    >
      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-6', iconBg)}>{icon}</div>
      <h3 className='text-xl font-bold mb-3'>{title}</h3>
      <p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-8 flex-1'>{description}</p>
      <Link
        href={href}
        target='_blank'
        className='text-emerald-600 dark:text-emerald-400 font-bold text-sm hover:gap-2 transition-all flex items-center gap-1 mt-auto'
      >
        {linkText} <span className='text-base'>→</span>
      </Link>
    </motion.div>
  );
}

function AvatarProfile({
  name,
  sponsorRole,
  avatarUrl,
  link,
}: {
  name: string;
  sponsorRole: string;
  avatarUrl: string;
  link: string;
}) {
  return (
    <Link href={link} target='_blank' className='flex flex-col items-center gap-3 w-28 group'>
      <div className='w-20 h-20 outline outline-offset-4 outline-transparent hover:outline-zinc-300 dark:hover:outline-zinc-700 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 transition-all'>
        <Image
          src={avatarUrl || ''}
          alt={name}
          className='w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-300'
          width={80}
          height={80}
        />
      </div>
      <div className='text-center mt-2'>
        <div className='text-sm font-bold'>{name}</div>
        <div className='text-[10px] uppercase font-bold text-zinc-500 tracking-wider mt-0.5'>{sponsorRole}</div>
      </div>
    </Link>
  );
}
