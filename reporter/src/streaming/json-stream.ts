import fs from 'node:fs';
import { Readable } from 'node:stream';
import chain from 'stream-chain';
import { parser } from 'stream-json';
import { disassembler } from 'stream-json/disassembler.js';
import { ignore } from 'stream-json/filters/ignore.js';
import { stringer } from 'stream-json/stringer.js';
import { streamArray } from 'stream-json/streamers/stream-array.js';

/**
 * Matches `embeddings.<index>.data` at any depth — the base64 payload of a
 * step embedding. Used to strip attachment bodies during the lightweight
 * aggregate pass without ever materializing them, while preserving sibling
 * metadata (`mime_type`, `media`, `name`) needed for accurate step counting.
 */
export const EMBEDDING_DATA_PATH = /\.embeddings\.\d+\.data$/;

/**
 * Streams the elements of a single top-level JSON array from disk without
 * ever holding the whole file (or a single array element) as one JS string —
 * avoids both V8's ~512MiB single-string cap and whole-file buffering.
 *
 * A 0-byte file (cucumber JSON can be empty if it's mid-write, see #47)
 * yields nothing, matching the previous `data || '[]'` fallback.
 */
export async function* streamFeaturesFromFile(
  filePath: string,
  { keepEmbeddingData }: { keepEmbeddingData: boolean },
): AsyncGenerator<any> {
  if (fs.statSync(filePath).size === 0) {
    return;
  }

  // `streamKeys: false` keeps the parser emitting only packed `keyValue`
  // tokens (no separate startKey/stringChunk/endKey stream) — required for
  // `ignore()` to track object keys correctly; leaving it on the default
  // (both streamed and packed) corrupts every key in the reassembled object.
  const pipelineStages: unknown[] = [fs.createReadStream(filePath), parser({ streamKeys: false })];
  if (!keepEmbeddingData) {
    pipelineStages.push(ignore({ filter: EMBEDDING_DATA_PATH, streamKeys: false }));
  }
  pipelineStages.push(streamArray());

  const pipe = chain(pipelineStages as Parameters<typeof chain>[0]);

  for await (const { value } of pipe as AsyncIterable<{ value: any }>) {
    yield value;
  }
}

/**
 * Streams a single JS value's JSON serialization directly to an already-open
 * writable, chunk by chunk — never assembles the value's full JSON text as
 * one string (unlike `JSON.stringify`), so a single feature whose serialized
 * size approaches/exceeds V8's single-string cap still writes safely.
 *
 * Fully awaited: the value has been completely written to `writeStream`
 * before this resolves. Callers that mutate the same object afterwards (e.g.
 * enriching it further before a second write elsewhere) rely on this — a
 * fire-and-forget write would risk serializing a partially-mutated value.
 */
async function writeJsonValueChunks(writeStream: NodeJS.WritableStream, value: unknown): Promise<void> {
  const tokenStream = Readable.from([value]).pipe(disassembler.asStream()).pipe(stringer.asStream());
  for await (const chunk of tokenStream) {
    if (!writeStream.write(chunk)) {
      await new Promise<void>((res) => writeStream.once('drain', res));
    }
  }
}

function createStreamedJsonCollectionWriter(
  filePath: string,
  prefix: string,
  suffix: string,
): {
  write: (value: unknown) => Promise<void>;
  close: () => Promise<void>;
} {
  const writeStream = fs.createWriteStream(filePath);
  writeStream.write(prefix);

  let first = true;

  return {
    async write(value: unknown) {
      writeStream.write(first ? '' : ',');
      first = false;
      await writeJsonValueChunks(writeStream, value);
    },
    async close() {
      writeStream.write(suffix);
      await new Promise<void>((res, rej) => {
        writeStream.end((err: Error | null | undefined) => (err ? rej(err) : res()));
      });
    },
  };
}

/**
 * Streams a sequence of JS objects out to disk as a bare JSON array, one
 * object at a time — never calls `JSON.stringify()` on the whole array or on
 * any single object, so a single feature whose serialized size
 * approaches/exceeds V8's single-string cap still writes safely.
 */
export function createJsonArrayFileWriter(filePath: string): {
  write: (obj: unknown) => Promise<void>;
  close: () => Promise<void>;
} {
  return createStreamedJsonCollectionWriter(filePath, '[', ']');
}

/**
 * Streams a "suite envelope" JSON object to disk: fixed metadata fields
 * (small — computed once Pass 1 completes, never contains embeddings) plus a
 * `features` array streamed in one feature at a time. Preserves the same
 * `{...suite metadata, features: [...]}` shape `enriched-output.json` has
 * always had, without ever holding the whole array (or a single feature's
 * serialized text) in memory at once.
 */
export function createJsonSuiteFileWriter(
  filePath: string,
  envelope: Record<string, unknown>,
): {
  write: (feature: unknown) => Promise<void>;
  close: () => Promise<void>;
} {
  const envelopeJson = JSON.stringify(envelope);
  const hasOtherFields = envelopeJson.length > 2; // more than just "{}"
  const prefix = `${envelopeJson.slice(0, -1)}${hasOtherFields ? ',' : ''}"features":[`;
  return createStreamedJsonCollectionWriter(filePath, prefix, ']}');
}
