const {readFileSync, removeSync, statSync} = require('fs-extra');
const {join} = require('path');
const {createReportFolders} = require('../../lib/utils');
const multiCucumberHTMLReporter = require('../../lib/generate-report');
const collectJSONS = require('../../lib/collect-jsons');
const REPORT_PATH = join(process.cwd(), './.tmp/');

jest.mock('../../lib/utils');
jest.mock('../../lib/collect-jsons');

let createReportFoldersSpy, collectJSONSSpy;

beforeEach(()=> {
    removeSync(REPORT_PATH);
    createReportFoldersSpy = createReportFolders;
    collectJSONSSpy = collectJSONS.mockReturnValue([{}]);
});

afterEach(() => jest.resetAllMocks());

// test('Create a report from the merged found json files without provided custom data', () => {
//     multiCucumberHTMLReporter.generate({
//         jsonDir: './test/unit/data/generate-report',
//         reportPath: REPORT_PATH,
//         saveCollectedJSON: true,
//         displayDuration: true
//     });
//
//     expect(statSync(`${join(REPORT_PATH, 'index.html')}`).isFile()).toEqual(true, 'Index file exists');
//     expect(function () {
//         statSync(`${join(REPORT_PATH, 'features/happy-flow-v2.html')}`);
//     })
//         .toThrow();
//     expect(statSync(`${join(REPORT_PATH, 'merged-output.json')}`).isFile())
//         .toEqual(true, 'merged-output.json file exists');
//     expect(statSync(`${join(REPORT_PATH, 'enriched-output.json')}`).isFile())
//         .toEqual(true, 'temp-output.json file exists');
// });

// test('Create a report with the report time', () => {
//     multiCucumberHTMLReporter.generate({
//         jsonDir: './test/unit/data/generate-report',
//         reportPath: REPORT_PATH,
//         saveCollectedJSON: true,
//         displayDuration: true,
//         displayReportTime: true
//     });
//
//     expect(statSync(`${join(REPORT_PATH, 'index.html')}`).isFile())
//         .toEqual(true, 'Index file exists');
//     expect(readFileSync(`${join(REPORT_PATH, 'index.html')}`, 'utf8')).toContain('>Date</th>');
// });

// test('Create a report from the merged found json files with custom data with static file paths', () => {
//     multiCucumberHTMLReporter.generate({
//         jsonDir: './test/unit/data/generate-report',
//         reportPath: REPORT_PATH,
//         staticFilePath: true,
//         saveCollectedJSON: true,
//         reportName: 'You can adjust this report name',
//         customData: {
//             title: 'Run info',
//             data: [
//                 {label: 'Project', value: 'Custom project'},
//                 {label: 'Release', value: '1.2.3'},
//                 {label: 'Cycle', value: 'B11221.34321'},
//                 {label: 'Execution Start Time', value: 'Nov 19th 2017, 02:31 PM EST'},
//                 {label: 'Execution End Time', value: 'Nov 19th 2017, 02:56 PM EST'}
//             ]
//         },
//         displayDuration: true,
//         durationInMS: true
//     });
//
//     expect(statSync(`${join(REPORT_PATH, 'index.html')}`).isFile()).toEqual(true, 'Index file exists');
//     expect(statSync(`${join(REPORT_PATH, 'features/after-error.html')}`).isFile())
//         .toEqual(true, 'uuid free feature exists');
//     expect(statSync(`${join(REPORT_PATH, 'merged-output.json')}`).isFile())
//         .toEqual(true, 'merged-output.json file exists');
//     expect(statSync(`${join(REPORT_PATH, 'enriched-output.json')}`).isFile())
//         .toEqual(true, 'temp-output.json file exists');
// });

// test('Create a report from the merged found json files with custom metadata', () => {
//     multiCucumberHTMLReporter.generate({
//         jsonDir: './test/unit/data/custom-metadata-json/',
//         reportPath: REPORT_PATH,
//         customMetadata: true
//     });
//
//     expect(statSync(`${join(REPORT_PATH, 'index.html')}`).isFile())
//         .toEqual(true, 'Index file exists');
// });

// test('Create a report from the merged found json files and with array of embedded items', () => {
//     multiCucumberHTMLReporter.generate({
//         jsonDir: './test/unit/data/embedded-array-json/',
//         reportName: 'Embedded array of various mimeType',
//         reportPath: REPORT_PATH,
//         customStyle: join(__dirname, '../my.css'),
//         customMetadata: false
//     });
//
//     expect(statSync(`${join(REPORT_PATH, 'index.html')}`).isFile())
//         .toEqual(true, 'Index file exists');
// });

test('should throw an error when no options are provided', () => {
    expect(() => multiCucumberHTMLReporter.generate())
        .toThrowError('Options need to be provided.');
});

test('should throw an error when the json folder does not exist', () => {
    expect(() => multiCucumberHTMLReporter.generate({}))
        .toThrowError(`A path which holds the JSON files should be provided.`);
});

test('should throw an error when the report folder is not provided', () => {
    expect(() => multiCucumberHTMLReporter.generate({
        jsonDir: './test/unit/data/generate-report'
    })).toThrowError(`An output path for the reports should be defined, no path was provided.`);
});
