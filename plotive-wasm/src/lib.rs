use js_sys::Reflect;
use plotive::Prepare;
use wasm_bindgen::prelude::*;

mod js_annot;
mod js_axis;
mod js_fig;
mod js_series;
mod js_style;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn render_figure(fig: JsValue) -> Result<String, JsValue> {
    let fig = js_fig::extract_figure(&fig)?;
    let mut surf = plotive_svg::SvgSurface::new(800, 600);
    let fig = fig.prepare(&(), None).map_err(|e| JsValue::from_str(&e.to_string()))?;
    fig.draw(&mut surf, &Default::default());
    let mut svg_str = Vec::new();
    surf.write(&mut svg_str).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let svg_str = String::from_utf8(svg_str).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(svg_str)
}

fn get_prop_if_defined(obj: &JsValue, prop: &str) -> Option<JsValue> {
    let name = JsValue::from_str(prop);
    if Reflect::has(obj, &name).unwrap_or(false) {
        Reflect::get(obj, &name).ok()
    } else {
        None
    }
}

fn extract_type(js_obj: &JsValue) -> Result<String, JsValue> {
    get_prop_if_defined(js_obj, "type")
        .ok_or_else(|| JsValue::from_str("'type' property is required."))?
        .as_string()
        .ok_or_else(|| JsValue::from_str("'type' property must be a string."))
}

fn extract_string_prop(js_obj: &JsValue, prop: &str) -> Result<String, JsValue> {
    get_prop_if_defined(js_obj, prop)
        .ok_or_else(|| JsValue::from_str(&format!("'{}' property is required.", prop)))?
        .as_string()
        .ok_or_else(|| JsValue::from_str(&format!("'{}' property must be a string.", prop)))
}

fn extract_string_prop_if_defined(js_obj: &JsValue, prop: &str) -> Result<Option<String>, JsValue> {
    get_prop_if_defined(js_obj, prop)
        .map(|v| {
            v.as_string()
                .ok_or_else(|| JsValue::from_str(&format!("'{}' property must be a string.", prop)))
        })
        .transpose()
}

fn extract_number_prop(js_obj: &JsValue, prop: &str) -> Result<f64, JsValue> {
    get_prop_if_defined(js_obj, prop)
        .ok_or_else(|| JsValue::from_str(&format!("'{}' property is required.", prop)))?
        .as_f64()
        .ok_or_else(|| JsValue::from_str(&format!("'{}' property must be a number.", prop)))
}

fn extract_number_prop_if_defined(js_obj: &JsValue, prop: &str) -> Result<Option<f64>, JsValue> {
    get_prop_if_defined(js_obj, prop)
        .map(|v| {
            v.as_f64()
                .ok_or_else(|| JsValue::from_str(&format!("'{}' property must be a number.", prop)))
        })
        .transpose()
}

fn extract_array_prop_if_defined(js_obj: &JsValue, prop: &str) -> Result<Option<js_sys::Array>, JsValue> {
    get_prop_if_defined(js_obj, prop)
        .map(|v| {
            v.dyn_into::<js_sys::Array>()
        })
        .transpose()
}
