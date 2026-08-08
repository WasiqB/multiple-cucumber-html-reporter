'use client';

import { Bug, FileText, Heart, Rocket, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa6';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

const sponsorsData = {
  hero: {
    titleLine1: 'Support the future of',
    titleLine2: 'Multiple CucumberHTML Reporter',
    description:
      'Multiple CucumberHTML Reporter is built on the belief that technical precision should be accessible to everyone. Your sponsorship directly funds independent development, ensuring the ecosystem remains modern, secure, and sustainable for the long term.',
    action: {
      text: 'Sponsor on GitHub',
      href: 'https://github.com/sponsors/WasiqB',
    },
  },
  benefits: [
    {
      icon: 'Rocket',
      title: 'Faster Core Development',
      description:
        'Sponsorship allows our core maintainers to dedicate full-time hours to performance optimizations and new feature implementations.',
      type: 'light',
    },
    {
      icon: 'FileText',
      title: 'Editorial Quality Docs',
      description:
        'We believe documentation is a first-class feature. Funds help us maintain high-fidelity tutorials and API references.',
      type: 'green',
    },
    {
      icon: 'ShieldCheck',
      title: 'Security Audits',
      description: 'Dedicated maintenance includes quarterly security sweeps and dependency hardening.',
      type: 'light',
    },
    {
      icon: 'Bug',
      title: 'Priority Bug Fixes',
      description:
        'Community-reported issues are triaged and resolved with precision, ensuring the stable branch remains production-ready at all times for enterprises and individuals alike.',
      type: 'light',
    },
  ],
  tiers: {
    title: 'Choose Your Tier',
    description:
      'Support the project at a level that fits your contribution capacity. Every bit counts towards engineering excellence.',
    items: [
      {
        name: '🚶🏻 Starter',
        price: '$5',
        period: 'per month',
        features: ['You get a shoutout on my Socials', 'Get your name listed on my personal website'],
        button: 'Join',
        type: 'outline',
        href: 'https://github.com/sponsors/WasiqB/sponsorships?tier_id=157962',
      },
      {
        name: '🤝 Backer',
        price: '$25',
        period: 'per month',
        features: ['Including previous tier benefits', 'Get your name listed on README of all my repositories'],
        button: 'Join',
        type: 'outline',
        href: 'https://github.com/sponsors/WasiqB/sponsorships?tier_id=157963',
      },
      {
        name: '🥉 Bronze',
        price: '$50',
        period: 'per month',
        features: [
          'Including previous tier benefits',
          'Get special sponsor role on my Discord server with access to private sponsor channel where you will get priority over other discussions',
        ],
        button: 'Join',
        type: 'solid',
        href: 'https://github.com/sponsors/WasiqB/sponsorships?tier_id=157964',
      },
      {
        name: '🥈 Silver',
        price: '$100',
        period: 'per month',
        features: [
          'Including previous tier benefits',
          'Get 30 minutes / month of call with me anytime during the month for any consulting or mentorship',
        ],
        button: 'Join',
        type: 'primary',
        href: 'https://github.com/sponsors/WasiqB/sponsorships?tier_id=157967',
      },
      {
        name: '🥇 Gold',
        price: '$350',
        period: 'per month',
        features: [
          'Including previous tier benefits',
          'Get 1 hour / month of call with me anytime during the month for any consulting or mentorship',
        ],
        button: 'Join',
        type: 'dark',
        href: 'https://github.com/sponsors/WasiqB/sponsorships?tier_id=206957',
      },
      {
        name: '💎 Diamond',
        price: '$500',
        period: 'per month',
        features: [
          'Including previous tier benefits',
          'Get 4 hour / month of call with me anytime during the month for any consulting or mentorship',
        ],
        button: 'Join',
        type: 'dark',
        href: 'https://github.com/sponsors/WasiqB/sponsorships?tier_id=235804',
      },
      {
        name: '👑 Platinum',
        price: '$1000',
        period: 'per month',
        features: [
          'Including previous tier benefits',
          'Get 12 hour / month call with me anytime during the month for any consulting or mentorship',
        ],
        button: 'Join',
        type: 'dark',
        href: 'https://github.com/sponsors/WasiqB/sponsorships?tier_id=206958',
      },
    ],
  },
  curators: {
    title: 'Meet the Curators',
    description: 'The organizations and individuals keeping the project alive.',
    goldSponsors: [] as { name: string; image?: string; url?: string }[],
    silverAndBronze: [] as { name: string; image?: string; url?: string }[],
    individuals: [] as { name: string; image?: string; url?: string }[],
  },
  licenses: {
    title: 'Software License Sponsors',
    description:
      'We are extremely grateful to the following companies who provide paid licenses of their professional software tools to support open source development.',
    items: [
      {
        name: 'Vercel',
        image: 'https://k9v00w0cps.ufs.sh/f/RyRlUroX9tIHWHFJSVzuXbQxU14FIfOCKwTlo7qcWJn02GYZ',
        url: 'https://vercel.com/open-source-program',
        license: 'Vercel Open Source Program - Spring 2026 Cohort',
      },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    items: [
      {
        question: 'Where does the money go?',
        answer:
          '100% of funds (after platform fees) go towards project expenses: paying maintainers for focused dev time, hosting our documentation infrastructure, and sponsoring upstream dependencies we rely on.',
      },
      {
        question: 'Can I manage or cancel my sponsorship?',
        answer:
          'Yes, all billing is handled through GitHub Sponsors. You can upgrade, downgrade, or cancel your recurring contribution at any time through the dashboard.',
      },
    ],
  },
  cta: {
    title: 'Ready to curate the future with us?',
    primaryLink: { label: 'Sponsor on GitHub', url: 'https://github.com/sponsors/WasiqB' },
    secondaryLink: { label: 'Other ways to help', url: '/community' },
  },
};

const iconMap: Record<string, React.ReactNode> = {
  Rocket: <Rocket className='h-6 w-6' />,
  FileText: <FileText className='h-6 w-6' />,
  ShieldCheck: <ShieldCheck className='h-6 w-6' />,
  Bug: <Bug className='h-6 w-6' />,
};

export default function SponsorsPage() {
  const { hero, benefits, tiers, curators, licenses, faq, cta } = sponsorsData;
  const hasSponsors =
    (curators?.goldSponsors?.length ?? 0) > 0 ||
    (curators?.silverAndBronze?.length ?? 0) > 0 ||
    (curators?.individuals?.length ?? 0) > 0;

  return (
    <main className='flex flex-col gap-24 pb-20 overflow-x-hidden m-10'>
      {/* Hero Section */}
      {hero && (
        <section className='pt-20 md:pt-32 px-6 flex flex-col items-center text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='max-w-3xl'
          >
            <h1 className='text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6'>
              {hero.titleLine1 || 'Support the future of'}{' '}
              {hero.titleLine2 && (
                <span className='text-emerald-600 dark:text-emerald-500'>
                  <br />
                  {hero.titleLine2}
                </span>
              )}
            </h1>
            <p className='text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-10 max-w-2xl text-balance'>
              {hero.description}
            </p>
            {hero.action && (
              <div className='flex flex-wrap justify-center gap-4'>
                <Link
                  href={hero.action.href || '#'}
                  className={cn(
                    buttonVariants({ size: 'default' }),
                    'bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-8 h-12 text-base font-bold transition-all shadow-lg',
                  )}
                >
                  <FaGithub className='mr-2 h-5 w-5' /> {hero.action.text}
                </Link>
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Benefits Section */}
      {benefits && benefits.length > 0 && (
        <section className='container mx-auto px-6 max-w-6xl'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className={cn(
                  'rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all flex flex-col items-start border',
                  benefit.type === 'green'
                    ? 'bg-emerald-400 dark:bg-emerald-500 border-emerald-300 dark:border-emerald-600 text-emerald-950'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-6',
                    benefit.type === 'green'
                      ? 'bg-emerald-500/20 dark:bg-emerald-900/30 text-emerald-900'
                      : 'text-emerald-600',
                  )}
                >
                  {benefit.icon ? iconMap[benefit.icon] : <Rocket className='h-6 w-6' />}
                </div>
                <h3 className='text-xl font-bold mb-3'>{benefit.title}</h3>
                <p
                  className={cn(
                    'text-sm leading-relaxed mb-2',
                    benefit.type === 'green' ? 'text-emerald-900/80' : 'text-zinc-600 dark:text-zinc-400',
                  )}
                >
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Tiers Section */}
      {tiers && (
        <section className='container mx-auto px-6 text-center py-12'>
          <div className='mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>{tiers.title}</h2>
            <p className='text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto'>{tiers.description}</p>
          </div>

          {tiers.items && tiers.items.length > 0 && (
            <div className='flex flex-wrap justify-center items-end gap-x-4 gap-y-8'>
              {tiers.items.map((tier, index) => (
                <div
                  key={index}
                  className={cn(
                    'rounded-3xl border p-8 flex flex-col items-center shadow-sm w-full md:w-64 transition-transform hover:-translate-y-2 relative',
                    tier.type === 'primary' &&
                      'bg-emerald-800 dark:bg-emerald-900 border-emerald-700 text-white shadow-xl',
                    tier.type === 'outline' && 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
                    tier.type === 'solid' && 'bg-white dark:bg-zinc-900 border-emerald-500 shadow-md',
                    tier.type === 'dark' && 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800',
                  )}
                >
                  <div className='text-sm font-bold uppercase tracking-widest mb-4 opacity-80'>{tier.name}</div>
                  <div className='text-4xl md:text-5xl font-extrabold mb-1'>{tier.price}</div>
                  <div className='text-xs opacity-60 mb-8'>{tier.period}</div>

                  {tier.features && tier.features.length > 0 && (
                    <div className='flex flex-col gap-4 text-sm font-medium mb-10 w-full'>
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className='opacity-80'>
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    href={tier.href}
                    target='_blank'
                    className={cn(
                      buttonVariants({ size: 'default' }),
                      'mt-auto w-full rounded-2xl font-bold',
                      tier.type === 'primary' && 'bg-white text-emerald-900 hover:bg-zinc-100 hover:text-emerald-900',
                      tier.type === 'solid' && 'bg-emerald-700 text-white hover:bg-emerald-800 hover:text-white',
                      tier.type === 'dark' && 'bg-zinc-700 text-white hover:bg-zinc-800 hover:text-white',
                      tier.type === 'outline' &&
                        'bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:hover:text-white',
                    )}
                  >
                    {tier.button || 'Join'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Curators */}
      {curators && (
        <section className='container mx-auto px-6 max-w-4xl py-12'>
          <div className='flex flex-col gap-12'>
            {!hasSponsors ? (
              <div className='bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 text-center flex flex-col items-center gap-6'>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                >
                  <Heart className='h-12 w-12 text-rose-500' />
                </motion.div>
                <div>
                  <h3 className='text-2xl font-bold mb-2'>Be the First Sponsor!</h3>
                  <p className='text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto'>
                    Your support directly funds independent development, ensuring the ecosystem remains modern, secure,
                    and sustainable. Join our community of supporters today and help us build the future of Reporting.
                  </p>
                </div>
                <Link
                  href='https://github.com/sponsors/WasiqB'
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'bg-rose-500 hover:bg-rose-600 text-white hover:text-white rounded-full',
                  )}
                >
                  Become a Sponsor
                </Link>
              </div>
            ) : (
              <>
                <div className='mb-12 flex flex-col items-start'>
                  <h2 className='text-3xl md:text-4xl font-bold mb-4'>{curators.title}</h2>
                  <p className='text-zinc-600 dark:text-zinc-400'>{curators.description}</p>
                </div>
                <div className='flex flex-col gap-12'>
                  {curators.goldSponsors && curators.goldSponsors.length > 0 && (
                    <div>
                      <h3 className='text-xs font-bold text-zinc-400 tracking-widest uppercase mb-6'>
                        Gold Sponsors and above
                      </h3>
                      <div className='flex flex-wrap gap-6'>
                        {curators.goldSponsors.map((s, idx) => (
                          <Link
                            key={idx}
                            href={s.url || '#'}
                            target='_blank'
                            className='group flex flex-col items-center transition-transform hover:scale-105'
                          >
                            <div className='w-24 h-24 bg-white dark:bg-zinc-900 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-xl overflow-hidden mb-3'>
                              {s.image ? (
                                <Image
                                  src={s.image}
                                  alt={s.name}
                                  width={96}
                                  height={96}
                                  className='w-full h-full object-cover'
                                />
                              ) : (
                                <div className='text-xl font-bold text-emerald-600'>{s.name[0]}</div>
                              )}
                            </div>
                            <span className='text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-500'>
                              {s.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {curators.silverAndBronze && curators.silverAndBronze.length > 0 && (
                    <div className='border-zinc-200 dark:border-zinc-800 pt-8'>
                      <h3 className='text-xs font-bold text-zinc-400 tracking-widest uppercase mb-6'>
                        Silver & Bronze
                      </h3>
                      <div className='flex flex-wrap gap-4'>
                        {curators.silverAndBronze.map((s, idx) => (
                          <Link
                            key={idx}
                            href={s.url || '#'}
                            target='_blank'
                            className='group flex flex-col items-center transition-transform hover:scale-105'
                          >
                            <div className='w-16 h-16 bg-white dark:bg-zinc-900 border border-emerald-500/50 rounded-full flex items-center justify-center shadow-md overflow-hidden mb-2'>
                              {s.image ? (
                                <Image
                                  src={s.image}
                                  alt={s.name}
                                  width={64}
                                  height={64}
                                  className='w-full h-full object-cover'
                                />
                              ) : (
                                <div className='text-lg font-bold text-emerald-600'>{s.name[0]}</div>
                              )}
                            </div>
                            <span className='text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-500'>
                              {s.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {curators.individuals && curators.individuals.length > 0 && (
                    <div className='border-t border-zinc-200 dark:border-zinc-800 pt-8'>
                      <h3 className='text-xs font-bold text-zinc-400 tracking-widest uppercase mb-6'>
                        Individual Backers
                      </h3>
                      <div className='flex flex-wrap gap-3'>
                        {curators.individuals.map((s, idx) => (
                          <Link
                            key={idx}
                            href={s.url || '#'}
                            target='_blank'
                            className='w-10 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center shadow-xs hover:border-emerald-500 transition-all overflow-hidden'
                            title={s.name}
                          >
                            {s.image ? (
                              <Image
                                src={s.image}
                                alt={s.name}
                                width={40}
                                height={40}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <span className='text-xs font-bold text-zinc-500'>{s.name[0]}</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Software Licenses Section */}
      {licenses?.items && licenses.items.length > 0 && (
        <section className='container mx-auto px-6 max-w-4xl py-12 border-t border-zinc-200 dark:border-zinc-800'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>{licenses.title}</h2>
            <p className='text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto'>{licenses.description}</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {licenses.items.map((item, idx) => (
              <Link href={item.url || '#'} target='_blank' className='mb-6 block transition-transform hover:scale-105'>
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all'
                >
                  {item.image && (
                    <div className='w-20 h-20 bg-white dark:bg-zinc-900 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden p-0.5'>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className='w-full h-full object-cover rounded-full dark:invert'
                      />
                    </div>
                  )}
                  <h3 className='text-xl font-bold mb-2'>{item.name}</h3>
                  <p className='text-sm text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed'>
                    {item.license}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq?.items && faq.items.length > 0 && (
        <section className='container mx-auto px-6 max-w-3xl py-12 border-t border-zinc-200 dark:border-zinc-800'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12'>{faq.title}</h2>
          <div className='flex flex-col gap-8'>
            {faq.items.map((item, idx) => (
              <div key={idx} className='flex flex-col gap-2'>
                <h3 className='text-xl font-bold'>{item.question}</h3>
                <p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {cta && (
        <section className='container mx-auto px-6 max-w-4xl'>
          <div className='bg-emerald-900 rounded-[3rem] p-12 text-center flex flex-col items-center shadow-2xl relative overflow-hidden'>
            <div className='absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 blur-3xl rounded-full' />
            <h2 className='text-3xl md:text-5xl font-extrabold text-white mb-8 relative z-10'>{cta.title}</h2>
            <div className='flex flex-wrap justify-center gap-4 relative z-10'>
              {cta.primaryLink && (
                <Link
                  href={cta.primaryLink.url}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'bg-emerald-400 hover:bg-emerald-300 text-emerald-950 hover:text-emerald-950 rounded-full font-bold px-8 shadow-lg',
                  )}
                >
                  {cta.primaryLink.label}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
