const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const {
    calculatePercentage,
    createReportFolders,
    escapeHtml,
    findJsonFiles,
    formatDuration,
    formatToLocalIso,
    getCustomStyleSheet,
    getGenericJsContent,
    getStyleSheet,
    isBase64,
} = require('../../lib/utils');

jest.mock('path');
jest.mock('fs-extra');

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

        expect(() => findJsonFiles(resolveMock))
            .toThrow(new Error(`There were issues reading JSON-files from '${resolveMock}'.`));
        expect(readdirSyncSpy).toHaveBeenCalledTimes(1);
        expect(joinSpy).toHaveBeenCalledTimes(0);
    });

    it('should return an empty array when no json files could be found', () => {
        const resolveMock = '/resolveMock';
        const files = [];
        path.resolve.mockReturnValueOnce(resolveMock);
        const readdirSyncSpy = fs.readdirSync.mockReturnValueOnce(files);
        const joinSpy = path.join

        expect(findJsonFiles('./no-jsons')).toMatchSnapshot();
        expect(readdirSyncSpy).toHaveBeenCalledTimes(1);
        expect(joinSpy).toHaveBeenCalledTimes(0);
    });
});

describe('formatToLocalIso', () => {
    jest.mock('moment',
        () => () => jest.requireActual('moment')('2020-02-17T15:27:43.843Z')
    );

    it('should be able to format time to local ISO', () => {
        expect(formatToLocalIso('2020-02-17T15:27:43.843Z')).toMatchSnapshot();
    });
});

describe('createReportFolders', () => {
    it('should create the report folders', () => {
        const resolveMock = '/foo/features';
        const resolveSpy = path.resolve
            .mockReturnValueOnce(resolveMock);
        const ensureDirSyncSpy = fs.ensureDirSync;

        createReportFolders('foo');

        expect(ensureDirSyncSpy).toHaveBeenCalledTimes(2);
        expect(ensureDirSyncSpy).toHaveBeenCalledWith('foo');
        expect(ensureDirSyncSpy).toHaveBeenCalledWith('/foo/features');
        expect(resolveSpy).toHaveBeenCalledTimes(1);
        expect(resolveSpy).toHaveBeenCalledWith('foo', 'features');
    })
});

describe('calculatePercentage', () => {
    it('should be able to calculate the correct percentage', () => {
        expect(calculatePercentage(5, 10)).toMatchSnapshot();
        expect(calculatePercentage(3, 7)).toMatchSnapshot();
    });
});

describe('formatDuration', () => {
    it('should be able determine the proper  duration', () => {
        expect(formatDuration(false, 93399339933)).toMatchSnapshot();
        expect(formatDuration(true, 1993)).toMatchSnapshot();
    });
});

describe('escapeHtml', () => {
    it('should not escape data in the string', () => {
        expect(escapeHtml('nothing to escape')).toMatchSnapshot();
        expect(escapeHtml(2)).toMatchSnapshot();
        expect(escapeHtml(true)).toMatchSnapshot();
        expect(escapeHtml({foo: 'foo'})).toMatchSnapshot();
    });

    it('should escape data in the string', () => {
        expect(escapeHtml('<p>Hello</p>')).toMatchSnapshot();
    });
});

describe('isBase64', () => {
    it('should validate valid base64 strings', () => {
        const valid = [
            'Zg==',
            'Zm8=',
            'Zm9v',
            'Zm9vYg==',
            'Zm9vYmE=',
            'Zm9vYmFy',
            'TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4=',
            'Vml2YW11cyBmZXJtZW50dW0gc2VtcGVyIHBvcnRhLg==',
            'U3VzcGVuZGlzc2UgbGVjdHVzIGxlbw==',
            'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuMPNS1Ufof9EW/M98FNw' +
            'UAKrwflsqVxaxQjBQnHQmiI7Vac40t8x7pIb8gLGV6wL7sBTJiPovJ0V7y7oc0Ye' +
            'rhKh0Rm4skP2z/jHwwZICgGzBvA0rH8xlhUiTvcwDCJ0kc+fh35hNt8srZQM4619' +
            'FTgB66Xmp4EtVyhpQV+t02g6NzK72oZI0vnAvqhpkxLeLiMCyrI416wHm5Tkukhx' +
            'QmcL2a6hNOyu0ixX/x2kSFXApEnVrJ+/IxGyfyw8kf4N2IZpW5nEP847lpfj0SZZ' +
            'Fwrd1mnfnDbYohX2zRptLy2ZUn06Qo9pkG5ntvFEPo9bfZeULtjYzIl6K8gJ2uGZ' +
            'HQIDAQAB',
        ];

        valid.forEach(string => expect(isBase64(string)).toBeTruthy());
    });

    it('should validate invalid base64 strings', () => {
        const invalid = [
            '12345',
            '',
            'Vml2YW11cyBmZXJtZtesting123',
            'Zg=',
            'Z===',
            'Zm=8',
            '=m9vYg==',
            'Zm9vYmFy====',
        ];

        invalid.forEach(string => expect(isBase64(string)).toBeFalsy());
    });
});

