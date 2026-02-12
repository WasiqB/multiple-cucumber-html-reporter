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
    [key: string]: any;
} | Array<{ name: string; value: string }>;

export interface Options {
    jsonDir: string;
    reportPath: string;
    metadata?: Metadata;
    customMetadata?: boolean;
    customData?: {
        title: string;
        data: Array<{ label: string; value: string }>;
    };
    plainDescription?: boolean;
    overrideStyle?: string;
    customStyle?: string;
    disableLog?: boolean;
    openReportInBrowser?: boolean;
    reportName?: string;
    saveCollectedJSON?: boolean;
    displayDuration?: boolean;
    displayReportTime?: boolean;
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
    };
    line: string | number;
    match?: {
        location: string;
    };
    embeddings?: any[];
    attachments?: any[];
    json?: any[];
    html?: any[];
    text?: string[];
    image?: string[];
    video?: string[];
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
    metadata: Metadata;
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
    app: number;
    browser: number;
    totalTime: number;
    passed: number;
    failed: number;
    notDefined: number;
    skipped: number;
    pending: number;
    ambiguous: number;
}

export interface Suite {
    app: number;
    customMetadata: boolean;
    customData: any;
    style: string;
    customStyle?: string;
    useCDN: boolean;
    hideMetadata: boolean;
    displayReportTime: boolean;
    displayDuration: boolean;
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
