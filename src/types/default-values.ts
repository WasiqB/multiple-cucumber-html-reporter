import { Options } from "./report-types.js";

const REPORT_STYLESHEET = "style.css";
const DEFAULT_REPORT_NAME = "Multiple Cucumber HTML Reporter";

const defaultOptions = {
  customMetadata: false,
  customData: null,
  plainDescription: false,
  overrideStyle: REPORT_STYLESHEET,
  disableLog: false,
  openReportInBrowser: false,
  reportName: DEFAULT_REPORT_NAME,
  saveCollectedJSON: false,
  displayDuration: false,
  displayReportTime: false,
  durationInMS: false,
  hideMetadata: false,
  pageTitle: DEFAULT_REPORT_NAME,
  pageFooter: null,
  useCDN: false,
  staticFilePath: false,
} satisfies Options;

export { defaultOptions };
