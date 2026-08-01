import { resolve } from 'node:path';
import find from 'find';
import fs from 'fs-extra';
import { createLogger } from './logger.js';
import { applyMetadataAndHooks } from './report-helpers.js';
import { streamFeaturesFromFile } from './streaming/json-stream.js';
import type { Feature, Options } from './types.js';

const { fileSync } = find;
const { statSync } = fs;

/**
 * Lists the JSON report files for a run, excluding the metadata file (if
 * configured). Shared between the lightweight aggregate pass and the
 * per-feature enrichment pass so both walk the exact same files in the exact
 * same order — the enrichment pass depends on this to line up each feature
 * with the id assigned to it during the aggregate pass.
 */
export function listJsonFiles(options: Options): string[] {
  const logger = createLogger(options.logging, options.disableLog);
  let files: string[];
  const jsonDir = resolve(process.cwd(), options.jsonDir);

  logger.debug('Collecting Cucumber JSON files.', { jsonDir });

  try {
    files = fileSync(/\.json$/, jsonDir);
  } catch (error) {
    logger.error('Failed to read Cucumber JSON files.', { jsonDir: options.jsonDir, resolvedJsonDir: jsonDir });
    logger.debug('JSON directory read error details.', { error });
    throw new Error(`There were issues reading JSON-files from '${options.jsonDir}'.`);
  }

  const metadataFilePath = options.metadataFilePath ? resolve(options.metadataFilePath) : null;
  const jsonFiles = metadataFilePath ? files.filter((file) => resolve(file) !== metadataFilePath) : files;

  if (jsonFiles.length > 0) {
    logger.info('Found Cucumber JSON files.', { count: jsonFiles.length, jsonDir: options.jsonDir });
    if (metadataFilePath) {
      logger.debug('Metadata file will be skipped during JSON collection.', { metadataFilePath });
    }
  }

  return jsonFiles;
}

/**
 * Streams every JSON report file, stripping step embedding payloads
 * (`embeddings[].data`) as it parses — never reads a whole file, or a whole
 * feature, into memory as a single string. Metadata (mime types, names) is
 * preserved so step-visibility decisions (e.g. a hidden hook step with an
 * attached screenshot) still come out correct downstream, without ever
 * materializing the actual base64 payload.
 *
 * This is "Pass 1": its output is what index.html is rendered from. Feature
 * pages are rendered separately (see generate-report.ts's
 * `_createFeatureIndexPages`) by re-streaming each file a second time with
 * embeddings intact, one feature at a time — that second pass is also where
 * `merged-output.json` gets written (if `saveCollectedJSON` is set), since
 * that file is expected to carry real attachment data, which this
 * (deliberately embeddings-free) pass never has.
 */
export default async function collectJSONS(options: Options): Promise<Feature[]> {
  const logger = createLogger(options.logging, options.disableLog);
  const files = listJsonFiles(options);

  if (files.length === 0) {
    logger.warn('No Cucumber JSON files found; report cannot be created.', { jsonDir: options.jsonDir });
    return [];
  }

  const jsonOutput: Feature[] = [];

  for (const file of files) {
    const reportTime = statSync(file).birthtime;

    for await (const rawFeature of streamFeaturesFromFile(file, { keepEmbeddingData: false })) {
      const feature = applyMetadataAndHooks(rawFeature, options, reportTime);
      jsonOutput.push(feature);
    }
  }

  logger.info('Collected Cucumber features.', { featureCount: jsonOutput.length, jsonFileCount: files.length });
  return jsonOutput;
}
