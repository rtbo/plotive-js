import { createRequire } from "node:module";

type WasmNodeApi = {
  render_to_svg_string: (fig: unknown) => string;
  render_to_png_data_url: (fig: unknown) => string;
  set_panic_hook: () => void;
};

const require = createRequire(import.meta.url);
const wasmNode = require("../cjs/wasm/plotive_wasm.js") as WasmNodeApi;
wasmNode.set_panic_hook();

export async function renderAsSvg(elem: Element, fig: unknown): Promise<void> {
  const svg = wasmNode.render_to_svg_string(fig);
  elem.innerHTML = svg;
}

export async function renderToSvgString(fig: unknown): Promise<string> {
  return wasmNode.render_to_svg_string(fig);
}

export async function renderToImg(elem: HTMLImageElement, fig: unknown): Promise<void> {
  const data = wasmNode.render_to_png_data_url(fig);
  elem.src = data;
}

export async function renderToPngDataUrl(fig: unknown): Promise<string> {
  return wasmNode.render_to_png_data_url(fig);
}
