import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
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

    it('should render avif, webp and jpeg embeddings as screenshots (img tags) not as attachments', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/embedded-array-json/',
        reportName: 'Modern image format embeddings',
        reportPath: REPORT_PATH,
        saveCollectedJSON: true,
      });

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      const avifFeature = enriched.features.find((f: { name: string }) => f.name === 'AVIF image support');
      const steps = avifFeature.elements[0].steps;
      const avifStep = steps.find((s: { name: string }) => s.name === 'a step with an avif screenshot');
      const webpStep = steps.find((s: { name: string }) => s.name === 'a step with a webp screenshot');
      const jpegStep = steps.find((s: { name: string }) => s.name === 'a step with a jpeg screenshot');

      expect(avifStep.image[0]).toContain('data:image/avif;base64,');
      expect(webpStep.image[0]).toContain('data:image/webp;base64,');
      expect(jpegStep.image[0]).toContain('data:image/jpeg;base64,');
    });

    it('should use custom attachment names when provided and fall back to defaults otherwise', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-metadata-json/',
        reportPath: REPORT_PATH,
        customMetadata: true,
        saveCollectedJSON: true,
      });

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      const feature = enriched.features.find(
        (f: { name: string }) => f.name === 'Multiple json and plain text attachments',
      );
      const step = feature.elements[0].steps.find(
        (s: { name: string }) => s.name === "I see input with value 'Google Search'",
      );

      // Names land in the parallel *Names arrays, lined up index-for-index with
      // the data. Anything without a name comes back undefined (null once it has
      // been through JSON), and the template treats either as "use the default".
      expect(step.jsonNames[0]).toEqual('API Response Payload');
      expect(step.jsonNames[1]).toBeFalsy();
      expect(step.textNames[0]).toEqual('Browser Console');

      // And they should actually show up on the page (defaults still working too)
      const featureHtml = fs.readFileSync(
        path.join(process.cwd(), REPORT_PATH, 'features', `${feature.id}.html`),
        'utf8',
      );
      expect(featureHtml).toContain('API Response Payload');
      expect(featureHtml).toContain('Browser Console');
      expect(featureHtml).toContain('JSON 2');
    });

    it('should render donut charts that combine the count with the percentage when displayChartPercentages is on', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/json',
        reportPath: REPORT_PATH,
        displayChartPercentages: true,
        saveCollectedJSON: true,
      });

      // First, make sure the dashboard actually ships the script and the donut divs
      const indexHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'index.html'), 'utf8');
      expect(indexHtml).toContain('features-chart');
      expect(indexHtml).toContain('scenarios-chart');
      expect(indexHtml).toContain('steps-status-chart');
      // The opt-in flag should be wired through to the page config
      expect(indexHtml).toContain('displayChartPercentages: true');

      // The feature page must wire the flag through too. If it isn't passed, the
      // liquid `json` filter renders an empty value ("displayChartPercentages:")
      // which is a syntax error that kills the whole inline script - and with it
      // the feature data the charts need. Guard against that regression here.
      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      const featureId = enriched.features[0].id;
      const featureHtml = fs.readFileSync(
        path.join(process.cwd(), REPORT_PATH, 'features', `${featureId}.html`),
        'utf8',
      );
      expect(featureHtml).toContain('displayChartPercentages: true');

      // ApexCharts hides labels on slices under 10° by default, so double-check we turned that off
      const chartsSrc = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'scripts', 'charts.js'), 'utf8');
      expect(chartsSrc).toContain('minAngleToShowLabel: 0');

      // charts.js is browser code that hangs everything off window, so run it in
      // a throwaway VM context and poke at the real formatters it sets up. The
      // option is read from window.ReportConfig, so opt in before asking.
      const sandbox: { window: { ReportConfig?: any; ReportCharts?: any } } = {
        window: { ReportConfig: { displayChartPercentages: true } },
      };
      vm.createContext(sandbox);
      vm.runInContext(chartsSrc, sandbox);

      const opts = sandbox.window.ReportCharts.donutPercentOptions('light', '#000');
      const ctx = { w: { globals: { series: [3, 1] } } };

      // Slice label is just the percentage (ApexCharts hands us that number)
      expect(opts.dataLabels.enabled).toBeTrue();
      expect(opts.dataLabels.formatter(75)).toEqual('75%');
      // A tiny-but-real slice should still say something, not round away to "0%"
      expect(opts.dataLabels.formatter(0.4)).toEqual('<1%');
      expect(opts.dataLabels.formatter(2)).toEqual('2%');

      // Legend tacks the count onto the status name
      expect(opts.legend.formatter('Passed', { seriesIndex: 0, ...ctx })).toEqual('Passed: 3');

      // Tooltip gets the count from ApexCharts; we add the percentage
      expect(opts.tooltip.y.formatter(3, ctx)).toEqual('3 (75.0%)');
    });

    it('should keep donut charts plain (no slice percentages) by default', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/json',
        reportPath: REPORT_PATH,
      });

      // The page config should report the feature as off
      const indexHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'index.html'), 'utf8');
      expect(indexHtml).toContain('displayChartPercentages: false');

      const chartsSrc = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'scripts', 'charts.js'), 'utf8');

      // No ReportConfig (or the flag off) means slice labels stay disabled and the
      // tooltip is left to ApexCharts' default count-only rendering.
      const sandbox: { window: { ReportConfig?: any; ReportCharts?: any } } = { window: {} };
      vm.createContext(sandbox);
      vm.runInContext(chartsSrc, sandbox);

      const opts = sandbox.window.ReportCharts.donutPercentOptions('light', '#000');
      expect(opts.dataLabels.enabled).toBeFalse();
      expect(opts.tooltip.y).toBeUndefined();
      expect(opts.legend.formatter).toBeUndefined();
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

  describe('Custom attachment names', () => {
    let step: any;
    let featureHtml: string;

    beforeAll(async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-attachment-names/',
        reportPath: REPORT_PATH,
        saveCollectedJSON: true,
      });

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      const feature = enriched.features[0];
      step = feature.elements[0].steps.find((s: { name: string }) => s.name === 'all attachment types are embedded');
      featureHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'features', `${feature.id}.html`), 'utf8');
    });

    it('captures a top-level "name" for text/plain logs', () => {
      expect(step.textNames[0]).toEqual('Step Trace');
    });

    it('captures a top-level "fileName" for image attachments', () => {
      expect(step.imageNames[0]).toEqual('Login Screenshot');
    });

    it('captures a nested "media.name" for video attachments', () => {
      expect(step.videoNames[0]).toEqual('Session Recording');
    });

    it('captures a top-level "name" for JSON attachments', () => {
      expect(step.jsonNames[0]).toEqual('Request Body');
    });

    it('captures a nested "media.fileName" for html attachments', () => {
      expect(step.htmlNames[0]).toEqual('Rendered Email');
    });

    it('captures the name on generic (non-media) attachments', () => {
      expect(step.attachments[0].name).toEqual('Invoice PDF');
    });

    it('leaves the name absent when none is provided (falls back to default label)', () => {
      // The second item of every type was left unnamed, so it should come back falsy
      expect(step.textNames[1]).toBeFalsy();
      expect(step.imageNames[1]).toBeFalsy();
      expect(step.videoNames[1]).toBeFalsy();
      expect(step.jsonNames[1]).toBeFalsy();
      expect(step.htmlNames[1]).toBeFalsy();
      expect(step.attachments[1].name).toBeFalsy();
    });

    it('renders the custom names in the feature page', () => {
      expect(featureHtml).toContain('Step Trace');
      expect(featureHtml).toContain('Login Screenshot');
      expect(featureHtml).toContain('Session Recording');
      expect(featureHtml).toContain('Request Body');
      expect(featureHtml).toContain('Invoice PDF');
    });

    it('renders the default labels for attachments without a custom name', () => {
      expect(featureHtml).toContain('Log 2');
      expect(featureHtml).toContain('Screenshot 2');
      expect(featureHtml).toContain('Video 2');
      expect(featureHtml).toContain('JSON 2');
      expect(featureHtml).toContain('Attachment 2');
    });
  });
});
