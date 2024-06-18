type Metadata = {
  app?: number;
  name: string;
  value: string;
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
};

type Scenario = {
  id: string;
  keyword: string;
  line: number;
  name: string;
  description: string;
  type: string;
  before: Step[];
  after: Step[];
  steps: Step[];
  tags: Tag[];
  ambiguous: number;
  notDefined: number;
  pending: number;
  skipped: number;
  passed: number;
  failed: number;
  duration: number;
  time: string;
  totalTime: number;
};

type Tag = {
  name: string;
  line: number;
};

type StepResult = {
  status: ResultStatus;
  duration: number;
};

type Step = {
  id: string;
  arguments?: string[];
  attachments: StepEmbedding[];
  keyword: string;
  name?: string;
  result: StepResult;
  line?: number;
  hidden?: Boolean;
  match?: {
    location: string;
  };
  embeddings?: StepEmbedding[];
  json: string[];
  html: string[];
  text: string[];
  image: string[];
  doc_string: {
    value: string;
  };
  restWireData: string;
  time: string;
};

type StepEmbedding = {
  data?: Buffer | string;
  media?: {
    type: string;
  };
  mime_type?: string;
};

type Feature = {
  metadata: Metadata;
  scenarios: Scenario[];
  scenarioCount: ScenarioCount;
  id: string;
  keyword: string;
  line: number;
  name: string;
  tags: Tag[];
  uri: string;
  duration: number;
  time: string;
  isFailed: boolean;
  isAmbiguous: boolean;
  isSkipped: boolean;
  isNotDefined: boolean;
  isPending: boolean;
  failed: number;
  ambiguous: number;
  notDefined: number;
  pending: number;
  skipped: number;
  passed: number;
  totalTime: number;
};

type ReportOption = {
  dir: string;
  reportPath: string;
  customMetadata: boolean;
  plainDescription?: boolean;
  overrideStyle?: string;
  customStyle?: string;
  disableLog?: boolean;
  openReportInBrowser?: boolean;
  reportName?: string;
  saveCollectedJson: boolean;
  displayDuration?: boolean;
  displayReportTime?: boolean;
  durationInMs?: boolean;
  hideMetadata?: boolean;
  pageTitle?: string;
  pageFooter?: string;
  useCDN?: boolean;
  staticFilePath?: boolean;
  customData?: {
    title: string;
    data: CustomData[];
  };
  metadata?: Metadata | CustomMetadata[];
};

type CustomData = {
  label: string;
  value: string;
};

type CustomMetadata = {
  name: string;
  value: string;
};

type Suite = {
  app: number;
  customMetadata: boolean;
  customData: {
    title: string;
    data: CustomData[];
  };
  style: string;
  customStyle: string;
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
  ambiguousPercentage: string;
  failedPercentage: string;
  notDefinedPercentage: string;
  pendingPercentage: string;
  skippedPercentage: string;
  passedPercentage: string;
};

type ScenarioCount = {
  failed: number;
  ambiguous: number;
  notDefined: number;
  pending: number;
  skipped: number;
  passed: number;
  total: number;
  ambiguousPercentage?: string;
  failedPercentage?: string;
  notDefinedPercentage?: string;
  pendingPercentage?: string;
  skippedPercentage?: string;
  passedPercentage?: string;
};

enum ResultStatus {
  passed = "passed",
  failed = "failed",
  skipped = "skipped",
  pending = "pending",
  notDefined = "undefined",
  ambiguous = "ambiguous",
}

export {
  Metadata,
  Feature,
  Scenario,
  Step,
  StepEmbedding,
  StepResult,
  Tag,
  ReportOption,
  Suite,
  ResultStatus,
};
