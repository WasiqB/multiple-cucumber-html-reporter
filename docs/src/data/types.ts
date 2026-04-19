export interface LinkData {
  label: string;
  url: string;
}

export interface ImageLinks {
  images: LinkData[];
}

// ----------------------------------
// Home Data
// ----------------------------------
export interface HomeHero {
  badge?: string;
  titleLine1: string;
  titleLine2?: string;
  description?: string;
  primaryLink?: LinkData;
  secondaryLink?: LinkData;
  image?: string;
}

export interface HomeFeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface HomeFeatures {
  title: string;
  description: string;
  items: HomeFeatureItem[];
}

export interface HomeSetup {
  titleLine1?: string;
  titleLine2?: string;
  description: string;
  link?: LinkData;
  code: string;
}

export interface HomeCommunityItem {
  icon: string;
  color: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

export interface HomeCommunity {
  title: string;
  items: HomeCommunityItem[];
}

export interface HomeCompany {
  name: string;
  className?: string;
}

export interface HomeTrustedBy {
  title: string;
  companies: HomeCompany[];
}

export interface HomeData {
  hero: HomeHero;
  features: HomeFeatures;
  setup: HomeSetup;
  community: HomeCommunity;
  trustedBy: HomeTrustedBy;
}

// ----------------------------------
// How It Works Data
// ----------------------------------
export interface HowItWorksHero {
  titleLine1: string;
  titleLine2: string;
  description: string;
}

export interface HowItWorksStep {
  number: number;
  title: string;
  description: string;
  badges?: string[];
  checklist?: string[];
  codeHtml?: string;
  command?: string;
  commandStatus?: string;
}

export interface HowItWorksAnalysisCard {
  icon: string;
  title: string;
  description: string;
}

export interface HowItWorksAnalysis {
  stepNumber: number;
  title: string;
  description: string;
  cards: HowItWorksAnalysisCard[];
  image?: string;
}

export interface HowItWorksCiCd {
  stepNumber: number;
  title: string;
  description: string;
  platforms: string[];
}

export interface HowItWorksData {
  hero: HowItWorksHero;
  steps: HowItWorksStep[];
  analysis: HowItWorksAnalysis;
  cicd: HowItWorksCiCd;
}

// ----------------------------------
// Features Data
// ----------------------------------
export interface FeaturesHero {
  badge?: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  primaryLink?: LinkData;
  secondaryLink?: LinkData;
  image?: string;
}

export interface FeaturesCard {
  icon: string;
  title: string;
  description: string;
  type?: string;
  linkText?: string;
  linkUrl?: string;
}

export interface FeaturesDeveloperFirst {
  icon: string;
  title: string;
  description: string;
  code?: string;
}

export interface FeaturesPrecision {
  title: string;
  description: string;
  cards: FeaturesCard[];
  developerFirst?: FeaturesDeveloperFirst;
}

export interface FeaturesPreviewFeature {
  name: string;
  time: string;
  status: 'passed' | 'failed';
}

export interface FeaturesPreviewStats {
  total: string;
  passed: string;
  duration: string;
}

export interface FeaturesPreview {
  title: string;
  description: string;
  stats: FeaturesPreviewStats;
  features: FeaturesPreviewFeature[];
}

export interface FeaturesUpgradeRow {
  feature: string;
  standard: string;
  improved: string;
}

export interface FeaturesUpgrade {
  title: string;
  rows: FeaturesUpgradeRow[];
}

export interface FeaturesCta {
  title: string;
  description: string;
  primaryLink?: LinkData;
  secondaryLink?: LinkData;
}

export interface FeaturesData {
  hero: FeaturesHero;
  precision: FeaturesPrecision;
  preview: FeaturesPreview;
  upgrade: FeaturesUpgrade;
  cta: FeaturesCta;
}

// ----------------------------------
// Community Data
// ----------------------------------
export interface CommunityHero {
  badge?: string;
  titleLine1: string;
  titleLine2?: string;
  titleLine3?: string;
  description: string;
  primaryLink?: LinkData;
  secondaryLink?: LinkData;
}

export interface CommunitySupportItem {
  icon: string;
  title: string;
  description: string;
  linkText: string;
  href: string;
}

export interface CommunitySupportChannels {
  title: string;
  description: string;
  items: CommunitySupportItem[];
}

export interface CommunityContributing {
  title: string;
  description: string;
  primaryLink?: LinkData;
  secondaryLink?: LinkData;
  code?: string;
}

export interface CommunitySpotlightItem {
  name: string;
  role: string;
}

export interface CommunitySpotlight {
  title: string;
  description: string;
  items: CommunitySpotlightItem[];
}

export interface CommunityEventUrl {
  text: string;
  url: string;
}

export interface CommunityEvent {
  month?: string;
  day?: string;
  title: string;
  description: string;
  link?: CommunityEventUrl;
  status?: string;
}

export interface CommunityUpdate {
  category: string;
  title: string;
  description: string;
  type?: string;
  link?: CommunityEventUrl;
}

export interface CommunityEventsAndUpdates {
  eventsTitle: string;
  events: CommunityEvent[];
  updatesTitle: string;
  updates: CommunityUpdate[];
}

export interface CommunityData {
  hero: CommunityHero;
  supportChannels: CommunitySupportChannels;
  contributing: CommunityContributing;
  spotlight: CommunitySpotlight;
  eventsAndUpdates: CommunityEventsAndUpdates;
}

// ----------------------------------
// Sponsors Data
// ----------------------------------
export interface SponsorsHero {
  titleLine1: string;
  titleLine2?: string;
  description: string;
  action?: {
    text: string;
    href: string;
  };
}

export interface SponsorsBenefit {
  icon: string;
  title: string;
  description: string;
  type: string;
}

export interface SponsorsTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  button: string;
  href: string;
  type: string;
}

export interface SponsorsTiers {
  title: string;
  description: string;
  items: SponsorsTier[];
}

export interface SponsorsCuratorGroup {
  name: string;
  image?: string;
  url?: string;
}

export interface SponsorsCurators {
  title: string;
  description: string;
  goldSponsors?: SponsorsCuratorGroup[];
  silverAndBronze?: SponsorsCuratorGroup[];
  individuals?: SponsorsCuratorGroup[];
  moreCount?: string;
}

export interface SponsorsFaqItem {
  question: string;
  answer: string;
}

export interface SponsorsFaq {
  title: string;
  items: SponsorsFaqItem[];
}

export interface SponsorsCta {
  title: string;
  primaryLink?: LinkData;
  secondaryLink?: LinkData;
}

export interface SponsorsData {
  hero: SponsorsHero;
  benefits: SponsorsBenefit[];
  tiers: SponsorsTiers;
  curators: SponsorsCurators;
  faq: SponsorsFaq;
  cta: SponsorsCta;
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
