import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const sourceDir = resolve(rootDir, 'src/wasm');
const targetDir = resolve(rootDir, 'dist/wasm');

if (!existsSync(sourceDir)) {
    throw new Error(`WASM output directory not found: ${sourceDir}. Run \"pnpm run build:wasm\" first.`);
}

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });
const excludedFiles = ['.gitignore', 'README.md', 'package.json'];
cpSync(sourceDir, targetDir, {
    recursive: true,
    filter: (sourcePath) => !excludedFiles.includes(basename(sourcePath)),
});
