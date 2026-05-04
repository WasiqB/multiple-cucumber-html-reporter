export const appName = 'Multiple CucumberHTML Reporter';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'WasiqB',
  repo: 'multiple-cucumber-html-reporter',
  branch: 'main',
};

export const isProd = process.env.VERCEL_ENV === 'production';

export const baseUrl =
  process.env.NODE_ENV === 'development' || !process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL('http://localhost:3000')
    : new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
