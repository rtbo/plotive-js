use plotive::{style, Rgba8};
use wasm_bindgen::JsValue;

use crate::{extract_number_prop_if_defined, get_prop_if_defined, js_err, JsErr};

pub fn extract_color(js_col: &JsValue) -> Result<Rgba8, JsErr> {
    if let Some(col) = js_col.as_string() {
        Ok(col
            .parse()
            .map_err(|e| js_err!("Failed to parse color string '{}': {}", col, e))?)
    } else if js_col.is_array() {
        let arr = js_sys::Array::from(js_col);
        if arr.length() < 3 || arr.length() > 4 {
            return Err(js_err!("Color array must have length 3 (RGB) or 4 (RGBA)."));
        }
        let r = arr
            .get(0)
            .as_f64()
            .ok_or_else(|| js_err!("Color array must contain numbers."))? as u8;
        let g = arr
            .get(1)
            .as_f64()
            .ok_or_else(|| js_err!("Color array must contain numbers."))? as u8;
        let b = arr
            .get(2)
            .as_f64()
            .ok_or_else(|| js_err!("Color array must contain numbers."))? as u8;
        let a = if arr.length() == 4 {
            arr.get(3)
                .as_f64()
                .ok_or_else(|| js_err!("Color array must contain numbers."))?
        } else {
            1.0
        };
        Ok(Rgba8::new(r, g, b, (a * 255.0).round() as u8))
    } else {
        Err(js_err!("Color must be a string or RGB(A) array."))
    }
}

pub fn extract_style(js_style: &JsValue) -> Result<style::Style, JsErr> {
    if js_style.is_undefined() {
        Ok(style::Style::default())
    } else if let Some(js_name) = js_style.as_string() {
        match js_name.as_str() {
            "black-white" => Ok(style::Style::black_white()),
            "dark" => Ok(style::Style::dark()),
            "light" => Ok(style::Style::light()),
            "tol-bright" => Ok(style::Style::tol_bright()),
            "okabe-ito" => Ok(style::Style::okabe_ito()),
            "catppuccin-mocha" => Ok(style::Style::catppuccin_mocha()),
            "catppuccin-macchiato" => Ok(style::Style::catppuccin_macchiato()),
            "catppuccin-frappe" => Ok(style::Style::catppuccin_frappe()),
            "catppuccin-latte" => Ok(style::Style::catppuccin_latte()),
            _ => Err(js_err!("Unknown built-in style name: {}", js_name)),
        }
    } else {
        if !js_style.is_object() {
            return Err(js_err!("Style must be a string or an object."));
        }
        let Some(js_theme) = get_prop_if_defined(js_style, "theme") else {
            return Err(js_err!("Style object must have a 'theme' property."));
        };
        let theme = extract_theme(&js_theme)?;
        let Some(js_palette) = get_prop_if_defined(js_style, "palette") else {
            return Err(js_err!("Style object must have a 'palette' property."));
        };
        let palette = extract_palette(&js_palette)?;
        Ok(style::Style::new(theme, palette))
    }
}

fn extract_theme(js_theme: &JsValue) -> Result<style::Theme, JsErr> {
    if let Some(js_name) = js_theme.as_string() {
        match js_name.as_str() {
            "light" => Ok(style::theme::Theme::Light),
            "dark" => Ok(style::theme::Theme::Dark),
            "catppuccin-mocha" => Ok(style::theme::Theme::CatppuccinMocha),
            "catppuccin-macchiato" => Ok(style::theme::Theme::CatppuccinMacchiato),
            "catppuccin-frappe" => Ok(style::theme::Theme::CatppuccinFrappe),
            "catppuccin-latte" => Ok(style::theme::Theme::CatppuccinLatte),
            _ => Err(js_err!("Unknown built-in theme name: {}", js_name)),
        }
    } else {
        if !js_theme.is_object() {
            return Err(js_err!("Theme must be a string or an object."));
        }
        let js_bg = get_prop_if_defined(js_theme, "background");
        let js_fg = get_prop_if_defined(js_theme, "foreground");
        let js_grid = get_prop_if_defined(js_theme, "grid");
        let js_legend_fill = get_prop_if_defined(js_theme, "legend-fill");
        let js_legend_border = get_prop_if_defined(js_theme, "legend-border");
        let (Some(js_bg), Some(js_fg)) = (js_bg, js_fg) else {
            return Err(js_err!(
                "Theme object must have at least 'background' and 'foreground' properties."
            ));
        };
        let background = extract_color(&js_bg)?;
        let foreground = extract_color(&js_fg)?;
        let grid = js_grid
            .map(|js_val| extract_color(&js_val))
            .transpose()?
            .unwrap_or(foreground);
        let legend_fill = js_legend_fill
            .map(|js_val| extract_color(&js_val))
            .transpose()?
            .unwrap_or(background);
        let legend_border = js_legend_border
            .map(|js_val| extract_color(&js_val))
            .transpose()?
            .unwrap_or(foreground);

        Ok(style::Theme::Custom(style::theme::ThemePalette {
            background,
            foreground,
            grid,
            legend_fill,
            legend_border,
        }))
    }
}

