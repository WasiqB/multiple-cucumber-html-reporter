const uuid = require('uuid').v4;
const Base64 = require('js-base64').Base64;
const {
    parseFeatureHooks,
    parseMetadata,
    parseScenarioSteps,
} = require('../../lib/parse.cucumber.data');
const Utils = require('../../lib/utils');

jest.mock('js-base64');
jest.mock('uuid');
jest.mock('../../lib/utils');

let formatDurationSpy;

beforeEach(() => {
    formatDurationSpy = Utils.formatDuration.mockReturnValue('00:00:00.001');
    uuid.mockImplementation(() => 'testid');
});

afterEach(() => jest.resetAllMocks());

describe('parseFeatureHooks', () => {
    it('should be able add a before hook', () => {
        expect(parseFeatureHooks(
            [
                {
                    result: {
                        status: 'passed'
                    },
                    match: {}
                }
            ],
            'before',
        ))
            .toMatchSnapshot();
    });

    it('should be able add an after hook', () => {
        expect(parseFeatureHooks(
            [

                {
                    arguments: [
                        {
                            foo: 'bar'
                        }
                    ],
                    embeddings: [
                        {
                            bar: 'foo'
                        }
                    ],
                    result: {
                        'foo-bar': true,
                    },
                    match: {
                        location: 'something'
                    }
                }
            ],
            'after',
        ))
            .toMatchSnapshot();
    });

    it('should be able add multiple before hooks', () => {
        expect(parseFeatureHooks(
            [
                {
                    result: {
                        status: 'passed'
                    },
                    match: {}
                },
                {
                    result: {
                        status: 'failed'
                    },
                    match: {
                        location: 'something'
                    }
                }
            ],
            'before',
        ))
            .toMatchSnapshot();
    });
});

describe('parseMetadata', () => {
    it('should be able add the default metadata', () => {
        expect(parseMetadata(
            {
                foo: 'bar'
            }
        ))
            .toMatchSnapshot();
    });

    it('should be able add the provided metadata', () => {
        expect(parseMetadata(
            {
                foo: 'bar'
            },
            {
                metadata: {
                    foo: 'bar'
                }
            }
        ))
            .toMatchSnapshot();
    });

    it('should not add metadata if it is already there', () => {
        expect(parseMetadata(
            {
                foo: 'bar',
                metadata: {
                    fooBar: 'fooBar'
                }
            },
            {
                metadata: {
                    foo: 'bar'
                }
            }
        ))
            .toMatchSnapshot();
    });
});

