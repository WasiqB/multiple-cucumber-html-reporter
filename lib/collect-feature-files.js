/**
 * Get data from the feature files
 * @param {featuresFolder} string with the features that are going to be parsed
 * @param {jsonJoined} object with all the scenarios
 * @return {array} array with the list of jsons
 * @private
 */
const getFeatures = (featureFiles) => {
    var Gherkin = require('gherkin');
    var parser = new Gherkin.Parser();
    var fs = require("fs");
    var fileList = getFeatureFiles(featureFiles,fileList);
    var featureList = fileList.map(file => {
        var text = fs.readFileSync(file,{ encoding: 'utf8' });
        var gherkinDocument = parser.parse(text);
        return gherkinDocument;
    });

    featureList = addIdToFeatureScenarios(featureList);
    featureList = addExamplesTablesToScenarioVariable(featureList);

    return featureList;
}

/**
 * Get the list of all feature files in an array object
 * @param {string}  dir the folder that is going to be parsed
 * @param {array} fileList that will hold the list of all the feature objects
 * @return {array} fileList with the list of all the feature objects
 * @private
 */
const getFeatureFiles = (dir, fileList) =>{
    var fs = require("fs");
    fileList = fileList || [];
 
    var files = fs.readdirSync(dir);
    for(var i in files){
        if (!files.hasOwnProperty(i)) continue;
        var name = dir+'/'+files[i];
        if (fs.statSync(name).isDirectory()){
            getFeatureFiles(name, fileList);
        } else if(name.endsWith(".feature")){
            fileList.push(name);
        }
    }
    return fileList;
}

/**
 * Generate the id that is generated in the json file
 * @param {string}featureName: name of the feature
 * @param {string} scenarioName: name of the scenario
 * @return {string} id value
 * @private
 */
const generateJsonIdFromFeatureNameAndFileName = (featureName,scenarioName) => {
    var featureName = featureName.replace(/\s/g, '-').replace(/_/g,'-').toLowerCase();
    var scenarioName = scenarioName.replace(/\s/g, '-').replace(/_/g,'-').toLowerCase();
    var id = featureName + ";" + scenarioName;
    return id;
}

/**
 * Add the field id to all the scenarios of the object generated from parsing the feature files folder
 * @param {object} featureList: object with the list of features
 * @return {object} featureList: object with the list of features
 * @private
 */
const addIdToFeatureScenarios = (featureList) => {
    featureList.forEach(feature => {
        var featureName = feature.feature.name;
        feature.feature.children.forEach(scenario => {
            var scenarioName = scenario.name;
            scenario.id = generateJsonIdFromFeatureNameAndFileName(featureName, scenarioName);
        });
    });

    return featureList;
}

/**
 * Add the examples table to each scenario online
 * @param {object} featureList: object with the list of features
 * @return {object} featureList: object with the list of features
 * @private
 */
const addExamplesTablesToScenarioVariable = (featureList, featureIndex) => {
    var features = featureList.map(feature =>{
        feature.feature.children = feature.feature.children.map(scenario => {
            if(scenario.examples){
                var examples = scenario.examples[0];
                var examplesHeaderCells = examples.tableHeader.cells.map(cell => cell.value);
                var examplesRows = examples.tableBody.map(row => 
                    {
                        var rowContent = [];
                        row.cells.forEach(cell =>
                        {
                            rowContent.push(cell.value);
                        });
                        return rowContent;
                    });
                var rows = [];
                rows.push(examplesHeaderCells);
                rows = rows.concat(examplesRows);  
                scenario.examplesForReport = rows;
            }
            return scenario;
        });
        return feature;
    });

    return features;
}

module.exports = {getFeatures};