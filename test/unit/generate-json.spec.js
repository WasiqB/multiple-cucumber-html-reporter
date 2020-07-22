'use strict';

const fs = require('fs-extra');
const path = require('path');
const multiCucumberHTMLReporter = require('../../lib/generate-report');
const REPORT_PATH = './.tmp/';

describe('generate-report.js', () => {
    describe('Happy flows', () => {
        it('should create a report from the merged found json files without provided custom data', () => {
            fs.removeSync(REPORT_PATH);
            multiCucumberHTMLReporter.generate({
                jsonDir: './test/unit/data/json',
                reportPath: REPORT_PATH,
                saveCollectedJSON: true,
                displayDuration: true
            });

            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`).isFile())
                .toEqual(true, 'Index file exists');
            expect(function() { fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'features/happy-flow-v2.html')}`); })
                .toThrow();
            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'merged-output.json')}`).isFile())
                .toEqual(true, 'merged-output.json file exists');
            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'enriched-output.json')}`).isFile())
                .toEqual(true, 'temp-output.json file exists');
        });
        it('should create a report with the report time', () => {
            fs.removeSync(REPORT_PATH);
            multiCucumberHTMLReporter.generate({
                jsonDir: './test/unit/data/json',
                reportPath: REPORT_PATH,
                saveCollectedJSON: true,
                displayDuration: true,
                displayReportTime: true
            });

            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`).isFile())
                .toEqual(true, 'Index file exists');
            expect(fs.readFileSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`)).toContain('>Date</th>');
        });
        it('should create a report from the merged found json files with custom data with static file paths', () => {
            fs.removeSync(REPORT_PATH);
            multiCucumberHTMLReporter.generate({
                jsonDir: './test/unit/data/json',
                reportPath: REPORT_PATH,
                staticFilePath: true,
                saveCollectedJSON: true,
                reportName: 'You can adjust this report name',
                customData: {
                    title: 'Run info',
                    data: [
                        {label: 'Project', value: 'Custom project'},
                        {label: 'Release', value: '1.2.3'},
                        {label: 'Cycle', value: 'B11221.34321'},
                        {label: 'Execution Start Time', value: 'Nov 19th 2017, 02:31 PM EST'},
                        {label: 'Execution End Time', value: 'Nov 19th 2017, 02:56 PM EST'}
                    ]
                },
                displayDuration: true,
                durationInMS: true
            });

            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`).isFile())
                .toEqual(true, 'Index file exists');
            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'features/happy-flow-v2.html')}`).isFile())
                .toEqual(true, 'uuid free feature exists');
            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'merged-output.json')}`).isFile())
                .toEqual(true, 'merged-output.json file exists');
            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'enriched-output.json')}`).isFile())
                .toEqual(true, 'temp-output.json file exists');
        });
        it('should create a report from the merged found json files with custom metadata', () => {
            fs.removeSync(REPORT_PATH);
            multiCucumberHTMLReporter.generate({
                jsonDir: './test/unit/data/custom-metadata-json/',
                reportPath: REPORT_PATH,
                customMetadata: true
            });

            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`).isFile())
                .toEqual(true, 'Index file exists');
        });

        it('should create a report from the merged found json files and with array of embedded items', () => {
            fs.removeSync(REPORT_PATH);
            multiCucumberHTMLReporter.generate({
                jsonDir: './test/unit/data/embedded-array-json/',
                reportName: 'Embedded array of various mimeType',
                reportPath: REPORT_PATH,
                customStyle: path.join(__dirname, '../my.css'),
                customMetadata: false
            });

            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`).isFile())
                .toEqual(true, 'Index file exists');
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
