import {
    BuiltinStyleName,
    Style,
    ThemeColor,
    ThemeFill,
    ThemeStroke,
} from "./style";
import { Series } from "./series";
import { Annotation } from "./annot";
import { Axis, TicksLocator } from "./axis";
import { getWasmApi } from "./wasm-api";

export { BUILTIN_STYLES } from "./style";
export type { LerpMethod, ColorMap, BuiltinCmap } from "./cmap";
export type { Series } from "./series";
export type { BuiltinStyleName, Style, Theme, Palette } from "./style";

export type FontWeight =
    | "thin"
    | "extra-light"
    | "light"
    | "normal"
    | "medium"
    | "semi-bold"
    | "bold"
    | "extra-bold"
    | "black"
    | number;

export interface TextProps {
    family?: string | string[];
    weight?: FontWeight | number;
    width?: string | number;
    style?: string;
    size?: number;
    color?: ThemeFill;
    outline?: ThemeStroke;
    underline?: boolean;
    strikeout?: boolean;
}

export type Text =
    | string
    | string[]
    | [...string[], Record<string, TextProps>]
    | {
          fmt: string | string[];
          props: Record<string, TextProps>;
      };

export type Size = [number, number] | { width: number; height: number };

export type Padding =
    | number
    | [number, number]
    | { hor: number; ver: number }
    | [number, number, number, number]
    | { top: number; right: number; bottom: number; left: number };

export type FigLegendPos = "top" | "right" | "bottom" | "left";

export type PlotLegendPos =
    | "out-top"
    | "out-right"
    | "out-bottom"
    | "out-left"
    | "in-top-left"
    | "in-top"
    | "in-top-right"
    | "in-right"
    | "in-bottom-right"
    | "in-bottom"
    | "in-bottom-left"
    | "in-left";

export interface Legend<Pos> {
    pos?: Pos;
    fill?: ThemeFill;
    border?: ThemeStroke;
    font?: TextProps;
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
    title?: Text;
    border?: ThemeStroke | null;
    ticks?: TicksLocator;
    margin?: number;
}

export interface Plot {
    series: Series | Series[];
    title?: Text;
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
    title?: Text;
    plot?: Plot;
    plots?: Plot[];
    space?: number;

    padding?: Padding;
    fill?: ThemeColor | ThemeFill;
    legend?: FigLegendPos | FigLegend;
}

export function figureSize(fig: Figure): [number, number] {
    if (fig.size) {
        if (Array.isArray(fig.size)) {
            return fig.size;
        } else {
            return [fig.size.width, fig.size.height];
        }
    } else {
        return [800, 600];
    }
}

export type FontBinary = Uint8Array | ArrayBuffer | ArrayBufferView;
export type FontSource = FontBinary | string | URL | Blob | File;

export interface Params {
    style?: BuiltinStyleName | Style;
    fontdb?: FontSource[];
}

async function loadFontDb(fontdb: FontSource[]): Promise<FontBinary[]> {
    const loadedFonts: FontBinary[] = [];
    for (const source of fontdb) {
        if (source instanceof ArrayBuffer || ArrayBuffer.isView(source)) {
            loadedFonts.push(source);
        } else if (typeof source === "string" || source instanceof URL) {
            const response = await fetch(source.toString());
            if (!response.ok) {
                throw new Error(
                    `Failed to load font "${source}" from "${source}": ${response.statusText}`,
                );
            }
            loadedFonts.push(await response.arrayBuffer());
        } else if (source instanceof Blob) {
            loadedFonts.push(await source.arrayBuffer());
        } else {
            throw new Error(`Unsupported font source type for "${source}"`);
        }
    }
    return loadedFonts;
}

export async function renderToSvgString(
    fig: Figure,
    params?: Params,
): Promise<string> {
    if (
        typeof document === "undefined" ||
        typeof XMLSerializer === "undefined"
    ) {
        throw new Error("renderToSvgString requires a DOM environment.");
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (params?.fontdb) {
        const loadedFonts = await loadFontDb(params.fontdb);
        params.fontdb = loadedFonts;
    }
    await renderToSvg(svg, fig, params);
    return new XMLSerializer().serializeToString(svg);
}

export async function renderToPngDataUrl(
    fig: Figure,
    params?: Params,
): Promise<string> {
    const wasm = await getWasmApi();
    if (params?.fontdb) {
        const loadedFonts = await loadFontDb(params.fontdb);
        params.fontdb = loadedFonts;
    }
    return wasm.render_to_png_data_url(fig, params);
}

export async function renderToPngBytes(
    fig: Figure,
    params?: Params,
): Promise<Uint8Array> {
    const wasm = await getWasmApi();
    if (params?.fontdb) {
        const loadedFonts = await loadFontDb(params.fontdb);
        params.fontdb = loadedFonts;
    }
    return wasm.render_to_png_bytes(fig, params);
}

export async function renderAsSvg(
    elem: Element,
    fig: Figure,
    params?: Params,
): Promise<void> {
    const svg = await renderToSvgString(fig, params);
    elem.innerHTML = svg;
}

export async function renderToSvg(
    elem: SVGElement,
    fig: Figure,
    params?: Params,
): Promise<void> {
    const wasm = await getWasmApi();
    if (params?.fontdb) {
        const loadedFonts = await loadFontDb(params.fontdb);
        params.fontdb = loadedFonts;
    }
    await wasm.render_to_svg(fig, elem, params);
}

export async function renderToImg(
    elem: HTMLImageElement,
    fig: Figure,
    params?: Params,
): Promise<void> {
    const dataUrl = await renderToPngDataUrl(fig, params);
    elem.src = dataUrl;
}

export async function renderToCanvas(
    canvas: HTMLCanvasElement,
    fig: Figure,
    params?: Params,
): Promise<void> {
    const wasm = await getWasmApi();
    if (params?.fontdb) {
        const loadedFonts = await loadFontDb(params.fontdb);
        params.fontdb = loadedFonts;
    }
    await wasm.render_to_canvas(fig, canvas, params);
}
