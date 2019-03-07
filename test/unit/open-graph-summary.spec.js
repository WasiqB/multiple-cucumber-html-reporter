'use strict';

const fs = require('fs-extra');
const path = require('path');
const openGraph = require('../../lib/open-graph-image');
const REPORT_PATH = './.tmp/';

describe('open-graph-image.js', () => {
    it('should generate svg for mixed result', () => {

        const suite = {
            featureCount: {
                failededPercentage: 20,
                skippedPercentage: 20,
                passedPercentage: 60,
                pendingPercentage:0,
                notdefinedPercentage: 0,
                ambiguousPercentage: 0,
            }
        };
        const expectedResult = fs.readFileSync(path.resolve('test/unit/data/image-summary/result-preview.svg'), 'utf-8');
        const result = openGraph.generate(suite);
        expect(result).toEqual(expectedResult);
    });
    it('should generate svg for all passed result', () => {

        const suite = {
            featureCount: {
                failededPercentage: 0,
                skippedPercentage: 0,
                passedPercentage: 100,
                pendingPercentage:0,
                notdefinedPercentage: 0,
                ambiguousPercentage: 0,
            }
        };
        const expectedResult = fs.readFileSync(path.resolve('test/unit/data/image-summary/result-preview-passed.svg'), 'utf-8');
        const result = openGraph.generate(suite);
        expect(result).toEqual(expectedResult);
    });
    it('should generate svg for all failed result', () => {

        const suite = {
            featureCount: {
                failededPercentage: 100,
                skippedPercentage: 0,
                passedPercentage: 0,
                pendingPercentage:0,
                notdefinedPercentage: 0,
                ambiguousPercentage: 0,
            }
        };
        const expectedResult = fs.readFileSync(path.resolve('test/unit/data/image-summary/result-preview-failed.svg'), 'utf-8');
        const result = openGraph.generate(suite);
        expect(result).toEqual(expectedResult);
    });

    it('should generate svg for all results', () => {

        const suite = {
            featureCount: {
                failededPercentage: 15,
                skippedPercentage: 15,
                passedPercentage: 40,
                pendingPercentage:10.5,
                notdefinedPercentage: 9.5,
                ambiguousPercentage: 10,
            }
        };
        const expectedResult = fs.readFileSync(path.resolve('test/unit/data/image-summary/result-preview-all.svg'), 'utf-8');
        const result = openGraph.generate(suite);
        expect(result).toEqual(expectedResult);
    });
    it('should generate svg for passed failed results', () => {

        const suite = {
            featureCount: {
                failededPercentage: 9.01,
                skippedPercentage: 0,
                passedPercentage: 90.91,
                pendingPercentage: 0,
                notdefinedPercentage: 0,
            }
        };
        const expectedResult = fs.readFileSync(path.resolve('test/unit/data/image-summary/result-preview-passed-failed.svg'), 'utf-8');
        const result = openGraph.generate(suite);
        expect(result).toEqual(expectedResult);
    });
});