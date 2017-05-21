'use strict';

const _ = require('lodash');
const assert = require('assert');
const chalk = require('chalk');
const fs = require('fs-extra');
const jsonFile = require('jsonfile');
const opn = require('opn');
const path = require('path');
const uuid = require('uuid/v4');
const collectJSONS = require('./collect-jsons');

const REPORT_STYLESHEET = 'style.css';
const GENERIC_JS = 'generic.js';
const INDEX_HTML = 'index.html';
const FEATURE_FOLDER = 'features';
const FEATURES_OVERVIEW_INDEX_TEMPLATE = 'features-overview.index.tmpl';
const FEATURES_OVERVIEW_TEMPLATE = 'components/features-overview.tmpl';
const FEATURES_OVERVIEW_CHART_TEMPLATE = 'components/features-overview.chart.tmpl';
const SCENARIOS_OVERVIEW_CHART_TEMPLATE = 'components/scenarios-overview.chart.tmpl';
const FEATURE_OVERVIEW_INDEX_TEMPLATE = 'feature-overview.index.tmpl';
const FEATURE_METADATA_OVERVIEW_TEMPLATE = 'components/feature-metadata-overview.tmpl';
const SCENARIOS_TEMPLATE = 'components/scenarios.tmpl';
const RESULT_STATUS = {
    passed: 'passed',
    failed: 'failed',
    skipped: 'skipped',
    pending: 'pending',
    undefined: 'undefined',
    ambiguous: 'ambiguous'
};

