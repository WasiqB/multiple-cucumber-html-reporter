import jsonFile from "jsonfile";
import path from "path";
import { collectFeatures } from "../collect-jsons";
import { defaultOptions } from "../types/default-values";
import { Options } from "../types/report-types";

const reportPath = path.resolve(process.cwd(), "./.temp/test");

describe("collect-features.ts", () => {
  describe("Happy flows", () => {
    it("should return an output from the merged found JSON files", () => {
      const result = collectFeatures({
        ...defaultOptions,
        jsonDir: "./src/test/data/json",
        reportPath,
      });
      const expectedOutput = jsonFile.readFileSync(
        path.resolve(process.cwd(), "./src/test/data/output/merged-output.json")
      );

      expect(result).toEqual(expectedOutput);
    });

    it("should return an output from the merged found JSON files and add the provided metadata", () => {
      const result = collectFeatures({
        ...defaultOptions,
        jsonDir: "./src/test/data/collect-json",
        reportPath,
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
      });
      const expectedOutput = jsonFile.readFileSync(
        path.resolve(
          process.cwd(),
          "./src/test/data/output/provided-metadata.json"
        )
      );

      expect(result).toEqual(expectedOutput);
    });

    it("should save an output from the merged found JSON files", () => {
      const result = collectFeatures({
        ...defaultOptions,
        jsonDir: "./src/test/data/json",
        reportPath,
        saveCollectedJSON: true,
      });
      const expectedOutput = jsonFile.readFileSync(
        path.resolve(process.cwd(), "./src/test/data/output/merged-output.json")
      );

      expect(result).toEqual(expectedOutput);
    });

    it("should collect the creation date of JSON files", () => {
      const options: Options = {
        ...defaultOptions,
        jsonDir: "./src/test/data/json",
        reportPath,
        displayReportTime: true,
      };

      const collectedFeatures = collectFeatures(options);

      collectedFeatures.forEach((json) => {
        expect(json.metadata?.reportTime).toBeDefined();
        expect(json.metadata?.reportTime?.length).toBe(
          "YYYY/MM/DD HH:mm:ss".length
        );
      });
    });
  });

  describe("Failures", () => {
    it("should throw an error when the JSON folder does not exist", () => {
      expect(() => {
        collectFeatures({
          ...defaultOptions,
          jsonDir: "./src/test/data/nonexistent",
          reportPath,
        });
      }).toThrow(
        new Error(
          `Unable to read JSON files from './src/test/data/nonexistent'.`
        )
      );
    });

    it("should print a console message when no JSON files could be found", () => {
      const consoleSpy = import.meta.jest
        .spyOn(console, "warn")
        .mockImplementation();

      collectFeatures({
        ...defaultOptions,
        jsonDir: "./src/test/data/no-jsons",
        reportPath,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        `WARNING: No JSON files found in './src/test/data/no-jsons'. NO REPORT CAN BE CREATED!`
      );
      consoleSpy.mockRestore();
    });

    it("should return an empty array when no JSON files could be found", () => {
      const result = collectFeatures({
        ...defaultOptions,
        jsonDir: "./src/test/data/no-jsons",
        reportPath,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});
