const {parseFeatureHooks, parseMetadata} = require('../../lib/parse.cucumber.data');

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
