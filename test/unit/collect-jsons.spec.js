'use strict';

const jsonFile = require('jsonfile');
const path = require('path');
const collectJSONS = require('../../lib/collect-jsons');
const reportPath = path.resolve(process.cwd(), './.tmp/test');
const chalk = require('chalk');

describe('collect-jsons.js', () => {
    describe('Happy flows', () => {
        it('should return an output from the merged found json files', () => {
            expect(collectJSONS({
                jsonDir: './test/unit/data/json',
                reportPath: reportPath
            })).toEqual(jsonFile.readFileSync(path.resolve(process.cwd(), './test/unit/data/output/merged-output.json')));
        });

        it('should return an output from the merged found json files and add the provided metadata', () => {
            expect(collectJSONS({
                jsonDir: './test/unit/data/collect-json',
                reportPath: reportPath,
                metadata:{
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
            })).toEqual(jsonFile.readFileSync(path.resolve(process.cwd(), './test/unit/data/output/provided-metadata.json')));
        });

        it('should save an output from the merged found json files', () => {
            expect(collectJSONS({
                jsonDir: './test/unit/data/json',
                reportPath: reportPath,
                saveCollectedJSON: true
            })).toEqual(jsonFile.readFileSync(path.resolve(process.cwd(), './test/unit/data/output/merged-output.json')));
        });

        it('should collect the creation date of json files', () => {
            // Given 
            const options = {
                jsonDir: './test/unit/data/json',
                reportPath: reportPath,
                displayReportTime: true
            }

            // When
            const collectedJSONs = collectJSONS(options)

            // Then
            collectedJSONs.forEach(json => {
                expect(json.metadata.reportTime).toBeDefined();
                expect(json.metadata.reportTime.length).toBe('YYYY/MM/DD HH:mm:ss'.length);
            })
        });
    });

    describe('failures', () => {
        it('should throw an error when the json folder does not exist', () => {
            expect(() => collectJSONS({
                jsonDir: './test/unit/data/bla',
                reportPath: reportPath
            })).toThrow(new Error(`There were issues reading JSON-files from './test/unit/data/bla'.`));
        });

        it('should print a console message when no json files could be found', () => {
            spyOn(console, 'log');
            collectJSONS({
                jsonDir: './test/unit/data/no-jsons',
                reportPath: reportPath
            });
            expect(console.log).toHaveBeenCalledWith(chalk.yellow(`WARNING: No JSON files found in './test/unit/data/no-jsons'. NO REPORT CAN BE CREATED!`))
        });

        it('should return an empty array when no json files could be found', () => {
            const results = collectJSONS({
                jsonDir: './test/unit/data/no-jsons',
                reportPath: reportPath
            });
            expect(Array.isArray(results)).toBeTruthy();
            expect(results.length).toBe(0);
        });
    });
});
