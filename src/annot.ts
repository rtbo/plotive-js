import { ThemeColor, ThemeFill, ThemeMarker, ThemeStroke, Pattern } from "./style";

export type ZPos = "below-series" | "above-series";

interface AnnotBase {
    xAxis?: string;
    yAxis?: string;
    zpos?: ZPos;
}

type LineBase = AnnotBase & {
    type: "line";
    stroke?: ThemeStroke;
    pattern?: Pattern;
}

type Line = LineBase & (
    {
        horizontal: number;
        vertical?: never;
        slope?: never;
        twoPoints?: never;
    } |
    {
        horizontal?: never;
        vertical: number;
        slope?: never;
        twoPoints?: never;
    } |
    {
        horizontal?: never;
        vertical?: never;
        slope: [[number, number], number];
        twoPoints?: never;
    } |
    {
        horizontal?: never;
        vertical?: never;
        slope?: never;
        twoPoints: [[number, number], [number, number]];
    }
);

type Arrow = AnnotBase & {
    type: "arrow";
    xy: [number, number];
    dxy: [number, number];
    stroke?: ThemeStroke,
    headSize?: number;
    xAxis?: string;
    yAxis?: string;
    zpos?: ZPos;
}

type Marker = AnnotBase &  {
    xy: [number, number];
    marker?: ThemeMarker;
}

type Anchor =
    "top-left" |
    "top-center" |
    "top-right" |
    "center-left" |
    "center" |
    "center-right" |
    "bottom-left" |
    "bottom-center" |
    "bottom-right";

type Label = AnnotBase & {
    type: "label";
    xy: [number, number];
    text: string;
    anchor?: Anchor;
    frame?: [ThemeFill | null, ThemeStroke | null];
    color?: ThemeColor;
    angle?: number;
    xAxis?: string;
    yAxis?: string;
    zpos?: ZPos;
}

export type Annotation = Line | Arrow | Marker | Label;
