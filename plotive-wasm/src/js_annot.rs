use plotive::des;
use wasm_bindgen::{JsCast, JsValue};

use crate::{extract_array_prop_if_defined, extract_number_prop, extract_number_prop_if_defined, extract_string_prop, extract_string_prop_if_defined, extract_type, get_prop_if_defined, js_axis, js_style::{extract_stroke_pattern, extract_theme_color, extract_theme_stroke}};

pub fn extract_annot(js_annot: &JsValue) -> Result<des::Annotation, JsValue> {
    let typ_name = extract_type(js_annot)?;
    let mut annot = match typ_name.as_str() {
        "line" => extract_line_annot(js_annot).map(des::Annotation::Line),
        "arrow" => extract_arrow_annot(js_annot).map(des::Annotation::Arrow),
        "label" => extract_label_annot(js_annot).map(des::Annotation::Label),
        _ => Err(JsValue::from_str(&format!(
            "Unsupported annotation type: {}",
            typ_name
        ))),
    }?;
    if let Some(js_axis_ref) = get_prop_if_defined(js_annot, "x_axis") {
        let axis_ref = js_axis::extract_ref(&js_axis_ref)?;
        annot = annot.with_x_axis(axis_ref);
    }
    if let Some(js_axis_ref) = get_prop_if_defined(js_annot, "y_axis") {
        let axis_ref = js_axis::extract_ref(&js_axis_ref)?;
        annot = annot.with_y_axis(axis_ref);
    }
    if let Some(zpos) = extract_string_prop_if_defined(js_annot, "zpos")? {
        match zpos.as_str() {
            "below-series" => annot = annot.with_zpos(des::annot::ZPos::BelowSeries),
            "above-series" => annot = annot.with_zpos(des::annot::ZPos::AboveSeries),
            _ => {
                return Err(JsValue::from_str(
                    "zpos must be either 'below-series' or 'above-series'.",
                ))
            }
        }
    }
    Ok(annot)
}

fn extract_line_annot(js_annot: &JsValue) -> Result<des::annot::Line, JsValue> {
    let mut line = if let Some(y) = extract_number_prop_if_defined(js_annot, "horizontal")? {
        des::annot::Line::horizontal(y)
    } else if let Some(x) = extract_number_prop_if_defined(js_annot, "vertical")? {
        des::annot::Line::vertical(x)
    } else if let Some(js_slope) = get_prop_if_defined(js_annot, "slope") {
        let js_slope = js_slope.dyn_ref::<js_sys::Array>().ok_or_else(|| {
            JsValue::from_str("'slope' property must be an array of [[x, y], slope].")
        })?;
        if js_slope.length() != 2 {
            return Err(JsValue::from_str("'slope' array must have exactly 2 elements ([[x, y], slope])."));
        }
        let js_point = js_slope.get(0);
        let js_slope = js_slope.get(1);
        let js_point = js_point.dyn_ref::<js_sys::Array>().ok_or_else(|| {
            JsValue::from_str("First element of 'slope' array must be an array [x, y].")
        })?;
        let x = js_point.get(0).as_f64().ok_or_else(|| {
            JsValue::from_str("First element of 'slope' point array must be a number (x coordinate).")
        })?;
        let y = js_point.get(1).as_f64().ok_or_else(|| {
            JsValue::from_str("Second element of 'slope' point array must be a number (y coordinate).")
        })?;
        let slope = js_slope.as_f64().ok_or_else(|| {
            JsValue::from_str("Second element of 'slope' array must be a number (the slope).")
        })? as f32;
        des::annot::Line::slope(x, y, slope)
    } else if let Some(js_two_points) = get_prop_if_defined(js_annot, "two_points") {
        let js_two_points = js_two_points.dyn_ref::<js_sys::Array>().ok_or_else(|| {
            JsValue::from_str("'two_points' property must be an array of [[x, y], [x, y]].")
        })?;
        if js_two_points.length() != 2 {
            return Err(JsValue::from_str("'two_points' array must have exactly 2 elements ([[x, y], [x, y]])."));
        }
        let js_p1 = js_two_points.get(0).dyn_into::<js_sys::Array>().map_err(|_| {
            JsValue::from_str("First element of 'two_points' array must be an array [x, y].")
        })?;
        let js_p2 = js_two_points.get(1).dyn_into::<js_sys::Array>().map_err(|_| {
            JsValue::from_str("Second element of 'two_points' array must be an array [x, y].")
        })?;
        let x1 = js_p1.get(0).as_f64().ok_or_else(|| {
            JsValue::from_str("First element of first point in 'two_points' array must be a number (x coordinate).")
        })?;
        let y1 = js_p1.get(1).as_f64().ok_or_else(|| {
            JsValue::from_str("Second element of first point in 'two_points' array must be a number (y coordinate).")
        })?;
        let x2 = js_p2.get(0).as_f64().ok_or_else(|| {
            JsValue::from_str("First element of second point in 'two_points' array must be a number (x coordinate).")
        })?;
        let y2 = js_p2.get(1).as_f64().ok_or_else(|| {
            JsValue::from_str("Second element of second point in 'two_points' array must be a number (y coordinate).")
        })?;

        des::annot::Line::two_points(x1, y1, x2, y2)
    } else {
        return Err(JsValue::from_str(
            "Line annotation must have either 'horizontal', 'vertical', 'slope' or 'two_points' attribute.",
        ));
    };

    if let Some(js_stroke) = get_prop_if_defined(js_annot, "stroke") {
        let stroke = extract_theme_stroke(&js_stroke)?;
        line = line.with_line(stroke);
    }

    if let Some(js_pattern) = get_prop_if_defined(js_annot, "pattern") {
        let pattern = extract_stroke_pattern(&js_pattern)?;
        line = line.with_pattern(pattern);
    }

    Ok(line)
}

