import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'multiple-cucumber-html-reporter';

export function saveMetadata(
  capabilities: (WebdriverIO.Capabilities & { 'cjson:metadata': Metadata })[],
  useIndex: boolean = false,
): void {
  const formatterFolder = process.env.MESSAGES || 'json';
  const formatterExt = formatterFolder === 'messages' ? '.ndjson' : '.json';
  const jsonDir = `./reports/${formatterFolder}/`;
  const files = readdirSync(jsonDir).filter((file) => file.endsWith(formatterExt));

  const customMetadata: Record<string, Metadata> = {};

  files.forEach((file, index) => {
    const filePath = join(jsonDir, file);
    const rawData = readFileSync(filePath, 'utf-8');
    const workerId = file.match(/-(\d+)-\d+\.[^.]+$/);
    const capability = !useIndex && workerId ? capabilities[Number(workerId[1])] : capabilities[index];
    if (!capability) return;
    const metadata = capability['cjson:metadata'];
    const browserName = capability.browserName || 'chrome';

    if (!rawData.trim()) return;

    if (formatterFolder === 'messages') {
      const lines = rawData.split('\n');
      const updatedLines = lines.map((line) => {
        if (!line.trim()) return line;
        try {
          const envelope = JSON.parse(line);
          const updateUri = (uri: string): string => uri.replace('.feature', `-${browserName}.feature`);

          if (envelope.source?.uri) {
            envelope.source.uri = updateUri(envelope.source.uri);
          }
          if (envelope.gherkinDocument) {
            if (envelope.gherkinDocument.uri) {
              envelope.gherkinDocument.uri = updateUri(envelope.gherkinDocument.uri);
            }
            if (envelope.gherkinDocument.feature) {
              const originalName = envelope.gherkinDocument.feature.name;
              envelope.gherkinDocument.feature.name = `${originalName} [${browserName.toUpperCase()}]`;
            }
            const metaKey = envelope.gherkinDocument.uri?.split('/').pop();
            if (metaKey) {
              customMetadata[metaKey] = metadata;
            }
          }
          if (envelope.pickle?.uri) {
            envelope.pickle.uri = updateUri(envelope.pickle.uri);
          }
          return JSON.stringify(envelope);
        } catch {
          return line;
        }
      });

      writeFileSync(filePath, updatedLines.join('\n'));
    } else {
      const suiteData = JSON.parse(rawData);

      suiteData.forEach((feature: any) => {
        const originalName = feature.name;
        feature.name = `${originalName} [${browserName.toUpperCase()}]`;
        feature.id = `${feature.id}-${browserName}`;
        const fileName = (feature?.uri as string) || '';
        feature.uri = fileName.replace('.feature', `-${browserName}.feature`);

        const metaKey = (feature.uri as string).split('/').pop();
        if (metaKey) {
          customMetadata[metaKey] = metadata;
        }
      });

      writeFileSync(filePath, JSON.stringify(suiteData, null, 2));
    }
  });

  writeFileSync(join(process.cwd(), 'reports', 'metadata.json'), JSON.stringify(customMetadata, null, 2), 'utf8');
}
