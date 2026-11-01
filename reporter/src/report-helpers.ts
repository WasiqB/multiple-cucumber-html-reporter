import os from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { DateTime } from 'luxon';
import type { Feature, Metadata, Options, Step } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = fs.readJsonSync(resolve(__dirname, '../package.json'));

/**
 * Formats input date to yyyy/MM/dd HH:mm:ss
 *
 * @param {Date | string} date
 * @returns {string} formatted date in ISO format local time
 */
export function formatToLocalIso(date: Date | string): string {
  return typeof date === 'string'
    ? DateTime.fromISO(date).toFormat('yyyy/MM/dd HH:mm:ss')
    : DateTime.fromJSDate(date).toFormat('yyyy/MM/dd HH:mm:ss');
}

export function getDefaultMetadata(): Exclude<Metadata, Array<any>> {
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
export function enrichMetadata(metadata: Metadata | undefined): Metadata {
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
export function resolveOptionsMetadata(
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

/**
 * Add the feature hooks to the steps so the report will pick them up properly
 *
 * @param {object} data
 * @param {string} keyword
 * @returns {Step[]}
 */
export function parseFeatureHooks(data: any[], keyword: string): Step[] {
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

/**
 * Resolves metadata (embedded > options > defaults) and flattens Before/After
 * hooks into `elements[].steps` for a single raw feature. Shared between the
 * lightweight aggregate pass and the per-feature enrichment pass so both
 * derive identical feature/scenario/step shapes from the same raw JSON.
 */
export function applyMetadataAndHooks(json: Feature, options: Options, reportTime: Date | undefined): Feature {
  const optionsMeta = resolveOptionsMetadata(options.metadata, json.uri);
  const baseMeta = json.metadata || optionsMeta;

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

  return json;
}

/**
 * Escape html in string
 * @param string
 * @return {string}
 */
export function escapeHtml(string: any): string {
  return typeof string === 'string' || string instanceof String
    ? string.replace(/[^0-9A-Za-z ]/g, (chr) => `&#${chr.charCodeAt(0)};`)
    : string;
}

/**
 * Writes decoded image/video bytes to a file (instead of inlining them as a
 * `data:` URI) and returns the `src` to use in the rendered HTML. Implemented
 * per report run in generate-report.ts, where `reportPath` is known.
 */
export interface MediaFileWriter {
  write(buffer: Buffer, mimeType: string): string;
}

/**
 * Classifies and enriches a step's embeddings into renderable form
 * (base64 image/video data URIs, decoded text/html/json, misc attachments).
 *
 * `embedding.data` is treated as optional: the lightweight aggregate pass
 * streams features with `.data` stripped (metadata-only, e.g. `mime_type`)
 * so that step visibility (whether a hidden hook step has attached media)
 * can still be determined correctly without ever materializing the actual
 * base64 payload. The full per-feature enrichment pass streams `.data`
 * intact, so the same function produces real content there.
 *
 * `mediaWriter`, when provided, diverts image/video content to separate
 * files (see `MediaFileWriter`) instead of inlining it — keeps feature pages
 * from becoming enormous single-file blobs on suites with many/large
 * screenshots or videos. Text/JSON/HTML/misc attachments are always inlined
 * (small enough that it was never the problem).
 */
export function enrichStepEmbeddings(step: Step, mediaWriter?: MediaFileWriter): void {
  if (step.embeddings === undefined) {
    return;
  }

  step.attachments = [];
  const embeddings = step.embeddings || [];

  embeddings.forEach((embedding: any, embeddingIndex: number) => {
    const data = embedding.data ?? '';
    // Grab a custom name if the test gave us one. Cucumber frameworks tuck
    // it away under name/fileName (sometimes nested in media), so check all
    // the usual spots. No name? The template falls back to "Log 1" etc.
    const customName: string | undefined =
      embedding.name ?? embedding.fileName ?? embedding.media?.name ?? embedding.media?.fileName ?? undefined;
    /* Decode Base64 for Text-ish attachements */
    if (
      embedding.mime_type === 'text/html' ||
      embedding.mime_type === 'text/plain' ||
      (embedding.media && (embedding.media.type === 'text/html' || embedding.media.type === 'text/plain'))
    ) {
      embedding.data = Buffer.from(data.toString(), 'base64');
    }
    /* istanbul ignore else */
    if (
      embedding.mime_type === 'application/json' ||
      (embedding.media && embedding.media.type === 'application/json')
    ) {
      embedding.data = Buffer.from(data, 'base64').toString();
      step.json = (step.json ? step.json : []).concat([
        // Empty string means this is the aggregate pass with `.data` stripped
        // — placeholder object, just needs to be present/truthy for the
        // hidden-step-visibility check downstream, never rendered.
        embedding.data === '' ? {} : typeof embedding.data === 'string' ? JSON.parse(embedding.data) : embedding.data,
      ]);
      step.jsonNames = (step.jsonNames ? step.jsonNames : []).concat([customName]);
    } else if (embedding.mime_type === 'text/html' || (embedding.media && embedding.media.type === 'text/html')) {
      step.html = (step.html ? step.html : []).concat([embedding.data]);
      step.htmlNames = (step.htmlNames ? step.htmlNames : []).concat([customName]);
    } else if (embedding.mime_type === 'text/plain' || (embedding.media && embedding.media.type === 'text/plain')) {
      step.text = (step.text ? step.text : []).concat([escapeHtml(embedding.data)]);
      step.textNames = (step.textNames ? step.textNames : []).concat([customName]);
    } else if (
      ['image/png', 'image/avif', 'image/webp', 'image/jpeg'].includes(embedding.mime_type ?? '') ||
      (embedding.media && ['image/png', 'image/avif', 'image/webp', 'image/jpeg'].includes(embedding.media.type))
    ) {
      const mimeType = embedding.mime_type ?? embedding.media?.type ?? 'image/png';
      const imageSrc =
        mediaWriter && data
          ? mediaWriter.write(Buffer.from(data, 'base64'), mimeType)
          : `data:${mimeType};base64,${data}`;
      step.image = (step.image ? step.image : []).concat([imageSrc]);
      step.imageNames = (step.imageNames ? step.imageNames : []).concat([customName]);
      step.embeddings![embeddingIndex] = {};
    } else if (embedding.mime_type === 'video/webm' || (embedding.media && embedding.media.type === 'video/webm')) {
      const videoSrc =
        mediaWriter && data
          ? mediaWriter.write(Buffer.from(data, 'base64'), 'video/webm')
          : `data:video/webm;base64,${data}`;
      step.video = (step.video ? step.video : []).concat([videoSrc]);
      step.videoNames = (step.videoNames ? step.videoNames : []).concat([customName]);
      step.embeddings![embeddingIndex] = {};
    } else {
      let embeddingType = 'text/plain';
      if (embedding.mime_type) {
        embeddingType = embedding.mime_type;
      } else if (embedding.media?.type) {
        embeddingType = embedding.media.type;
      }
      step.attachments?.push({
        data: `data:${embeddingType};base64,${data}`,
        type: embeddingType,
        name: customName,
      });
      step.embeddings![embeddingIndex] = {};
    }
  });
}
