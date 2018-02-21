'use strict';
const path = require('path');

const test = require('../lib/generate-report');

/**
 * Generate a report for browsers
 */
test.generate({
  saveCollectedJSON: true,
  jsonDir: './test/unit/data/json/',
  reportPath: './.tmp/browsers/',
  reportName: 'You can adjust this report name',
  customMetadata: false,
  displayDuration: true,
  customData: {
    title: 'Run info',
    data: [
      { label: 'Project', value: 'Custom project' },
      { label: 'Release', value: '1.2.3' },
      { label: 'Cycle', value: 'B11221.34321' },
      { label: 'Execution Start Time', value: 'Nov 19th 2017, 02:31 PM EST' },
      { label: 'Execution End Time', value: 'Nov 19th 2017, 02:56 PM EST' }
    ]
  }
});

/**
 * Generate a report with array of embedded data
 */
test.generate({
    saveCollectedJSON: true,
    jsonDir: './test/unit/data/embedded-array-json/',
    reportPath: './.tmp/embedded-array/',
    customStyle: path.join(__dirname, './my.css'),
    customMetadata: false,
    customData: {
        title: 'Run info',
        data: [
            {label: 'Project', value: 'Custom embedded project'},
            {label: 'Release', value: '4.5.6'},
        ]
    }
});

/**
 * Generate a report with custom metadata
 * NOTE: must be last, if you use customMetadata you cannot reuse generator
 */
test.generate({
  saveCollectedJSON: true,
  jsonDir: './test/unit/data/custom-metadata-json/',
  reportPath: './.tmp/custom-metadata/',
  customMetadata: true,
  displayDuration: true
});
