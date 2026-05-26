use js_sys::Float64Array;
use plotive::{
    des::{self, axis},
    Rgb8,
};
use wasm_bindgen::{JsCast, JsValue};

use crate::{
    extract_number_prop_if_defined, get_prop_if_defined, js_axis, js_err, js_style, JsErr,
};

pub fn extract_series(js_ser: &JsValue) -> Result<des::Series, JsErr> {
    let js_type = get_prop_if_defined(js_ser, "type")
        .ok_or_else(|| js_err!("'type' property must be defined for series"))?;
    let js_type = js_type
        .as_string()
        .ok_or_else(|| js_err!("'type' property must be a string"))?;
    match js_type.as_str() {
        "line" => extract_line_series(js_ser).map(des::Series::Line),
        "scatter" => extract_scatter_series(js_ser).map(des::Series::Scatter),
        "area" => extract_area_series(js_ser).map(des::Series::Area),
        "hist" => extract_histogram_series(js_ser).map(des::Series::Histogram),
        "bars" => extract_bars_series(js_ser).map(des::Series::Bars),
        _ => Err(js_err!("Unsupported series type '{}'", js_type)),
    }
}

fn extract_data_col(col: &JsValue) -> Result<des::DataCol, JsErr> {
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

        Err(js_err!(
            "Data array must contain either numbers or strings (non-null/undefined values).",
        ))
    } else {
        Err(js_err!(
            "DataCol must be either a string (source reference) or an array of values.",
        ))
    }
}

fn extract_common_props(
    js_ser: &JsValue,
) -> Result<(Option<String>, Option<axis::Ref>, Option<axis::Ref>), JsErr> {
    let name = get_prop_if_defined(js_ser, "name")
        .map(|v| {
            v.as_string()
                .ok_or_else(|| js_err!("'name' property must be a string"))
        })
        .transpose()?;
    let x_axis = get_prop_if_defined(js_ser, "xAxis")
        .map(|v| js_axis::extract_ref(&v))
        .transpose()?;
    let y_axis = get_prop_if_defined(js_ser, "yAxis")
        .map(|v| js_axis::extract_ref(&v))
        .transpose()?;
    Ok((name, x_axis, y_axis))
}

fn extract_interp(js_interp: &JsValue) -> Result<des::series::Interpolation, JsErr> {
    let interp_str = js_interp
        .as_string()
        .ok_or_else(|| js_err!("'interp' property must be a string"))?;
    let interp = match interp_str.as_str() {
        "linear" => des::series::Interpolation::Linear,
        "step-early" => des::series::Interpolation::StepEarly,
        "step-middle" => des::series::Interpolation::StepMiddle,
        "step-late" | "step" => des::series::Interpolation::StepLate,
        "cubic" | "spline" => des::series::Interpolation::Spline,
        _ => {
            return Err(js_err!("Unknown interpolation method: {}", interp_str));
        }
    };
    Ok(interp)
}

fn extract_cmap(js_cmap: &JsValue) -> Result<des::cmap::LerpColorMap, JsErr> {
    if let Some(builtin) = js_cmap.as_string() {
        return des::cmap::from_name(builtin.as_str())
            .ok_or_else(|| js_err!("'{}' isn't a valid color map", builtin));
    }
    if !js_cmap.is_object() {
        return Err(js_err!("'cmap' must either be a string or object"));
    }

    let js_cmap_prop = get_prop_if_defined(js_cmap, "cmap")
        .ok_or_else(|| js_err!("'cmap' property is missing in ColorMap"))?;
    let mut cmap: des::cmap::LerpColorMap = if js_cmap_prop.is_array() {
        let js_arr = js_sys::Array::from(&js_cmap_prop);
        let colors = js_arr
            .iter()
            .map(|js_color| {
                js_style::extract_color(&js_color)
                    .map(|rgba| rgba.rgb())
                    .map_err(|e| js_err!("Invalid color in 'cmap' array: {}", e))
            })
            .collect::<Result<Vec<Rgb8>, JsErr>>()?;
        let method = get_prop_if_defined(js_cmap, "method")
            .map(|js_method| {
                js_method
                    .as_string()
                    .ok_or_else(|| js_err!("'method' property in ColorMap must be a string"))
            })
            .transpose()?;
        let method = method.as_deref().unwrap_or_else(|| {
            if colors.len() >= 256 {
                "nearest"
            } else {
                "linear"
            }
        });
        let method = match method {
            "nearest" => des::cmap::LerpMethod::Nearest,
            "srgb" => des::cmap::LerpMethod::SRgb,
            "linear" => des::cmap::LerpMethod::LinearRgb,
            "perceptual" => des::cmap::LerpMethod::Perceptual,
            "xyz" => des::cmap::LerpMethod::Xyz,
            _ => {
                return Err(js_err!(
                    "Unknown interpolation method in ColorMap: {}",
                    method
                ))
            }
        };
        (method, colors.as_slice()).into()
    } else {
        js_cmap_prop.as_string().ok_or_else(|| js_err!("'cmap' property must be either an array of colors or a string (builtin cmap name)"))
            .and_then(|builtin| des::cmap::from_name(builtin.as_str()).ok_or_else(
                || js_err!("'{}' isn't a valid color map", builtin)
            ))?
    };

    let scale = get_prop_if_defined(js_cmap, "scale")
        .map(|js_scale| js_axis::extract_scale(&js_scale))
        .transpose()?;
    if let Some(scale) = scale {
        cmap = cmap.with_scale(scale);
    }
    Ok(cmap)
}

