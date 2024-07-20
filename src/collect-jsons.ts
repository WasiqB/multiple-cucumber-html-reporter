import find from "find";
import fs from "fs-extra";
import path from "node:path";
import { Feature, Metadata, ReportOption, Step } from "./report-types.js";
import { formatToLocalIso } from "./helper.js";

export const collectJsonFiles = (options: ReportOption): Feature[] => {
  let jsonOutput: Feature[];
  let files: string[];

  try {
    files = find.fileSync(/\.json$/, path.resolve(process.cwd(), options.dir));
  } catch (e) {
    throw new Error(
      `There were issues reading JSON-files from '${options.dir}'.`,
      {
        cause: e,
      }
    );
  }

  if (files.length > 0) {
    files.forEach((file) => {
      // Cucumber json can be  empty, it's likely being created by another process (#47)
      const data = fs.readFileSync(file).toString() || "[]";
      const stats = fs.statSync(file);
      const reportTime = stats.birthtime;
      console.log({ data, stats });

      JSON.parse(data).map((json: Feature) => {
        let feature = json;
        if (options.metadata && !options.customMetadata && !feature.metadata) {
          feature.metadata = options.metadata as Metadata;
        } else {
          feature = {
            metadata: {
              browser: {
                name: "not known",
                version: "not known",
              },
              device: "not known",
              platform: {
                name: "not known",
                version: "not known",
              },
            },
          } satisfies Feature;
        }

        if (feature.metadata && options.displayReportTime && reportTime) {
          feature.metadata.reportTime = formatToLocalIso(reportTime);
        }

        // Only check the feature hooks if there are elements (fail-safe)
        const { scenarios } = feature;

        if (scenarios) {
          feature.scenarios = scenarios.map((scenario) => {
            const { before, after } = scenario;

            if (before) {
              scenario.steps = parseFeatureHooks(before, "Before").concat(
                scenario.steps
              );
            }
            if (after) {
              scenario.steps = scenario.steps.concat(
                parseFeatureHooks(after, "After")
              );
            }
            return scenario;
          });
        }
        jsonOutput?.push(feature);
      });
    });

    if (options.saveCollectedJson) {
      const file = path.resolve(options.reportPath, "merged-output.json");
      fs.ensureDirSync(options.reportPath);
      const content = JSON.stringify(jsonOutput);
      if (content) {
        fs.writeFileSync(file, content, { encoding: "utf-8" });
      }
    }

    return jsonOutput;
  }

  console.log(
    "\x1b[33m%s\x1b[0m",
    `WARNING: No JSON files found in '${options.dir}'. NO REPORT CAN BE CREATED!`
  );
  return [];
};

/**
 * Add the feature hooks to the steps so the report will pick them up properly
 *
 * @param {object} data
 * @param {string} keyword
 * @returns {{
 *     arguments: array,
 *     keyword: string,
 *     name: string,
 *     result: {
 *         status: string,
 *     },
 *     line: number,
 *     match: {
 *         location: string
 *     },
 *     embeddings: []
 * }}
 */
const parseFeatureHooks = (data: Step[], keyword: string): Step[] => {
  return data.map((step) => {
    const match = step.match?.location
      ? step.match
      : { location: "can not be determined" };

    return {
      arguments: step.arguments || [],
      keyword,
      name: "Hook",
      result: step.result,
      match,
      embeddings: step.embeddings || [],
    };
  });
};
