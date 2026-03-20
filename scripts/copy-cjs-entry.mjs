import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const sourceFile = resolve(rootDir, 'src/index.cjs');
const targetFile = resolve(rootDir, 'dist/index.cjs');

if (!existsSync(sourceFile)) {
    throw new Error(`CJS bridge file not found: ${sourceFile}.`);
}

mkdirSync(dirname(targetFile), { recursive: true });
copyFileSync(sourceFile, targetFile);
