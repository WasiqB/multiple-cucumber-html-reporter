'use client';

import { Building2, ExternalLink, Globe, PlusCircle, Search, Sparkles, User, Users } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import { buttonVariants } from '@/components/ui/button';
import showcaseDataJson from '@/data/showcase.json';
import type { ShowcaseData, ShowcaseEntity } from '@/data/types';
import { cn } from '@/lib/cn';

export default function ShowcasePage() {
  const { hero, companies = [], users = [], applyLink } = showcaseDataJson as ShowcaseData;

  const [activeCategory, setActiveCategory] = useState<'all' | 'companies' | 'users'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      return (
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [companies, searchQuery]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [users, searchQuery]);

  const showCompanies = activeCategory === 'all' || activeCategory === 'companies';
  const showUsers = activeCategory === 'all' || activeCategory === 'users';
  const totalResults = (showCompanies ? filteredCompanies.length : 0) + (showUsers ? filteredUsers.length : 0);
  const hasEntities = companies.length > 0 || users.length > 0;

  const googleFormUrl = applyLink?.url || hero?.primaryLink?.url || 'https://forms.gle/cK13ZycS5wMSU6Hz5';

  return (
    <main className='flex flex-col gap-12 sm:gap-16 md:gap-24 pb-16 md:pb-20 overflow-x-hidden m-2 sm:m-4 md:m-8 lg:m-10'>
      {/* Hero Section */}
      {hero && (
        <section className='pt-8 sm:pt-16 md:pt-24 lg:pt-28 px-3 sm:px-6 flex flex-col items-center text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='max-w-3xl flex flex-col items-center w-full'
          >
            {hero.badge && (
              <div className='inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 border border-emerald-500/20'>
                <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                {hero.badge}
              </div>
            )}

            <h1 className='text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-3 sm:mb-6 text-balance text-zinc-900 dark:text-white'>
              {hero.titleLine1}{' '}
              {hero.titleLine2 && (
                <span className='text-emerald-600 dark:text-emerald-500'>
                  <br className='hidden sm:block' />
                  {hero.titleLine2}
                </span>
              )}
            </h1>

            <p className='text-sm sm:text-base md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-10 text-balance'>
              {hero.description}
            </p>

            <div className='flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 w-full sm:w-auto'>
              <Link
                href={googleFormUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'bg-emerald-700 hover:bg-emerald-800 text-white rounded-full px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base font-bold transition-all shadow-lg w-full sm:w-auto justify-center group',
                )}
              >
                <PlusCircle className='mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:rotate-90 duration-300' />
                {hero.primaryLink?.label || 'Submit Your Application'}
                <ExternalLink className='ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-70' />
              </Link>
              {hero.secondaryLink && (
                <Link
                  href={hero.secondaryLink.url}
                  className={cn(
                    buttonVariants({ variant: 'secondary', size: 'lg' }),
                    'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-full px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base font-semibold w-full sm:w-auto justify-center',
                  )}
                >
                  {hero.secondaryLink.label}
                </Link>
              )}
            </div>
          </motion.div>
        </section>
      )}

      {/* Main Content Area - Only rendered when companies or users exist */}
      {hasEntities && (
        <section className='container mx-auto px-3 sm:px-6 max-w-7xl'>
          {/* Controls: Search, Entity Filter */}
          <div className='flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4 mb-8 sm:mb-14'>
            {/* Category Toggle: All / Companies / Users */}
            <div className='inline-flex p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full self-stretch md:self-auto overflow-x-auto no-scrollbar'>
              <button
                type='button'
                onClick={() => setActiveCategory('all')}
                className={cn(
                  'flex-1 md:flex-initial px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap',
                  activeCategory === 'all'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
                )}
              >
                <Sparkles className='h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0' />
                <span>All ({companies.length + users.length})</span>
              </button>
              <button
                type='button'
                onClick={() => setActiveCategory('companies')}
                className={cn(
                  'flex-1 md:flex-initial px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap',
                  activeCategory === 'companies'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
                )}
              >
                <Building2 className='h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0' />
                <span>Companies ({companies.length})</span>
              </button>
              <button
                type='button'
                onClick={() => setActiveCategory('users')}
                className={cn(
                  'flex-1 md:flex-initial px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap',
                  activeCategory === 'users'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
                )}
              >
                <Users className='h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0' />
                <span>Users ({users.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className='relative w-full md:w-80'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search companies, users, role...'
                className='w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full py-2.5 pl-11 pr-4 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-xs transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400'
              />
            </div>
          </div>

          {/* Empty Search State */}
          {totalResults === 0 && (
            <div className='text-center py-16 sm:py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 mb-12 sm:mb-16 px-4'>
              <p className='text-zinc-600 dark:text-zinc-400 font-medium mb-4 text-sm sm:text-base'>
                No companies or users found matching your search.
              </p>
              <Link
                href={googleFormUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={cn(
                  buttonVariants({ size: 'default' }),
                  'bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-bold text-xs sm:text-sm',
                )}
              >
                Submit an Application
              </Link>
            </div>
          )}

          {/* 1. Companies Section (Displayed First) */}
          {showCompanies && filteredCompanies.length > 0 && (
            <div className='mb-12 sm:mb-20'>
              <div className='flex items-center justify-between mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-2'>
                <div className='flex items-center gap-2.5 sm:gap-3'>
                  <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0'>
                    <Building2 className='h-4 w-4 sm:h-5 sm:w-5' />
                  </div>
                  <div>
                    <h2 className='text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Companies</h2>
                    <p className='text-[11px] sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 sm:line-clamp-none'>
                      Organizations scaling their test reporting infrastructure
                    </p>
                  </div>
                </div>
                <span className='text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full shrink-0'>
                  {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'}
                </span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                {filteredCompanies.map((company, idx) => (
                  <EntityCard key={idx} entity={company} isCompany />
                ))}
              </div>
            </div>
          )}

          {/* 2. Individual Users Section (Displayed Second) */}
          {showUsers && filteredUsers.length > 0 && (
            <div className='mb-12 sm:mb-20'>
              <div className='flex items-center justify-between mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-2'>
                <div className='flex items-center gap-2.5 sm:gap-3'>
                  <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold shrink-0'>
                    <Users className='h-4 w-4 sm:h-5 sm:w-5' />
                  </div>
                  <div>
                    <h2 className='text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Individual Users</h2>
                    <p className='text-[11px] sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 sm:line-clamp-none'>
                      Automation engineers, QA leads, and developers using the reporter
                    </p>
                  </div>
                </div>
                <span className='text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full shrink-0'>
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                </span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                {filteredUsers.map((user, idx) => (
                  <EntityCard key={idx} entity={user} isCompany={false} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Submit Application Callout */}
      <section className='container mx-auto px-3 sm:px-6 max-w-7xl mt-4 sm:mt-8'>
        <div className='bg-zinc-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-16 border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8'>
          <div className='absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none' />

          <div className='max-w-xl z-10'>
            <div className='inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4 border border-emerald-500/30'>
              <PlusCircle className='h-3.5 w-3.5' /> Join the Showcase
            </div>
            <h2 className='text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3'>
              Are you or your company using Multiple CucumberHTML Reporter?
            </h2>
            <p className='text-zinc-400 text-xs sm:text-sm md:text-base leading-relaxed'>
              We would love to feature your team on this showcase! Fill out our brief Google Form application to get
              listed with your website, GitHub, or LinkedIn.
            </p>
          </div>

          <div className='z-10 shrink-0 w-full md:w-auto'>
            <Link
              href={googleFormUrl}
              target='_blank'
              rel='noopener noreferrer'
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-full px-6 sm:px-8 h-11 sm:h-12 text-xs sm:text-base shadow-xl w-full sm:w-auto justify-center group',
              )}
            >
              Submit Application
              <ExternalLink className='ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function EntityCard({ entity, isCompany }: { entity: ShowcaseEntity; isCompany: boolean }) {
  // Determine available external links
  const links = [
    entity.website
      ? {
          url: entity.website,
          label: 'Website',
          icon: <Globe className='h-3.5 w-3.5' />,
        }
      : null,
    entity.github
      ? {
          url: entity.github,
          label: 'GitHub',
          icon: <FaGithub className='h-3.5 w-3.5' />,
        }
      : null,
    entity.linkedin
      ? {
          url: entity.linkedin,
          label: 'LinkedIn',
          icon: <FaLinkedin className='h-3.5 w-3.5' />,
        }
      : null,
    // fallback to entity.url if none of the specific links are present
    !entity.website && !entity.github && !entity.linkedin && entity.url
      ? {
          url: entity.url,
          label: isCompany ? 'Company' : 'Profile',
          icon: <ExternalLink className='h-3.5 w-3.5' />,
        }
      : null,
  ].filter(Boolean) as { url: string; label: string; icon: React.ReactNode }[];

  // Primary link for clicking name/logo if available
  const primaryHref = entity.website || entity.github || entity.linkedin || entity.url;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 md:p-7 flex flex-col shadow-xs hover:shadow-xl transition-all h-full group outline-none'
    >
      {/* Header */}
      <div className='flex items-start justify-between gap-3 mb-3 sm:mb-4'>
        <div className='flex items-center gap-3 sm:gap-3.5 min-w-0'>
          {entity.logo ? (
            <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0'>
              <Image
                src={entity.logo}
                alt={entity.name}
                width={48}
                height={48}
                className='w-full h-full object-cover'
              />
            </div>
          ) : (
            <div
              className={cn(
                'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 text-sm sm:text-base font-bold shadow-inner',
                isCompany
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20',
              )}
            >
              {isCompany ? entity.name[0] : <User className='h-4 w-4 sm:h-5 sm:w-5' />}
            </div>
          )}

          <div className='min-w-0'>
            {primaryHref ? (
              <Link
                href={primaryHref}
                target='_blank'
                rel='noopener noreferrer'
                className='font-bold text-sm sm:text-base md:text-lg text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate block'
              >
                {entity.name}
              </Link>
            ) : (
              <h3 className='font-bold text-sm sm:text-base md:text-lg text-zinc-900 dark:text-zinc-100 truncate'>
                {entity.name}
              </h3>
            )}
            {/* Display role only if provided (typically for users) */}
            {entity.role && (
              <span className='text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate block mt-0.5'>
                {entity.role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className='text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6 grow'>
        {entity.description}
      </p>

      {/* Footer / Links: Website, LinkedIn, GitHub */}
      {links.length > 0 && (
        <div className='flex flex-wrap items-center gap-2 mt-auto pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800'>
          {links.map((link, idx) => (
            <Link
              key={idx}
              href={link.url}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors'
              title={`${entity.name} on ${link.label}`}
            >
              {link.icon}
              <span className='text-[11px] sm:text-xs'>{link.label}</span>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}
