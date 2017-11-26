const uuid = require('uuid/v4');
const RESULT_STATUS = {
    passed: 'passed',
    failed: 'failed',
    skipped: 'skipped',
    pending: 'pending',
    undefined: 'undefined',
    ambiguous: 'ambiguous'
};

const _parseFeatures = (suite) => {
    suite.features.forEach(feature => {
        feature.scenarios = {
            passed: 0,
            failed: 0,
            notdefined: 0,
            skipped: 0,
            pending: 0,
            ambiguous: 0,
            passedPercentage: 0,
            failedPercentage: 0,
            notdefinedPercentage: 0,
            skippedPercentage: 0,
            pendingPercentage: 0,
            ambiguousPercentage: 0,
            total: 0
        };
        feature.time = 0;
        feature.isFailed = false;
        feature.isAmbiguous = false;
        suite.featureCount.total++;
        feature.id = `${uuid()}.${feature.id}`.replace(/[^a-zA-Z0-9-_]/g, '-');

        if (!feature.elements) {
            return;
        }

        feature = _parseScenarios(feature, suite);
        feature = parseScenariosOutline(feature, suite);

        if (feature.isFailed) {
            suite.featureCount.failed++;
            feature.failed++;
        } else if (feature.isAmbiguous) {
            suite.featureCount.ambiguous++;
            feature.ambiguous++;
        } else {
            feature.passed++;
            suite.featureCount.passed++;
        }

        if (feature.time) {
            feature.totalTime += feature.time
        }

        // Percentages
        feature.scenarios.ambiguousPercentage = _calculatePercentage(feature.scenarios.ambiguous, feature.scenarios.total);
        feature.scenarios.failedPercentage = _calculatePercentage(feature.scenarios.failed, feature.scenarios.total);
        feature.scenarios.notdefinedPercentage = _calculatePercentage(feature.scenarios.notdefined, feature.scenarios.total);
        feature.scenarios.passedPercentage = _calculatePercentage(feature.scenarios.passed, feature.scenarios.total);
        feature.scenarios.pendingPercentage = _calculatePercentage(feature.scenarios.pending, feature.scenarios.total);
        feature.scenarios.skippedPercentage = _calculatePercentage(feature.scenarios.skipped, feature.scenarios.total);
        suite.scenarios.ambiguousPercentage = _calculatePercentage(suite.scenarios.ambiguous, suite.scenarios.total);
        suite.scenarios.failedPercentage = _calculatePercentage(suite.scenarios.failed, suite.scenarios.total);
        suite.scenarios.notdefinedPercentage = _calculatePercentage(suite.scenarios.notdefined, suite.scenarios.total);
        suite.scenarios.passedPercentage = _calculatePercentage(suite.scenarios.passed, suite.scenarios.total);
        suite.scenarios.pendingPercentage = _calculatePercentage(suite.scenarios.pending, suite.scenarios.total);
        suite.scenarios.skippedPercentage = _calculatePercentage(suite.scenarios.skipped, suite.scenarios.total);
    });

    return suite;
}

/**
 * Calculate and return the percentage
 * @param {number} amount
 * @param {number} total
 * @return {string} percentage
 * @private
 */
const _calculatePercentage = (amount, total) => {
    return ((amount / total) * 100).toFixed(2);
}

/**
 * Parse each scenario outline within a feature to update stadistics of first scenario outline, that will store the summary.
 * The scenarios outline must be on descending order
 * @param {object} feature a feature with all the scenario's in it
 * @return {object} return the parsed feature
 * @private
 */
