import { copyFileSync, mkdirSync } from 'node:fs';
import { generate } from 'multiple-cucumber-html-reporter';

const JSON_DIR = 'reports/';

// Ship a curated sample JSON with named + unnamed attachments alongside the real
// Playwright run so the generated report demonstrates custom attachment names.
mkdirSync(JSON_DIR, { recursive: true });
copyFileSync('sample-data/custom-attachment-names.json', `${JSON_DIR}custom-attachment-names.json`);

generate({
  jsonDir: JSON_DIR,
  reportPath: 'reports/report/',
  useCDN: false,
  openReportInBrowser: true,
  saveCollectedJSON: false,
  displayReportTime: true,
  durationInMS: true,
  displayDuration: true,
  pageTitle: 'My Playwright Typescript Sample',
  reportName: 'Cucumber JS Report',
  metadata: {
    browser: {
      name: 'chrome',
      version: '148',
    },
    username: 'Wasiq Bhamla',
    device: 'MacBook Pro 14 inch',
    platform: {
      name: 'osx',
      version: '26.5',
    },
  },
  customData: {
    title: 'Playwright Sample',
    data: [
      { label: 'Project', value: 'Sample Playwright Typescript' },
      { label: 'Release', value: '1.0.0' },
      { label: 'Cycle', value: 'Build-1002' },
      { label: 'Playwright Version', value: '1.40.0' },
      { label: 'Node Version', value: '24.15.0' },
      { label: 'Test Environment', value: 'Dev' },
    ],
  },
});
