import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    outDir: "dist/esm",
    dts: { entry: "src/index.ts" },
    bundle: true,
    splitting: false,
    sourcemap: false,
    clean: false,
    platform: "browser",
    target: "esnext",
    external: ["./wasm/plotive_wasm.js", "./wasm/plotive_wasm_bg.wasm"],
    outExtension() {
      return { js: ".mjs" };
    },
  },
  {
    entry: { index: "src/index.node.ts" },
    format: ["cjs"],
    outDir: "dist/cjs",
    bundle: true,
    splitting: false,
    sourcemap: false,
    clean: false,
    platform: "node",
    target: "node18",
    external: ["./wasm/plotive_wasm.js"],
    define: {
      __WASM_NODE_PATH__: '"./wasm/plotive_wasm.js"',
    },
    outExtension() {
      return { js: ".cjs" };
    },
  },
  {
    entry: { index: "src/index.node.ts" },
    format: ["esm"],
    outDir: "dist/node-esm",
    bundle: true,
    splitting: false,
    sourcemap: false,
    clean: false,
    platform: "node",
    target: "node18",
    external: ["../cjs/wasm/plotive_wasm.js"],
    define: {
      __WASM_NODE_PATH__: '"../cjs/wasm/plotive_wasm.js"',
    },
    banner: {
      js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);',
    },
    outExtension() {
      return { js: ".mjs" };
    },
  },
]);
