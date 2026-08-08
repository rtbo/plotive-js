import {
    BuiltinStyleName,
    Style,
    ThemeColor,
    ThemeFill,
    ThemeStroke,
} from "./style";
import { Series } from "./series";
import type { DataCol } from "./series";
import { Annotation } from "./annot";
import { Axis, TicksLocator } from "./axis";
import { getWasmApi } from "./wasm-api";

export { BUILTIN_STYLES } from "./style";
export type { LerpMethod, ColorMap, BuiltinLerpCmap, LiteralColorMap, CatColorMap } from "./cmap";
export type { DataCol, Series } from "./series";
export type { Axis } from "./axis";
export type { Annotation } from "./annot";
export type { Color, Css4Color, XkcdColor } from "./color";
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

/**
 * Properties for text formatting. 
 * All properties are optional, and if not specified, default values will be used.
 */
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

/**
 * A `Text` object can be a simple string, an array of strings, or a more complex structure that allows for formatting.
 * 
 * A simple string will be considered as plain text with formatting inheriting from context.
 * All other constructs will be parsed as rich text with possibility to customize formatting.
 * Examples for figure title:
 * 
 * ```ts
 * {
 *     title: "Plain Text Title",
 * }
 * ```
 *
 * ```ts
 * {
 *     title: ["Rich [bold]Text[/bold] Title"],
 * }
 * ```
 * 
 * ```ts
 * {
 *     title: ["Line 1", "Line 2"],
 * }
 * ```
 */
export type Text =
    | string
    | string[]
    | [...string[], Record<string, TextProps>]
    | {
          fmt: string | string[];
          props: Record<string, TextProps>;
      };

/**
 * A `Size` object defines the size of a figure.
 */
export type Size = [number, number] | { width: number; height: number };

/** 
 * A `Padding` object defines the padding around a figure or legend.
 * 
 * A single number applies the same padding to all sides.
 * Two numbers apply horizontal and vertical padding respectively.
 * An object with `hor` and `ver` properties allows for more explicit horizontal and vertical padding.
 * Four numbers apply padding to top, right, bottom, and left respectively.
 * An object with `top`, `right`, `bottom`, and `left` properties allows for explicit padding on each side.
 */
export type Padding =
    | number
    | [number, number]
    | { hor: number; ver: number }
    | [number, number, number, number]
    | { top: number; right: number; bottom: number; left: number };

/** The position of the figure legend. */
export type FigLegendPos = "top" | "right" | "bottom" | "left";

/** The position of the plot legend. */
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

/**
 * A `Legend` object defines the properties of a legend.
 * 
 * The legend can either be attached to a figure or to a specific plot.
 * Legend items are populated automatically based on the series in the figure or plot.
 * To include a series in the legend, set the `name` property of the series.
 */
