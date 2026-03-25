import { ThemeStroke } from "./style";

export type Bound = string | number;

export type Ref = string | number;

export interface AutoScale {
    type: "auto";
}

export interface LinScale {
    type: "lin";
    min?: Bound;
    max?: Bound;
}

export interface LogScale {
    type: "log";
    base?: number;
    min?: Bound;
    max?: Bound;
}

export interface SharedScale {
    type: "shared";
    ref?: Ref;
}

export type ScaleType = "auto" | "lin" | "log" | "shared";

export type Scale = ScaleType | AutoScale | LinScale | LogScale | SharedScale;

export interface AutoTicksLocator {
    type: "auto";
}

export interface MaxNTicksLocator {
    type: "maxn";
    bins?: number;
    steps?: number[];
}

export interface PiMultipleTicksLocator {
    type: "pimultiple";
    bins?: number;
}

export interface LogTicksLocator {
    type: "log";
    base?: number;
}

export type DateTimeUnit = "year" | "month" | "day" | "hour" | "min" | "sec" | "milli" | "micro";

export interface DateTimeTicksLocator {
    type: "datetime";
    period?: [number, DateTimeUnit];
}

export type TimeDeltaUnit = "day" | "hour" | "min" | "sec" | "milli" | "micro";

export interface TimeDeltaTicksLocator {
    type: "timedelta";
    period?: [number, TimeDeltaUnit];
}

export type TicksLocatorType = "auto" | "maxn" | "pimultiple" | "log" | "datetime" | "timedelta";

export type TicksLocator = TicksLocatorType | AutoTicksLocator | MaxNTicksLocator | PiMultipleTicksLocator | LogTicksLocator | DateTimeTicksLocator | TimeDeltaTicksLocator;


export interface AutoTicksFormatter {
    type: "auto";
}

export interface SharedAutoTicksFormatter {
    type: "shared-auto";
}

export interface DecimalTicksFormatter {
    type: "decimal";
    precision?: number;
}

export interface PercentTicksFormatter {
    type: "percent";
    decimals?: number;
}

export interface DateTimeTicksFormatter {
    type: "datetime";
    fmt?: string;
}

export interface TimeDeltaTicksFormatter {
    type: "timedelta";
    fmt?: string;
}

export type TicksFormatterType = "auto" | "shared-auto" | "decimal" | "percent" | "datetime" | "timedelta";

export type TicksFormatter =
    AutoTicksFormatter |
    SharedAutoTicksFormatter |
    DecimalTicksFormatter |
    PercentTicksFormatter |
    DateTimeTicksFormatter |
    TimeDeltaTicksFormatter;

export interface Ticks {
    locator?: TicksLocator;
    formatter?: TicksFormatter;
}

export interface Axis {
    title?: string;
    id?: string;
    scale?: Scale;
    side?: "top" | "right" | "bottom" | "left";
    ticks?: Ticks | TicksLocator | TicksFormatterType;
    grid?: "default" | ThemeStroke;
    minor_ticks?: Ticks | TicksLocator;
    minor_grid?: "default" | ThemeStroke;
}
