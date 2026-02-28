import { ThemeColor, ThemeFill, ThemeStroke } from "./style";

export type ZPos = "below-series" | "above-series";

interface LineBase {
    type: "line";
    stroke?: ThemeStroke;
    pattern?: number[];
    xAxis?: string;
    yAxis?: string;
    zpos?: ZPos;
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

interface Arrow {
    type: "arrow";
    xy: [number, number];
    dxy: [number, number];
    stroke?: ThemeStroke,
    headSize?: number;
    xAxis?: string;
    yAxis?: string;
    zpos?: ZPos;
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

interface Label {
    type: "label";
    xy: [number, number];
    text: string;
    anchor?: Anchor;
    frame?: [ThemeFill, ThemeStroke];
    color?: ThemeColor;
    angle?: number;
    xAxis?: string;
    yAxis?: string;
    zpos?: ZPos;
}

export type Annotation = Line | Arrow | Label;