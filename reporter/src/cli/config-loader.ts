import path from 'node:path';
import { interpolate } from 'env-interpolation';
import { createJiti } from 'jiti';
import { load } from 'js-yaml';
import type { Options } from '../types.js';

/**
 * Supported config file names in priority order.
 * The first file found in the working directory is used.
 */
export const CONFIG_FILE_NAMES = [
  '.multiple-cucumber-html-reporterrc',
  '.multiple-cucumber-html-reporter.json',
  '.multiple-cucumber-html-reporter.js',
  '.multiple-cucumber-html-reporter.ts',
  '.multiple-cucumber-html-reporter.yml',
  '.multiple-cucumber-html-reporter.yaml',
] as const;

export type ConfigFileName = (typeof CONFIG_FILE_NAMES)[number];

/**
 * Resolves the path to a config file by searching `cwd` for each supported
 * filename in priority order.
 *
 * @param cwd Directory to search for the config file.
 * @returns The absolute path to the first matching config file, or `null`.
 */
export async function findConfigFile(cwd: string): Promise<{ filePath: string; fileName: ConfigFileName } | null> {
  const { pathExists } = await import('fs-extra');

  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = path.join(cwd, fileName);
    if (await pathExists(filePath)) {
      return { filePath, fileName };
    }
  }
  return null;
}

/**
 * Loads and parses the reporter `Options` from a config file.
 *
 * @param filePath Absolute path to the config file.
 * @param fileName The config file name (used to determine the parser).
 * @returns Parsed `Options` object.
 */
export async function loadConfigFile(filePath: string, fileName: ConfigFileName): Promise<Options> {
  const ext = path.extname(fileName) || '.json';

  if (ext === '.js' || ext === '.ts') {
    return loadModuleConfig(filePath);
  }

  if (ext === '.yml' || ext === '.yaml') {
    return loadYamlConfig(filePath);
  }

  return loadJsonConfig(filePath);
}

/**
 * Searches `cwd` for a config file and loads it.
 *
 * @param cwd Directory to search (defaults to `process.cwd()`).
 * @returns Parsed options and the resolved file path, or `null` if no config found.
 */
export async function loadConfig(cwd: string = process.cwd()): Promise<{ options: Options; filePath: string } | null> {
  const found = await findConfigFile(cwd);
  if (!found) return null;

  const options = await loadConfigFile(found.filePath, found.fileName);
  return { options, filePath: found.filePath };
}

async function loadJsonConfig(filePath: string): Promise<Options> {
  const { readFile } = await import('node:fs/promises');
  const content = await readFile(filePath, 'utf-8');
  return interpolate(JSON.parse(content)) as Options;
}

async function loadYamlConfig(filePath: string): Promise<Options> {
  const { readFile } = await import('node:fs/promises');
  const content = await readFile(filePath, 'utf-8');
  return load(interpolate(content)) as Options;
}

async function loadModuleConfig(filePath: string): Promise<Options> {
  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
  });
  const config = await jiti.import(filePath, {
    default: true,
  });
  return config as Options;
}
