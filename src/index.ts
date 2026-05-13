import init, { render_to_svg_string, render_to_png_data_url, set_panic_hook } from './wasm/plotive_wasm.js'
import { ThemeFill, ThemeStroke } from "./style";
import { Series } from './series';
import { Annotation } from './annot';
import { Axis, TicksLocator } from './axis';
import { normalizeFig } from './norm.js';

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

export type PlotBorder = BoxPlotBorder | AxisPlotBorder | ArrowPlotBorder;

export type ColorBarPos = "auto" | "left" | "right" | "top" | "bottom";

export interface ColorBar {
    pos?: ColorBarPos;
    width?: number;
    title?: string;
    border?: ThemeStroke;
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
    fill?: ThemeFill;
    border?: PlotBorder | string | ThemeStroke;
    insets?: [number, number] | null;
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

    padding?: Padding;
    fill?: ThemeFill;
    legend?: FigLegend;
}

var initDone = false;

async function initOnce() {
    if (!initDone) {
        initDone = true;
        await init();
        set_panic_hook();
    }
}

export async function renderAsSvg(elem: Element, fig: Figure) {
    const prom = initOnce();
    fig = normalizeFig(fig);
    await prom;

    let svg = render_to_svg_string(fig);
    elem.innerHTML = svg;
}

export async function renderToSvgString(fig: Figure): Promise<string> {
    const prom = initOnce();
    fig = normalizeFig(fig);
    await prom;
    return render_to_svg_string(fig);
}

export async function renderToImg(elem: HTMLImageElement, fig: Figure) {
    const prom = initOnce();
    fig = normalizeFig(fig);
    await prom;
    let data = render_to_png_data_url(fig);
    elem.src = data;
}

export async function renderToPngDataUrl(fig: Figure): Promise<string> {
    const prom = initOnce();
    fig = normalizeFig(fig);
    await prom;
    return render_to_png_data_url(fig);
}
