export type CustomData = {
  username?: string;
  nodeVersion?: string;
  reportVersion?: string;
  hostname?: string;
  architecture?: string;
  /** Name of the project under test. Displayed in the run info card. */
  projectName?: string;
  /** Release or version label (e.g. "2.1.0"). Displayed in the run info card. */
  release?: string;
  /** Test cycle identifier (e.g. "Regression", "Smoke"). */
  testCycle?: string;
  /** CI build number (e.g. "CI-4521"). */
  buildNumber?: string;
  /** Target environment (e.g. "staging", "production"). */
  environment?: string;
  /** CI pipeline / workflow name (e.g. "GitHub Actions", "Jenkins"). */
  ciPipeline?: string;
  [key: string]: any;
};

export type Metadata = {
  browser?: {
    name: string;
    version: string;
  };
  device?: string;
  platform?: {
    name: string;
    version: string;
  };
  app?: {
    name: string;
    version: string;
  };
  executionPlatform?: 'browserstack' | 'testmu' | 'local';
  // Allow arbitrary extra keys for fully-custom use-cases
  [key: string]: any;
};

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export type LoggingOptions =
  | LogLevel
  | false
  | {
      /**
       * Minimum log level to emit. Use `silent` or `enabled: false` to hide all
       * reporter logging.
       */
      level?: LogLevel;
      /** Set to false to hide all reporter logging. */
      enabled?: boolean;
    };

export interface Options {
  jsonDir: string;
  reportPath: string;
  customData?: CustomData;
  /**
   * Metadata to attach to features.
   *
   * Three accepted shapes:
   * 1. `Metadata` object — applied to **every** feature.
   * 2. `Record<string, Metadata>` — keyed by feature filename; each feature
   *    gets its own metadata object.
   * 3. `{ name: string; value: string }[]` — custom key/value pairs. Requires
   *    `customMetadata: true`; throws an error if that flag is omitted.
   */
  metadata?: Metadata | Record<string, Metadata> | { name: string; value: string }[];
  /**
   * Set to `true` when `metadata` is provided as a `{ name; value }[]` array.
   * If `metadata` is array-shaped and this flag is `false` (or absent), the
   * reporter will throw an error explaining the mismatch.
   * @deprecated Use `metadata` property of type `Record<string, Metadata>` instead.
   */
  customMetadata?: boolean;
  plainDescription?: boolean;
  overrideStyle?: string;
  customStyle?: string;
  /**
   * Controls reporter logging. Defaults to `info`.
   *
   * Examples:
   * - `logging: 'warn'`
   * - `logging: 'silent'`
   * - `logging: false`
   * - `logging: { level: 'debug' }`
   */
  logging?: LoggingOptions;
  /** @deprecated Use `logging: 'silent'` or `logging: false` instead. */
  disableLog?: boolean;
  openReportInBrowser?: boolean;
  reportName?: string;
  saveCollectedJSON?: boolean;
  displayDuration?: boolean;
  displayReportTime?: boolean;
  displayChartPercentages?: boolean;
  durationInMS?: boolean;
  durationAggregation?: 'wallClock' | 'sum';
  hideMetadata?: boolean;
  pageTitle?: string;
  pageFooter?: string | null;
  useCDN?: boolean;
  staticFilePath?: boolean;
  brandLogo?: string;
  metadataFilePath?: string;
  /**
   * Write image/video attachments to separate files under
   * `<reportPath>/assets/media/` instead of inlining them as `data:` URIs in
   * the feature page's HTML. Keeps feature pages small and lets the browser
   * load each screenshot/video lazily (normal `<img>`/`<video>` src) instead
   * of parsing a multi-gigabyte inline blob before the page is interactive.
   * Text/JSON/HTML log attachments are unaffected — always inlined.
   */
  externalizeMedia?: boolean;
  /**
   * How step attachments (text/json/html/image/video/misc) are presented on
   * feature pages:
   * - `'modal'` (default) — a compact "Attachments" list; clicking an item
   *   opens it in a popup (see the `modal*` options below for its behavior).
   * - `'inline'` — the pre-4.x classic style: one link per attachment type
   *   ("+ Show Info", "+ Screenshot", etc.) inline next to the step text,
   *   each expanding its content directly below the step in place.
   */
  attachmentLayout?: 'modal' | 'inline';
  /**
   * Whether the attachment popup (see `attachmentLayout: 'modal'`) shows a
   * dark backdrop, blocks interaction with the rest of the page, and closes
   * on click-outside. Default `true` matches the original behavior.
   */
  modalBackdrop?: boolean;
  /**
   * Whether the attachment popup can be repositioned by dragging its header.
   * Default `false` matches the original (fixed, centered) behavior.
   */
  modalDraggable?: boolean;
  /**
   * Whether the attachment popup can be resized from any edge or corner.
   * Default `false` matches the original (fixed max-size) behavior.
   */
  modalResizable?: boolean;
  /**
   * Whether the attachment popup shows the step (or, for a detected video,
   * scenario) text as a caption above its content. Default `false` matches
   * the original behavior, which showed no such caption.
   */
  modalShowContext?: boolean;
}

