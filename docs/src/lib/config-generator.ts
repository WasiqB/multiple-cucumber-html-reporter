import { dump } from 'js-yaml';

export type ConfigFormat = 'json' | 'yaml' | 'js' | 'ts' | 'rc';

export interface MetadataBrowser {
  name: string;
  version: string;
}

export interface MetadataPlatform {
  name: string;
  version: string;
}

export interface MetadataApp {
  name: string;
  version: string;
}

export interface CustomDataField {
  id: string;
  key: string;
  value: string;
}

export interface ConfigFormState {
  // Main
  jsonDir: string;
  reportPath: string;
  language: 'en' | 'es' | 'fr' | 'pt' | 'ar';
  emailReport: boolean;
  staticFilePath: boolean;

  // Report Behavior
  openReportInBrowser: boolean;
  saveCollectedJSON: boolean;
  externalizeMedia: boolean;
  logging: 'silent' | 'info' | 'warn' | 'error' | 'debug' | 'trace';

  // Attachment Presentation
  attachmentLayout: 'modal' | 'inline';
  modalBackdrop: boolean;
  modalDraggable: boolean;
  modalResizable: boolean;
  modalShowContext: boolean;

  // Visual Customization & Branding
  reportName: string;
  pageTitle: string;
  brandLogo: string;
  pageFooter: string;
  plainDescription: boolean;
  useCDN: boolean;
  customStyle: string;
  overrideStyle: string;
  customScript: string;

  // Duration & Performance
  displayDuration: boolean;
  humanReadableDuration: boolean;
  durationInMS: boolean;
  durationAggregation: 'sum' | 'wallClock';
  displayReportTime: boolean;
  displayChartPercentages: boolean;

  // Metadata
  metadataMode: 'none' | 'file' | 'inline';
  metadataFilePath: string;
  browserName: string;
  browserVersion: string;
  platformName: string;
  platformVersion: string;
  deviceName: string;
  appName: string;
  appVersion: string;
  executionPlatform: 'local' | 'browserstack' | 'testmu' | '';

  // Custom Data
  enableCustomData: boolean;
  projectName: string;
  release: string;
  testCycle: string;
  buildNumber: string;
  environment: string;
  ciPipeline: string;
  extraCustomData: CustomDataField[];
}

export const DEFAULT_CONFIG_STATE: ConfigFormState = {
  // Main
  jsonDir: './reports/json',
  reportPath: './reports/html',
  language: 'en',
  emailReport: false,
  staticFilePath: false,

  // Report Behavior
  openReportInBrowser: false,
  saveCollectedJSON: false,
  externalizeMedia: false,
  logging: 'silent',

  // Attachment Presentation
  attachmentLayout: 'modal',
  modalBackdrop: true,
  modalDraggable: false,
  modalResizable: false,
  modalShowContext: false,

  // Visual Customization & Branding
  reportName: '',
  pageTitle: '',
  brandLogo: '',
  pageFooter: '',
  plainDescription: false,
  useCDN: false,
  customStyle: '',
  overrideStyle: '',
  customScript: '',

  // Duration & Performance
  displayDuration: false,
  humanReadableDuration: false,
  durationInMS: false,
  durationAggregation: 'sum',
  displayReportTime: false,
  displayChartPercentages: false,

  // Metadata
  metadataMode: 'none',
  metadataFilePath: '',
  browserName: '',
  browserVersion: '',
  platformName: '',
  platformVersion: '',
  deviceName: '',
  appName: '',
  appVersion: '',
  executionPlatform: '',

  // Custom Data
  enableCustomData: false,
  projectName: '',
  release: '',
  testCycle: '',
  buildNumber: '',
  environment: '',
  ciPipeline: '',
  extraCustomData: [],
};

