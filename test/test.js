const test = require('../lib/generate-report');

test.generate({
    saveCollectedJSON: true,
    jsonDir: './test/unit/data/ns/',
    reportPath: './.tmp/'
});