import path from 'node:path';
import fs from 'fs-extra';
import { findConfigFile, loadConfig, loadConfigFile } from '@/cli/config-loader.js';

const tempDir = path.resolve(process.cwd(), './.tmp/cli-test');

describe('CLI Config Loader', () => {
  beforeEach(async () => {
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should return null when no config file exists', async () => {
    const res = await findConfigFile(tempDir);
    expect(res).toBeNull();

    const loaded = await loadConfig(tempDir);
    expect(loaded).toBeNull();
  });

  it('should detect and load .multiple-cucumber-html-reporterrc (JSON)', async () => {
    const configPath = path.join(tempDir, '.multiple-cucumber-html-reporterrc');
    const mockConfig = { jsonDir: './test-jsons', reportPath: './test-report' };
    await fs.writeJson(configPath, mockConfig);

    const found = await findConfigFile(tempDir);
    expect(found).not.toBeNull();
    expect(found?.fileName).toBe('.multiple-cucumber-html-reporterrc');

    const loaded = await loadConfig(tempDir);
    expect(loaded).not.toBeNull();
    expect(loaded?.options).toEqual(mockConfig);
    expect(loaded?.filePath).toBe(configPath);
  });

  it('should detect and load .multiple-cucumber-html-reporter.json', async () => {
    const configPath = path.join(tempDir, '.multiple-cucumber-html-reporter.json');
    const mockConfig = { jsonDir: './json-dir', reportPath: './report-path', reportName: 'JSON Report' };
    await fs.writeJson(configPath, mockConfig);

    const found = await findConfigFile(tempDir);
    expect(found).not.toBeNull();
    expect(found?.fileName).toBe('.multiple-cucumber-html-reporter.json');

    const options = await loadConfigFile(found!.filePath, found!.fileName);
    expect(options).toEqual(mockConfig);
  });

  it('should detect and load .multiple-cucumber-html-reporter.yaml', async () => {
    const configPath = path.join(tempDir, '.multiple-cucumber-html-reporter.yaml');
    const yamlContent = `
jsonDir: './yaml-json'
reportPath: './yaml-report'
reportName: 'YAML Report'
`;
    await fs.writeFile(configPath, yamlContent, 'utf-8');

    const found = await findConfigFile(tempDir);
    expect(found).not.toBeNull();
    expect(found?.fileName).toBe('.multiple-cucumber-html-reporter.yaml');

    const options = await loadConfigFile(found!.filePath, found!.fileName);
    expect(options).toEqual({
      jsonDir: './yaml-json',
      reportPath: './yaml-report',
      reportName: 'YAML Report',
    });
  });

  it('should detect and load .multiple-cucumber-html-reporter.js (ESM / CJS)', async () => {
    const configPath = path.join(tempDir, '.multiple-cucumber-html-reporter.js');
    const jsContent = `
export default {
  jsonDir: './js-json',
  reportPath: './js-report',
  reportName: 'JS Report'
};
`;
    await fs.writeFile(configPath, jsContent, 'utf-8');

    const found = await findConfigFile(tempDir);
    expect(found).not.toBeNull();
    expect(found?.fileName).toBe('.multiple-cucumber-html-reporter.js');

    const options = await loadConfigFile(found!.filePath, found!.fileName);
    expect(options).toEqual({
      jsonDir: './js-json',
      reportPath: './js-report',
      reportName: 'JS Report',
    });
  });

  it('should detect and load .multiple-cucumber-html-reporter.ts (TypeScript)', async () => {
    const configPath = path.join(tempDir, '.multiple-cucumber-html-reporter.ts');
    const tsContent = `
import type { Options } from '../types.js';
const config: Options = {
  jsonDir: './ts-json',
  reportPath: './ts-report',
  reportName: 'TS Report'
};
export default config;
`;
    await fs.writeFile(configPath, tsContent, 'utf-8');

    const found = await findConfigFile(tempDir);
    expect(found).not.toBeNull();
    expect(found?.fileName).toBe('.multiple-cucumber-html-reporter.ts');

    const options = await loadConfigFile(found!.filePath, found!.fileName);
    expect(options).toEqual({
      jsonDir: './ts-json',
      reportPath: './ts-report',
      reportName: 'TS Report',
    });
  });
});
