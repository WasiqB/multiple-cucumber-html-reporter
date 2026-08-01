import os from 'node:os';
import path, { dirname, join, resolve } from 'node:path';
import { pipeline as streamPipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { Liquid } from 'liquidjs';
import _ from 'lodash';
import { DateTime, Duration } from 'luxon';
import open from 'open';
import { v4 as uuid } from 'uuid';
import collectJSONS, { listJsonFiles } from './collect-jsons.js';
import { createLogger } from './logger.js';
import { applyMetadataAndHooks, enrichStepEmbeddings, escapeHtml, type MediaFileWriter } from './report-helpers.js';
import {
  createJsonArrayFileWriter,
  createJsonSuiteFileWriter,
  streamFeaturesFromFile,
} from './streaming/json-stream.js';
import type {
  CustomData,
  Feature,
  LoggingOptions,
  LogLevel,
  Metadata,
  Options,
  Scenario,
  Step,
  Suite,
} from './types.js';

const { size } = _;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const engine = new Liquid({
  root: join(__dirname, 'templates'),
  extname: '.liquid',
});

const INDEX_HTML = 'index.html';
const FEATURE_FOLDER = 'features';
const RESULT_STATUS = {
  passed: 'passed',
  failed: 'failed',
  skipped: 'skipped',
  pending: 'pending',
  notDefined: 'undefined',
  ambiguous: 'ambiguous',
};
const DEFAULT_REPORT_NAME = 'Multiple Cucumber HTML Reporter';

const projectRoot = path.resolve(__dirname);
const templatesDir = path.join(projectRoot, 'templates');
const packageJson = fs.readJsonSync(resolve(__dirname, '../package.json'));

const MEDIA_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'video/webm': 'webm',
};

/**
 * Creates a `MediaFileWriter` for `options.externalizeMedia` — writes
 * decoded image/video bytes to `<reportPath>/assets/media/<uuid>.<ext>`
 * (created once, reused for every attachment in the run) and returns the
 * relative path to use as the `src`, resolved from `<reportPath>/features/`
 * where feature pages live.
 */
function createMediaFileWriter(reportPath: string): MediaFileWriter {
  const mediaDir = resolve(reportPath, 'assets', 'media');
  fs.ensureDirSync(mediaDir);

  return {
    write(buffer: Buffer, mimeType: string): string {
      const extension = MEDIA_EXTENSION_BY_MIME_TYPE[mimeType] ?? 'bin';
      const filename = `${uuid()}.${extension}`;
      fs.writeFileSync(join(mediaDir, filename), buffer);
      return `../assets/media/${filename}`;
    },
  };
}

/**
 * Generates the cucumber report.
 *
 * @param options Report options.
 */
