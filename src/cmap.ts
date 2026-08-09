import { Scale } from "./axis";
import { Color } from "./color";

/**
 * A built-in color map that interpolates between colors. The available built-in color maps are:
 * - "viridis": The famous `viridis` color map from matplotlib.
 *   A perceptually uniform color map that is suitable for scientific visualization.
 * - "stellar": A color map that maps kelvin temperature to color.
 *   The color map is based on the black body radiation curve and is suitable for visualizing temperature data.
 *   Range of application is from 1000K to 15000K
 */
export type BuiltinLerpCmap = "viridis" | "stellar";

/**
 * The method used to interpolate between colors in a color map. The available methods are:
 * - "nearest": Nearest neighbor interpolation.
 * - "srgb": Interpolation in the sRGB color space. This method is fast but tends to produce darker gradients
 * - "linear": Linear interpolation in the RGB color space. This method is a little bit slower but produces visually linear gradients.
 * - "perceptual": Interpolation in a perceptually uniform color space (i.e., Oklab interpolation).
 * - "xyz": Interpolation in the CIE 1931 XYZ color space.
 */
export type LerpMethod = "nearest" | "srgb" | "linear" | "perceptual" | "xyz";

/**
 * A color map that interpolates between colors.
 * The interpolation can be done in different color spaces, and the colors can be specified as a built-in colormap,
 * an array of colors, or a custom object with interpolation method, colormap, stops, and scale.
 */
export type LerpColorMap =
  | BuiltinLerpCmap
  | Color[]
  | {
      method?: LerpMethod;
      cmap?: BuiltinLerpCmap;
      stops?: Color[];
      scale?: Scale;
    };

/**
 * A color map that maps a literal value to a color. The literal value can be a string or a number.
 * String values are parsed as colors. example: "red", "#ff0000", "rgb(255, 0, 0)"
 * Number values are interpreted as 32-bit integers with the format 0xRRGGBBAA. example: 0xff0000ff for red.
 */
export type LiteralColorMap = "literal";

/**
 * A color map that maps a categorical value to a color. The categorical value can be a string or a number.
 * If the colormap is "cat" or "categorical", each distinct data value is assigned a color picked from the active series palette, in the order they are encountered.
 * If the colormap is a record, the keys are the distinct data values and the values are the colors to use for each value.
 */
export type CatColorMap = "cat" | "categorical" | Record<string, Color> | Record<number, Color>;

/**
 * A color map maps a data value to a color.
 */
export type ColorMap = "auto" | LiteralColorMap | CatColorMap | LerpColorMap;
