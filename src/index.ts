import init, { render_to_svg_string, render_to_png_data_url, set_panic_hook } from 'plotive-wasm'
import { ThemeFill, ThemeStroke } from "./style";
import { Series } from './series';
import { Annotation } from './annot';
import { Axis } from './axis';

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
    border?: ThemeStroke;
    columns?: number;
    margin?: number;
    padding?: Padding;
    spacing?: number | [number, number];
}

export type FigLegend = Legend<FigLegendPos>;
export type PlotLegend = Legend<PlotLegendPos>;



interface PlotBase {
    series: Series[];
    title?: string;
    subplot?: [number, number];
    legend?: PlotLegend;
    annotations?: Annotation[];
}

export type Plot = PlotBase & (
    {
        x_axis?: Axis,
        x_axes?: never,
    } | {
        x_axis?: never,
        x_axes?: Axis[];
    }
) & (
        {
            y_axis?: Axis,
            y_axes?: never,
        } | {
            y_axis?: never,
            y_axes?: Axis[];
        }
    );

interface FigureBase {
    size?: Size;
    title?: string;
    padding?: Padding;
    fill?: ThemeFill;
    legend?: FigLegend;
}

export type Figure = FigureBase & (
    {
        plot: Plot;
        plots?: never;
    } | {
        plot?: never;
        plots: Plot[];
    }
)

var initDone = false;

async function initOnce() {
    if (!initDone) {
        initDone = true;
        await init();
        set_panic_hook();
    }
}

export async function renderAsSvg(fig: Figure, elem: Element) {
    await initOnce();
    let svg = render_to_svg_string(fig);
    elem.innerHTML = svg;
}

export async function renderToImg(fig: Figure, elem: HTMLImageElement) {
    await initOnce();
    let data = render_to_png_data_url(fig);
    elem.src = data;
}
