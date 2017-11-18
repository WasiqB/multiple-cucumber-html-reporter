'use strict';

const fs = require('fs-extra');
const path = require('path');
const multiCucumberHTMLReporter = require('../../lib/generate-report');
const REPORT_PATH = './.tmp/';

describe('generate-report.js', () => {
    describe('Happy flows', () => {
        it('should create a report from the merged found json files', () => {
            fs.removeSync(REPORT_PATH);
            multiCucumberHTMLReporter.generate({
                jsonDir: './test/unit/data/json',
                featuresFolder: './test/unit/data/features-scenarios-outline',
                reportPath: REPORT_PATH,
                saveCollectedJSON: true
            });

            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`).isFile())
                .toEqual(true, 'Index file exists');
            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'merged-output.json')}`).isFile())
                .toEqual(true, 'merged-output.json file exists');
            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'enriched-output.json')}`).isFile())
                .toEqual(true, 'temp-output.json file exists');
        });
    });

    describe('failures', () => {
        it('should throw an error when no options are provided', () => {
            expect(() => multiCucumberHTMLReporter.generate()).toThrowError('Options need to be provided.');
        });

        it('should throw an error when the json folder does not exist', () => {
            expect(() => multiCucumberHTMLReporter.generate({})).toThrowError(`A path which holds the JSON files should be provided.`);
        });

        it('should throw an error when the report folder is not provided', () => {
            expect(() => multiCucumberHTMLReporter.generate({
                jsonDir: './test/unit/data/json'
            })).toThrowError(`An output path for the reports should be defined, no path was provided.`);
        });
    });
});
