use js_sys::Reflect;
use plotive::des;
use wasm_bindgen::JsValue;

use crate::{extract_type, get_prop_if_defined, js_style, JsErr, js_err};

pub fn extract_ref(js_ref: &JsValue) -> Result<des::axis::Ref, JsErr> {
    if let Some(idx) = js_ref.as_f64() {
        Ok(des::axis::Ref::Idx(idx as usize))
    } else if let Some(id_or_title) = js_ref.as_string() {
        Ok(des::axis::Ref::Id(id_or_title))
    } else {
        Err(js_err!(
            "Axis reference must be a number (index) or string (id or title).",
        ))
    }
}

pub fn extract_axis(js_axis: &JsValue) -> Result<des::Axis, JsErr> {
    let mut axis = des::Axis::new();

    if let Some(js_scale) = get_prop_if_defined(js_axis, "scale") {
        if let Some(typ) = js_scale.as_string() {
            match typ.as_str() {
                "auto" => {
                    axis = axis.with_scale(des::axis::Scale::Auto);
                }
                "lin" => {
                    axis = axis.with_scale(des::axis::Range::default().into());
                }
                "log" => {
                    axis = axis.with_scale(des::axis::LogScale::default().into());
                }
                "shared" => {
                    return Err(js_err!(
                        "Shared scale requires a 'ref' property. Please provide an object with 'type' and 'ref' properties.",
                    ));
                }
                _ => {
                    return Err(js_err!("Unsupported scale type: {}", typ));
                }
            }
        } else {
            axis = axis.with_scale(extract_scale(&js_scale)?);
        }
    }

    if let Some(js_title) = get_prop_if_defined(js_axis, "title") {
        let title = js_title
            .as_string()
            .ok_or_else(|| js_err!("'title' property must be a string"))?;
        axis = axis.with_title(title.into());
    }

    if let Some(js_id) = get_prop_if_defined(js_axis, "id") {
        let id = js_id
            .as_string()
            .ok_or_else(|| js_err!("'id' property must be a string"))?;
        axis = axis.with_id(id);
    }

    if let Some(js_side) = get_prop_if_defined(js_axis, "side") {
        let side = js_side
            .as_string()
            .ok_or_else(|| js_err!("'side' property must be a string"))?;
        match side.as_str() {
            "top" | "right" => axis = axis.with_opposite_side(),
            "bottom" | "left" => {}
            _ => {
                return Err(js_err!(
                    "Invalid 'side' value. Must be 'top', 'right', 'bottom', or 'left'.",
                ))
            }
        }
    }

    if let Some(js_ticks) = get_prop_if_defined(js_axis, "ticks") {
        let ticks = extract_ticks(&js_ticks)?;
        axis = axis.with_ticks(ticks);
    }

    if let Some(js_grid) = get_prop_if_defined(js_axis, "grid") {
        let stroke = js_style::extract_theme_stroke(&js_grid)?;
        axis = axis.with_grid(stroke.into());
    }

    if let Some(js_minor_ticks) = get_prop_if_defined(js_axis, "minorTicks") {
        let locator = extract_ticks_locator(&js_minor_ticks)?;
        let minor_ticks = des::axis::MinorTicks::new().with_locator(locator);
        axis = axis.with_minor_ticks(minor_ticks);
    }

    if let Some(js_minor_grid) = get_prop_if_defined(js_axis, "minorGrid") {
        let stroke = js_style::extract_theme_stroke(&js_minor_grid)?;
        axis = axis.with_minor_grid(stroke.into());
    }

    Ok(axis)
}

fn extract_range(js_scale: &JsValue) -> Result<des::axis::Range, JsErr> {
    let min = if let Some(m) = get_prop_if_defined(js_scale, "min") {
        if m.is_null() {
            None
        } else {
            Some(
                m.as_f64()
                    .ok_or_else(|| js_err!("'min' property must be a number"))?,
            )
        }
    } else {
        None
    };
    let max = if let Some(m) = get_prop_if_defined(js_scale, "max") {
        if m.is_null() {
            None
        } else {
            Some(
                m.as_f64()
                    .ok_or_else(|| js_err!("'max' property must be a number"))?,
            )
        }
    } else {
        None
    };
    Ok(des::axis::Range(min, max))
}

