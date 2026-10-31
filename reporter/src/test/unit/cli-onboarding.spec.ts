import path from 'node:path';
import fs from 'fs-extra';
import { runOnboarding } from '@/cli/onboarding.js';
import { prompts as p } from '@/cli/prompts.js';

const tempDir = path.resolve(process.cwd(), './.tmp/cli-onboarding-test');

describe('CLI Onboarding', () => {
  beforeEach(async () => {
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should create config file with metadataFilePath when metadataFilePath is selected', async () => {
    spyOn(p, 'intro');
    spyOn(p, 'note');
    spyOn(p, 'cancel');
    spyOn(p, 'isCancel').and.returnValue(false);
    spyOn(process, 'exit').and.callFake((() => {}) as any);

    spyOn(p, 'group').and.callFake((async (prompts: any) => {
      if (prompts.jsonDir) {
        return {
          jsonDir: './test-json',
          reportPath: './test-html',
        };
      }
      return {};
    }) as any);

    spyOn(p, 'select').and.resolveTo('json' as any);
    spyOn(p, 'multiselect').and.resolveTo(['metadataFilePath', 'metadata'] as any);
    spyOn(p, 'text').and.resolveTo('./custom-metadata.json' as any);

    const result = await runOnboarding(tempDir);

    expect(result.options.jsonDir).toBe('./test-json');
    expect(result.options.reportPath).toBe('./test-html');
    expect(result.options.metadataFilePath).toBe('./custom-metadata.json');
    expect(result.options.metadata).toBeUndefined();

    const writtenConfig = await fs.readJson(result.configPath);
    expect(writtenConfig).toEqual({
      jsonDir: './test-json',
      reportPath: './test-html',
      metadataFilePath: './custom-metadata.json',
    });
  });

  it('should prompt for metadata when metadata is selected and metadataFilePath is not set', async () => {
    spyOn(p, 'intro');
    spyOn(p, 'note');
    spyOn(p, 'cancel');
    spyOn(p, 'isCancel').and.returnValue(false);
    spyOn(process, 'exit').and.callFake((() => {}) as any);

    spyOn(p, 'group').and.callFake((async (prompts: any) => {
      if (prompts.jsonDir) {
        return {
          jsonDir: './test-json',
          reportPath: './test-html',
        };
      }
      if (prompts.browserName) {
        return {
          browserName: 'chrome',
          browserVersion: '120',
          platformName: 'macOS',
          platformVersion: '14.0',
          device: 'MacBook Pro',
        };
      }
      return {};
    }) as any);

    spyOn(p, 'select').and.resolveTo('json' as any);
    spyOn(p, 'multiselect').and.resolveTo(['metadata'] as any);

    const result = await runOnboarding(tempDir);

    expect(result.options.metadataFilePath).toBeUndefined();
    expect(result.options.metadata).toEqual({
      browser: { name: 'chrome', version: '120' },
      platform: { name: 'macOS', version: '14.0' },
      device: 'MacBook Pro',
    });
  });

  it('should configure reportMeta, durations, charts, browser, customData, and cdn options', async () => {
    spyOn(p, 'intro');
    spyOn(p, 'note');
    spyOn(p, 'cancel');
    spyOn(p, 'isCancel').and.returnValue(false);
    spyOn(process, 'exit').and.callFake((() => {}) as any);

    spyOn(p, 'group').and.callFake((async (prompts: any) => {
      if (prompts.jsonDir) {
        return { jsonDir: './reports', reportPath: './html' };
      }
      if (prompts.reportName) {
        return { reportName: ' My Report ', logo: ' logo.png ', pageTitle: ' Page Title ' };
      }
      if (prompts.displayDuration) {
        return {
          displayDuration: true,
          humanReadableDuration: true,
          displayReportTime: true,
          durationInMS: false,
          durationAggregation: 'wallClock',
        };
      }
      if (prompts.projectName) {
        return {
          projectName: 'My Project',
          release: '1.0.0',
          testCycle: '',
          buildNumber: '123',
          environment: 'staging',
          ciPipeline: '',
        };
      }
      return {};
    }) as any);

    spyOn(p, 'multiselect').and.resolveTo(['reportMeta', 'durations', 'charts', 'browser', 'customData', 'cdn'] as any);
    spyOn(p, 'confirm').and.resolveTo(true as any);
    spyOn(p, 'select').and.callFake((async (opts: any) => {
      if (opts.message.includes('duration')) return 'wallClock';
      if (opts.message.includes('format')) return 'json';
      return 'json';
    }) as any);

    const result = await runOnboarding(tempDir);

    expect(result.options.reportName).toBe('My Report');
    expect(result.options.brandLogo).toBe('logo.png');
    expect(result.options.pageTitle).toBe('Page Title');
    expect(result.options.displayDuration).toBeTrue();
    expect(result.options.humanReadableDuration).toBeTrue();
    expect(result.options.displayReportTime).toBeTrue();
    expect(result.options.durationInMS).toBeFalse();
    expect(result.options.durationAggregation).toBe('wallClock');
    expect(result.options.displayChartPercentages).toBeTrue();
    expect(result.options.openReportInBrowser).toBeTrue();
    expect(result.options.useCDN).toBeTrue();
    expect(result.options.customData).toEqual({
      projectName: 'My Project',
      release: '1.0.0',
      buildNumber: '123',
      environment: 'staging',
    });
  });

  it('should configure the reporter logging level', async () => {
    spyOn(p, 'intro');
    spyOn(p, 'note');
    spyOn(p, 'cancel');
    spyOn(p, 'isCancel').and.returnValue(false);
    spyOn(process, 'exit').and.callFake((() => {}) as any);

    spyOn(p, 'group').and.callFake((async (prompts: any) => {
      if (prompts.jsonDir) {
        return { jsonDir: './reports', reportPath: './html' };
      }
      return {};
    }) as any);

    spyOn(p, 'multiselect').and.resolveTo(['logging'] as any);
    spyOn(p, 'select').and.callFake((async (opts: any) => {
      if (opts.message.includes('log level')) return 'debug';
      if (opts.message.includes('format')) return 'json';
      return 'debug';
    }) as any);

    const result = await runOnboarding(tempDir);

    expect(result.options.logging).toBe('debug');

    const writtenConfig = await fs.readJson(result.configPath);
    expect(writtenConfig.logging).toBe('debug');
  });

  it('should configure Cucumber Messages NDJSON input', async () => {
    spyOn(p, 'intro');
    spyOn(p, 'note');
    spyOn(p, 'cancel');
    spyOn(p, 'isCancel').and.returnValue(false);
    spyOn(process, 'exit').and.callFake((() => {}) as any);

    spyOn(p, 'group').and.resolveTo({ jsonDir: './messages', reportPath: './html' } as any);
    spyOn(p, 'multiselect').and.resolveTo(['messages'] as any);
    spyOn(p, 'confirm').and.resolveTo(true as any);
    spyOn(p, 'select').and.resolveTo('json' as any);

    const result = await runOnboarding(tempDir);

    expect(result.options.useCucumberMessages).toBeTrue();
    expect((await fs.readJson(result.configPath)).useCucumberMessages).toBeTrue();
  });

  it('should exit when the logging prompt is cancelled', async () => {
    spyOn(p, 'intro');
    spyOn(p, 'note');
    spyOn(p, 'cancel');
    const exitSpy = spyOn(process, 'exit').and.callFake((() => {}) as any);

    spyOn(p, 'group').and.resolveTo({ jsonDir: './reports', reportPath: './html' } as any);
    spyOn(p, 'multiselect').and.resolveTo(['logging'] as any);
    spyOn(p, 'select').and.resolveTo(Symbol('cancel') as any);
    spyOn(p, 'isCancel').and.callFake(((val: any) => typeof val === 'symbol') as any);

    await runOnboarding(tempDir);

    expect(p.cancel).toHaveBeenCalledWith('Setup cancelled.');
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('should exit when the format prompt is cancelled', async () => {
    spyOn(p, 'intro');
    spyOn(p, 'note');
    spyOn(p, 'cancel');
    const exitSpy = spyOn(process, 'exit').and.callFake((() => {}) as any);

    spyOn(p, 'group').and.resolveTo({ jsonDir: './reports', reportPath: './html' } as any);
    spyOn(p, 'multiselect').and.resolveTo([] as any);
    spyOn(p, 'select').and.resolveTo(Symbol('cancel') as any);
    spyOn(p, 'isCancel').and.callFake(((val: any) => typeof val === 'symbol') as any);

    await runOnboarding(tempDir);

    expect(p.cancel).toHaveBeenCalledWith('Setup cancelled.');
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('should generate YAML config when yaml format is selected', async () => {
    spyOn(p, 'intro');
    spyOn(p, 'note');
    spyOn(p, 'cancel');
    spyOn(p, 'isCancel').and.returnValue(false);
    spyOn(process, 'exit').and.callFake((() => {}) as any);

    spyOn(p, 'group').and.resolveTo({ jsonDir: './reports', reportPath: './html' } as any);
    spyOn(p, 'multiselect').and.resolveTo([] as any);
    spyOn(p, 'select').and.resolveTo('yaml' as any);

    const result = await runOnboarding(tempDir);

    expect(result.configPath).toBe(path.join(tempDir, '.multiple-cucumber-html-reporter.yml'));
    const content = await fs.readFile(result.configPath, 'utf-8');
    expect(content).toContain('jsonDir: ./reports');
    expect(content).toContain('reportPath: ./html');
  });

  it('should generate JavaScript (ESM) config when js format is selected', async () => {
    spyOn(p, 'intro');
    spyOn(p, 'note');
    spyOn(p, 'cancel');
    spyOn(p, 'isCancel').and.returnValue(false);
    spyOn(process, 'exit').and.callFake((() => {}) as any);

    spyOn(p, 'group').and.resolveTo({ jsonDir: './reports', reportPath: './html' } as any);
    spyOn(p, 'multiselect').and.resolveTo([] as any);
    spyOn(p, 'select').and.resolveTo('js' as any);

    const result = await runOnboarding(tempDir);

    expect(result.configPath).toBe(path.join(tempDir, '.multiple-cucumber-html-reporter.js'));
    const content = await fs.readFile(result.configPath, 'utf-8');
    expect(content).toContain("/** @type {import('multiple-cucumber-html-reporter').Options} */");
    expect(content).toContain('export default {');
  });

  it('should generate TypeScript config when ts format is selected', async () => {
    spyOn(p, 'intro');
    spyOn(p, 'note');
    spyOn(p, 'cancel');
    spyOn(p, 'isCancel').and.returnValue(false);
    spyOn(process, 'exit').and.callFake((() => {}) as any);

    spyOn(p, 'group').and.resolveTo({ jsonDir: './reports', reportPath: './html' } as any);
    spyOn(p, 'multiselect').and.resolveTo([] as any);
    spyOn(p, 'select').and.resolveTo('ts' as any);

    const result = await runOnboarding(tempDir);

    expect(result.configPath).toBe(path.join(tempDir, '.multiple-cucumber-html-reporter.ts'));
    const content = await fs.readFile(result.configPath, 'utf-8');
    expect(content).toContain("import type { Options } from 'multiple-cucumber-html-reporter';");
    expect(content).toContain('const config: Options = {');
    expect(content).toContain('export default config;');
  });

  it('should validate jsonDir and reportPath text prompts', async () => {
    spyOn(p, 'intro');
    spyOn(p, 'note');
    spyOn(p, 'isCancel').and.returnValue(false);
    spyOn(p, 'text').and.callFake(((options: any) => options) as any);
    spyOn(p, 'select').and.resolveTo('json' as any);
    spyOn(process, 'exit').and.callFake((() => {}) as any);

    let jsonDirValidator: ((v?: string) => string | undefined) | undefined;
    let reportPathValidator: ((v?: string) => string | undefined) | undefined;

    spyOn(p, 'group').and.callFake((async (prompts: any) => {
      if (prompts.jsonDir) {
        jsonDirValidator = prompts.jsonDir().validate;
        reportPathValidator = prompts.reportPath().validate;
        return { jsonDir: './reports', reportPath: './html' };
      }
      return {};
    }) as any);

    spyOn(p, 'multiselect').and.resolveTo([] as any);

    await runOnboarding(tempDir);

    expect(jsonDirValidator?.('')).toBe('JSON directory is required.');
    expect(jsonDirValidator?.('  ')).toBe('JSON directory is required.');
    expect(jsonDirValidator?.('./reports')).toBeUndefined();

    expect(reportPathValidator?.('')).toBe('Report output path is required.');
    expect(reportPathValidator?.('  ')).toBe('Report output path is required.');
    expect(reportPathValidator?.('./html')).toBeUndefined();
  });

  it('should exit when multiselect step is cancelled', async () => {
    spyOn(p, 'intro');
    spyOn(p, 'note');
    spyOn(p, 'cancel');
    const exitSpy = spyOn(process, 'exit').and.callFake((() => {}) as any);

    spyOn(p, 'group').and.resolveTo({ jsonDir: './reports', reportPath: './html' } as any);
    spyOn(p, 'multiselect').and.resolveTo(Symbol('cancel') as any);
    spyOn(p, 'isCancel').and.callFake(((val: any) => {
      return typeof val === 'symbol';
    }) as any);

    await runOnboarding(tempDir);

    expect(p.cancel).toHaveBeenCalledWith('Setup cancelled.');
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