describe('parseScenarioSteps', () => {
    const defaultData = {
        keyword: 'Scenario',
        type: 'scenario',
        passed: 0,
        failed: 0,
        notDefined: 0,
        skipped: 0,
        pending: 0,
        ambiguous: 0,
        duration: 0,
        time: '00:00:00.000',
    };
    const testData = {
        donNotLog: {
            ...defaultData,
            steps: [
                {
                    hidden: false,
                    keyword: 'After',
                },
                {
                    attachments: [],
                    hidden: true,
                    keyword: 'After',
                    result: {
                        status: 'passed',
                        duration: 3000000,
                    }
                },
            ]
        },
        passedAndFailedSteps: {
            ...defaultData,
            steps: [
                {
                    hidden: false,
                    keyword: 'Before',
                    result: {
                        status: 'passed',
                        duration: 1000000,
                    }
                },
                {
                    hidden: false,
                    keyword: 'Before',
                    result: {
                        status: 'passed',
                        duration: 1000000,
                    }
                },
                {
                    hidden: false,
                    keyword: 'Before',
                    result: {
                        status: 'passed',
                        duration: 1000000,
                    }
                },
                {
                    keyword: 'Given',
                    result: {
                        status: 'undefined',
                        duration: 1000000,
                    }
                },
                {
                    keyword: 'When',
                    result: {
                        status: 'pending',
                        duration: 1000000,
                    }
                },
                {
                    keyword: 'Then',
                    result: {
                        status: 'failed',
                        duration: 1000000,
                        error_message: 'Error: blabla\n    at World.<anonymous> (e2e/steps/common.steps.ts:32:10)',
                    }
                },
                {
                    keyword: 'And',
                    result: {
                        status: 'skipped',
                        duration: 1000000,
                    }
                },
                {
                    hidden: false,
                    keyword: 'After',
                    result: {
                        status: 'ambiguous',
                        duration: 1000000,
                    }
                },
            ]
        },
        docString: {
            ...defaultData,
            id: 'create_api_validate_all_planet_and_response',
            steps: [
                {
                    doc_string: {
                        content_type: '',
                        value: '17:30:35.402 request:\n1 > GET https:\/\/swapi.co\/api\/planets\n1 > Accept-Encoding: gzip,deflate',
                    },
                    keyword: 'Given',
                    name: 'method get',
                    result: {
                        duration: 4060535948,
                        status: 'passed'
                    }
                },
            ]
        },
        jsonEmbedding: {
            steps:[
                {
                    embeddings:[
                        {
                            data: '[{"fruit": "Apple", "size": "Large", "color": "Red"}]',
                            mime_type: 'application/json',
                        },
                        {
                            data: [{"fruit": "Orange", "size": "Small", "color": "Orange"}],
                            media: {
                                 type: 'application/json',
                            },
                        }
                    ],
                }
            ],
        },
        htmlEmbedding: {
            steps:[
                {
                    embeddings:[
                        {
                            data: '<H1>This is a HTML list</H1><div><ul><li>1st</li><li>2nd</li></ul></div>',
                            mime_type: 'text/html'
                        },
                        {
                            data: 'PEgxPlRoaXMgaXMgYSAybmQgSFRNTCBsaXN0PC9IMT48ZGl2Pjx1bD48bGk+M3JkPC9saT48bGk+NHRoPC9saT48L3VsPjwvZGl2Pg==',
                            media: {
                                 type: 'text/html',
                            },
                        }
                    ],
                }
            ],
        },
        plainTextEmbedding: {
            steps:[
                {
                    embeddings:[
                        {
                            data: 'Hello, I am a plain text string',
                            mime_type: 'text/plain'
                        },
                        {
                            data: 'SGVsbG8sIEkgYW0gYSBzZWNvbmQgcGxhaW4gdGV4dCBzdHJpbmc=',
                            media: {
                                 type: 'text/plain',
                            },
                        }
                    ],
                }
            ],
        },
        imageEmbedding: {
            steps:[
                {
                    embeddings:[
                        {
                            data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                            mime_type: 'image/png'
                        },
                        {
                            data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                            media: {
                                 type: 'image/png',
                            },
                        }
                    ],
                }
            ],
        },
        unknownEmbedding: {
            steps:[
                {
                    embeddings:[
                        {
                            data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
                        },
                        {
                            data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                            mime_type: 'foo/type'
                        },
                        {
                            data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                            media: {
                                 type: 'bar/type',
                            },
                        }
                    ],
                }
            ],
        },
    }

    it('should not log steps to the report under certain conditions', () => {
        expect(parseScenarioSteps(testData.donNotLog, false)).toMatchSnapshot();
    });

    it('should log steps to the report for passed and failed steps', () => {
        expect(parseScenarioSteps(testData.passedAndFailedSteps, false)).toMatchSnapshot();
        expect(formatDurationSpy).toHaveBeenCalledTimes(8);
    });

    it('should be able to parse the doc_string data', () => {
        expect(parseScenarioSteps(testData.docString, false)).toMatchSnapshot();
    });

    it('should be able to parse JSON embeddings', () => {
        expect(parseScenarioSteps(testData.jsonEmbedding, false)).toMatchSnapshot();
    });

    it('should be able to parse HTML embeddings', () => {
        const isBase64Spy = Utils.isBase64
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(true);
        const base64Spy = Base64.decode
            .mockReturnValueOnce('<H1>This is a 2nd HTML list</H1><div><ul><li>3rd</li><li>4th</li></ul></div>');

        expect(parseScenarioSteps(testData.htmlEmbedding, false)).toMatchSnapshot();
        expect(isBase64Spy).toHaveBeenCalledTimes(2);
        expect(base64Spy).toHaveBeenCalledTimes(1);
    });

    it('should be able to parse plain text embeddings', () => {
        const isBase64Spy = Utils.isBase64
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(true);
        const escapeHtmlSpy = Utils.escapeHtml
            .mockReturnValueOnce('Hello, I am a plain text string')
            .mockReturnValueOnce('Hello, I am a second plain text string');
        const base64Spy = Base64.decode
            .mockReturnValueOnce('Hello, I am a second plain text string');

        expect(parseScenarioSteps(testData.plainTextEmbedding, false)).toMatchSnapshot();
        expect(isBase64Spy).toHaveBeenCalledTimes(2);
        expect(escapeHtmlSpy).toHaveBeenCalledTimes(2);
        expect(base64Spy).toHaveBeenCalledTimes(1);
    });

    it('should be able to parse image embeddings', () => {
        expect(parseScenarioSteps(testData.imageEmbedding, false)).toMatchSnapshot();
    });

    it('should be able to parse unknown embeddings', () => {
        expect(parseScenarioSteps(testData.unknownEmbedding, false)).toMatchSnapshot();
    });
});
