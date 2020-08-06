const {Base64} = require('js-base64');
const {v4: uuid} = require('uuid');
const {escapeHtml, formatDuration, isBase64} = require('./utils');
const RESULT_STATUS = {
    passed: 'passed',
    failed: 'failed',
    skipped: 'skipped',
    pending: 'pending',
    notDefined: 'undefined',
    ambiguous: 'ambiguous'
};

/**
 * Parse the feature hook and return a step hook
 *
 * @param {Array} data
 * @param {string} keyword
 *
 * @returns {
 *  {
 *     arguments: array,
 *     keyword: string,
 *     name: string,
 *     result: {
 *         status: string,
 *     },
 *     line: string,
 *     match: {
 *         location: string
 *     },
 *     embeddings: []
 *  }[]
 * }
 */
function parseFeatureHooks(data, keyword) {
    return data.map(step => {
        const match = step.match && step.match.location ? step.match : {location: 'can not be determined'};

        return {
            arguments: step.arguments || [],
            embeddings: step.embeddings || [],
            keyword: keyword,
            line: '',
            match,
            name: 'Hook',
            result: step.result,
        };
    });
}

/**
 * Parse metadata and provide default data if needed
 *
 * @param {object} json
 * @param {object} metadata
 *
 * @returns {{*}}
 */
function parseMetadata(json, metadata) {
    const defaultMetadata = {
        metadata: {
            browser: {
                name: "not known",
                version: "not known"
            },
            device: "not known",
            platform: {
                name: "not known",
                version: "not known"
            }
        },
    }

    return {
        ...(metadata && !json.metadata ? {metadata} : defaultMetadata),
        ...json,
    };
}

/**
 * Parse the scenario steps
 *
 * @param {object} scenario
 * @param {boolean} durationInMS
 *
 * @returns {*}
 */
function parseScenarioSteps(scenario, durationInMS) {
    scenario.steps.forEach(step => {
        if (step.embeddings !== undefined) {
            step.attachments = [];
            step.embeddings.forEach((embedding, embeddingIndex) => {
                if (embedding.mime_type === 'application/json' || embedding.media && embedding.media.type === 'application/json') {
                    step.json = (step.json
                        ? step.json
                        : []).concat(
                        [typeof embedding.data === 'string'
                            ? JSON.parse(embedding.data)
                            : embedding.data
                        ]);
                } else if (embedding.mime_type === 'text/html' || (embedding.media && embedding.media.type === 'text/html')) {
                    step.html = (step.html ? step.html : []).concat([
                        isBase64(embedding.data) ? Base64.decode(embedding.data) : embedding.data
                    ]);
                } else if (embedding.mime_type === 'text/plain' || (embedding.media && embedding.media.type === 'text/plain')) {
                    step.text = (step.text ? step.text : []).concat([
                        isBase64(embedding.data) ? escapeHtml(Base64.decode(embedding.data)) : escapeHtml(embedding.data)
                    ]);
                } else if (embedding.mime_type === 'image/png' || (embedding.media && embedding.media.type === 'image/png')) {
                    step.image = (step.image ? step.image : []).concat(['data:image/png;base64,' + embedding.data]);
                    step.embeddings[embeddingIndex] = {};
                }
                else {
                    let embeddingtype = 'text/plain';
                    if (embedding.mime_type) {
                        embeddingtype = embedding.mime_type;
                    } else if (embedding.media && embedding.media.type) {
                        embeddingtype = embedding.media.type;
                    }
                    step.attachments.push({
                        data: 'data:' + embeddingtype + ';base64,' + embedding.data,
                        type: embeddingtype
                    });
                    step.embeddings[embeddingIndex] = {};
                }
            });
        }

        if (step.doc_string !== undefined) {
            step.id = `${uuid()}.${scenario.id}.${step.name}`.replace(/[^a-zA-Z0-9-_]/g, '-');
            step.restWireData = step.doc_string.value
                .split(/[>]/)
                .join('')
                .replace(new RegExp('\r?\n', 'g'), '<br />');
        }

        // Don't log steps to the report that:
        // - don't have a result
        // - or are hidden with:
        //      - no text/image
        //      - attachments which are empty
        //      - and the result it not failed
        // 9-10 times these are hooks
        if (!step.result
            || (step.hidden
                && !step.text
                && !step.image
                && step.attachments
                && step.attachments.length === 0
                && step.result.status !== RESULT_STATUS.failed
            )) {

            return;
        }

        if (step.result.duration) {
            scenario.duration += step.result.duration;
            step.time = formatDuration(durationInMS, step.result.duration)
        }

        if (step.result.status === RESULT_STATUS.passed) {
            return scenario.passed++;
        }

        if (step.result.status === RESULT_STATUS.failed) {
            return scenario.failed++;
        }

        if (step.result.status === RESULT_STATUS.notDefined) {
            return scenario.notDefined++;
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

module.exports = {
    parseFeatureHooks,
    parseMetadata,
    parseScenarioSteps,
};
