'use strict';

const test = require('../lib/generate-report');

test.generate({
    saveCollectedJSON: true,
    jsonDir: './test/unit/data/json/',
    reportPath: './.tmp/'
});