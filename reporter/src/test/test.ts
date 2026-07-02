import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as test from '../generate-report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a report for browsers
 */
test.generate({
  saveCollectedJSON: true,
  jsonDir: './src/test/unit/data/json/',
  reportPath: './.tmp/browsers/',
  reportName: 'You can adjust this report name',
  customMetadata: false,
  displayDuration: true,
  durationInMS: true,
  customData: {
    projectName: 'Custom project',
    release: '1.2.3',
    testCycle: 'B11221.34321',
    buildNumber: 'CI-001',
    environment: 'staging',
    ciPipeline: 'GitHub Actions',
  },
});

/**
 * Generate a report for browsers with useCDN true
 */
test.generate({
  saveCollectedJSON: true,
  jsonDir: './src/test/unit/data/json/',
  reportPath: './.tmp/browsers-with-cdn-usage/',
  reportName: 'Report with CDN usage',
  customMetadata: false,
  displayDuration: true,
  durationInMS: true,
  useCDN: true,
  customData: {
    projectName: 'Custom project',
    release: '1.2.3',
    testCycle: 'B11221.34321',
  },
});

/**
 * Generate a report with array of embedded data
 */
test.generate({
  saveCollectedJSON: true,
  jsonDir: './src/test/unit/data/embedded-array-json/',
  reportPath: './.tmp/embedded-array/',
  customStyle: path.join(__dirname, './custom.css'),
  overrideStyle: path.join(__dirname, './my.css'),
  customMetadata: false,
  pageTitle: 'A custom page title',
  pageFooter: '<div><p>Some custom footer data can be placed here</p></div>',
  plainDescription: true,
  customData: {
    projectName: 'Custom embedded project',
    release: '4.5.6',
  },
});

/**
 * Generate a report for browsers with report time
 */
test.generate({
  saveCollectedJSON: true,
  jsonDir: './src/test/unit/data/json/',
  reportPath: './.tmp/browsers-with-report-time/',
  reportName: 'You can adjust this report name',
  customMetadata: false,
  displayDuration: true,
  displayReportTime: true,
  hideMetadata: true,
  durationInMS: true,
  customData: {
    projectName: 'Custom project',
    release: '1.2.3',
    testCycle: 'B11221.34321',
  },
});

/**
 * Generate a report with custom metadata
 * NOTE: must be last, if you use customMetadata you cannot reuse generator
 */
test.generate({
  saveCollectedJSON: true,
  jsonDir: './src/test/unit/data/custom-metadata-json/',
  reportPath: './.tmp/custom-metadata/',
  customMetadata: true,
  displayDuration: true,
  metadata: [
    { name: 'Backend version', value: '4.0 R11' },
    { name: 'Client API version', value: '17.10' },
    { name: 'Test Configuration', value: 'Config A' },
    { name: 'platform', value: 'Ubuntu' },
    { name: 'platform version', value: '16.04' },
  ],
});
