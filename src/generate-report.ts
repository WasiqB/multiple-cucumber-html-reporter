import _ from "lodash";
import fs from "fs-extra";
import jsonFile from "jsonfile";
import open from "open";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { collectJsonFiles } from "./collect-jsons";
import {
  Feature,
  Metadata,
  ReportOption,
  ResultStatus,
  Scenario,
  StepEmbedding,
  Suite,
} from "./report-types";
import {
  calculatePercentage,
  escapeHtml,
  formatDuration,
  readTemplateFile,
} from "./helper";

const REPORT_STYLESHEET = "style.css";
const GENERIC_JS = "generic.js";
const INDEX_HTML = "index.html";
const FEATURE_FOLDER = "features";
const FEATURES_OVERVIEW_INDEX_TEMPLATE = "features-overview.index.tmpl";
const CUSTOM_DATA_TEMPLATE = "components/custom-data.tmpl";
let FEATURES_OVERVIEW_TEMPLATE = "components/features-overview.tmpl";
const FEATURES_OVERVIEW_CUSTOM_METADATA_TEMPLATE =
  "components/features-overview-custom-metadata.tmpl";
const FEATURES_OVERVIEW_CHART_TEMPLATE =
  "components/features-overview.chart.tmpl";
const SCENARIOS_OVERVIEW_CHART_TEMPLATE =
  "components/scenarios-overview.chart.tmpl";
const FEATURE_OVERVIEW_INDEX_TEMPLATE = "feature-overview.index.tmpl";
let FEATURE_METADATA_OVERVIEW_TEMPLATE =
  "components/feature-metadata-overview.tmpl";
const FEATURE_CUSTOM_METADATA_OVERVIEW_TEMPLATE =
  "components/feature-custom-metadata-overview.tmpl";
const SCENARIOS_TEMPLATE = "components/scenarios.tmpl";
const DEFAULT_REPORT_NAME = "Multiple Cucumber HTML Reporter";

const parseFeatures = (suite: Suite, options: ReportOption) => {
  suite.app = 0;
  suite.browser = 0;
  suite.featureCount = {
    passed: 0,
    failed: 0,
    notDefined: 0,
    skipped: 0,
    pending: 0,
    ambiguous: 0,
    passedPercentage: "0",
    failedPercentage: "0",
    notDefinedPercentage: "0",
    skippedPercentage: "0",
    pendingPercentage: "0",
    ambiguousPercentage: "0",
    total: 0,
  };
  suite.featureCount.total++;
  suite.features.forEach((feature) => {
    feature.duration = 0;
    feature.time = "00:00:00.000";
    feature.isFailed = false;
    feature.isAmbiguous = false;
    feature.isSkipped = false;
    feature.isNotDefined = false;
    feature.isPending = false;
    const idPrefix = options.staticFilePath ? "" : `${uuid()}.`;
    feature.id = `${idPrefix}${feature.id}`.replace(/[^a-zA-Z0-9-_]/g, "-");

    if (!feature.scenarios) {
      return;
    }

    feature = parseScenarios(feature, suite, options);

    if (feature.isFailed) {
      suite.featureCount.failed++;
      feature.failed++;
    } else if (feature.isAmbiguous) {
      suite.featureCount.ambiguous++;
      feature.ambiguous++;
    } else if (feature.isNotDefined) {
      feature.notDefined++;
      suite.featureCount.notDefined++;
    } else if (feature.isPending) {
      feature.pending++;
      suite.featureCount.pending++;
    } else if (feature.isSkipped) {
      feature.skipped++;
      suite.featureCount.skipped++;
    } else {
      feature.passed++;
      suite.featureCount.passed++;
    }

    if (feature.duration) {
      feature.totalTime += feature.duration;
      feature.time = formatDuration(feature.duration, options.durationInMs);
    }

    // Check if browser / app is used
    suite.app = feature.metadata.app ? suite.app + 1 : suite.app;
    suite.browser = feature.metadata.browser
      ? suite.browser + 1
      : suite.browser;

    // Percentages
    feature.scenarioCount.ambiguousPercentage = calculatePercentage(
      feature.scenarioCount.ambiguous,
      feature.scenarioCount.total
    );
    feature.scenarioCount.failedPercentage = calculatePercentage(
      feature.scenarioCount.failed,
      feature.scenarioCount.total
    );
    feature.scenarioCount.notDefinedPercentage = calculatePercentage(
      feature.scenarioCount.notDefined,
      feature.scenarioCount.total
    );
    feature.scenarioCount.passedPercentage = calculatePercentage(
      feature.scenarioCount.passed,
      feature.scenarioCount.total
    );
    feature.scenarioCount.pendingPercentage = calculatePercentage(
      feature.scenarioCount.pending,
      feature.scenarioCount.total
    );
    feature.scenarioCount.skippedPercentage = calculatePercentage(
      feature.scenarioCount.skipped,
      feature.scenarioCount.total
    );
    suite.scenarios.ambiguousPercentage = calculatePercentage(
      suite.scenarios.ambiguous,
      suite.scenarios.total
    );
    suite.scenarios.failedPercentage = calculatePercentage(
      suite.scenarios.failed,
      suite.scenarios.total
    );
    suite.scenarios.notDefinedPercentage = calculatePercentage(
      suite.scenarios.notDefined,
      suite.scenarios.total
    );
    suite.scenarios.passedPercentage = calculatePercentage(
      suite.scenarios.passed,
      suite.scenarios.total
    );
    suite.scenarios.pendingPercentage = calculatePercentage(
      suite.scenarios.pending,
      suite.scenarios.total
    );
    suite.scenarios.skippedPercentage = calculatePercentage(
      suite.scenarios.skipped,
      suite.scenarios.total
    );
  });
};

