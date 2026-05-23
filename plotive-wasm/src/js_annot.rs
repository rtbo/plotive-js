use plotive::des;
use wasm_bindgen::{JsCast, JsValue};

use crate::{
    extract_array_prop, extract_array_prop_if_defined, extract_number_prop_if_defined,
    extract_string_prop, extract_string_prop_if_defined, extract_type, get_prop_if_defined,
    js_axis, js_err,
    js_style::{
        extract_stroke_pattern, extract_theme_color, extract_theme_marker, extract_theme_stroke,
    },
    JsErr,
};

pub fn extract_annot(js_annot: &JsValue) -> Result<des::Annotation, JsErr> {
    let typ_name = extract_type(js_annot)?;
    let mut annot = match typ_name.as_str() {
        "line" => extract_line_annot(js_annot).map(des::Annotation::Line),
        "arrow" => extract_arrow_annot(js_annot).map(des::Annotation::Arrow),
        "marker" => extract_marker_annot(js_annot).map(des::Annotation::Marker),
        "label" => extract_label_annot(js_annot).map(des::Annotation::Label),
        _ => Err(js_err!("Unsupported annotation type: {}", typ_name)),
    }?;
    if let Some(js_axis_ref) = get_prop_if_defined(js_annot, "xAxis") {
        let axis_ref = js_axis::extract_ref(&js_axis_ref)?;
        annot = annot.with_x_axis(axis_ref);
    }
    if let Some(js_axis_ref) = get_prop_if_defined(js_annot, "yAxis") {
        let axis_ref = js_axis::extract_ref(&js_axis_ref)?;
        annot = annot.with_y_axis(axis_ref);
    }
    if let Some(zpos) = extract_string_prop_if_defined(js_annot, "zpos")? {
        match zpos.as_str() {
            "below-series" => annot = annot.with_zpos(des::annot::ZPos::BelowSeries),
            "above-series" => annot = annot.with_zpos(des::annot::ZPos::AboveSeries),
            _ => {
                return Err(js_err!(
                    "zpos must be either 'below-series' or 'above-series'.",
                ))
            }
        }
    }
    Ok(annot)
}

fn extract_xy(js_annot: &JsValue, prop_name: &str) -> Result<(f64, f64), JsErr> {
    let js_xy = extract_array_prop(js_annot, prop_name)?;
    let x = js_xy.get(0).as_f64().ok_or_else(|| {
        js_err!(
            "First element of '{}' array must be a number (x coordinate).",
            prop_name
        )
    })?;
    let y = js_xy.get(1).as_f64().ok_or_else(|| {
        js_err!(
            "Second element of '{}' array must be a number (y coordinate).",
            prop_name
        )
    })?;
    Ok((x, y))
}

