const chalk = require('chalk');
const fs = require('fs-extra');
const jsonFile = require('jsonfile');
const open = require('open');
const path = require('path');
const {v4: uuid} = require('uuid');
const ejs = require('ejs');
const collectJSONS = require('./collect-jsons');
const {
    calculatePercentage,
    createReportFolders,
    formatDuration,
    getCustomStyleSheet,
    getGenericJsContent,
    getStyleSheet,
} = require('./utils');
const {parseScenarioSteps} = require('./parse.cucumber.data');

const INDEX_HTML = 'index.html';
const FEATURE_FOLDER = 'features';
const RESULT_STATUS = {
    passed: 'passed',
    failed: 'failed',
    skipped: 'skipped',
    pending: 'pending',
    notDefined: 'undefined',
    ambiguous: 'ambiguous'
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
        throw new Error('An output path for the reports should be defined, no path was provided.');
    }

    const customMetadata = options.customMetadata || false;
    const customData = options.customData || null;
    const style = getStyleSheet(options.overrideStyle) + getCustomStyleSheet(options.customStyle);
    const disableLog = options.disableLog;
    const openReportInBrowser = options.openReportInBrowser;
    const reportName = options.reportName || DEFAULT_REPORT_NAME;
    const reportPath = path.resolve(process.cwd(), options.reportPath);
    const saveCollectedJSON = options.saveCollectedJSON;
    const displayDuration = options.displayDuration || false;
    const displayReportTime = options.displayReportTime || false;
    const durationInMS = options.durationInMS || false;
    const hideMetadata = options.hideMetadata || false;
    const pageTitle = options.pageTitle || 'Multiple Cucumber HTML Reporter';
    const pageFooter = options.pageFooter || false;
    const useCDN = options.useCDN || false;
    const staticFilePath = options.staticFilePath || false;

    createReportFolders(reportPath);

    const allFeatures = collectJSONS(options);

    let suite = {
        app: 0,
        customMetadata: customMetadata,
        customData: customData,
        style: style,
        useCDN: useCDN,
        hideMetadata: hideMetadata,
        displayReportTime: displayReportTime,
        displayDuration: displayDuration,
        browser: 0,
        name: '',
        version: 'version',
        time: new Date(),
        features: allFeatures,
        reportName: reportName,
        totalFeaturesCount: {
            ambiguous: {
                count: 0,
                percentage: 0
            },
            failed: {
                count: 0,
                percentage: 0
            },
            passed: {
                count: 0,
                percentage: 0
            },
            notDefined: {
                count: 0,
                percentage: 0
            },
            pending: {
                count: 0,
                percentage: 0
            },
            skipped: {
                count: 0,
                percentage: 0
            },
            total: 0,
        },
        totalScenariosCount: {
            ambiguous: {
                count: 0,
                percentage: 0
            },
            failed: {
                count: 0,
                percentage: 0
            },
            passed: {
                count: 0,
                percentage: 0
            },
            notDefined: {
                count: 0,
                percentage: 0
            },
            pending: {
                count: 0,
                percentage: 0
            },
            skipped: {
                count: 0,
                percentage: 0
            },
            total: 0
        },
        totalTime: 0
    };

    _parseFeatures(suite);

    // Percentages
    suite.totalFeaturesCount = calculatePercentage(suite.totalFeaturesCount);

    /* istanbul ignore else */
    if (saveCollectedJSON) {
        jsonFile.writeFileSync(path.resolve(reportPath, 'enriched-output.json'), suite, {spaces: 2});
    }

    _createFeaturesOverviewIndexPage(suite);
    _createFeatureIndexPages(suite);

    /* istanbul ignore else */
    if (!disableLog) {
        console.log(chalk.blue(`\n
=====================================================================================
    Multiple Cucumber HTML report generated in:

    ${path.join(reportPath, INDEX_HTML)}
=====================================================================================\n`));
    }

    /* istanbul ignore if */
    if (openReportInBrowser) {
        open(path.join(reportPath, INDEX_HTML));
    }

    function _parseFeatures(suite) {
        suite.features.forEach(feature => {
            feature.totalFeatureScenariosCount = {
                ambiguous: {
                    count: 0,
                    percentage: 0
                },
                failed: {
                    count: 0,
                    percentage: 0
                },
                passed: {
                    count: 0,
                    percentage: 0
                },
                notDefined: {
                    count: 0,
                    percentage: 0
                },
                pending: {
                    count: 0,
                    percentage: 0
                },
                skipped: {
                    count: 0,
                    percentage: 0
                },
                total: 0
            };
            feature.duration = 0;
            feature.time = '00:00:00.000';
            feature.isFailed = false;
            feature.isAmbiguous = false;
            feature.isSkipped = false;
            feature.isNotdefined = false;
            feature.isPending = false;
            suite.totalFeaturesCount.total++;
            var idPrefix = staticFilePath ? '' : `${uuid()}.`;
            feature.id = `${idPrefix}${feature.id}`.replace(/[^a-zA-Z0-9-_]/g, '-');
            feature.app = 0;
            feature.browser = 0;

            if (!feature.elements) {
                return;
            }

            feature = _parseScenarios(feature, suite);

            if (feature.isFailed) {
                feature.failed++;
                suite.totalFeaturesCount.failed.count++;
            } else if (feature.isAmbiguous) {
                feature.ambiguous++;
                suite.totalFeaturesCount.ambiguous.count++;
            } else if (feature.isNotdefined) {
                feature.notDefined++;
                suite.totalFeaturesCount.notDefined.count++;
            } else if (feature.isPending) {
                feature.pending++;
                suite.totalFeaturesCount.pending.count++;
            } else if (feature.isSkipped) {
                feature.skipped++;
                suite.totalFeaturesCount.skipped.count++;
            } else {
                feature.passed++;
                suite.totalFeaturesCount.passed.count++;
            }

            if (feature.duration) {
                feature.totalTime += feature.duration
                feature.time = formatDuration(durationInMS, feature.duration)
            }

            // Check if browser / app is used
            suite.app = feature.metadata.app ? suite.app + 1 : suite.app;
            suite.browser = feature.metadata.browser ? suite.browser + 1 : suite.browser;

            // Percentages
            feature.totalFeatureScenariosCount = calculatePercentage(feature.totalFeatureScenariosCount);
            suite.totalScenariosCount = calculatePercentage(suite.totalScenariosCount);
        });
    }

    /**
     * Parse each scenario within a feature
     * @param {object} feature a feature with all the scenarios in it
     * @return {object} return the parsed feature
     * @private
     */
    function _parseScenarios(feature) {
        feature.elements.forEach(scenario => {
            scenario.passed = 0;
            scenario.failed = 0;
            scenario.notDefined = 0;
            scenario.skipped = 0;
            scenario.pending = 0;
            scenario.ambiguous = 0;
            scenario.duration = 0;
            scenario.time = '00:00:00.000';
            scenario = parseScenarioSteps(scenario, durationInMS);

            if (scenario.duration > 0) {
                feature.duration += scenario.duration;
                scenario.time = formatDuration(durationInMS, scenario.duration)
            }

            if (scenario.hasOwnProperty('description') && scenario.description) {
                scenario.description = scenario.description.replace(new RegExp('\r?\n', 'g'), '<br />');
            }

            if (scenario.failed > 0) {
                suite.totalScenariosCount.total++;
                suite.totalScenariosCount.failed.count++;
                feature.totalFeatureScenariosCount.total++;
                feature.isFailed = true;

                return feature.totalFeatureScenariosCount.failed.count++;
            }

            if (scenario.ambiguous > 0) {
                suite.totalScenariosCount.total++;
                suite.totalScenariosCount.ambiguous.count++;
                feature.totalFeatureScenariosCount.total++;
                feature.isAmbiguous = true;

                return feature.totalFeatureScenariosCount.ambiguous.count++;
            }

            if (scenario.notDefined > 0) {
                suite.totalScenariosCount.total++;
                suite.totalScenariosCount.notDefined.count++;
                feature.totalFeatureScenariosCount.total++;
                feature.isNotdefined = true;

                return feature.totalFeatureScenariosCount.notDefined.count++;
            }

            if (scenario.pending > 0) {
                suite.totalScenariosCount.total++;
                suite.totalScenariosCount.pending.count++;
                feature.totalFeatureScenariosCount.total++;
                feature.isPending = true;

                return feature.totalFeatureScenariosCount.pending.count++;
            }

            if (scenario.skipped > 0) {
                suite.totalScenariosCount.total++;
                suite.totalScenariosCount.skipped.count++;
                feature.totalFeatureScenariosCount.total++;

                return feature.totalFeatureScenariosCount.skipped.count++;
            }

            /* istanbul ignore else */
            if (scenario.passed > 0) {
                suite.totalScenariosCount.total++;
                suite.totalScenariosCount.passed.count++;
                feature.totalFeatureScenariosCount.total++;

                return feature.totalFeatureScenariosCount.passed.count++;
            }
        });

        feature.isSkipped = feature.totalFeatureScenariosCount.total === feature.totalFeatureScenariosCount.skipped.count;

        return feature;
    }

    /**
     * Generate the features overview
     * @param {object} suite JSON object with all the features and scenarios
     * @private
     */
    function _createFeaturesOverviewIndexPage(suite) {
        ejs.renderFile(
            path.join(__dirname, '..', 'templates', 'features-overview.index.ejs'),
            {
                ...{suite},
                ...{
                    genericScript: getGenericJsContent(),
                    pageFooter,
                    pageTitle,
                    reportName,
                    styles: suite.style
                }
            },
            {},
            (err, str) => {
                if (err) {
                    console.log('err = ', err);
                    return;
                }

                fs.writeFileSync(
                    path.resolve(reportPath, INDEX_HTML),
                    str
                )
            });

    }

    /**
     * Generate the feature pages
     * @param suite suite JSON object with all the features and scenarios
     * @private
     */
    function _createFeatureIndexPages(suite) {
        suite.features.forEach(feature => {
            const featurePage = path.resolve(reportPath, `${FEATURE_FOLDER}/${feature.id}.html`);
            ejs.renderFile(
                path.join(__dirname, '..', 'templates', 'feature-overview.index.ejs'),
                {
                    ...{suite},
                    ...{feature},
                    ...{
                        genericScript: getGenericJsContent(),
                        pageFooter,
                        pageTitle,
                        reportName,
                        styles: suite.style,
                    }
                },
                {},
                (err, str) => {
                    if (err) {
                        console.log('err = ', err);
                        return;
                    }

                    fs.writeFileSync(
                        featurePage,
                        str
                    )
                });

            // Copy the assets, but first check if they don't exists and not useCDN
            if (!fs.pathExistsSync(path.resolve(reportPath, 'assets')) && !suite.useCDN) {
                fs.copySync(
                    path.resolve(path.dirname(require.resolve('../package.json')), 'templates/assets'),
                    path.resolve(reportPath, 'assets')
                );
            }
        });
    }
}

module.exports = {
    generate: generateReport
};
