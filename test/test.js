'use strict';

const test = require('../lib/generate-report');

test.generate({
    saveCollectedJSON: true,
    jsonDir: './unit/data/collect-json',
    reportPath: './reportPath',
    metadata:{
        browser: {
            name: 'chrome',
            version: '1'
        },
        device: 'Local test machine',
        platform: {
            name: 'Ubuntu',
            version: '16.04'
        }
    }

});