/**
 * Parse each scenario within a feature
 * @param {object} feature a feature with all the scenarios in it
 * @return {object} return the parsed feature
 * @private
 */
const parseScenarios = (
  feature: Feature,
  suite: Suite,
  options: ReportOption
): Feature => {
  feature.scenarios.forEach((scenario) => {
    scenario.passed = 0;
    scenario.failed = 0;
    scenario.notDefined = 0;
    scenario.skipped = 0;
    scenario.pending = 0;
    scenario.ambiguous = 0;
    scenario.duration = 0;
    scenario.time = "00:00:00.000";

    scenario = parseSteps(scenario, options);

    if (scenario.duration > 0) {
      feature.duration += scenario.duration;
      scenario.time = formatDuration(scenario.duration, options.durationInMs);
    }

    if (scenario.hasOwnProperty("description") && scenario.description) {
      scenario.description = scenario.description.replace(
        new RegExp("\r?\n", "g"),
        "<br />"
      );
    }

    if (scenario.type === "background") {
      return;
    }

    if (scenario.failed > 0) {
      suite.scenarios.total++;
      suite.scenarios.failed++;
      feature.scenarioCount.total++;
      feature.isFailed = true;
      return feature.scenarioCount.failed++;
    }

    if (scenario.ambiguous > 0) {
      suite.scenarios.total++;
      suite.scenarios.ambiguous++;
      feature.scenarioCount.total++;
      feature.isAmbiguous = true;
      return feature.scenarioCount.ambiguous++;
    }

    if (scenario.notDefined > 0) {
      suite.scenarios.total++;
      suite.scenarios.notDefined++;
      feature.scenarioCount.total++;
      feature.isNotDefined = true;
      return feature.scenarioCount.notDefined++;
    }

    if (scenario.pending > 0) {
      suite.scenarios.total++;
      suite.scenarios.pending++;
      feature.scenarioCount.total++;
      feature.isPending = true;
      return feature.scenarioCount.pending++;
    }

    if (scenario.skipped > 0) {
      suite.scenarios.total++;
      suite.scenarios.skipped++;
      feature.scenarioCount.total++;
      return feature.scenarioCount.skipped++;
    }

    /* istanbul ignore else */
    if (scenario.passed > 0) {
      suite.scenarios.total++;
      suite.scenarios.passed++;
      feature.scenarioCount.total++;
      return feature.scenarioCount.passed++;
    }
  });

  feature.isSkipped =
    feature.scenarioCount.total === feature.scenarioCount.skipped;

  return feature;
};

/**
 * Parse all the scenario steps and enrich them with the correct data
 * @param {object} scenario Preparsed scenario
 * @return {object} A parsed scenario
 * @private
 */
