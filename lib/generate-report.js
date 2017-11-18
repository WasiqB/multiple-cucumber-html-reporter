'use strict';

const _ = require('lodash');
const chalk = require('chalk');
const jsonFile = require('jsonfile');
const opn = require('opn');
const path = require('path');
const collectJSONS = require('./collect-jsons');
const formatJsonReport = require('./format-json-report');
const collectFeatureFiles = require('./collect-feature-files');
const generateHtml = require('./generate-html');
const formatSuite = require('./format-suite');
const INDEX_HTML = 'index.html';
const FEATURE_FOLDER = 'features';
const fs = require('fs-extra');

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
    const disableLog = options.disableLog;

    fs.ensureDirSync(reportPath);
    fs.ensureDirSync(path.resolve(reportPath, FEATURE_FOLDER));

    var allFeatures = collectJSONS(options);

    if (options.featuresFolder) {
        const allFeatureFiles = collectFeatureFiles.getFeatures(options.featuresFolder);
        allFeatures = formatJsonReport.formatJson(options,allFeatures,allFeatureFiles);
    }

    options.disableMetadataIfnotPresent = options.disableMetadataIfnotPresent ? options.disableMetadataIfnotPresent : false;
    options.showExecutionTime = options.showExecutionTime ? options.showExecutionTime : false;
    
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

    suite = formatSuite.formatSuiteObject(suite);

    /* istanbul ignore else */
    if (saveCollectedJSON) {
        jsonFile.writeFileSync(path.resolve(reportPath, 'enriched-output.json'), suite, {spaces: 2});
    }

    /* istanbul ignore else */
    if (!disableLog) {
        console.log(chalk.blue(`\n 
=====================================================================================
    Multiple Cucumber HTML report generated in:
    
    ${path.join(reportPath, INDEX_HTML)}
=====================================================================================\n`));
    }

    generateHtml.createHtmlPages(reportPath, suite, options, INDEX_HTML, FEATURE_FOLDER);

    /* istanbul ignore if */
    if (openReportInBrowser) {
        const dir = options.reportPath + FEATURE_FOLDER;
        var files = fs.readdirSync(dir);

        if(files.length == 1 && options.navigateToFeatureIfThereIsOnlyOne){
            opn(path.join(path.join(reportPath,FEATURE_FOLDER), files[0]));            
        }else{
            opn(path.join(reportPath, INDEX_HTML));
        }

    }
}

module.exports = {
    generate: generateReport
};
