import fs from 'node:fs';
import { appendFile, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import type { Feature, Scenario, Step } from './types.js';

type Message = Record<string, any>;

/**
 * Adapts Cucumber Messages to the legacy JSON shape consumed by the renderer.
 *
 * NDJSON is deliberately read with `readline`, rather than `readFile` or a
 * whole-file `JSON.parse`: a messages file can be many gigabytes when it has
 * screenshots. Attachments are retained only for an active test case and are
 * omitted entirely during the lightweight first pass.
 */
export async function* streamFeaturesFromMessagesFile(
  filePath: string,
  { keepEmbeddingData }: { keepEmbeddingData: boolean },
): AsyncGenerator<Feature> {
  const documents = new Map<string, Message>();
  const pickles = new Map<string, Message>();
  const hooks = new Map<string, Message>();
  const testCases = new Map<string, Message>();
  const started = new Map<string, Message>();
  const finishedSteps = new Map<string, Message>();
  const attachments = new Map<string, Message[]>();
  const features = new Map<string, Feature>();
  const scenarioFiles = new Map<string, string>();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'mchr-messages-'));

  const input = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Number.POSITIVE_INFINITY,
  });

  try {
    for await (const line of input) {
      if (!line.trim()) continue;
      let envelope: Message;
      try {
        envelope = JSON.parse(line);
      } catch {
        throw new Error(`Invalid Cucumber Messages NDJSON in '${filePath}'.`);
      }

      if (envelope.gherkinDocument) documents.set(envelope.gherkinDocument.uri ?? '', envelope.gherkinDocument);
      if (envelope.pickle) pickles.set(envelope.pickle.id, envelope.pickle);
      if (envelope.hook) hooks.set(envelope.hook.id, envelope.hook);
      if (envelope.testCase) testCases.set(envelope.testCase.id, envelope.testCase);
      if (envelope.testCaseStarted) started.set(envelope.testCaseStarted.id, envelope.testCaseStarted);
      if (envelope.testStepFinished) finishedSteps.set(envelope.testStepFinished.testStepId, envelope.testStepFinished);
      if (envelope.attachment?.testCaseStartedId) {
        const attachment = envelope.attachment;
        // The first pass never needs payload data; retaining it would defeat
        // the bounded-memory summary pass for screenshot-heavy runs.
        if (!keepEmbeddingData) attachment.body = '';
        const list = attachments.get(attachment.testCaseStartedId) ?? [];
        list.push(attachment);
        attachments.set(attachment.testCaseStartedId, list);
      }
      if (envelope.testCaseFinished) {
        const testCaseStarted = started.get(envelope.testCaseFinished.testCaseStartedId);
        if (!testCaseStarted) continue;
        const testCase = testCases.get(testCaseStarted.testCaseId);
        const pickle = testCase && pickles.get(testCase.pickleId);
        if (!testCase || !pickle) continue;

        const document = documents.get(pickle.uri ?? '');
        const featureDocument = document?.feature;
        if (!featureDocument) continue;
        const key = pickle.uri ?? featureDocument.name;
        let feature = features.get(key);
        if (!feature) {
          feature = {
            id: featureDocument.name || key,
            name: featureDocument.name || key,
            description: featureDocument.description ?? '',
            line: featureDocument.location?.line ?? 0,
            keyword: featureDocument.keyword ?? 'Feature',
            uri: pickle.uri ?? '',
            elements: [],
            executionPlatform: 'local',
            metadata: {},
          } as unknown as Feature;
          features.set(key, feature);
        }
        let scenarioFile = scenarioFiles.get(key);
        if (!scenarioFile) {
          scenarioFile = path.join(tempDir, `${scenarioFiles.size}.ndjson`);
          scenarioFiles.set(key, scenarioFile);
        }
        // Spill completed scenarios to disk. This makes the second (detail-page)
        // pass bounded by one scenario's attachments, not the whole run.
        await appendFile(
          scenarioFile,
          `${JSON.stringify(toScenario(testCase, pickle, featureDocument, testCaseStarted, finishedSteps, attachments, hooks))}\n`,
        );
        started.delete(testCaseStarted.id);
        attachments.delete(testCaseStarted.id);
        testCases.delete(testCase.id);
      }
    }

    for (const [key, feature] of features) {
      const scenarioFile = scenarioFiles.get(key);
      if (scenarioFile) {
        const scenarios = readline.createInterface({
          input: fs.createReadStream(scenarioFile, { encoding: 'utf8' }),
          crlfDelay: Number.POSITIVE_INFINITY,
        });
        for await (const line of scenarios) {
          if (line) feature.elements.push(JSON.parse(line));
        }
      }
      yield feature;
      // The detail-page pass has finished rendering/writing this feature by
      // the time the generator resumes. Release its attachment payload before
      // loading the next feature; the summary pass must retain its features.
      if (keepEmbeddingData) feature.elements = [];
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function toScenario(
  testCase: Message,
  pickle: Message,
  documentFeature: Message,
  testCaseStarted: Message,
  finishedSteps: Map<string, Message>,
  attachmentsByStarted: Map<string, Message[]>,
  hooks: Map<string, Message>,
): Scenario {
  const astSteps = indexAstSteps(documentFeature);
  const pickleSteps = new Map<string, Message>((pickle.steps ?? []).map((step: Message) => [step.id, step]));
  const attachments = attachmentsByStarted.get(testCaseStarted.id) ?? [];
  const scenario: Scenario = {
    id: pickle.id,
    name: pickle.name,
    description: '',
    line: pickle.location?.line ?? 0,
    type: 'scenario',
    steps: [],
    before: [],
    after: [],
    passed: 0,
    failed: 0,
    notDefined: 0,
    skipped: 0,
    pending: 0,
    ambiguous: 0,
    duration: 0,
    time: '',
    start_timestamp: timestampToIso(testCaseStarted.timestamp),
  };

  for (const testStep of testCase.testSteps ?? []) {
    const finished = finishedSteps.get(testStep.id);
    if (!finished) continue;
    finishedSteps.delete(testStep.id);
    const result = toResult(finished.testStepResult);
    const embeddings = attachments
      .filter((attachment) => attachment.testStepId === testStep.id)
      .map((attachment) => ({
        data:
          attachment.contentEncoding === 'IDENTITY'
            ? Buffer.from(attachment.body ?? '').toString('base64')
            : (attachment.body ?? ''),
        mime_type: attachment.mediaType,
        name: attachment.fileName,
      }));
    if (testStep.pickleStepId) {
      const pickleStep: Message | undefined = pickleSteps.get(testStep.pickleStepId);
      const astStep = pickleStep?.astNodeIds?.map((id: string) => astSteps.get(id)).find(Boolean) as
        | Message
        | undefined;
      const step: Step = {
        keyword: astStep?.keyword ?? '',
        name: pickleStep?.text ?? '',
        line: astStep?.location?.line ?? pickle.location?.line ?? 0,
        result,
        embeddings,
      };
      if (pickleStep?.argument?.docString) step.doc_string = { value: pickleStep.argument.docString.content };
      scenario.steps.push(step);
    } else {
      const hook = { keyword: 'Hook', name: '', line: 0, result, embeddings };
      const hookType = hooks.get(testStep.hookId)?.type;
      (hookType?.startsWith('AFTER') ? scenario.after! : scenario.before!).push(hook);
    }
  }
  return scenario;
}

function indexAstSteps(feature: Message): Map<string, Message> {
  const steps = new Map<string, Message>();
  const visit = (children: Message[]) => {
    for (const child of children ?? []) {
      const scenario = child.scenario;
      if (scenario) for (const step of scenario.steps ?? []) steps.set(step.id, step);
      if (child.background) for (const step of child.background.steps ?? []) steps.set(step.id, step);
      if (child.rule) visit(child.rule.children);
    }
  };
  visit(feature.children);
  return steps;
}

function toResult(result: Message = {}): Step['result'] {
  const statusByMessageStatus: Record<string, string> = {
    PASSED: 'passed',
    SKIPPED: 'skipped',
    PENDING: 'pending',
    UNDEFINED: 'undefined',
    AMBIGUOUS: 'ambiguous',
    FAILED: 'failed',
    UNKNOWN: 'failed',
  };
  const duration = result.duration
    ? Number(result.duration.seconds ?? 0) * 1_000_000_000 + Number(result.duration.nanos ?? 0)
    : 0;
  return {
    status: statusByMessageStatus[result.status] ?? String(result.status ?? 'UNKNOWN').toLowerCase(),
    duration,
    error_message: result.message ?? result.exception?.message ?? result.exception?.stackTrace,
  };
}

function timestampToIso(timestamp: Message | undefined): string | undefined {
  if (!timestamp) return undefined;
  return new Date(Number(timestamp.seconds ?? 0) * 1000 + Number(timestamp.nanos ?? 0) / 1_000_000).toISOString();
}