const parseSteps = (
  scenario: Scenario,
  { durationInMs }: ReportOption
): Scenario => {
  scenario.steps.forEach((step) => {
    if (step.embeddings !== undefined) {
      step.attachments = [];
      step.embeddings.forEach((embedding, embeddingIndex) => {
        /* Decode Base64 for Text-ish attachements */
        if (
          embedding.mime_type === "text/html" ||
          embedding.mime_type === "text/plain"
        ) {
          embedding.data = Buffer.from(embedding.data.toString(), "base64");
        }
        /* istanbul ignore else */
        if (
          embedding.mime_type === "application/json" ||
          embedding.media?.type === "application/json"
        ) {
          embedding.data = Buffer.from(
            embedding.data.toString(),
            "base64"
          ).toString();
          step.json = (step.json ? step.json : []).concat([
            typeof embedding.data === "string"
              ? JSON.parse(embedding.data)
              : embedding.data,
          ]);
        } else if (
          embedding.mime_type === "text/html" ||
          embedding.media?.type === "text/html"
        ) {
          step.html = (step.html ? step.html : []).concat([
            embedding.data.toString(),
          ]);
        } else if (
          embedding.mime_type === "text/plain" ||
          embedding.media?.type === "text/plain"
        ) {
          step.text = (step.text ? step.text : []).concat([
            escapeHtml(embedding.data.toString()),
          ]);
        } else if (
          embedding.mime_type === "image/png" ||
          (embedding.media && embedding.media.type === "image/png")
        ) {
          step.image = (step.image ? step.image : []).concat([
            "data:image/png;base64," + embedding.data,
          ]);
          step.embeddings[embeddingIndex] = {};
        } else {
          let embeddingType = "text/plain";
          if (embedding.mime_type) {
            embeddingType = embedding.mime_type;
          } else if (embedding.media && embedding.media.type) {
            embeddingType = embedding.media.type;
          }
          step.attachments.push({
            data: "data:" + embeddingType + ";base64," + embedding.data,
            media: {
              type: embeddingType,
            },
          } satisfies StepEmbedding);
          step.embeddings[embeddingIndex] = {};
        }
      });
    }

    if (step.doc_string !== undefined) {
      step.id = `${uuid()}.${scenario.id}.${step.name}`.replace(
        /[^a-zA-Z0-9-_]/g,
        "-"
      );
      step.restWireData = escapeHtml(step.doc_string.value).replace(
        new RegExp("\r?\n", "g"),
        "<br />"
      );
    }

    if (
      !step.result ||
      // Don't log steps that don't have a text/hidden/images/attachments unless they are failed.
      // This is for the hooks
      (step.hidden &&
        !step.text &&
        !step.image &&
        _.size(step.attachments) === 0 &&
        step.result.status !== ResultStatus.failed)
    ) {
      return 0;
    }

    if (step.result.duration) {
      scenario.duration += step.result.duration;
      step.time = formatDuration(step.result.duration, durationInMs);
    }
    if (step.result.status.toLowerCase() === ResultStatus.passed) {
      return scenario.passed++;
    }
    if (step.result.status.toLowerCase() === ResultStatus.failed) {
      return scenario.failed++;
    }
    if (step.result.status.toLowerCase() === ResultStatus.notDefined) {
      return scenario.notDefined++;
    }
    if (step.result.status.toLowerCase() === ResultStatus.pending) {
      return scenario.pending++;
    }
    if (step.result.status.toLowerCase() === ResultStatus.ambiguous) {
      return scenario.ambiguous++;
    }
    scenario.skipped++;
  });

  return scenario;
};

/**
 * Generate the features overview
 * @param {object} suite JSON object with all the features and scenarios
 * @private
 */
