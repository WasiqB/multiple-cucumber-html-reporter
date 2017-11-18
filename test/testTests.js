'use strict';

const test = require('../lib/generate-report');

test.generate({
    saveCollectedJSON: true,
    jsonDir: '/mnt/ARCHIVING/GIT/new-multiple-cucumber-html-reporter/multiple-cucumber-html-reporter_updated/test/unit/data/json/',
    reportPath: '/mnt/ARCHIVING/GIT/new-multiple-cucumber-html-reporter/multiple-cucumber-html-reporter_updated/.tmp/',
    openReportInBrowser: true,
    featuresFolder: '/mnt/ARCHIVING/GIT/new-multiple-cucumber-html-reporter/multiple-cucumber-html-reporter_updated/test/unit/data/features-scenarios-outline/',
    disableMetadataIfnotPresent: true,
    showExecutionTime: true,
    saveCollectedJSON:true,
    expandStepsNotPassed: true,
    navigateToFeatureIfThereIsOnlyOne:true
});
