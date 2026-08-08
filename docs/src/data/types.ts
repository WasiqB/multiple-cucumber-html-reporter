export interface LinkData {
  label: string;
  url: string;
}

export interface ImageLinks {
  featureListMetadata: string;
  featureCharts1: string;
  featureCharts2: string;
  featureListTable: string;
  featureListPage: string;
  featureDetailMetadata: string;
  featureDetailChart: string;
  featureDetailPage: string;
  scenarioListTable: string;
  scenarioSuccess: string;
  scenarioFailed: string;
  scenarioPending: string;
  scenarioUndefined: string;
  scenarioAmbiguous: string;
  attachErrorLog: string;
  attachLog: string;
  attachScreenshot: string;
  attachJson: string;
  attachVideo: string;
  reportHeader: string;
  reportFooter: string;
  legacyAttachment: string;
}

export interface StatItem {
  label: string;
  value: string;
  description?: string;
  icon?: string;
}

export interface ProjectStats {
  stats: StatItem[];
}

// ----------------------------------
// Showcase Data
// ----------------------------------
export interface ShowcaseVerifiedProjects {
  label: string;
  count: string;
}

export interface ShowcaseHero {
  badge?: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  primaryLink?: LinkData;
  secondaryLink?: LinkData;
  verifiedProjects?: ShowcaseVerifiedProjects;
  image: string;
}

export interface ShowcaseProject {
  icon: string;
  name: string;
  framework: string;
  description: string;
  url: string;
  authors?: string[];
  moreAuthors?: string;
  stars: string;
  forks: string;
}

export interface ShowcaseData {
  hero: ShowcaseHero;
  filters: string[];
  projects: ShowcaseProject[];
}
