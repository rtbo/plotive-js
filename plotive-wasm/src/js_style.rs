use plotive::{style, Rgba8};
use wasm_bindgen::JsValue;

use crate::{get_prop_if_defined, js_err, JsErr};

pub fn extract_color(js_col: JsValue) -> Result<Rgba8, JsErr> {
    serde_wasm_bindgen::from_value(js_col.clone())
        .map_err(|e| js_err!("Failed to deserialize color: {}", e))
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
            "dracula" => Ok(style::Style::dracula()),
            "alucard" => Ok(style::Style::alucard()),
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
            "dracula" => Ok(style::theme::Theme::Dracula),
            "alucard" => Ok(style::theme::Theme::Alucard),
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
        let background = extract_color(js_bg)?;
        let foreground = extract_color(js_fg)?;
        let grid = js_grid
            .map(|js_val| extract_color(js_val))
            .transpose()?
            .unwrap_or(foreground);
        let legend_fill = js_legend_fill
            .map(|js_val| extract_color(js_val))
            .transpose()?
            .unwrap_or(background);
        let legend_border = js_legend_border
            .map(|js_val| extract_color(js_val))
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
            "dracula" => Ok(style::Palette::Dracula),
            "alucard" => Ok(style::Palette::Alucard),
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
            let col = extract_color(js_col)?;
            colors.push(col);
        }
        Ok(style::Palette::Custom(colors))
    }
}