fn extract_line_series(js_ser: &JsValue) -> Result<des::series::Line, JsErr> {
    let js_x = get_prop_if_defined(js_ser, "x")
        .ok_or_else(|| js_err!("Line series must have 'x' property"))?;
    let js_y = get_prop_if_defined(js_ser, "y")
        .ok_or_else(|| js_err!("Line series must have 'y' property"))?;
    let x_data = extract_data_col(&js_x)?;
    let y_data = extract_data_col(&js_y)?;

    let mut line = des::series::Line::new(x_data, y_data);

    let (name, x_axis, y_axis) = extract_common_props(js_ser)?;
    if let Some(name) = name {
        line = line.with_name(name);
    }
    if let Some(x_axis) = x_axis {
        line = line.with_x_axis(x_axis);
    }
    if let Some(y_axis) = y_axis {
        line = line.with_y_axis(y_axis);
    }

    let stroke = get_prop_if_defined(js_ser, "stroke")
        .map(|js_stroke| js_style::extract_series_stroke(&js_stroke))
        .transpose()?;

    if let Some(stroke) = stroke {
        line = line.with_stroke(stroke);
    }

    if let Some(js_interp) = get_prop_if_defined(js_ser, "interp") {
        let interp = extract_interp(&js_interp)?;
        line = line.with_interpolation(interp);
    }
    Ok(line)
}

fn extract_scatter_series(js_ser: &JsValue) -> Result<des::series::Scatter, JsErr> {
    let js_x = get_prop_if_defined(js_ser, "x")
        .ok_or_else(|| js_err!("Scatter series must have 'x' property"))?;
    let js_y = get_prop_if_defined(js_ser, "y")
        .ok_or_else(|| js_err!("Scatter series must have 'y' property"))?;
    let x_data = extract_data_col(&js_x)?;
    let y_data = extract_data_col(&js_y)?;

    let mut scatter = des::series::Scatter::new(x_data, y_data);

    let (name, x_axis, y_axis) = extract_common_props(js_ser)?;
    if let Some(name) = name {
        scatter = scatter.with_name(name);
    }
    if let Some(x_axis) = x_axis {
        scatter = scatter.with_x_axis(x_axis);
    }
    if let Some(y_axis) = y_axis {
        scatter = scatter.with_y_axis(y_axis);
    }

    let sizes = get_prop_if_defined(js_ser, "sizes")
        .map(|js_sizes| extract_data_col(&js_sizes))
        .transpose()?;
    if let Some(sizes) = sizes {
        scatter = scatter.with_size_data(sizes);
    }

    let colors = get_prop_if_defined(js_ser, "colors")
        .map(|js_colors| extract_data_col(&js_colors))
        .transpose()?;
    let cmap = get_prop_if_defined(js_ser, "cmap")
        .map(|js_cmap| extract_cmap(&js_cmap))
        .transpose()?;
    if let Some(colors) = colors {
        let cmap = cmap.unwrap_or_else(|| des::cmap::viridis());
        scatter = scatter.with_color_data(colors, cmap);
    }

    if let Some(js_marker) = get_prop_if_defined(js_ser, "marker") {
        let marker = js_style::extract_series_marker(&js_marker)?;
        scatter = scatter.with_marker(marker);
    }
    Ok(scatter)
}

fn extract_area_series(js_ser: &JsValue) -> Result<des::series::Area, JsErr> {
    let js_x = get_prop_if_defined(js_ser, "x")
        .ok_or_else(|| js_err!("Area series must have 'x' property"))?;
    let js_y1 = get_prop_if_defined(js_ser, "y1")
        .ok_or_else(|| js_err!("Area series must have 'y1' property"))?;
    let x_data = extract_data_col(&js_x)?;
    let y1_data = extract_data_col(&js_y1)?;

    let y2_interp = get_prop_if_defined(js_ser, "y2Interp")
        .map(|js_interp| extract_interp(&js_interp))
        .transpose()?;

    let y2_data = get_prop_if_defined(js_ser, "y2")
        .map(|js_y2| {
            if let Some(baseline) = js_y2.as_f64() {
                Ok(des::series::AreaY2::Baseline(baseline))
            } else {
                let y2_interp = y2_interp.unwrap_or_default();
                extract_data_col(&js_y2).map(|dc| des::series::AreaY2::DataCol(dc, y2_interp))
            }
        })
        .transpose()?
        .unwrap_or_default();

    let mut area = des::series::Area::new(x_data, y1_data, y2_data);

    let (name, x_axis, y_axis) = extract_common_props(js_ser)?;
    if let Some(name) = name {
        area = area.with_name(name);
    }
    if let Some(x_axis) = x_axis {
        area = area.with_x_axis(x_axis);
    }
    if let Some(y_axis) = y_axis {
        area = area.with_y_axis(y_axis);
    }

    let fill = get_prop_if_defined(js_ser, "fill")
        .map(|js_fill| js_style::extract_series_fill(&js_fill))
        .transpose()?;
    if let Some(fill) = fill {
        area = area.with_fill(fill);
    }

    let y1_stroke = get_prop_if_defined(js_ser, "y1Stroke")
        .map(|js_stroke| js_style::extract_series_stroke(&js_stroke))
        .transpose()?;
    if let Some(y1_stroke) = y1_stroke {
        area = area.with_y1_stroke(y1_stroke);
    }
    let y2_stroke = get_prop_if_defined(js_ser, "y2Stroke")
        .map(|js_stroke| js_style::extract_series_stroke(&js_stroke))
        .transpose()?;
    if let Some(y2_stroke) = y2_stroke {
        area = area.with_y2_stroke(y2_stroke);
    }

    Ok(area)
}

