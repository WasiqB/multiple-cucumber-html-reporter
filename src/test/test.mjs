import path from "node:path";
import { generateReport } from "../../dist/generate-report.js";
import { getCurrentDir } from "../../dist/utils/constants.js";

const __dirname = getCurrentDir(import.meta.url);

/**
 * Generate a report for browsers
 */
generateReport({
  saveCollectedJSON: true,
  jsonDir: "./src/test/data/json/",
  reportPath: "./.tmp/browsers/",
  reportName: "You can adjust this report name",
  customMetadata: false,
  displayDuration: true,
  durationInMS: true,
  customData: {
    title: "Run info",
    data: [
      { label: "Project", value: "Custom project" },
      { label: "Release", value: "1.2.3" },
      { label: "Cycle", value: "B11221.34321" },
      { label: "Execution Start Time", value: "Nov 19th 2017, 02:31 PM EST" },
      { label: "Execution End Time", value: "Nov 19th 2017, 02:56 PM EST" },
    ],
  },
});

/**
 * Generate a report with array of embedded data
 */
generateReport({
  saveCollectedJSON: true,
  jsonDir: "./src/test/data/embedded-array-json/",
  reportPath: "./.tmp/embedded-array/",
  customStyle: path.join(__dirname, "./custom.css"),
  overrideStyle: path.join(__dirname, "./my.css"),
  customMetadata: false,
  pageTitle: "A custom page title",
  pageFooter: "<div><p>Some custom footer data can be placed here</p></div>",
  plainDescription: true,
  customData: {
    title: "Run info",
    data: [
      { label: "Project", value: "Custom embedded project" },
      { label: "Release", value: "4.5.6" },
    ],
  },
});

/**
 * Generate a report for browsers with report time
 */
generateReport({
  saveCollectedJSON: true,
  jsonDir: "./src/test/data/json/",
  reportPath: "./.tmp/browsers-with-report-time/",
  reportName: "You can adjust this report name",
  customMetadata: false,
  displayDuration: true,
  displayReportTime: true,
  hideMetadata: true,
  durationInMS: true,
  customData: {
    title: "Run info",
    data: [
      { label: "Project", value: "Custom project" },
      { label: "Release", value: "1.2.3" },
      { label: "Cycle", value: "B11221.34321" },
      { label: "Execution Start Time", value: "Nov 19th 2017, 02:31 PM EST" },
      { label: "Execution End Time", value: "Nov 19th 2017, 02:56 PM EST" },
    ],
  },
});

/**
 * Generate a report with custom metadata
 * NOTE: must be last, if you use customMetadata you cannot reuse generator
 */
generateReport({
  saveCollectedJSON: true,
  jsonDir: "./src/test/data/custom-metadata-json/",
  reportPath: "./.tmp/custom-metadata/",
  customMetadata: true,
  displayDuration: true,
  metadata: {
    metadata: [
      { name: "Backend version", value: "4.0 R11" },
      { name: "Client API version", value: "17.10" },
      { name: "Test Configuration", value: "Config A" },
    ],
    platform: { name: "Ubuntu", version: "16.04" },
  },
});
