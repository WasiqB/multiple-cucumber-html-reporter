import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen, Heart, MonitorPlay, Sparkles, Users, Workflow, Wrench } from 'lucide-react';
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
        text: 'Explore',
        items: [
          {
            text: 'Features',
            description: 'Explore what the reporter can do',
            url: '/features',
            icon: <Sparkles />,
          },
          {
            text: 'How it Works',
            description: 'Understand the basic usage step by step',
            url: '/how-it-works',
            icon: <Workflow />,
          },
          {
            text: 'Showcase',
            description: 'See real-world report users',
            url: '/showcase',
            icon: <MonitorPlay />,
          },
        ],
      },
      {
        type: 'menu',
        text: 'Build',
        items: [
          {
            text: 'Get Started',
            description: 'Full reporter documentation guides',
            url: '/docs',
            icon: <BookOpen />,
          },
          {
            text: 'Config Builder',
            description: 'Visually build your config file',
            url: '/config-builder',
            icon: <Wrench />,
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
            icon: <Heart />,
          },
          {
            text: 'Community',
            description: 'Join the conversation',
            url: '/community',
            icon: <Users />,
          },
        ],
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
