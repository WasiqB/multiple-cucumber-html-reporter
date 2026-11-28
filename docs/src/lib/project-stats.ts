import { cacheLife, cacheTag } from 'next/cache';
import type { ProjectStatSnapshot } from '@/lib/format-stat';
import { gitConfig } from '@/lib/shared';

const NPM_PACKAGE = 'multiple-cucumber-html-reporter';

/** Used only when a source fails. Fresh values replace these once the cache fills. */
const FALLBACK: ProjectStatSnapshot = {
  stars: 290,
  dependents: 6286,
  monthlyDownloads: 1_207_855,
  weeklyDownloads: 283_479,
};

interface GitHubRepository {
  stargazers_count?: number;
}

interface NpmDownloadPoint {
  downloads?: number;
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'multiple-cucumber-html-reporter-docs',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

async function fetchJson<T>(url: string, headers?: HeadersInit): Promise<T> {
  const response = await fetch(url, {
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return (await response.json()) as T;
}

async function loadGitHubStars(): Promise<number> {
  const repository = await fetchJson<GitHubRepository>(
    `https://api.github.com/repos/${gitConfig.user}/${gitConfig.repo}`,
    githubHeaders(),
  );
  if (!Number.isFinite(repository.stargazers_count)) throw new Error('GitHub star count is missing');
  return repository.stargazers_count as number;
}

async function loadGitHubDependents(): Promise<number> {
  const response = await fetch(
    `https://github.com/${gitConfig.user}/${gitConfig.repo}/network/dependents?dependent_type=REPOSITORY`,
    {
      headers: {
        Accept: 'text/html',
        'User-Agent': 'Mozilla/5.0 (compatible; multiple-cucumber-html-reporter-docs)',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    },
  );
  if (!response.ok) throw new Error(`GitHub dependents request failed (${response.status})`);

  const html = await response.text();
  const match = html.match(/([\d,]+)\s+Repositories/);
  const count = match ? Number(match[1].replaceAll(',', '')) : Number.NaN;
  if (!Number.isFinite(count)) throw new Error('GitHub dependents count is missing');
  return count;
}

async function loadNpmDownloads(range: 'last-week' | 'last-month'): Promise<number> {
  const payload = await fetchJson<NpmDownloadPoint>(`https://api.npmjs.org/downloads/point/${range}/${NPM_PACKAGE}`);
  if (!Number.isFinite(payload.downloads)) throw new Error(`npm ${range} downloads are missing`);
  return payload.downloads as number;
}

async function getCachedGitHubStars(): Promise<number> {
  'use cache';
  cacheLife('days');
  cacheTag('project-stats');
  return loadGitHubStars();
}

async function getCachedGitHubDependents(): Promise<number> {
  'use cache';
  cacheLife('days');
  cacheTag('project-stats');
  return loadGitHubDependents();
}

async function getCachedWeeklyDownloads(): Promise<number> {
  'use cache';
  cacheLife('days');
  cacheTag('project-stats');
  return loadNpmDownloads('last-week');
}

async function getCachedMonthlyDownloads(): Promise<number> {
  'use cache';
  cacheLife('days');
  cacheTag('project-stats');
  return loadNpmDownloads('last-month');
}

async function readStat(load: () => Promise<number>, fallback: number): Promise<number> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

/** GitHub stars, GitHub dependents, and npm downloads. Each source refreshes once a day. */
export async function getProjectStats(): Promise<ProjectStatSnapshot> {
  const [stars, dependents, weeklyDownloads, monthlyDownloads] = await Promise.all([
    readStat(getCachedGitHubStars, FALLBACK.stars),
    readStat(getCachedGitHubDependents, FALLBACK.dependents),
    readStat(getCachedWeeklyDownloads, FALLBACK.weeklyDownloads),
    readStat(getCachedMonthlyDownloads, FALLBACK.monthlyDownloads),
  ]);

  return { stars, dependents, weeklyDownloads, monthlyDownloads };
}