const createFeaturesOverviewIndexPage = (
  suite: Suite,
  { reportPath, metadata, pageTitle, pageFooter, reportName }: ReportOption
) => {
  const featuresOverviewIndex = path.resolve(reportPath, INDEX_HTML);
  if (suite.customMetadata && metadata) {
    suite.features.forEach((feature) => {
      if (!feature.metadata) {
        feature.metadata = metadata as Metadata;
      }
    });
  }
  FEATURES_OVERVIEW_TEMPLATE = suite.customMetadata
    ? FEATURES_OVERVIEW_CUSTOM_METADATA_TEMPLATE
    : FEATURES_OVERVIEW_TEMPLATE;

  fs.writeFileSync(
    featuresOverviewIndex,
    _.template(readTemplateFile(FEATURES_OVERVIEW_INDEX_TEMPLATE))({
      suite: suite,
      featuresOverview: _.template(
        readTemplateFile(FEATURES_OVERVIEW_TEMPLATE)
      )({
        suite: suite,
        _: _,
      }),
      featuresScenariosOverviewChart: _.template(
        readTemplateFile(SCENARIOS_OVERVIEW_CHART_TEMPLATE)
      )({
        overviewPage: true,
        scenarios: suite.scenarios,
        _: _,
      }),
      customDataOverview: _.template(readTemplateFile(CUSTOM_DATA_TEMPLATE))({
        suite: suite,
        _: _,
      }),
      featuresOverviewChart: _.template(
        readTemplateFile(FEATURES_OVERVIEW_CHART_TEMPLATE)
      )({
        suite: suite,
        _: _,
      }),
      customStyle: readTemplateFile(suite.customStyle),
      styles: readTemplateFile(suite.style),
      useCDN: suite.useCDN,
      genericScript: readTemplateFile(GENERIC_JS),
      pageTitle: pageTitle,
      reportName: reportName,
      pageFooter: pageFooter,
    })
  );
};

/**
 * Generate the feature pages
 * @param suite suite JSON object with all the features and scenarios
 * @private
 */
const createFeatureIndexPages = (
  suite: Suite,
  {
    reportPath,
    pageTitle,
    pageFooter,
    plainDescription,
    reportName,
  }: ReportOption
) => {
  // Set custom metadata overview for the feature
  FEATURE_METADATA_OVERVIEW_TEMPLATE = suite.customMetadata
    ? FEATURE_CUSTOM_METADATA_OVERVIEW_TEMPLATE
    : FEATURE_METADATA_OVERVIEW_TEMPLATE;

  suite.features.forEach((feature) => {
    const featurePage = path.resolve(
      reportPath,
      `${FEATURE_FOLDER}/${feature.id}.html`
    );
    fs.writeFileSync(
      featurePage,
      _.template(readTemplateFile(FEATURE_OVERVIEW_INDEX_TEMPLATE))({
        feature: feature,
        suite: suite,
        featureScenariosOverviewChart: _.template(
          readTemplateFile(SCENARIOS_OVERVIEW_CHART_TEMPLATE)
        )({
          overviewPage: false,
          feature: feature,
          suite: suite,
          scenarios: feature.scenarios,
          _: _,
        }),
        featureMetadataOverview: _.template(
          readTemplateFile(FEATURE_METADATA_OVERVIEW_TEMPLATE)
        )({
          metadata: feature.metadata,
          _: _,
        }),
        scenarioTemplate: _.template(readTemplateFile(SCENARIOS_TEMPLATE))({
          suite: suite,
          scenarios: feature.scenarios,
          _: _,
        }),
        useCDN: suite.useCDN,
        customStyle: readTemplateFile(suite.customStyle),
        styles: readTemplateFile(suite.style),
        genericScript: readTemplateFile(GENERIC_JS),
        pageTitle: pageTitle,
        reportName: reportName,
        pageFooter: pageFooter,
        plainDescription: plainDescription,
      })
    );
    // Copy the assets, but first check if they don't exist and not useCDN
    if (
      !fs.pathExistsSync(path.resolve(reportPath, "assets")) &&
      !suite.useCDN
    ) {
      fs.copySync(
        path.resolve(
          path.dirname(require.resolve("../package.json")),
          "templates/assets"
        ),
        path.resolve(reportPath, "assets")
      );
    }
  });
};

