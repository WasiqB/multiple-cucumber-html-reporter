'use strict';

const test = require('../lib/generate-report');

test.generate({
    saveCollectedJSON: true,
    jsonDir: '/home/demian/Documents/cucumber reports/testdata1/failing/cbs-payments-service_failing/cbs-payments-service-cucumber/target/cucumber-reports/cucumberDemo/',
    reportPath: '/home/demian/Documents/cucumber reports/testdata1/htmlReportMultipleReports/',
    openReportInBrowser: true,
    featuresFolder: '/home/demian/Documents/cucumber reports/testdata1/failing/cbs-payments-service_failing/',
    disableMetadataIfnotPresent: true,
    showExecutionTime: true,
    saveCollectedJSON:true,
    expandStepsNotPassed: true,
    navigateToFeatureIfThereIsOnlyOne:true
});