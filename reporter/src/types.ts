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
   */
  customMetadata?: boolean;
  plainDescription?: boolean;
  overrideStyle?: string;
  customStyle?: string;
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
