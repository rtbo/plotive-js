use js_sys::Float64Array;
use plotive::{des, style};
use wasm_bindgen::{JsCast, JsValue};

use crate::{get_prop_if_defined, js_axis, js_style};

pub fn extract_series(js_ser: &JsValue) -> Result<des::Series, JsValue> {
    let js_type = get_prop_if_defined(js_ser, "type")
        .ok_or_else(|| JsValue::from_str("'type' property must be defined for series"))?;
    let js_type = js_type
        .as_string()
        .ok_or_else(|| JsValue::from_str("'type' property must be a string"))?;
    match js_type.as_str() {
        "line" => extract_line_series(js_ser).map(des::Series::Line),
        _ => Err(JsValue::from_str(&format!(
            "Unsupported series type '{}'",
            js_type
        ))),
    }
}

fn extract_data_col(col: &JsValue) -> Result<des::DataCol, JsValue> {
    if let Some(src_ref) = col.as_string() {
        Ok(des::DataCol::SrcRef(src_ref))
    } else if let Some(js_arr) = col.dyn_ref::<Float64Array>() {
        Ok(des::DataCol::Inline(js_arr.to_vec().into()))
    } else if col.is_array() {
        let arr = js_sys::Array::from(col);
        if arr.length() == 0 {
            return Ok(des::DataCol::Inline(Vec::<f64>::new().into()));
        }
        let mut idx = 0;
        while idx < arr.length() {
            let val = arr.get(idx);
            if val.is_null_or_undefined() {
                idx += 1;
                continue;
            }
            if let Some(_) = val.as_f64() {
                let col: Vec<f64> = arr.iter().map(|v| v.as_f64().unwrap_or(f64::NAN)).collect();
                return Ok(des::DataCol::Inline(col.into()));
            }
            if let Some(_) = val.as_string() {
                let col: Vec<String> = arr
                    .iter()
                    .map(|v| v.as_string().unwrap_or_default())
                    .collect();
                return Ok(des::DataCol::Inline(col.into()));
            }
        }

        Err(JsValue::from_str(
            "Data array must contain either numbers or strings (non-null/undefined values).",
        ))
    } else {
        Err(JsValue::from_str(
            "DataCol must be either a string (source reference) or an array of values.",
        ))
    }
}

fn extract_line_series(js_ser: &JsValue) -> Result<des::series::Line, JsValue> {
    let js_x = get_prop_if_defined(js_ser, "x")
        .ok_or_else(|| JsValue::from_str("Line series must have 'x' property"))?;
    let js_y = get_prop_if_defined(js_ser, "y")
        .ok_or_else(|| JsValue::from_str("Line series must have 'y' property"))?;
    let x_data = extract_data_col(&js_x)?;
    let y_data = extract_data_col(&js_y)?;

    let mut line = des::series::Line::new(x_data, y_data);

    if let Some(js_name) = get_prop_if_defined(js_ser, "name") {
        let name: String = js_name
            .as_string()
            .ok_or_else(|| JsValue::from_str("'name' property must be a string"))?;
        line = line.with_name(name);
    }
    if let Some(js_x_axis) = get_prop_if_defined(js_ser, "xAxis") {
        let x_axis = js_axis::extract_ref(&js_x_axis)?;
        line = line.with_x_axis(x_axis);
    }
    if let Some(js_y_axis) = get_prop_if_defined(js_ser, "yAxis") {
        let y_axis = js_axis::extract_ref(&js_y_axis)?;
        line = line.with_y_axis(y_axis);
    }
    let js_width = get_prop_if_defined(js_ser, "linewidth");
    let js_styl = get_prop_if_defined(js_ser, "linestyle");
    let js_color = get_prop_if_defined(js_ser, "color");
    if !js_width.is_none() || !js_styl.is_none() || !js_color.is_none() {
        let mut stroke = style::series::Stroke::default();
        if !js_width.is_none() {
            stroke.width = js_width
                .unwrap()
                .as_f64()
                .ok_or_else(|| JsValue::from_str("'linewidth' property must be a number"))?
                as f32;
        }
        if !js_styl.is_none() {
            stroke.pattern = js_style::extract_stroke_pattern(&js_styl.unwrap())?;
        }
        if !js_color.is_none() {
            stroke.color = js_style::extract_series_color(&js_color.unwrap())?;
        }
        line = line.with_line(stroke);
    }

    if let Some(js_interp) = get_prop_if_defined(js_ser, "interpolation") {
        let interp_str = js_interp
            .as_string()
            .ok_or_else(|| JsValue::from_str("'interpolation' property must be a string"))?;
        let interp = match interp_str.as_str() {
            "linear" => des::series::Interpolation::Linear,
            "step-early" => des::series::Interpolation::StepEarly,
            "step-middle" => des::series::Interpolation::StepMiddle,
            "step-late" | "step" => des::series::Interpolation::StepLate,
            "cubic" | "spline" => des::series::Interpolation::Spline,
            _ => {
                return Err(JsValue::from_str(&format!(
                    "Unknown interpolation method: {}",
                    interp_str
                )));
            }
        };
        line = line.with_interpolation(interp);
    }
    Ok(line)
}
