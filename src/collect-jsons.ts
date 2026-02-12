import find from 'find';
const { fileSync } = find;
import fs from 'fs-extra';
const { readFileSync, statSync, ensureDirSync } = fs;
import jsonfile from 'jsonfile';
const { writeFileSync } = jsonfile;
import { resolve } from 'node:path';
import { DateTime } from 'luxon';
import { Options, Feature, Step } from './types.js';

/**
 * Formats input date to yyyy/MM/dd HH:mm:ss
 *
 * @param {Date | string} date
 * @returns {string} formatted date in ISO format local time
 */
function formatToLocalIso(date: Date | string): string {
    return typeof date === 'string' ? 
        DateTime.fromISO(date).toFormat('yyyy/MM/dd HH:mm:ss')
        :
        DateTime.fromJSDate(date).toFormat('yyyy/MM/dd HH:mm:ss');
}

export default function collectJSONS(options: Options): Feature[] {
    const jsonOutput: Feature[] = [];
    let files: string[];

    try {
        files = fileSync(/\.json$/, resolve(process.cwd(), options.jsonDir));
    } catch (e) {
        throw new Error(`There were issues reading JSON-files from '${options.jsonDir}'.`);
    }

    if (files.length > 0) {
        files.forEach(file => {
            // Cucumber json can be  empty, it's likely being created by another process (#47)
            const data = readFileSync(file).toString() || "[]";
            const stats = statSync(file);
            const reportTime = stats.birthtime;

            const features: Feature[] = JSON.parse(data);

            features.forEach(json => {
                if (options.metadata && !json.metadata) {
                    json.metadata = options.metadata;
                } else {
                    json = Object.assign({
                        "metadata": {
                            "browser": {
                                "name": "not known",
                                "version": "not known"
                            },
                            "device": "not known",
                            "platform": {
                                "name": "not known",
                                "version": "not known"
                            }
                        }
                    }, json);
                }

                if (json.metadata && options.displayReportTime && reportTime) {
                    if (!Array.isArray(json.metadata)) {
                        json.metadata = Object.assign({ reportTime: reportTime }, json.metadata);
                        (json.metadata as any).reportTime = formatToLocalIso((json.metadata as any).reportTime);
                    }
                }

                // Only check the feature hooks if there are elements (fail-safe)
                const {elements} = json;

                if (elements) {
                    json.elements = elements.map(scenario => {
                        const {before, after} = scenario;

                        if (before) {
                            scenario.steps = parseFeatureHooks(before, 'Before').concat(scenario.steps);
                        }
                        if (after) {
                            scenario.steps = scenario.steps.concat(parseFeatureHooks(after, 'After'));
                        }

                        return scenario
                    })
                }

                jsonOutput.push(json)
            });
        });

        if (options.saveCollectedJSON) {
            const file = resolve(options.reportPath, 'merged-output.json');
            ensureDirSync(options.reportPath);
            writeFileSync(file, jsonOutput, {spaces: 2});
        }

        return jsonOutput;
    }

    console.log('\x1b[33m%s\x1b[0m', `WARNING: No JSON files found in '${options.jsonDir}'. NO REPORT CAN BE CREATED!`);
    return [];
};

/**
 * Add the feature hooks to the steps so the report will pick them up properly
 *
 * @param {object} data
 * @param {string} keyword
 * @returns {Step[]}
 */
function parseFeatureHooks(data: any[], keyword: string): Step[] {
    return data.map(step => {
        const match = step.match && step.match.location ? step.match : {location: 'can not be determined'};

        return {
            arguments: step.arguments || [],
            keyword: keyword,
            name: 'Hook',
            result: step.result,
            line: '',
            match,
            embeddings: step.embeddings || []
        }
    })
}
