import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center font-bold">
          Cucumber<span className="text-emerald-500 dark:text-emerald-400">HTML</span>
        </span>
      ),
      transparentMode: 'top',
      children: <ThemeToggle />,
    },
    links: [
      {
        text: 'Features',
        url: '/#features',
      },
      {
        text: 'How it Works',
        url: '/#how-it-works',
      },
      {
        text: 'Community',
        url: '/#community',
      },
      {
        text: 'Docs',
        url: '/docs',
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
