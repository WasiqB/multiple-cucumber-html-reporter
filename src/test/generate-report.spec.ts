import fs from "fs-extra";
import path from "path";
import { generateReport } from "../generate-report";
import { getCurrentDir } from "../utils/constants";
const REPORT_PATH = "./.tmp/";

describe("generate-report.ts", () => {
  const cleanUp = () => {
    if (fs.pathExistsSync(REPORT_PATH)) {
      fs.removeSync(REPORT_PATH);
    }
  };

  const reportPathExists = (filePath: string) => fs.pathExistsSync(filePath);

  describe("Happy flows", () => {
    beforeEach(() => cleanUp());
    afterEach(() => cleanUp());

    it("should create a report from the merged found json files without provided custom data", () => {
      generateReport({
        jsonDir: "./src/test/data/json",
        reportPath: REPORT_PATH,
        saveCollectedJSON: true,
        displayDuration: true,
      });

      expect(reportPathExists(path.join(REPORT_PATH, "index.html"))).toBe(true);
      expect(() =>
        fs.statSync(path.join(REPORT_PATH, "features/happy-flow-v2.html"))
      ).toThrow();
      expect(
        reportPathExists(path.join(REPORT_PATH, "merged-output.json"))
      ).toBe(true);
      expect(
        reportPathExists(path.join(REPORT_PATH, "enriched-output.json"))
      ).toBe(true);
    });

    it("should create a report with the report time", () => {
      generateReport({
        jsonDir: "./src/test/data/json",
        reportPath: REPORT_PATH,
        saveCollectedJSON: true,
        displayDuration: true,
        displayReportTime: true,
      });

      expect(reportPathExists(path.join(REPORT_PATH, "index.html"))).toBe(true);
      const indexHtmlContent = fs.readFileSync(
        path.join(REPORT_PATH, "index.html"),
        "utf8"
      );
      expect(indexHtmlContent).toContain(">Date</th>");
    });

    it("should create a report from the merged found json files with custom data with static file paths", () => {
      generateReport({
        jsonDir: "./src/test/data/json",
        reportPath: REPORT_PATH,
        staticFilePath: true,
        saveCollectedJSON: true,
        reportName: "You can adjust this report name",
        customData: {
          title: "Run info",
          data: [
            { label: "Project", value: "Custom project" },
            { label: "Release", value: "1.2.3" },
            { label: "Cycle", value: "B11221.34321" },
            {
              label: "Execution Start Time",
              value: "Nov 19th 2017, 02:31 PM EST",
            },
            {
              label: "Execution End Time",
              value: "Nov 19th 2017, 02:56 PM EST",
            },
          ],
        },
        displayDuration: true,
        durationInMS: true,
      });

      expect(reportPathExists(path.join(REPORT_PATH, "index.html"))).toBe(true);
      expect(
        reportPathExists(path.join(REPORT_PATH, "features/happy-flow-v2.html"))
      ).toBe(true);
      expect(
        reportPathExists(path.join(REPORT_PATH, "merged-output.json"))
      ).toBe(true);
      expect(
        reportPathExists(path.join(REPORT_PATH, "enriched-output.json"))
      ).toBe(true);
    });

    it("should create a report from the merged found json files with custom metadata", () => {
      try {
        generateReport({
          jsonDir: "./src/test/data/custom-metadata-json/",
          reportPath: REPORT_PATH,
          customMetadata: true,
        });
      } catch (error) {
        console.log(error);
      }

      expect(
        reportPathExists(path.join(process.cwd(), REPORT_PATH, "index.html"))
      ).toBe(true);
    });

    it("should create a report from the merged found json files and with array of embedded items", () => {
      generateReport({
        jsonDir: "./src/test/data/embedded-array-json/",
        reportName: "Embedded array of various mimeType",
        reportPath: REPORT_PATH,
        customStyle: path.join(getCurrentDir(import.meta.url), "my.css"),
        customMetadata: false,
      });

      expect(reportPathExists(path.join(REPORT_PATH, "index.html"))).toBe(true);
    });

    it("should open report in browser", () => {
      generateReport({
        jsonDir: "./src/test/data/embedded-array-json/",
        reportName: "Embedded array of various mimeType",
        reportPath: REPORT_PATH,
        openReportInBrowser: true,
        customStyle: path.join(getCurrentDir(import.meta.url), "my.css"),
        customMetadata: false,
      });

      expect(reportPathExists(path.join(REPORT_PATH, "index.html"))).toBe(true);
    });
  });

  describe("Failures", () => {
    it("should throw an error when the json folder does not exist", () => {
      expect(() => generateReport({})).toThrow(
        "A path holding the JSON files should be provided."
      );
    });

    it("should throw an error when the report folder is not provided", () => {
      expect(() =>
        generateReport({
          jsonDir: "./src/test/data/json",
        })
      ).toThrow("An output path for the reports should be defined.");
    });
  });
});
