use js_sys::Reflect;
use plotive::{Prepare, des::Figure};
use std::fmt;
use wasm_bindgen::prelude::*;

mod canvas_surface;
mod svg_surface;
// mod js_annot;
// mod js_axis;
// mod js_fig;
// mod js_series;
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
pub fn render_to_png_data_url(fig: JsValue, style: JsValue) -> Result<String, JsError> {
    use base64::prelude::*;
    use plotive_pxl::PxlRender;

    let fig: Figure = serde_wasm_bindgen::from_value(fig).map_err(|e| js_err!("Failed to deserialize figure: {}", e))?;
    //let fig = js_fig::extract_figure(&fig)?;
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

#[wasm_bindgen]
pub fn render_to_canvas(fig: JsValue, canvas: web_sys::HtmlCanvasElement, style: JsValue) -> Result<(), JsError> {
    let fig: Figure = serde_wasm_bindgen::from_value(fig).map_err(|e| js_err!("Failed to deserialize figure: {}", e))?;
    let style = js_style::extract_style(&style)?;
    let mut surf = canvas_surface::CanvasSurface::new(canvas);
    let fig = fig.prepare(&(), None).map_err(|e| js_err!("{}", e))?;
    fig.draw(&mut surf, &style);
    Ok(())
}

#[wasm_bindgen]
pub fn render_to_svg(fig: JsValue, svg: web_sys::SvgElement, style: JsValue) -> Result<(), JsError> {
    let fig: Figure = serde_wasm_bindgen::from_value(fig).map_err(|e| js_err!("Failed to deserialize figure: {}", e))?;
    let style = js_style::extract_style(&style)?;
    let mut surf = svg_surface::SvgSurface::new(svg);
    let fig = fig.prepare(&(), None).map_err(|e| js_err!("{}", e))?;
    fig.draw(&mut surf, &style);
    Ok(())
}

fn get_prop_if_defined(obj: &JsValue, prop: &str) -> Option<JsValue> {
    let name = JsValue::from_str(prop);
    Reflect::get(obj, &name).ok().filter(|v| !v.is_undefined())
}
