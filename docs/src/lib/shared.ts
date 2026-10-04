import { readFileSync } from 'node:fs';
import path from 'node:path';

export function getReporterVersion(): string {
  try {
    const pkgPath = path.resolve(process.cwd(), './package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string };
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

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
