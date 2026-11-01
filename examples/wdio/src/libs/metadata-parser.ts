import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'multiple-cucumber-html-reporter';

export function saveMetadata(capabilities: (WebdriverIO.Capabilities & { 'cjson:metadata': Metadata })[]): void {
  const formatterFolder = process.env.MESSAGES || 'json';
  const formatterExt = formatterFolder === 'messages' ? '.ndjson' : '.json';
  const jsonDir = `./reports/${formatterFolder}/`;
  const files = readdirSync(jsonDir).filter((file) => file.endsWith(formatterExt));

  const customMetadata: Record<string, Metadata> = {};

  files.forEach((file, index) => {
    const filePath = join(jsonDir, file);
    const rawData = readFileSync(filePath, 'utf-8');
    const capability = capabilities[index];
    const metadata = capability['cjson:metadata'];
    const browserName = capability.browserName || 'chrome';

    if (!rawData.trim()) return;

    const suiteData = JSON.parse(rawData);

    suiteData.forEach((feature: any) => {
      const originalName = feature.name;
      feature.name = `${originalName} [${browserName.toUpperCase()}]`;
      feature.id = `${feature.id}-${browserName}`;
      const fileName = feature.uri as string;
      feature.uri = fileName.replace('.feature', `-${browserName}.feature`);

      const metaKey = (feature.uri as string).split('/').pop();
      if (metaKey) {
        customMetadata[metaKey] = metadata;
      }
    });

    writeFileSync(filePath, JSON.stringify(suiteData, null, 2));
  });

  writeFileSync(join(process.cwd(), 'reports', 'metadata.json'), JSON.stringify(customMetadata, null, 2), 'utf8');
}
