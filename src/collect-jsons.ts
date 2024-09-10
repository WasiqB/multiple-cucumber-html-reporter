import find from "find";
import fs from "fs-extra";
import jsonFile from "jsonfile";
import path from "node:path";
import { Feature, FeatureHook, Options } from "./types/report-types.js";
import { formatToLocalIso } from "./utils/common.js";

const parseFeatureHooks = (data: any[], keyword: string): FeatureHook[] => {
  return data.map((step) => {
    const match =
      step.match && step.match.location
        ? step.match
        : { location: "can not be determined" };

    return {
      arguments: step.arguments || [],
      keyword: keyword,
      name: "Hook",
      result: step.result,
      line: "",
      match,
      embeddings: step.embeddings || [],
    };
  });
};

export const collectFeatures = (options: Options): Feature[] => {
  const features: Feature[] = [];
  const jsonDirPath = path.resolve(process.cwd(), options.jsonDir || "");

  let files: string[];
  try {
    files = find.fileSync(/\.json$/, jsonDirPath);
  } catch {
    throw new Error(`Unable to read JSON files from '${options.jsonDir}'.`);
  }

  if (files.length === 0) {
    console.warn(
      `WARNING: No JSON files found in '${options.jsonDir}'. NO REPORT CAN BE CREATED!`
    );
    return [];
  }

  files.forEach((file) => {
    const data = fs.readFileSync(file, "utf-8") || "[]";
    const reportTime = fs.statSync(file).birthtime;

    JSON.parse(data).forEach((json: Feature) => {
      json.metadata = json.metadata ||
        options.metadata || {
          browser: { name: "not known", version: "not known" },
          device: "not known",
          platform: { name: "not known", version: "not known" },
        };

      if (options.displayReportTime && reportTime) {
        json.metadata.reportTime = formatToLocalIso(reportTime);
      }

      if (json.elements) {
        json.elements = json.elements.map((scenario) => ({
          ...scenario,
          steps: [
            ...parseFeatureHooks(scenario.before || [], "Before"),
            ...(scenario.steps || []),
            ...parseFeatureHooks(scenario.after || [], "After"),
          ],
        }));
      }

      features.push(json);
    });
  });

  if (options.saveCollectedJSON) {
    const outputFile = path.resolve(options.reportPath!, "merged-output.json");
    fs.ensureDirSync(options.reportPath!);
    jsonFile.writeFileSync(outputFile, features, { spaces: 2 });
  }

  return features;
};