const parseScenariosOutline = (feature) =>{
    var scenarioOutlineFirstElementId= "";
    var scenarioOutlineFirstElementIndex = 0;

    var currentScenarioIndex = 0;
    while(currentScenarioIndex < feature.elements.length - 1) {

        if (feature.elements[currentScenarioIndex].keyword == "Scenario Outline"){
            var scenario = feature.elements[currentScenarioIndex];
            var scenarioId = (String) (feature.elements[currentScenarioIndex].id);

            if (scenarioOutlineFirstElementId.substring(0, scenarioId.length - 3) != scenarioId.substring(0, scenarioId.length - 3) ){     
                scenarioOutlineFirstElementId = "";
            }

            if (scenarioId.substring(scenarioId.length - 3, scenarioId.length) === ";;1"){
                // Go through the rest of the scenarios of the scenario outline checking that they have the same id but with different number
                feature.elements[currentScenarioIndex].passed = 0;
                feature.elements[currentScenarioIndex].failed = 0;
                feature.elements[currentScenarioIndex].notdefined = 0;
                feature.elements[currentScenarioIndex].skipped = 0;
                feature.elements[currentScenarioIndex].pending = 0;
                feature.elements[currentScenarioIndex].ambiguous = 0;

                scenarioOutlineFirstElementId = scenarioId;
                scenarioOutlineFirstElementIndex = currentScenarioIndex;
            }

            if(scenarioOutlineFirstElementId != ""){
                if (feature.elements[currentScenarioIndex].failed > 0) {
                    feature.elements[scenarioOutlineFirstElementIndex].failed = feature.elements[scenarioOutlineFirstElementIndex].failed +
                    feature.elements[currentScenarioIndex].failed;
                }

                if (feature.elements[currentScenarioIndex].ambiguous > 0) {
                    feature.elements[scenarioOutlineFirstElementIndex].ambiguous = feature.elements[scenarioOutlineFirstElementIndex].ambiguous + 
                    feature.elements[scenarioOutlineFirstElementIndex].ambiguous;
                }

                if (feature.elements[currentScenarioIndex].notdefined > 0) {
                    feature.elements[scenarioOutlineFirstElementIndex].notdefined = feature.elements[scenarioOutlineFirstElementIndex].notdefined +
                    feature.elements[currentScenarioIndex].notdefined;
                }

                if (feature.elements[currentScenarioIndex].pending > 0) {
                    feature.elements[scenarioOutlineFirstElementIndex].pending = feature.elements[scenarioOutlineFirstElementIndex].pending + 
                    feature.elements[currentScenarioIndex].pending;
                }

                if (feature.elements[currentScenarioIndex].skipped > 0) {
                    feature.elements[scenarioOutlineFirstElementIndex].skipped = feature.elements[scenarioOutlineFirstElementIndex].skipped +
                    feature.elements[currentScenarioIndex].skipped;
                }

                if (feature.elements[currentScenarioIndex].passed > 0) {
                    feature.elements[scenarioOutlineFirstElementIndex].passed = feature.elements[scenarioOutlineFirstElementIndex].passed +
                    feature.elements[currentScenarioIndex].passed;
                }
            }    
        }

        currentScenarioIndex = currentScenarioIndex + 1;
    }

    return feature;
}

/**
 * Parse each scenario within a feature
 * @param {object} feature a feature with all the scenarios in it
 * @return {object} return the parsed feature
 * @private
 */
const _parseScenarios = (feature, suite) =>{
    feature.elements.forEach(scenario => {
        scenario.passed = 0;
        scenario.failed = 0;
        scenario.notdefined = 0;
        scenario.skipped = 0;
        scenario.pending = 0;
        scenario.ambiguous = 0;
        scenario.time = 0;

        scenario = _parseSteps(scenario);

        if (scenario.time > 0) {
            feature.time += scenario.time;
            scenario.time = _convertTimeFromNanoSecondsToHHMMSS(scenario.time);
        }

        if (scenario.failed > 0) {
            suite.scenarios.total++;
            suite.scenarios.failed++;
            feature.scenarios.total++;
            feature.isFailed = true;
            return feature.scenarios.failed++;
        }

        if (scenario.ambiguous > 0) {
            suite.scenarios.total++;
            suite.scenarios.ambiguous++;
            feature.scenarios.total++;
            feature.isAmbiguous = true;
            return feature.scenarios.ambiguous++;
        }

        if (scenario.notdefined > 0) {
            suite.scenarios.total++;
            suite.scenarios.notdefined++;
            feature.scenarios.total++;
            return feature.scenarios.notdefined++;
        }

        if (scenario.pending > 0) {
            suite.scenarios.total++;
            suite.scenarios.pending++;
            feature.scenarios.total++;
            return feature.scenarios.pending++;
        }

        if (scenario.skipped > 0) {
            suite.scenarios.total++;
            suite.scenarios.skipped++;
            feature.scenarios.total++;
            return feature.scenarios.skipped++;
        }

        /* istanbul ignore else */
        if (scenario.passed > 0) {
            suite.scenarios.total++;
            suite.scenarios.passed++;
            feature.scenarios.total++;
            return feature.scenarios.passed++;
        }
    });
    
    feature.time = _convertTimeFromNanoSecondsToHHMMSS(feature.time);
    return feature;
}

