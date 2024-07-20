import { describe, expect, it, vi } from "vitest";
import path from "path";
import { collectJsonFiles } from "../../collect-jsons.js";
import { ReportOption } from "../../report-types.js";
import fs from "fs-extra";

const reportPath = path.resolve(process.cwd(), "./.tmp/test");

describe("collect-jsons.ts", () => {
  describe("Happy flows", () => {
    it("should return an output from the merged found json files", () => {
      const expectedPath = path.resolve(
        process.cwd(),
        "./src/test/unit/data/output/merged-output.json"
      );
      const actualFeatures = collectJsonFiles({
        dir: "./src/test/unit/data/json",
        reportPath: reportPath,
      });
      console.log(expectedPath);
      console.log(actualFeatures);
      expect(actualFeatures).toEqual(fs.readFileSync(expectedPath));
    });

    it.skip("should return an output from the merged found json files and add the provided metadata", () => {
      expect(
        collectJsonFiles({
          dir: "./src/test/unit/data/collect-json",
          reportPath: reportPath,
          metadata: {
            browser: {
              name: "chrome",
              version: "1",
            },
            device: "Local test machine",
            platform: {
              name: "Ubuntu",
              version: "16.04",
            },
          },
        })
      ).toEqual(
        fs.readFileSync(
          path.resolve(
            process.cwd(),
            "./src/test/unit/data/output/provided-metadata.json"
          )
        )
      );
    });

    it.skip("should save an output from the merged found json files", () => {
      expect(
        collectJsonFiles({
          dir: "./src/test/unit/data/json",
          reportPath: reportPath,
          saveCollectedJson: true,
        })
      ).toEqual(
        fs.readFileSync(
          path.resolve(
            process.cwd(),
            "./src/test/unit/data/output/merged-output.json"
          )
        )
      );
    });

    it.skip("should collect the creation date of json files", () => {
      // Given
      const options = {
        dir: "./src/test/unit/data/json",
        reportPath: reportPath,
        displayReportTime: true,
      } satisfies ReportOption;

      // When
      const collectedJSONs = collectJsonFiles(options);

      // Then
      collectedJSONs.forEach((json) => {
        expect(json.metadata.reportTime).toBeDefined();
        expect(json.metadata.reportTime.length).toBe(
          "YYYY/MM/DD HH:mm:ss".length
        );
      });
    });
  });

  describe.skip("failures", () => {
    it.skip("should throw an error when the json folder does not exist", () => {
      expect(() =>
        collectJsonFiles({
          dir: "./src/test/unit/data/bla",
          reportPath: reportPath,
        })
      ).toThrow(
        new Error(
          `There were issues reading JSON-files from './test/unit/data/bla'.`
        )
      );
    });

    it.skip("should print a console message when no json files could be found", () => {
      vi.spyOn(console, "log");
      collectJsonFiles({
        dir: "./src/test/unit/data/no-jsons",
        reportPath: reportPath,
      });
      expect(console.log).toHaveBeenCalledWith(
        "\x1b[33m%s\x1b[0m",
        `WARNING: No JSON files found in './test/unit/data/no-jsons'. NO REPORT CAN BE CREATED!`
      );
    });

    it.skip("should return an empty array when no json files could be found", () => {
      const results = collectJsonFiles({
        dir: "./src/test/unit/data/no-jsons",
        reportPath: reportPath,
      });
      expect(Array.isArray(results)).toBeTruthy();
      expect(results.length).toBe(0);
    });
  });
});
