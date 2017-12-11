'use strict';

const test = require('../lib/generate-report');

test.generate({
    saveCollectedJSON: true,
    jsonDir: './test/unit/data/custom-metadata-json/',
    reportPath: './.tmp/',
    reportName: 'You can adjust this report name',
    customMetadata: true,
    customData: {
        title: 'Run info',
        data: [
            {label: 'Project', value: 'Custom project'},
            {label: 'Release', value: '1.2.3'},
            {label: 'Cycle', value: 'B11221.34321'},
            {label: 'Execution Start Time', value: 'Nov 19th 2017, 02:31 PM EST'},
            {label: 'Execution End Time', value: 'Nov 19th 2017, 02:56 PM EST'}
        ]
    }
});