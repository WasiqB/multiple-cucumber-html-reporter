type Options = {
  jsonDir?: string;
  metadata?: JsonMetadata;
  displayReportTime?: boolean;
  saveCollectedJSON?: boolean;
  reportPath?: string;
  customMetadata?: boolean;
  customData?: object | null;
  plainDescription?: boolean;
  overrideStyle?: string;
  customStyle?: string;
  disableLog?: boolean;
  openReportInBrowser?: boolean;
  reportName?: string;
  displayDuration?: boolean;
  durationInMS?: boolean;
  hideMetadata?: boolean;
  pageTitle?: string;
  pageFooter?: string | null;
  useCDN?: boolean;
  staticFilePath?: boolean;
};

type JsonMetadata = {
  app?: number;
  browser?: {
    name: string;
    version: string;
  };
  device?: string;
  platform?: {
    name: string;
    version: string;
  };
  reportTime?: string;
  metadata?: { name: string; value: string }[];
};

type FeatureHook = {
  arguments: any[];
  keyword: string;
  name: string;
  result: { status: string };
  line: string;
  match: { location: string };
  embeddings: Embedding[];
};

type Suite = {
  app: number;
  customMetadata: boolean;
  customData: object | null;
  style: string;
  customStyle?: string;
  useCDN: boolean;
  hideMetadata: boolean;
  displayReportTime: boolean;
  displayDuration: boolean;
  browser: number;
  name: string;
  version: string;
  time: Date;
  features: Feature[];
  featureCount: FeatureCount;
  reportName: string;
  scenarios: ScenarioCount;
  totalTime: number;
};

type FeatureCount = {
  ambiguous: number;
  failed: number;
  passed: number;
  notDefined: number;
  pending: number;
  skipped: number;
  total: number;
  ambiguousPercentage: number;
  failedPercentage: number;
  notDefinedPercentage: number;
  pendingPercentage: number;
  skippedPercentage: number;
  passedPercentage: number;
};

/**
 * FIXME: Required?
 */
type ScenarioCount = {
  failed: number;
  ambiguous: number;
  notDefined: number;
  pending: number;
  skipped: number;
  passed: number;
  total: number;
};

type Feature = {
  id: string;
  app: number;
  browser: number;
  scenarios: FeatureCount;
  duration: number;
  time: string;
  isFailed: boolean;
  isAmbiguous: boolean;
  isSkipped: boolean;
  isNotdefined: boolean;
  isPending: boolean;
  elements?: Scenario[];
  metadata: JsonMetadata;
};

type Scenario = {
  id?: string;
  passed: number;
  failed: number;
  notDefined: number;
  skipped: number;
  pending: number;
  ambiguous: number;
  duration: number;
  time: string;
  type?: string;
  description?: string;
  steps: Step[];
  before?: Step[];
  after?: Step[];
};

type Step = {
  name: string;
  embeddings?: Embedding[];
  attachments?: Embedding[];
  imageUrl?: string;
  jsonEmbedding?: string;
  html?: string[];
  json?: any;
  text?: string[];
  image?: string[];
  video?: string[];
  doc_string?: { value: string };
  result?: { status: string; duration?: number };
  time?: string;
  id?: string;
  restWireData?: string;
  hidden?: boolean;
};

type Embedding = {
  mime_type?: string;
  media?: { type: string };
  data?: string;
};

export {
  Options,
  Suite,
  Feature,
  FeatureCount,
  FeatureHook,
  Scenario,
  ScenarioCount,
  Step,
  Embedding,
  JsonMetadata,
};
