import fs from "fs-extra";
import path from "path";
import _ from "lodash";
import { Options, Suite } from "../types/report-types.js";
import { getCurrentDir } from "./constants.js";

const dirname = getCurrentDir(import.meta.url);

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

/**
 * Read a template file and return its content
 * @param {string} fileName - Name of the file
 * @returns {string} Content of the file
 */
const _readTemplateFile = (fileName: string): string => {
  try {
    fs.accessSync(fileName, fs.constants.R_OK);
    return fs.readFileSync(fileName, "utf-8");
  } catch (err) {
    return fs.readFileSync(
      path.join(dirname, "..", "templates", fileName),
      "utf-8"
    );
  }
};

/**
 * Escape HTML in a string
 * @param {any} input - The string to escape
 * @returns {string} Escaped string
 */
const _escapeHtml = (input: any): string => {
  return typeof input === "string" || input instanceof String
    ? input.replace(/[^0-9A-Za-z ]/g, (chr) => `&#${chr.charCodeAt(0)};`)
    : input;
};

/**
 * Generate the features overview page
 * @param {Suite} suite - JSON object with all the features and scenarios
 */
const _createFeaturesOverviewIndexPage = (
  suite: Suite,
  { reportPath, metadata, pageTitle, reportName, pageFooter }: Options
): void => {
  const featuresOverviewIndex = path.resolve(reportPath || "", INDEX_HTML);

  if (suite.customMetadata && metadata) {
    suite.features.forEach((feature) => {
      if (!feature.metadata) {
        feature.metadata = metadata;
      }
    });
  }

  const template = suite.customMetadata
    ? FEATURES_OVERVIEW_CUSTOM_METADATA_TEMPLATE
    : FEATURES_OVERVIEW_TEMPLATE;

  fs.writeFileSync(
    featuresOverviewIndex,
    _.template(_readTemplateFile(FEATURES_OVERVIEW_INDEX_TEMPLATE))({
      suite: suite,
      featuresOverview: _.template(_readTemplateFile(template))({
        suite: suite,
        _: _,
      }),
      featuresScenariosOverviewChart: _.template(
        _readTemplateFile(SCENARIOS_OVERVIEW_CHART_TEMPLATE)
      )({
        overviewPage: true,
        scenarios: suite.scenarios,
        _: _,
      }),
      customDataOverview: _.template(_readTemplateFile(CUSTOM_DATA_TEMPLATE))({
        suite: suite,
        _: _,
      }),
      featuresOverviewChart: _.template(
        _readTemplateFile(FEATURES_OVERVIEW_CHART_TEMPLATE)
      )({
        suite: suite,
        _: _,
      }),
      customStyle: suite.customStyle
        ? _readTemplateFile(suite.customStyle)
        : "",
      styles: _readTemplateFile(suite.style),
      useCDN: suite.useCDN,
      genericScript: _readTemplateFile(GENERIC_JS),
      pageTitle: pageTitle,
      reportName: reportName,
      pageFooter: pageFooter,
    })
  );
};

/**
 * Generate the feature index pages
 * @param {Suite} suite - JSON object with all the features and scenarios
 */
const _createFeatureIndexPages = (
  suite: Suite,
  { reportPath, plainDescription, pageTitle, pageFooter, reportName }: Options
): void => {
  const template = suite.customMetadata
    ? FEATURE_CUSTOM_METADATA_OVERVIEW_TEMPLATE
    : FEATURE_METADATA_OVERVIEW_TEMPLATE;

  suite.features.forEach((feature) => {
    const featurePage = path.resolve(
      reportPath || "",
      `${FEATURE_FOLDER}/${feature.id}.html`
    );

    fs.writeFileSync(
      featurePage,
      _.template(_readTemplateFile(FEATURE_OVERVIEW_INDEX_TEMPLATE))({
        feature: feature,
        suite: suite,
        featureScenariosOverviewChart: _.template(
          _readTemplateFile(SCENARIOS_OVERVIEW_CHART_TEMPLATE)
        )({
          overviewPage: false,
          feature: feature,
          suite: suite,
          scenarios: feature.scenarios,
          _: _,
        }),
        featureMetadataOverview: _.template(_readTemplateFile(template))({
          metadata: feature.metadata,
          _: _,
        }),
        scenarioTemplate: _.template(_readTemplateFile(SCENARIOS_TEMPLATE))({
          suite: suite,
          scenarios: feature.elements,
          _: _,
        }),
        useCDN: suite.useCDN,
        customStyle: suite.customStyle
          ? _readTemplateFile(suite.customStyle)
          : "",
        styles: _readTemplateFile(suite.style),
        genericScript: _readTemplateFile(GENERIC_JS),
        pageTitle: pageTitle,
        reportName: reportName,
        pageFooter: pageFooter,
        plainDescription: plainDescription,
      })
    );

    // Copy assets if they don't exist and CDN is not used
    const assetsPath = path.resolve(reportPath || "", "assets");

    if (!fs.pathExistsSync(assetsPath) && !suite.useCDN) {
      fs.copySync(path.join(dirname, "..", "templates", "assets"), assetsPath);
    }
  });
};

export {
  _createFeaturesOverviewIndexPage,
  _createFeatureIndexPages,
  _escapeHtml,
};
