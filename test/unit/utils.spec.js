const path = require('path');
const fs = require('fs-extra');
const {findJsonFiles, formatToLocalIso} = require('../../lib/utils');

jest.mock('path');
jest.mock('fs-extra');
jest.mock('moment', () => () => ({format: () => '2020/02/17 16:27:43'}));

afterEach(() => jest.resetAllMocks());

describe('findJsonFiles', () => {
    it('should be able to find all json files', () => {
        const resolveMock = '/resolveMock';
        const files = ['1.json', '2.json', '3.json', '4.txt', '5.doc', '6.json'];
        const resolveSpy = path.resolve.mockReturnValueOnce(resolveMock);
        const readdirSyncSpy = fs.readdirSync.mockReturnValueOnce(files);
        const joinSpy = path.join
            .mockReturnValueOnce(`${resolveMock}/${files[0]}`)
            .mockReturnValueOnce(`${resolveMock}/${files[1]}`)
            .mockReturnValueOnce(`${resolveMock}/${files[2]}`)
            .mockReturnValueOnce(`${resolveMock}/${files[5]}`);

        expect(findJsonFiles('./test/unit/data/collect-jsons')).toMatchSnapshot();
        expect(resolveSpy).toHaveBeenCalledTimes(1);
        expect(readdirSyncSpy).toHaveBeenCalledTimes(1);
        expect(joinSpy).toHaveBeenCalledTimes(4);
    });

    it('should throw an error when the json folder does not exist', () => {
        const resolveMock = '/resolveMock';
        path.resolve.mockReturnValueOnce(resolveMock);
        const readdirSyncSpy = fs.readdirSync.mockReturnValueOnce(null);
        const joinSpy = path.join

        expect(()=> findJsonFiles(resolveMock))
            .toThrow(new Error(`There were issues reading JSON-files from '${resolveMock}'.`));
        expect(readdirSyncSpy).toHaveBeenCalledTimes(1);
        expect(joinSpy).toHaveBeenCalledTimes(0);
    });

    it('should return an empty array when no json files could be found', () => {
        const resolveMock = '/resolveMock';
        const files = [];
        const resolveSpy = path.resolve.mockReturnValueOnce(resolveMock);
        const readdirSyncSpy = fs.readdirSync.mockReturnValueOnce(files);
        const joinSpy = path.join

        expect(findJsonFiles('./no-jsons')).toMatchSnapshot();
        expect(readdirSyncSpy).toHaveBeenCalledTimes(1);
        expect(joinSpy).toHaveBeenCalledTimes(0);
    });
});

describe('formatToLocalIso', () => {
    it('should be able to format time to local ISO', () => {
        expect(formatToLocalIso('2020-02-17T15:27:43.843Z')).toMatchSnapshot();
    });
});
