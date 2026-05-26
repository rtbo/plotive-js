const fs = require('node:fs');
const path = require('node:path');

const DIRS_TO_CLEAN = [
    path.resolve(__dirname, '../dist'),
    path.resolve(__dirname, '../dist-dev'),
    path.resolve(__dirname, '../src/wasm'),
    path.resolve(__dirname, '../examples/dist'),
    path.resolve(__dirname, '../examples/node_modules/.vite'),
];

for (const dir of DIRS_TO_CLEAN) {
    if (fs.existsSync(dir)) {
        console.log(`Removing ${dir}...`);
        fs.rmSync(dir, { recursive: true, force: true });
    }
}
