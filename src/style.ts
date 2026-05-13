import { Color } from "./color";

export type ThemePaletteColor = "background" | "foreground" | "grid" | "legend-border" | "legend-fill";
export type ThemeColor = Color | ThemePaletteColor;

export type SeriesPaletteColor = "auto" | number;
export type SeriesColor = Color | SeriesPaletteColor;

export interface Fill<C = Color> {
    color: C;
    opacity?: number;
};
export type ThemeFill = Fill<ThemeColor>;
export type SeriesFill = Fill<SeriesColor>;

export interface Stroke<C = Color> {
    color: C;
    width?: number;
    pattern?: number[];
    opacity?: number;
}

export type ThemeStroke = Stroke<ThemeColor>;
export type SeriesStroke = Stroke<SeriesColor>;

export type MarkerShape =
    "circle" | "square" | "diamond" | "cross" | "plus" | "triangle-up" | "triangle-down" | "triangle-left" | "triangle-right";

export interface Marker<C = Color> {
    size?: number;
    shape?: MarkerShape;
    fill?: C | Fill<C> | null;
    stroke?: C | Stroke<C> | null;
    color?: C;
    fillOpacity?: number;
}

export type ThemeMarker = Marker<ThemeColor>;
export type SeriesMarker = Marker<SeriesColor>;
