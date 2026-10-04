#!/usr/bin/env node
/**
 * mchr — Multiple Cucumber HTML Reporter CLI
 *
 * Usage:
 *   mchr           Run report generation (reads config from cwd, or launches onboarding)
 *   mchr --help    Show this help message
 *   mchr --version Show the package version
 *
 * Environment variables:
 *   CI=true        Disables the interactive onboarding flow. The CLI will exit
 *                  with code 1 if no config file is found, instead of prompting.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generate } from '../generate-report.js';
import { LOG_LEVELS } from '../logger.js';
import type { LogLevel, Options } from '../types.js';
import { loadConfig } from './config-loader.js';
import { runOnboarding } from './onboarding.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, '../../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version as string;
  } catch {
    return 'unknown';
  }
}

function isCI(): boolean {
  return process.env.CI === 'true' || process.env.CI === '1';
}

async function main(): Promise<void> {
  const argv = await yargs(hideBin(process.argv))
    .scriptName('mchr')
    .version(readVersion())
    .alias('v', 'version')
    .help()
    .alias('h', 'help')
    .usage('$0 [options]\n\nMultiple Cucumber HTML Reporter CLI')
    .option('email', {
      alias: 'e',
      type: 'boolean',
      default: false,
      description: 'Generate an emailable HTML report summary (email-report.html)',
    })
    .option('log-level', {
      alias: 'l',
      type: 'string',
      description: `Set logging level (${LOG_LEVELS.join(', ')})`,
      choices: LOG_LEVELS as unknown as string[],
    })
    .option('silent', {
      type: 'boolean',
      default: false,
      description: 'Hide reporter logging completely (alias: --no-logging)',
      alias: 'no-logging',
    })
    .epilog(
      [
        'CONFIG FILES',
        '  The CLI looks for a config file in the current working directory in this',
        '  priority order:',
        '',
        '    .multiple-cucumber-html-reporterrc      (JSON, default)',
        '    .multiple-cucumber-html-reporter.json',
        '    .multiple-cucumber-html-reporter.js     (ESM / CJS)',
        '    .multiple-cucumber-html-reporter.ts     (TypeScript)',
        '    .multiple-cucumber-html-reporter.yaml',
        '',
        'EXAMPLE CONFIG (.multiple-cucumber-html-reporter.json)',
        '  {',
        '    "jsonDir": "./reports",',
        '    "reportPath": "./reports/html",',
        '    "reportName": "My Test Report",',
        '    "logging": "warn",',
        '    "displayDuration": true,',
        '    "displayChartPercentages": true',
        '  }',
        '',
        'CI PIPELINES',
        '  When the CI environment variable is set to "true", the interactive',
        '  onboarding flow is disabled. The CLI will exit with a non-zero code if no',
        '  config file is found.',
        '',
        'MORE INFO',
        '  https://multiple-cucumber-html-reporter.com/',
      ].join('\n'),
    )
    .strict()
    .parseAsync();

  const cwd = process.cwd();

  // ── 1. Try to load an existing config
  let configResult = await loadConfig(cwd);

  if (!configResult) {
    // ── 2a. CI mode: no config → hard fail
    if (isCI()) {
      console.error(
        '\n  ✖ No config file found in the current directory.\n' +
          '    Create a .multiple-cucumber-html-reporter.json file to use the CLI in CI.\n' +
          '    Run `mchr` interactively (without CI=true) to generate the config file.\n',
      );
      process.exit(1);
    }

    // ── 2b. Interactive mode: run onboarding
    const { options, configPath } = await runOnboarding(cwd);
    configResult = { options, filePath: configPath };
  } else {
    p.intro(`Multiple Cucumber HTML Reporter v${readVersion()}`);
    console.log(`  Config: ${path.relative(cwd, configResult.filePath)}`);
  }

  // ── Apply CLI overrides on top of file config
  const options: Options = { ...configResult.options };

  if (argv.email) {
    options.emailReport = true;
  }

  if (argv.silent) {
    options.logging = 'silent';
  }

  const rawLogLevel = argv['log-level'] as LogLevel | undefined;
  if (rawLogLevel) {
    options.logging = rawLogLevel;
  }

  configResult.options = options;

  // ── 3. Generate the report
  const spinner = p.spinner();
  spinner.start('Generating HTML report…');

  try {
    await generate(configResult.options);
    spinner.stop('Report generated successfully!');

    const reportIndex = path.join(path.resolve(cwd, configResult.options.reportPath), 'index.html');
    if (configResult.options.emailReport) {
      const emailReportPath = path.join(path.resolve(cwd, configResult.options.reportPath), 'email-report.html');
      p.outro(`Report ready:\n  - Main Report:  ${reportIndex}\n  - Email Report: ${emailReportPath}`);
    } else {
      p.outro(`Report ready: ${reportIndex}`);
    }
    process.exit(0);
  } catch (error: unknown) {
    spinner.stop(`Report generation failed.`);
    if (error instanceof Error) {
      p.log.error(error.message);
    } else {
      p.log.error(String(error));
    }
    p.outro('See the error above for details.');
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`\n  ✖ Unexpected error: ${message}\n`);
  process.exit(1);
});
