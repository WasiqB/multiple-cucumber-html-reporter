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
function parseMetadata(json, metadata ) {
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

module.exports = {
    parseFeatureHooks,
    parseMetadata,
};
