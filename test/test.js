"use strict";
const path = require("node:path");

const test = require("../lib/generate-report");

/**
 * Generate a report for browsers
 */
test.generate({
  saveCollectedJSON: true,
  jsonDir: "./test/unit/data/json/",
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
test.generate({
  saveCollectedJSON: true,
  jsonDir: "./test/unit/data/embedded-array-json/",
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
test.generate({
  saveCollectedJSON: true,
  jsonDir: "./test/unit/data/json/",
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
test.generate({
  saveCollectedJSON: true,
  jsonDir: "./test/unit/data/custom-metadata-json/",
  reportPath: "./.tmp/custom-metadata/",
  customMetadata: true,
  displayDuration: true,
  metadata: [
    { name: "Backend version", value: "4.0 R11" },
    { name: "Client API version", value: "17.10" },
    { name: "Test Configuration", value: "Config A" },
    { name: "platform", value: "Ubuntu" },
    { name: "platform version", value: "16.04" },
  ],
});
