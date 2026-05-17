import { defineConfig } from "vite";

type LibTarget = {
  runtimeTarget: "web" | "node";
  format: "es" | "cjs";
  outDir: string;
  fileName: string;
  wasmNodePath: string;
  external: string[];
};

const targets: Record<string, LibTarget> = {
  web: {
    runtimeTarget: "web",
    format: "es",
    outDir: "dist/esm",
    fileName: "index.mjs",
    wasmNodePath: "",
    external: ["./wasm/plotive_wasm.js", "./wasm/plotive_wasm_bg.wasm"],
  },
  "node-cjs": {
    runtimeTarget: "node",
    format: "cjs",
    outDir: "dist/cjs",
    fileName: "index.cjs",
    wasmNodePath: "./wasm/plotive_wasm.js",
    external: ["node:module", "./wasm/plotive_wasm.js"],
  },
  "node-esm": {
    runtimeTarget: "node",
    format: "es",
    outDir: "dist/node-esm",
    fileName: "index.mjs",
    wasmNodePath: "../cjs/wasm/plotive_wasm.js",
    external: ["node:module", "../cjs/wasm/plotive_wasm.js"],
  },
};

export default defineConfig(({ mode }) => {
  const target = targets[mode];
  if (!target) {
    throw new Error(`Unknown build mode: ${mode}`);
  }

  return {
    define: {
      __PLOTIVE_RUNTIME_TARGET__: JSON.stringify(target.runtimeTarget),
      __PLOTIVE_WASM_NODE_PATH__: JSON.stringify(target.wasmNodePath),
    },
    build: {
      emptyOutDir: false,
      minify: false,
      target: target.runtimeTarget === "web" ? "esnext" : "node18",
      lib: {
        entry: "src/index.ts",
        formats: [target.format],
        fileName: () => target.fileName,
      },
      rollupOptions: {
        external: target.external,
        output: {
          exports: target.format === "cjs" ? "named" : undefined,
        },
      },
      outDir: target.outDir,
    },
  };
});
