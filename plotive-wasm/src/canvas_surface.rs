use plotive::geom;
use plotive::render;
use wasm_bindgen::{JsCast, JsValue};

pub struct CanvasSurface {
    canvas: web_sys::HtmlCanvasElement,
    ctx: web_sys::CanvasRenderingContext2d,
}

impl CanvasSurface {
    pub fn new(canvas: web_sys::HtmlCanvasElement) -> Self {
        let context = canvas
            .get_context("2d")
            .unwrap()
            .unwrap()
            .dyn_into::<web_sys::CanvasRenderingContext2d>()
            .unwrap();
        Self { canvas, ctx: context }
    }

    fn set_fill_style(&mut self, paint: &render::Paint) {
        match paint {
            render::Paint::Solid(color) => {
                let css_color = format!(
                    "rgba({}, {}, {}, {})",
                    color.r(),
                    color.g(),
                    color.b(),
                    (color.a() as f32 / 255.0),
                );
                self.ctx.set_fill_style_str(&css_color);
            }
        }
    }

    fn set_stroke_style(&mut self, stroke: &render::Stroke) {
        let css_color = format!(
            "rgba({}, {}, {}, {})",
            stroke.color.r(),
            stroke.color.g(),
            stroke.color.b(),
            (stroke.color.a() as f32 / 255.0),
        );
        self.ctx.set_stroke_style_str(&css_color);
        let width = stroke.width as f64;
        self.ctx.set_line_width(width);
        match stroke.pattern {
            render::LinePattern::Solid => (),
            render::LinePattern::Dash(dash) => {
                let dash_array = js_sys::Array::new();
                for &d in dash {
                    dash_array.push(&JsValue::from_f64(d as f64 * width));
                }
                self.ctx.set_line_dash(&dash_array).unwrap();
            }
        }
    }
}


impl render::Surface for CanvasSurface {
    fn prepare(&mut self, size: geom::Size) {
        self.canvas.set_width(size.width() as u32);
        self.canvas.set_height(size.height() as u32);
        self.ctx.reset();
    }

    fn fill(&mut self, fill: render::Paint) {
        self.ctx.save();
        self.ctx.rect(0.0, 0.0, self.canvas.width() as f64, self.canvas.height() as f64);
        self.set_fill_style(&fill);
        self.ctx.fill();
        self.ctx.restore();
    }

    fn draw_path(&mut self, path: &render::Path) {
        self.ctx.save();
        if let Some(geom::Transform{sx, kx, ky, sy, tx, ty}) = path.transform {
            self.ctx.set_transform(
                *sx as f64,
                *ky as f64,
                *kx as f64,
                *sy as f64,
                *tx as f64,
                *ty as f64,
            ).unwrap();
        }
        self.ctx.begin_path();
        for seg in path.path.segments() {
            match seg {
                geom::PathSegment::MoveTo(p) => self.ctx.move_to(p.x as f64, p.y as f64),
                geom::PathSegment::LineTo(p) => self.ctx.line_to(p.x as f64, p.y as f64),
                geom::PathSegment::QuadTo(ctrl, to) => self.ctx.quadratic_curve_to(
                    ctrl.x as f64,
                    ctrl.y as f64,
                    to.x as f64,
                    to.y as f64,
                ),
                geom::PathSegment::CubicTo(ctrl1, ctrl2, to) => self.ctx.bezier_curve_to(
                    ctrl1.x as f64,
                    ctrl1.y as f64,
                    ctrl2.x as f64,
                    ctrl2.y as f64,
                    to.x as f64,
                    to.y as f64,
                ),
                geom::PathSegment::Close => self.ctx.close_path(),
            }
        }
        if let Some(fill) = &path.fill {
            self.set_fill_style(fill);
            self.ctx.fill();
        }
        if let Some(stroke) = &path.stroke {
            self.set_stroke_style(stroke);
            self.ctx.stroke();
        }
        self.ctx.restore();
    }

    fn push_clip(&mut self, clip: &render::Clip) {
        self.ctx.save();
        if let Some(geom::Transform{sx, kx, ky, sy, tx, ty}) = clip.transform {
            self.ctx.set_transform(
                *sx as f64,
                *ky as f64,
                *kx as f64,
                *sy as f64,
                *tx as f64,
                *ty as f64,
            ).unwrap();
        }
        let rect = clip.rect;
        self.ctx.rect(rect.x() as f64, rect.y() as f64, rect.width() as f64, rect.height() as f64);
        self.ctx.clip();
    }

    fn pop_clip(&mut self) {
        self.ctx.restore();
    }
}