fn extract_arrow_annot(js_annot: &JsValue) -> Result<des::annot::Arrow, JsValue> {
    let x = extract_number_prop(js_annot, "x")?;
    let y = extract_number_prop(js_annot, "y")?;
    let dx = extract_number_prop(js_annot, "dx")? as f32;
    let dy = extract_number_prop(js_annot, "dy")? as f32;
    let mut arrow = des::annot::Arrow::new(x, y, dx, dy);
    if let Some(head_size) = extract_number_prop_if_defined(js_annot, "head_size")? {
        arrow = arrow.with_head_size(head_size as f32);
    }
    if let Some(js_stroke) = get_prop_if_defined(js_annot, "stroke") {
        let stroke = extract_theme_stroke(&js_stroke)?;
        arrow = arrow.with_line(stroke);
    }
    Ok(arrow)
}

fn extract_label_annot(js_annot: &JsValue) -> Result<des::annot::Label, JsValue> {
    let x = extract_number_prop(js_annot, "x")?;
    let y = extract_number_prop(js_annot, "y")?;
    let text = extract_string_prop(js_annot, "text")?;

    let mut label = des::annot::Label::new(text, x, y);

    if let Some(anchor) = extract_string_prop_if_defined(js_annot, "anchor")? {
        label = match anchor.as_str() {
            "top-left" => label.with_anchor(des::annot::Anchor::TopLeft),
            "top-center" => label.with_anchor(des::annot::Anchor::TopCenter),
            "top-right" => label.with_anchor(des::annot::Anchor::TopRight),
            "center-left" => label.with_anchor(des::annot::Anchor::CenterLeft),
            "center" => label.with_anchor(des::annot::Anchor::Center),
            "center-right" => label.with_anchor(des::annot::Anchor::CenterRight),
            "bottom-left" => label.with_anchor(des::annot::Anchor::BottomLeft),
            "bottom-center" => label.with_anchor(des::annot::Anchor::BottomCenter),
            "bottom-right" => label.with_anchor(des::annot::Anchor::BottomRight),
            _ => {
                return Err(JsValue::from_str(&format!(
                    "Unknown anchor string: {}",
                    anchor
                )));
            }
        };
    }
    if let Some(js_color) = get_prop_if_defined(js_annot, "color") {
        let color = extract_theme_color(&js_color)?;
        label = label.with_color(color);
    }
    if let Some(angle) = extract_number_prop_if_defined(js_annot, "angle")? {
        label = label.with_angle(angle as f32);
    }
    if let Some(js_frame) = extract_array_prop_if_defined(js_annot, "frame")? {
        if js_frame.length() != 2 {
            return Err(JsValue::from_str("'frame' array must have exactly 2 elements [fill, stroke]."));
        }

        let js_fill = js_frame.get(0);
        let js_stroke = js_frame.get(1);
        let fill = if js_fill.is_null() {
            None
        } else {
            Some(extract_theme_color(&js_fill)?.into())
        };
        let stroke = if js_stroke.is_null() {
            None
        } else {
            Some(extract_theme_stroke(&js_stroke)?)
        };
        label = label.with_frame(fill, stroke);
    }

    Ok(label)
}
