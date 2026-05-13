import { Figure, Plot } from ".";
import { Axis, Ticks, TicksFormatterType, TicksLocator, TicksLocatorType } from "./axis";

export function normalizeFig(fig: Figure): Figure {
    let { plot, plots } = fig;
    if (!plot && !plots) {
        throw new Error("Must specify either 'plot' or 'plots'");
    }
    if (plot && plots) {
        throw new Error("Can't specify both 'plot' and 'plots'");
    }
    plots = plot ? [normalizePlot(plot)] : plots?.map(normalizePlot);
    return {
        ...fig,
        plots,
    };
}

function normalizePlot(plot: Plot): Plot {
    let {
        xAxis, xAxes, yAxis, yAxes
    } = plot;

    if (xAxis && xAxes) {
        throw new Error("Can't specify both 'xAxis' and 'xAxes'");
    }
    if (xAxis) {
        xAxes = [xAxis];
    }
    if (xAxes) {
        xAxes = xAxes.map((a) => normalizeAxis(a, "x"));
    }
    if (yAxis && yAxes) {
        throw new Error("Can't specify both 'yAxis' and 'yAxes'");
    }
    if (yAxis) {
        yAxes = [yAxis];
    }
    if (yAxes) {
        yAxes = yAxes.map((a) => normalizeAxis(a, "y"));
    }

    return {
        ...plot,
        xAxes,
        yAxes,
    }
}

function normalizeAxis(axis: Axis, or: "x" | "y"): Axis {
    let {
        side,
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

    if (ticks !== undefined) {
        ticks = normalizeTicks(ticks);
    }

    if (minorTicks !== undefined) {
        if (minorTicks === true) {
            minorTicks = { type: "auto" }
        }
    }

    if (grid === true) {
        grid = "default"; // assigned from rust
    }
    if (minorGrid === true) {
        minorGrid = "default";
    }

    return {
        ...axis,
        ticks,
        minorTicks,
        grid,
        minorGrid,
    };
}

function normalizeTicks(ticks: true | Ticks | TicksLocator | TicksFormatterType): Ticks {
    if (ticks === true) {
        ticks = {
            locator: { type: "auto" },
            formatter: { type: "auto" },
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
    } else if (Array.isArray(ticks)) {
        const locator = ticks;
        ticks = {
            locator,
            formatter: { type: "auto" }
        }
    }

    return ticks;
}