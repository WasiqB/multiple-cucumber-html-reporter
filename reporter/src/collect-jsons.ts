import os from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import find from 'find';
import fs from 'fs-extra';
import jsonfile from 'jsonfile';
import { DateTime } from 'luxon';
import type { Feature, Metadata, Options, Step } from './types.js';

const { fileSync } = find;
const { readFileSync, statSync, ensureDirSync } = fs;
const { writeFileSync } = jsonfile;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = fs.readJsonSync(resolve(__dirname, '../package.json'));

/**
 * Formats input date to yyyy/MM/dd HH:mm:ss
 *
 * @param {Date | string} date
 * @returns {string} formatted date in ISO format local time
 */
function formatToLocalIso(date: Date | string): string {
  return typeof date === 'string'
    ? DateTime.fromISO(date).toFormat('yyyy/MM/dd HH:mm:ss')
    : DateTime.fromJSDate(date).toFormat('yyyy/MM/dd HH:mm:ss');
}

function getDefaultMetadata(): Exclude<Metadata, Array<any>> {
  return {
    browser: {
      name: 'not known',
      version: 'not known',
    },
    executionPlatform: 'local',
    username: os.userInfo().username,
    device: os.hostname(),
    platform: {
      name: os.type().trim(),
      version: os.release().trim(),
    },
    nodeVersion: process.version,
    reportVersion: packageJson.version,
    hostname: os.hostname(),
    architecture: os.arch(),
  };
}

/**
 * Merges user-supplied metadata with auto-detected defaults.
 * User-supplied values always take priority; defaults fill any gaps.
 * Array-form metadata (legacy key/value pairs) is returned as-is.
 */
function enrichMetadata(metadata: Metadata | undefined): Metadata {
  if (Array.isArray(metadata)) {
    return metadata;
  }

  const defaultMetadata = getDefaultMetadata();
  const userMetadata = metadata as Exclude<Metadata, Array<any>> | undefined;

  // Deep-merge: user values win, defaults fill missing keys.
  // For nested objects (browser, platform, app) merge one level deep so that
  // a user who only specifies `browser.name` still gets `browser.version` from defaults.
  const merged: Exclude<Metadata, Array<any>> = {
    ...defaultMetadata,
    ...userMetadata,
  };

  // Merge nested browser object
  if (userMetadata?.browser || defaultMetadata.browser) {
    merged.browser = {
      ...defaultMetadata.browser,
      ...(userMetadata?.browser ?? {}),
    } as any;
  }

  // Merge nested platform object
  if (userMetadata?.platform || defaultMetadata.platform) {
    merged.platform = {
      ...defaultMetadata.platform,
      ...(userMetadata?.platform ?? {}),
    } as any;
  }

  // Merge nested app object (only when user provided it — no default for app)
  if (userMetadata?.app) {
    merged.app = userMetadata.app;
  } else {
    delete merged.app;
  }

  return merged;
}

/**
 * Resolves the metadata to use for a given feature from options.metadata.
 * Handles both a shared `Metadata` object (applied to all features) and a
 * per-feature `Record<string, Metadata>` keyed by feature filename.
 *
 * Per-feature metadata is keyed by the cucumber feature filename. If the current
 * feature's filename is present, return that entry; otherwise treat the object
 * as shared metadata unless it contains other feature-file keys.
 */
function resolveOptionsMetadata(
  optionsMetadata: Metadata | Record<string, Metadata> | undefined,
  featureUri: string | undefined,
): Metadata | undefined {
  if (!optionsMetadata) return undefined;

  // Array-form Metadata is always treated as a shared value for all features
  if (Array.isArray(optionsMetadata)) {
    return optionsMetadata as Metadata;
  }

  const featureFileName = featureUri?.split('/').pop();
  const metadataMap = optionsMetadata as Record<string, Metadata>;

  if (featureFileName && metadataMap[featureFileName] !== undefined) {
    return metadataMap[featureFileName];
  }

  if (Object.keys(metadataMap).some((key) => key.endsWith('.feature'))) {
    return undefined;
  }

  // Plain shared Metadata
  return optionsMetadata as Metadata;
}

export default function collectJSONS(options: Options): Feature[] {
  const jsonOutput: Feature[] = [];
  let files: string[];

  try {
    files = fileSync(/\.json$/, resolve(process.cwd(), options.jsonDir));
  } catch (_e) {
    throw new Error(`There were issues reading JSON-files from '${options.jsonDir}'.`);
  }

  if (files.length > 0) {
    files.forEach((file) => {
      // Cucumber json can be  empty, it's likely being created by another process (#47)
      const data = readFileSync(file).toString() || '[]';
      const stats = statSync(file);
      const reportTime = stats.birthtime;

      const features: Feature[] = JSON.parse(data);

      features.forEach((json) => {
        // Resolve options.metadata for this specific feature (handles both shared
        // Metadata and per-feature Record<string, Metadata>), then merge with the
        // metadata embedded in the JSON report. Feature-embedded metadata wins over
        // options.metadata; both fill gaps with auto-detected system defaults.
        const optionsMeta = resolveOptionsMetadata(options.metadata, json.uri);
        const baseMeta = json.metadata || optionsMeta;
        // If both exist and neither is an array, deep-merge: embedded > options > defaults
        if (json.metadata && !Array.isArray(json.metadata) && optionsMeta && !Array.isArray(optionsMeta)) {
          json.metadata = enrichMetadata({ ...optionsMeta, ...json.metadata });
        } else {
          json.metadata = enrichMetadata(baseMeta);
        }

        if (json.metadata && options.displayReportTime && reportTime) {
          if (!Array.isArray(json.metadata)) {
            json.metadata = Object.assign({ reportTime: reportTime }, json.metadata);
            (json.metadata as any).reportTime = formatToLocalIso((json.metadata as any).reportTime);
          }
        }

        // Only check the feature hooks if there are elements (fail-safe)
        const { elements } = json;

        if (elements) {
          json.elements = elements.map((scenario) => {
            const { before, after } = scenario;

            if (before) {
              scenario.steps = parseFeatureHooks(before, 'Before').concat(scenario.steps);
            }
            if (after) {
              scenario.steps = scenario.steps.concat(parseFeatureHooks(after, 'After'));
            }

            return scenario;
          });
        }

        jsonOutput.push(json);
      });
    });

    if (options.saveCollectedJSON) {
      const file = resolve(options.reportPath, 'merged-output.json');
      ensureDirSync(options.reportPath);
      writeFileSync(file, jsonOutput, { spaces: 2 });
    }

    return jsonOutput;
  }

  console.log('\x1b[33m%s\x1b[0m', `WARNING: No JSON files found in '${options.jsonDir}'. NO REPORT CAN BE CREATED!`);
  return [];
}

/**
 * Add the feature hooks to the steps so the report will pick them up properly
 *
 * @param {object} data
 * @param {string} keyword
 * @returns {Step[]}
 */
function parseFeatureHooks(data: any[], keyword: string): Step[] {
  return data.map((step) => {
    const match = step.match?.location ? step.match : { location: 'can not be determined' };

    return {
      arguments: step.arguments || [],
      keyword: keyword,
      name: 'Hook',
      result: step.result,
      line: '',
      match,
      embeddings: step.embeddings || [],
    };
  });
}
