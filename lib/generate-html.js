const FEATURES_OVERVIEW_INDEX_TEMPLATE = 'features-overview.index.tmpl';
const FEATURES_OVERVIEW_TEMPLATE = 'components/features-overview.tmpl';
const FEATURES_OVERVIEW_CHART_TEMPLATE = 'components/features-overview.chart.tmpl';
const SCENARIOS_OVERVIEW_CHART_TEMPLATE = 'components/scenarios-overview.chart.tmpl';
const FEATURE_OVERVIEW_INDEX_TEMPLATE = 'feature-overview.index.tmpl';
const FEATURE_METADATA_OVERVIEW_TEMPLATE = 'components/feature-metadata-overview.tmpl';
const SCENARIOS_TEMPLATE = 'components/scenarios.tmpl';
const SCENARIO_HEADER_BEGIN = 'components/scenario-header-begin.tmpl';
const SCENARIO_HEADER_END = 'components/scenario-header-end.tmpl';
const SCENARIO_STEPS = 'components/scenario-steps.tmpl';
const SCENARIO_TAGS = 'components/scenario-tags.tmpl';
const SCENARIO_NAME_AND_RESULTS = 'components/scenario-name-and-results.tmpl';
const SCENARIO_RESULTS = 'components/scenario-results.tmpl';
const SCENARIO_OUTLINE_TABLE_HEADER = 'components/scenario-outline-table-header.tmpl';
const SCENARIO_OUTLINE_TABLE_ROW_CELLS_BEGIN = 'components/scenario-outline-table-row-cells-begin.tmpl';
const SCENARIO_OUTLINE_TABLE_ROW_CELLS_END = 'components/scenario-outline-table-row-cells-end.tmpl';
const SCENARIO_OUTLINE_TABLE_ROW_END = 'components/scenario-outline-table-row-end.tmpl';
const SCENARIO_OUTLINE_TABLE_END = 'components/scenario-outline-table-end.tmpl';
const SCENARIO_END = 'components/scenario-end.tmpl';
const REPORT_STYLESHEET = 'style.css';
const GENERIC_JS = 'generic.js';
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');


/**
 * Generate the templates of the elements of the scenarios outline
 * @param {object} suite JSON object with all the features and scenarios
 * @private
 */
const generateFeatureScenariosElementsTemplate = (suite,options) =>{
    var featureElementsTemplates = new Map();
    suite.features.forEach(feature =>{
        var scenarioTemplates = new Map();
        var featureElementsLength = feature.elements ? feature.elements.length : 0;
        for(var scenarioIndex = 0; scenarioIndex < featureElementsLength; scenarioIndex++){    
            var scenario = feature.elements[scenarioIndex];
            var scenarioId = scenario.id;
            var scenarioElementsTemplates = new Map();

            var scenarioTags = _.template(_readTemplateFile(SCENARIO_TAGS))({
                scenario: scenario,
                scenarioIndex: scenarioIndex,
                options: options});
            scenarioElementsTemplates.set("scenarioTags",scenarioTags);
    
            var scenarioNameAndResults = _.template(_readTemplateFile(SCENARIO_NAME_AND_RESULTS))({
                scenario: scenario,
                scenarioIndex: scenarioIndex,
                options: options});
            scenarioElementsTemplates.set("scenarioNameAndResults",scenarioNameAndResults);
    
            var scenarioResults = _.template(_readTemplateFile(SCENARIO_RESULTS))({
                scenario: scenario,
                scenarioIndex: scenarioIndex,
                options: options});        
            scenarioElementsTemplates.set("scenarioResults",scenarioResults);

            var scenarioSteps = _.template(_readTemplateFile(SCENARIO_STEPS))({
                scenario: scenario,
                scenarioIndex: scenarioIndex,
                options: options});
            scenarioElementsTemplates.set("scenarioSteps",scenarioSteps);

            if(scenarioId.substring(scenarioId.length - 3, scenarioId.length) === ";;1"){
                var scenariosOutlineTableHeader = _.template(_readTemplateFile(SCENARIO_OUTLINE_TABLE_HEADER))({
                    scenario: scenario,
                    scenarioIndex: scenarioIndex});
                scenarioElementsTemplates.set("scenariosOutlineTableHeader",scenariosOutlineTableHeader);
                var rows = scenario.examples;

                var scenarioOutlineRows = [];    
                
                var rows = scenario.examples;
                // create array to store these two templates
                for( var j = 1; j < rows.length; j++ ) {
                    scenarioIndex = scenarioIndex + 1;
                    scenario = feature.elements[scenarioIndex];

                    var scenarioResults = _.template(_readTemplateFile(SCENARIO_RESULTS))({
                        scenario: scenario,
                        scenarioIndex: scenarioIndex,
                        options: options});   

                    var scenarioTags = _.template(_readTemplateFile(SCENARIO_TAGS))({
                        scenario: scenario,
                        scenarioIndex: scenarioIndex,
                        options: options});     

                    var scenarioNameAndResults = _.template(_readTemplateFile(SCENARIO_NAME_AND_RESULTS))({
                        scenario: scenario,
                        scenarioIndex: scenarioIndex,
                        options: options});
                    
                    var scenarioSteps = _.template(_readTemplateFile(SCENARIO_STEPS))({
                        scenario: scenario,
                        scenarioIndex: scenarioIndex,
                        options: options});

                    var scenarioOutlineElementsTemplates = new Map();
                    var scenarioOutlineTableRowCellEnd = _.template(_readTemplateFile(SCENARIO_OUTLINE_TABLE_ROW_CELLS_END))({
                        options:options,
                        scenario: scenario,
                        scenarioIndex: scenarioIndex});        

                    var scenarioOutlineTableRowCellBegin = _.template(_readTemplateFile(SCENARIO_OUTLINE_TABLE_ROW_CELLS_BEGIN))({
                        options: options,
                        scenario: scenario,
                        rows: rows,
                        rowIndex: j,
                        scenarioIndex: scenarioIndex});

                        scenarioOutlineElementsTemplates.set("scenarioOutlineTableRowCellEnd",scenarioOutlineTableRowCellEnd);
                        scenarioOutlineElementsTemplates.set("scenarioOutlineTableRowCellBegin",scenarioOutlineTableRowCellBegin);
                        scenarioOutlineElementsTemplates.set("scenarioTags",scenarioTags);
                        scenarioOutlineElementsTemplates.set("scenarioResults",scenarioResults);
                        scenarioOutlineElementsTemplates.set("scenarioNameAndResults",scenarioNameAndResults);
                        scenarioOutlineElementsTemplates.set("scenarioSteps",scenarioSteps);
                        scenarioOutlineRows.push(scenarioOutlineElementsTemplates);
                        
                }
                scenarioElementsTemplates.set("scenarioOutlineRows",scenarioOutlineRows); 
            } 
            scenarioTemplates.set(scenarioId,scenarioElementsTemplates); 
        }
        var featureId = feature.id;
        featureElementsTemplates.set(featureId, scenarioTemplates);
    })
    return featureElementsTemplates;
}

