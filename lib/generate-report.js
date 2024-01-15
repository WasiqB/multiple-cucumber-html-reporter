'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const jsonFile = require('jsonfile');
const open = require('open');
const path = require('node:path');
const { v4: uuid } = require('uuid');
const { Duration } = require('luxon');
const collectJSONS = require('./collect-jsons');

const REPORT_STYLESHEET = 'style.css';
const GENERIC_JS = 'generic.js';
const INDEX_HTML = 'index.html';
const FEATURE_FOLDER = 'features';
const FEATURES_OVERVIEW_INDEX_TEMPLATE = 'features-overview.index.tmpl';
const CUSTOM_DATA_TEMPLATE = 'components/custom-data.tmpl';
let FEATURES_OVERVIEW_TEMPLATE = 'components/features-overview.tmpl';
const FEATURES_OVERVIEW_CUSTOM_METADATA_TEMPLATE =
  'components/features-overview-custom-metadata.tmpl';
const FEATURES_OVERVIEW_CHART_TEMPLATE =
  'components/features-overview.chart.tmpl';
const SCENARIOS_OVERVIEW_CHART_TEMPLATE =
  'components/scenarios-overview.chart.tmpl';
const FEATURE_OVERVIEW_INDEX_TEMPLATE = 'feature-overview.index.tmpl';
let FEATURE_METADATA_OVERVIEW_TEMPLATE =
  'components/feature-metadata-overview.tmpl';
const FEATURE_CUSTOM_METADATA_OVERVIEW_TEMPLATE =
  'components/feature-custom-metadata-overview.tmpl';
const SCENARIOS_TEMPLATE = 'components/scenarios.tmpl';
const RESULT_STATUS = {
  passed: 'passed',
  failed: 'failed',
  skipped: 'skipped',
  pending: 'pending',
  notDefined: 'undefined',
  ambiguous: 'ambiguous',
};
const DEFAULT_REPORT_NAME = 'Multiple Cucumber HTML Reporter';