fn extract_scale(js_scale: &JsValue) -> Result<des::axis::Scale, JsErr> {
    let typ_name = extract_type(js_scale)?;

    match typ_name.as_str() {
        "auto" => Ok(des::axis::Scale::Auto),
        "lin" => Ok(des::axis::Scale::Linear(extract_range(js_scale)?)),
        "log" => Ok(des::axis::LogScale::new(
            get_prop_if_defined(js_scale, "base")
                .unwrap_or(JsValue::from_f64(10.0))
                .as_f64()
                .ok_or_else(|| js_err!("'base' property must be a number"))?,
            extract_range(&js_scale)?,
        )
        .into()),
        "shared" => Ok(des::axis::Scale::Shared(extract_ref(
            &get_prop_if_defined(js_scale, "ref")
                .ok_or_else(|| js_err!("'ref' property is required for shared scale"))?,
        )?)),
        _ => Err(js_err!("Unsupported scale type: {}", typ_name)),
    }
}

fn extract_number_array_prop_or_else<T, F>(
    js_parent: &JsValue,
    field: &str,
    default: F,
) -> Result<Vec<T>, JsErr>
where
    T: From<f64>,
    F: FnOnce() -> Vec<T>,
{
    let property_key = JsValue::from_str(field);
    if Reflect::has(js_parent, &property_key).unwrap_or(false) {
        let js_array = Reflect::get(js_parent, &property_key)
            .map_err(|_| js_err!("Failed to get '{}' property", field))?;
        if !js_array.is_array() {
            return Err(js_err!("'{}' property must be an array", field));
        }
        let arr = js_sys::Array::from(&js_array);
        let mut result = Vec::with_capacity(arr.length() as usize);
        for i in 0..arr.length() {
            let val = arr.get(i);
            if let Some(num) = val.as_f64() {
                result.push(T::from(num));
            } else {
                return Err(js_err!(
                    "Expected a number at index {} in the '{}' array",
                    i,
                    field
                ));
            }
        }
        Ok(result)
    } else {
        Ok(default())
    }
}

fn extract_ticks_locator_from_str(str: &str) -> Result<des::axis::ticks::Locator, JsErr> {
    match str {
        "auto" => Ok(des::axis::ticks::Locator::Auto),
        "maxn" => Ok(des::axis::ticks::MaxNLocator {
            bins: 10,
            steps: vec![1.0, 2.0, 5.0],
        }
        .into()),
        "pimultiple" => Ok(des::axis::ticks::PiMultipleLocator { bins: 10 }.into()),
        "log" => Ok(des::axis::ticks::LogLocator { base: 10.0 }.into()),
        "datetime" => Ok(des::axis::ticks::DateTimeLocator::Auto.into()),
        "timedelta" => Ok(des::axis::ticks::TimeDeltaLocator::Auto.into()),
        _ => Err(js_err!("Unsupported ticks locator type: {}", str)),
    }
}

