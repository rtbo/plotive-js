import * as axis from "./axis";
import { ColorMap } from "./cmap";
import {
    Marker,
    SeriesColor,
    SeriesFill,
    SeriesMarker,
    SeriesStroke,
} from "./style";

export type DataCol =
    string | number[] | string[];

interface SeriesBase {
    name?: string;
    xAxis?: axis.Ref;
    yAxis?: axis.Ref;
}

export type Interpolation =
    | "default"
    | "linear"
    | "step-early"
    | "step-middle"
    | "step-late"
    | "spline";

export type LineSeries = SeriesBase & {
    type: "line";
    x: DataCol;
    y: DataCol;
    stroke?: SeriesColor | SeriesStroke;
    interp?: Interpolation;
    marker?: Marker;
    style?: string;
};

export type ScatterSeries = SeriesBase & {
    type: "scatter";
    x: DataCol;
    y: DataCol;
    sizes?: DataCol;
    colors?: DataCol;
    cmap?: ColorMap;
    marker?: SeriesMarker;
    colorCatsToLegend?: boolean;
};

export type AreaSeries = SeriesBase & {
    type: "area";
    x: DataCol;
    y1: DataCol;
    y2?: number | DataCol;
    fill?: SeriesFill;
    y1Stroke?: SeriesStroke;
    y2Stroke?: SeriesStroke;
    y1Interp?: Interpolation;
    y2Interp?: Interpolation;
};

export type HistogramSeries = SeriesBase & {
    type: "hist";
    x: DataCol;
    fill?: SeriesFill;
    stroke?: SeriesStroke;
    bins?: number;
    density?: boolean;
};

export interface BarsPosition {
    offset?: number;
    width?: number;
}

export type BarsSeries = SeriesBase & {
    type: "bars";
    x: DataCol;
    y: DataCol;
    fill?: SeriesFill;
    stroke?: SeriesStroke;
    position?: BarsPosition | [number, number];
};

export type Series =
    LineSeries | ScatterSeries | AreaSeries | HistogramSeries | BarsSeries;
