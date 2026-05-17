const fs = require('node:fs');
const path = require('node:path');

const distDir = path.resolve(__dirname, '../dist');
const distDevDir = path.resolve(__dirname, '../dist-dev');
const wasmDir = path.resolve(__dirname, '../src/wasm');

for (const dir of [distDir, distDevDir, wasmDir]) {
    if (fs.existsSync(dir)) {
        console.log(`Removing ${dir}...`);
        fs.rmSync(dir, { recursive: true, force: true });
    }
}
