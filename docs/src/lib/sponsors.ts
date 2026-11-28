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
          tier { name monthlyPriceInDollars }
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
          tier?: { name?: string | null; monthlyPriceInDollars?: number | null } | null;
          sponsorEntity?: SponsorEntity | null;
        } | null>;
      } | null;
    } | null;
  };
  errors?: unknown[];
}

type TokenSource = 'GITHUB_TOKEN' | 'GH_TOKEN' | 'gh-cli' | 'none';

/** Temporary preview-only logs. Remove after the sponsor tier debug. */
function debugSponsors(event: string, details: Record<string, unknown>): void {
  if (process.env.VERCEL_ENV !== 'preview') return;
  console.info(`[sponsors-debug] ${event}`, details);
}

function sponsorSummary(sponsors: GitHubSponsor[]): Array<{ login: string; monthlyPrice: number | null }> {
  return sponsors.map((sponsor) => ({ login: sponsor.login, monthlyPrice: sponsor.monthlyPrice }));
}

function githubHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'multiple-cucumber-html-reporter-docs',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function readGitHubToken(): Promise<{ token?: string; source: TokenSource }> {
  if (process.env.GITHUB_TOKEN) return { token: process.env.GITHUB_TOKEN, source: 'GITHUB_TOKEN' };
  if (process.env.GH_TOKEN) return { token: process.env.GH_TOKEN, source: 'GH_TOKEN' };
  if (process.env.VERCEL || process.env.CI) return { source: 'none' };

  try {
    const { stdout } = await execFileAsync('gh', ['auth', 'token'], { timeout: 4000 });
    const token = stdout.trim();
    return token ? { token, source: 'gh-cli' } : { source: 'none' };
  } catch {
    return { source: 'none' };
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
    if (!response.ok) {
      const body = (await response.text()).slice(0, 500);
      debugSponsors('graphql-http-error', { status: response.status, body });
      throw new Error(`GitHub sponsors request failed (${response.status})`);
    }

    const payload = (await response.json()) as SponsorsResponse;
    const connection = payload.data?.user?.sponsorshipsAsMaintainer;
    debugSponsors('graphql-response', {
      status: response.status,
      errors: payload.errors ?? null,
      user: payload.data?.user ? 'present' : 'missing',
      sponsors: (connection?.nodes ?? []).map((node) => ({
        login: node?.sponsorEntity?.login ?? null,
        tierName: node?.tier?.name ?? null,
        monthlyPriceInDollars: node?.tier?.monthlyPriceInDollars ?? null,
      })),
    });
    if (payload.errors?.length) throw new Error('GitHub sponsors query failed');

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
  const { token, source } = await readGitHubToken();
  debugSponsors('token', {
    source,
    present: Boolean(token),
    length: token?.length ?? 0,
    hasSurroundingWhitespace: Boolean(token && token !== token.trim()),
  });
  if (token) {
    try {
      const sponsors = await loadSponsorsFromGraphQL(token);
      debugSponsors('graphql-ok', { sponsors: sponsorSummary(sponsors) });
      return sponsors;
    } catch (error) {
      debugSponsors('graphql-failed', {
        message: error instanceof Error ? error.message : 'unknown',
      });
      const sponsors = await loadPublicSponsors(token);
      debugSponsors('public-fallback', { sponsors: sponsorSummary(sponsors) });
      return sponsors;
    }
  }
  const sponsors = await loadPublicSponsors();
  debugSponsors('public-only', { sponsors: sponsorSummary(sponsors) });
  return sponsors;
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
    const sponsors = await getCachedSponsors();
    debugSponsors('served', { source: 'cache', sponsors: sponsorSummary(sponsors) });
    return sponsors;
  } catch (error) {
    debugSponsors('served', {
      source: 'hardcoded-fallback',
      message: error instanceof Error ? error.message : 'unknown',
    });
    return FALLBACK_SPONSORS;
  }
}
