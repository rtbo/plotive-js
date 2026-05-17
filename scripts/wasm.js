const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { parseArgs } = require('node:util');

const REMOVE = [".gitignore", "README.md", "package.json"];

const args = parseArgs({
    options: {
        target: {
            type: 'string',
        },
    },
});

if (!['dev', 'prod'].includes(args.values.target)) {
    console.error(`Invalid target: ${args.values.target}`);
    process.exit(1);
}


const distDir = path.resolve(__dirname, '..', 'dist');
const srcDir = path.resolve(__dirname, '..', 'src');
const wasmSrcDir = path.resolve(__dirname, '..', 'plotive-wasm');

const CONFIG = {
    "dev": [
        {
            wasmTarget: "web",
            outDir: path.resolve(srcDir, 'wasm'),
            dev: true,
        },
        {
            wasmTarget: "web",
            outDir: path.resolve(distDir, 'web/wasm'),
            dev: true,
        },
    ],
    "prod": [
        {
            wasmTarget: "web",
            outDir: path.resolve(srcDir, 'wasm'),
            dev: true,
        },
        {
            wasmTarget: "web",
            outDir: path.resolve(distDir, 'web/wasm'),
            dev: false,
        },
        {
            wasmTarget: "nodejs",
            outDir: path.resolve(distDir, 'node/wasm'),
            dev: false,
        }
    ]
}

for (const { wasmTarget, outDir, dev } of CONFIG[args.values.target]) {
    const wasmArgs = ['build', wasmSrcDir, '--target', wasmTarget, '--out-dir', outDir];
    if (dev) {
        wasmArgs.push('--dev');
    }

    cp.execFileSync('wasm-pack', wasmArgs, {
        stdio: 'inherit',
    });

    for (const file of REMOVE) {
        fs.rmSync(path.resolve(outDir, file), { force: true });
    }
}
