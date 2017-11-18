
const formatJson = (options,jsonJoined,featureList) => {
    var jsonReport = addAnAdditionalScenarioForEachScenarioOutline(jsonJoined, featureList);
    jsonReport = addExamplesTablesAndChangeScenarioNameAndStepsTextOfFirstScenarioOutlineOfBlock(jsonJoined,featureList);

    return jsonReport;
}

/**
 * Add additional scenario to the json for each scenario outline with id ending in 1
 * to find the unique scenarios it will search for id ending with ";;2"
 * @param {options} entry options
 * @return {array} array with the list of jsons
 * @private
 */
const addAnAdditionalScenarioForEachScenarioOutline = (jsonJoined, featureList) =>{
    
    jsonJoined.forEach(feature => {

        var scenarios = feature.elements;
        var scenariosTemp = [];

        if(scenarios != null){
            scenarios.forEach(function(scenario) {
                var id = (String)(scenario.id);
                
                if (id.substring(id.length - 3,id.length) === ";;2"){
                    var scenario1 = JSON.parse(JSON.stringify(scenario));
                    scenario1.id = id.substring(0,id.length - 3) + ";;1";
                    scenario1.name = "test";

                    scenario1.steps.forEach(function(step, index) {
                        step.output = "";
                        step.text = "";
                        step.result = "";                      
                    });

                    scenariosTemp.push(scenario1);
                }
                scenariosTemp.push(scenario);
            });
        }
        feature.elements = scenariosTemp;
    });

    return jsonJoined;
}

/**
 * Add the examples tables to the joined json, and modify the name and steps of the first scenario outline to be equal to the ones of the 
 * feature file
 * @param {jsonToBeAdded} json that will be added to the new examples element
 * @param {value} id of the element of the array that is going to be searched without the last two digits
 * @return {jsonJoined} json with all the data
 * @private
 */
const addExamplesTablesAndChangeScenarioNameAndStepsTextOfFirstScenarioOutlineOfBlock = (jsonReport,featureList) => {

    var features = jsonReport.map(featureJson =>{
            featureList.forEach(featureFromFolder =>{
                    featureFromFolderName = featureFromFolder.feature.name;
                    featureJsonName = featureJson.name;
                    if(featureFromFolderName == featureJsonName && featureJson.elements){
                        featureJson.elements = featureJson.elements.map(scenarioJson => {
                                featureFromFolder.feature.children.forEach(scenarioFromFolder =>{
                                    var scenarioFromFolderName = scenarioFromFolder.name;
                                    var scenarioJsonName = JSON.parse('"' + scenarioJson.name + '"');                                
                                    var scenarioFromFolderId = scenarioFromFolder.id;
                                    var scenarioJsonId = scenarioJson.id;

                                    if((String)(scenarioFromFolderId) === (String)(scenarioJsonId.substring(0,scenarioFromFolderId.length)) 
                                        && scenarioJsonId.substring(scenarioJsonId.length - 3,scenarioJsonId.length) === ";;1" 
                                        && scenarioJson.keyword ==="Scenario Outline"){
                                            scenarioJson.examples = scenarioFromFolder.examplesForReport;
                                            scenarioJson.name = escapeHTML(scenarioFromFolderName);
                                            scenarioFromFolder.steps.forEach(stepScenarioFolder =>{
                                                scenarioJson.steps.forEach(stepScenarioJson =>{
                                                        if (stepScenarioJson.line == stepScenarioFolder.location.line)
                                                            stepScenarioJson.name = escapeHTML(stepScenarioFolder.text);
                                                    }
                                                )
                                            })
                                    }
                                });
                            return scenarioJson;
                        });
                    }
            });
            return featureJson;
        });

        return jsonReport;
}

const escapeHTML = (value) =>{
    return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

module.exports = {formatJson};