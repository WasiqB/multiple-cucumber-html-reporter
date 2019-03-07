'use strict';
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const IMAGE_SUMMARY_TEMPLATE = 'components/result-preview.tmpl';

/**
 * Read a template file and return it's content
 * @param {string} fileName
 * @return {*} Content of the file
 * @private
 */
function _readTemplateFile(fileName) {
    return fs.readFileSync(path.join(__dirname, '..', 'templates', fileName), 'utf-8');
}

/**
 * Generate result summary image
 * @param {object} suite JSON object with all the features and scenarios
 * @return {string} svg image
 */
function generateSummaryImage(suite){
    function roundToTwo(num) {
        return +(Math.round(Number(num)  + "e+2")  + "e-2");
    }
    let accumulator = roundToTwo(suite.featureCount.skippedPercentage || 0);
    function getNextValue(val) {
        const fill1 = 0;
        const skip1 = accumulator;
        const fill2 = roundToTwo(val || 0);
        const skip2 = roundToTwo(100 - fill1 - skip1 - fill2);
        accumulator = roundToTwo(accumulator + fill2);
        return  `${fill1} ${skip1} ${fill2} ${skip2}`;
    }

    return _.template(_readTemplateFile(IMAGE_SUMMARY_TEMPLATE))({
        skippedDasharray: `${accumulator} ${100 - accumulator} 0 0`,
        passedDasharray: getNextValue(suite.featureCount.passedPercentage),
        notDefinedDasharray:  getNextValue(suite.featureCount.notdefinedPercentage),
        pendingDasharray: getNextValue(suite.featureCount.pendingPercentage),
        ambiguousDasharray: getNextValue(suite.featureCount.ambiguousPercentage),
    });
}

module.exports = {
    generate: generateSummaryImage
};