export interface Hook {
  arguments: any[];
  keyword: string;
  name: string;
  result: {
    status: string;
    duration?: number;
    error_message?: string;
  };
  line: string | number;
  match: {
    location: string;
  };
  embeddings: any[];
}

export interface Step {
  arguments?: any[];
  keyword: string;
  name: string;
  result: {
    status: string;
    duration?: number;
    error_message?: string;
  };
  line: string | number;
  match?: {
    location: string;
  };
  embeddings?: any[];
  attachments?: Array<{ data: string; type: string; name?: string }>;
  json?: any[];
  html?: any[];
  text?: string[];
  image?: string[];
  video?: string[];
  // Custom names for each attachment, lined up index-for-index with the arrays
  // above. A missing entry just means "use the default label" for that one.
  jsonNames?: Array<string | undefined>;
  htmlNames?: Array<string | undefined>;
  textNames?: Array<string | undefined>;
  imageNames?: Array<string | undefined>;
  videoNames?: Array<string | undefined>;
  id?: string;
  restWireData?: string;
  doc_string?: {
    value: string;
  };
  hidden?: boolean;
  time?: string;
}

export interface Scenario {
  id?: string;
  name: string;
  description?: string;
  line: number;
  type: 'scenario' | 'background';
  steps: Step[];
  before?: any[];
  after?: any[];
  passed: number;
  failed: number;
  notDefined: number;
  skipped: number;
  pending: number;
  ambiguous: number;
  duration: number;
  time: string;
  start_timestamp?: string;
}

export interface Feature {
  id: string;
  name: string;
  description?: string;
  line: number;
  keyword: string;
  uri: string;
  elements: Scenario[];
  executionPlatform: 'browserstack' | 'testmu' | 'local';
  metadata: Metadata | { name: string; value: string }[];
  scenarios: {
    passed: number;
    failed: number;
    notDefined: number;
    skipped: number;
    pending: number;
    ambiguous: number;
    passedPercentage: string | number;
    failedPercentage: string | number;
    notDefinedPercentage: string | number;
    skippedPercentage: string | number;
    pendingPercentage: string | number;
    ambiguousPercentage: string | number;
    total: number;
  };
  duration: number;
  time: string;
  isFailed: boolean;
  isAmbiguous: boolean;
  isSkipped: boolean;
  isNotdefined: boolean;
  isPending: boolean;
  app: string;
  browser: string;
  os: string;
  device: string;
  username?: string;
  totalTime: number;
  passed: number;
  failed: number;
  notDefined: number;
  skipped: number;
  pending: number;
  ambiguous: number;
  tags?: Array<{ name: string; line: number }>;
}

export interface Suite {
  app: number;
  customMetadata: boolean;
  customData?: CustomData;
  style: string;
  customStyle?: string;
  useCDN: boolean;
  hideMetadata: boolean;
  displayReportTime: boolean;
  displayDuration: boolean;
  displayChartPercentages: boolean;
  durationAggregation: 'wallClock' | 'sum';
  durationColumnTitle: string;
  browser: number;
  name: string;
  version: string;
  time: Date;
  features: Feature[];
  featureCount: {
    ambiguous: number;
    failed: number;
    passed: number;
    notDefined: number;
    pending: number;
    skipped: number;
    total: number;
    ambiguousPercentage: string | number;
    failedPercentage: string | number;
    notDefinedPercentage: string | number;
    pendingPercentage: string | number;
    skippedPercentage: string | number;
    passedPercentage: string | number;
    steps?: {
      passed: number;
      failed: number;
      skipped: number;
      total: number;
    };
  };
  reportName: string;
  scenarios: {
    failed: number;
    ambiguous: number;
    notDefined: number;
    pending: number;
    skipped: number;
    passed: number;
    total: number;
    ambiguousPercentage?: string | number;
    failedPercentage?: string | number;
    notDefinedPercentage?: string | number;
    pendingPercentage?: string | number;
    skippedPercentage?: string | number;
    passedPercentage?: string | number;
  };
  totalTime: number;
}
