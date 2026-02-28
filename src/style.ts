import { Color } from "./color";

export type ThemePaletteColor = "background" | "foreground" | "grid" | "legend-border" | "legend-fill";
export type ThemeColor = Color | ThemePaletteColor;

export type SeriesPaletteColor = "auto" | number;
export type SeriesColor = Color | SeriesPaletteColor;

export type Fill<C> = C;
export type ThemeFill = Fill<ThemeColor>;
export type SeriesFill = Fill<SeriesColor>;

export interface Stroke<C = Color> {
    color: C;
    width?: number;
    pattern?: number[];
}

export type ThemeStroke = Stroke<ThemeColor>;
export type SeriesStroke = Stroke<SeriesColor>;

export type MarkerShape =
    "circle" | "square" | "diamond" | "cross" | "plus" | "triangle-up" | "triangle-down";

export interface Marker<C = Color> {
    size?: number;
    shape?: MarkerShape;
    fill?: Fill<C>;
    stroke?: Stroke<C>;
}

export type ThemeMarker = Marker<ThemeColor>;
export type SeriesMarker = Marker<SeriesColor>;