/**
 * Generate the templates of the scenarios outline
 * @param {object} suite JSON object with all the features and scenarios
 * @private
 */
const generateFeatureScenariosTemplate = (suite,options) =>{
    var featureTemplates = new Map();
    var featureElementsTemplates = generateFeatureScenariosElementsTemplate(suite,options);
    var scenarioHeaderBeginTemplate = _.template(_readTemplateFile(SCENARIO_HEADER_BEGIN))({});
    var scenarioHeaderEndTemplate = _.template(_readTemplateFile(SCENARIO_HEADER_END))({});
    var scenariosOutlineTableRowEnd = _.template(_readTemplateFile(SCENARIO_OUTLINE_TABLE_ROW_END))({});
    var scenariosOutlineTableRowData = _.template(_readTemplateFile(SCENARIO_OUTLINE_TABLE_END))({});
    var scenarioEnd = _.template(_readTemplateFile(SCENARIO_END))({});

    suite.features.forEach( function(feature, featureIndex){
        var scenarioTemplates = "";
        var featureElementsLength = feature.elements ? feature.elements.length : 0;

        for(var scenarioIndex = 0; scenarioIndex < featureElementsLength; scenarioIndex++){    
            var scenarioTemplate = "";
            var scenario = feature.elements[scenarioIndex];
            var scenarioId = scenario.id;
            var scenarioTags = featureElementsTemplates.get(feature.id).has(scenarioId) ? 
                                featureElementsTemplates.get(feature.id).get(scenarioId).get("scenarioTags") : "";
            var scenarioNameAndResults = featureElementsTemplates.get(feature.id).has(scenarioId) ?
                                    featureElementsTemplates.get(feature.id).get(scenarioId).get("scenarioNameAndResults") : "";
            var scenarioSteps = featureElementsTemplates.get(feature.id).has(scenarioId) ? 
                                    featureElementsTemplates.get(feature.id).get(scenarioId).get("scenarioSteps") : "";

            scenarioTemplate = scenarioTemplate + scenarioHeaderBeginTemplate + scenarioTags 
                                + scenarioNameAndResults + scenarioHeaderEndTemplate + scenarioSteps;   
            
            // paint the scenario outline templates
            if(featureElementsTemplates.get(feature.id).has(scenarioId)){
                if(featureElementsTemplates.get(feature.id).get(scenarioId).get("scenariosOutlineTableHeader")){    
                    var scenariosOutlineTableHeader = featureElementsTemplates.get(feature.id).get(scenarioId).get("scenariosOutlineTableHeader");
                    scenarioTemplate = scenarioTemplate + scenariosOutlineTableHeader;
                    
                    featureElementsTemplates.get(feature.id).get(scenarioId).get("scenarioOutlineRows").forEach(element => {
                        scenarioIndex = scenarioIndex + 1;
                        var scenarioOutlineTableRowCellBegin = element.get("scenarioOutlineTableRowCellBegin");
                        var scenarioResults = element.get("scenarioResults");
                        var scenarioOutlineTableRowCellEnd = element.get("scenarioOutlineTableRowCellEnd");
                        var scenarioTags = element.get("scenarioTags");
                        var scenarioNameAndResults = element.get("scenarioNameAndResults");
                        var scenarioSteps = element.get("scenarioSteps");
                        scenarioTemplate = scenarioTemplate + scenarioOutlineTableRowCellBegin + scenarioResults + scenarioOutlineTableRowCellEnd 
                        + scenarioTags + scenarioNameAndResults + scenarioHeaderEndTemplate + scenarioSteps + scenariosOutlineTableRowEnd;
                    })
                    scenarioTemplate = scenarioTemplate + scenariosOutlineTableRowData;        
                }
            }
            scenarioTemplates = scenarioTemplates + scenarioTemplate + scenarioEnd;
        }
        var featureId = feature.id;
        featureTemplates.set(featureId, scenarioTemplates);
    })
    return featureTemplates;
}

