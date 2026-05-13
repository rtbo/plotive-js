import { ColorBar, ColorBarPos, Figure, Legend, Plot, PlotBorder, PlotBorderType } from ".";
import { Axis, Scale, ScaleType, Ticks, TicksFormatterType, TicksLocator, TicksLocatorType } from "./axis";
import { Color } from "./color";
import { AreaSeries, BarsSeries, HistogramSeries, LineSeries, ScatterSeries, Series } from "./series";
import { Fill, SeriesMarker, Stroke, ThemeColor, ThemeStroke } from "./style";

export function normalizeFig(fig: Figure): Figure {
    let { plot, plots, fill, legend } = fig;
    if (!plot && !plots) {
        throw new Error("Must specify either 'plot' or 'plots'");
    }
    if (plot && plots) {
        throw new Error("Can't specify both 'plot' and 'plots'");
    }
    if (plot) {
        plot = normalizePlot(plot);
    }
    if (plots) {
        plots = plots.map(normalizePlot);
    }
    if (fill !== undefined) {
        fill = normalizeFill(fill);
    }
    if (legend !== undefined) {
        legend = normalizeLegend(legend);
    }
    return {
        ...fig,
        plot,
        plots,
        fill,
        legend,
    };
}

function normalizePlot(plot: Plot): Plot {
    let {
        series, xAxis, xAxes, yAxis, yAxes, fill, border, legend, colorbar
    } = plot;

    if (Array.isArray(series)) {
        series = series.map(normalizeSeries);
    } else {
        series = [normalizeSeries(series)];
    }

    if (xAxis && xAxes) {
        throw new Error("Can't specify both 'xAxis' and 'xAxes'");
    }
    if (xAxis) {
        xAxis = normalizeAxis(xAxis, "x");
    }
    if (xAxes) {
        xAxes = xAxes.map((a) => normalizeAxis(a, "x"));
    }
    if (yAxis && yAxes) {
        throw new Error("Can't specify both 'yAxis' and 'yAxes'");
    }
    if (yAxis) {
        yAxis = normalizeAxis(yAxis, "y");
    }
    if (yAxes) {
        yAxes = yAxes.map((a) => normalizeAxis(a, "y"));
    }

    if (fill !== undefined) {
        fill = normalizeFill(fill);
    }
    if (border !== undefined && border !== null) {
        border = normalizeBorder(border);
    }
    if (legend !== undefined) {
        legend = normalizeLegend(legend);
    }
    if (colorbar !== undefined) {
        colorbar = normalizeColorBar(colorbar);
    }

    return {
        ...plot,
        series,
        xAxis,
        xAxes,
        yAxis,
        yAxes,
        fill,
        border,
        legend,
        colorbar,
    }
}

function normalizeLegend<Pos>(legend: Pos | Legend<Pos>): Legend<Pos> {
    if (typeof legend === 'object' && !Array.isArray(legend) && legend !== null && "pos" in legend) {
        return legend;
    }
    const pos = legend as Pos;
    return {
        pos,
    }
}

function normalizeBorder(border: PlotBorderType | PlotBorder | ThemeColor | ThemeStroke): PlotBorder {
    if (border === "box" || border === "axis" || border === "arrow") {
        return { type: border };
    }
    if (typeof border === 'object' && border !== null && "type" in border && ["box", "axis", "arrow"].includes(border.type)) {
        return border;
    }
    let stroke = border as ThemeColor | ThemeStroke;
    return {
        type: "box",
        stroke: normalizeStroke(stroke),
    };
}

function normalizeColorBar(colorbar: ColorBarPos | ColorBar): ColorBar {
    if (typeof colorbar === 'object' && !Array.isArray(colorbar) && colorbar !== null && "pos" in colorbar) {
        return colorbar;
    }
    const pos = colorbar as ColorBarPos;
    return {
        pos,
    }
}

function normalizeAxis(axis: Axis, or: "x" | "y"): Axis {
    let {
        side,
        scale,
        ticks,
        minorTicks,
        grid,
        minorGrid,
    } = axis;

    if (side && or === "x" && ["left", "right"].includes(side)) {
        throw new Error("X axis can only be on 'top' or 'bottom' side");
    }
    if (side && or === "y" && ["top", "bottom"].includes(side)) {
        throw new Error("Y axis can only be on 'left' or 'right' side");
    }

    if (scale !== undefined) {
        scale = normalizeScale(scale);
    }

    if (ticks === false) {
        ticks = undefined;
    } else if (ticks !== undefined) {
        ticks = normalizeTicks(ticks);
    }

    if (minorTicks === false) {
        minorTicks = undefined;
    } else if (minorTicks !== undefined) {
        minorTicks = normalizeMinorTicks(minorTicks);
    }

    if (grid === false) {
        grid = undefined;
    } else if (grid === true) {
        grid = "default"; // assigned from rust
    }

    if (minorGrid === false) {
        minorGrid = undefined;
    } else if (minorGrid === true) {
        minorGrid = "default"; // assigned from rust
    }

    return {
        ...axis,
        scale,
        ticks,
        minorTicks,
        grid,
        minorGrid,
    };
}

function normalizeScale(scale: ScaleType | Scale): Scale {
    if (typeof scale === 'string') {
        const type = scale as ScaleType;
        return {
            type
        };
    }

    return scale as Scale;
}

