import {
    ThemeColor,
    ThemeFill,
    ThemeMarker,
    ThemeStroke,
    Pattern,
} from "./style";

export type ZPos = "below-series" | "above-series";
export type CoordSys = "data" | "plot";
/// Coordinate can be a number (in data coordinates) or a tuple of [number, CoordSys] where the number is in the specified coordinate system.
/// If the coordinate system is not specified, it defaults to "data" coordinates.
/// In plot coordinates, the number is in points relative to the top-left corner of the plot area.
/// Negative numbers are allowed and will be interpreted as offsets from the right or bottom edges of the plot area.
export type Coord = number | [number, CoordSys];

interface AnnotBase {
    xAxis?: string;
    yAxis?: string;
    zpos?: ZPos;
}

type LineBase = AnnotBase & {
    type: "line";
    stroke?: ThemeStroke;
    pattern?: Pattern;
};

type Line = LineBase &
    (
        | {
              horizontal: Coord;
              vertical?: never;
              slope?: never;
              twoPoints?: never;
          }
        | {
              horizontal?: never;
              vertical: Coord;
              slope?: never;
              twoPoints?: never;
          }
        | {
              horizontal?: never;
              vertical?: never;
              slope: [[Coord, Coord], number];
              twoPoints?: never;
          }
        | {
              horizontal?: never;
              vertical?: never;
              slope?: never;
              twoPoints: [[Coord, Coord], [Coord, Coord]];
          }
    );

type Arrow = AnnotBase & {
    type: "arrow";
    xy: [Coord, Coord];
    dxy: [Coord, Coord];
    stroke?: ThemeStroke;
    headSize?: number;
    xAxis?: string;
    yAxis?: string;
    zpos?: ZPos;
};

type Marker = AnnotBase & {
    xy: [Coord, Coord];
    marker?: ThemeMarker;
};

type Anchor =
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";

type Label = AnnotBase & {
    type: "label";
    xy: [Coord, Coord];
    text: string;
    anchor?: Anchor;
    frame?: [ThemeFill | null, ThemeStroke | null];
    color?: ThemeColor;
    angle?: number;
    xAxis?: string;
    yAxis?: string;
    zpos?: ZPos;
};

export type Annotation = Line | Arrow | Marker | Label;