function generateReport(options) {
  if (!options) {
    throw new Error('Options need to be provided.');
  }

  if (!options.jsonDir) {
    throw new Error('A path which holds the JSON files should be provided.');
  }

  if (!options.reportPath) {
    throw new Error(
      'An output path for the reports should be defined, no path was provided.'
    );
  }

  const customMetadata = !!options.customMetadata;
  const customData = options.customData || null;
  const plainDescription = !!options.plainDescription;
  const style = options.overrideStyle || REPORT_STYLESHEET;
  const customStyle = options.customStyle;
  const disableLog = !!options.disableLog;
  const openReportInBrowser = !!options.openReportInBrowser;
  const reportName = options.reportName || DEFAULT_REPORT_NAME;
  const reportPath = path.resolve(process.cwd(), options.reportPath);
  const saveCollectedJSON = !!options.saveCollectedJSON;
  const displayDuration = !!options.displayDuration;
  const displayReportTime = !!options.displayReportTime;
  const durationInMS = !!options.durationInMS;
  const hideMetadata = !!options.hideMetadata;
  const pageTitle = options.pageTitle || 'Multiple Cucumber HTML Reporter';
  const pageFooter = options.pageFooter || null;
  const useCDN = !!options.useCDN;
  const staticFilePath = !!options.staticFilePath;

  fs.ensureDirSync(reportPath);
  fs.ensureDirSync(path.resolve(reportPath, FEATURE_FOLDER));

  const allFeatures = collectJSONS(options);

  let suite = {
    app: 0,
    customMetadata: customMetadata,
    customData: customData,
    style: style,
    customStyle: customStyle,
    useCDN: useCDN,
    hideMetadata: hideMetadata,
    displayReportTime: displayReportTime,
    displayDuration: displayDuration,
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
    reportName: reportName,
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
  suite.featureCount.ambiguousPercentage = _calculatePercentage(
    suite.featureCount.ambiguous,
    suite.featureCount.total
  );
  suite.featureCount.failedPercentage = _calculatePercentage(
    suite.featureCount.failed,
    suite.featureCount.total
  );
  suite.featureCount.notDefinedPercentage = _calculatePercentage(
    suite.featureCount.notDefined,
    suite.featureCount.total
  );
  suite.featureCount.pendingPercentage = _calculatePercentage(
    suite.featureCount.pending,
    suite.featureCount.total
  );
  suite.featureCount.skippedPercentage = _calculatePercentage(
    suite.featureCount.skipped,
    suite.featureCount.total
  );
  suite.featureCount.passedPercentage = _calculatePercentage(
    suite.featureCount.passed,
    suite.featureCount.total
  );

  /**
   * Calculate and return the percentage
   * @param {number} amount
   * @param {number} total
   * @return {string} percentage
   * @private
   */
  function _calculatePercentage(amount, total) {
    return ((amount / total) * 100).toFixed(2);
  }

  /* istanbul ignore else */
  if (saveCollectedJSON) {
    jsonFile.writeFileSync(
      path.resolve(reportPath, 'enriched-output.json'),
      suite,
      { spaces: 2 }
    );
  }

  _createFeaturesOverviewIndexPage(suite);
  _createFeatureIndexPages(suite);

  /* istanbul ignore else */
  if (!disableLog) {
    console.log(
        '\x1b[34m%s\x1b[0m',
        `\n
=====================================================================================
    Multiple Cucumber HTML report generated in:

    ${path.join(reportPath, INDEX_HTML)}
=====================================================================================\n`
    );
  }

  /* istanbul ignore if */
  if (openReportInBrowser) {
    open(path.join(reportPath, INDEX_HTML));
  }

  function _parseFeatures(suite) {
    suite.features.forEach((feature) => {
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
      suite.featureCount.total++;
      const idPrefix = staticFilePath ? '' : `${uuid()}.`;
      feature.id = `${idPrefix}${feature.id}`.replace(/[^a-zA-Z0-9-_]/g, '-');
      feature.app = 0;
      feature.browser = 0;

      if (!feature.elements) {
        return;
      }

      feature = _parseScenarios(feature, suite);

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
      suite.app = feature.metadata.app ? suite.app + 1 : suite.app;
      suite.browser = feature.metadata.browser
        ? suite.browser + 1
        : suite.browser;

      // Percentages
      feature.scenarios.ambiguousPercentage = _calculatePercentage(
        feature.scenarios.ambiguous,
        feature.scenarios.total
      );
      feature.scenarios.failedPercentage = _calculatePercentage(
        feature.scenarios.failed,
        feature.scenarios.total
      );
      feature.scenarios.notDefinedPercentage = _calculatePercentage(
        feature.scenarios.notDefined,
        feature.scenarios.total
      );
      feature.scenarios.passedPercentage = _calculatePercentage(
        feature.scenarios.passed,
        feature.scenarios.total
      );
      feature.scenarios.pendingPercentage = _calculatePercentage(
        feature.scenarios.pending,
        feature.scenarios.total
      );
      feature.scenarios.skippedPercentage = _calculatePercentage(
        feature.scenarios.skipped,
        feature.scenarios.total
      );
      suite.scenarios.ambiguousPercentage = _calculatePercentage(
        suite.scenarios.ambiguous,
        suite.scenarios.total
      );
      suite.scenarios.failedPercentage = _calculatePercentage(
        suite.scenarios.failed,
        suite.scenarios.total
      );
      suite.scenarios.notDefinedPercentage = _calculatePercentage(
        suite.scenarios.notDefined,
        suite.scenarios.total
      );
      suite.scenarios.passedPercentage = _calculatePercentage(
        suite.scenarios.passed,
        suite.scenarios.total
      );
      suite.scenarios.pendingPercentage = _calculatePercentage(
        suite.scenarios.pending,
        suite.scenarios.total
      );
      suite.scenarios.skippedPercentage = _calculatePercentage(
        suite.scenarios.skipped,
        suite.scenarios.total
      );
    });
  }

  /**
   * Parse each scenario within a feature
   * @param {object} feature a feature with all the scenarios in it
   * @return {object} return the parsed feature
   * @private
   */
  function _parseScenarios(feature) {
    feature.elements.forEach((scenario) => {
      scenario.passed = 0;
      scenario.failed = 0;
      scenario.notDefined = 0;
      scenario.skipped = 0;
      scenario.pending = 0;
      scenario.ambiguous = 0;
      scenario.duration = 0;
      scenario.time = '00:00:00.000';

      scenario = _parseSteps(scenario);

      if (scenario.duration > 0) {
        feature.duration += scenario.duration;
        scenario.time = formatDuration(scenario.duration);
      }

      if (scenario.hasOwnProperty('description') && scenario.description) {
        scenario.description = scenario.description.replace(
          new RegExp('\r?\n', 'g'),
          '<br />'
        );
      }

      if (scenario.type === 'background') {
        return;
      }

      if (scenario.failed > 0) {
        suite.scenarios.total++;
        suite.scenarios.failed++;
        feature.scenarios.total++;
        feature.isFailed = true;
        return feature.scenarios.failed++;
      }

      if (scenario.ambiguous > 0) {
        suite.scenarios.total++;
        suite.scenarios.ambiguous++;
        feature.scenarios.total++;
        feature.isAmbiguous = true;
        return feature.scenarios.ambiguous++;
      }

      if (scenario.notDefined > 0) {
        suite.scenarios.total++;
        suite.scenarios.notDefined++;
        feature.scenarios.total++;
        feature.isNotdefined = true;
        return feature.scenarios.notDefined++;
      }

      if (scenario.pending > 0) {
        suite.scenarios.total++;
        suite.scenarios.pending++;
        feature.scenarios.total++;
        feature.isPending = true;
        return feature.scenarios.pending++;
      }

      if (scenario.skipped > 0) {
        suite.scenarios.total++;
        suite.scenarios.skipped++;
        feature.scenarios.total++;
        return feature.scenarios.skipped++;
      }

      /* istanbul ignore else */
      if (scenario.passed > 0) {
        suite.scenarios.total++;
        suite.scenarios.passed++;
        feature.scenarios.total++;
        return feature.scenarios.passed++;
      }
    });

    feature.isSkipped = feature.scenarios.total === feature.scenarios.skipped;

    return feature;
  }

  /**
   * Parse all the scenario steps and enrich them with the correct data
   * @param {object} scenario Preparsed scenario
   * @return {object} A parsed scenario
   * @private
   */
  function _parseSteps(scenario) {
    scenario.steps.forEach((step) => {
      if (step.embeddings !== undefined) {
        step.attachments = [];
	
        step.embeddings.forEach((embedding, embeddingIndex) => {
	  /* Decode Base64 for Text-ish attachements */
	  if(
	    embedding.mime_type === 'application/json' ||
	    embedding.mime_type === 'text/html' ||
	    embedding.mime_type === 'text/plain'
	  ) {
	    embedding.data = Buffer.from(embedding.data.toString(), 'base64')
	  }
	
          /* istanbul ignore else */
          if (
            embedding.mime_type === 'application/json' ||
            (embedding.media && embedding.media.type === 'application/json')
          ) {
            step.json = (step.json ? step.json : []).concat([
              typeof embedding.data === 'string'
                ? JSON.parse(embedding.data)
                : embedding.data,
            ]);
          } else if (
            embedding.mime_type === 'text/html' ||
            (embedding.media && embedding.media.type === 'text/html')
          ) {
            step.html = (step.html ? step.html : []).concat([embedding.data]);
          } else if (
            embedding.mime_type === 'text/plain' ||
            (embedding.media && embedding.media.type === 'text/plain')
          ) {
            step.text = (step.text ? step.text : []).concat([
              _escapeHtml(embedding.data),
            ]);
          } else if (
            embedding.mime_type === 'image/png' ||
            (embedding.media && embedding.media.type === 'image/png')
          ) {
            step.image = (step.image ? step.image : []).concat([
              'data:image/png;base64,' + embedding.data,
            ]);
            step.embeddings[embeddingIndex] = {};
          } else {
            let embeddingType = 'text/plain';
            if (embedding.mime_type) {
              embeddingType = embedding.mime_type;
            } else if (embedding.media && embedding.media.type) {
              embeddingType = embedding.media.type;
            }
            step.attachments.push({
              data: 'data:' + embeddingType + ';base64,' + embedding.data,
              type: embeddingType,
            });
            step.embeddings[embeddingIndex] = {};
          }
        });
      }

      if (step.doc_string !== undefined) {
        step.id = `${uuid()}.${scenario.id}.${step.name}`.replace(
          /[^a-zA-Z0-9-_]/g,
          '-'
        );
        step.restWireData = _escapeHtml(step.doc_string.value).replace(
          new RegExp('\r?\n', 'g'),
          '<br />'
        );
      }

      if (
        !step.result ||
        // Don't log steps that don't have a text/hidden/images/attachments unless they are failed.
        // This is for the hooks
        (step.hidden &&
          !step.text &&
          !step.image &&
          _.size(step.attachments) === 0 &&
          step.result.status !== RESULT_STATUS.failed)
      ) {
        return 0;
      }

      if (step.result.duration) {
        scenario.duration += step.result.duration;
        step.time = formatDuration(step.result.duration);
      }

      if (step.result.status.toLowerCase() === RESULT_STATUS.passed) {
        return scenario.passed++;
      }

      if (step.result.status.toLowerCase() === RESULT_STATUS.failed) {
        return scenario.failed++;
      }

      if (step.result.status.toLowerCase() === RESULT_STATUS.notDefined) {
        return scenario.notDefined++;
      }

      if (step.result.status.toLowerCase() === RESULT_STATUS.pending) {
        return scenario.pending++;
      }

      if (step.result.status.toLowerCase() === RESULT_STATUS.ambiguous) {
        return scenario.ambiguous++;
      }

      scenario.skipped++;
    });

    return scenario;
  }

  /**
   * Read a template file and return it's content
   * @param {string} fileName
   * @return {*} Content of the file
   * @private
   */
  function _readTemplateFile(fileName) {
    if (fileName) {
      try {
        fs.accessSync(fileName, fs.constants.R_OK);
        return fs.readFileSync(fileName, 'utf-8');
      } catch (err) {
        return fs.readFileSync(
          path.join(__dirname, '..', 'templates', fileName),
          'utf-8'
        );
      }
    } else {
      return '';
    }
  }

  /**
   * Escape html in string
   * @param string
   * @return {string}
   * @private
   */
  function _escapeHtml(string) {
    return typeof string === 'string' || string instanceof String
      ? string.replace(
          /[^0-9A-Za-z ]/g,
          (chr) => '&#' + chr.charCodeAt(0) + ';'
        )
      : string;
  }

  /**
   * Generate the features overview
   * @param {object} suite JSON object with all the features and scenarios
   * @private
   */
  function _createFeaturesOverviewIndexPage(suite) {
    const featuresOverviewIndex = path.resolve(reportPath, INDEX_HTML);
    if (suite.customMetadata && options.metadata) {
      suite.features.forEach((feature) => {
        if (!feature.metadata) {
          feature.metadata = options.metadata;
        }
      });
    }
    FEATURES_OVERVIEW_TEMPLATE = suite.customMetadata
      ? FEATURES_OVERVIEW_CUSTOM_METADATA_TEMPLATE
      : FEATURES_OVERVIEW_TEMPLATE;

    fs.writeFileSync(
      featuresOverviewIndex,
      _.template(_readTemplateFile(FEATURES_OVERVIEW_INDEX_TEMPLATE))({
        suite: suite,
        featuresOverview: _.template(
          _readTemplateFile(FEATURES_OVERVIEW_TEMPLATE)
        )({
          suite: suite,
          _: _,
        }),
        featuresScenariosOverviewChart: _.template(
          _readTemplateFile(SCENARIOS_OVERVIEW_CHART_TEMPLATE)
        )({
          overviewPage: true,
          scenarios: suite.scenarios,
          _: _,
        }),
        customDataOverview: _.template(_readTemplateFile(CUSTOM_DATA_TEMPLATE))(
          {
            suite: suite,
            _: _,
          }
        ),
        featuresOverviewChart: _.template(
          _readTemplateFile(FEATURES_OVERVIEW_CHART_TEMPLATE)
        )({
          suite: suite,
          _: _,
        }),
        customStyle: _readTemplateFile(suite.customStyle),
        styles: _readTemplateFile(suite.style),
        useCDN: suite.useCDN,
        genericScript: _readTemplateFile(GENERIC_JS),
        pageTitle: pageTitle,
        reportName: reportName,
        pageFooter: pageFooter,
      })
    );
  }

  /**
   * Generate the feature pages
   * @param suite suite JSON object with all the features and scenarios
   * @private
   */
  function _createFeatureIndexPages(suite) {
    // Set custom metadata overview for the feature
    FEATURE_METADATA_OVERVIEW_TEMPLATE = suite.customMetadata
      ? FEATURE_CUSTOM_METADATA_OVERVIEW_TEMPLATE
      : FEATURE_METADATA_OVERVIEW_TEMPLATE;

    suite.features.forEach((feature) => {
      const featurePage = path.resolve(
        reportPath,
        `${FEATURE_FOLDER}/${feature.id}.html`
      );
      fs.writeFileSync(
        featurePage,
        _.template(_readTemplateFile(FEATURE_OVERVIEW_INDEX_TEMPLATE))({
          feature: feature,
          suite: suite,
          featureScenariosOverviewChart: _.template(
            _readTemplateFile(SCENARIOS_OVERVIEW_CHART_TEMPLATE)
          )({
            overviewPage: false,
            feature: feature,
            suite: suite,
            scenarios: feature.scenarios,
            _: _,
          }),
          featureMetadataOverview: _.template(
            _readTemplateFile(FEATURE_METADATA_OVERVIEW_TEMPLATE)
          )({
            metadata: feature.metadata,
            _: _,
          }),
          scenarioTemplate: _.template(_readTemplateFile(SCENARIOS_TEMPLATE))({
            suite: suite,
            scenarios: feature.elements,
            _: _,
          }),
          useCDN: suite.useCDN,
          customStyle: _readTemplateFile(suite.customStyle),
          styles: _readTemplateFile(suite.style),
          genericScript: _readTemplateFile(GENERIC_JS),
          pageTitle: pageTitle,
          reportName: reportName,
          pageFooter: pageFooter,
          plainDescription: plainDescription,
        })
      );
      // Copy the assets, but first check if they don't exist and not useCDN
      if (
        !fs.pathExistsSync(path.resolve(reportPath, 'assets')) &&
        !suite.useCDN
      ) {
        fs.copySync(
          path.resolve(
            path.dirname(require.resolve('../package.json')),
            'templates/assets'
          ),
          path.resolve(reportPath, 'assets')
        );
      }
    });
  }

  /**
   * Formats the duration to HH:mm:ss.SSS.
   *
   * @param {number} duration a time duration usually in ns form; it can be
   * possible to interpret the value as ms, see the option {durationInMS}.
   *
   * @return {string} the duration formatted as a string
   */
  function formatDuration(duration) {
    return Duration.fromMillis(
        durationInMS ? duration : duration / 1000000
    ).toFormat('hh:mm:ss.SSS');
  }
}

module.exports = {
  generate: generateReport,
};
