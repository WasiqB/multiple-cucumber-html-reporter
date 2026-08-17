import path from 'node:path';
import fs from 'fs-extra';
import * as multiCucumberHTMLReporter from '@/generate-report.js';

const REPORT_PATH = './.tmp/';

describe('generate-report.js duration handling', () => {
  describe('durationInMS handling', () => {
    // The "Slowest Steps" chart assumes all step durations are in
    // nanoseconds. If `durationInMS` is enabled, the durations arrive in
    // milliseconds, so we convert them to nanoseconds here to keep the chart
    // accurate. Otherwise, the chart reports values that are 1,000,000 times
    // smaller than the actual execution time.
    // Reference: https://github.com/WasiqB/multiple-cucumber-html-reporter/issues/568
    it('normalizes step.result.duration to nanoseconds when durationInMS is true', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/duration-in-ms-json',
        reportPath: REPORT_PATH,
        durationInMS: true,
        displayDuration: true,
        saveCollectedJSON: true,
      });

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      const feature = enriched.features[0];
      const step = feature.elements[0].steps[0];

      // The original duration is 5000 milliseconds (5 seconds). Since the
      // chart expects durations in nanoseconds, we convert the value by
      // multiplying it by 1,000,000 before embedding it.
      expect(step.result.duration).toEqual(5_000_000_000);

      // Normalizing the duration only affects the chart data. The duration
      // displayed for the step itself should remain unchanged (5 seconds).
      expect(step.time).toEqual('00:00:05.000');
    });

    // Some sources (e.g. certain Cypress cucumber-json setups) always report
    // step durations in nanoseconds, regardless of what a user configures
    // for `durationInMS`. Blindly trusting the option and multiplying an
    // already-nanosecond value by 1,000,000 produces a wildly inflated,
    // garbled duration in the UI. Detect this mismatch and leave the value
    // untouched instead.
    it('leaves step.result.duration untouched when it is already nanoseconds, even if durationInMS is true', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/duration-already-ns-json',
        reportPath: REPORT_PATH,
        durationInMS: true,
        displayDuration: true,
        saveCollectedJSON: true,
      });

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      const feature = enriched.features[0];
      const step = feature.elements[0].steps[0];

      // The source duration (5,000,000,000) is already nanoseconds (5
      // seconds). Even though durationInMS is true, it must not be
      // multiplied again into a nonsensical value.
      expect(step.result.duration).toEqual(5_000_000_000);
      expect(step.time).toEqual('00:00:05.000');
    });

    it('leaves step.result.duration untouched (nanoseconds) when durationInMS is false', async () => {
      fs.removeSync(REPORT_PATH);
      await multiCucumberHTMLReporter.generate({
        jsonDir: './src/test/unit/data/duration-in-ms-json',
        reportPath: REPORT_PATH,
        durationInMS: false,
        displayDuration: true,
        saveCollectedJSON: true,
      });

      const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
      const feature = enriched.features[0];
      const step = feature.elements[0].steps[0];

      // Source duration (5000) is already nanoseconds by default, so it
      // must be left unchanged.
      expect(step.result.duration).toEqual(5000);
    });
  });
});
