import { mkdir, rm } from 'node:fs/promises';

await rm('reports', { recursive: true, force: true });
await rm('test-results', { recursive: true, force: true });

await mkdir('reports', { recursive: true });
await mkdir('test-results/screenshots', { recursive: true });
await mkdir('test-results/trace', { recursive: true });
