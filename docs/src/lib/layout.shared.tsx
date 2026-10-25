import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className='flex flex-col items-start justify-center leading-[0.8] py-1 select-none group cursor-default'>
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
      {
        type: 'menu',
        text: 'Learn',
        items: [
          {
            text: 'Features',
            description: 'Explore what the reporter can do',
            url: '/features',
          },
          {
            text: 'How it Works',
            description: 'Understand the internals step by step',
            url: '/how-it-works',
          },
          {
            text: 'Showcase',
            description: 'See real-world report examples',
            url: '/showcase',
          },
        ],
      },
      {
        type: 'menu',
        text: 'Docs',
        items: [
          {
            text: 'Documentation',
            description: 'Full API reference and guides',
            url: '/docs',
          },
          {
            text: 'Config Builder',
            description: 'Visually build your config file',
            url: '/config-builder',
          },
        ],
      },
      {
        type: 'menu',
        text: 'Connect',
        items: [
          {
            text: 'Sponsors',
            description: 'Support the project',
            url: '/sponsors',
          },
          {
            text: 'Community',
            description: 'Join the conversation',
            url: '/community',
          },
        ],
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
