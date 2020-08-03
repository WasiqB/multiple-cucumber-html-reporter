const {resolve} = require('path');
const {findJsonFiles, formatToLocalIso} = require('../../lib/utils');

describe('findJsonFiles', () => {
    it('should be able to find all json files', () => {
        expect(findJsonFiles('./test/unit/data/collect-jsons')).toMatchSnapshot();
    });

    it('should throw an error when the json folder does not exist', () => {
        const dir = './test/unit/data/bla';

        expect(()=> findJsonFiles(dir))
            .toThrow(new Error(`There were issues reading JSON-files from '${resolve(process.cwd(), dir)}'.`));
    });

    it('should return an empty array when no json files could be found', () => {
        expect(findJsonFiles('./test/unit/data/no-jsons')).toMatchSnapshot();
    });
});

describe('formatToLocalIso', () => {
    it('should be able to format time to local ISO', () => {
        expect(formatToLocalIso('2020-02-17T15:27:43.843Z')).toMatchSnapshot();
    });
});
