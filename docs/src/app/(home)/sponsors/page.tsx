'use client';

import { Bug, FileText, Heart, Rocket, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa6';
import { buttonVariants } from '@/components/ui/button';
import sponsorsDataJson from '@/data/sponsors.json';
import type { SponsorsData } from '@/data/types';
import { cn } from '@/lib/cn';

const iconMap: Record<string, React.ReactNode> = {
  Rocket: <Rocket className='h-6 w-6' />,
  FileText: <FileText className='h-6 w-6' />,
  ShieldCheck: <ShieldCheck className='h-6 w-6' />,
  Bug: <Bug className='h-6 w-6' />,
};

export default function SponsorsPage() {
  const { hero, benefits, tiers, curators, licenses, faq, cta } = sponsorsDataJson as SponsorsData;
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
                                <div className='text-sm font-bold text-emerald-600'>{s.name[0]}</div>
                              )}
                            </div>
                            <span className='text-[10px] font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-500'>
                              {s.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {curators.individuals && curators.individuals.length > 0 && (
                    <div className='border-t border-zinc-200 dark:border-zinc-800 pt-8'>
                      <h3 className='text-xs font-bold text-zinc-400 tracking-widest uppercase mb-6'>Individuals</h3>
                      <div className='flex flex-wrap gap-3 items-center'>
                        {curators.individuals.map((u, idx) => (
                          <Link
                            key={idx}
                            href={u.url || '#'}
                            target='_blank'
                            className='w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full border border-zinc-300 dark:border-zinc-700 shadow-sm overflow-hidden transition-transform hover:scale-110'
                          >
                            <Image
                              width={40}
                              height={40}
                              src={u.image || `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${u.name}`}
                              alt={u.name}
                              className='w-full h-full object-cover'
                            />
                          </Link>
                        ))}
                        {curators.moreCount && (
                          <div className='w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center text-xs font-bold text-zinc-500'>
                            {curators.moreCount}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* License Sponsors Section */}
      {licenses?.items && licenses.items.length > 0 && (
        <section className='container mx-auto px-6 max-w-4xl py-12 text-center'>
          <div className='mb-12 flex flex-col items-center'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>{licenses.title}</h2>
            <p className='text-zinc-600 dark:text-zinc-400'>{licenses.description}</p>
          </div>

          <div className='flex flex-wrap justify-center gap-8'>
            {licenses.items.map((s, idx) => (
              <Link
                key={idx}
                href={s.url || '#'}
                target='_blank'
                rel='noopener noreferrer'
                className='group flex flex-col items-center transition-transform hover:scale-105'
              >
                <div className='w-24 h-24 bg-white dark:bg-zinc-900 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-xl overflow-hidden mb-3'>
                  {s.image ? (
                    <Image src={s.image} alt={s.name} width={96} height={96} className='w-full h-full object-cover' />
                  ) : (
                    <div className='text-xl font-bold text-emerald-600'>{s.name[0]}</div>
                  )}
                </div>
                <span className='text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-500'>
                  {s.name}
                </span>
                <span className='text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-1 max-w-[180px] text-center'>
                  {s.license}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq?.items && faq.items.length > 0 && (
        <section className='container mx-auto px-6 max-w-4xl text-center py-12 mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12'>{faq.title}</h2>

          <div className='flex flex-col gap-6 text-left'>
            {faq.items.map((item, idx) => (
              <div
                key={idx}
                className='bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8'
              >
                <h4 className='font-bold text-lg mb-3'>{item.question}</h4>
                <p className='text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ready to CTA */}
      {cta && (
        <section className='container mx-auto px-6 max-w-5xl mb-12'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='bg-emerald-900 rounded-[3rem] p-16 text-center flex flex-col items-center shadow-2xl relative overflow-hidden'
          >
            <div className='absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 blur-3xl rounded-full' />

            <h2 className='text-3xl md:text-5xl font-extrabold text-white mb-10 relative z-10'>{cta.title}</h2>

            <div className='flex flex-wrap justify-center items-center gap-6 relative z-10'>
              {cta.primaryLink && (
                <Link
                  href={cta.primaryLink.url || '#'}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'bg-white hover:bg-zinc-100 text-emerald-950 hover:text-emerald-950 rounded-full font-bold px-8 shadow-lg',
                  )}
                >
                  {cta.primaryLink.label}
                </Link>
              )}
              {cta.secondaryLink && (
                <Link
                  href={cta.secondaryLink.url || '#'}
                  className='text-emerald-100 hover:text-white font-bold text-sm underline decoration-emerald-500 underline-offset-4 decoration-2 transition-colors'
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
