use plotive::{style, ColorU8};
use wasm_bindgen::JsValue;

use crate::get_prop_if_defined;

pub fn extract_color(js_col: &JsValue) -> Result<ColorU8, JsValue> {
    if let Some(col) = js_col.as_string() {
        Ok(col.parse().map_err(|e| {
            JsValue::from_str(&format!("Failed to parse color string '{}': {}", col, e))
        })?)
    } else if js_col.is_array() {
        let arr = js_sys::Array::from(js_col);
        if arr.length() < 3 || arr.length() > 4 {
            return Err(JsValue::from_str(
                "Color array must have length 3 (RGB) or 4 (RGBA).",
            ));
        }
        let r = arr
            .get(0)
            .as_f64()
            .ok_or_else(|| JsValue::from_str("Color array must contain numbers."))?
            as u8;
        let g = arr
            .get(1)
            .as_f64()
            .ok_or_else(|| JsValue::from_str("Color array must contain numbers."))?
            as u8;
        let b = arr
            .get(2)
            .as_f64()
            .ok_or_else(|| JsValue::from_str("Color array must contain numbers."))?
            as u8;
        let a = if arr.length() == 4 {
            arr.get(3)
                .as_f64()
                .ok_or_else(|| JsValue::from_str("Color array must contain numbers."))?
        } else {
            1.0
        };
        Ok(ColorU8::from_rgba(r, g, b, (a * 255.0).round() as u8))
    } else {
        Err(JsValue::from_str("Color must be a string or RGB(A) array."))
    }
}

pub fn extract_theme_color(js_col: &JsValue) -> Result<style::theme::Color, JsValue> {
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

pub fn extract_series_color(js_col: &JsValue) -> Result<style::series::Color, JsValue> {
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

pub fn extract_stroke_pattern(pattern: &JsValue) -> Result<style::LinePattern, JsValue> {
    if let Some(s) = pattern.as_string() {
        match s.as_str() {
            "solid" => return Ok(style::LinePattern::Solid),
            "dashed" => return Ok(style::Dash::default().into()),
            "dotted" => return Ok(style::LinePattern::Dot),
            _ => {
                return Err(JsValue::from_str(&format!(
                    "Unknown line pattern string: {}",
                    s
                )));
            }
        }
    }
    let pattern_vec: Option<Vec<f32>> = js_sys::Array::from(pattern)
        .iter()
        .map(|v| v.as_f64().map(|f| f as f32))
        .collect();
    let pattern_vec = pattern_vec.ok_or_else(|| {
        JsValue::from_str("Line pattern must be either a string or an array of numbers.")
    })?;
    Ok(style::Dash(pattern_vec).into())
}

pub fn extract_theme_stroke(js_stroke: &JsValue) -> Result<style::theme::Stroke, JsValue> {
    let js_color = get_prop_if_defined(js_stroke, "color");
    if js_color.is_none() {
        return Err(JsValue::from_str(
            "\"color\" attribute is required for stroke.",
        ));
    }
    let color = extract_theme_color(&js_color.unwrap())?;
    let width = if let Some(w) = get_prop_if_defined(js_stroke, "width") {
        w.as_f64()
            .ok_or_else(|| JsValue::from_str("'width' property must be a number"))? as f32
    } else {
        1.0
    };
    let pattern = if let Some(p) = get_prop_if_defined(js_stroke, "pattern") {
        extract_stroke_pattern(&p)?
    } else {
        style::LinePattern::Solid
    };
    let opacity = if let Some(o) = get_prop_if_defined(js_stroke, "opacity") {
        Some(o.as_f64().ok_or_else(|| JsValue::from_str("'opacity' property must be a number"))? as f32)
    } else {
        None
    };
    Ok(style::theme::Stroke {
        color,
        width,
        pattern,
        opacity,
    })
}
