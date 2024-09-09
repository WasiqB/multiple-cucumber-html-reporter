import _ from "lodash";
import fs from "fs-extra";
import jsonFile from "jsonfile";
import open from "open";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { collectFeatures } from "./collect-jsons.js";
import { Feature, Options, Scenario, Suite } from "./types/report-types.js";
import { calculatePercentage, formatDuration } from "./utils/common.js";
import {
  _createFeatureIndexPages,
  _createFeaturesOverviewIndexPage,
  _escapeHtml,
} from "./utils/template.js";

const RESULT_STATUS = {
  passed: "passed",
  failed: "failed",
  skipped: "skipped",
  pending: "pending",
  notDefined: "undefined",
  ambiguous: "ambiguous",
};

const REPORT_STYLESHEET = "style.css";
const INDEX_HTML = "index.html";
const FEATURE_FOLDER = "features";
const DEFAULT_REPORT_NAME = "Multiple Cucumber HTML Reporter";

const parseFeatures = (suite: Suite, options: Options): void => {
  suite.features.forEach((feature) => {
    feature.scenarios = {
      passed: 0,
      failed: 0,
      notDefined: 0,
      skipped: 0,
      pending: 0,
      ambiguous: 0,
      passedPercentage: 0,
      failedPercentage: 0,
      notDefinedPercentage: 0,
      skippedPercentage: 0,
      pendingPercentage: 0,
      ambiguousPercentage: 0,
      total: 0,
    };
    feature.duration = 0;
    feature.time = "00:00:00.000";
    feature.isFailed = false;
    feature.isAmbiguous = false;
    feature.isSkipped = false;
    feature.isNotdefined = false;
    feature.isPending = false;
    suite.featureCount.total++;
    const idPrefix = options.staticFilePath ? "" : `${uuid()}.`;
    feature.id = `${idPrefix}${feature.id}`.replace(/[^a-zA-Z0-9-_]/g, "-");
    feature.app = 0;
    feature.browser = 0;

    if (feature.elements) {
      feature = parseScenarios(feature, suite, options);
    }

    if (feature.isFailed) {
      suite.featureCount.failed++;
    } else if (feature.isAmbiguous) {
      suite.featureCount.ambiguous++;
    } else if (feature.isNotdefined) {
      suite.featureCount.notDefined++;
    } else if (feature.isPending) {
      suite.featureCount.pending++;
    } else if (feature.isSkipped) {
      suite.featureCount.skipped++;
    } else {
      suite.featureCount.passed++;
    }

    if (feature.duration) {
      suite.totalTime += feature.duration;
      feature.time = formatDuration(feature.duration, !!options.durationInMS);
    }

    suite.app += feature.metadata?.app ? 1 : 0;
    suite.browser += feature.metadata?.browser ? 1 : 0;
  });
};

const parseScenarios = (
  feature: Feature,
  suite: Suite,
  options: Options
): Feature => {
  feature.elements?.forEach((scenario) => {
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
      scenario.time = formatDuration(scenario.duration, !!options.durationInMS);
    }

    if (scenario.description) {
      scenario.description = scenario.description.replace(/\r?\n/g, "<br />");
    }

    if (scenario.type === "background") return;

    suite.scenarios.total++;
    feature.scenarios.total++;

    if (scenario.failed > 0) {
      suite.scenarios.failed++;
      feature.scenarios.failed++;
      feature.isFailed = true;
    } else if (scenario.ambiguous > 0) {
      suite.scenarios.ambiguous++;
      feature.scenarios.ambiguous++;
      feature.isAmbiguous = true;
    } else if (scenario.notDefined > 0) {
      suite.scenarios.notDefined++;
      feature.scenarios.notDefined++;
      feature.isNotdefined = true;
    } else if (scenario.pending > 0) {
      suite.scenarios.pending++;
      feature.scenarios.pending++;
      feature.isPending = true;
    } else if (scenario.skipped > 0) {
      suite.scenarios.skipped++;
      feature.scenarios.skipped++;
      feature.isSkipped = true;
    } else {
      suite.scenarios.passed++;
      feature.scenarios.passed++;
    }
  });
  return feature;
};