function normalizeTicks(ticks: true | TicksLocatorType | TicksLocator | TicksFormatterType | Ticks): Ticks {
    if (ticks === true) {
        ticks = {
            locator: { type: "auto" },
            formatter: { type: "auto" },
        }
    } else if (Array.isArray(ticks)) {
        const locator = ticks;
        ticks = {
            locator,
            formatter: { type: "auto" }
        }
    }
    else if (typeof ticks === 'string') {
        switch (ticks) {
            case "datetime":
            case "timedelta": {
                const type = ticks;
                ticks = {
                    locator: { type },
                    formatter: { type }
                }
                break;
            }
            case "percent":
            case "decimal":
            case "shared-auto": {
                const type = ticks;
                ticks = {
                    locator: { type: "auto" },
                    formatter: { type }
                }
                break;
            }
            case "auto":
            case "maxn":
            case "pimultiple":
            case "log": {
                const type = ticks as TicksLocatorType;
                ticks = {
                    locator: { type },
                    formatter: { type: "auto" },
                }
                break;
            }
        }

    } else if (typeof ticks === 'object' && "type" in ticks) {
        const locator = ticks;
        ticks = {
            locator,
            formatter: { type: "auto" }
        }
    }

    return ticks;
}

function normalizeMinorTicks(minorTicks: true | TicksLocatorType | TicksLocator): TicksLocator {
    if (minorTicks === true) {
        return { type: "auto" }
    }
    if (typeof minorTicks === 'string') {
        const type = minorTicks;
        return {
            type
        }
    }
    return minorTicks;
}

function normalizeSeriesMarker(marker: SeriesMarker): SeriesMarker {
    let { fill, stroke, color, fillOpacity } = marker;
    if (fill !== undefined && fill !== null) {
        fill = normalizeFill(fill);
    }
    if (stroke !== undefined && stroke !== null) {
        stroke = normalizeStroke(stroke);
    }

    if (color !== undefined) {
        if (fill === undefined) {
            fill = { color };
        } else if (fill !== null) {
            fill.color = color;
        }
        if (stroke === undefined) {
            stroke = { color };
        } else if (stroke !== null) {
            stroke.color = color;
        }
    }
    if (fillOpacity !== undefined) {
        if (fill === undefined) {
            fill = { color: "auto", opacity: fillOpacity };
        } else if (fill !== null) {
            fill.opacity = fillOpacity;
        }
    }
    return {
        ...marker,
        fill,
        stroke,
    }
}

function normalizeSeries(series: Series): Series {
    switch (series.type) {
        case "line":
            return normalizeLineSeries(series);
        case "scatter":
            return normalizeScatterSeries(series);
        case "area":
            return normalizeAreaSeries(series);
        case "hist":
            return normalizeHistogramSeries(series);
        case "bars":
            return normalizeBarsSeries(series);
        default:
            throw new Error(`Unknown series type: ${(series as any).type}`);
    }
}

function normalizeLineSeries(series: LineSeries): LineSeries {
    let { stroke } = series;
    if (stroke !== undefined) {
        stroke = normalizeStroke(stroke);
    } else {
        stroke = {
            color: "auto"
        }
    }
    return {
        ...series,
        stroke,
    };
}

function normalizeScatterSeries(series: ScatterSeries): ScatterSeries {
    let { marker } = series;
    if (marker !== undefined) {
        marker = normalizeSeriesMarker(marker);
    } else {
        marker = {};
    }
    return {
        ...series,
        marker,
    };
}

function normalizeAreaSeries(series: AreaSeries): AreaSeries {
    let { fill, y1Stroke, y2Stroke } = series;
    if (fill !== undefined) {
        fill = normalizeFill(fill);
    }
    if (y1Stroke !== undefined) {
        y1Stroke = normalizeStroke(y1Stroke);
    }
    if (y2Stroke !== undefined) {
        y2Stroke = normalizeStroke(y2Stroke);
    }
    return {
        ...series,
        fill,
        y1Stroke,
        y2Stroke,
    };
}

function normalizeHistogramSeries(series: HistogramSeries): HistogramSeries {
    let { fill, stroke } = series;
    if (fill !== undefined) {
        fill = normalizeFill(fill);
    }
    if (stroke !== undefined) {
        stroke = normalizeStroke(stroke);
    }
    return {
        ...series,
        fill,
        stroke,
    };
}

function normalizeBarsSeries(series: BarsSeries): BarsSeries {
    let { fill, stroke } = series;
    if (fill !== undefined) {
        fill = normalizeFill(fill);
    }
    if (stroke !== undefined) {
        stroke = normalizeStroke(stroke);
    }
    if (series.position !== undefined && Array.isArray(series.position)) {
        const offset = series.position[0];
        const width = series.position[1];
        series.position = {
            offset,
            width,
        };
    }
    return {
        ...series,
        fill,
        stroke,
    };
}

function normalizeStroke<C = Color>(stroke: C | Stroke<C>): Stroke<C> {
    if (typeof stroke === 'object' && !Array.isArray(stroke) && stroke !== null && "color" in stroke) {
        return stroke;
    }
    const color = stroke
    return {
        color,
    }
}

function normalizeFill<C = Color>(fill: C | Fill<C>): Fill<C> {
    if (typeof fill === 'object' && !Array.isArray(fill) && fill !== null && "color" in fill) {
        return fill;
    }
    const color = fill
    return {
        color,
    }
}
