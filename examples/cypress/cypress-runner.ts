import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import cypress from 'cypress';
import { generate, type Metadata } from 'multiple-cucumber-html-reporter';

const browsers = ['chrome', 'firefox'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rawJsonDir = join(__dirname, '.run/reports/json');

function updateFeatureFileNameByBrowser(filePath: string, browser: string): Record<string, Metadata> {
  const metadata: Metadata = {
    device: 'Local Test Machine',
  };
  const customMetadata: Record<string, Metadata> = {};
  const rawData = readFileSync(filePath, 'utf-8');

  if (!rawData.trim()) return customMetadata;

  const suiteData = JSON.parse(rawData);

  suiteData.forEach((feature: any) => {
    const originalName = feature.name;
    feature.name = `${originalName} [${browser}]`;
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
  if (existsSync(rawJsonDir)) {
    rmSync(rawJsonDir, { recursive: true, force: true });
  }
  mkdirSync(rawJsonDir, { recursive: true });

  let metadata: Record<string, Metadata> = {};

  // 2. Loop through each browser execution
  for (const browser of browsers) {
    console.log(`🚀 Running Cypress tests on browser: ${browser}...`);

    await cypress.run({
      browser,
    });

    // The preprocessor outputs to a default file name like "cucumber-report.json"
    const defaultJsonPath = join(rawJsonDir, 'cucumber-report.json');
    const targetedJsonPath = join(rawJsonDir, `cucumber_${browser}.json`);

    const customMetadata = updateFeatureFileNameByBrowser(defaultJsonPath, browser);
    metadata = { ...metadata, ...customMetadata };

    // Rename file immediately to prevent it from getting overwritten by the next browser loop
    if (existsSync(defaultJsonPath)) {
      renameSync(defaultJsonPath, targetedJsonPath);
      console.log(`✅ Saved browser JSON to: ${targetedJsonPath}`);
    }
  }

  // 3. Trigger multiple-cucumber-html-reporter to build the final dashboard
  console.log('📊 Generating merged HTML Report...');
  await generate({
    jsonDir: rawJsonDir,
    reportPath: join(__dirname, './.run/html-report/'),
    metadata,
    useCDN: true,
    pageTitle: 'Cypress Typescript Sample',
    reportName: 'Cypress Cucumber TS Report',
    customData: {
      projectName: 'Cypress Sample project',
      testCycle: process.env.GITHUB_RUN_ID || 'Cycle 1',
      buildNumber: process.env.GITHUB_RUN_NUMBER || 'Build 1',
      environment: 'production',
      ciPipeline: 'GitHub Actions',
    },
    openReportInBrowser: true,
  });
}

executeCrossBrowserTests().catch(console.error);
