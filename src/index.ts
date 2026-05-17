import { ThemeColor, ThemeFill, ThemeStroke } from "./style";
import { Series } from './series';
import { Annotation } from './annot';
import { Axis, TicksLocator } from './axis';
import { normalizeFig } from './norm.js';

declare const __PLOTIVE_RUNTIME_TARGET__: "web" | "node";
declare const __PLOTIVE_WASM_NODE_PATH__: string;

export type Size = [number, number];

export type Padding = number | [number, number] | [number, number, number, number];

export type FigLegendPos = "top" | "right" | "bottom" | "left";

export type PlotLegendPos =
    "out-top" |
    "out-right" |
    "out-bottom" |
    "out-left" |
    "in-top-left" |
    "in-top" |
    "in-top-right" |
    "in-right" |
    "in-bottom-right" |
    "in-bottom" |
    "in-bottom-left" |
    "in-left";

export interface Legend<Pos> {
    pos?: Pos;
    fill?: ThemeFill;
    border?: ThemeStroke;
    columns?: number;
    padding?: Padding;
    margin?: number;
    spacing?: number | [number, number];
}

// Runtime accepts either a full legend object or a shorthand position string.
export type FigLegend = Legend<FigLegendPos>;
export type PlotLegend = Legend<PlotLegendPos>;

export interface BoxPlotBorder {
    type: "box";
    stroke?: ThemeStroke;
}

export interface AxisPlotBorder {
    type: "axis";
    stroke?: ThemeStroke;
}

export interface ArrowPlotBorder {
    type: "arrow";
    stroke?: ThemeStroke;
    size?: number;
    overflow?: number;
}

export type PlotBorderType = "box" | "axis" | "arrow";
export type PlotBorder = BoxPlotBorder | AxisPlotBorder | ArrowPlotBorder;

export type ColorBarPos = "auto" | "left" | "right" | "top" | "bottom";

export interface ColorBar {
    pos?: ColorBarPos;
    width?: number;
    title?: string;
    border?: ThemeStroke | null;
    ticks?: TicksLocator;
    margin?: number;
}

export interface Plot {
    series: Series | Series[];
    title?: string;
    xAxis?: Axis;
    xAxes?: Axis[];
    yAxis?: Axis;
    yAxes?: Axis[];
    fill?: ThemeColor | ThemeFill;
    border?: PlotBorderType | PlotBorder | ThemeColor | ThemeStroke | null;
    insets?: "auto" | [number, number] | null;
    subplot?: [number, number];
    legend?: PlotLegendPos | PlotLegend;
    colorbar?: ColorBarPos | ColorBar;
    annotations?: Annotation[];
}

export interface Figure {
    size?: Size;
    title?: string;
    plot?: Plot;
    plots?: Plot[];
    space?: number;

    padding?: Padding;
    fill?: ThemeColor | ThemeFill;
    legend?: FigLegendPos | FigLegend;
}

type WasmApi = {
    render_to_svg_string: (fig: Figure) => string;
    render_to_png_data_url: (fig: Figure) => string;
    set_panic_hook: () => void;
};

type WasmWebModule = WasmApi & {
    default: () => Promise<unknown>;
};

let wasmApiPromise: Promise<WasmApi> | null = null;

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

let initPromise: Promise<void> | null = null;

function initOnce(): Promise<void> {
    if (!initPromise) {
        initPromise = (async () => {
            try {
                wasmApiPromise = loadWasmApi();
                await wasmApiPromise;
            } catch (err) {
                initPromise = null;
                wasmApiPromise = null;
                throw err;
            }
        })();
    }
    return initPromise;
}

async function getWasmApi(): Promise<WasmApi> {
    await initOnce();
    if (!wasmApiPromise) {
        throw new Error("WASM runtime is not initialized");
    }
    return wasmApiPromise;
}

export async function renderToSvgString(fig: Figure): Promise<string> {
    const normalized = normalizeFig(fig);
    const wasm = await getWasmApi();
    return wasm.render_to_svg_string(normalized);
}

export async function renderToPngDataUrl(fig: Figure): Promise<string> {
    const normalized = normalizeFig(fig);
    const wasm = await getWasmApi();
    return wasm.render_to_png_data_url(normalized);
}

export async function renderAsSvg(elem: Element, fig: Figure): Promise<void> {
    const svg = await renderToSvgString(fig);
    elem.innerHTML = svg;
}

export async function renderToImg(elem: HTMLImageElement, fig: Figure): Promise<void> {
    const dataUrl = await renderToPngDataUrl(fig);
    elem.src = dataUrl;
}
