import fs from 'fs-extra';
import { listJsonFiles } from '@/collect-jsons.js';
import * as multiCucumberHTMLReporter from '@/generate-report.js';
import { streamFeaturesFromMessagesFile } from '@/messages-ndjson.js';

const REPORT_PATH = './.tmp/messages-ndjson';
const INPUT = './src/test/unit/data/messages-ndjson/happy.ndjson';

describe('Cucumber Messages NDJSON input', () => {
  it('recognizes Messages streams saved with a .json filename', () => {
    const files = listJsonFiles({
      jsonDir: './src/test/unit/data/messages-json',
      reportPath: REPORT_PATH,
      useCucumberMessages: true,
    });

    expect(files).toContain(jasmine.stringMatching(/cucumber-report\.json$/));
  });

  it('streams Messages envelopes into the legacy feature shape', async () => {
    const features = [];
    for await (const feature of streamFeaturesFromMessagesFile(INPUT, { keepEmbeddingData: false }))
      features.push(feature);

    expect(features).toHaveSize(1);
    expect(features[0].name).toBe('Messages feature');
    expect(features[0].elements[0].steps[0].result.status).toBe('passed');
    expect(features[0].elements[0].steps[0].embeddings?.[0].data).toBe('');
  });

  it('uses NDJSON only when explicitly enabled', async () => {
    fs.removeSync(REPORT_PATH);
    await multiCucumberHTMLReporter.generate({
      jsonDir: './src/test/unit/data/messages-ndjson',
      reportPath: REPORT_PATH,
      useCucumberMessages: true,
      saveCollectedJSON: true,
    });

    const report = fs.readFileSync(`${REPORT_PATH}/index.html`, 'utf8');
    const enriched = fs.readJsonSync(`${REPORT_PATH}/enriched-output.json`);
    expect(report).toContain('Messages feature');
    const text = enriched.features[0].elements[0].steps[0].text[0];
    expect(Buffer.from(text.data).toString()).toBe('hello');
  });

  describe('missing envelope handling on testCaseFinished', () => {
    const tmpFile = './.tmp/messages-ndjson/invalid-envelope-test.ndjson';

    beforeEach(() => {
      fs.ensureDirSync('./.tmp/messages-ndjson');
    });

    afterEach(() => {
      fs.removeSync(tmpFile);
    });

    const lines = [
      '{"gherkinDocument":{"uri":"features/messages.feature","feature":{"location":{"line":1},"language":"en","keyword":"Feature","name":"Messages feature","description":"Generated from NDJSON","children":[{"scenario":{"id":"scenario-1","location":{"line":3},"keyword":"Scenario","name":"passes","description":"","steps":[{"id":"step-1","location":{"line":4},"keyword":"Given ","text":"a message"}],"examples":[]}}]}}}',
      '{"pickle":{"id":"pickle-1","uri":"features/messages.feature","location":{"line":3},"name":"passes","language":"en","steps":[{"id":"pickle-step-1","astNodeIds":["step-1"],"text":"a message"}],"astNodeIds":["scenario-1"],"tags":[]}}',
      '{"testCase":{"id":"case-1","pickleId":"pickle-1","testSteps":[{"id":"test-step-1","pickleStepId":"pickle-step-1"}]}}',
      '{"testCaseStarted":{"id":"started-1","testCaseId":"case-1","attempt":0,"timestamp":{"seconds":1700000000,"nanos":0}}}',
      '{"testCaseFinished":{"testCaseStartedId":"started-1","timestamp":{"seconds":1700000001,"nanos":0},"willBeRetried":false}}',
    ];

    async function drain(generator: AsyncGenerator<any>) {
      for await (const _ of generator) {
        // drain
      }
    }

    it('throws when testCaseStarted record is missing', async () => {
      const content = [lines[0], lines[1], lines[2], lines[4]].join('\n');
      fs.writeFileSync(tmpFile, content);

      await expectAsync(
        drain(streamFeaturesFromMessagesFile(tmpFile, { keepEmbeddingData: false })),
      ).toBeRejectedWithError(/Missing testCaseStarted record 'started-1'/);
    });

    it('throws when testCase record is missing', async () => {
      const content = [lines[0], lines[1], lines[3], lines[4]].join('\n');
      fs.writeFileSync(tmpFile, content);

      await expectAsync(
        drain(streamFeaturesFromMessagesFile(tmpFile, { keepEmbeddingData: false })),
      ).toBeRejectedWithError(/Missing testCase record 'case-1'/);
    });

    it('throws when pickle record is missing', async () => {
      const content = [lines[0], lines[2], lines[3], lines[4]].join('\n');
      fs.writeFileSync(tmpFile, content);

      await expectAsync(
        drain(streamFeaturesFromMessagesFile(tmpFile, { keepEmbeddingData: false })),
      ).toBeRejectedWithError(/Missing pickle record 'pickle-1'/);
    });

    it('throws when gherkinDocument record is missing', async () => {
      const content = [lines[1], lines[2], lines[3], lines[4]].join('\n');
      fs.writeFileSync(tmpFile, content);

      await expectAsync(
        drain(streamFeaturesFromMessagesFile(tmpFile, { keepEmbeddingData: false })),
      ).toBeRejectedWithError(/Missing gherkinDocument record for URI 'features\/messages\.feature'/);
    });

    it('preserves testCase record across retry attempts sharing the same testCaseId', async () => {
      const retryLines = [
        lines[0], // gherkinDocument
        lines[1], // pickle
        lines[2], // testCase (case-1)
        // Attempt 0
        '{"testCaseStarted":{"id":"started-1","testCaseId":"case-1","attempt":0,"timestamp":{"seconds":1700000000,"nanos":0}}}',
        '{"testCaseFinished":{"testCaseStartedId":"started-1","timestamp":{"seconds":1700000001,"nanos":0},"willBeRetried":true}}',
        // Attempt 1 (retry)
        '{"testCaseStarted":{"id":"started-2","testCaseId":"case-1","attempt":1,"timestamp":{"seconds":1700000002,"nanos":0}}}',
        '{"testCaseFinished":{"testCaseStartedId":"started-2","timestamp":{"seconds":1700000003,"nanos":0},"willBeRetried":false}}',
      ];
      fs.writeFileSync(tmpFile, retryLines.join('\n'));

      const features = [];
      for await (const feature of streamFeaturesFromMessagesFile(tmpFile, { keepEmbeddingData: false })) {
        features.push(feature);
      }

      expect(features).toHaveSize(1);
      expect(features[0].elements).toHaveSize(2);
    });
  });
});