fn extract_histogram_series(js_ser: &JsValue) -> Result<des::series::Histogram, JsErr> {
    let js_x = get_prop_if_defined(js_ser, "x")
        .ok_or_else(|| js_err!("Histogram series must have 'x' property"))?;
    let x_data = extract_data_col(&js_x)?;

    let mut hist = des::series::Histogram::new(x_data);

    let (name, x_axis, y_axis) = extract_common_props(js_ser)?;
    if let Some(name) = name {
        hist = hist.with_name(name);
    }
    if let Some(x_axis) = x_axis {
        hist = hist.with_x_axis(x_axis);
    }
    if let Some(y_axis) = y_axis {
        hist = hist.with_y_axis(y_axis);
    }

    let fill = get_prop_if_defined(js_ser, "fill")
        .map(|js_fill| js_style::extract_series_fill(&js_fill))
        .transpose()?;
    if let Some(fill) = fill {
        hist = hist.with_fill(fill);
    }

    let stroke = get_prop_if_defined(js_ser, "stroke")
        .map(|js_stroke| js_style::extract_series_stroke(&js_stroke))
        .transpose()?;
    if let Some(stroke) = stroke {
        hist = hist.with_stroke(stroke);
    }

    let bins = extract_number_prop_if_defined(js_ser, "bins")?;
    if let Some(bins) = bins {
        hist = hist.with_bins(bins as u32);
    }

    let density = get_prop_if_defined(js_ser, "density")
        .map(|js_density| {
            js_density
                .as_bool()
                .ok_or_else(|| js_err!("'density' property must be a boolean"))
        })
        .transpose()?;
    if let Some(true) = density {
        hist = hist.with_density();
    }

    Ok(hist)
}

fn extract_bars_position(js_position: &JsValue) -> Result<des::series::BarsPosition, JsErr> {
    let offset = get_prop_if_defined(js_position, "offset")
        .ok_or_else(|| js_err!("'offset' property is required for custom bars position"))?
        .as_f64()
        .ok_or_else(|| js_err!("'offset' property must be a number"))? as f32;
    let width = get_prop_if_defined(js_position, "width")
        .ok_or_else(|| js_err!("'width' property is required for custom bars position"))?
        .as_f64()
        .ok_or_else(|| js_err!("'width' property must be a number"))? as f32;
    Ok(des::series::BarsPosition { offset, width })
}

fn extract_bars_series(js_ser: &JsValue) -> Result<des::series::Bars, JsErr> {
    let js_x = get_prop_if_defined(js_ser, "x")
        .ok_or_else(|| js_err!("Bars series must have 'x' property"))?;
    let js_y = get_prop_if_defined(js_ser, "y")
        .ok_or_else(|| js_err!("Bars series must have 'y' property"))?;
    let x_data = extract_data_col(&js_x)?;
    let y_data = extract_data_col(&js_y)?;

    let mut bars = des::series::Bars::new(x_data, y_data);

    let (name, x_axis, y_axis) = extract_common_props(js_ser)?;
    if let Some(name) = name {
        bars = bars.with_name(name);
    }
    if let Some(x_axis) = x_axis {
        bars = bars.with_x_axis(x_axis);
    }
    if let Some(y_axis) = y_axis {
        bars = bars.with_y_axis(y_axis);
    }

    let fill = get_prop_if_defined(js_ser, "fill")
        .map(|js_fill| js_style::extract_series_fill(&js_fill))
        .transpose()?;
    if let Some(fill) = fill {
        bars = bars.with_fill(fill);
    }

    let stroke = get_prop_if_defined(js_ser, "stroke")
        .map(|js_stroke| js_style::extract_series_stroke(&js_stroke))
        .transpose()?;
    if let Some(stroke) = stroke {
        bars = bars.with_stroke(stroke);
    }

    if let Some(js_position) = get_prop_if_defined(js_ser, "position") {
        let position = extract_bars_position(&js_position)?;
        bars = bars.with_position(position);
    }

    Ok(bars)
}