// export type Palette = "black" | "standard" | "pastel" | "tol-bright" | "okabe-ito" |
//     "catppuccin-mocha" | "catppuccin-macchiato" | "catppuccin-frappe" | "catppuccin-latte" |
//     Color[];

fn extract_palette(js_palette: &JsValue) -> Result<style::Palette, JsErr> {
    if let Some(js_name) = js_palette.as_string() {
        match js_name.as_str() {
            "black" => Ok(style::Palette::Black),
            "standard" => Ok(style::Palette::Standard),
            "pastel" => Ok(style::Palette::Pastel),
            "tol-bright" => Ok(style::Palette::TolBright),
            "okabe-ito" => Ok(style::Palette::OkabeIto),
            "catppuccin-mocha" => Ok(style::Palette::CatppuccinMocha),
            "catppuccin-macchiato" => Ok(style::Palette::CatppuccinMacchiato),
            "catppuccin-frappe" => Ok(style::Palette::CatppuccinFrappe),
            "catppuccin-latte" => Ok(style::Palette::CatppuccinLatte),
            _ => Err(js_err!("Unknown built-in palette name: {}", js_name)),
        }
    } else {
        if !js_palette.is_array() {
            return Err(js_err!("Palette must be a string or an array."));
        }
        let arr = js_sys::Array::from(js_palette);
        let mut colors = Vec::with_capacity(arr.length() as usize);
        for i in 0..arr.length() {
            let js_col = arr.get(i);
            let col = extract_color(&js_col)?;
            colors.push(col);
        }
        Ok(style::Palette::Custom(colors))
    }
}

pub fn extract_theme_color(js_col: &JsValue) -> Result<style::theme::Color, JsErr> {
    if let Some(col) = js_col.as_string() {
        match col.as_str() {
            "background" => return Ok(style::theme::Col::Background.into()),
            "foreground" => return Ok(style::theme::Col::Foreground.into()),
            "grid" => return Ok(style::theme::Col::Grid.into()),
            "legend-fill" => return Ok(style::theme::Col::LegendFill.into()),
            "legend-border" => return Ok(style::theme::Col::LegendBorder.into()),
            _ => {}
        }
    }
    let color = extract_color(js_col)?;
    Ok(color.into())
}

pub fn extract_series_color(js_col: &JsValue) -> Result<style::series::Color, JsErr> {
    if let Some(idx) = js_col.as_f64() {
        return Ok(style::series::Color::Index(style::series::IndexColor(
            idx as usize,
        )));
    }
    if let Some(col) = js_col.as_string() {
        match col.as_str() {
            "auto" => return Ok(style::series::Color::Auto),
            _ => {}
        }
    }
    let color = extract_color(js_col)?;
    Ok(color.into())
}

pub fn extract_stroke_pattern(pattern: &JsValue) -> Result<style::LinePattern, JsErr> {
    if let Some(s) = pattern.as_string() {
        match s.as_str() {
            "solid" => return Ok(style::LinePattern::Solid),
            "dashed" => return Ok(style::LinePattern::Dashed),
            "dotted" => return Ok(style::LinePattern::Dot),
            "dash-dot" => return Ok(style::LinePattern::DashDot),
            _ => {
                return Err(js_err!("Unknown line pattern string: {}", s));
            }
        }
    }
    let pattern_vec: Option<Vec<f32>> = js_sys::Array::from(pattern)
        .iter()
        .map(|v| v.as_f64().map(|f| f as f32))
        .collect();
    let pattern_vec = pattern_vec
        .ok_or_else(|| js_err!("Line pattern must be either a string or an array of numbers."))?;
    Ok(style::Dash(pattern_vec).into())
}

fn extract_stroke<C>(js_stroke: &JsValue, stroke: &mut style::Stroke<C>) -> Result<(), JsErr>
where
    C: plotive::Color,
{
    if let Some(w) = extract_number_prop_if_defined(js_stroke, "width")? {
        stroke.width = w as f32;
    }
    if let Some(p) = get_prop_if_defined(js_stroke, "pattern") {
        stroke.pattern = extract_stroke_pattern(&p)?;
    }
    stroke.opacity = extract_number_prop_if_defined(js_stroke, "opacity")?.map(|o| o as f32);

    Ok(())
}