const parseSteps = (
  scenario: Scenario,
  { durationInMS = false }: Options
): Scenario => {
  scenario.steps.forEach((step) => {
    if (!step.embeddings) {
      return;
    }

    step.attachments = step.attachments || [];

    step.embeddings.forEach((embedding, embeddingIndex) => {
      const { mime_type, media, data = "" } = embedding;
      const type = mime_type || media?.type;

      if (type === "text/html" || type === "text/plain") {
        embedding.data = Buffer.from(data.toString(), "base64").toString();
      }

      switch (type) {
        case "application/json":
          const content = Buffer.from(data, "base64").toString();
          step.json = (step.json || []).concat([
            typeof content === "string" ? JSON.parse(content) : content,
          ]);
          break;
        case "text/html":
          step.html = (step.html || []).concat([data]);
          break;
        case "text/plain":
          step.text = (step.text || []).concat([_escapeHtml(data)]);
          break;
        case "image/png":
          step.image = (step.image || []).concat([
            `data:image/png;base64,${data}`,
          ]);
          if (step.embeddings) {
            step.embeddings[embeddingIndex] = {};
          }
          break;
        case "video/webm":
          step.video = (step.video || []).concat([
            `data:video/webm;base64,${data}`,
          ]);
          if (step.embeddings) {
            step.embeddings[embeddingIndex] = {};
          }
          break;
        default:
          step.attachments?.push({
            data: `data:${type || "text/plain"};base64,${data}`,
            media: { type: type || "text/plain" },
          });
          if (step.embeddings) {
            step.embeddings[embeddingIndex] = {};
          }
      }
    });

    if (step.doc_string) {
      step.id = `${uuid()}.${scenario.id}.${step.name}`.replace(
        /[^a-zA-Z0-9-_]/g,
        "-"
      );
      step.restWireData = _escapeHtml(step.doc_string.value).replace(
        /\r?\n/g,
        "<br />"
      );
    }

    if (step.result) {
      const { status, duration } = step.result;
      if (duration) {
        scenario.duration += duration;
        step.time = formatDuration(duration, durationInMS);
      }

      switch (status.toLowerCase()) {
        case RESULT_STATUS.passed:
          scenario.passed++;
          break;
        case RESULT_STATUS.failed:
          scenario.failed++;
          break;
        case RESULT_STATUS.notDefined:
          scenario.notDefined++;
          break;
        case RESULT_STATUS.pending:
          scenario.pending++;
          break;
        case RESULT_STATUS.ambiguous:
          scenario.ambiguous++;
          break;
        default:
          scenario.skipped++;
      }
    }

    if (
      !step.result ||
      (step.hidden &&
        !step.text &&
        !step.image &&
        !step.video &&
        step.attachments?.length === 0 &&
        step.result.status !== RESULT_STATUS.failed)
    ) {
      return;
    }
  });

  return scenario;
};

export const generateReport = (options: Options): void => {
  if (!options.jsonDir)
    throw new Error("A path holding the JSON files should be provided.");
  if (!options.reportPath)
    throw new Error("An output path for the reports should be defined.");

  const {
    customMetadata = false,
    customData = null,
    overrideStyle = REPORT_STYLESHEET,
    customStyle,
    disableLog = false,
    openReportInBrowser = false,
    reportName = DEFAULT_REPORT_NAME,
    reportPath: reportPathOption,
    saveCollectedJSON = false,
    displayDuration = false,
    displayReportTime = false,
    hideMetadata = false,
    useCDN = false,
  } = options;

  const reportPath = path.resolve(process.cwd(), reportPathOption);

  fs.ensureDirSync(reportPath);
  fs.ensureDirSync(path.resolve(reportPath, FEATURE_FOLDER));

  const allFeatures = collectFeatures(options);

  let suite: Suite = {
    app: 0,
    customMetadata,
    customData,
    style: overrideStyle,
    customStyle,
    useCDN,
    hideMetadata,
    displayReportTime,
    displayDuration,
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
      ambiguousPercentage: 0,
      failedPercentage: 0,
      notDefinedPercentage: 0,
      pendingPercentage: 0,
      skippedPercentage: 0,
      passedPercentage: 0,
    },
    reportName,
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
  };

  parseFeatures(suite, options);

  suite.featureCount.passedPercentage = calculatePercentage(
    suite.featureCount.passed,
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
  suite.featureCount.ambiguousPercentage = calculatePercentage(
    suite.featureCount.ambiguous,
    suite.featureCount.total
  );

  if (saveCollectedJSON) {
    jsonFile.writeFileSync(
      path.resolve(reportPath, "enriched-output.json"),
      suite,
      { spaces: 2 }
    );
  }

  // Additional logging, browser opening, and report generation logic can be added here
  _createFeaturesOverviewIndexPage(suite, options);
  _createFeatureIndexPages(suite, options);

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

  if (openReportInBrowser) {
    open(path.join(reportPath, INDEX_HTML));
  }
};