const generateReport = (options: ReportOption) => {
  if (!options) {
    throw new Error("Options need to be provided.");
  }

  if (!options.dir) {
    throw new Error("A path which holds the JSON files should be provided.");
  }

  if (!options.reportPath) {
    throw new Error(
      "An output path for the reports should be defined, no path was provided."
    );
  }

  const customMetadata = !!options.customMetadata;
  const customData = options.customData || null;
  const plainDescription = options.plainDescription;
  const style = options.overrideStyle || REPORT_STYLESHEET;
  const customStyle = options.customStyle;
  const disableLog = !!options.disableLog;
  const openReportInBrowser = !!options.openReportInBrowser;
  const reportName = options.reportName || DEFAULT_REPORT_NAME;
  const reportPath = path.resolve(process.cwd(), options.reportPath);
  const saveCollectedJSON = !!options.saveCollectedJson;
  const displayDuration = !!options.displayDuration;
  const displayReportTime = !!options.displayReportTime;
  const durationInMS = !!options.durationInMs;
  const hideMetadata = !!options.hideMetadata;
  const pageTitle = options.pageTitle || "Multiple Cucumber HTML Reporter";
  const pageFooter = options.pageFooter || null;
  const useCDN = !!options.useCDN;
  const staticFilePath = !!options.staticFilePath;

  fs.ensureDirSync(reportPath);
  fs.ensureDirSync(path.resolve(reportPath, FEATURE_FOLDER));

  const allFeatures = collectJsonFiles(options);

  let suite = {
    app: 0,
    customMetadata: customMetadata,
    customData: customData,
    style: style,
    customStyle: customStyle,
    useCDN: useCDN,
    hideMetadata: hideMetadata,
    displayReportTime: displayReportTime,
    displayDuration: displayDuration,
    browser: 0,
    name: "",
    version: "version",
    time: new Date(),
    features: allFeatures,
    featureCount: {
      ambiguous: 0,
      failed: 0,
      passed: 0,
      notDefined: 0,
      pending: 0,
      skipped: 0,
      total: 0,
      ambiguousPercentage: "0",
      failedPercentage: "0",
      notDefinedPercentage: "0",
      pendingPercentage: "0",
      skippedPercentage: "0",
      passedPercentage: "0",
    },
    reportName: reportName,
    scenarios: {
      failed: 0,
      ambiguous: 0,
      notDefined: 0,
      pending: 0,
      skipped: 0,
      passed: 0,
      total: 0,
    },
    totalTime: 0,
  } satisfies Suite;

  parseFeatures(suite, {
    ...options,
    staticFilePath,
    durationInMs: durationInMS,
  });

  // Percentages
  suite.featureCount.ambiguousPercentage = calculatePercentage(
    suite.featureCount.ambiguous,
    suite.featureCount.total
  );
  suite.featureCount.failedPercentage = calculatePercentage(
    suite.featureCount.failed,
    suite.featureCount.total
  );
  suite.featureCount.notDefinedPercentage = calculatePercentage(
    suite.featureCount.notDefined,
    suite.featureCount.total
  );
  suite.featureCount.pendingPercentage = calculatePercentage(
    suite.featureCount.pending,
    suite.featureCount.total
  );
  suite.featureCount.skippedPercentage = calculatePercentage(
    suite.featureCount.skipped,
    suite.featureCount.total
  );
  suite.featureCount.passedPercentage = calculatePercentage(
    suite.featureCount.passed,
    suite.featureCount.total
  );

  /* istanbul ignore else */
  if (saveCollectedJSON) {
    jsonFile.writeFileSync(
      path.resolve(reportPath, "enriched-output.json"),
      suite,
      { spaces: 2 }
    );
  }

  createFeaturesOverviewIndexPage(suite, {
    ...options,
    durationInMs: durationInMS,
    pageTitle,
    pageFooter,
    reportPath,
    reportName,
  });
  createFeatureIndexPages(suite, {
    ...options,
    durationInMs: durationInMS,
    pageTitle,
    pageFooter,
    reportPath,
    reportName,
    plainDescription,
  });

  /* istanbul ignore else */
  if (!disableLog) {
    console.log(
      "\x1b[34m%s\x1b[0m",
      `\n
=====================================================================================
    Multiple Cucumber HTML report generated in:

    ${path.join(reportPath, INDEX_HTML)}
=====================================================================================\n`
    );
  }

  /* istanbul ignore if */
  if (openReportInBrowser) {
    open(path.join(reportPath, INDEX_HTML));
  }
};

export { generateReport };
