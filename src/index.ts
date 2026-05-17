import { BuiltinStyleName, Style, ThemeColor, ThemeFill, ThemeStroke } from "./style";
import { Series } from './series';
import { Annotation } from './annot';
import { Axis, TicksLocator } from './axis';
import { normalizeFig } from './norm.js';
import { getWasmApi } from "./wasm-api";

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

export async function renderToSvgString(fig: Figure, style?: BuiltinStyleName | Style): Promise<string> {
    const normalized = normalizeFig(fig);
    const wasm = await getWasmApi();
    return wasm.render_to_svg_string(normalized, style);
}

export async function renderToPngDataUrl(fig: Figure, style?: BuiltinStyleName | Style): Promise<string> {
    const normalized = normalizeFig(fig);
    const wasm = await getWasmApi();
    return wasm.render_to_png_data_url(normalized, style);
}

export async function renderAsSvg(elem: Element, fig: Figure, style?: BuiltinStyleName | Style): Promise<void> {
    const svg = await renderToSvgString(fig, style);
    elem.innerHTML = svg;
}

export async function renderToImg(elem: HTMLImageElement, fig: Figure, style?: BuiltinStyleName | Style): Promise<void> {
    const dataUrl = await renderToPngDataUrl(fig, style);
    elem.src = dataUrl;
}
