
import * as axis from "./axis";
import { SeriesFill, SeriesMarker, SeriesStroke } from "./style";

export type DataCol =
    string | Float32Array | Float64Array | number[] | string[];

interface SeriesBase {
    name?: string;
    x_axis?: axis.Ref;
    y_axis?: axis.Ref;
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
}

export type ScatterSeries = SeriesBase & {
    type: "scatter";
    x: DataCol;
    y: DataCol;
    marker?: SeriesMarker;
}

export type HistogramSeries = SeriesBase & {
    type: "hist";
    data: DataCol;
    fill?: SeriesFill;
    stroke?: SeriesStroke;
    bins?: number;
    density?: boolean;
}

export type Series = LineSeries | ScatterSeries | HistogramSeries;
