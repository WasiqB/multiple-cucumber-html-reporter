const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const Utils = require('../../lib/utils');
const ParseCucumberData = require('../../lib/parse.cucumber.data');
const collectJSONS = require('../../lib/collect-jsons');

jest.mock('fs-extra');
jest.mock('path');
jest.mock('../../lib/utils');
jest.mock('../../lib/parse.cucumber.data');

let findJsonFilesSpy, formatToLocalIsoSpy, parseFeatureHooksSpy, parseMetadataSpy, readFileSyncSpy, statSyncSpy;
let mockData = [{foo: 'bar'}, {bar: 'foo'}];

beforeEach(() => {
    findJsonFilesSpy = Utils.findJsonFiles
        .mockReturnValue(['1.json', '2.json']);
    formatToLocalIsoSpy = Utils.formatToLocalIso
        .mockReturnValueOnce('2020/02/17 01:23:34')
        .mockReturnValueOnce('2020/02/17 12:34:56');
    readFileSyncSpy = fs.readFileSync
        .mockReturnValueOnce(JSON.stringify(mockData[0]))
        .mockReturnValueOnce(JSON.stringify(mockData[1]));
    parseMetadataSpy = ParseCucumberData.parseMetadata
        .mockReturnValueOnce(mockData[0])
        .mockReturnValueOnce(mockData[1]);
    statSyncSpy = fs.statSync
        .mockReturnValue({});
});

afterEach(() => jest.resetAllMocks());

test('Return an output from the merged found json files', () => {
    expect(collectJSONS({jsonDir: 'foo'})).toMatchSnapshot();
    expect(findJsonFilesSpy).toHaveBeenCalledTimes(1);
    expect(readFileSyncSpy).toHaveBeenCalledTimes(2);
    expect(statSyncSpy).toHaveBeenCalledTimes(2);
    expect(formatToLocalIsoSpy).toHaveBeenCalledTimes(2);
    expect(parseMetadataSpy).toHaveBeenCalledTimes(2);
});

test('Save an output from the merged found JSON files', () => {
    const resolveMock = '/resolveMock';
    const reportPath = './.tmp/test';
    const resolveSpy = path.resolve.mockReturnValueOnce(resolveMock);
    const ensureDirSyncSpy = fs.ensureDirSync;
    const writeJsonSyncSpy = fs.writeJsonSync;

    collectJSONS({
        jsonDir: 'foo',
        reportPath: reportPath,
        saveCollectedJSON: true
    });

    expect(resolveSpy).toHaveBeenCalledWith(reportPath, 'merged-output.json');
    expect(ensureDirSyncSpy).toHaveBeenCalledWith(reportPath);
    expect(writeJsonSyncSpy).toHaveBeenCalledWith(resolveMock, mockData, {spaces: 2});

});

test('Empty file data should become an empty array', () => {
    fs.readFileSync
        .mockReset()
        .mockReturnValueOnce('')
        .mockReturnValueOnce('');

    expect(collectJSONS({jsonDir: 'foo'})).toMatchSnapshot();
});

test('Empty or corrupt file data should be logged', () => {
    fs.readFileSync
        .mockReset()
        .mockReturnValueOnce('')
        .mockReturnValueOnce('');
    jest.spyOn(global.console, 'log');

    collectJSONS({jsonDir: 'foo'});

    expect(console.log).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenCalledWith(
        chalk.yellow(`WARNING: File: '1.json' had no valid JSON data due to error:'SyntaxError: Unexpected end of JSON input'. CONTENT WAS NOT LOADED!`)
    );
    expect(console.log).toHaveBeenCalledWith(
        chalk.yellow(`WARNING: File: '2.json' had no valid JSON data due to error:'SyntaxError: Unexpected end of JSON input'. CONTENT WAS NOT LOADED!`)
    );
});

test('Collect the creation date of json files', () => {
    ParseCucumberData.parseMetadata
        .mockReset()
        .mockReturnValueOnce({foo: 'foo', metadata: {'foo-bar': true}})
        .mockReturnValueOnce({bar: 'bar', metadata: {'foo-bar': false}});

    expect(collectJSONS({
        displayReportTime: true,
        jsonDir: 'foo',
    })).toMatchSnapshot();
});

