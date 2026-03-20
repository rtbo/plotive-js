import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const sourceDir = resolve(rootDir, 'plotive-wasm/pkg-node');
const targetDir = resolve(rootDir, 'dist/wasm-node');

if (!existsSync(sourceDir)) {
    throw new Error(`Node WASM output directory not found: ${sourceDir}. Run "pnpm run build:wasm:node" first.`);
}

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });
const excludedFiles = ['README.md', 'package.json'];
cpSync(sourceDir, targetDir, {
    recursive: true,
    filter: (sourcePath) => !excludedFiles.includes(basename(sourcePath)),
});