function generateReport(options) {
    if (!options) {
        throw new Error('Options need to be provided.');
    }

    if (!options.jsonDir) {
        throw new Error('A path which holds the JSON files should be provided.');
    }

    if (!options.reportPath) {
        throw new Error('An output path for the reports should be defined, no path was provided.');
    }

    const openReportInBrowser = options.openReportInBrowser;

    const reportPath = path.resolve(process.cwd(), options.reportPath);
    const saveCollectedJSON = options.saveCollectedJSON;

    fs.ensureDirSync(reportPath);
    fs.ensureDirSync(path.resolve(reportPath, FEATURE_FOLDER));

    const allFeatures = collectJSONS(options);

    let suite = {
        name: '',
        version: 'version',
        time: new Date(),
        features: allFeatures,
        featureCount: {
            ambiguous: 0,
            failed: 0,
            passed: 0,
            total: 0,
            ambiguousPercentage: 0,
            failedPercentage: 0,
            passedPercentage: 0
        },
        totalTime: 0,
        scenarios: {
            passed: 0,
            failed: 0,
            skipped: 0,
            pending: 0,
            notdefined: 0,
            ambiguous: 0,
            total: 0
        }
    };

    _parseFeatures(suite);

    // Percentages
    suite.featureCount.ambiguousPercentage = _calculatePercentage(suite.featureCount.ambiguous, suite.featureCount.total);
    suite.featureCount.failedPercentage = _calculatePercentage(suite.featureCount.failed, suite.featureCount.total);
    suite.featureCount.passedPercentage = _calculatePercentage(suite.featureCount.passed, suite.featureCount.total);

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
        jsonFile.writeFileSync(path.resolve(reportPath, 'enriched-output.json'), suite, {spaces: 2});
    }

    _createFeaturesOverviewIndexPage(suite);
    _createFeatureIndexPages(suite);

    console.log(chalk.blue(`\n 
=====================================================================================
    Multiple Cucumber HTML report generated in:
    
    ${path.join(reportPath, INDEX_HTML)}
    
    Tnx for using Multiple Cucumber HTML report
    
    Grtz wswebcreation
=====================================================================================\n`));

    /* istanbul ignore if */
    if (openReportInBrowser) {
        opn(path.join(reportPath, INDEX_HTML));
    }

    function _parseFeatures(suite) {
        suite.features.forEach(feature => {
            feature.scenarios = {
                passed: 0,
                failed: 0,
                notdefined: 0,
                skipped: 0,
                pending: 0,
                ambiguous: 0,
                passedPercentage: 0,
                failedPercentage: 0,
                notdefinedPercentage: 0,
                skippedPercentage: 0,
                pendingPercentage: 0,
                ambiguousPercentage: 0,
                total: 0
            };
            feature.time = 0;
            feature.isFailed = false;
            feature.isAmbiguous = false;
            suite.featureCount.total++;
            feature.id = `${uuid()}.${feature.id}`;

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
            } else {
                feature.passed++;
                suite.featureCount.passed++;
            }

            if (feature.time) {
                feature.totalTime += feature.time
            }

            // Percentages
            feature.scenarios.ambiguousPercentage = _calculatePercentage(feature.scenarios.ambiguous, feature.scenarios.total);
            feature.scenarios.failedPercentage = _calculatePercentage(feature.scenarios.failed, feature.scenarios.total);
            feature.scenarios.notdefinedPercentage = _calculatePercentage(feature.scenarios.notdefined, feature.scenarios.total);
            feature.scenarios.passedPercentage = _calculatePercentage(feature.scenarios.passed, feature.scenarios.total);
            feature.scenarios.pendingPercentage = _calculatePercentage(feature.scenarios.pending, feature.scenarios.total);
            feature.scenarios.skippedPercentage = _calculatePercentage(feature.scenarios.skipped, feature.scenarios.total);
            suite.scenarios.ambiguousPercentage = _calculatePercentage(suite.scenarios.ambiguous, suite.scenarios.total);
            suite.scenarios.failedPercentage = _calculatePercentage(suite.scenarios.failed, suite.scenarios.total);
            suite.scenarios.notdefinedPercentage = _calculatePercentage(suite.scenarios.notdefined, suite.scenarios.total);
            suite.scenarios.passedPercentage = _calculatePercentage(suite.scenarios.passed, suite.scenarios.total);
            suite.scenarios.pendingPercentage = _calculatePercentage(suite.scenarios.pending, suite.scenarios.total);
            suite.scenarios.skippedPercentage = _calculatePercentage(suite.scenarios.skipped, suite.scenarios.total);
        });
    }

    /**
     * Parse each scenario within a feature
     * @param {object} feature a feature with all the scenario's in it
     * @return {object} return the parsed feature
     * @private
     */
    function _parseScenarios(feature) {
        feature.elements.forEach(scenario => {
            scenario.passed = 0;
            scenario.failed = 0;
            scenario.notdefined = 0;
            scenario.skipped = 0;
            scenario.pending = 0;
            scenario.ambiguous = 0;
            scenario.time = 0;

            scenario = _parseSteps(scenario);

            if (scenario.time > 0) {
                feature.time += scenario.time;
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

            if (scenario.notdefined > 0) {
                suite.scenarios.total++;
                suite.scenarios.notdefined++;
                feature.scenarios.total++;
                return feature.scenarios.notdefined++;
            }

            if (scenario.pending > 0) {
                suite.scenarios.total++;
                suite.scenarios.pending++;
                feature.scenarios.total++;
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

        return feature;
    }

    /**
     * Parse all the scenario steps and enrich them with the correct data
     * @param {object} scenario Preparsed scenario
     * @return {object} A parsed scenario
     * @private
     */
    function _parseSteps(scenario) {
        scenario.steps.forEach(step => {
            if (step.embeddings !== undefined) {
                const Base64 = require('js-base64').Base64;

                step.embeddings.forEach((embedding) => {
                    /* istanbul ignore else */
                    if (embedding.mime_type === 'text/plain') {
                        if (!step.text) {
                            step.text = Base64.decode(embedding.data);
                        } else {
                            step.text = step.text.concat('<br>' + Base64.decode(embedding.data));
                        }
                    } else if (embedding.mime_type === 'image/png') {
                        step.image = 'data:image/png;base64,' + embedding.data
                    }
                });
            }

            if (!step.result || (step.hidden && !step.text && !step.image)) {
                return 0;
            }

            if (step.result.duration) {
                scenario.time += step.result.duration;
            }

            if (step.result.status === RESULT_STATUS.passed) {
                return scenario.passed++;
            }

            if (step.result.status === RESULT_STATUS.failed) {
                return scenario.failed++;
            }

            if (step.result.status === RESULT_STATUS.undefined) {
                return scenario.notdefined++;
            }

            if (step.result.status === RESULT_STATUS.pending) {
                return scenario.pending++;
            }

            if (step.result.status === RESULT_STATUS.ambiguous) {
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
        return fs.readFileSync(path.join(__dirname, '..', 'templates', fileName), 'utf-8');
    }

    /**
     * Generate the features overview
     * @param {object} suite JSON object with all the features and scenarios
     * @private
     */
    function _createFeaturesOverviewIndexPage(suite) {
        const featuresOverviewIndex = path.resolve(reportPath, INDEX_HTML);

        fs.writeFileSync(
            featuresOverviewIndex,
            _.template(_readTemplateFile(FEATURES_OVERVIEW_INDEX_TEMPLATE))({
                suite: suite,
                featuresOverview: _.template(_readTemplateFile(FEATURES_OVERVIEW_TEMPLATE))({
                    suite: suite,
                    _: _
                }),
                featuresOverviewChart: _.template(_readTemplateFile(FEATURES_OVERVIEW_CHART_TEMPLATE))({
                    suite: suite,
                    _: _
                }),
                featuresScenariosOverviewChart: _.template(_readTemplateFile(SCENARIOS_OVERVIEW_CHART_TEMPLATE))({
                    scenarios: suite.scenarios,
                    _: _
                }),
                styles: _readTemplateFile(REPORT_STYLESHEET),
                genericScript: _readTemplateFile(GENERIC_JS)
            })
        );
    }

    /**
     * Generate the feature pages
     * @param suite suite JSON object with all the features and scenarios
     * @private
     */
    function _createFeatureIndexPages(suite) {
        suite.features.forEach(feature => {
            const featurePage = path.resolve(reportPath, `${FEATURE_FOLDER}/${feature.id}.html`);
            fs.writeFileSync(
                featurePage,
                _.template(_readTemplateFile(FEATURE_OVERVIEW_INDEX_TEMPLATE))({
                    feature: feature,
                    featureScenariosOverviewChart: _.template(_readTemplateFile(SCENARIOS_OVERVIEW_CHART_TEMPLATE))({
                        scenarios: feature.scenarios,
                        _: _
                    }),
                    featureMetadataOverview: _.template(_readTemplateFile(FEATURE_METADATA_OVERVIEW_TEMPLATE))({
                        metadata: feature.metadata,
                        _: _
                    }),
                    scenarioTemplate: _.template(_readTemplateFile(SCENARIOS_TEMPLATE))({
                        scenarios: feature.elements,
                        _: _
                    }),
                    styles: _readTemplateFile(REPORT_STYLESHEET),
                    genericScript: _readTemplateFile(GENERIC_JS)
                })
            );
        });
    }
}

module.exports = {
    generate: generateReport
};