import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import * as multiCucumberHTMLReporter from '../../generate-report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORT_PATH = './.tmp/';

describe('generate-report.js', () => {
  describe('Happy flows', () => {
    it('should create a report from the merged found json files without provided custom data', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/json',
        reportPath: REPORT_PATH,
        saveCollectedJSON: true,
        displayDuration: true,
      });

      expect(fs.statSync(path.join(process.cwd(), REPORT_PATH, 'index.html')).isFile())
        .withContext('Index file exists')
        .toBeTrue();
      expect(() => fs.statSync(path.join(process.cwd(), REPORT_PATH, 'features/happy-flow-v2.html'))).toThrow();
      expect(fs.statSync(path.join(process.cwd(), REPORT_PATH, 'merged-output.json')).isFile())
        .withContext('merged-output.json file exists')
        .toBeTrue();
      expect(fs.statSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json')).isFile())
        .withContext('temp-output.json file exists')
        .toBeTrue();
    });
    it('should create a report with the report time', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/json',
        reportPath: REPORT_PATH,
        saveCollectedJSON: true,
        displayDuration: true,
        displayReportTime: true,
      });

      expect(fs.statSync(path.join(process.cwd(), REPORT_PATH, 'index.html')).isFile())
        .withContext('Index file exists')
        .toBeTrue();
    });
    it('should create a report from the merged found json files with custom data with static file paths', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/json',
        reportPath: REPORT_PATH,
        staticFilePath: true,
        saveCollectedJSON: true,
        reportName: 'You can adjust this report name',
        customData: {
          title: 'Run info',
          data: [
            { label: 'Project', value: 'Custom project' },
            { label: 'Release', value: '1.2.3' },
            { label: 'Cycle', value: 'B11221.34321' },
            { label: 'Execution Start Time', value: 'Nov 19th 2017, 02:31 PM EST' },
            { label: 'Execution End Time', value: 'Nov 19th 2017, 02:56 PM EST' },
          ],
        },
        displayDuration: true,
        durationInMS: true,
      });

      expect(fs.statSync(path.join(process.cwd(), REPORT_PATH, 'index.html')).isFile())
        .withContext('Index file exists')
        .toBeTrue();
      expect(fs.statSync(path.join(process.cwd(), REPORT_PATH, 'features/happy-flow-v2.html')).isFile())
        .withContext('uuid free feature exists')
        .toBeTrue();
      expect(fs.statSync(path.join(process.cwd(), REPORT_PATH, 'merged-output.json')).isFile())
        .withContext('merged-output.json file exists')
        .toBeTrue();
      expect(fs.statSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json')).isFile())
        .withContext('temp-output.json file exists')
        .toBeTrue();
    });
    it('should create a report from the merged found json files with custom metadata', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-metadata-json/',
        reportPath: REPORT_PATH,
        customMetadata: true,
      });

      expect(fs.statSync(path.join(process.cwd(), REPORT_PATH, 'index.html')).isFile())
        .withContext('Index file exists')
        .toBeTrue();
    });

    it('should create a report from the merged found json files and with array of embedded items', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/embedded-array-json/',
        reportName: 'Embedded array of various mimeType',
        reportPath: REPORT_PATH,
        customStyle: path.join(__dirname, '../my.css'),
        customMetadata: false,
      });

      expect(fs.statSync(path.join(process.cwd(), REPORT_PATH, 'index.html')).isFile())
        .withContext('Index file exists')
        .toBeTrue();
    });

    it('should calculate feature duration with wall clock when durationAggregation is wallClock', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/json-parallel-time/',
        reportPath: REPORT_PATH,
        saveCollectedJSON: true,
        displayDuration: true,
        durationAggregation: 'wallClock',
      });

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      expect(enriched.features[0].time).toEqual('00:00:15.000');
      // expect(fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'index.html'), 'utf8')).toContain(
      //   '>Duration (wall clock)<',
      // );
    });

    it('should fallback to summed duration when wallClock is selected but timestamps are missing', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/json-partial-parallel-time/',
        reportPath: REPORT_PATH,
        saveCollectedJSON: true,
        displayDuration: true,
        durationAggregation: 'wallClock',
      });

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      expect(enriched.features[0].time).toEqual('00:00:20.000');
    });

    it('should keep summed duration by default even when timestamps are present', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/json-parallel-time/',
        reportPath: REPORT_PATH,
        saveCollectedJSON: true,
        displayDuration: true,
      });

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      expect(enriched.features[0].time).toEqual('00:00:20.000');
      // expect(fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'index.html'), 'utf8')).toContain('>Duration<');
    });
  });
});
