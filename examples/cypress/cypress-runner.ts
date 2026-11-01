import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import cypress from 'cypress';
import type { Metadata } from 'multiple-cucumber-html-reporter';

const browsers = ['chrome', 'firefox'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const formatterFolder = process.env.MESSAGES || 'json';
const formatterExt = formatterFolder === 'messages' ? '.ndjson' : '.json';
const rawReportDir = join(__dirname, `.run/reports/${formatterFolder}`);

function updateFeatureFileNameByBrowser(filePath: string, browser: string): Record<string, Metadata> {
  const metadata: Metadata = {
    device: 'Local Test Machine',
  };
  const customMetadata: Record<string, Metadata> = {};

  if (!existsSync(filePath)) return customMetadata;

  const rawData = readFileSync(filePath, 'utf-8');

  if (!rawData.trim()) return customMetadata;

  if (formatterFolder === 'messages') {
    const lines = rawData.split('\n');
    const updatedLines = lines.map((line) => {
      if (!line.trim()) return line;
      try {
        const envelope = JSON.parse(line);
        const updateUri = (uri: string): string => uri.replace('.feature', `-${browser}.feature`);

        if (envelope.source?.uri) {
          envelope.source.uri = updateUri(envelope.source.uri);
        }
        if (envelope.gherkinDocument) {
          if (envelope.gherkinDocument.uri) {
            envelope.gherkinDocument.uri = updateUri(envelope.gherkinDocument.uri);
          }
          if (envelope.gherkinDocument.feature) {
            const originalName = envelope.gherkinDocument.feature.name;
            envelope.gherkinDocument.feature.name = `${originalName} [${browser.toUpperCase()}]`;
          }
          const metaKey = envelope.gherkinDocument.uri?.split('/').pop();
          if (metaKey) {
            customMetadata[metaKey] = {
              ...metadata,
              browser: {
                name: browser,
                version: 'latest',
              },
            };
          }
        }
        if (envelope.pickle?.uri) {
          envelope.pickle.uri = updateUri(envelope.pickle.uri);
        }
        return JSON.stringify(envelope);
      } catch {
        return line;
      }
    });

    writeFileSync(filePath, updatedLines.join('\n'));
    return customMetadata;
  }

  const suiteData = JSON.parse(rawData);

  suiteData.forEach((feature: any) => {
    const originalName = feature.name;
    feature.name = `${originalName} [${browser.toUpperCase()}]`;
    feature.id = `${feature.id}-${browser}`;
    const fileName = feature.uri as string;
    feature.uri = fileName.replace('.feature', `-${browser}.feature`);

    const metaKey = (feature.uri as string).split('/').pop();
    if (metaKey) {
      customMetadata[metaKey] = {
        ...metadata,
        browser: {
          name: browser,
          version: 'latest',
        },
      };
    }
  });

  writeFileSync(filePath, JSON.stringify(suiteData, null, 2));

  return customMetadata;
}

async function executeCrossBrowserTests() {
  // 1. Clean up old reports before starting
  if (existsSync(rawReportDir)) {
    rmSync(rawReportDir, { recursive: true, force: true });
  }
  mkdirSync(rawReportDir, { recursive: true });

  let metadata: Record<string, Metadata> = {};

  // 2. Loop through each browser execution
  for (const browser of browsers) {
    console.log(`🚀 Running Cypress tests on browser: ${browser}...`);

    await cypress.run({
      browser,
    });

    // The preprocessor outputs to a default file name like "cucumber-report.json" or "cucumber-report.ndjson"
    const defaultReportPath = join(rawReportDir, `cucumber-report${formatterExt}`);
    const targetedReportPath = join(rawReportDir, `cucumber_${browser}${formatterExt}`);

    const customMetadata = updateFeatureFileNameByBrowser(defaultReportPath, browser);
    metadata = { ...metadata, ...customMetadata };

    // Rename file immediately to prevent it from getting overwritten by the next browser loop
    if (existsSync(defaultReportPath)) {
      renameSync(defaultReportPath, targetedReportPath);
      console.log(`✅ Saved browser report to: ${targetedReportPath}`);
    }
  }
  writeFileSync(join(__dirname, '.run/reports/metadata.json'), JSON.stringify(metadata, null, 2), 'utf8');
}

executeCrossBrowserTests().catch(console.error);