fn extract_ticks_locator(js_locator: &JsValue) -> Result<des::axis::ticks::Locator, JsErr> {
    if let Some(str) = js_locator.as_string() {
        return extract_ticks_locator_from_str(&str);
    }
    let typ_name = extract_type(js_locator)?;
    match typ_name.as_str() {
        "auto" => Ok(des::axis::ticks::Locator::Auto),
        "maxn" => Ok(des::axis::ticks::MaxNLocator {
            bins: get_prop_if_defined(js_locator, "bins")
                .unwrap_or_else(|| JsValue::from_f64(10.0))
                .as_f64()
                .ok_or_else(|| js_err!("'bins' property must be a number"))?
                as u32,
            steps: extract_number_array_prop_or_else(js_locator, "steps", || vec![1.0, 2.0, 5.0])?,
        }
        .into()),
        "pimultiple" => Ok(des::axis::ticks::PiMultipleLocator {
            bins: get_prop_if_defined(js_locator, "bins")
                .unwrap_or_else(|| JsValue::from_f64(10.0))
                .as_f64()
                .ok_or_else(|| js_err!("'bins' property must be a number"))?
                as u32,
        }
        .into()),
        "log" => Ok(des::axis::ticks::LogLocator {
            base: get_prop_if_defined(js_locator, "base")
                .unwrap_or_else(|| JsValue::from_f64(10.0))
                .as_f64()
                .ok_or_else(|| js_err!("'base' property must be a number"))?,
        }
        .into()),
        "datetime" => {
            if let Some(period) = get_prop_if_defined(js_locator, "period") {
                if !period.is_array() {
                    return Err(js_err!(
                        "'period' property must be an array of [number, unit string]",
                    ));
                }
                let arr = js_sys::Array::from(&period);
                if arr.length() != 2 {
                    return Err(js_err!(
                        "'period' property must be an array of [number, unit string]",
                    ));
                }
                let num = arr.get(0).as_f64().ok_or_else(|| {
                    js_err!("First element of 'period' array must be a number")
                })? as u32;
                let unit = arr.get(1).as_string().ok_or_else(|| {
                    js_err!("Second element of 'period' array must be a string")
                })?;
                match unit.as_str() {
                    "micro" => Ok(des::axis::ticks::DateTimeLocator::Micros(num).into()),
                    "milli" => Ok(des::axis::ticks::DateTimeLocator::Micros(num * 1000).into()),
                    "sec" => Ok(des::axis::ticks::DateTimeLocator::Seconds(num).into()),
                    "min" => Ok(des::axis::ticks::DateTimeLocator::Minutes(num).into()),
                    "hour" => Ok(des::axis::ticks::DateTimeLocator::Hours(num).into()),
                    "day" => Ok(des::axis::ticks::DateTimeLocator::Days(num).into()),
                    "week" => Ok(des::axis::ticks::DateTimeLocator::Weeks(num).into()),
                    "month" => Ok(des::axis::ticks::DateTimeLocator::Months(num).into()),
                    "year" => Ok(des::axis::ticks::DateTimeLocator::Years(num).into()),
                    _ => Err(js_err!("Unknown DateTimeTicksLocator unit: {}", unit)),
                }
            } else {
                Ok(des::axis::ticks::DateTimeLocator::Auto.into())
            }
        }
        "timedelta" => {
            if let Some(period) = get_prop_if_defined(js_locator, "period") {
                if !period.is_array() {
                    return Err(js_err!(
                        "'period' property must be an array of [number, unit string]",
                    ));
                }
                let arr = js_sys::Array::from(&period);
                if arr.length() != 2 {
                    return Err(js_err!(
                        "'period' property must be an array of [number, unit string]",
                    ));
                }
                let num = arr.get(0).as_f64().ok_or_else(|| {
                    js_err!("First element of 'period' array must be a number")
                })? as u32;
                let unit = arr.get(1).as_string().ok_or_else(|| {
                    js_err!("Second element of 'period' array must be a string")
                })?;
                match unit.as_str() {
                    "micro" => Ok(des::axis::ticks::TimeDeltaLocator::Micros(num).into()),
                    "milli" => Ok(des::axis::ticks::TimeDeltaLocator::Micros(num * 1000).into()),
                    "sec" => Ok(des::axis::ticks::TimeDeltaLocator::Seconds(num).into()),
                    "min" => Ok(des::axis::ticks::TimeDeltaLocator::Minutes(num).into()),
                    "hour" => Ok(des::axis::ticks::TimeDeltaLocator::Hours(num).into()),
                    "day" => Ok(des::axis::ticks::TimeDeltaLocator::Days(num).into()),
                    _ => Err(js_err!("Unknown TimeDeltaTicksLocator unit: {}", unit)),
                }
            } else {
                Ok(des::axis::ticks::TimeDeltaLocator::Auto.into())
            }
        }
        _ => Err(js_err!("Unsupported ticks locator type: {}", typ_name)),
    }
}