export const PRESETS: Record<string, { label: string; description: string; state: Partial<ConfigFormState> }> = {
  standard: {
    label: 'Standard Local Run',
    description: 'Clean defaults with duration metrics and doughnut chart percentages enabled.',
    state: {
      jsonDir: './reports/json',
      reportPath: './reports/html',
      language: 'en',
      displayDuration: true,
      humanReadableDuration: true,
      displayChartPercentages: true,
      displayReportTime: true,
      openReportInBrowser: true,
    },
  },
  ci: {
    label: 'High-Performance CI / CD',
    description: 'Externalizes media blobs, uses CDN assets, sets email report, and tracks CI run details.',
    state: {
      jsonDir: './test-results/cucumber',
      reportPath: './public/reports/html',
      language: 'en',
      emailReport: true,
      useCDN: true,
      externalizeMedia: true,
      displayDuration: true,
      humanReadableDuration: true,
      displayChartPercentages: true,
      openReportInBrowser: false,
      logging: 'info',
      enableCustomData: true,
      projectName: 'End-to-End Suite',
      environment: 'staging',
      ciPipeline: 'GitHub Actions',
    },
  },
  minimal: {
    label: 'Bare Minimal',
    description: 'Only the strictly mandatory options, clean and lightweight.',
    state: {
      jsonDir: './reports/json',
      reportPath: './reports/html',
      language: 'en',
      emailReport: false,
      staticFilePath: false,
      openReportInBrowser: false,
      saveCollectedJSON: false,
      externalizeMedia: false,
      logging: 'silent',
      displayDuration: false,
      humanReadableDuration: false,
      durationInMS: false,
      durationAggregation: 'sum',
      displayReportTime: false,
      displayChartPercentages: false,
      metadataMode: 'none',
      enableCustomData: false,
    },
  },
};

/**
 * Builds the pure JS Options object matching reporter schema.
 * Leaves out empty or unused options to keep the generated config clean.
 */