pub fn extract_theme_stroke(js_stroke: &JsValue) -> Result<style::theme::Stroke, JsErr> {
    let js_color = get_prop_if_defined(js_stroke, "color");
    if js_color.is_none() {
        return Err(js_err!("\"color\" attribute is required for stroke."));
    }
    let color = extract_theme_color(&js_color.unwrap())?;
    let mut stroke = style::theme::Stroke {
        color,
        width: 1.0,
        pattern: style::LinePattern::Solid,
        opacity: None,
    };
    extract_stroke(js_stroke, &mut stroke)?;
    Ok(stroke)
}

pub fn extract_series_stroke(js_stroke: &JsValue) -> Result<style::series::Stroke, JsErr> {
    let mut stroke = style::series::Stroke::default();
    if let Some(js_color) = get_prop_if_defined(js_stroke, "color") {
        let color = extract_series_color(&js_color)?;
        stroke.color = color;
    }
    extract_stroke(js_stroke, &mut stroke)?;
    Ok(stroke)
}

fn extract_fill<C>(js_fill: &JsValue, color: C) -> Result<style::Fill<C>, JsErr>
where
    C: plotive::Color,
{
    let opacity = get_prop_if_defined(js_fill, "opacity")
        .map(|o| {
            o.as_f64()
                .ok_or_else(|| js_err!("'opacity' property must be a number"))
        })
        .transpose()?
        .map(|o| o as f32);

    Ok(style::Fill::Solid { color, opacity })
}

pub fn extract_theme_fill(js_fill: &JsValue) -> Result<style::theme::Fill, JsErr> {
    let js_color = get_prop_if_defined(js_fill, "color");
    if js_color.is_none() {
        return Err(js_err!("\"color\" attribute is required for stroke."));
    }
    let color = extract_theme_color(&js_color.unwrap())?;
    extract_fill(js_fill, color)
}

pub fn extract_series_fill(js_fill: &JsValue) -> Result<style::series::Fill, JsErr> {
    let js_color = get_prop_if_defined(js_fill, "color");
    if js_color.is_none() {
        return Err(js_err!("\"color\" attribute is required for fill."));
    }
    let color = extract_series_color(&js_color.unwrap())?;
    extract_fill(js_fill, color)
}

fn extract_marker<C>(
    js_marker: &JsValue,
    fill: Option<style::Fill<C>>,
    stroke: Option<style::Stroke<C>>,
) -> Result<style::Marker<C>, JsErr>
where
    C: plotive::Color,
{
    let shape = if let Some(s) = get_prop_if_defined(js_marker, "shape") {
        if let Some(s) = s.as_string() {
            match s.as_str() {
                "circle" => style::MarkerShape::Circle,
                "square" => style::MarkerShape::Square,
                "diamond" => style::MarkerShape::Diamond,
                "cross" => style::MarkerShape::Cross,
                "plus" => style::MarkerShape::Plus,
                "triangle-up" => style::MarkerShape::TriangleUp,
                "triangle-down" => style::MarkerShape::TriangleDown,
                "triangle-left" => style::MarkerShape::TriangleLeft,
                "triangle-right" => style::MarkerShape::TriangleRight,
                _ => return Err(js_err!("Unknown marker shape: {}", s)),
            }
        } else {
            return Err(js_err!("'shape' property must be a string"));
        }
    } else {
        style::MarkerShape::Circle
    };

    let size = get_prop_if_defined(js_marker, "size")
        .map(|s| {
            s.as_f64()
                .ok_or_else(|| js_err!("'size' property must be a number"))
                .map(|s| s as f32)
                .map(style::MarkerSize)
        })
        .transpose()?
        .unwrap_or_default();

    Ok(style::Marker {
        shape,
        size,
        fill,
        stroke,
    })
}

pub fn extract_series_marker(js_marker: &JsValue) -> Result<style::series::Marker, JsErr> {
    let fill = if let Some(js_fill) = get_prop_if_defined(js_marker, "fill") {
        if js_fill.is_null() {
            None
        } else {
            Some(extract_series_fill(&js_fill)?)
        }
    } else {
        Some(Default::default())
    };

    let stroke = if let Some(js_stroke) = get_prop_if_defined(js_marker, "stroke") {
        if js_stroke.is_null() {
            None
        } else {
            Some(extract_series_stroke(&js_stroke)?)
        }
    } else {
        Some(Default::default())
    };

    extract_marker(js_marker, fill, stroke).map(Into::into)
}

pub fn extract_theme_marker(js_marker: &JsValue) -> Result<style::theme::Marker, JsErr> {
    let fill = if let Some(js_fill) = get_prop_if_defined(js_marker, "fill") {
        Some(extract_theme_fill(&js_fill)?)
    } else {
        None
    };
    let stroke = if let Some(js_stroke) = get_prop_if_defined(js_marker, "stroke") {
        Some(extract_theme_stroke(&js_stroke)?)
    } else {
        None
    };
    extract_marker(js_marker, fill, stroke).map(Into::into)
}
