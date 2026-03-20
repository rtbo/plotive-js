import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const plotiveEntry = fileURLToPath(new URL('../../src/index.ts', import.meta.url));
const plotiveWasmEntry = fileURLToPath(new URL('../../plotive-wasm/pkg/plotive_wasm.js', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      plotive: plotiveEntry,
      'plotive-wasm': plotiveWasmEntry,
    },
  },
  optimizeDeps: {
    exclude: ['plotive', 'plotive-wasm'],
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  define: {
    global: 'window',
  }
});