export function buildReporterOptions(state: ConfigFormState): Record<string, any> {
  const options: Record<string, any> = {
    jsonDir: state.jsonDir.trim() || './reports/json',
    reportPath: state.reportPath.trim() || './reports/html',
  };

  if (state.language && state.language !== 'en') {
    options.language = state.language;
  }
  if (state.emailReport) {
    options.emailReport = true;
  }
  if (state.staticFilePath) {
    options.staticFilePath = true;
  }

  // Behavior
  if (state.openReportInBrowser) {
    options.openReportInBrowser = true;
  }
  if (state.saveCollectedJSON) {
    options.saveCollectedJSON = true;
  }
  if (state.externalizeMedia) {
    options.externalizeMedia = true;
  }
  if (state.logging && state.logging !== 'silent') {
    options.logging = state.logging;
  }

  // Attachments
  if (state.attachmentLayout && state.attachmentLayout !== 'modal') {
    options.attachmentLayout = state.attachmentLayout;
  }
  if (state.attachmentLayout === 'modal') {
    if (!state.modalBackdrop) {
      options.modalBackdrop = false;
    }
    if (state.modalDraggable) {
      options.modalDraggable = true;
    }
    if (state.modalResizable) {
      options.modalResizable = true;
    }
    if (state.modalShowContext) {
      options.modalShowContext = true;
    }
  }

  // Visual Customization
  if (state.reportName.trim()) {
    options.reportName = state.reportName.trim();
  }
  if (state.pageTitle.trim()) {
    options.pageTitle = state.pageTitle.trim();
  }
  if (state.brandLogo.trim()) {
    options.brandLogo = state.brandLogo.trim();
  }
  if (state.pageFooter.trim()) {
    options.pageFooter = state.pageFooter.trim();
  }
  if (state.plainDescription) {
    options.plainDescription = true;
  }
  if (state.useCDN) {
    options.useCDN = true;
  }
  if (state.customStyle.trim()) {
    options.customStyle = state.customStyle.trim();
  }
  if (state.overrideStyle.trim()) {
    options.overrideStyle = state.overrideStyle.trim();
  }
  if (state.customScript.trim()) {
    options.customScript = state.customScript.trim();
  }

  // Duration & Charts
  if (state.displayDuration) {
    options.displayDuration = true;
    if (state.humanReadableDuration) {
      options.humanReadableDuration = true;
    }
    if (state.durationInMS) {
      options.durationInMS = true;
    }
    if (state.durationAggregation && state.durationAggregation !== 'sum') {
      options.durationAggregation = state.durationAggregation;
    }
  }
  if (state.displayReportTime) {
    options.displayReportTime = true;
  }
  if (state.displayChartPercentages) {
    options.displayChartPercentages = true;
  }

  // Metadata
  if (state.metadataMode === 'file' && state.metadataFilePath.trim()) {
    options.metadataFilePath = state.metadataFilePath.trim();
  } else if (state.metadataMode === 'inline') {
    const meta: Record<string, any> = {};
    if (state.browserName.trim()) {
      meta.browser = {
        name: state.browserName.trim(),
        version: state.browserVersion.trim() || 'latest',
      };
    }
    if (state.platformName.trim()) {
      meta.platform = {
        name: state.platformName.trim(),
        version: state.platformVersion.trim() || '',
      };
    }
    if (state.deviceName.trim()) {
      meta.device = state.deviceName.trim();
    }
    if (state.appName.trim()) {
      meta.app = {
        name: state.appName.trim(),
        version: state.appVersion.trim() || '',
      };
    }
    if (state.executionPlatform) {
      meta.executionPlatform = state.executionPlatform;
    }
    if (Object.keys(meta).length > 0) {
      options.metadata = meta;
    }
  }

  // Custom Data
  if (state.enableCustomData) {
    const cd: Record<string, string> = {};
    if (state.projectName.trim()) cd.projectName = state.projectName.trim();
    if (state.release.trim()) cd.release = state.release.trim();
    if (state.testCycle.trim()) cd.testCycle = state.testCycle.trim();
    if (state.buildNumber.trim()) cd.buildNumber = state.buildNumber.trim();
    if (state.environment.trim()) cd.environment = state.environment.trim();
    if (state.ciPipeline.trim()) cd.ciPipeline = state.ciPipeline.trim();

    for (const field of state.extraCustomData) {
      if (field.key.trim() && field.value.trim()) {
        cd[field.key.trim()] = field.value.trim();
      }
    }

    if (Object.keys(cd).length > 0) {
      options.customData = cd;
    }
  }

  return options;
}

export function formatConfigFile(
  options: Record<string, any>,
  format: ConfigFormat,
): { fileName: string; content: string; mimeType: string } {
  switch (format) {
    case 'yaml': {
      return {
        fileName: '.multiple-cucumber-html-reporter.yml',
        content: dump(options, { indent: 2, lineWidth: -1 }),
        mimeType: 'text/yaml',
      };
    }
    case 'rc': {
      return {
        fileName: '.multiple-cucumber-html-reporterrc',
        content: `${JSON.stringify(options, null, 2)}\n`,
        mimeType: 'application/json',
      };
    }
    case 'js': {
      return {
        fileName: '.multiple-cucumber-html-reporter.js',
        content: `/** @type {import('multiple-cucumber-html-reporter').Options} */\nexport default ${JSON.stringify(options, null, 2)};\n`,
        mimeType: 'application/javascript',
      };
    }
    case 'ts': {
      return {
        fileName: '.multiple-cucumber-html-reporter.ts',
        content: `import type { Options } from 'multiple-cucumber-html-reporter';\n\nconst config: Options = ${JSON.stringify(options, null, 2)};\n\nexport default config;\n`,
        mimeType: 'application/typescript',
      };
    }
    case 'json':
    default: {
      return {
        fileName: '.multiple-cucumber-html-reporter.json',
        content: `${JSON.stringify(options, null, 2)}\n`,
        mimeType: 'application/json',
      };
    }
  }
}
