import init, { render_figure, set_panic_hook } from 'plotive-wasm'
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

export async function render(fig: Figure, elem: Element) {
    if (!initDone) {
        initDone = true;
        await init();
        set_panic_hook();
    }
    let markup = render_figure(fig);
    elem.innerHTML = markup;
}
