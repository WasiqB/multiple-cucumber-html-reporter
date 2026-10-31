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
});
