import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as multiCucumberHTMLReporter from '../../generate-report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORT_PATH = './.tmp/';

describe('generate-report.js', () => {
    describe('Happy flows', () => {
        it('should create a report from the merged found json files without provided custom data', () => {
            fs.removeSync(REPORT_PATH);
            multiCucumberHTMLReporter.generate({
                jsonDir: './src/test/unit/data/json',
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
                jsonDir: './src/test/unit/data/json',
                reportPath: REPORT_PATH,
                saveCollectedJSON: true,
                displayDuration: true,
                displayReportTime: true
            });

            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`).isFile())
                .toEqual(true, 'Index file exists');
            expect(fs.readFileSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`, 'utf8')).toContain('>Date</th>');
        });
        it('should create a report from the merged found json files with custom data with static file paths', () => {
            fs.removeSync(REPORT_PATH);
            multiCucumberHTMLReporter.generate({
                jsonDir: './src/test/unit/data/json',
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
                jsonDir: './src/test/unit/data/custom-metadata-json/',
                reportPath: REPORT_PATH,
                customMetadata: true
            });

            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`).isFile())
                .toEqual(true, 'Index file exists');
        });

        it('should create a report from the merged found json files and with array of embedded items', () => {
            fs.removeSync(REPORT_PATH);
            multiCucumberHTMLReporter.generate({
                jsonDir: './src/test/unit/data/embedded-array-json/',
                reportName: 'Embedded array of various mimeType',
                reportPath: REPORT_PATH,
                customStyle: path.join(__dirname, '../my.css'),
                customMetadata: false
            });

            expect(fs.statSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`).isFile())
                .toEqual(true, 'Index file exists');
        });

        it('should calculate feature duration with wall clock when durationAggregation is wallClock', () => {
            fs.removeSync(REPORT_PATH);
            multiCucumberHTMLReporter.generate({
                jsonDir: './src/test/unit/data/json-parallel-time/',
                reportPath: REPORT_PATH,
                saveCollectedJSON: true,
                displayDuration: true,
                durationAggregation: 'wallClock'
            });

            const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
            expect(enriched.features[0].time).toEqual('00:00:15.000');
            expect(fs.readFileSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`, 'utf8'))
                .toContain('>Duration (wall clock)<');
        });

        it('should fallback to summed duration when wallClock is selected but timestamps are missing', () => {
            fs.removeSync(REPORT_PATH);
            multiCucumberHTMLReporter.generate({
                jsonDir: './src/test/unit/data/json-partial-parallel-time/',
                reportPath: REPORT_PATH,
                saveCollectedJSON: true,
                displayDuration: true,
                durationAggregation: 'wallClock'
            });

            const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
            expect(enriched.features[0].time).toEqual('00:00:20.000');
        });

        it('should keep summed duration by default even when timestamps are present', () => {
            fs.removeSync(REPORT_PATH);
            multiCucumberHTMLReporter.generate({
                jsonDir: './src/test/unit/data/json-parallel-time/',
                reportPath: REPORT_PATH,
                saveCollectedJSON: true,
                displayDuration: true
            });

            const enriched = fs.readJsonSync(path.join(process.cwd(), REPORT_PATH, 'enriched-output.json'));
            expect(enriched.features[0].time).toEqual('00:00:20.000');
            expect(fs.readFileSync(`${path.join(process.cwd(), REPORT_PATH, 'index.html')}`, 'utf8'))
                .toContain('>Duration<');
        });
    });

    describe('failures', () => {
        it('should throw an error when no options are provided', () => {
            expect(() => (multiCucumberHTMLReporter as any).generate()).toThrowError('Options need to be provided.');
        });

        it('should throw an error when the json folder does not exist', () => {
            expect(() => (multiCucumberHTMLReporter as any).generate({})).toThrowError(`A path which holds the JSON files should be provided.`);
        });

        it('should throw an error when the report folder is not provided', () => {
            expect(() => (multiCucumberHTMLReporter as any).generate({
                jsonDir: './src/test/unit/data/json'
            } as any)).toThrowError(`An output path for the reports should be defined, no path was provided.`);
        });
    });
});
