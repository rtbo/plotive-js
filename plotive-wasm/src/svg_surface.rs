use plotive::geom::{self, Transform};
use plotive::render::{self, Surface};
use plotive::Rgba8;
use wasm_bindgen::JsCast;

const SVG_NS: &str = "http://www.w3.org/2000/svg";

pub struct SvgSurface {
    doc: web_sys::SvgElement,
    defs: web_sys::Element,
    id_prefix: String,
    id_num: u32,
    group_stack: Vec<web_sys::SvggElement>,
}

impl SvgSurface {
    pub fn new(doc: web_sys::SvgElement) -> Self {
        let owner_doc = {
            let doc_node: &web_sys::Node = doc.as_ref();
            doc_node
                .owner_document()
                .expect("svg element has no owner document")
        };
        let defs = create_svg_element::<web_sys::Element>(&owner_doc, "defs");
        doc.append_child(defs.as_ref())
            .expect("failed to append defs to svg");

        // Keep IDs unique across the whole HTML document to avoid clip-path collisions.
        let id_prefix = format!(
            "plotive-{}",
            (js_sys::Math::random() * 1_000_000_000.0) as u32
        );

        SvgSurface {
            doc,
            defs,
            id_prefix,
            id_num: 0,
            group_stack: vec![],
        }
    }
}

impl Surface for SvgSurface {
    fn caps(&self) -> render::SurfaceCaps {
        render::SurfaceCaps {
            max_gradient_stops: usize::MAX,
        }
    }

    /// Prepare the surface for drawing, with the given width and height in plot units
    fn prepare(&mut self, size: geom::Size) {
        set_attr(
            self.doc.as_ref(),
            "viewBox",
            format!("0 0 {} {}", size.width(), size.height()),
        );
        set_attr(self.doc.as_ref(), "width", size.width());
        set_attr(self.doc.as_ref(), "height", size.height());
        set_attr(self.doc.as_ref(), "xmlns", SVG_NS);
    }

    /// Fill the entire surface with the given color
    fn fill(&mut self, fill: render::Paint) {
        let doc = self.owner_document();
        let node = create_svg_element::<web_sys::SvgRectElement>(&doc, "rect");
        set_attr(node.as_ref(), "width", "100%");
        set_attr(node.as_ref(), "height", "100%");
        match fill {
            render::Paint::Solid(color) => set_attr(node.as_ref(), "fill", color.html()),
            render::Paint::LinearGradient {
                start_pos,
                end_pos,
                stops,
            } => {
                let grad_id = self.add_linear_gradient(&doc, start_pos, end_pos, &stops);
                set_attr(node.as_ref(), "fill", format!("url(#{})", grad_id));
            }
        }
        self.append_node(&node);
    }

    /// Draw a rectangle
    fn draw_rect(&mut self, rect: &render::Rect) {
        let doc = self.owner_document();
        let node = rectangle_node(&doc, &rect.rect);
        self.assign_fill(node.as_ref(), rect.fill.as_ref());
        self.assign_stroke(node.as_ref(), rect.stroke.as_ref());
        self.assign_transform(node.as_ref(), rect.transform);
        self.append_node(&node);
    }

    fn draw_path(&mut self, path: &render::Path) {
        let doc = self.owner_document();
        let node = create_svg_element::<web_sys::SvgPathElement>(&doc, "path");
        self.assign_fill(node.as_ref(), path.fill.as_ref());
        self.assign_stroke(node.as_ref(), path.stroke.as_ref());
        self.assign_transform(node.as_ref(), path.transform);
        set_attr(node.as_ref(), "d", path_data(path.path));
        self.append_node(&node);
    }

    fn push_clip(&mut self, clip: &render::Clip) {
        let doc = self.owner_document();
        let clip_id = self.bump_id();
        let clip_id_url = format!("url(#{})", clip_id);

        let rect_node = rectangle_node(&doc, clip.rect);
        self.assign_transform(rect_node.as_ref(), clip.transform);

        let clip_node = create_svg_element::<web_sys::SvgClipPathElement>(&doc, "clipPath");
        set_attr(clip_node.as_ref(), "clipPathUnits", "userSpaceOnUse");
        set_attr(clip_node.as_ref(), "id", clip_id);
        clip_node
            .append_child(rect_node.as_ref())
            .expect("failed to append rect to clipPath");
        self.defs
            .append_child(clip_node.as_ref())
            .expect("failed to append clipPath to defs");

        let group = create_svg_element::<web_sys::SvggElement>(&doc, "g");
        set_attr(group.as_ref(), "clip-path", clip_id_url);
        self.group_stack.push(group);
    }

    fn pop_clip(&mut self) {
        let g = self.group_stack.pop();
        if g.is_none() {
            panic!("Unbalanced clip stack");
        }
        let g = g.unwrap();
        self.append_node(&g);
    }
}

impl SvgSurface {
    fn owner_document(&self) -> web_sys::Document {
        let doc_node: &web_sys::Node = self.doc.as_ref();
        doc_node
            .owner_document()
            .expect("svg element has no owner document")
    }

    fn append_node<N>(&mut self, node: &N)
    where
        N: AsRef<web_sys::Node>,
    {
        if self.group_stack.is_empty() {
            self.doc
                .append_child(node.as_ref())
                .expect("failed to append node to svg");
        } else {
            self.group_stack
                .last_mut()
                .expect("group stack unexpectedly empty")
                .append_child(node.as_ref())
                .expect("failed to append node to group");
        }
    }