fn extract_ticks_formatter(js_formatter: &JsValue) -> Result<des::axis::ticks::Formatter, JsErr> {
    let typ_name = extract_type(js_formatter)?;
    match typ_name.as_str() {
        "auto" => Ok(des::axis::ticks::Formatter::Auto),
        "shared-auto" => Ok(des::axis::ticks::Formatter::SharedAuto),
        "decimal" => Ok(des::axis::ticks::Formatter::Prec(
            get_prop_if_defined(js_formatter, "precision")
                .unwrap_or_else(|| JsValue::from_f64(2.0))
                .as_f64()
                .ok_or_else(|| js_err!("'precision' property must be a number"))?
                as usize,
        )),
        "percent" => Ok(des::axis::ticks::PercentFormatter {
            decimal_places: get_prop_if_defined(js_formatter, "decimals")
                .map(|d| {
                    d.as_f64()
                        .ok_or_else(|| js_err!("'decimals' property must be a number"))
                })
                .transpose()?
                .map(|d| d as usize),
        }
        .into()),
        "datetime" | "date" | "time" => {
            let fmt: Option<String> = get_prop_if_defined(js_formatter, "fmt")
                .map(|f| {
                    f.as_string()
                        .ok_or_else(|| js_err!("'fmt' property must be a string"))
                })
                .transpose()?;
            let formatter = match (fmt, typ_name.as_str()) {
                (Some(f), _) => des::axis::ticks::DateTimeFormatter::Custom(f),
                (None, "datetime") => des::axis::ticks::DateTimeFormatter::Auto,
                (None, "date") => des::axis::ticks::DateTimeFormatter::Date,
                (None, "time") => des::axis::ticks::DateTimeFormatter::Time,
                _ => unreachable!(),
            };
            Ok(formatter.into())
        }
        "timedelta" => {
            let fmt: Option<String> = get_prop_if_defined(js_formatter, "fmt")
                .map(|f| {
                    f.as_string()
                        .ok_or_else(|| js_err!("'fmt' property must be a string"))
                })
                .transpose()?;
            let formatter = fmt
                .map(|f| des::axis::ticks::TimeDeltaFormatter::Custom(f))
                .unwrap_or_else(|| des::axis::ticks::TimeDeltaFormatter::Auto);
            Ok(formatter.into())
        }
        _ => Err(js_err!("Unsupported ticks formatter type: {}", typ_name)),
    }
}

fn extract_ticks(js_ticks: &JsValue) -> Result<des::axis::Ticks, JsErr> {
    let mut ticks = des::axis::Ticks::default();
    if let Some(js_ticks) = js_ticks.as_string() {
        match js_ticks.as_str() {
            "percent" => {
                ticks = ticks
                    .with_formatter(Some(des::axis::ticks::PercentFormatter::default().into()));
            }
            _ => {
                ticks = ticks.with_locator(extract_ticks_locator_from_str(&js_ticks)?);
            }
        }
        return Ok(ticks);
    }
    if let Some(js_locator) = get_prop_if_defined(js_ticks, "locator") {
        let locator = extract_ticks_locator(&js_locator)?;
        ticks = ticks.with_locator(locator);
    }
    if let Some(js_formatter) = get_prop_if_defined(js_ticks, "formatter") {
        if js_formatter.is_null() {
            ticks = ticks.with_formatter(None);
        } else {
            let formatter = extract_ticks_formatter(&js_formatter)?;
            ticks = ticks.with_formatter(Some(formatter));
        }
    }
    Ok(ticks)
}