describe('getGenericJsContent', () => {
    it('should be able to get the generic js content', () => {
        const readFileSyncSpy = fs.readFileSync;
        const joinSpy = path.join;

        getGenericJsContent();

        expect(readFileSyncSpy).toHaveBeenCalled();
        expect(joinSpy).toHaveBeenCalled();
    });
});

describe('getCustomStyleSheet', () => {
    it('should return an empty string if no filename is provided', () => {
        expect(getCustomStyleSheet()).toEqual('')
    });

    it('should return file content when a filename is provided', () => {
        const fileContent = 'File content';
        const fileName = 'foo.txt';
        const accessSyncSpy = fs.accessSync;
        const readFileSyncSpy = fs.readFileSync.mockReturnValue(fileContent);

        expect(getCustomStyleSheet(fileName)).toEqual(fileContent);
        expect(accessSyncSpy).toHaveBeenCalledWith(fileName, 4);
        expect(readFileSyncSpy).toHaveBeenCalledWith(fileName, 'utf-8');
    });

    it('should log an error when the file content could not be accessed', () => {
        const fileName = './file.txt';
        const error = 'Access error';
        fs.accessSync.mockImplementationOnce(() => {
            throw new Error(error);
        });
        jest.spyOn(global.console, 'log');
        getCustomStyleSheet(fileName);

        expect(console.log).toHaveBeenCalledWith(
            chalk.yellow(`WARNING: Custom stylesheet: '${fileName}' could not be loaded due to 'Error: ${error}'.`)
        );
    });

    it('should log an error when the file content could not be read', () => {
        const fileName = './file.txt';
        const error = 'Read error';
        fs.accessSync;
        fs.readFileSync.mockImplementationOnce(() => {
            throw new Error(error);
        });
        jest.spyOn(global.console, 'log');
        getCustomStyleSheet(fileName);

        expect(console.log).toHaveBeenCalledWith(
            chalk.yellow(`WARNING: Custom stylesheet: '${fileName}' could not be loaded due to 'Error: ${error}'.`)
        );
    });
});

describe('getStyleSheet', () => {
    it('should be able to get the generic js content', () => {
        const readFileSyncSpy = fs.readFileSync;
        const joinSpy = path.join;

        getStyleSheet();

        expect(readFileSyncSpy).toHaveBeenCalled();
        expect(joinSpy).toHaveBeenCalled();
    });

    it('should return file content when a filename is provided', () => {
        const fileContent = 'File content';
        const fileName = 'foo.css';
        const accessSyncSpy = fs.accessSync;
        const readFileSyncSpy = fs.readFileSync.mockReturnValue(fileContent);

        expect(getStyleSheet(fileName)).toEqual(fileContent);
        expect(accessSyncSpy).toHaveBeenCalledWith(fileName, 4);
        expect(readFileSyncSpy).toHaveBeenCalledWith(fileName, 'utf-8');
    });

    it('should log an error when the file content could not be accessed', () => {
        const fileName = 'foo.css';
        const error = 'Access error';
        fs.accessSync.mockImplementationOnce(() => {
            throw new Error(error);
        });
        jest.spyOn(global.console, 'log');
        getStyleSheet(fileName);

        expect(console.log).toHaveBeenCalledWith(
            chalk.yellow(`WARNING: Override stylesheet: '${fileName}' could not be loaded due to 'Error: ${error}'. The default will be loaded.`)
        );
    });

    it('should log an error when the file content could not be read', () => {
        const fileName = 'foo.css';
        const error = 'Read error';
        fs.accessSync;
        fs.readFileSync.mockImplementationOnce(() => {
            throw new Error(error);
        });
        jest.spyOn(global.console, 'log');
        getStyleSheet(fileName);

        expect(console.log).toHaveBeenCalledWith(
            chalk.yellow(`WARNING: Override stylesheet: '${fileName}' could not be loaded due to 'Error: ${error}'. The default will be loaded.`)
        );
    });
});
