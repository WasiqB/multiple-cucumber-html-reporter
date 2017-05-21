'use strict';

const find = require('find');
const fs = require('fs-extra');
const jsonFile = require('jsonfile');
const path = require('path');

module.exports = function collectJSONS(options) {
    const jsonOutput = [];
    let files;

    try {
        files = find.fileSync(/\.json$/, path.resolve(process.cwd(), options.jsonDir));
    } catch (e) {
        throw new Error(`There were issues reading JSON-files from '${options.jsonDir}'.`);
    }

    if (files.length === 0) {
        throw new Error(`No JSON files found in '${options.jsonDir}'. NO REPORT CAN BE CREATED!`);
    }

    files.map(file => jsonFile.readFileSync(file).map(json => {
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
        jsonOutput.push(json)
    }));

    if (options.saveCollectedJSON) {
        const file = path.resolve(options.reportPath, 'merged-output.json');
        fs.ensureDirSync(options.reportPath);
        jsonFile.writeFileSync(file, jsonOutput, {spaces: 2});
    }

    return jsonOutput;
};