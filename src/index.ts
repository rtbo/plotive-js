import init, { render_to_svg_string, render_to_png_data_url, set_panic_hook } from './wasm/plotive_wasm.js'
import { ThemeColor, ThemeFill, ThemeStroke } from "./style";
import { Series } from './series';
import { Annotation } from './annot';
import { Axis, TicksLocator } from './axis';
import { normalizeFig } from './norm.js';
import { createRuntime } from './runtime';

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

let initPromise: Promise<void> | null = null;

function initOnce(): Promise<void> {
    if (!initPromise) {
        initPromise = (async () => {
            try {
                await init();
                set_panic_hook();
            } catch (err) {
                initPromise = null;
                throw err;
            }
        })();
    }
    return initPromise;
}

const runtime = createRuntime<Figure>({
    init: initOnce,
    normalize: normalizeFig,
    renderToSvg: render_to_svg_string,
    renderToPng: render_to_png_data_url,
});

export const renderAsSvg = runtime.renderAsSvg;
export const renderToSvgString = runtime.renderToSvgString;
export const renderToImg = runtime.renderToImg;
export const renderToPngDataUrl = runtime.renderToPngDataUrl;
