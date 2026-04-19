import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className='flex flex-col items-center justify-center leading-[0.8] py-1 select-none group cursor-default'>
          <span className='text-[10px] font-black uppercase tracking-[0.45em] text-emerald-600/80 dark:text-emerald-400/80 group-hover:text-emerald-500 transition-colors duration-300'>
            multiple
          </span>
          <span className='text-xl font-black tracking-tighter text-slate-900 dark:text-slate-100'>
            Cucumber<span className='text-emerald-500'>HTML</span>
          </span>
          <span className='text-[10px] font-black uppercase tracking-[0.62em] text-emerald-600/80 dark:text-emerald-400/80 group-hover:text-emerald-500 transition-colors duration-300'>
            reporter
          </span>
        </div>
      ),
      transparentMode: 'top',
    },
    links: [
      // {
      //   text: 'Features',
      //   url: '/features',
      //   active: 'nested-url',
      // },
      // {
      //   text: 'How it Works',
      //   url: '/how-it-works',
      //   active: 'nested-url',
      // },
      // {
      //   text: 'Community',
      //   url: '/community',
      //   active: 'nested-url',
      // },
      // {
      //   text: 'Sponsors',
      //   url: '/sponsors',
      //   active: 'nested-url',
      // },
      {
        text: 'Documentation',
        url: '/docs',
        active: 'nested-url',
      },
      // {
      //   text: 'Showcase',
      //   url: '/showcase',
      //   active: 'nested-url',
      // },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
