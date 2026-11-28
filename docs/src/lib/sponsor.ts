export interface GitHubSponsor {
  login: string;
  name: string;
  avatarUrl: string;
  url: string;
  /** Null when the public sponsors page does not include a tier. */
  monthlyPrice: number | null;
}

export type SponsorGroup = 'gold' | 'silver' | 'backer';

/** Drop a trailing parenthetical so long GitHub display names fit under an avatar. */
export function sponsorLabel(name: string): string {
  const shortened = name.replace(/\s*\([^)]*\)\s*$/, '').trim();
  return shortened || name;
}

export function sponsorGroup(monthlyPrice: number | null): SponsorGroup | 'current' {
  if (monthlyPrice === null) return 'current';
  if (monthlyPrice >= 350) return 'gold';
  if (monthlyPrice >= 50) return 'silver';
  return 'backer';
}
