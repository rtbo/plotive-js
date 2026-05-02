import { Scale } from "./axis";
import { Color } from "./color";

export type BuiltinCmap = "viridis" | "stellar";

export type LerpMethod = "nearest" | "srgb" | "linear" | "perceptual" | "xyz"

export type ColorMap = BuiltinCmap | {
    method: LerpMethod;
    start: Color;
    end: Color;
    stops?: Array<[number, Color]>;
    scale?: Scale;
}
