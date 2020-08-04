const chalk = require('chalk');
const fs = require('fs-extra');
const jsonFile = require('jsonfile');
const open = require('open');
const path = require('path');
const {v4: uuid} = require('uuid');
const ejs = require('ejs');
const {Base64} = require('js-base64');
const collectJSONS = require('./collect-jsons');
const {
    calculatePercentage,
    createReportFolders,
    escapeHtml,
    formatDuration,
    getCustomStyleSheet,
    getGenericJsContent,
    getStyleSheet,
    isBase64,
} = require('./utils');

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
    Object.keys(suite.totalFeaturesCount).forEach(key => {
        if (key !== 'total') {
            suite.totalFeaturesCount[key].percentage = calculatePercentage(
                suite.totalFeaturesCount[key].count,
                suite.totalFeaturesCount.total,
            );
        }
    });

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
            Object.keys(feature.totalFeatureScenariosCount).forEach(key => {
                if (key !== 'total') {
                    feature.totalFeatureScenariosCount[key].percentage = calculatePercentage(
                        feature.totalFeatureScenariosCount[key].count,
                        feature.totalFeatureScenariosCount.total,
                    );
                }
            });
            Object.keys(suite.totalScenariosCount).forEach(key => {
                if (key !== 'total') {
                    suite.totalScenariosCount[key].percentage = calculatePercentage(
                        suite.totalScenariosCount[key].count,
                        suite.totalScenariosCount.total,
                    );
                }
            });
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

            scenario = _parseSteps(scenario);

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
     * Parse all the scenario steps and enrich them with the correct data
     * @param {object} scenario Preparsed scenario
     * @return {object} A parsed scenario
     * @private
     */
    function _parseSteps(scenario) {
        scenario.steps.forEach(step => {
            if (step.embeddings !== undefined) {
                step.attachments = [];
                step.embeddings.forEach((embedding, embeddingIndex) => {
                    /* istanbul ignore else */
                    if (embedding.mime_type === 'application/json' || embedding.media && embedding.media.type === 'application/json') {
                        step.json = (step.json ? step.json : []).concat([typeof embedding.data === 'string' ? JSON.parse(embedding.data) : embedding.data]);
                    } else if (embedding.mime_type === 'text/html' || (embedding.media && embedding.media.type === 'text/html')) {
                        step.html = (step.html ? step.html : []).concat([
                            isBase64(embedding.data) ? Base64.decode(embedding.data) : embedding.data
                        ]);
                    } else if (embedding.mime_type === 'text/plain' || (embedding.media && embedding.media.type === 'text/plain')) {
                        step.text = (step.text ? step.text : []).concat([
                            isBase64(embedding.data) ? escapeHtml(Base64.decode(embedding.data)) : escapeHtml(embedding.data)
                        ]);
                    } else if (embedding.mime_type === 'image/png' || (embedding.media && embedding.media.type === 'image/png')) {
                        step.image = (step.image ? step.image : []).concat(['data:image/png;base64,' + embedding.data]);
                        step.embeddings[embeddingIndex] = {};
                    } else {
                        let embeddingtype = 'text/plain';
                        if (embedding.mime_type) {
                            embeddingtype = embedding.mime_type;
                        } else if (embedding.media && embedding.media.type) {
                            embeddingtype = embedding.media.type;
                        }
                        step.attachments.push({
                            data: 'data:' + embeddingtype + ';base64,' + embedding.data,
                            type: embeddingtype
                        });
                        step.embeddings[embeddingIndex] = {};
                    }
                });
            }

            if (step.doc_string !== undefined) {
                step.id = `${uuid()}.${scenario.id}.${step.name}`.replace(/[^a-zA-Z0-9-_]/g, '-');
                step.restWireData = step.doc_string.value.split(/[>]/).join('').replace(new RegExp('\r?\n', 'g'), '<br />').split('response');
            }

            if (!step.result
                // Don't log steps that don't have a text/hidden/images/attachments unless they are failed.
                // This is for the hooks
                || (step.hidden && !step.text && !step.image && step.attachments && step.attachments.length === 0 && step.result.status !== RESULT_STATUS.failed)
            ) {
                return 0;
            }

            if (step.result.duration) {
                scenario.duration += step.result.duration;
                step.time = formatDuration(durationInMS, step.result.duration)
            }

            if (step.result.status === RESULT_STATUS.passed) {
                return scenario.passed++;
            }

            if (step.result.status === RESULT_STATUS.failed) {
                return scenario.failed++;
            }

            if (step.result.status === RESULT_STATUS.notDefined) {
                return scenario.notDefined++;
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
