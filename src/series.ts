
import * as axis from "./axis";
import { ColorMap } from "./cmap";
import { Marker, SeriesFill, SeriesMarker, SeriesStroke } from "./style";

export type DataCol =
    string | Float32Array | Float64Array | number[] | string[];

interface SeriesBase {
    name?: string;
    xAxis?: axis.Ref;
    yAxis?: axis.Ref;
}

export type Interpolation =
    "default" |
    "linear" |
    "step-early" |
    "step-middle" |
    "step-late" |
    "spline";

export type LineSeries = SeriesBase & {
    type: "line";
    x: DataCol;
    y: DataCol;
    stroke?: SeriesStroke;
    interpolation?: Interpolation;
    marker?: Marker;
    style?: string;
}

export type ScatterSeries = SeriesBase & {
    type: "scatter";
    x: DataCol;
    y: DataCol;
    sizes?: DataCol;
    colors?: DataCol;
    cmap?: ColorMap;
    marker?: SeriesMarker;
}

export type AreaSeries = SeriesBase & {
    type: "area";
    x: DataCol;
    y1: DataCol;
    y2?: number | DataCol;
    fill?: SeriesFill | null;
    y1_stroke?: SeriesStroke;
    y2_stroke?: SeriesStroke;
    y1_interp?: Interpolation;
    y2_interp?: Interpolation;
}

export type HistogramSeries = SeriesBase & {
    type: "hist";
    data: DataCol;
    fill?: SeriesFill | null;
    stroke?: SeriesStroke;
    bins?: number;
    density?: boolean;
}

export interface BarsPosition {
    offset?: number;
    width?: number;
}

export type BarsSeries = SeriesBase & {
    type: "bars";
    x: DataCol;
    y: DataCol;
    fill?: SeriesFill | null;
    stroke?: SeriesStroke;
    position?: BarsPosition;
}

export type Series = LineSeries | ScatterSeries | AreaSeries | HistogramSeries | BarsSeries;

