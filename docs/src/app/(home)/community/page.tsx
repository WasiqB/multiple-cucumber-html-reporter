'use client';

import { Calendar, Plus, Rss } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaDiscord, FaGithub, FaStackOverflow } from 'react-icons/fa6';
import { FiBookOpen } from 'react-icons/fi';
import { buttonVariants } from '@/components/ui/button';
import communityDataJson from '@/data/community.json';
import type { CommunityData } from '@/data/types';
import { cn } from '@/lib/cn';

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
  const { hero, supportChannels, contributing, spotlight, eventsAndUpdates } = communityDataJson as CommunityData;

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
                    'bg-emerald-600 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 text-white rounded-full px-8 h-12 text-base font-bold transition-all',
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
                    'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-8 h-12 text-base font-semibold group hover:bg-zinc-200 dark:hover:bg-zinc-800',
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
                      'bg-emerald-400 hover:bg-emerald-500 text-emerald-950 border-none rounded-xl font-bold px-6',
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
              <div className='w-full lg:w-[420px] relative z-10'>
                <div className='font-mono text-xs md:text-sm leading-loose rounded-xl bg-black/60 p-6 md:p-8 border border-zinc-800/80 shadow-2xl'>
                  <div className='flex gap-2 mb-6'>
                    <div className='w-3 h-3 rounded-full bg-red-500' />
                    <div className='w-3 h-3 rounded-full bg-amber-500' />
                    <div className='w-3 h-3 rounded-full bg-emerald-500' />
                  </div>
                  <pre className='text-zinc-300'>
                    <code>
                      {contributing.code.split('\n').map((line, i) => (
                        <div key={i}>
                          {line.startsWith('npm') || line.startsWith('git') || line.startsWith('cd') ? (
                            <>
                              <span className='text-emerald-400 font-bold'>{line.split(' ')[0]}</span>{' '}
                              {line.substring(line.indexOf(' '))}
                            </>
                          ) : (
                            line
                          )}
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
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

          {spotlight.items && spotlight.items.length > 0 && (
            <div className='flex flex-wrap justify-center gap-6 gap-y-10'>
              {spotlight.items.map((item, idx) => (
                <AvatarProfile key={idx} name={item.name} sponsorRole={item.role} />
              ))}

              <div className='flex flex-col items-center gap-3 w-28'>
                <div className='w-20 h-20 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:border-emerald-500 transition-colors cursor-pointer group'>
                  <Plus className='h-8 w-8 group-hover:scale-110 transition-transform' />
                </div>
                <div className='text-center mt-2'>
                  <div className='text-sm font-bold'>You!</div>
                  <div className='text-[10px] uppercase font-bold text-zinc-500 tracking-wider mt-0.5'>JOIN US</div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Events and Updates Section */}
      {eventsAndUpdates && (
        <section className='container mx-auto px-6 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-16 text-left mb-12'>
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
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50',
                  )}
                >
                  <span className='text-[10px] font-bold uppercase tracking-wider'>{evt.month}</span>
                  <span className='text-xl md:text-2xl font-black'>{evt.day}</span>
                </div>
                <div className='flex flex-col'>
                  <h4 className={cn('font-bold text-lg', evt.status && 'text-zinc-800 dark:text-zinc-200')}>
                    {evt.title}
                  </h4>
                  <p
                    className={cn(
                      'text-sm mt-1 mb-3',
                      evt.status ? 'text-zinc-500' : 'text-zinc-600 dark:text-zinc-400',
                    )}
                  >
                    {evt.description}
                  </p>
                  {evt.link && (
                    <Link
                      href={evt.link.url}
                      className='text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline inline-flex items-center gap-1 w-fit transition-colors'
                    >
                      {evt.link.text}{' '}
                      <span className='transform -rotate-45 font-sans group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform'>
                        →
                      </span>
                    </Link>
                  )}
                  {evt.status && <span className='text-xs font-semibold text-zinc-400 italic'>{evt.status}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className='flex flex-col gap-6'>
            <div className='flex items-center gap-3 mb-2 text-xl font-bold'>
              <Rss className='h-6 w-6 text-zinc-600 dark:text-zinc-400' /> {eventsAndUpdates.updatesTitle}
            </div>

            {eventsAndUpdates.updates?.map((update, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex flex-col pl-5 border-l-2 py-1 ml-3 hover:translate-x-1 transition-transform',
                  update.type === 'primary' ? 'border-emerald-500' : 'border-zinc-200 dark:border-zinc-800 mt-6',
                )}
              >
                <div
                  className={cn(
                    'text-[10px] font-bold tracking-widest uppercase mb-1.5',
                    update.type === 'primary' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500',
                  )}
                >
                  {update.category}
                </div>
                <h4 className='font-bold text-lg'>{update.title}</h4>
                <p className='text-sm text-zinc-600 dark:text-zinc-400 mt-1 mb-3'>{update.description}</p>
                {update.link && (
                  <Link
                    href={update.link.url}
                    className='text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors'
                  >
                    {update.link.text}
                  </Link>
                )}
              </div>
            ))}
          </div>
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
      className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all flex flex-col items-start gap-4'
    >
      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', iconBg)}>{icon}</div>
      <h3 className='text-xl font-bold mt-2'>{title}</h3>
      <p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-sm'>{description}</p>
      <Link
        href={href}
        className='mt-auto pt-4 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 group hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-sm'
      >
        {linkText} <span className='transition-transform group-hover:translate-x-1 font-sans'>→</span>
      </Link>
    </motion.div>
  );
}

function AvatarProfile({ name, sponsorRole }: { name: string; sponsorRole: string }) {
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${name}`;
  return (
    <div className='flex flex-col items-center gap-3 w-28 group'>
      <div className='w-20 h-20 outline outline-offset-4 outline-transparent hover:outline-zinc-300 dark:hover:outline-zinc-700 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 transition-all'>
        <Image
          src={avatarUrl}
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
    </div>
  );
}
