const {readJsonSync} = require('fs-extra');
const {resolve} = require('path');
const chalk = require('chalk');
const collectJSONS = require('../../lib/collect-jsons');
const reportPath = resolve(process.cwd(), './.tmp/test');

test('Return an output from the merged found json files', () => {
    expect(collectJSONS({
        jsonDir: './test/unit/data/collect-jsons',
        reportPath: reportPath
    })).toMatchSnapshot();
});

test('Save an output from the merged found JSON files', () => {
    expect(collectJSONS({
        jsonDir: './test/unit/data/collect-jsons',
        reportPath: reportPath,
        saveCollectedJSON: true
    })).toEqual(readJsonSync(resolve(process.cwd(), reportPath, 'merged-output.json')));
});

test('Return an output from the merged found json files and add the provided metadata', () => {
    expect(collectJSONS({
        jsonDir: './test/unit/data/no-metadata',
        reportPath: reportPath,
        metadata: {
            browser: {
                name: 'chrome',
                version: '1'
            },
            device: 'Local test machine',
            platform: {
                name: 'Ubuntu',
                version: '16.04'
            }
        }
    })).toMatchSnapshot();
});

test('Collect the creation date of json files', () => {
    const options = {
        jsonDir: './test/unit/data/json',
        reportPath: reportPath,
        displayReportTime: true
    };

    collectJSONS(options).forEach(json => {
        expect(json.metadata.reportTime).toBeDefined();
        expect(json.metadata.reportTime.length).toBe('YYYY/MM/DD HH:mm:ss'.length);
    });
});

test('Throw an error when the json folder does not exist', () => {
    expect(() => collectJSONS({
        jsonDir: './test/unit/data/bla',
        reportPath: reportPath
    })).toThrow(new Error(`There were issues reading JSON-files from './test/unit/data/bla'.`));
});

test('Print a console message when no json files could be found', () => {
    jest.spyOn(global.console, 'log');
    collectJSONS({
        jsonDir: './test/unit/data/no-jsons',
        reportPath: reportPath
    });

    expect(console.log).toHaveBeenCalledWith(
        chalk.yellow(`WARNING: No JSON files found in './test/unit/data/no-jsons'. NO REPORT CAN BE CREATED!`)
    );
});

test('Return an empty array when no json files could be found', () => {
    expect(collectJSONS({
        jsonDir: './test/unit/data/no-jsons',
        reportPath: reportPath
    })).toMatchSnapshot();
});
