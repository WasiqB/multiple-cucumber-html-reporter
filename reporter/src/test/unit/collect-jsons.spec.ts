import path from 'node:path';
import jsonFile from 'jsonfile';
import collectJSONS from '../../collect-jsons.js';

const reportPath = path.resolve(process.cwd(), './.tmp/test');

describe('collect-jsons.js', () => {
  describe('Happy flows', () => {
    it('should return an output from the merged found json files', () => {
      expect(
        collectJSONS({
          jsonDir: './src/test/unit/data/json',
          reportPath: reportPath,
        }),
      ).toEqual(jsonFile.readFileSync(path.resolve(process.cwd(), './src/test/unit/data/output/merged-output.json')));
    });

    it('should return an output from the merged found json files and add the provided metadata', () => {
      expect(
        collectJSONS({
          jsonDir: './src/test/unit/data/collect-json',
          reportPath: reportPath,
          metadata: {
            browser: {
              name: 'chrome',
              version: '1',
            },
            device: 'Local test machine',
            platform: {
              name: 'Ubuntu',
              version: '16.04',
            },
          },
        }),
      ).toEqual(
        jsonFile.readFileSync(path.resolve(process.cwd(), './src/test/unit/data/output/provided-metadata.json')),
      );
    });

    it('should save an output from the merged found json files', () => {
      expect(
        collectJSONS({
          jsonDir: './src/test/unit/data/json',
          reportPath: reportPath,
          saveCollectedJSON: true,
        }),
      ).toEqual(jsonFile.readFileSync(path.resolve(process.cwd(), './src/test/unit/data/output/merged-output.json')));
    });

    it('should collect the creation date of json files', () => {
      // Given
      const options = {
        jsonDir: './src/test/unit/data/json',
        reportPath: reportPath,
        displayReportTime: true,
      };

      // When
      const collectedJSONs = collectJSONS(options);

      // Then
      collectedJSONs.forEach((json) => {
        const metadata = json.metadata as any;
        expect(metadata.reportTime).toBeDefined();
        expect(metadata.reportTime.length).toBe('YYYY/MM/DD HH:mm:ss'.length);
      });
    });
  });

  describe('failures', () => {
    it('should throw an error when the json folder does not exist', () => {
      expect(() =>
        collectJSONS({
          jsonDir: './src/test/unit/data/bla',
          reportPath: reportPath,
        }),
      ).toThrow(new Error(`There were issues reading JSON-files from './src/test/unit/data/bla'.`));
    });

    it('should print a console message when no json files could be found', () => {
      spyOn(console, 'log');
      collectJSONS({
        jsonDir: './src/test/unit/data/no-jsons',
        reportPath: reportPath,
      });
      expect(console.log).toHaveBeenCalledWith(
        '\x1b[33m%s\x1b[0m',
        `WARNING: No JSON files found in './src/test/unit/data/no-jsons'. NO REPORT CAN BE CREATED!`,
      );
    });

    it('should return an empty array when no json files could be found', () => {
      const results = collectJSONS({
        jsonDir: './src/test/unit/data/no-jsons',
        reportPath: reportPath,
      });
      expect(Array.isArray(results)).toBeTruthy();
      expect(results.length).toBe(0);
    });
  });
});
