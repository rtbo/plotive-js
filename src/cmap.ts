import { Scale } from "./axis";
import { Color } from "./color";

export type BuiltinCmap = "viridis" | "stellar";

export type LerpMethod = "nearest" | "srgb" | "linear" | "perceptual" | "xyz"

export type ColorMap = BuiltinCmap | Color[] | {
    method?: LerpMethod;
    cmap?: BuiltinCmap;
    stops?: Color[];
    scale?: Scale;
}

