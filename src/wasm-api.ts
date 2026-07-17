import { Figure, Params } from "./index.js";

declare const __PLOTIVE_RUNTIME_TARGET__: "web" | "node";
declare const __PLOTIVE_WASM_NODE_PATH__: string;

export type WasmApi = {
    render_to_png_data_url: (fig: Figure, params?: Params) => string;
    render_to_png_bytes: (fig: Figure, params?: Params) => Uint8Array;
    render_to_canvas: (
        fig: Figure,
        canvas: HTMLCanvasElement,
        params?: Params,
    ) => void;
    render_to_svg: (fig: Figure, svg: SVGElement, params?: Params) => void;
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
        let wasmNode: WasmApi;
        try {
            wasmNode = require(__PLOTIVE_WASM_NODE_PATH__) as WasmApi;
        } catch (error) {
            if (
                error instanceof Error &&
                "code" in error &&
                (error as { code?: string }).code === "MODULE_NOT_FOUND"
            ) {
                throw new Error(
                    `Unable to load Node wasm backend at "${__PLOTIVE_WASM_NODE_PATH__}". ` +
                        'Build Node wasm artifacts first with "pnpm run build:node" or "pnpm run build:prod".',
                );
            }
            throw error;
        }
        wasmNode.set_panic_hook();
        return wasmNode;
    }

    const wasmWeb = (await import("./wasm/plotive_wasm.js")) as WasmWebModule;
    await wasmWeb.default();
    wasmWeb.set_panic_hook();
    return wasmWeb;
}