/**
 * Generate the features overview
 * @param {object} suite JSON object with all the features and scenarios
 * @private
 */
const _createFeaturesOverviewIndexPage = (reportPath, suite, options, INDEX_HTML) =>{
    const featuresOverviewIndex = path.resolve(reportPath, INDEX_HTML);

    fs.writeFileSync(
        featuresOverviewIndex,
        _.template(_readTemplateFile(FEATURES_OVERVIEW_INDEX_TEMPLATE))({
            suite: suite,
            disableMetadataIfnotPresent: options.disableMetadataIfnotPresent,
            featuresOverview: _.template(_readTemplateFile(FEATURES_OVERVIEW_TEMPLATE))({
                suite: suite, options: options,
                disableMetadataIfnotPresent: options.disableMetadataIfnotPresent,
                showExecutionTime: options.showExecutionTime,
                _: _
            }),
            featuresOverviewChart: _.template(_readTemplateFile(FEATURES_OVERVIEW_CHART_TEMPLATE))({
                suite: suite,
                _: _
            }),
            featuresScenariosOverviewChart: _.template(_readTemplateFile(SCENARIOS_OVERVIEW_CHART_TEMPLATE))({
                scenarios: suite.scenarios,
                _: _
            }),
            styles: _readTemplateFile(REPORT_STYLESHEET),
            genericScript: _readTemplateFile(GENERIC_JS)
        })
    );
}

/**
 * Generate the feature pages
 * @param suite suite JSON object with all the features and scenarios
 * @private
 */
const _createFeatureIndexPages = (reportPath, suite, options, FEATURE_FOLDER) =>{
    const featureScenariosTemplate = generateFeatureScenariosTemplate(suite, options);
    suite.features.forEach(feature => {
        const featurePage = path.resolve(reportPath, `${FEATURE_FOLDER}/${feature.id}.html`);
        fs.writeFileSync(
            featurePage,
            _.template(_readTemplateFile(FEATURE_OVERVIEW_INDEX_TEMPLATE))({
                feature: feature,
                disableMetadataIfnotPresent: options.disableMetadataIfnotPresent,
                featureScenariosOverviewChart: _.template(_readTemplateFile(SCENARIOS_OVERVIEW_CHART_TEMPLATE))({
                    scenarios: feature.scenarios,
                    _: _
                }),
                featureMetadataOverview: _.template(_readTemplateFile(FEATURE_METADATA_OVERVIEW_TEMPLATE))({
                    feature,
                    metadata: feature.metadata,
                    _: _
                }),
                scenarioTemplate: _.template(_readTemplateFile(SCENARIOS_TEMPLATE))({
                    scenarios: feature.elements,
                    _: _
                }),
                scenarioOutlineTemplate: featureScenariosTemplate,
                styles: _readTemplateFile(REPORT_STYLESHEET),
                options: options,
                genericScript: _readTemplateFile(GENERIC_JS)
            })
        );
    });
}

/**
 * Read a template file and return it's content
 * @param {string} fileName
 * @return {*} Content of the file
 * @private
 */
const _readTemplateFile = (fileName) =>{
    return fs.readFileSync(path.join(__dirname, '..', 'templates', fileName), 'utf-8');
}

const createHtmlPages = (reportPath, suite, options, INDEX_HTML, FEATURE_FOLDER) => {
    generateFeatureScenariosTemplate(suite,options);
    _createFeaturesOverviewIndexPage(reportPath, suite, options, INDEX_HTML);
    _createFeatureIndexPages(reportPath, suite , options, FEATURE_FOLDER);
}

module.exports = {createHtmlPages};