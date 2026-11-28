import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { cacheLife, cacheTag } from 'next/cache';
import { gitConfig } from '@/lib/shared';
import type { GitHubSponsor } from '@/lib/sponsor';

const execFileAsync = promisify(execFile);

const FALLBACK_SPONSORS: GitHubSponsor[] = [
  {
    login: 'LambdaTest-Inc',
    name: 'TestMu AI',
    avatarUrl: 'https://avatars.githubusercontent.com/u/171592363?v=4',
    url: 'https://github.com/LambdaTest-Inc',
    monthlyPrice: 50,
  },
];

const SPONSORS_QUERY = `
  query Sponsors($login: String!, $cursor: String) {
    user(login: $login) {
      sponsorshipsAsMaintainer(first: 100, after: $cursor, activeOnly: true, includePrivate: false) {
        pageInfo { hasNextPage endCursor }
        nodes {
          tier { monthlyPriceInDollars }
          sponsorEntity {
            __typename
            ... on User { login name avatarUrl url }
            ... on Organization { login name avatarUrl url }
          }
        }
      }
    }
  }
`;

interface SponsorEntity {
  login?: string;
  name?: string | null;
  avatarUrl?: string;
  url?: string;
}

interface SponsorsResponse {
  data?: {
    user?: {
      sponsorshipsAsMaintainer?: {
        pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
        nodes?: Array<{
          tier?: { monthlyPriceInDollars?: number | null } | null;
          sponsorEntity?: SponsorEntity | null;
        } | null>;
      } | null;
    } | null;
  };
  errors?: unknown[];
}

function githubHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'multiple-cucumber-html-reporter-docs',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function readGitHubToken(): Promise<string | undefined> {
  const fromEnv = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL || process.env.CI) return undefined;

  try {
    const { stdout } = await execFileAsync('gh', ['auth', 'token'], { timeout: 4000 });
    const token = stdout.trim();
    return token || undefined;
  } catch {
    return undefined;
  }
}

function toSponsor(entity: SponsorEntity, monthlyPrice: number | null): GitHubSponsor | null {
  if (!entity.login || !entity.avatarUrl || !entity.url) return null;
  return {
    login: entity.login,
    name: entity.name?.trim() || entity.login,
    avatarUrl: entity.avatarUrl,
    url: entity.url,
    monthlyPrice,
  };
}

async function loadSponsorsFromGraphQL(token: string): Promise<GitHubSponsor[]> {
  const sponsors: GitHubSponsor[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < 10; page += 1) {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        ...githubHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: SPONSORS_QUERY, variables: { login: gitConfig.user, cursor } }),
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new Error(`GitHub sponsors request failed (${response.status})`);

    const payload = (await response.json()) as SponsorsResponse;
    if (payload.errors?.length) throw new Error('GitHub sponsors query failed');

    const connection = payload.data?.user?.sponsorshipsAsMaintainer;
    for (const node of connection?.nodes ?? []) {
      const sponsor = node?.sponsorEntity
        ? toSponsor(node.sponsorEntity, node.tier?.monthlyPriceInDollars ?? null)
        : null;
      if (sponsor) sponsors.push(sponsor);
    }

    if (!connection?.pageInfo?.hasNextPage || !connection.pageInfo.endCursor) break;
    cursor = connection.pageInfo.endCursor;
  }

  return sponsors.sort(compareSponsors);
}

function parseCurrentSponsors(html: string): GitHubSponsor[] {
  const start = html.indexOf('Current sponsors');
  if (start === -1) throw new Error('Current sponsors section is missing');
  const end = html.indexOf('Past sponsors', start);
  const block = html.slice(start, end === -1 ? undefined : end);
  const sponsors: GitHubSponsor[] = [];
  const pattern = /data-hovercard-url="\/users\/([A-Za-z0-9-]+)\/hovercard"[\s\S]{0,500}?src="([^"]+)"/g;

  for (const match of block.matchAll(pattern)) {
    const login = match[1];
    if (!login || login === gitConfig.user) continue;
    const avatarUrl = match[2]?.replaceAll('&amp;', '&');
    if (!avatarUrl) continue;
    sponsors.push({
      login,
      name: login,
      avatarUrl,
      url: `https://github.com/${login}`,
      monthlyPrice: null,
    });
  }

  return sponsors;
}

async function enrichSponsor(sponsor: GitHubSponsor, token?: string): Promise<GitHubSponsor> {
  try {
    const response = await fetch(`https://api.github.com/users/${sponsor.login}`, {
      headers: githubHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return sponsor;
    const profile = (await response.json()) as { name?: string | null; avatar_url?: string; html_url?: string };
    return {
      ...sponsor,
      name: profile.name?.trim() || sponsor.name,
      avatarUrl: profile.avatar_url || sponsor.avatarUrl,
      url: profile.html_url || sponsor.url,
    };
  } catch {
    return sponsor;
  }
}

async function loadPublicSponsors(token?: string): Promise<GitHubSponsor[]> {
  const response = await fetch(`https://github.com/sponsors/${gitConfig.user}`, {
    headers: {
      Accept: 'text/html',
      'User-Agent': 'Mozilla/5.0 (compatible; multiple-cucumber-html-reporter-docs)',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`GitHub sponsors page failed (${response.status})`);

  const sponsors = parseCurrentSponsors(await response.text());
  return Promise.all(sponsors.map((sponsor) => enrichSponsor(sponsor, token)));
}

async function loadSponsors(): Promise<GitHubSponsor[]> {
  const token = await readGitHubToken();
  if (token) {
    try {
      return await loadSponsorsFromGraphQL(token);
    } catch {
      return loadPublicSponsors(token);
    }
  }
  return loadPublicSponsors();
}

async function getCachedSponsors(): Promise<GitHubSponsor[]> {
  'use cache';
  cacheLife('days');
  cacheTag('github-sponsors');
  return loadSponsors();
}

function compareSponsors(left: GitHubSponsor, right: GitHubSponsor): number {
  const priceDelta = (right.monthlyPrice ?? -1) - (left.monthlyPrice ?? -1);
  if (priceDelta !== 0) return priceDelta;
  return left.name.localeCompare(right.name);
}

/** Current public GitHub Sponsors. Cached for one day. */
export async function getSponsors(): Promise<GitHubSponsor[]> {
  try {
    return await getCachedSponsors();
  } catch {
    return FALLBACK_SPONSORS;
  }
}
