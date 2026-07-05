use js_sys::Reflect;
use plotive::{des::Figure, Prepare};
use std::fmt;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

mod canvas_surface;
mod js_style;
mod svg_surface;

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

struct Params {
    style: plotive::Style,
    fontdb: Option<plotive::text::fontdb::Database>,
}

fn extract_fontdb(js_fontdb: &JsValue) -> Result<plotive::text::fontdb::Database, JsErr> {
    let mut fontdb = plotive::text::bundled_font_db();

    let fonts = js_fontdb
        .dyn_ref::<js_sys::Array>()
        .ok_or_else(|| js_err!("params.fontdb must be an array of FontBinary"))?;

    for (i, js_font) in fonts.iter().enumerate() {
        let bytes = if let Some(typed) = js_font.dyn_ref::<js_sys::Uint8Array>() {
            typed.to_vec()
        } else if let Some(buffer) = js_font.dyn_ref::<js_sys::ArrayBuffer>() {
            js_sys::Uint8Array::new(buffer).to_vec()
        } else if js_sys::ArrayBuffer::is_view(&js_font) {
            js_sys::Uint8Array::new(&js_font).to_vec()
        } else {
            return Err(js_err!(
                "params.fontdb[{}] must be Uint8Array, ArrayBuffer, or ArrayBufferView",
                i
            ));
        };

        use woff2_patched::decode::{is_woff2, convert_woff2_to_ttf};

        let bytes = if is_woff2(&bytes) {
            let mut bytes = bytes.as_slice();
            convert_woff2_to_ttf(&mut bytes)
                .map_err(|err| js_err!("Error while converting WOFF font file: {err}"))?
        } else {
            bytes
        };

        fontdb.load_font_data(bytes);
    }

    Ok(fontdb)
}

fn extract_params(js_params: &JsValue) -> Result<Params, JsErr> {
    let mut style = None;
    let mut fontdb = None;

    if let Some(js_style) = get_prop_if_defined(js_params, "style") {
        style = Some(js_style::extract_style(&js_style)?);
    }

    if let Some(js_fontdb) = get_prop_if_defined(js_params, "fontdb") {
        fontdb = Some(extract_fontdb(&js_fontdb)?);
    }

    Ok(Params {
        style: style.unwrap_or_default(),
        fontdb,
    })
}

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
pub fn render_to_png_data_url(fig: JsValue, js_params: JsValue) -> Result<String, JsError> {
    use base64::prelude::*;
    use plotive_pxl::PxlRender;

    let fig: Figure = serde_wasm_bindgen::from_value(fig)
        .map_err(|e| js_err!("Failed to deserialize figure: {}", e))?;

    let params = extract_params(&js_params)?;
    let pxl_params = plotive_pxl::Params {
        style: params.style,
        fontdb: params.fontdb.as_ref(),
        ..Default::default()
    };

    let png_data = fig.to_png_data(&(), pxl_params).map_err(|e| js_err!("{}", e))?;

    Ok(format!(
        "data:image/png;base64,{}",
        BASE64_STANDARD.encode(&png_data)
    ))
}

#[wasm_bindgen]
pub fn render_to_png_bytes(fig: JsValue, js_params: JsValue) -> Result<js_sys::Uint8Array, JsError> {
    use plotive_pxl::PxlRender;

    let fig: Figure = serde_wasm_bindgen::from_value(fig)
        .map_err(|e| js_err!("Failed to deserialize figure: {}", e))?;

    let params = extract_params(&js_params)?;
    let pxl_params = plotive_pxl::Params {
        style: params.style,
        fontdb: params.fontdb.as_ref(),
        ..Default::default()
    };

    let png_data = fig.to_png_data(&(), pxl_params).map_err(|e| js_err!("{}", e))?;

    Ok(js_sys::Uint8Array::from(&png_data[..]))
}

#[wasm_bindgen]
pub fn render_to_canvas(
    fig: JsValue,
    canvas: web_sys::HtmlCanvasElement,
    js_params: JsValue,
) -> Result<(), JsError> {
    let fig: Figure = serde_wasm_bindgen::from_value(fig)
        .map_err(|e| js_err!("Failed to deserialize figure: {}", e))?;
    let params = extract_params(&js_params)?;
    let mut surf = canvas_surface::CanvasSurface::new(canvas);
    let fig = fig
        .prepare(&(), params.fontdb.as_ref())
        .map_err(|e| js_err!("{}", e))?;
    fig.draw(&mut surf, &params.style);
    Ok(())
}

#[wasm_bindgen]
pub fn render_to_svg(
    fig: JsValue,
    svg: web_sys::SvgElement,
    js_params: JsValue,
) -> Result<(), JsError> {
    let fig: Figure = serde_wasm_bindgen::from_value(fig)
        .map_err(|e| js_err!("Failed to deserialize figure: {}", e))?;
    let params = extract_params(&js_params)?;
    let mut surf = svg_surface::SvgSurface::new(svg);
    let fig = fig
        .prepare(&(), params.fontdb.as_ref())
        .map_err(|e| js_err!("{}", e))?;
    fig.draw(&mut surf, &params.style);
    Ok(())
}

fn get_prop_if_defined(obj: &JsValue, prop: &str) -> Option<JsValue> {
    let name = JsValue::from_str(prop);
    Reflect::get(obj, &name).ok().filter(|v| !v.is_undefined())
}
