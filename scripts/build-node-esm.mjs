import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const outDir = resolve(rootDir, 'dist/node-esm');
const outFile = resolve(outDir, 'index.mjs');

mkdirSync(outDir, { recursive: true });

const content = `import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const wasmNode = require('../cjs/wasm/plotive_wasm.js');
wasmNode.set_panic_hook();

export async function renderAsSvg(elem, fig) {
  const svg = wasmNode.render_to_svg_string(fig);
  elem.innerHTML = svg;
}

export async function renderToSvgString(fig) {
  return wasmNode.render_to_svg_string(fig);
}

export async function renderToImg(elem, fig) {
  const data = wasmNode.render_to_png_data_url(fig);
  elem.src = data;
}

export async function renderToPngDataUrl(fig) {
  return wasmNode.render_to_png_data_url(fig);
}
`;

writeFileSync(outFile, content, 'utf8');
console.log('Generated', outFile);
