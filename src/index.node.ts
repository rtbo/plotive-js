type WasmNodeApi = {
  render_to_svg_string: (fig: unknown) => string;
  render_to_png_data_url: (fig: unknown) => string;
  set_panic_hook: () => void;
};

import { createRuntime } from "./runtime";

declare const require: (id: string) => unknown;
declare const __WASM_NODE_PATH__: string;

const wasmNode = require(__WASM_NODE_PATH__) as WasmNodeApi;
wasmNode.set_panic_hook();

const runtime = createRuntime<unknown>({
  init: async () => {},
  normalize: (fig) => fig,
  renderToSvg: wasmNode.render_to_svg_string,
  renderToPng: wasmNode.render_to_png_data_url,
});

export const renderAsSvg = runtime.renderAsSvg;
export const renderToSvgString = runtime.renderToSvgString;
export const renderToImg = runtime.renderToImg;
export const renderToPngDataUrl = runtime.renderToPngDataUrl;
