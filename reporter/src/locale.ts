import path, { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import type { Logger } from './logger.js';
import type { SupportedLanguage } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface LocaleHeader {
  reportName: string;
  insightsSubtitle: string;
}

export interface LocaleDashboard {
  featuresStatus: string;
  scenariosStatus: string;
  stepsStatus: string;
  deviceOs: string;
  browsers: string;
  top10Tags: string;
  featuresStatusTrend: string;
  featuresOverview: string;
  searchFeaturesPlaceholder: string;
  filterByTags: string;
  show: string;
  featureName: string;
  environment: string;
  stepsStatusCol: string;
  passPercentCol: string;
  durationCol: string;
  wallClock: string;
  noFeatureFound: string;
  adjustFilters: string;
  showing: string;
  to: string;
  of: string;
  entries: string;
  tags: string;
  clear: string;
}

export interface LocaleFeature {
  dashboardBreadcrumb: string;
  featureDetailBreadcrumb: string;
  scenarioDistribution: string;
  top10SlowestScenarios: string;
  top10SlowestSteps: string;
  stepStatusBreakdown: string;
  stepsPerScenarios: string;
  scenarios: string;
  searchScenariosPlaceholder: string;
  noScenarioFound: string;
  description: string;
  showInfo: string;
  screenshot: string;
  video: string;
  attachment: string;
  attachments: string;
  errorDetails: string;
  previewNotAvailable: string;
  download: string;
  recordingOf: string;
  screenshotName: string;
  videoName: string;
  htmlName: string;
  jsonName: string;
  attachmentName: string;
  logName: string;
}

export interface LocaleStatus {
  passed: string;
  failed: string;
  ambiguous: string;
  notDefined: string;
  pending: string;
  skipped: string;
  other: string;
  all: string;
  total: string;
  features: string;
  scenarios: string;
  steps: string;
  notAvailable: string;
}

export interface LocaleRunInfo {
  project: string;
  projectAndRelease: string;
  release: string;
  testCycle: string;
  build: string;
  environment: string;
  ciPipeline: string;
  executionPeriod: string;
  duration: string;
  username: string;
  nodeVersion: string;
  reportVersion: string;
  hostname: string;
  machineArch: string;
  runningLocally: string;
  runningOnBrowserStack: string;
  runningOnTestMu: string;
  localMachine: string;
  desktop: string;
}

export interface LocaleModal {
  attachment: string;
  failedToLoadImage: string;
  videoNotSupported: string;
  consoleLog: string;
  copyLog: string;
  errorDetailsAndStackTrace: string;
  copyError: string;
  copied: string;
}

export interface LocaleEmail {
  executiveSummary: string;
  executionDate: string;
  totalDuration: string;
  featuresSummary: string;
  scenariosSummary: string;
  pass: string;
  progress: string;
  featuresAndScenarioStatistics: string;
  featureCol: string;
  top5SlowestScenarios: string;
  scenario: string;
  feature: string;
  status: string;
  duration: string;
}

export interface LocaleFooter {
  generatedBy: string;
  builtWith: string;
}

export interface LocaleTranslations {
  direction: 'ltr' | 'rtl';
  htmlLang: string;
  header: LocaleHeader;
  dashboard: LocaleDashboard;
  feature: LocaleFeature;
  status: LocaleStatus;
  runInfo: LocaleRunInfo;
  modal: LocaleModal;
  email: LocaleEmail;
  footer: LocaleFooter;
}

/**
 * `pt` is Brazilian Portuguese. `normalizeLanguage` keeps only the base tag,
 * so `pt-BR` and `pt-PT` both resolve to this catalog. A separate European
 * Portuguese file cannot be selected until that narrowing is changed.
 */
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['en', 'es', 'fr', 'pt', 'ar'] as const;

/**
 * Normalizes user-supplied language code to a supported language code,
 * or returns undefined if unsupported.
 */
export function normalizeLanguage(lang?: string): SupportedLanguage | undefined {
  if (!lang || typeof lang !== 'string') {
    return undefined;
  }
  const clean = lang.trim().toLowerCase().split(/[-_]/)[0];
  if (SUPPORTED_LANGUAGES.includes(clean as SupportedLanguage)) {
    return clean as SupportedLanguage;
  }
  return undefined;
}

/**
 * Like {@link normalizeLanguage}, but throws for a value that matches nothing.
 *
 * Used for the `--language` flag so it follows the same rule as the API and config
 * file (case-insensitive, `pt-BR` narrows to `pt`) while a typo still fails loudly
 * instead of silently producing an English report.
 */
export function parseLanguage(value: string): SupportedLanguage {
  const language = normalizeLanguage(value);
  if (!language) {
    throw new Error(`Unsupported language "${value}". Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}.`);
  }
  return language;
}

/**
 * Loads the translation dictionary for the given language.
 * Falls back to 'en' (English) if the language is unsupported or omitted.
 */
export function loadLocale(language?: SupportedLanguage | string, logger?: Logger): LocaleTranslations {
  const normalized = normalizeLanguage(language);
  const targetLang: SupportedLanguage = normalized ?? 'en';

  if (language && !normalized && logger) {
    logger.warn(
      `Language '${language}' is not supported. Falling back to default 'en'. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}.`,
    );
  }

  const localesDir = resolve(__dirname, 'locales');
  const filePath = path.join(localesDir, `${targetLang}.json`);

  try {
    if (fs.existsSync(filePath)) {
      return fs.readJsonSync(filePath) as LocaleTranslations;
    }
  } catch (error) {
    if (logger) {
      logger.error(`Failed to load locale file for '${targetLang}' from ${filePath}.`, { error });
    }
  }

  // Fallback to English file or inline default
  const enPath = path.join(localesDir, 'en.json');
  if (fs.existsSync(enPath)) {
    return fs.readJsonSync(enPath) as LocaleTranslations;
  }

  throw new Error(`Default locale file 'en.json' could not be found at ${enPath}.`);
}
