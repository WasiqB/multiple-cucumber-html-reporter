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

function printHelp(): void {
  console.log(`
  mchr — Multiple Cucumber HTML Reporter CLI v${readVersion()}

  USAGE
    mchr [options]

  OPTIONS
    --help, -h                 Show this help message and exit
    --version, -v              Print the version number and exit
    --log-level <level>        Set logging level: silent, error, warn, info,
                               debug, or trace
    --silent, --no-logging     Hide reporter logging completely

  CONFIG FILES
    The CLI looks for a config file in the current working directory in this
    priority order:

      .multiple-cucumber-html-reporterrc      (JSON, default)
      .multiple-cucumber-html-reporter.json
      .multiple-cucumber-html-reporter.js     (ESM / CJS)
      .multiple-cucumber-html-reporter.ts     (TypeScript)
      .multiple-cucumber-html-reporter.yaml

    The config file must export / contain an object that matches the Options
    type from the multiple-cucumber-html-reporter package.

  EXAMPLE CONFIG (.multiple-cucumber-html-reporter.json)
    {
      "jsonDir": "./reports",
      "reportPath": "./reports/html",
      "reportName": "My Test Report",
      "logging": "warn",
      "displayDuration": true,
      "displayChartPercentages": true
    }

  CI PIPELINES
    When the CI environment variable is set to "true", the interactive
    onboarding flow is disabled. The CLI will exit with a non-zero code if no
    config file is found.

  MORE INFO
    https://multiple-cucumber-html-reporter.vercel.app/
`);
}

function isCI(): boolean {
  return process.env.CI === 'true' || process.env.CI === '1';
}

function applyCliOptions(options: Options, args: string[]): Options {
  const nextOptions = { ...options };
  const silentAliases = new Set(['--silent', '--no-logging']);

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];

    if (silentAliases.has(arg)) {
      nextOptions.logging = 'silent';
      continue;
    }

    if (arg === '--log-level') {
      const level = args[index + 1];
      if (!level || !isLogLevel(level)) {
        throw new Error(`Invalid --log-level value. Expected one of: ${LOG_LEVELS.join(', ')}.`);
      }
      nextOptions.logging = level;
      index++;
      continue;
    }

    if (arg.startsWith('--log-level=')) {
      const level = arg.slice('--log-level='.length);
      if (!isLogLevel(level)) {
        throw new Error(`Invalid --log-level value. Expected one of: ${LOG_LEVELS.join(', ')}.`);
      }
      nextOptions.logging = level;
    }
  }

  return nextOptions;
}

function isLogLevel(value: string): value is LogLevel {
  return LOG_LEVELS.includes(value as LogLevel);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle --help / --version early, before any Clack output
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(readVersion());
    process.exit(0);
  }

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

  try {
    configResult.options = applyCliOptions(configResult.options, args);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    p.log.error(message);
    process.exit(1);
  }

  // ── 3. Generate the report
  const spinner = p.spinner();
  spinner.start('Generating HTML report…');

  try {
    await generate(configResult.options);
    spinner.stop('Report generated successfully!');

    const reportIndex = path.join(path.resolve(cwd, configResult.options.reportPath), 'index.html');
    p.outro(`Report ready: ${reportIndex}`);
    process.exit(0);
  } catch (error: unknown) {
    spinner.stop(`Report generation failed.`);
    if (error instanceof Error) {
      const message = error.message;
      p.log.error(message);
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
