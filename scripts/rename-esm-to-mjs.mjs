import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const rootDir = resolve(scriptDir, '..');
const distDir = resolve(rootDir, 'dist/esm');

if (!existsSync(distDir)) {
    throw new Error(`Dist directory not found: ${distDir}. Run build first.`);
}

/** @type {string[]} */
const jsFiles = [];
/** @type {string[]} */
const mjsFiles = [];

function walk(currentDir) {
    for (const entry of readdirSync(currentDir)) {
        const fullPath = join(currentDir, entry);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
            walk(fullPath);
            continue;
        }

        const ext = extname(fullPath);
        if (ext === '.js') {
            jsFiles.push(fullPath);
        } else if (ext === '.mjs') {
            mjsFiles.push(fullPath);
        }
    }
}

walk(distDir);

for (const jsPath of jsFiles) {
    const mjsPath = jsPath.slice(0, -3) + '.mjs';
    renameSync(jsPath, mjsPath);
    mjsFiles.push(mjsPath);
}

const relJsImportPattern = /(["'])(\.{1,2}\/[^"']+)\.js\1/g;
for (const filePath of mjsFiles) {
    const content = readFileSync(filePath, 'utf8');
    const updated = content.replace(relJsImportPattern, '$1$2.mjs$1');
    if (updated !== content) {
        writeFileSync(filePath, updated, 'utf8');
    }
}

const renamedCount = jsFiles.length;
const touchedCount = mjsFiles.length;
console.log(`Renamed ${renamedCount} JS files to MJS in ${relative(rootDir, distDir)}.`);
console.log(`Processed ${touchedCount} MJS files for relative import extension updates.`);
