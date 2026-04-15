import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className='flex items-center font-bold'>
          Cucumber<span className='text-emerald-500 dark:text-emerald-400'>HTML</span>
        </span>
      ),
      transparentMode: 'top',
    },
    links: [
      {
        text: 'Features',
        url: '/#features',
        active: 'nested-url',
      },
      {
        text: 'How it Works',
        url: '/how-it-works',
        active: 'nested-url',
      },
      {
        text: 'Community',
        url: '/#community',
        active: 'nested-url',
      },
      {
        text: 'Docs',
        url: '/docs',
        active: 'nested-url',
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