test('Parse the elements without before and after elements as scenarios in the feature', () => {
    mockData = [{
        description: '',
        elements: [
            {foo: 'foo'},
        ],
        keyword: 'Feature',
        line: 1,
        name: 'With one elements',
        tags: [],
        type: 'feature',
        uri: 'Can not be determined',
    }, {
        description: '',
        elements: [
            {fooFoo: 'foo-foo'},
            {bar: 'bar'},
        ],
        keyword: 'Feature',
        line: 1,
        name: 'With two elements',
        tags: [],
        type: 'feature',
        uri: 'Can not be determined',
    },];
    fs.readFileSync
        .mockReset()
        .mockReturnValueOnce(JSON.stringify(mockData[0]))
        .mockReturnValueOnce(JSON.stringify(mockData[1]));
    ParseCucumberData.parseMetadata
        .mockReset()
        .mockReturnValueOnce(mockData[0])
        .mockReturnValueOnce(mockData[1]);
    parseFeatureHooksSpy = ParseCucumberData.parseFeatureHooks;

    expect(collectJSONS({
        jsonDir: 'foo',
    })).toMatchSnapshot();
    expect(parseFeatureHooksSpy).toHaveBeenCalledTimes(0);
});

test('Parse the before feature hook and add it as the first scenario step', () => {
    mockData = [{
        elements: [
            {
                before: [
                    {beforeFoo: 'beforeFoo'}
                ],
                steps: [
                    {foo: 'foo'}
                ],
                type: 'scenario'
            },
            {
                steps: [
                    {fooFooBar: 'fooFooBar'}
                ],
                type: 'scenario'
            },
        ],
    }, {
        elements: [
            {
                type: 'scenario',
                steps: [
                    {bar: 'bar'}
                ]
            },
            {
                before: [
                    {beforeBar: 'beforeBar'}
                ],
                steps: [
                    {barBar: 'barBar'}
                ],
                type: 'scenario'
            },
        ],
    },];
    fs.readFileSync
        .mockReset()
        .mockReturnValueOnce(JSON.stringify(mockData[0]))
        .mockReturnValueOnce(JSON.stringify(mockData[1]));
    ParseCucumberData.parseMetadata
        .mockReset()
        .mockReturnValueOnce(mockData[0])
        .mockReturnValueOnce(mockData[1]);
    parseFeatureHooksSpy = ParseCucumberData.parseFeatureHooks
        .mockReset()
        .mockReturnValueOnce([{beforeFoo: 'beforeFoo'}])
        .mockReturnValueOnce([{beforeBar: 'beforeBar'}]);

    expect(collectJSONS({
        jsonDir: 'foo',
    })).toMatchSnapshot();
    expect(parseFeatureHooksSpy).toHaveBeenCalledTimes(2);
});

test('Parse the after feature hook and add it as the last scenario step', () => {
    mockData = [{
        elements: [
            {
                after: [
                    {afterFoo: 'afterFoo'}
                ],
                steps: [
                    {foo: 'foo'}
                ],
                type: 'scenario'
            },
            {
                steps: [
                    {fooFooBar: 'fooFooBar'}
                ],
                type: 'scenario'
            },
        ],
    }, {
        elements: [
            {
                type: 'scenario',
                steps: [
                    {bar: 'bar'}
                ]
            },
            {
                after: [
                    {afterBar: 'afterBar'}
                ],
                steps: [
                    {barBar: 'barBar'}
                ],
                type: 'scenario'
            },
        ],
    },];
    fs.readFileSync
        .mockReset()
        .mockReturnValueOnce(JSON.stringify(mockData[0]))
        .mockReturnValueOnce(JSON.stringify(mockData[1]));
    ParseCucumberData.parseMetadata
        .mockReset()
        .mockReturnValueOnce(mockData[0])
        .mockReturnValueOnce(mockData[1]);
    parseFeatureHooksSpy = ParseCucumberData.parseFeatureHooks
        .mockReset()
        .mockReturnValueOnce([{afterFoo: 'afterFoo'}])
        .mockReturnValueOnce([{afterBar: 'afterBar'}]);

    expect(collectJSONS({
        jsonDir: 'foo',
    })).toMatchSnapshot();
    expect(parseFeatureHooksSpy).toHaveBeenCalledTimes(2);
});

test('Print a console message when no json files could be found', () => {
    Utils.findJsonFiles.mockReturnValueOnce([])
    jest.spyOn(global.console, 'log');

    collectJSONS({jsonDir: 'foo'});

    expect(console.log).toHaveBeenCalledWith(
        chalk.yellow(`WARNING: No JSON files found in 'foo'. NO REPORT CAN BE CREATED!`)
    );
});

test('Return an empty array when no json files could be found', () => {
    Utils.findJsonFiles.mockReturnValueOnce([])

    expect(collectJSONS({jsonDir: 'foo'})).toMatchSnapshot();
});
