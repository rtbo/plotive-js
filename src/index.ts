import { BuiltinStyleName, Style, ThemeColor, ThemeFill, ThemeStroke } from "./style";
import { Series } from './series';
import { Annotation } from './annot';
import { Axis, TicksLocator } from './axis';
import { getWasmApi } from "./wasm-api";

export { BUILTIN_STYLES } from "./style";
export type { LerpMethod, ColorMap, BuiltinCmap } from "./cmap";
export type { Series } from "./series";
export type { BuiltinStyleName, Style, Theme, Palette } from "./style";

export type FontWeight = "thin" | "extra-light" | "light" | "normal" | "medium" | "semi-bold" | "bold" | "extra-bold" | "black" | number;

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

export type Text = string | string[] | [string, Record<string, TextProps>] | {
    fmt: string;
    classes: Record<string, TextProps>;
};

export type Size = [number, number] | { width: number; height: number };

export type Padding = number |
    [number, number] | { hor: number, ver: number } |
    [number, number, number, number] | { top: number, right: number, bottom: number, left: number };

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

export async function renderToSvgString(fig: Figure, style?: BuiltinStyleName | Style): Promise<string> {
    if (typeof document === "undefined" || typeof XMLSerializer === "undefined") {
        throw new Error("renderToSvgString requires a DOM environment.");
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    await renderToSvg(svg, fig, style);
    return new XMLSerializer().serializeToString(svg);
}

export async function renderToPngDataUrl(fig: Figure, style?: BuiltinStyleName | Style): Promise<string> {
    //const normalized = normalizeFig(fig);
    const wasm = await getWasmApi();
    return wasm.render_to_png_data_url(fig, style);
}

export async function renderAsSvg(elem: Element, fig: Figure, style?: BuiltinStyleName | Style): Promise<void> {
    const svg = await renderToSvgString(fig, style);
    elem.innerHTML = svg;
}

export async function renderToSvg(elem: SVGElement, fig: Figure, style?: BuiltinStyleName | Style): Promise<void> {
    //const normalized = normalizeFig(fig);
    const wasm = await getWasmApi();
    await wasm.render_to_svg(fig, elem, style);
}

export async function renderToImg(elem: HTMLImageElement, fig: Figure, style?: BuiltinStyleName | Style): Promise<void> {
    const dataUrl = await renderToPngDataUrl(fig, style);
    elem.src = dataUrl;
}

export async function renderToCanvas(canvas: HTMLCanvasElement, fig: Figure, style?: BuiltinStyleName | Style): Promise<void> {
    console.log("will render to canvas");
    console.log("fig:", fig);
    // const normalized = normalizeFig(fig);
    const wasm = await getWasmApi();
    await wasm.render_to_canvas(fig, canvas, style);
}
