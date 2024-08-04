import { generate } from "multiple-cucumber-html-reporter";
import dayjs from "dayjs";
import { readFileSync } from "fs";

const data = readFileSync("./.run/results.json", {
  encoding: "utf8",
  flag: "r",
});
const runInfos = JSON.parse(data);

let mapOs = (os: string) => {
  if (os.startsWith("win")) {
    return "windows";
  } else if (os.startsWith("darwin")) {
    return "osx";
  } else if (os.startsWith("linux")) {
    return "linux";
  } else if (os.startsWith("ubuntu")) {
    return "ubuntu";
  } else if (os.startsWith("android")) {
    return "android";
  } else if (os.startsWith("ios")) {
    return "ios";
  }
};

generate({
  jsonDir: "./.run/reports/json/",
  reportPath: "./.run/html-report/",
  openReportInBrowser: true,
  metadata: {
    browser: {
      name:
        runInfos.browserName === "chromium" ? "chrome" : runInfos.browserName,
      version: runInfos.browserVersion,
    },
    platform: {
      name: mapOs(runInfos.osName),
      version: runInfos.osVersion,
    },
  },
  customData: {
    title: "Run Info",
    data: [
      { label: "Project", value: "Sample " },
      { label: "Release", value: "1.0.0" },
      { label: "Cypress Version", value: runInfos["cypressVersion"] },
      { label: "Node Version", value: runInfos["nodeVersion"] },
      {
        label: "Execution Start Time",
        value: dayjs(runInfos["startedTestsAt"]).format(
          "YYYY-MM-DD HH:mm:ss.SSS"
        ),
      },
      {
        label: "Execution End Time",
        value: dayjs(runInfos["endedTestsAt"]).format(
          "YYYY-MM-DD HH:mm:ss.SSS"
        ),
      },
    ],
  },
  pageTitle: "Sample",
  reportName: "Sample",
  displayDuration: true,
  displayReportTime: true,
});