export interface Legend<Pos> {
    pos?: Pos;
    fill?: ThemeFill;
    border?: ThemeStroke;
    font?: TextProps;
    /** 
     * The number of columns in the legend. If not specified,
     * the legend will automatically determine the number of columns
     * based on the number of items and available space.
     */
    columns?: number;
    /**
     * The padding between the legend border and the legend items. 
     * If not specified, a default is used.
     */
    padding?: Padding;
    /**
     * The margin around the edge of the legend.
     */
    margin?: number;
    /**
     * The spacing between legend items. Can be a single number for uniform spacing, or a tuple of two numbers for horizontal and vertical spacing respectively.
     * If not specified, a default is used.
     */
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

/**
 * A `PlotBorder` object defines the properties of a plot border.
 * 
 * The border can be of type "box", "axis", or "arrow". Each type has its own properties.
 * The `stroke` property defines the color and style of the border.
 * The `size` property is only applicable for "arrow" type borders and defines the size of the arrow.
 * The `overflow` property is only applicable for "arrow" type borders and defines how much the arrow can overflow outside the plot area.
 */
export type PlotBorder = BoxPlotBorder | AxisPlotBorder | ArrowPlotBorder;

/** The position of the colorbar relative to the plot it is attached to */
export type ColorBarPos = "auto" | "left" | "right" | "top" | "bottom";

/**
 * A `ColorBar` is a visual representation of the color mapping used in a plot.
 * 
 * It is added to a plot by setting the `colorbar` property of the plot.
 */
export interface ColorBar {
    /** Position of the colorbar relative to the plot */
    pos?: ColorBarPos;
    /** Width of the colorbar in figure units */
    width?: number;
    /** The title attached to the colorbar */
    title?: Text;
    /** The border of the colorbar. Defaults to a solid line of foreground color.
     * Can be a ThemeStroke object or null. */
    border?: ThemeStroke | null;
    /** The locator object for the tick marks on the colorbar */
    ticks?: TicksLocator;
    /** The margin between the colorbar and the plot */
    margin?: number;
}

/**
 * A `Plot` object defines the properties of a plot within a figure.
 * 
 * A plot can contain one or more series, and can have its own title, axes, fill, border, insets, subplot position, legend, colorbar, and annotations.
 */
export interface Plot {
    /** The data series to be plotted. Required */
    series: Series | Series[];
    /** The title of the plot */
    title?: Text;
    /** The x-axis of the plot. Cannot be used together with `xAxes` */
    xAxis?: Axis;
    /** The x-axes of the plot. Cannot be used together with `xAxis` */
    xAxes?: Axis[];
    /** The y-axis of the plot. Cannot be used together with `yAxes` */
    yAxis?: Axis;
    /** The y-axes of the plot. Cannot be used together with `yAxis` */
    yAxes?: Axis[];
    /** The fill of the plot */
    fill?: ThemeColor | ThemeFill;
    /** 
     * The border of the plot. 
     * Using `ThemeColor` or `ThemeStroke` are shorthand for `BoxPlotBorder` and will result in a solid line around the plot 
     */
    border?: PlotBorderType | PlotBorder | ThemeColor | ThemeStroke | null;
    /**
     * The insets of the plot, which define the padding between the edge of the plot area and the data series.
     * This is meaningful if the axes are configured with automatic bounds.
     */
    insets?: "auto" | [number, number] | null;
    /**
     * The subplot position of the plot within the figure.
     * This is a tuple of two numbers, where the first number is the row index and the second number is the column index.
     * The subplot position is zero-indexed, so [0, 0] is the top-left subplot.
     * When not specified, the plots are arranged in a single column, each below the previous one.
     * 
     * Note: Subplot positions are only meaningful if there are multiple plots in a figure. 
     * If there is only one plot, it will occupy the entire figure area regardless of the subplot position.
     */
    subplot?: [number, number];
    /** The legend of the plot. */
    legend?: PlotLegendPos | PlotLegend;
    /** The colorbar of the plot */
    colorbar?: ColorBarPos | ColorBar;
    /** Annotations attached to the plot */
    annotations?: Annotation[];
}

/**
 * The overall structure of a figure, which can contain multiple plots, a title, and other properties.
 * 
 * This is the main object that is passed to the rendering functions to generate visualizations.
 */
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

/**
 * Extract the figure size from the figure object. If the size is not specified, a default size of [800, 600] is returned.
 */
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

/**
 * Font binary data, which can be a Uint8Array, ArrayBuffer, or ArrayBufferView.
 * This is the content of a font file in binary format, which can be used to load custom fonts for rendering text in figures.
 */
export type FontBinary = Uint8Array | ArrayBuffer | ArrayBufferView;
/**
 * A font source can be a FontBinary, a string (URL or path), a URL object, a Blob, or a File.
 * This allows for flexibility in specifying fonts, whether they are loaded from local files, remote URLs, or provided as binary data.
 */
export type FontSource = FontBinary | string | URL | Blob | File;

/**
 * Parameters for rendering functions, which can include a style and a font database.
 * The `style` can be a built-in style name or a custom style object.
 * The `fontdb` is an array of font sources that can be used to load custom fonts for rendering text in figures.
 * `plotive` is bundled with the `Noto Sans`, `Noto Serif`, and `Noto Mono` fonts, which are used by default if no custom fonts are provided.
 */
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

/**
 * Render a figure to an SVG string. 
 * 
 * Will use the DOM API if available, otherwise will use a custom implementation that does not require a DOM. 
 * This allows for rendering in both browser and non-browser environments.
 */
export async function renderToSvgString(
    fig: Figure,
    params?: Params,
): Promise<string> {
    if (typeof document !== "undefined" && typeof XMLSerializer !== "undefined") {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        await renderToSvg(svg, fig, params);
        return new XMLSerializer().serializeToString(svg);
    } else {
        const wasm = await getWasmApi();
        if (params?.fontdb) {
            const loadedFonts = await loadFontDb(params.fontdb);
            params.fontdb = loadedFonts;
        }
        return wasm.render_to_svg_string(fig, params); 
    }
}

/**
 * Renders a figure as an SVG element and replaces the children of the given element with the rendered SVG.
 * 
 * This function requires a DOM environment to create and manipulate the SVG element.
 */
export async function renderAsSvg(
    elem: Element,
    fig: Figure,
    params?: Params,
): Promise<void> {
    if (typeof document === "undefined") {
        throw new Error("renderAsSvg requires a DOM environment.");
    }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    await renderToSvg(svg, fig, params);
    elem.replaceChildren(svg);
}

/**
 * Renders a figure to an SVG element.
 * 
 * This function requires a DOM environment to create and manipulate the SVG element.
 */
export async function renderToSvg(
    elem: SVGElement,
    fig: Figure,
    params?: Params,
): Promise<void> {
    if (typeof document === "undefined") {
        throw new Error("renderToSvg requires a DOM environment.");
    }
    const wasm = await getWasmApi();
    if (params?.fontdb) {
        const loadedFonts = await loadFontDb(params.fontdb);
        params.fontdb = loadedFonts;
    }
    await wasm.render_to_svg(fig, elem, params);
}

/**
 * Renders a figure to PNG bytes in the form of a data URL.
 */
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

/**
 * Renders a figure to PNG bytes.
 * 
 * @param fig The figure to render.
 * @param params Optional rendering parameters, including style and font database.
 * @returns A promise that resolves to a Uint8Array containing the PNG bytes of the rendered figure.
 */
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

/**
 * Renders a figure to an HTML image element.
 *
 * @param elem The HTML image element to render the figure into.
 * @param fig The figure to render.
 * @param params Optional rendering parameters.
 */
export async function renderToImg(
    elem: HTMLImageElement,
    fig: Figure,
    params?: Params,
): Promise<void> {
    const dataUrl = await renderToPngDataUrl(fig, params);
    elem.src = dataUrl;
}

/**
 * Renders a figure to a canvas element.
 * 
 * @param canvas The canvas element to render the figure into.
 * @param fig The figure to render.
 * @param params Optional rendering parameters.
 */
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

/**
 * 
 * Utility to parse a CSV string into a data source usable with plotive.
 * 
 * @param csv The CSV string to parse. The first row is assumed to be the header, and subsequent rows are the data.
 * English locale is assumed for number parsing (i.e. decimal point is '.').
 * @returns A promise that resolves to a record mapping column names to data columns.
 * Each data column is an array of values, which can be strings, numbers, or Date objects.
 */
export async function parseCsv(csv: string): Promise<Record<string, DataCol>> {
    const wasm = await getWasmApi();
    return wasm.parse_csv(csv);
}