/**
 * Parse all the scenario steps and enrich them with the correct data
 * @param {object} scenario Preparsed scenario
 * @return {object} A parsed scenario
 * @private
 */
const _parseSteps = (scenario) =>{
    scenario.steps.forEach(step => {
        if (step.embeddings !== undefined) {
            const Base64 = require('js-base64').Base64;

            step.embeddings.forEach((embedding, embeddingIndex) => {
                /* istanbul ignore else */
                if (embedding.mime_type === 'text/plain' || (embedding.media && embedding.media.type === 'text/plain')) {
                    if (!step.text) {
                        try {
                            step.text = JSON.parse(embedding.data)
                        } catch (error) {
                            step.text = _isBase64(embedding.data) ? Base64.decode(embedding.data) : embedding.data;
                        }
                    } else {
                        step.text = step.text.concat(`<br>  ${_isBase64(embedding.data) ? Base64.decode(embedding.data) : embedding.data}`);
                    }
                } else if (embedding.mime_type === 'image/png' || (embedding.media && embedding.media.type === 'image/png')) {
                    step.image = 'data:image/png;base64,' + embedding.data;
                    step.embeddings[embeddingIndex] = {};
                }
            });
        }

        if (step.rows !== undefined) {
            step.text = `<table>`;                
            step.rows.forEach((row, rowIndex) => {                
                step.text = step.text + `<tr\>`;
                row.cells.forEach((cell, cellIndex) => {
                    step.text = step.text + `<td>` + cell + `</td>`;
                });
                step.text = step.text + `</tr>`;
            });
            step.text = step.text + `</table>`;
        }

        if (!step.result || (step.hidden && !step.text && !step.image)) {
            return 0;
        }

        if (step.result.duration) {
            scenario.time += step.result.duration;
            step.result.duration = _convertTimeFromNanoSecondsToHHMMSS(step.result.duration);
        }

        if (step.result.status === RESULT_STATUS.passed) {
            return scenario.passed++;
        }

        if (step.result.status === RESULT_STATUS.failed) {
            return scenario.failed++;
        }

        if (step.result.status === RESULT_STATUS.undefined) {
            return scenario.notdefined++;
        }

        if (step.result.status === RESULT_STATUS.pending) {
            return scenario.pending++;
        }

        if (step.result.status === RESULT_STATUS.ambiguous) {
            return scenario.ambiguous++;
        }

        scenario.skipped++;
    });

    return scenario;
}

/**
 * transform the time from seconds to HH:MM:ss
 * @param time time that is going to be converted
 * @private
 */
const _convertTimeFromNanoSecondsToHHMMSS = (time) =>{
    
            var date = new Date(null);
            date.setSeconds(Math.floor(time/1000000000)); // specify value for SECONDS here
            var result = date.toISOString().substr(11, 8);
            return result;
}

/**
 * Check if the string a base64 string
 * @param string
 * @return {boolean}
 * @private
 */
const _isBase64 =(string) =>{
    const notBase64 = /[^A-Z0-9+\/=]/i;
    const stringLength = string.length;

    if (!stringLength || stringLength % 4 !== 0 || notBase64.test(string)) {
        return false;
    }

    const firstPaddingChar = string.indexOf('=');

    return firstPaddingChar === -1 ||
        firstPaddingChar === stringLength - 1 ||
        (firstPaddingChar === stringLength - 2 && string[stringLength - 1] === '=');
}

const formatSuiteObject = (suite) =>{
    var suite = _parseFeatures(suite);

    // Percentages
    suite.featureCount.ambiguousPercentage = _calculatePercentage(suite.featureCount.ambiguous, suite.featureCount.total);
    suite.featureCount.failedPercentage = _calculatePercentage(suite.featureCount.failed, suite.featureCount.total);
    suite.featureCount.passedPercentage = _calculatePercentage(suite.featureCount.passed, suite.featureCount.total);

    return suite;
}

module.exports = {formatSuiteObject};