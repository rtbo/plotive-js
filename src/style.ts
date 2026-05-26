import { Color } from "./color";

export type ThemePaletteColor = "background" | "foreground" | "grid" | "legend-border" | "legend-fill";
export type ThemeColor = Color | ThemePaletteColor;

export type SeriesPaletteColor = "auto" | number;
export type SeriesColor = Color | SeriesPaletteColor;

export interface ThemePalette {
    background: Color;
    foreground: Color;
    grid?: Color;
    legendBorder?: Color;
    legendFill?: Color;
}

export type Theme = "light" | "dark" | "catppuccin-mocha" | "catppuccin-macchiato" | "catppuccin-frappe" | "catppuccin-latte" | ThemePalette;

export type Palette = "black" | "standard" | "pastel" | "tol-bright" | "okabe-ito" |
    "catppuccin-mocha" | "catppuccin-macchiato" | "catppuccin-frappe" | "catppuccin-latte" |
    Color[];

export interface Style {
    theme: Theme;
    palette: Palette;
}

export const BLACK_WHITE: Style = {
    theme: "light",
    palette: "black",
}
export const LIGHT: Style = {
    theme: "light",
    palette: "standard",
}
export const DARK: Style = {
    theme: "dark",
    palette: "pastel",
}
export const TOL_BRIGHT: Style = {
    theme: "light",
    palette: "tol-bright",
}
export const OKABE_ITO: Style = {
    theme: "light",
    palette: "okabe-ito",
}
export const CATPPUCCIN_MOCHA: Style = {
    theme: "catppuccin-mocha",
    palette: "catppuccin-mocha",
}
export const CATPPUCCIN_MACCHIATO: Style = {
    theme: "catppuccin-macchiato",
    palette: "catppuccin-macchiato",
}
export const CATPPUCCIN_FRAPPE: Style = {
    theme: "catppuccin-frappe",
    palette: "catppuccin-frappe",
}
export const CATPPUCCIN_LATTE: Style = {
    theme: "catppuccin-latte",
    palette: "catppuccin-latte",
}
export const DEFAULT = LIGHT;

export const BUILTIN_STYLES = {
    "black-white": BLACK_WHITE,
    "light": LIGHT,
    "dark": DARK,
    "tol-bright": TOL_BRIGHT,
    "okabe-ito": OKABE_ITO,
    "catppuccin-mocha": CATPPUCCIN_MOCHA,
    "catppuccin-macchiato": CATPPUCCIN_MACCHIATO,
    "catppuccin-frappe": CATPPUCCIN_FRAPPE,
    "catppuccin-latte": CATPPUCCIN_LATTE,
}
export type BuiltinStyleName = keyof typeof BUILTIN_STYLES;

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
