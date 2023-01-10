'use strict';

const find = require('find');
const fs = require('fs-extra');
const jsonFile = require('jsonfile');
const path = require('path');
const { DateTime } = require('luxon');

/**
 * Formats input date to yyyy/MM/dd HH:mm:ss
 *
 * @param {Date} date
 * @returns {string} formatted date in ISO format local time
 */
function formatToLocalIso(date) {
    return typeof date === 'string' ? 
        DateTime.fromISO(date).toFormat('yyyy/MM/dd HH:mm:ss')
        :
        DateTime.fromJSDate(date).toFormat('yyyy/MM/dd HH:mm:ss');
}

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
            const stats = fs.statSync(file);
            const reportTime = stats.birthtime;

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

                if (json.metadata && options.displayReportTime && reportTime) {
                    json.metadata = Object.assign({reportTime: reportTime}, json.metadata)
                    json.metadata.reportTime = formatToLocalIso(json.metadata.reportTime);
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
            const file = path.resolve(options.reportPath, 'merged-output.json');
            fs.ensureDirSync(options.reportPath);
            jsonFile.writeFileSync(file, jsonOutput, {spaces: 2});
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
