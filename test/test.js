'use strict';

const test = require('../lib/generate-report');

test.generate({
    saveCollectedJSON: true,
    jsonDir: './test/unit/data/json/',
    reportPath: './.tmp/',
    featuresFolder: './test/unit/data/features-scenarios-outline',
    disableMetadataIfnotPresent: true,
    showExecutionTime: true,
    saveCollectedJSON:true,
    expandStepsNotPassed: true,
    navigateToFeatureIfThereIsOnlyOne:true,
    openReportInBrowser:true
});
