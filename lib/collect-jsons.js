'use strict';

const find = require('find');
const fs = require('fs-extra');
const jsonFile = require('jsonfile');
const path = require('path');
const chalk = require('chalk');

module.exports = function collectJSONS(options) {
    const jsonOutput = [];
    let files;

    try {
        files = find.fileSync(/\.json$/, path.resolve(process.cwd(), options.jsonDir));
    } catch (e) {
        throw new Error(`There were issues reading JSON-files from '${options.jsonDir}'.`);
    }

    if (files.length > 0) {
        files.map(file => {
            // Cucumber json can be  empty, it's likely being created by another process (#47)
            const data = fs.readFileSync(file).toString() || "[]";

            JSON.parse(data).map(json => {
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

                // Only check the feature hooks if there are elements (fail safe)
                const {elements} = json;

                if (elements) {
                    const scenarios = elements.map(scenario => {
                        const {before, after} = scenario;

                        if (before) {
                            scenario.steps = parseFeatureHooks(before, 'Before').concat(scenario.steps);
                        }
                        if (after) {
                            scenario.steps = scenario.steps.concat(parseFeatureHooks(after, 'After'));
                        }

                        return scenario
                    })

                    json.elements = scenarios
                }

                jsonOutput.push(json)
            });
        });

        if (options.saveCollectedJSON) {
            const file = path.resolve(options.reportPath, 'merged-output.json');
            fs.ensureDirSync(options.reportPath);
            jsonFile.writeFileSync(file, jsonOutput, {spaces: 2});
        }

        return jsonOutput;
    }

    console.log(chalk.yellow(`WARNING: No JSON files found in '${options.jsonDir}'. NO REPORT CAN BE CREATED!`));
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
 *     line: string,
 *     match: {
 *         location: string
 *     },
 *     embeddings: []
 * }}
 */
function parseFeatureHooks(data, keyword) {
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
