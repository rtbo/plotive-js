use js_sys::Reflect;
use plotive::Prepare;
use std::fmt;
use wasm_bindgen::prelude::*;

mod js_annot;
mod js_axis;
mod js_fig;
mod js_series;
mod js_style;

#[derive(Debug)]
struct JsErr(pub String);

impl fmt::Display for JsErr {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<String> for JsErr {
    fn from(s: String) -> Self {
        Self(s)
    }
}

impl std::error::Error for JsErr {}

macro_rules! js_err {
    ($($arg:tt)*) => {
        JsErr(format!($($arg)*))
    };
}

pub(crate) use js_err;

#[allow(unused_macros)]
macro_rules! console_log {
    ($($arg:tt)*) => {
        web_sys::console::log_1(&format!($($arg)*).into());
    };
}

#[allow(unused_imports)]
pub(crate) use console_log;



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
pub fn render_to_svg_string(fig: JsValue, style: JsValue) -> Result<String, JsError> {
    let fig = js_fig::extract_figure(&fig)?;
    let style = js_style::extract_style(&style)?;
    let width = fig.size().width() as u32;
    let height = fig.size().height() as u32;
    let mut surf = plotive_svg::SvgSurface::new(width, height);
    let fig = fig.prepare(&(), None).map_err(|e| js_err!("{}", e))?;
    fig.draw(&mut surf, &style);
    let mut svg_str = Vec::new();
    surf.write(&mut svg_str).map_err(|e| js_err!("{}", e))?;
    let svg_str = String::from_utf8(svg_str).map_err(|e| js_err!("{}", e))?;
    Ok(svg_str)
}

#[wasm_bindgen]
pub fn render_to_png_data_url(fig: JsValue, style: JsValue) -> Result<String, JsError> {
    use base64::prelude::*;
    use plotive_pxl::PxlRender;

    let fig = js_fig::extract_figure(&fig)?;
    let style = js_style::extract_style(&style)?;
    let params = plotive_pxl::Params {
        style,
        ..Default::default()
    };
    let png_data = fig.to_png_data(&(), params).map_err(|e| js_err!("{}", e))?;

    Ok(format!(
        "data:image/png;base64,{}",
        BASE64_STANDARD.encode(&png_data)
    ))
}

fn get_prop_if_defined(obj: &JsValue, prop: &str) -> Option<JsValue> {
    let name = JsValue::from_str(prop);
    Reflect::get(obj, &name).ok().filter(|v| !v.is_undefined())
}

fn extract_type(js_obj: &JsValue) -> Result<String, JsErr> {
    get_prop_if_defined(js_obj, "type")
        .ok_or_else(|| js_err!("'type' property is required."))?
        .as_string()
        .ok_or_else(|| js_err!("'type' property must be a string."))
}

fn extract_string_prop(js_obj: &JsValue, prop: &str) -> Result<String, JsErr> {
    get_prop_if_defined(js_obj, prop)
        .ok_or_else(|| js_err!("'{}' property is required.", prop))?
        .as_string()
        .ok_or_else(|| js_err!("'{}' property must be a string.", prop))
}

fn extract_string_prop_if_defined(js_obj: &JsValue, prop: &str) -> Result<Option<String>, JsErr> {
    get_prop_if_defined(js_obj, prop)
        .map(|v| {
            v.as_string()
                .ok_or_else(|| js_err!("'{}' property must be a string.", prop))
        })
        .transpose()
}

fn extract_number_prop(js_obj: &JsValue, prop: &str) -> Result<f64, JsErr> {
    get_prop_if_defined(js_obj, prop)
        .ok_or_else(|| js_err!("'{}' property is required.", prop))?
        .as_f64()
        .ok_or_else(|| js_err!("'{}' property must be a number.", prop))
}

fn extract_number_prop_if_defined(js_obj: &JsValue, prop: &str) -> Result<Option<f64>, JsErr> {
    get_prop_if_defined(js_obj, prop)
        .map(|v| {
            v.as_f64()
                .ok_or_else(|| js_err!("'{}' property must be a number.", prop))
        })
        .transpose()
}

fn extract_array_prop_if_defined(
    js_obj: &JsValue,
    prop: &str,
) -> Result<Option<js_sys::Array>, JsErr> {
    get_prop_if_defined(js_obj, prop)
        .map(|v| v.dyn_into::<js_sys::Array>())
        .transpose()
        .map_err(|_| js_err!("'{}' property must be an array.", prop))
}
