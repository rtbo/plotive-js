import { Figure } from "./index.js";

declare const __PLOTIVE_RUNTIME_TARGET__: "web" | "node";
declare const __PLOTIVE_WASM_NODE_PATH__: string;

export type WasmApi = {
    render_to_svg_string: (fig: Figure) => string;
    render_to_png_data_url: (fig: Figure) => string;
    set_panic_hook: () => void;
};

let wasmApiPromise: Promise<WasmApi> | null = null;

export async function getWasmApi(): Promise<WasmApi> {
    if (!wasmApiPromise) {
        wasmApiPromise = loadWasmApi().catch((err) => {
            wasmApiPromise = null;
            throw err;
        });
    }
    return wasmApiPromise;
}

type WasmWebModule = WasmApi & {
    default: () => Promise<unknown>;
};

async function loadWasmApi(): Promise<WasmApi> {
    if (__PLOTIVE_RUNTIME_TARGET__ === "node") {
        const { createRequire } = await import("node:module");
        const require = createRequire(import.meta.url);
        const wasmNode = require(__PLOTIVE_WASM_NODE_PATH__) as WasmApi;
        wasmNode.set_panic_hook();
        return wasmNode;
    }

    const wasmWeb = (await import("./wasm/plotive_wasm.js")) as WasmWebModule;
    await wasmWeb.default();
    wasmWeb.set_panic_hook();
    return wasmWeb;
}
