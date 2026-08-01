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
    it('should create a report from the merged found json files with run-level custom data fields', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/json',
        reportPath: REPORT_PATH,
        staticFilePath: true,
        saveCollectedJSON: true,
        brandLogo: './src/templates/assets/images/logo.png',
        reportName: 'You can adjust this report name',
        customData: {
          projectName: 'Custom project',
          release: '1.2.3',
          testCycle: 'B11221.34321',
          buildNumber: 'CI-100',
          environment: 'staging',
          ciPipeline: 'GitHub Actions',
          hostname: 'runner-01',
          extraField: 'Extra run data',
        },
        metadata: {
          browser: {
            name: 'chrome',
            version: '120',
          },
          platform: {
            name: 'linux',
            version: 'x64',
          },
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

      // Verify that the run-level customData values appear in the generated index page
      const indexHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'index.html'), 'utf8');
      expect(indexHtml).withContext('projectName rendered').toContain('Custom project');
      expect(indexHtml).withContext('release rendered').toContain('1.2.3');
      expect(indexHtml).withContext('testCycle rendered').toContain('B11221.34321');
      expect(indexHtml).withContext('buildNumber rendered').toContain('CI-100');
      expect(indexHtml).withContext('environment rendered').toContain('staging');
      expect(indexHtml).withContext('ciPipeline rendered').toContain('GitHub Actions');
      expect(indexHtml).withContext('hostname rendered').toContain('runner-01');
      expect(indexHtml).withContext('extra customData rendered').toContain('Extra run data');

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      expect(enriched.features[0].metadata.browser.name).toEqual('chrome');
      expect(enriched.features[0].metadata.platform.name).toEqual('linux');
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

  describe('Metadata validation', () => {
    it('should throw an error when array metadata is provided without customMetadata: true', async () => {
      await expectAsync(
        multiCucumberHTMLReporter.generate({
          jsonDir: './src/test/unit/data/json',
          reportPath: REPORT_PATH,
          metadata: [{ name: 'Browser', value: 'Chrome 120' }],
          // customMetadata intentionally omitted (defaults to false)
        }),
      ).toBeRejectedWithError(/Invalid metadata format/);
    });

    it('should not throw when array metadata is provided with customMetadata: true', async () => {
      fs.removeSync(REPORT_PATH);
      await expectAsync(
        multiCucumberHTMLReporter.generate({
          jsonDir: './src/test/unit/data/custom-metadata-json/',
          reportPath: REPORT_PATH,
          customMetadata: true,
        }),
      ).toBeResolved();
    });

    it('should map well-known array metadata names to feature display fields', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-metadata-json/',
        reportPath: REPORT_PATH,
        customMetadata: true,
        saveCollectedJSON: true,
      });

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      // Features should have their metadata array intact in the enriched output
      const feature = enriched.features[0];
      expect(Array.isArray(feature.metadata)).toBeTrue();
    });
  });

  describe('attachmentLayout validation', () => {
    it('should throw an error when attachmentLayout is not "modal" or "inline"', async () => {
      await expectAsync(
        multiCucumberHTMLReporter.generate({
          jsonDir: './src/test/unit/data/json',
          reportPath: REPORT_PATH,
          attachmentLayout: 'wibble' as never,
        }),
      ).toBeRejectedWithError(/Invalid attachmentLayout/);
    });

    it('should not throw when attachmentLayout is left unset, "modal", or "inline"', async () => {
      fs.removeSync(REPORT_PATH);
      await expectAsync(
        multiCucumberHTMLReporter.generate({
          jsonDir: './src/test/unit/data/json',
          reportPath: REPORT_PATH,
        }),
      ).toBeResolved();

      fs.removeSync(REPORT_PATH);
      await expectAsync(
        multiCucumberHTMLReporter.generate({
          jsonDir: './src/test/unit/data/json',
          reportPath: REPORT_PATH,
          attachmentLayout: 'modal',
        }),
      ).toBeResolved();

      fs.removeSync(REPORT_PATH);
      await expectAsync(
        multiCucumberHTMLReporter.generate({
          jsonDir: './src/test/unit/data/json',
          reportPath: REPORT_PATH,
          attachmentLayout: 'inline',
        }),
      ).toBeResolved();
    });
  });

  describe('externalizeMedia', () => {
    it('should write image/video attachments to separate files and reference them by relative path', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-attachment-names/',
        reportPath: REPORT_PATH,
        externalizeMedia: true,
      });

      const mediaDir = path.join(process.cwd(), REPORT_PATH, 'assets', 'media');
      const mediaFiles = fs.readdirSync(mediaDir);
      expect(mediaFiles.length).toBeGreaterThan(0);

      const featureFiles = fs.readdirSync(path.join(process.cwd(), REPORT_PATH, 'features'));
      const featureHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'features', featureFiles[0]), 'utf8');
      expect(featureHtml).toContain('../assets/media/');
      // The page's inline chart-data blob (Pass 1's embeddings-free summary)
      // legitimately contains the bare "data:image/png;base64," prefix with
      // no payload - only a REAL (non-empty) inline payload would indicate
      // externalizeMedia didn't work.
      expect(featureHtml).not.toMatch(/data:image\/png;base64,[A-Za-z0-9+/=]{4,}/);
      expect(featureHtml).not.toMatch(/data:video\/webm;base64,[A-Za-z0-9+/=]{4,}/);
    });

    it('should inline image/video as data: URIs by default (no assets/media directory)', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-attachment-names/',
        reportPath: REPORT_PATH,
      });

      expect(fs.pathExistsSync(path.join(process.cwd(), REPORT_PATH, 'assets', 'media'))).toBeFalse();

      const featureFiles = fs.readdirSync(path.join(process.cwd(), REPORT_PATH, 'features'));
      const featureHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'features', featureFiles[0]), 'utf8');
      expect(featureHtml).toMatch(/data:image\/png;base64,[A-Za-z0-9+/=]{4,}/);
    });
  });

  describe('attachmentLayout rendering', () => {
    it('should render inline "+ Show Info"/"+ Screenshot" links and omit the modal-trigger block when set to "inline"', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-attachment-names/',
        reportPath: REPORT_PATH,
        attachmentLayout: 'inline',
      });

      const featureFiles = fs.readdirSync(path.join(process.cwd(), REPORT_PATH, 'features'));
      const featureHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'features', featureFiles[0]), 'utf8');
      expect(featureHtml).toContain('+ Show Info');
      expect(featureHtml).toContain('+ Screenshot');
      expect(featureHtml).toContain('+ Video');
      expect(featureHtml).not.toContain('modal-trigger');
    });

    it('should render the modal-trigger attachments block and no inline links by default', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-attachment-names/',
        reportPath: REPORT_PATH,
      });

      const featureFiles = fs.readdirSync(path.join(process.cwd(), REPORT_PATH, 'features'));
      const featureHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'features', featureFiles[0]), 'utf8');
      expect(featureHtml).toContain('modal-trigger');
      expect(featureHtml).not.toContain('+ Show Info');
    });
  });

  describe('html attachments in modal layout', () => {
    it('should render a clickable item for text/html attachments (previously silently missing)', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-attachment-names/',
        reportPath: REPORT_PATH,
      });

      const featureFiles = fs.readdirSync(path.join(process.cwd(), REPORT_PATH, 'features'));
      const featureHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'features', featureFiles[0]), 'utf8');
      expect(featureHtml).toContain('data-attachment-type="html"');
    });
  });

  describe('video-in-html sniffing', () => {
    it('should label a text/html attachment containing a <video> tag as "Video" in modal layout, and leave a plain html attachment alone', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/video-html-attachment/',
        reportPath: REPORT_PATH,
      });

      const featureFiles = fs.readdirSync(path.join(process.cwd(), REPORT_PATH, 'features'));
      const featureHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'features', featureFiles[0]), 'utf8');
      expect(featureHtml).toContain('data-is-video="true"');
      expect(featureHtml).toContain('data-attachment-name="Video"');
      expect(featureHtml).toContain('data-is-video="false"');
      expect(featureHtml).toContain('data-attachment-name="HTML - 1"');
    });

    it('should show a "+ Video" link and a scenario-recording caption in inline layout, and "+ Show Info" for the plain html attachment', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/video-html-attachment/',
        reportPath: REPORT_PATH,
        attachmentLayout: 'inline',
      });

      const featureFiles = fs.readdirSync(path.join(process.cwd(), REPORT_PATH, 'features'));
      const featureHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'features', featureFiles[0]), 'utf8');
      expect(featureHtml).toContain('+ Video');
      expect(featureHtml).toContain('+ Show Info');
      expect(featureHtml).toContain('Recording of: A recorded scenario');
    });
  });

  describe('modal popup behavior options', () => {
    it('should render the original classic backdrop modal by default', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-attachment-names/',
        reportPath: REPORT_PATH,
      });

      const indexHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'index.html'), 'utf8');
      expect(indexHtml).toContain('bg-black/50');
      expect(indexHtml).not.toContain('media-modal-backdrop');
      expect(indexHtml).not.toContain('data-resize-dir');
    });

    it('should render a separate backdrop-less floating panel when modalBackdrop is false', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-attachment-names/',
        reportPath: REPORT_PATH,
        modalBackdrop: false,
      });

      const indexHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'index.html'), 'utf8');
      expect(indexHtml).not.toContain('media-modal-backdrop');
      expect(indexHtml).not.toContain('bg-black/50');
    });

    it('should add drag styling when modalDraggable is true', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-attachment-names/',
        reportPath: REPORT_PATH,
        modalDraggable: true,
      });

      const indexHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'index.html'), 'utf8');
      expect(indexHtml).toContain('cursor-move');
    });

    it('should add 8 resize handles when modalResizable is true', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-attachment-names/',
        reportPath: REPORT_PATH,
        modalResizable: true,
      });

      const indexHtml = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'index.html'), 'utf8');
      expect((indexHtml.match(/data-resize-dir/g) || []).length).toBe(8);
    });

    it('should emit step-context attributes on attachment triggers when modalShowContext is true, and omit them by default', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-attachment-names/',
        reportPath: REPORT_PATH,
        modalShowContext: true,
      });

      const featureFiles = fs.readdirSync(path.join(process.cwd(), REPORT_PATH, 'features'));
      const withContext = fs.readFileSync(path.join(process.cwd(), REPORT_PATH, 'features', featureFiles[0]), 'utf8');
      expect(withContext).toContain('data-step-context=');

      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/custom-attachment-names/',
        reportPath: REPORT_PATH,
      });

      const defaultFeatureFiles = fs.readdirSync(path.join(process.cwd(), REPORT_PATH, 'features'));
      const withoutContext = fs.readFileSync(
        path.join(process.cwd(), REPORT_PATH, 'features', defaultFeatureFiles[0]),
        'utf8',
      );
      expect(withoutContext).not.toContain('data-step-context=');
    });
  });

  describe('Logging', () => {
    it('should suppress reporter logs when logging is disabled', async () => {
      fs.removeSync(REPORT_PATH);
      spyOn(console, 'error');
      spyOn(console, 'warn');
      spyOn(console, 'log');
      spyOn(console, 'debug');
      spyOn(console, 'trace');

      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/json',
        reportPath: REPORT_PATH,
        logging: false,
      });

      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.trace).not.toHaveBeenCalled();
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

  describe('Metadata from files', () => {
    const tempMetadataDir = path.resolve(process.cwd(), './.tmp/metadata-files-test');

    beforeEach(async () => {
      await fs.ensureDir(tempMetadataDir);
    });

    afterEach(async () => {
      await fs.remove(tempMetadataDir);
    });

    it('should load metadata from a JSON file', async () => {
      fs.removeSync(REPORT_PATH);
      await fs.ensureDir(tempMetadataDir);

      const jsonPath = path.join(tempMetadataDir, 'metadata.json');
      const mockMetadata = {
        browser: { name: 'chrome-json', version: '121' },
        platform: { name: 'linux-json', version: 'x64' },
      };
      await fs.writeJson(jsonPath, mockMetadata);

      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/json',
        reportPath: REPORT_PATH,
        staticFilePath: true,
        saveCollectedJSON: true,
        metadataFilePath: jsonPath,
      });

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      expect(enriched.features[0].metadata.browser.name).toEqual('chrome-json');
      expect(enriched.features[0].metadata.platform.name).toEqual('linux-json');
    });

    it('should override metadata property if metadataFilePath is set', async () => {
      fs.removeSync(REPORT_PATH);
      await fs.ensureDir(tempMetadataDir);

      const jsonPath = path.join(tempMetadataDir, 'metadata-override.json');
      const mockFileMetadata = {
        browser: { name: 'file-browser', version: '1.0' },
        platform: { name: 'file-platform', version: '2.0' },
      };
      await fs.writeJson(jsonPath, mockFileMetadata);

      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/json',
        reportPath: REPORT_PATH,
        saveCollectedJSON: true,
        metadata: {
          browser: { name: 'option-browser', version: '9.0' },
        },
        metadataFilePath: jsonPath,
      });

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      expect(enriched.features[0].metadata.browser.name).toEqual('file-browser');
      expect(enriched.features[0].metadata.platform.name).toEqual('file-platform');
    });

    it('should throw an error if the metadata file does not exist', async () => {
      const missingPath = path.join(tempMetadataDir, 'does-not-exist.json');
      await expectAsync(
        multiCucumberHTMLReporter.generate({
          jsonDir: './src/test/unit/data/json',
          reportPath: REPORT_PATH,
          metadataFilePath: missingPath,
        }),
      ).toBeRejectedWithError(/Metadata file not found at/);
    });
  });
});
