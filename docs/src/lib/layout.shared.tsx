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
    links: [],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
