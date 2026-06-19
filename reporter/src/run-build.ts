import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

function runBuild(): void {
  try {
    const targetDir = join('dist', 'test', 'unit');
    if (existsSync(targetDir)) {
      rmSync(targetDir, { recursive: true, force: true });
    }
    mkdirSync(targetDir, { recursive: true });

    const srcTestDir = join('src', 'test');
    const distTestDir = join('dist', 'test');

    const files = readdirSync(srcTestDir);
    files.forEach((file) => {
      if (extname(file) === '.css') {
        copyFileSync(join(srcTestDir, file), join(distTestDir, file));
      }
    });

    const jsonSrcPath = join('src', 'test', 'unit', 'jasmine.json');
    const jsonDstPath = join('dist', 'test', 'unit', 'jasmine.json');

    if (existsSync(jsonSrcPath)) {
      const fileContent = readFileSync(jsonSrcPath, 'utf8');
      const updatedContent = fileContent.replace(/src\/test/g, 'dist/test');
      writeFileSync(jsonDstPath, updatedContent, 'utf8');
    } else {
      console.warn(`Warning: Source file not found at ${jsonSrcPath}`);
    }

    const srcTemplatesDir = join('src', 'templates');
    const distTemplatesDir = join('dist', 'templates');

    if (existsSync(srcTemplatesDir)) {
      cpSync(srcTemplatesDir, distTemplatesDir, { recursive: true });
    } else {
      console.warn(`Warning: Templates folder not found at ${srcTemplatesDir}`);
    }

    console.log('Build steps completed successfully.');
  } catch (error) {
    console.error('Error executing build steps:', error);
    process.exit(1);
  }
}

runBuild();
