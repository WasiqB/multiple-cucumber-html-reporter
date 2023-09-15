const report = require("multiple-cucumber-html-reporter");
const dayjs = require("dayjs");
const fs = require("fs");

const data = fs.readFileSync("./reports/cypress-report.json", {
  encoding: "utf8",
  flag: "r",
});
const runInfo = JSON.parse(data);

const osName = () => {
  switch (runInfo["osName"]) {
    case "win32":
      return "windows";
    case "linux":
      return "ubuntu";
    default:
      console.log("Undefined OS");
  }
};

const browserName = () => {
  switch (runInfo["browserName"]) {
    case "chrome":
      return "Chrome";
    case "firefox":
      return "Firefox";
    case "edge":
      return "Edge";
    case "webkit":
      return "Safari";
    default:
      console.log("Undefined Browser");
  }
};

report.generate({
  jsonDir: "./reports/cucumber-json",
  reportPath: "./reports",
  metadata: {
    browser: {
      name: browserName(),
      version: runInfo["browserVersion"],
    },
    platform: {
      name: osName(),
      version: runInfo["osVersion"],
    },
  },
  customData: {
    title: "Run Info",
    data: [
      { label: "Project", value: "Sample " },
      { label: "Release", value: "1.0.0" },
      { label: "Cypress Version", value: runInfo["cypressVersion"] },
      { label: "Node Version", value: runInfo["nodeVersion"] },
      {
        label: "Execution Start Time",
        value: dayjs(runInfo["startedTestsAt"]).format(
          "YYYY-MM-DD HH:mm:ss.SSS"
        ),
      },
      {
        label: "Execution End Time",
        value: dayjs(runInfo["endedTestsAt"]).format("YYYY-MM-DD HH:mm:ss.SSS"),
      },
    ],
  },
  pageTitle: "Sample",
  reportName: "Sample",
  displayDuration: true,
  displayReportTime: true,
});
