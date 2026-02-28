import { execSync } from 'node:child_process';
import path, { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import jsonfile from 'jsonfile';
import { Liquid } from 'liquidjs';
import _ from 'lodash';
import { Duration } from 'luxon';
import open from 'open';
import { v4 as uuid } from 'uuid';
import collectJSONS from './collect-jsons.js';
import type { Feature, Options, Scenario, Step, Suite } from './types.js';

const { size } = _;
const { writeFileSync: _writeFileSync } = jsonfile;

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

const projectRoot = path.resolve(__dirname, '..');
const templatesDir = path.join(projectRoot, 'src', 'templates');

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

  const customMetadata = !!options.customMetadata;
  const customData = options.customData || null;
  const plainDescription = !!options.plainDescription;
  const customStyle = options.customStyle;
  const disableLog = !!options.disableLog;
  const openReportInBrowser = !!options.openReportInBrowser;
  const reportName = options.reportName || DEFAULT_REPORT_NAME;
  const reportPath = resolve(process.cwd(), options.reportPath);
  const saveCollectedJSON = !!options.saveCollectedJSON;
  const displayDuration = !!options.displayDuration;
  const displayReportTime = !!options.displayReportTime;
  const durationInMS = !!options.durationInMS;
  const durationAggregation = options.durationAggregation === 'wallClock' ? 'wallClock' : 'sum';
  const hideMetadata = !!options.hideMetadata;
  const pageTitle = options.pageTitle || 'Multiple Cucumber HTML Reporter';
  const pageFooter = options.pageFooter || null;
  const useCDN = !!options.useCDN;
  const staticFilePath = !!options.staticFilePath;

  fs.ensureDirSync(reportPath);
  fs.ensureDirSync(resolve(reportPath, FEATURE_FOLDER));

  const allFeatures: Feature[] = collectJSONS(options);

  const suite: Suite = {
    app: 0,
    customMetadata,
    customData,
    style: options.overrideStyle || 'styles.css',
    useCDN,
    hideMetadata,
    displayReportTime,
    displayDuration,
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
    },
    reportName,
    customStyle,
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

  if (saveCollectedJSON) {
    /* istanbul ignore else */
    _writeFileSync(resolve(reportPath, 'enriched-output.json'), suite, { spaces: 2 });
  }

  await _createFeaturesOverviewIndexPage(suite);
  await _createFeatureIndexPages(suite);
  await _createCssFile(suite);
  await _createJsFiles();

  if (!disableLog) {
    /* istanbul ignore else */
    console.log(
      '\x1b[34m%s\x1b[0m',
      `\n
=====================================================================================
    Multiple Cucumber HTML report generated in:

    ${join(reportPath, INDEX_HTML)}
=====================================================================================\n`,
    );
  }

  if (openReportInBrowser) {
    /* istanbul ignore if */
    open(join(reportPath, INDEX_HTML));
  }

  function _parseFeatures(suite: Suite) {
    suite.features.forEach((feature: Feature) => {
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
      suite.featureCount.total++;
      const idPrefix = staticFilePath ? '' : `${uuid()}.`;
      feature.id = `${idPrefix}${feature.id}`.replace(/[^a-zA-Z0-9-_]/g, '-');
      feature.app = 0;
      feature.browser = 0;

      if (!feature.elements) {
        return;
      }

      _parseScenarios(feature);

      if (feature.isFailed) {
        suite.featureCount.failed++;
        feature.failed++;
      } else if (feature.isAmbiguous) {
        suite.featureCount.ambiguous++;
        feature.ambiguous++;
      } else if (feature.isNotdefined) {
        feature.notDefined++;
        suite.featureCount.notDefined++;
      } else if (feature.isPending) {
        feature.pending++;
        suite.featureCount.pending++;
      } else if (feature.isSkipped) {
        feature.skipped++;
        suite.featureCount.skipped++;
      } else {
        feature.passed++;
        suite.featureCount.passed++;
      }

      if (feature.duration) {
        feature.totalTime += feature.duration;
        feature.time = formatDuration(feature.duration);
      }

      // Check if browser / app is used
      if (!Array.isArray(feature.metadata)) {
        suite.app = feature.metadata.app ? suite.app + 1 : suite.app;
        suite.browser = feature.metadata.browser ? suite.browser + 1 : suite.browser;
      }

      // Percentages
      feature.scenarios.ambiguousPercentage = _calculatePercentage(
        feature.scenarios.ambiguous,
        feature.scenarios.total,
      );
      feature.scenarios.failedPercentage = _calculatePercentage(feature.scenarios.failed, feature.scenarios.total);
      feature.scenarios.notDefinedPercentage = _calculatePercentage(
        feature.scenarios.notDefined,
        feature.scenarios.total,
      );
      feature.scenarios.passedPercentage = _calculatePercentage(feature.scenarios.passed, feature.scenarios.total);
      feature.scenarios.pendingPercentage = _calculatePercentage(feature.scenarios.pending, feature.scenarios.total);
      feature.scenarios.skippedPercentage = _calculatePercentage(feature.scenarios.skipped, feature.scenarios.total);
      suite.scenarios.ambiguousPercentage = _calculatePercentage(suite.scenarios.ambiguous, suite.scenarios.total);
      suite.scenarios.failedPercentage = _calculatePercentage(suite.scenarios.failed, suite.scenarios.total);
      suite.scenarios.notDefinedPercentage = _calculatePercentage(suite.scenarios.notDefined, suite.scenarios.total);
      suite.scenarios.passedPercentage = _calculatePercentage(suite.scenarios.passed, suite.scenarios.total);
      suite.scenarios.pendingPercentage = _calculatePercentage(suite.scenarios.pending, suite.scenarios.total);
      suite.scenarios.skippedPercentage = _calculatePercentage(suite.scenarios.skipped, suite.scenarios.total);
    });
  }

  /**
   * Parse each scenario within a feature
   * @param {object} feature a feature with all the scenarios in it
   * @return {object} return the parsed feature
   * @private
   */
  function _parseScenarios(feature: Feature) {
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

      scenario = _parseSteps(scenario);

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

      if (Object.hasOwn(scenario, 'description') && scenario.description) {
        scenario.description = scenario.description.replace(/\r?\n/g, '<br />');
      }

      if (scenario.type === 'background') {
        return;
      }

      if (scenario.failed > 0) {
        suite.scenarios.total++;
        suite.scenarios.failed++;
        feature.scenarios.total++;
        feature.isFailed = true;
        feature.scenarios.failed++;
        return;
      }

      if (scenario.ambiguous > 0) {
        suite.scenarios.total++;
        suite.scenarios.ambiguous++;
        feature.scenarios.total++;
        feature.isAmbiguous = true;
        feature.scenarios.ambiguous++;
        return;
      }

      if (scenario.notDefined > 0) {
        suite.scenarios.total++;
        suite.scenarios.notDefined++;
        feature.scenarios.total++;
        feature.isNotdefined = true;
        feature.scenarios.notDefined++;
        return;
      }

      if (scenario.pending > 0) {
        suite.scenarios.total++;
        suite.scenarios.pending++;
        feature.scenarios.total++;
        feature.isPending = true;
        feature.scenarios.pending++;
        return;
      }

      if (scenario.skipped > 0) {
        suite.scenarios.total++;
        feature.scenarios.total++;
        if (scenario.pending > 0) {
          suite.scenarios.pending++;
          feature.scenarios.pending++;
          return;
        }
        suite.scenarios.skipped++;
        feature.scenarios.skipped++;
        return;
      }

      /* istanbul ignore else */
      if (scenario.passed && scenario.passed > 0) {
        suite.scenarios.total++;
        suite.scenarios.passed++;
        feature.scenarios.total++;
        feature.passed = (feature.passed || 0) + 1;
        feature.scenarios.passed = Number(feature.scenarios.passed) + 1;
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
  function _parseSteps(scenario: Scenario): Scenario {
    scenario.steps.forEach((step: Step) => {
      if (step.embeddings !== undefined) {
        step.attachments = [];
        const embeddings = step.embeddings || [];
        embeddings.forEach((embedding: any, embeddingIndex: number) => {
          /* Decode Base64 for Text-ish attachements */
          if (embedding.mime_type === 'text/html' || embedding.mime_type === 'text/plain') {
            embedding.data = Buffer.from(embedding.data.toString(), 'base64');
          }
          /* istanbul ignore else */
          if (
            embedding.mime_type === 'application/json' ||
            (embedding.media && embedding.media.type === 'application/json')
          ) {
            embedding.data = Buffer.from(embedding.data, 'base64').toString();
            step.json = (step.json ? step.json : []).concat([
              typeof embedding.data === 'string' ? JSON.parse(embedding.data) : embedding.data,
            ]);
          } else if (embedding.mime_type === 'text/html' || (embedding.media && embedding.media.type === 'text/html')) {
            step.html = (step.html ? step.html : []).concat([embedding.data]);
          } else if (
            embedding.mime_type === 'text/plain' ||
            (embedding.media && embedding.media.type === 'text/plain')
          ) {
            step.text = (step.text ? step.text : []).concat([_escapeHtml(embedding.data)]);
          } else if (embedding.mime_type === 'image/png' || (embedding.media && embedding.media.type === 'image/png')) {
            step.image = (step.image ? step.image : []).concat([`data:image/png;base64,${embedding.data}`]);
            step.embeddings![embeddingIndex] = {};
          } else if (
            embedding.mime_type === 'video/webm' ||
            (embedding.media && embedding.media.type === 'video/webm')
          ) {
            step.video = (step.video ? step.video : []).concat([`data:video/webm;base64,${embedding.data}`]);
            step.embeddings![embeddingIndex] = {};
          } else {
            let embeddingType = 'text/plain';
            if (embedding.mime_type) {
              embeddingType = embedding.mime_type;
            } else if (embedding.media?.type) {
              embeddingType = embedding.media.type;
            }
            step.attachments?.push({
              data: `data:${embeddingType};base64,${embedding.data}`,
              type: embeddingType,
            });
            step.embeddings![embeddingIndex] = {};
          }
        });
      }

      if (step.doc_string !== undefined) {
        step.id = `${uuid()}.${scenario.id}.${step.name}`.replace(/[^a-zA-Z0-9-_]/g, '-');
        step.restWireData = _escapeHtml(step.doc_string.value).replace(/\r?\n/g, '<br />');
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
    });

    return scenario;
  }

  /**
   * Escape html in string
   * @param string
   * @return {string}
   * @private
   */
  function _escapeHtml(string: any): string {
    return typeof string === 'string' || string instanceof String
      ? string.replace(/[^0-9A-Za-z ]/g, (chr) => `&#${chr.charCodeAt(0)};`)
      : string;
  }

  /**
   * Generate the features overview
   * @param {object} suite JSON object with all the features and scenarios
   * @private
   */
  async function _createFeaturesOverviewIndexPage(suite: Suite) {
    const featuresOverviewIndex = resolve(reportPath, INDEX_HTML);

    const report = {
      reportName: suite.reportName,
      pageTitle: pageTitle,
      pageFooter: pageFooter,
      project: customData?.title,
      release: 'v1.0.0',
      cycle: 'N/A',
      executionStartTime: formatDuration(0),
      executionEndTime: formatDuration(suite.totalTime),
      metadata: customData?.data,
      useCDN: suite.useCDN,
      hideMetadata: suite.hideMetadata,
      displayReportTime: suite.displayReportTime,
      displayDuration: suite.displayDuration,
      plainDescription,
      customStyle: suite.customStyle ? fs.readFileSync(resolve(process.cwd(), suite.customStyle), 'utf-8') : '',
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
  }

  /**
   * Generate the feature pages
   * @param suite suite JSON object with all the features and scenarios
   * @private
   */
  async function _createFeatureIndexPages(suite: Suite) {
    for (const feature of suite.features) {
      const featurePage = join(reportPath, FEATURE_FOLDER, `${feature.id}.html`);

      const report = {
        reportName: suite.reportName,
        pageTitle: pageTitle,
        pageFooter: pageFooter,
        project: customData?.title,
        release: 'v1.0.0',
        cycle: 'N/A',
        executionStartTime: formatDuration(0),
        executionEndTime: formatDuration(suite.totalTime),
        metadata: customData?.data,
        useCDN: suite.useCDN,
        hideMetadata: suite.hideMetadata,
        displayReportTime: suite.displayReportTime,
        displayDuration: suite.displayDuration,
        plainDescription,
        customStyle: suite.customStyle ? fs.readFileSync(resolve(process.cwd(), suite.customStyle), 'utf-8') : '',
      };

      const data = {
        report,
        feature,
      };

      const html = await engine.renderFile('feature', {
        data,
        base_url: '..',
      });

      await fs.writeFile(featurePage, html);
    }

    // Copy the assets
    await fs.copy(resolve(templatesDir, 'assets'), resolve(reportPath, 'assets'));
  }

  async function _createCssFile(suite: Suite) {
    console.log('Creating Report CSS file...');
    if (!suite.customStyle) {
      const cssIn = path.join(templatesDir, 'styles', 'main.css');
      const cssOut = path.join(reportPath, 'styles.css');
      await fs.ensureDir(path.dirname(cssOut));

      if (!(await fs.pathExists(cssIn))) {
        console.log('Creating Basic CSS file...');
        await fs.writeFile(
          cssIn,
          "@import 'tailwindcss';\n\n@theme inline {\n --color-background: white;\n --color-foreground: black;\n}",
        );
      }

      try {
        console.log('Compiling CSS...');
        execSync(`npx @tailwindcss/cli -i ${cssIn} -o ${cssOut}`, { stdio: 'inherit' });
      } catch (error) {
        console.error('Error compiling CSS: ', error);
      }
    } else {
      const cssFile = resolve(reportPath, 'styles.css');
      const cssContent = suite.customStyle;
      console.log('Using Custom CSS file...');
      await fs.writeFile(cssFile, cssContent);
    }
  }

  async function _createJsFiles() {
    // Copy JS
    console.log('Copying JS...');
    const jsInDir = path.join(templatesDir, 'scripts');
    const jsOutDir = path.join(reportPath, 'scripts');
    if (await fs.pathExists(jsInDir)) {
      await fs.ensureDir(jsOutDir);
      await fs.copy(jsInDir, jsOutDir);
    }

    console.log('Build complete!');
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
    if (!scenario || !scenario.start_timestamp) {
      return null;
    }

    const time = Date.parse(scenario.start_timestamp);
    return Number.isNaN(time) ? null : time;
  }
}

export const generate = generateReport;
