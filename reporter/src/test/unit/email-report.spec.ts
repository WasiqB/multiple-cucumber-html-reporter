import path from 'node:path';
import fs from 'fs-extra';
import { generate } from '@/generate-report.js';

const tempDir = path.resolve(process.cwd(), './.tmp/email-report-test');

describe('Emailable Report', () => {
  beforeEach(async () => {
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should not generate email-report.html when emailReport is false or unset', async () => {
    await generate({
      jsonDir: './src/test/unit/data/json/',
      reportPath: tempDir,
      logging: 'silent',
    });

    const emailReportPath = path.join(tempDir, 'email-report.html');
    const exists = await fs.pathExists(emailReportPath);
    expect(exists).toBeFalse();

    const mainReportPath = path.join(tempDir, 'index.html');
    expect(await fs.pathExists(mainReportPath)).toBeTrue();
  });

  it('should generate email-report.html when emailReport is true', async () => {
    await generate({
      jsonDir: './src/test/unit/data/json/',
      reportPath: tempDir,
      emailReport: true,
      logging: 'silent',
      customData: {
        projectName: 'Email Project',
        release: '2.0.0',
        environment: 'staging',
      },
    });

    const emailReportPath = path.join(tempDir, 'email-report.html');
    const exists = await fs.pathExists(emailReportPath);
    expect(exists).toBeTrue();

    const content = await fs.readFile(emailReportPath, 'utf-8');

    // Context & Title
    expect(content).toContain('Executive Summary');
    expect(content).toContain('Email Project');
    expect(content).toContain('v2.0.0');
    expect(content).toContain('staging');

    // KPI & Summary
    expect(content).toContain('Features Summary');
    expect(content).toContain('Scenarios Summary');

    // Features & Scenario Statistics table
    expect(content).toContain('Features &amp; Scenario Statistics');

    // Top 5 Slowest Scenarios table
    expect(content).toContain('Top 5 Slowest Scenarios');

    // Main report CSS is embedded, while Font Awesome is loaded with its
    // webfonts from a pinned CDN stylesheet.
    expect(content).toContain('<style>');
    expect(content).toContain('tailwindcss');
    expect(content).toContain('https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.2.0/css/all.min.css');
    expect(content).not.toContain('src:url(../webfonts/');

    // Should NOT contain links back to index.html
    expect(content).not.toContain('index.html');
  });
});