fn extract_line_annot(js_annot: &JsValue) -> Result<des::annot::Line, JsErr> {
    let mut line = if let Some(y) = extract_number_prop_if_defined(js_annot, "horizontal")? {
        des::annot::Line::horizontal(y)
    } else if let Some(x) = extract_number_prop_if_defined(js_annot, "vertical")? {
        des::annot::Line::vertical(x)
    } else if let Some(js_slope) = get_prop_if_defined(js_annot, "slope") {
        let js_slope = js_slope
            .dyn_ref::<js_sys::Array>()
            .ok_or_else(|| js_err!("'slope' property must be an array of [[x, y], slope]."))?;
        if js_slope.length() != 2 {
            return Err(js_err!(
                "'slope' array must have exactly 2 elements ([[x, y], slope])."
            ));
        }
        let js_point = js_slope.get(0);
        let js_slope = js_slope.get(1);
        let js_point = js_point
            .dyn_ref::<js_sys::Array>()
            .ok_or_else(|| js_err!("First element of 'slope' array must be an array [x, y]."))?;
        let x = js_point.get(0).as_f64().ok_or_else(|| {
            js_err!("First element of 'slope' point array must be a number (x coordinate).")
        })?;
        let y = js_point.get(1).as_f64().ok_or_else(|| {
            js_err!("Second element of 'slope' point array must be a number (y coordinate).")
        })?;
        let slope = js_slope.as_f64().ok_or_else(|| {
            js_err!("Second element of 'slope' array must be a number (the slope).")
        })? as f32;
        des::annot::Line::slope(x, y, slope)
    } else if let Some(js_two_points) = get_prop_if_defined(js_annot, "twoPoints") {
        let js_two_points = js_two_points
            .dyn_ref::<js_sys::Array>()
            .ok_or_else(|| js_err!("'twoPoints' property must be an array of [[x, y], [x, y]]."))?;
        if js_two_points.length() != 2 {
            return Err(js_err!(
                "'twoPoints' array must have exactly 2 elements ([[x, y], [x, y]])."
            ));
        }
        let js_p1 = js_two_points
            .get(0)
            .dyn_into::<js_sys::Array>()
            .map_err(|_| js_err!("First element of 'twoPoints' array must be an array [x, y]."))?;
        let js_p2 = js_two_points
            .get(1)
            .dyn_into::<js_sys::Array>()
            .map_err(|_| js_err!("Second element of 'twoPoints' array must be an array [x, y]."))?;
        let x1 = js_p1.get(0).as_f64().ok_or_else(|| {
            js_err!("First element of first point in 'twoPoints' array must be a number (x coordinate).")
        })?;
        let y1 = js_p1.get(1).as_f64().ok_or_else(|| {
            js_err!("Second element of first point in 'twoPoints' array must be a number (y coordinate).")
        })?;
        let x2 = js_p2.get(0).as_f64().ok_or_else(|| {
            js_err!("First element of second point in 'twoPoints' array must be a number (x coordinate).")
        })?;
        let y2 = js_p2.get(1).as_f64().ok_or_else(|| {
            js_err!("Second element of second point in 'twoPoints' array must be a number (y coordinate).")
        })?;

        des::annot::Line::two_points(x1, y1, x2, y2)
    } else {
        return Err(js_err!(
            "Line annotation must have either 'horizontal', 'vertical', 'slope' or 'twoPoints' attribute.",
        ));
    };

    if let Some(js_stroke) = get_prop_if_defined(js_annot, "stroke") {
        let stroke = extract_theme_stroke(&js_stroke)?;
        line = line.with_stroke(stroke);
    }

    if let Some(js_pattern) = get_prop_if_defined(js_annot, "pattern") {
        let pattern = extract_stroke_pattern(&js_pattern)?;
        line = line.with_pattern(pattern);
    }

    Ok(line)
}

fn extract_arrow_annot(js_annot: &JsValue) -> Result<des::annot::Arrow, JsErr> {
    let (x, y) = extract_xy(js_annot, "xy")?;
    let (dx, dy) = extract_xy(js_annot, "dxy")?;
    let mut arrow = des::annot::Arrow::new(x, y, dx as f32, dy as f32);
    if let Some(head_size) = extract_number_prop_if_defined(js_annot, "head_size")? {
        arrow = arrow.with_head_size(head_size as f32);
    }
    if let Some(js_stroke) = get_prop_if_defined(js_annot, "stroke") {
        let stroke = extract_theme_stroke(&js_stroke)?;
        arrow = arrow.with_stroke(stroke);
    }
    Ok(arrow)
}

fn extract_marker_annot(js_annot: &JsValue) -> Result<des::annot::Marker, JsErr> {
    let (x, y) = extract_xy(js_annot, "xy")?;
    let mut annot = des::annot::Marker::new(x, y);

    if let Some(js_marker) = get_prop_if_defined(js_annot, "marker") {
        let marker = extract_theme_marker(&js_marker)?;
        annot = annot.with_marker(marker);
    }
    Ok(annot)
}

fn extract_label_annot(js_annot: &JsValue) -> Result<des::annot::Label, JsErr> {
    let (x, y) = extract_xy(js_annot, "xy")?;
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
                return Err(js_err!("Unknown anchor string: {}", anchor));
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
            return Err(js_err!(
                "'frame' array must have exactly 2 elements [fill, stroke]."
            ));
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
