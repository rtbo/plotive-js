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
    entry: { index: "src/index.cts" },
    format: ["cjs"],
    outDir: "dist/cjs",
    bundle: true,
    splitting: false,
    sourcemap: false,
    clean: false,
    platform: "node",
    target: "node18",
    external: ["./wasm/plotive_wasm.js", "./wasm/plotive_wasm_bg.wasm"],
    outExtension() {
      return { js: ".cjs" };
    },
  },
  {
    entry: { index: "src/index.node-esm.ts" },
    format: ["esm"],
    outDir: "dist/node-esm",
    bundle: true,
    splitting: false,
    sourcemap: false,
    clean: false,
    platform: "node",
    target: "node18",
    outExtension() {
      return { js: ".mjs" };
    },
  },
]);