    fn assign_transform(&mut self, node: &web_sys::Element, transform: Option<&geom::Transform>) {
        if let Some(Transform {
            sx,
            kx,
            ky,
            sy,
            tx,
            ty,
        }) = transform
        {
            set_attr(
                node,
                "transform",
                format!("matrix({sx} {ky} {kx} {sy} {tx} {ty})"),
            );
        }
    }

    fn assign_fill(&mut self, node: &web_sys::Element, fill: Option<&render::Paint>) {
        match fill {
            Some(render::Paint::Solid(color)) => {
                let (rgb, opacity) = color.split_rgb_opacity();
                set_attr(node, "fill", rgb.html());
                if let Some(opacity) = opacity {
                    set_attr(node, "fill-opacity", opacity);
                }
            }
            Some(render::Paint::LinearGradient {
                start_pos,
                end_pos,
                stops,
            }) => {
                let doc = self.owner_document();
                let grad_id = self.add_linear_gradient(&doc, *start_pos, *end_pos, stops);
                set_attr(node, "fill", format!("url(#{grad_id})"));
            }
            None => {
                set_attr(node, "fill", "none");
            }
        }
    }

    fn assign_stroke(&mut self, node: &web_sys::Element, stroke: Option<&render::Stroke>) {
        if let Some(stroke) = stroke {
            let (rgb, opacity) = stroke.color.split_rgb_opacity();
            set_attr(node, "stroke", rgb.html());
            if let Some(opacity) = opacity {
                set_attr(node, "stroke-opacity", opacity);
            }
            let w = stroke.width;
            set_attr(node, "stroke-width", w);
            match stroke.pattern {
                render::LinePattern::Solid => (),
                render::LinePattern::Dash(dash) => {
                    let dasharray = dash
                        .iter()
                        .map(|d| (d * w).to_string())
                        .collect::<Vec<_>>()
                        .join(" ");
                    set_attr(node, "stroke-dasharray", dasharray);
                }
            }
        } else {
            set_attr(node, "stroke", "none");
        }
    }

    fn add_linear_gradient(
        &mut self,
        doc: &web_sys::Document,
        start_pos: geom::Point,
        end_pos: geom::Point,
        stops: &[(f32, Rgba8)],
    ) -> String {
        let id = self.bump_id();
        let grad = create_svg_element::<web_sys::SvgLinearGradientElement>(doc, "linearGradient");
        grad.set_attribute("id", &id)
            .expect("failed to set gradient id");
        grad.set_attribute("gradientUnits", "userSpaceOnUse")
            .expect("failed to set gradient units");
        grad.set_attribute("x1", &start_pos.x.to_string())
            .expect("failed to set gradient x1");
        grad.set_attribute("y1", &start_pos.y.to_string())
            .expect("failed to set gradient y1");
        grad.set_attribute("x2", &end_pos.x.to_string())
            .expect("failed to set gradient x2");
        grad.set_attribute("y2", &end_pos.y.to_string())
            .expect("failed to set gradient y2");

        for (offset, color) in stops {
            let stop = create_svg_element::<web_sys::SvgStopElement>(&doc, "stop");
            stop.set_attribute("offset", &format!("{}%", offset * 100.0))
                .expect("failed to set stop offset");
            stop.set_attribute("stop-color", &color.html())
                .expect("failed to set stop color");
            grad.append_child(&stop)
                .expect("failed to append stop to gradient");
        }
        self.defs
            .append_child(&grad)
            .expect("failed to append gradient to defs");
        id
    }

    fn bump_id(&mut self) -> String {
        self.id_num += 1;
        format!("{}-clip{}", self.id_prefix, self.id_num)
    }
}

fn path_data(path: &geom::Path) -> String {
    let mut data = String::new();
    for segment in path.segments() {
        if !data.is_empty() {
            data.push(' ');
        }
        match segment {
            geom::PathSegment::MoveTo(p) => {
                data.push_str(&format!("M {} {}", p.x, p.y));
            }
            geom::PathSegment::LineTo(p) => {
                data.push_str(&format!("L {} {}", p.x, p.y));
            }
            geom::PathSegment::QuadTo(p1, p2) => {
                data.push_str(&format!("Q {} {}, {} {}", p1.x, p1.y, p2.x, p2.y));
            }
            geom::PathSegment::CubicTo(p1, p2, p3) => {
                data.push_str(&format!(
                    "C {} {}, {} {}, {} {}",
                    p1.x, p1.y, p2.x, p2.y, p3.x, p3.y
                ));
            }
            geom::PathSegment::Close => {
                data.push('Z');
            }
        }
    }
    data
}

fn rectangle_node(doc: &web_sys::Document, rect: &geom::Rect) -> web_sys::SvgRectElement {
    let node = create_svg_element::<web_sys::SvgRectElement>(doc, "rect");
    set_attr(node.as_ref(), "x", rect.x());
    set_attr(node.as_ref(), "y", rect.y());
    set_attr(node.as_ref(), "width", rect.width());
    set_attr(node.as_ref(), "height", rect.height());
    node
}

fn create_svg_element<T>(doc: &web_sys::Document, tag: &str) -> T
where
    T: JsCast,
{
    doc.create_element_ns(Some(SVG_NS), tag)
        .expect("failed to create SVG element")
        .dyn_into::<T>()
        .expect("failed to cast SVG element")
}

fn set_attr<V>(node: &web_sys::Element, name: &str, value: V)
where
    V: ToString,
{
    node.set_attribute(name, &value.to_string())
        .expect("failed to set SVG attribute");
}
