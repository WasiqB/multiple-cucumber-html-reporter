import path from 'node:path';
import type { Options } from '../types.js';
import { prompts as p } from './prompts.js';

export type OnboardingResult = {
  options: Options;
  configPath: string;
};

function cancelOnboarding(): never {
  p.cancel('Setup cancelled.');
  process.exit(0);
}

/**
 * Runs the interactive Clack onboarding flow to collect reporter options
 * from the user, writes the resulting config as JSON to `cwd`, and returns
 * both the options and the path of the created config file.
 *
 * @param cwd Directory where the config file should be written.
 */
export async function runOnboarding(cwd: string = process.cwd()): Promise<OnboardingResult> {
  p.intro('Welcome to Multiple Cucumber HTML Reporter!');
  p.note(
    "No config file was found in the current directory.\nLet's create one so you can generate reports with a single command.",
    'One-time setup',
  );

  const required = await p.group(
    {
      jsonDir: () =>
        p.text({
          message: 'Where are your Cucumber JSON report files?',
          placeholder: './reports',
          validate: (v) => (!v?.trim() ? 'JSON directory is required.' : undefined),
        }),
      reportPath: () =>
        p.text({
          message: 'Where should the HTML report be generated?',
          placeholder: './reports/html',
          validate: (v) => (!v?.trim() ? 'Report output path is required.' : undefined),
        }),
    },
    {
      onCancel: () => {
        cancelOnboarding();
      },
    },
  );

  const extras = await p.multiselect<string>({
    message: 'Which optional features would you like to configure?',
    options: [
      { value: 'reportMeta', label: 'Report name, logo & page title' },
      { value: 'durations', label: 'Duration display options' },
      { value: 'charts', label: 'Chart percentages' },
      { value: 'browser', label: 'Open report in browser after generation' },
      { value: 'customData', label: 'Custom run data (project, release, environment…)' },
      { value: 'metadataFilePath', label: 'Path to metadata JSON file' },
      { value: 'metadata', label: 'Execution metadata (browser, platform, device)' },
      { value: 'cdn', label: 'Load assets from CDN (faster for CI)' },
      { value: 'logging', label: 'Reporter logging level' },
    ],
    required: false,
  });

  if (p.isCancel(extras)) {
    return cancelOnboarding();
  }

  const selected = extras as string[];

  // ── Collect values for each selected extra ────────────────────────────────
  const options: Options = {
    jsonDir: (required.jsonDir as string).trim(),
    reportPath: (required.reportPath as string).trim(),
  };

  // Report meta
  if (selected.includes('reportMeta')) {
    const meta = await p.group({
      reportName: () =>
        p.text({
          message: 'Report name (displayed as the heading inside the report)',
          placeholder: 'Multiple Cucumber HTML Reporter',
        }),
      logo: () =>
        p.text({
          message: 'Report logo (displayed inside the report)',
          placeholder: 'logo.png',
        }),
      pageTitle: () =>
        p.text({
          message: 'HTML page title (browser tab title)',
          placeholder: 'Multiple Cucumber HTML Reporter',
        }),
    });
    if (p.isCancel(meta)) {
      return cancelOnboarding();
    }
    if (((meta.reportName as string) || '').trim()) options.reportName = (meta.reportName as string).trim();
    if (((meta.pageTitle as string) || '').trim()) options.pageTitle = (meta.pageTitle as string).trim();
    if (((meta.logo as string) || '').trim()) options.brandLogo = (meta.logo as string).trim();
  }

  if (selected.includes('durations')) {
    const dur = await p.group({
      displayDuration: () => p.confirm({ message: 'Show scenario duration column in the report?', initialValue: true }),
      displayReportTime: () => p.confirm({ message: 'Show report generation time?', initialValue: true }),
      durationInMS: () =>
        p.confirm({
          message: 'Are your Cucumber JSON durations in milliseconds? (default is nanoseconds)',
          initialValue: false,
        }),
      durationAggregation: () =>
        p.select<'sum' | 'wallClock'>({
          message: 'How should total feature duration be calculated?',
          options: [
            { value: 'sum', label: 'Sum of all scenario durations', hint: 'default' },
            { value: 'wallClock', label: 'Wall-clock time (latest end − earliest start)' },
          ],
        }),
    });
    if (p.isCancel(dur)) {
      return cancelOnboarding();
    }
    options.displayDuration = dur.displayDuration as boolean;
    options.displayReportTime = dur.displayReportTime as boolean;
    options.durationInMS = dur.durationInMS as boolean;
    options.durationAggregation = dur.durationAggregation as 'sum' | 'wallClock';
  }

  // Chart percentages
  if (selected.includes('charts')) {
    const chart = await p.confirm({
      message: 'Display percentage labels inside the doughnut charts?',
      initialValue: true,
    });
    if (p.isCancel(chart)) {
      return cancelOnboarding();
    }
    options.displayChartPercentages = chart as boolean;
  }

  if (selected.includes('browser')) {
    const openBrowser = await p.confirm({
      message: 'Open the generated report in your default browser?',
      initialValue: false,
    });
    if (p.isCancel(openBrowser)) {
      return cancelOnboarding();
    }
    options.openReportInBrowser = openBrowser as boolean;
  }

  if (selected.includes('cdn')) {
    const useCDN = await p.confirm({
      message: 'Load report assets (JS/CSS) from a CDN?',
      initialValue: true,
    });
    if (p.isCancel(useCDN)) {
      return cancelOnboarding();
    }
    options.useCDN = useCDN as boolean;
  }

  if (selected.includes('logging')) {
    const logging = await p.select<'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace'>({
      message: 'Which reporter log level should be used?',
      options: [
        { value: 'info', label: 'info', hint: 'default' },
        { value: 'warn', label: 'warn' },
        { value: 'error', label: 'error' },
        { value: 'debug', label: 'debug' },
        { value: 'trace', label: 'trace' },
        { value: 'silent', label: 'silent', hint: 'hide reporter logs' },
      ],
    });
    if (p.isCancel(logging)) {
      return cancelOnboarding();
    }
    options.logging = logging;
  }

  if (selected.includes('customData')) {
    p.note('Leave any field blank to skip it.', 'Custom run data');
    const cd = await p.group({
      projectName: () => p.text({ message: 'Project name', placeholder: 'My Project' }),
      release: () => p.text({ message: 'Release / version', placeholder: '1.0.0' }),
      testCycle: () => p.text({ message: 'Test cycle', placeholder: 'Regression' }),
      buildNumber: () => p.text({ message: 'Build number', placeholder: 'CI-001' }),
      environment: () => p.text({ message: 'Target environment', placeholder: 'staging' }),
      ciPipeline: () => p.text({ message: 'CI pipeline name', placeholder: 'GitHub Actions' }),
    });
    if (p.isCancel(cd)) {
      return cancelOnboarding();
    }

    const customData: Record<string, string> = {};
    for (const [key, value] of Object.entries(cd)) {
      if (typeof value === 'string' && value.trim()) {
        customData[key] = value.trim();
      }
    }
    if (Object.keys(customData).length > 0) {
      options.customData = customData;
    }
  }

  if (selected.includes('metadataFilePath')) {
    const mdfp = await p.text({
      message: 'Path to metadata JSON file',
      placeholder: './metadata.json',
    });
    if (p.isCancel(mdfp)) {
      return cancelOnboarding();
    }
    if ((mdfp as string).trim()) {
      options.metadataFilePath = (mdfp as string).trim();
    }
  }

  if (selected.includes('metadata') && !options.metadataFilePath) {
    p.note('Leave any field blank to skip it.', 'Execution metadata');
    const md = await p.group({
      browserName: () => p.text({ message: 'Browser name', placeholder: 'chrome' }),
      browserVersion: () => p.text({ message: 'Browser version', placeholder: '120' }),
      platformName: () => p.text({ message: 'Platform / OS name', placeholder: 'Windows' }),
      platformVersion: () => p.text({ message: 'Platform / OS version', placeholder: '11' }),
      device: () => p.text({ message: 'Device name (leave blank for desktop)', placeholder: '' }),
    });
    if (p.isCancel(md)) {
      return cancelOnboarding();
    }

    const metadata: Record<string, any> = {};
    if (((md.browserName as string) || '').trim()) {
      metadata.browser = {
        name: (md.browserName as string).trim(),
        version: ((md.browserVersion as string) || '').trim() || '',
      };
    }
    if (((md.platformName as string) || '').trim()) {
      metadata.platform = {
        name: (md.platformName as string).trim(),
        version: ((md.platformVersion as string) || '').trim() || '',
      };
    }
    if (((md.device as string) || '').trim()) {
      metadata.device = (md.device as string).trim();
    }
    if (Object.keys(metadata).length > 0) {
      options.metadata = metadata;
    }
  }

  const configFileName = '.multiple-cucumber-html-reporter.json';
  const configPath = path.join(cwd, configFileName);
  const { writeFile } = await import('node:fs/promises');
  await writeFile(configPath, JSON.stringify(options, null, 2), 'utf-8');

  p.note(`Config saved to: ${configPath}`, '✔ Config created');

  return { options, configPath };
}