async function generateReport(options: Options) {
  if (!options) {
    throw new Error('Options need to be provided.');
  }

  if (!options.jsonDir) {
    throw new Error('A path which holds the JSON files should be provided.');
  }

  if (!options.reportPath) {
    throw new Error('An output path for the reports should be defined, no path was provided.');
  }

  const logger = createLogger(options.logging, options.disableLog);

  logger.info('Starting report generation.');
  logger.debug('Resolved report generation paths.', {
    cwd: process.cwd(),
    jsonDir: resolve(process.cwd(), options.jsonDir),
    reportPath: resolve(process.cwd(), options.reportPath),
  });

  // If metadata file path is provided, then load metadata from file.
  if (options.metadataFilePath) {
    const resolvedPath = resolve(process.cwd(), options.metadataFilePath);
    logger.debug('Loading metadata file.', { metadataFilePath: resolvedPath });
    options.metadataFilePath = resolvedPath;
    options.metadata = await loadMetadataFile(resolvedPath);
    logger.info('Loaded metadata file.', { metadataFilePath: resolvedPath });
  }

  const customMetadata = !!options.customMetadata;
  const customData = options.customData;
  const plainDescription = !!options.plainDescription;
  const customStyle = options.customStyle;
  const openReportInBrowser = !!options.openReportInBrowser;
  const reportName = options.reportName || DEFAULT_REPORT_NAME;
  const reportPath = resolve(process.cwd(), options.reportPath);
  const saveCollectedJSON = !!options.saveCollectedJSON;
  const displayDuration = !!options.displayDuration;
  const displayReportTime = !!options.displayReportTime;
  const displayChartPercentages = !!options.displayChartPercentages;
  const durationInMS = !!options.durationInMS;
  const durationAggregation = options.durationAggregation === 'wallClock' ? 'wallClock' : 'sum';
  const hideMetadata = !!options.hideMetadata;
  const pageTitle = options.pageTitle || DEFAULT_REPORT_NAME;
  const pageFooter = options.pageFooter || null;
  const useCDN = !!options.useCDN;
  const staticFilePath = !!options.staticFilePath;
  const externalizeMedia = !!options.externalizeMedia;
  const brandLogo = options.brandLogo;

  let logoPathName: string | undefined;
  if (brandLogo) {
    const resolvedLogoPath = resolve(process.cwd(), brandLogo);
    if (await fs.pathExists(resolvedLogoPath)) {
      logoPathName = `images/${path.basename(brandLogo)}`;
      logger.debug('Using brand logo.', { brandLogo: resolvedLogoPath });
    } else {
      logger.warn('Configured brand logo was not found.', { brandLogo: resolvedLogoPath });
    }
  }

  // Validate metadata format: array-form requires customMetadata: true
  if (Array.isArray(options.metadata) && !customMetadata) {
    throw new Error(
      `Invalid metadata format: you provided metadata as an array of { name, value } objects but did not set the "customMetadata" option to "true". Either change your metadata to a Metadata object / per-feature Record<string, Metadata>, or set "customMetadata: true" to enable custom key/value metadata.`,
    );
  }

  // Validate attachmentLayout: only "modal" and "inline" are recognised (unset defaults to "modal")
  if (
    options.attachmentLayout !== undefined &&
    options.attachmentLayout !== 'modal' &&
    options.attachmentLayout !== 'inline'
  ) {
    throw new Error(
      `Invalid attachmentLayout: "${options.attachmentLayout}". Expected "modal" or "inline" (or leave it unset to use the default, "modal").`,
    );
  }
  const attachmentLayout = options.attachmentLayout ?? 'modal';
  const modalBackdrop = options.modalBackdrop ?? true;
  const modalDraggable = options.modalDraggable ?? false;
  const modalResizable = options.modalResizable ?? false;
  const modalShowContext = options.modalShowContext ?? false;

  logger.debug('Ensuring report output folders exist.', {
    reportPath,
    featureFolder: resolve(reportPath, FEATURE_FOLDER),
  });
  fs.ensureDirSync(reportPath);
  fs.ensureDirSync(resolve(reportPath, FEATURE_FOLDER));

  const allFeatures: Feature[] = await collectJSONS(options);
  logger.info('Preparing report data.', { featureCount: allFeatures.length });

  const suite: Suite = {
    app: 0,
    customMetadata,
    customData,
    style: options.overrideStyle || 'styles.css',
    useCDN,
    hideMetadata,
    displayReportTime,
    displayDuration,
    displayChartPercentages,
    durationAggregation,
    durationColumnTitle: durationAggregation === 'wallClock' ? 'Duration (wall clock)' : 'Duration',
    browser: 0,
    name: '',
    version: 'version',
    time: new Date(),
    features: allFeatures,
    featureCount: {
      ambiguous: 0,
      failed: 0,
      passed: 0,
      notDefined: 0,
      pending: 0,
      skipped: 0,
      total: 0,
      ambiguousPercentage: 0,
      failedPercentage: 0,
      notDefinedPercentage: 0,
      pendingPercentage: 0,
      skippedPercentage: 0,
      passedPercentage: 0,
      steps: {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0,
      },
    },
    reportName,
    customStyle:
      customStyle && fs.pathExistsSync(resolve(process.cwd(), customStyle))
        ? fs.readFileSync(resolve(process.cwd(), customStyle), 'utf-8')
        : customStyle,
    scenarios: {
      failed: 0,
      ambiguous: 0,
      notDefined: 0,
      pending: 0,
      skipped: 0,
      passed: 0,
      total: 0,
    },
    totalTime: 0,
  };

  _parseFeatures(suite);
  logger.debug('Parsed feature statuses.', {
    passed: suite.featureCount.passed,
    failed: suite.featureCount.failed,
    skipped: suite.featureCount.skipped,
    pending: suite.featureCount.pending,
    undefined: suite.featureCount.notDefined,
    ambiguous: suite.featureCount.ambiguous,
  });

  // Percentages
  suite.featureCount.ambiguousPercentage = _calculatePercentage(suite.featureCount.ambiguous, suite.featureCount.total);
  suite.featureCount.failedPercentage = _calculatePercentage(suite.featureCount.failed, suite.featureCount.total);
  suite.featureCount.notDefinedPercentage = _calculatePercentage(
    suite.featureCount.notDefined,
    suite.featureCount.total,
  );
  suite.featureCount.pendingPercentage = _calculatePercentage(suite.featureCount.pending, suite.featureCount.total);
  suite.featureCount.skippedPercentage = _calculatePercentage(suite.featureCount.skipped, suite.featureCount.total);
  suite.featureCount.passedPercentage = _calculatePercentage(suite.featureCount.passed, suite.featureCount.total);

  /**
   * Calculate and return the percentage
   * @param {number} amount
   * @param {number} total
   * @return {string} percentage
   * @private
   */
  function _calculatePercentage(amount: number, total: number): string {
    return ((amount / total) * 100).toFixed(2);
  }

  function getReportRuntimeMetadata(suite: Suite) {
    // All features have been enriched with auto-detected defaults by collectJSONS,
    // so we just pick the first object-form metadata from the suite.
    const featureMetadata = suite.features.find((feature) => feature.metadata && !Array.isArray(feature.metadata))
      ?.metadata as Exclude<Metadata, Array<{ name: string; value: string }>> | undefined;

    return {
      username: featureMetadata?.username ?? os.userInfo().username,
      nodeVersion: featureMetadata?.nodeVersion ?? process.version,
      reportVersion: featureMetadata?.reportVersion ?? packageJson.version,
      architecture: featureMetadata?.architecture ?? os.arch(),
    };
  }

  function getCustomDataItems(customData: CustomData | undefined) {
    if (!customData) return undefined;

    const predefinedKeys = new Set([
      'username',
      'nodeVersion',
      'reportVersion',
      'hostname',
      'architecture',
      'projectName',
      'release',
      'testCycle',
      'buildNumber',
      'environment',
      'ciPipeline',
    ]);

    return Object.entries(customData)
      .filter(([key, value]) => !predefinedKeys.has(key) && value !== undefined && value !== null && value !== '')
      .map(([name, value]) => ({ name, value: String(value) }));
  }

  const customDataItems = getCustomDataItems(customData);

  logger.debug('Rendering report overview page.');
  await _createFeaturesOverviewIndexPage(suite);
  logger.debug('Rendering feature detail pages.');
  await _createFeatureIndexPages(suite);
  logger.debug('Writing report CSS assets.');
  await _createCssFile(suite);
  logger.debug('Writing report JavaScript assets.');
  await _createJsFiles();

  if (logger.level === 'trace') {
    logger.trace('Report output directory resolved.', { reportPath });
  }

  if (logger.level !== 'silent') {
    /* istanbul ignore else */
    logger.info('Report generated successfully.', { report: join(reportPath, INDEX_HTML) });
  }

  if (openReportInBrowser) {
    /* istanbul ignore if */
    const reportIndex = join(reportPath, INDEX_HTML);
    logger.info('Opening report in browser.', { report: reportIndex });
    open(reportIndex);
  }

  function _parseFeatures(suite: Suite) {
    suite.features.forEach((feature: Feature) => {
      _parseSingleFeature(suite, feature, true);
    });
  }

  /**
   * Derives all per-feature/scenario/step fields (counts, percentages,
   * duration, id, metadata shortcuts) for one feature. When `trackAggregates`
   * is true, also folds the feature into the suite-wide totals used by
   * index.html (featureCount, scenarios, totalTime, app/browser counters).
   * Feature pages (Pass 2, see `_createFeatureIndexPages`) call this once per
   * feature with `trackAggregates: false` — the suite totals are already
   * final from Pass 1 by then, and re-adding here would double-count them.
   * `mediaWriter`, when set, diverts image/video attachments to separate
   * files instead of inlining them (see `enrichStepEmbeddings`).
   */
  function _parseSingleFeature(
    suite: Suite,
    feature: Feature,
    trackAggregates: boolean,
    mediaWriter?: MediaFileWriter,
  ) {
    feature.scenarios = {
      passed: 0,
      failed: 0,
      notDefined: 0,
      skipped: 0,
      pending: 0,
      ambiguous: 0,
      passedPercentage: 0,
      failedPercentage: 0,
      notDefinedPercentage: 0,
      skippedPercentage: 0,
      pendingPercentage: 0,
      ambiguousPercentage: 0,
      total: 0,
    };
    feature.duration = 0;
    feature.time = '00:00:00.000';
    feature.isFailed = false;
    feature.isAmbiguous = false;
    feature.isSkipped = false;
    feature.isNotdefined = false;
    feature.isPending = false;
    feature.passed = 0;
    feature.failed = 0;
    feature.notDefined = 0;
    feature.skipped = 0;
    feature.pending = 0;
    feature.ambiguous = 0;
    feature.totalTime = 0;
    if (trackAggregates) {
      suite.featureCount.total++;
    }
    const idPrefix = staticFilePath ? '' : `${uuid()}.`;
    feature.id = `${idPrefix}${feature.id}`.replace(/[^a-zA-Z0-9-_]/g, '-');
    feature.app = '';
    feature.browser = '';

    if (feature.uri) {
      let uriPath = feature.uri;
      if (uriPath.startsWith('file://')) {
        uriPath = uriPath.substring(7);
      }
      if (path.isAbsolute(uriPath)) {
        feature.uri = path.relative(process.cwd(), uriPath);
      }
    }

    // Metadata shortcuts for templates
    if (feature.metadata) {
      if (Array.isArray(feature.metadata)) {
        // customMetadata: true path — array of { name, value } pairs.
        // Map well-known names to the feature's structured display fields so
        // that the Environment column and feature detail page show the right
        // icons/values. Matching is case-insensitive and checks common aliases.
        feature.metadata.forEach((item: any) => {
          const rawName = (item.name || item.label || '').trim();
          const label = rawName.toLowerCase();
          const value = item.value || '';
          if (!value) return;

          if (label === 'device') {
            feature.device = value;
          } else if (label === 'executionplatform' || label === 'execution platform' || label === 'platform type') {
            feature.executionPlatform = value as any;
          } else if (label === 'os' || label === 'platform' || label === 'operating system') {
            feature.os = value;
          } else if (label === 'browser') {
            feature.browser = value;
          } else if (label === 'app' || label === 'application') {
            feature.app = value;
          } else if (label === 'username' || label === 'user') {
            feature.username = value;
          }
        });
      } else {
        if (feature.metadata.device) feature.device = feature.metadata.device;
        if (feature.metadata.executionPlatform) feature.executionPlatform = feature.metadata.executionPlatform;
        if (feature.metadata.platform) {
          feature.os = `${feature.metadata.platform.name} ${feature.metadata.platform.version}`.trim();
        }
        if (feature.metadata.browser) {
          feature.browser = `${feature.metadata.browser.name} ${feature.metadata.browser.version}`.trim();
        }
        if (feature.metadata.app) {
          feature.app = `${feature.metadata.app.name} ${feature.metadata.app.version}`.trim();
        }
        if (feature.metadata.username) {
          feature.username = feature.metadata.username;
        }
      }
    }

    if (!feature.elements) {
      return;
    }

    _parseScenarios(feature, trackAggregates, mediaWriter);

    if (trackAggregates) {
      if (feature.isFailed) {
        suite.featureCount.failed++;
      } else if (feature.isAmbiguous) {
        suite.featureCount.ambiguous++;
      } else if (feature.isNotdefined) {
        suite.featureCount.notDefined++;
      } else if (feature.isPending) {
        suite.featureCount.pending++;
      } else if (feature.isSkipped) {
        suite.featureCount.skipped++;
      } else {
        suite.featureCount.passed++;
      }
    }

    if (feature.duration) {
      feature.totalTime += feature.duration;
      if (trackAggregates) {
        suite.totalTime += feature.duration;
      }
      feature.time = formatDuration(feature.duration);
    }

    // Check if browser / app is used
    if (trackAggregates && !Array.isArray(feature.metadata)) {
      suite.app = feature.metadata.app ? suite.app + 1 : suite.app;
      suite.browser = feature.metadata.browser ? suite.browser + 1 : suite.browser;
    }

    // Percentages
    feature.scenarios.ambiguousPercentage = _calculatePercentage(feature.scenarios.ambiguous, feature.scenarios.total);
    feature.scenarios.failedPercentage = _calculatePercentage(feature.scenarios.failed, feature.scenarios.total);
    feature.scenarios.notDefinedPercentage = _calculatePercentage(
      feature.scenarios.notDefined,
      feature.scenarios.total,
    );
    feature.scenarios.passedPercentage = _calculatePercentage(feature.scenarios.passed, feature.scenarios.total);
    feature.scenarios.pendingPercentage = _calculatePercentage(feature.scenarios.pending, feature.scenarios.total);
    feature.scenarios.skippedPercentage = _calculatePercentage(feature.scenarios.skipped, feature.scenarios.total);
    if (trackAggregates) {
      suite.scenarios.ambiguousPercentage = _calculatePercentage(suite.scenarios.ambiguous, suite.scenarios.total);
      suite.scenarios.failedPercentage = _calculatePercentage(suite.scenarios.failed, suite.scenarios.total);
      suite.scenarios.notDefinedPercentage = _calculatePercentage(suite.scenarios.notDefined, suite.scenarios.total);
      suite.scenarios.passedPercentage = _calculatePercentage(suite.scenarios.passed, suite.scenarios.total);
      suite.scenarios.pendingPercentage = _calculatePercentage(suite.scenarios.pending, suite.scenarios.total);
      suite.scenarios.skippedPercentage = _calculatePercentage(suite.scenarios.skipped, suite.scenarios.total);
    }
  }

  /**
   * Parse each scenario within a feature
   * @param {object} feature a feature with all the scenarios in it
   * @return {object} return the parsed feature
   * @private
   */
  function _parseScenarios(feature: Feature, trackAggregates: boolean, mediaWriter?: MediaFileWriter) {
    let earliestScenarioStart = Number.POSITIVE_INFINITY;
    let latestScenarioEnd = 0;
    let scenarioWithDurationCount = 0;
    let scenarioWithStartTimestampCount = 0;

    feature.elements.forEach((scenario: Scenario) => {
      scenario.duration = 0;
      scenario.time = '00:00:00.000';
      scenario.passed = 0;
      scenario.failed = 0;
      scenario.notDefined = 0;
      scenario.skipped = 0;
      scenario.pending = 0;
      scenario.ambiguous = 0;

      scenario = _parseSteps(scenario, trackAggregates, mediaWriter);

      if (scenario.duration > 0) {
        scenarioWithDurationCount++;
        feature.duration += scenario.duration;
        scenario.time = formatDuration(scenario.duration);

        if (durationAggregation === 'wallClock') {
          const scenarioStart = parseScenarioStartTime(scenario);
          if (scenarioStart !== null) {
            scenarioWithStartTimestampCount++;
            const scenarioEnd = scenarioStart + toMillis(scenario.duration);
            earliestScenarioStart = Math.min(earliestScenarioStart, scenarioStart);
            latestScenarioEnd = Math.max(latestScenarioEnd, scenarioEnd);
          }
        }
      }

      scenario.duration = toMillis(scenario.duration) / 1000;

      if (Object.hasOwn(scenario, 'description') && scenario.description) {
        scenario.description = scenario.description.replace(/\r?\n/g, '<br />');
      }

      if (scenario.type === 'background') {
        return;
      }

      if (scenario.failed > 0) {
        if (trackAggregates) {
          suite.scenarios.total++;
          suite.scenarios.failed++;
        }
        feature.isFailed = true;
        feature.failed++;
        feature.scenarios.total++;
        feature.scenarios.failed++;
        return;
      }

      if (scenario.ambiguous > 0) {
        if (trackAggregates) {
          suite.scenarios.total++;
          suite.scenarios.ambiguous++;
        }
        feature.isAmbiguous = true;
        feature.ambiguous++;
        feature.scenarios.total++;
        feature.scenarios.ambiguous++;
        return;
      }

      if (scenario.notDefined > 0) {
        if (trackAggregates) {
          suite.scenarios.total++;
          suite.scenarios.notDefined++;
        }
        feature.isNotdefined = true;
        feature.notDefined++;
        feature.scenarios.total++;
        feature.scenarios.notDefined++;
        return;
      }

      if (scenario.pending > 0) {
        if (trackAggregates) {
          suite.scenarios.total++;
          suite.scenarios.pending++;
        }
        feature.isPending = true;
        feature.pending++;
        feature.scenarios.total++;
        feature.scenarios.pending++;
        return;
      }

      if (scenario.skipped > 0) {
        if (trackAggregates) {
          suite.scenarios.total++;
        }
        if (scenario.pending > 0) {
          if (trackAggregates) {
            suite.scenarios.pending++;
          }
          feature.pending++;
          feature.scenarios.total++;
          feature.scenarios.pending++;
          return;
        }
        if (trackAggregates) {
          suite.scenarios.skipped++;
        }
        feature.skipped++;
        feature.scenarios.total++;
        feature.scenarios.skipped++;
        return;
      }

      /* istanbul ignore else */
      if (scenario.passed && scenario.passed > 0) {
        if (trackAggregates) {
          suite.scenarios.total++;
          suite.scenarios.passed++;
        }
        feature.passed++;
        feature.scenarios.total++;
        feature.scenarios.passed++;
        return;
      }
    });

    if (
      durationAggregation === 'wallClock' &&
      scenarioWithDurationCount > 0 &&
      scenarioWithStartTimestampCount === scenarioWithDurationCount &&
      latestScenarioEnd > earliestScenarioStart
    ) {
      feature.duration = fromMillis(latestScenarioEnd - earliestScenarioStart);
    }

    feature.isPending = feature.scenarios.total === feature.scenarios.pending;
    feature.isSkipped =
      feature.scenarios.total === Number(feature.scenarios.skipped) + Number(feature.scenarios.pending);

    return feature;
  }

  /**
   * Parse all the scenario steps and enrich them with the correct data
   * @param {Scenario} scenario Preparsed scenario
   * @return {Scenario} A parsed scenario
   * @private
   */
  function _parseSteps(scenario: Scenario, trackAggregates: boolean, mediaWriter?: MediaFileWriter): Scenario {
    scenario.steps.forEach((step: Step) => {
      enrichStepEmbeddings(step, mediaWriter);

      if (step.doc_string !== undefined) {
        step.id = `${uuid()}.${scenario.id}.${step.name}`.replace(/[^a-zA-Z0-9-_]/g, '-');
        step.restWireData = escapeHtml(step.doc_string.value).replace(/\r?\n/g, '<br />');
      }
      if (step.result.status === RESULT_STATUS.pending) {
        scenario.pending = (scenario.pending || 0) + 1;
        return;
      }

      if (step.result.status === RESULT_STATUS.skipped) {
        scenario.skipped = (scenario.skipped || 0) + 1;
        return;
      }

      if (
        !step.result ||
        // Don't log steps that don't have a text/hidden/images/attachments unless they are failed.
        // This is for the hooks
        (step.hidden &&
          !step.text &&
          !step.image &&
          !step.video &&
          size(step.attachments) === 0 &&
          step.result.status !== RESULT_STATUS.failed)
      ) {
        return;
      }

      if (step.result.duration) {
        scenario.duration = (scenario.duration || 0) + step.result.duration;
        step.time = formatDuration(step.result.duration);
      }

      if (step.result.status.toLowerCase() === RESULT_STATUS.passed) {
        scenario.passed = (scenario.passed || 0) + 1;
        return;
      }

      if (step.result.status.toLowerCase() === RESULT_STATUS.failed) {
        scenario.failed = (scenario.failed || 0) + 1;
        return;
      }

      if (step.result.status.toLowerCase() === RESULT_STATUS.notDefined) {
        scenario.notDefined = (scenario.notDefined || 0) + 1;
        return;
      }

      if (step.result.status.toLowerCase() === RESULT_STATUS.ambiguous) {
        scenario.ambiguous = (scenario.ambiguous || 0) + 1;
        return;
      }

      scenario.pending = (scenario.pending || 0) + 1;

      // Global step stats
      if (trackAggregates && suite.featureCount.steps) {
        suite.featureCount.steps.total++;
        if (step.result.status === RESULT_STATUS.passed) {
          suite.featureCount.steps.passed++;
        } else if (step.result.status === RESULT_STATUS.failed || step.result.status === RESULT_STATUS.ambiguous) {
          suite.featureCount.steps.failed++;
        } else {
          suite.featureCount.steps.skipped++;
        }
      }
    });

    return scenario;
  }

  /**
   * Generate the features overview
   * @param {object} suite JSON object with all the features and scenarios
   * @private
   */
  async function _createFeaturesOverviewIndexPage(suite: Suite) {
    const featuresOverviewIndex = resolve(reportPath, INDEX_HTML);
    const runtimeMetadata = getReportRuntimeMetadata(suite);
    logger.trace('Rendering overview template.', { file: featuresOverviewIndex });

    const report = {
      reportName: suite.reportName,
      pageTitle: pageTitle,
      pageFooter: pageFooter,
      projectName: customData?.projectName,
      release: customData?.release,
      testCycle: customData?.testCycle,
      buildNumber: customData?.buildNumber,
      environment: customData?.environment,
      ciPipeline: customData?.ciPipeline,
      customDataItems,
      executionEndTime: formatDuration(suite.totalTime),
      executionPeriod: DateTime.fromJSDate(suite.time).toFormat('yyyy/MM/dd HH:mm:ss'),
      username: customData?.username ?? runtimeMetadata.username,
      nodeVersion: customData?.nodeVersion ?? runtimeMetadata.nodeVersion,
      reportVersion: customData?.reportVersion ?? runtimeMetadata.reportVersion,
      hostname: customData?.hostname,
      architecture: customData?.architecture ?? runtimeMetadata.architecture,
      useCDN: suite.useCDN,
      hideMetadata: suite.hideMetadata,
      displayReportTime: suite.displayReportTime,
      displayDuration: suite.displayDuration,
      displayChartPercentages: suite.displayChartPercentages,
      plainDescription,
      customStyle: suite.customStyle || '',
      logo: logoPathName,
      modalBackdrop,
      modalDraggable,
      modalResizable,
      modalShowContext,
    };

    const data = {
      summary: suite.featureCount,
      features: suite.features,
      scenarios: suite.scenarios,
      report,
    };

    const html = await engine.renderFile('index', {
      data,
      base_url: '.',
    });

    await fs.writeFile(featuresOverviewIndex, html);
    logger.debug('Wrote report overview page.', { file: featuresOverviewIndex });
  }

  /**
   * Generate the feature pages
   * @param suite suite JSON object with all the features and scenarios
   * @private
   */
  async function _createFeatureIndexPages(suite: Suite) {
    const runtimeMetadata = getReportRuntimeMetadata(suite);

    const report = {
      reportName: suite.reportName,
      pageTitle: pageTitle,
      pageFooter: pageFooter,
      projectName: customData?.projectName,
      release: customData?.release,
      testCycle: customData?.testCycle,
      buildNumber: customData?.buildNumber,
      environment: customData?.environment,
      ciPipeline: customData?.ciPipeline,
      customDataItems,
      executionEndTime: formatDuration(suite.totalTime),
      executionPeriod: DateTime.fromJSDate(suite.time).toFormat('yyyy/MM/dd HH:mm:ss'),
      username: customData?.username ?? runtimeMetadata.username,
      nodeVersion: customData?.nodeVersion ?? runtimeMetadata.nodeVersion,
      reportVersion: customData?.reportVersion ?? runtimeMetadata.reportVersion,
      hostname: customData?.hostname,
      architecture: customData?.architecture ?? runtimeMetadata.architecture,
      useCDN: suite.useCDN,
      hideMetadata: suite.hideMetadata,
      displayReportTime: suite.displayReportTime,
      displayDuration: suite.displayDuration,
      displayChartPercentages: suite.displayChartPercentages,
      plainDescription,
      customStyle: suite.customStyle || '',
      logo: logoPathName,
      attachmentLayout,
      modalBackdrop,
      modalDraggable,
      modalResizable,
      modalShowContext,
    };

    // Pass 2: re-stream every JSON file a second time, this time keeping
    // embedding payloads, one feature at a time. Each feature is fully
    // derived (metadata, hooks, counts, embeddings), rendered, and written
    // before moving to the next — peak memory is bounded to one feature's
    // attachments rather than the whole suite's, however large the suite is.
    // The feature's `id` is overwritten with the one Pass 1 already assigned
    // it (same file/array order in both passes) so index.html's
    // `features/<id>.html` links resolve correctly.
    const files = listJsonFiles(options);
    let mergedWriter: ReturnType<typeof createJsonArrayFileWriter> | null = null;
    let enrichedWriter: ReturnType<typeof createJsonSuiteFileWriter> | null = null;
    if (saveCollectedJSON) {
      mergedWriter = createJsonArrayFileWriter(resolve(reportPath, 'merged-output.json'));
      const { features: _features, ...suiteEnvelope } = suite;
      enrichedWriter = createJsonSuiteFileWriter(resolve(reportPath, 'enriched-output.json'), suiteEnvelope);
    }
    const mediaWriter = externalizeMedia ? createMediaFileWriter(reportPath) : undefined;

    let featureIndex = 0;
    for (const file of files) {
      const reportTime = fs.statSync(file).birthtime;

      for await (const rawFeature of streamFeaturesFromFile(file, { keepEmbeddingData: true })) {
        const feature = applyMetadataAndHooks(rawFeature, options, reportTime);

        // merged-output.json mirrors merged/hook-flattened but otherwise raw
        // cucumber JSON — real embeddings intact, no tally/enrichment fields.
        // Written (and fully awaited) before `_parseSingleFeature` mutates
        // `feature` in place below.
        if (mergedWriter) {
          await mergedWriter.write(feature);
        }

        // Pass 1's already-tallied, embeddings-free feature at this same
        // position — reused as-is for the page's inline chart JSON so that
        // blob never scales with attachment size either (mirrors index.html).
        const featureSummary = suite.features[featureIndex];

        _parseSingleFeature(suite, feature, false, mediaWriter);
        feature.id = featureSummary.id;
        featureIndex++;

        if (enrichedWriter) {
          await enrichedWriter.write(feature);
        }

        const featurePage = join(reportPath, FEATURE_FOLDER, `${feature.id}.html`);
        logger.trace('Rendering feature template.', {
          feature: feature.name,
          featureId: feature.id,
          file: featurePage,
        });
        const data = {
          report,
          featureSummary,
          feature: {
            ...feature,
            elements: feature.elements,
          },
        };

        const htmlStream = await engine.renderFileToNodeStream('feature', {
          data,
          base_url: '..',
        });

        await streamPipeline(htmlStream, fs.createWriteStream(featurePage));
        logger.trace('Wrote feature page.', { feature: feature.name, featureId: feature.id, file: featurePage });
      }
    }

    if (mergedWriter) {
      await mergedWriter.close();
    }
    if (enrichedWriter) {
      await enrichedWriter.close();
    }

    // Copy the assets
    const assetsSource = resolve(templatesDir, 'assets');
    const assetsTarget = resolve(reportPath, 'assets');
    logger.debug('Copying report assets.', { source: assetsSource, target: assetsTarget });
    await fs.copy(assetsSource, assetsTarget);
    if (brandLogo) {
      const resolvedLogoPath = resolve(process.cwd(), brandLogo);
      if (await fs.pathExists(resolvedLogoPath)) {
        const logoBasename = path.basename(brandLogo);
        const logoTarget = resolve(reportPath, 'assets', 'images', logoBasename);
        logger.debug('Copying brand logo asset.', { source: resolvedLogoPath, target: logoTarget });
        await fs.copy(resolvedLogoPath, logoTarget);
      }
    }
  }

  async function _createCssFile(suite: Suite) {
    if (!suite.customStyle) {
      const cssIn = path.join(templatesDir, 'assets', 'css', 'styles.min.css');
      const cssOut = path.join(reportPath, 'styles.min.css');

      await fs.ensureDir(path.dirname(cssOut));
      logger.trace('Copying default stylesheet.', { source: cssIn, target: cssOut });
      await fs.copy(cssIn, cssOut);
    } else {
      const cssFile = resolve(reportPath, 'styles.css');
      const cssContent = suite.customStyle;
      logger.trace('Writing custom stylesheet.', { file: cssFile });
      await fs.writeFile(cssFile, cssContent);
    }
  }

  async function _createJsFiles() {
    // Copy JS
    const jsInDir = path.join(templatesDir, 'scripts');
    const jsOutDir = path.join(reportPath, 'scripts');
    if (await fs.pathExists(jsInDir)) {
      await fs.ensureDir(jsOutDir);
      logger.trace('Copying report scripts.', { source: jsInDir, target: jsOutDir });
      await fs.copy(jsInDir, jsOutDir);
    } else {
      logger.warn('Report script source directory was not found.', { source: jsInDir });
    }
  }

  /**
   * Formats the duration to HH:mm:ss.SSS.
   *
   * @param {number} duration a time duration usually in ns form; it can be
   * possible to interpret the value as ms, see the option {durationInMS}.
   *
   * @return {string} the duration formatted as a string
   */
  function formatDuration(duration: number): string {
    return Duration.fromMillis(durationInMS ? duration : duration / 1000000).toFormat('hh:mm:ss.SSS');
  }

  /**
   * Convert cucumber duration to milliseconds.
   * @param {number} duration
   * @returns {number}
   */
  function toMillis(duration: number): number {
    return durationInMS ? duration : duration / 1000000;
  }

  /**
   * Convert milliseconds to cucumber duration units.
   * @param {number} millis
   * @returns {number}
   */
  function fromMillis(millis: number): number {
    return durationInMS ? millis : millis * 1000000;
  }

  /**
   * Parse scenario start timestamp to epoch milliseconds.
   * @param {Scenario} scenario
   * @returns {number|null}
   */
  function parseScenarioStartTime(scenario: Scenario): number | null {
    if (!scenario?.start_timestamp) {
      return null;
    }

    const time = Date.parse(scenario.start_timestamp);
    return Number.isNaN(time) ? null : time;
  }
}

/**
 * Loads a metadata file asynchronously.
 * Supports JSON.
 */
async function loadMetadataFile(filePath: string): Promise<
  | Metadata
  | Record<string, Metadata>
  | {
      name: string;
      value: string;
    }[]
  | undefined
> {
  if (!(await fs.pathExists(filePath))) {
    throw new Error(`Metadata file not found at: ${filePath}`);
  }

  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

export const generate = generateReport;
export type { CustomData, LoggingOptions, LogLevel, Metadata, Options };
