import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import jsonFile from 'jsonfile';
import collectJSONS from '../../collect-jsons.js';

const reportPath = path.resolve(process.cwd(), './.tmp/test');
const packageJson = fs.readJsonSync(path.resolve(process.cwd(), './package.json'));

describe('collect-jsons.js', () => {
  describe('Happy flows', () => {
    it('should return an output from the merged found json files', () => {
      const collectedJSONs = collectJSONS({
        jsonDir: './src/test/unit/data/json',
        reportPath: reportPath,
      });

      expect(collectedJSONs.length).toEqual(
        jsonFile.readFileSync(path.resolve(process.cwd(), './src/test/unit/data/output/merged-output.json')).length,
      );
      expect(collectedJSONs[0].metadata).toEqual(
        jasmine.objectContaining({
          username: os.userInfo().username,
          device: os.hostname(),
          platform: {
            name: os.type().trim(),
            version: os.release().trim(),
          },
          nodeVersion: process.version,
          reportVersion: packageJson.version,
          hostname: os.hostname(),
          architecture: os.arch(),
        }),
      );
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
      ).toEqual([
        jasmine.objectContaining({
          metadata: jasmine.objectContaining({
            browser: {
              name: 'chrome',
              version: '1',
            },
            device: 'Local test machine',
            platform: {
              name: 'Ubuntu',
              version: '16.04',
            },
            username: os.userInfo().username,
            nodeVersion: process.version,
            reportVersion: packageJson.version,
            hostname: os.hostname(),
            architecture: os.arch(),
          }),
        }),
      ]);
    });

    it('should fill platform and username when only browser metadata is provided', () => {
      const [collectedJSON] = collectJSONS({
        jsonDir: './src/test/unit/data/collect-json',
        reportPath: reportPath,
        metadata: {
          browser: {
            name: 'firefox',
            version: 'latest',
          },
        },
      });

      expect(collectedJSON.metadata).toEqual(
        jasmine.objectContaining({
          browser: {
            name: 'firefox',
            version: 'latest',
          },
          username: os.userInfo().username,
          device: os.hostname(),
          platform: {
            name: os.type().trim(),
            version: os.release().trim(),
          },
          nodeVersion: process.version,
          reportVersion: packageJson.version,
          hostname: os.hostname(),
          architecture: os.arch(),
        }),
      );
    });

    it('should save an output from the merged found json files', () => {
      const collectedJSONs = collectJSONS({
        jsonDir: './src/test/unit/data/json',
        reportPath: reportPath,
        saveCollectedJSON: true,
      });

      expect(collectedJSONs.length).toEqual(
        jsonFile.readFileSync(path.resolve(process.cwd(), './src/test/unit/data/output/merged-output.json')).length,
      );
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
