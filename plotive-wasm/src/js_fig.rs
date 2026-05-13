use plotive::{des, geom, style};
use wasm_bindgen::JsValue;

use crate::{
    extract_number_prop_if_defined, extract_type, get_prop_if_defined, js_annot, js_axis, js_err,
    js_series,
    js_style::{extract_theme_color, extract_theme_fill, extract_theme_stroke},
    JsErr,
};

pub fn extract_figure(js_fig: &JsValue) -> Result<des::Figure, JsErr> {
    let space = extract_number_prop_if_defined(js_fig, "space")?.map(|s| s as f32);

    let js_plot = get_prop_if_defined(js_fig, "plot");
    let js_plots = get_prop_if_defined(js_fig, "plots");
    let plots: des::figure::Plots = match (js_plot, js_plots) {
        (Some(_), Some(_)) => {
            return Err(js_err!("Cannot specify both 'plot' and 'plots' properties"))
        }
        (Some(js_plot), None) => {
            let plot = extract_plot(&js_plot)?;
            plot.into()
        }
        (None, Some(js_plots)) => {
            let plots = extract_plots(&js_plots, space)?;
            plots.into()
        }
        (None, None) => {
            return Err(js_err!(
                "Either 'plot' or 'plots' property must be defined for the figure"
            ))
        }
    };

    let mut fig = des::Figure::new(plots);

    if let Some(js_fill) = get_prop_if_defined(js_fig, "fill") {
        let fill = if js_fill.is_null() {
            None
        } else {
            Some(extract_theme_color(&js_fill)?.into())
        };
        fig = fig.with_fill(fill);
    }

    if let Some(js_title) = get_prop_if_defined(js_fig, "title") {
        let title_fmt = js_title
            .as_string()
            .ok_or_else(|| js_err!("'title' property must be a string if defined"))?;
        let title = plotive_text::parse_rich_text(&title_fmt)
            .map_err(|e| js_err!("Failed to parse plot title: {}", e))?;
        fig = fig.with_title(title.into());
    }

    if let Some(js_legend) = get_prop_if_defined(js_fig, "legend") {
        fig = fig.with_legend(extract_figure_legend(&js_legend)?);
    }

    if let Some(js_padding) = get_prop_if_defined(js_fig, "padding") {
        let padding = extract_padding(&js_padding)?;
        fig = fig.with_padding(padding);
    }

    Ok(fig)
}

fn extract_row_col(js_subplots: JsValue) -> Result<(u32, u32), JsErr> {
    if js_subplots.is_array() {
        let arr = js_sys::Array::from(&js_subplots);
        if arr.length() == 2 {
            let rows = arr.get(0).as_f64().map(|f| f as u32);
            let cols = arr.get(1).as_f64().map(|f| f as u32);
            match (rows, cols) {
                (Some(r), Some(c)) => Ok((r, c)),
                _ => Err(js_err!("subplots array must contain numeric values",)),
            }
        } else {
            Err(js_err!("subplots array must have length 2"))
        }
    } else {
        Err(js_err!("subplots must be an object or array"))
    }
}

fn extract_plots(js_plots: &JsValue, space: Option<f32>) -> Result<des::figure::Plots, JsErr> {
    if !js_plots.is_array() {
        return Err(js_err!("plots must be an array"));
    }
    let js_plots = js_sys::Array::from(js_plots);
    if js_plots.length() == 1 {
        let plot = extract_plot(&js_plots.get(0))?;
        return Ok(plot.into());
    }
    if js_plots.length() == 0 {
        return Err(js_err!("plots array cannot be empty"));
    }

    let mut plots = Vec::with_capacity(js_plots.length() as usize);
    let mut subplots: Option<(u32, u32)> = None;

    for js_plot in js_plots.iter() {
        let plot = extract_plot(&js_plot)?;
        let subplot = get_prop_if_defined(&js_plot, "subplot")
            .map(|js_subplots| extract_row_col(js_subplots))
            .transpose()?;
        match (subplot, &mut subplots) {
            (None, None) => (),
            (Some(sp), Some(subplots)) => {
                subplots.0 = sp.0.max(subplots.0);
                subplots.1 = sp.1.max(subplots.1);
            }
            (Some(sp), None) => subplots = Some(sp),
            (None, Some(..)) => (),
        }
        plots.push((subplot, plot));
    }

    let (rows, cols) = subplots.unwrap_or((js_plots.length() as u32, 1));
    let mut subplots = des::Subplots::new(rows, cols);
    // js has rows and cols starting at 1,
    // but des has rows and cols starting at 0
    let mut row = 0;
    let mut col = 0;
    for (sp, plot) in plots {
        let (r, c) = match sp {
            Some((r, c)) => (r - 1, c - 1),
            None => (row, col),
        };
        subplots = subplots.with_plot((r, c), plot);
        row += 1;
        if row >= rows {
            row = 0;
            col += 1;
        }
    }

    if let Some(space) = space {
        subplots = subplots.with_space(space);
    }

    Ok(subplots.into())
}

fn extract_plot(js_plot: &JsValue) -> Result<des::Plot, JsErr> {
    let js_series = get_prop_if_defined(js_plot, "series")
        .ok_or_else(|| js_err!("'series' property must be defined for plots"))?;
    if !js_series.is_array() {
        return Err(js_err!("'series' property must be an array"));
    }
    let js_series = js_sys::Array::from(&js_series);
    let mut series = Vec::with_capacity(js_series.length() as usize);

    for ser in js_series.iter() {
        let ser = js_series::extract_series(&ser)?;
        series.push(ser);
    }
    let mut plot = des::Plot::new(series);

    if let Some(js_legend) = get_prop_if_defined(js_plot, "legend") {
        let legend = extract_plot_legend(&js_legend)?;
        plot = plot.with_legend(legend);
    }

    if let Some(js_title) = get_prop_if_defined(js_plot, "title") {
        let Some(title) = js_title.as_string() else {
            return Err(js_err!("'title' must be a string"));
        };
        plot = plot.with_title(title.into());
    }

    if let Some(js_axis) = get_prop_if_defined(js_plot, "xAxis") {
        let axis = js_axis::extract_axis(&js_axis)?;
        plot = plot.with_x_axis(axis);
    }
    if let Some(js_axis) = get_prop_if_defined(js_plot, "yAxis") {
        let axis = js_axis::extract_axis(&js_axis)?;
        plot = plot.with_y_axis(axis);
    }
    if let Some(js_axes) = get_prop_if_defined(js_plot, "xAxes") {
        let js_axes = js_sys::Array::from(&js_axes);
        for js_axis in js_axes.iter() {
            let axis = js_axis::extract_axis(&js_axis)?;
            plot = plot.with_x_axis(axis);
        }
    }
    if let Some(js_axes) = get_prop_if_defined(js_plot, "yAxes") {
        let js_axes = js_sys::Array::from(&js_axes);
        for js_axis in js_axes.iter() {
            let axis = js_axis::extract_axis(&js_axis)?;
            plot = plot.with_y_axis(axis);
        }
    }

    if let Some(js_fill) = get_prop_if_defined(js_plot, "fill") {
        let fill = extract_theme_fill(&js_fill)?;
        plot = plot.with_fill(fill);
    }

    if let Some(js_border) = get_prop_if_defined(js_plot, "border") {
        let border = if js_border.is_null() {
            None
        } else {
            Some(extract_plot_border(&js_border)?)
        };
        plot = plot.with_border(border);
    }

    if let Some(js_insets) = get_prop_if_defined(js_plot, "insets") {
        let insets = if js_insets.is_null() {
            None
        } else {
            Some(extract_plot_insets(&js_insets)?)
        };
        plot = plot.with_insets(insets);
    }

    if let Some(js_cbar) = get_prop_if_defined(js_plot, "colorbar") {
        let cbar = extract_colorbar(&js_cbar)?;
        plot = plot.with_colorbar(cbar);
    }

    if let Some(js_annots) = get_prop_if_defined(js_plot, "annotations") {
        let js_annots = js_sys::Array::from(&js_annots);
        for js_annot in js_annots.iter() {
            let annot = js_annot::extract_annot(&js_annot)?;
            plot = plot.with_annotation(annot);
        }
    }

    Ok(plot)
}

fn extract_plot_border(js_border: &JsValue) -> Result<des::plot::Border, JsErr> {
    let typ = extract_type(js_border)?.to_lowercase();
    match typ.as_str() {
        "box" => {
            let stroke = get_prop_if_defined(js_border, "stroke")
                .map(|js_stroke| extract_theme_stroke(&js_stroke))
                .transpose()?
                .unwrap_or_else(|| style::theme::Col::Foreground.into());
            Ok(des::plot::Border::Box(stroke))
        }
        "axis" => {
            let stroke = get_prop_if_defined(js_border, "stroke")
                .map(|js_stroke| extract_theme_stroke(&js_stroke))
                .transpose()?
                .unwrap_or_else(|| style::theme::Col::Foreground.into());
            Ok(des::plot::Border::Axis(stroke))
        }
        "arrow" => {
            let mut arrow = des::plot::AxisArrow::default();
            if let Some(js_size) = get_prop_if_defined(js_border, "stroke") {
                let stroke = extract_theme_stroke(&js_size)?;
                arrow.stroke = stroke;
            }
            if let Some(size) = extract_number_prop_if_defined(js_border, "size")? {
                arrow.size = size as f32;
            }
            if let Some(overflow) = extract_number_prop_if_defined(js_border, "overflow")? {
                arrow.overflow = overflow as f32;
            }
            Ok(des::plot::Border::AxisArrow(arrow))
        }
        _ => return Err(js_err!("Unknown border type: \"{}\"", typ)),
    }
}

fn extract_plot_insets(js_insets: &JsValue) -> Result<des::plot::Insets, JsErr> {
    if let Some(insets_str) = js_insets.as_string() {
        if insets_str.to_lowercase() == "auto" {
            Ok(des::plot::Insets::Auto)
        } else {
            Err(js_err!("'insets' string value must be 'auto' if defined"))
        }
    } else if js_insets.is_array() {
        let arr = js_sys::Array::from(js_insets);
        if arr.length() != 2 {
            return Err(js_err!("'insets' array must have length 2"));
        }
        let hor = arr
            .get(0)
            .as_f64()
            .ok_or_else(|| js_err!("First element of 'insets' array must be a number"))?
            as f32;
        let ver = arr
            .get(1)
            .as_f64()
            .ok_or_else(|| js_err!("Second element of 'insets' array must be a number"))?
            as f32;
        Ok(des::plot::Insets::Fixed(hor, ver))
    } else {
        Err(js_err!("'insets' must be either a string or an array"))
    }
}

fn fig_legend_pos_from_str(pos_str: &str) -> Result<des::figure::LegendPos, JsErr> {
    match pos_str {
        "top" => Ok(des::figure::LegendPos::Top),
        "right" => Ok(des::figure::LegendPos::Right),
        "bottom" => Ok(des::figure::LegendPos::Bottom),
        "left" => Ok(des::figure::LegendPos::Left),
        _ => Err(js_err!("Unknown legend position: \"{}\"", pos_str)),
    }
}

fn extract_figure_legend(js_legend: &JsValue) -> Result<des::FigLegend, JsErr> {
    let mut pos = des::figure::LegendPos::default();
    if let Some(pos_str) = js_legend.as_string() {
        pos = fig_legend_pos_from_str(&pos_str)?;
        return Ok(des::FigLegend::new(pos));
    }
    if let Some(js_pos) = get_prop_if_defined(js_legend, "pos") {
        let pos_str = js_pos
            .as_string()
            .ok_or_else(|| js_err!("'legend.pos' property must be a string if defined"))?;
        pos = fig_legend_pos_from_str(&pos_str)?;
    }
    Ok(extract_legend(js_legend, pos)?)
}

fn plot_legend_pos_from_str(pos_str: &str) -> Result<des::plot::LegendPos, JsErr> {
    match pos_str {
        "out-top" => Ok(des::plot::LegendPos::OutTop),
        "out-right" => Ok(des::plot::LegendPos::OutRight),
        "out-bottom" => Ok(des::plot::LegendPos::OutBottom),
        "out-left" => Ok(des::plot::LegendPos::OutLeft),
        "in-top" => Ok(des::plot::LegendPos::InTop),
        "in-top-right" => Ok(des::plot::LegendPos::InTopRight),
        "in-right" => Ok(des::plot::LegendPos::InRight),
        "in-bottom-right" => Ok(des::plot::LegendPos::InBottomRight),
        "in-bottom" => Ok(des::plot::LegendPos::InBottom),
        "in-bottom-left" => Ok(des::plot::LegendPos::InBottomLeft),
        "in-left" => Ok(des::plot::LegendPos::InLeft),
        "in-top-left" => Ok(des::plot::LegendPos::InTopLeft),
        _ => Err(js_err!("Unknown legend position: \"{}\"", pos_str)),
    }
}

fn extract_plot_legend(js_legend: &JsValue) -> Result<des::PlotLegend, JsErr> {
    let mut pos = des::plot::LegendPos::default();
    if let Some(pos_str) = js_legend.as_string() {
        pos = plot_legend_pos_from_str(&pos_str)?;
        return Ok(des::PlotLegend::new(pos));
    }
    if let Some(js_pos) = get_prop_if_defined(js_legend, "pos") {
        let pos_str = js_pos
            .as_string()
            .ok_or_else(|| js_err!("'legend.pos' property must be a string if defined"))?;
        pos = plot_legend_pos_from_str(&pos_str)?;
    }
    Ok(extract_legend(js_legend, pos)?)
}

fn extract_legend<P: Default>(js_legend: &JsValue, pos: P) -> Result<des::Legend<P>, JsErr> {
    let mut legend = des::Legend::new(pos);
    if let Some(js_columns) = get_prop_if_defined(js_legend, "columns") {
        let columns = js_columns
            .as_f64()
            .ok_or_else(|| js_err!("'legend.columns' property must be a number if defined"))?
            as u32;
        legend = legend.with_columns(columns);
    }
    if let Some(js_padding) = get_prop_if_defined(js_legend, "padding") {
        let padding = extract_padding(&js_padding)?;
        legend = legend.with_padding(padding);
    }
    if let Some(js_fill) = get_prop_if_defined(js_legend, "fill") {
        if js_fill.is_null() {
            legend = legend.with_fill(None);
        } else {
            let fill = extract_theme_color(&js_fill)?;
            legend = legend.with_fill(Some(fill.into()));
        }
    }
    if let Some(js_spacing) = get_prop_if_defined(js_legend, "spacing") {
        if let Some(spacing) = js_spacing.as_f64() {
            let spacing = spacing as f32;
            legend = legend.with_spacing(geom::Size::new(spacing, spacing));
        } else if js_spacing.is_array() {
            let js_spacing = js_sys::Array::from(&js_spacing);
            if js_spacing.length() != 2 {
                return Err(js_err!(
                    "'legend.spacing' array must have length 2 (for horizontal and vertical spacing)",
                ));
            }
            let h = js_spacing
                .get(0)
                .as_f64()
                .ok_or_else(|| js_err!("'legend.spacing' array must contain numeric values"))?
                as f32;
            let v = js_spacing
                .get(1)
                .as_f64()
                .ok_or_else(|| js_err!("'legend.spacing' array must contain numeric values"))?
                as f32;
            legend = legend.with_spacing(geom::Size::new(h, v));
        } else {
            return Err(js_err!(
                "'legend.spacing' must be a number or an array of two numbers (horizontal and vertical spacing).",
            ));
        }
    }
    if let Some(js_margin) = get_prop_if_defined(js_legend, "margin") {
        let margin = js_margin
            .as_f64()
            .ok_or_else(|| js_err!("'legend.margin' property must be a number if defined"))?
            as f32;
        legend = legend.with_margin(margin);
    }
    Ok(legend)
}

fn extract_colorbar(js_cbar: &JsValue) -> Result<des::ColorBar, JsErr> {
    let mut cbar = if let Some(js_pos) = get_prop_if_defined(js_cbar, "pos") {
        let pos_str = js_pos
            .as_string()
            .ok_or_else(|| js_err!("'colorbar.pos' property must be a string if defined"))?;
        let pos = match pos_str.as_str() {
            "right" => des::colorbar::Pos::Right,
            "left" => des::colorbar::Pos::Left,
            "top" => des::colorbar::Pos::Top,
            "bottom" => des::colorbar::Pos::Bottom,
            _ => return Err(js_err!("Unknown colorbar position: \"{}\"", pos_str)),
        };
        des::ColorBar::new(pos)
    } else {
        des::ColorBar::default()
    };
    if let Some(width) = extract_number_prop_if_defined(js_cbar, "width")? {
        cbar = cbar.with_width(width as f32);
    }
    if let Some(margin) = extract_number_prop_if_defined(js_cbar, "margin")? {
        cbar = cbar.with_margin(margin as f32);
    }
    if let Some(js_border) = get_prop_if_defined(js_cbar, "border") {
        let border = if js_border.is_null() {
            None
        } else {
            Some(extract_theme_stroke(&js_border)?)
        };
        cbar = cbar.with_border(border);
    }
    if let Some(js_ticks) = get_prop_if_defined(js_cbar, "ticks") {
        let ticks = js_axis::extract_ticks_locator(&js_ticks)?;
        cbar = cbar.with_ticks_locator(ticks);
    }
    Ok(cbar)
}

fn extract_padding(js_padding: &JsValue) -> Result<geom::Padding, JsErr> {
    if js_padding.is_null() || js_padding.is_undefined() {
        Err(js_err!("Padding cannot be null or undefined"))
    } else if let Some(js_padding) = js_padding.as_f64() {
        Ok(geom::Padding::Even(js_padding as f32))
    } else if js_padding.is_array() {
        let js_padding = js_sys::Array::from(js_padding);
        match js_padding.length() {
            1 => {
                let pad = js_padding.get(0).as_f64().ok_or_else(|| {
                    js_err!("Padding array must contain numeric values")
                })? as f32;
                Ok(geom::Padding::Even(pad))
            }
            2 => {
                let h = js_padding.get(0).as_f64().ok_or_else(|| {
                    js_err!("Padding array must contain numeric values")
                })? as f32;
                let v = js_padding.get(1).as_f64().ok_or_else(|| {
                    js_err!("Padding array must contain numeric values")
                })? as f32;
                Ok(geom::Padding::Center { h, v })
            }
            4 => {
                let t = js_padding.get(0).as_f64().ok_or_else(|| {
                    js_err!("Padding array must contain numeric values")
                })? as f32;
                let r = js_padding.get(1).as_f64().ok_or_else(|| {
                    js_err!("Padding array must contain numeric values")
                })? as f32;
                let b = js_padding.get(2).as_f64().ok_or_else(|| {
                    js_err!("Padding array must contain numeric values")
                })? as f32;
                let l = js_padding.get(3).as_f64().ok_or_else(|| {
                    js_err!("Padding array must contain numeric values")
                })? as f32;
                Ok(geom::Padding::Custom {
                    t, r, b, l
                })
            }
            _ => {
                Err(js_err!(
                    "Padding array must have length 1, 2 (for horizontal and vertical) or 4 (for left, right, top, bottom)",
                ))
            }
        }
    } else if js_padding.is_object() {
        let t = get_prop_if_defined(js_padding, "top")
            .and_then(|v| v.as_f64().map(|f| f as f32))
            .ok_or_else(|| js_err!("Padding object must have numeric 'top' property"))?;
        let r = get_prop_if_defined(js_padding, "right")
            .and_then(|v| v.as_f64().map(|f| f as f32))
            .ok_or_else(|| js_err!("Padding object must have numeric 'right' property"))?;
        let b = get_prop_if_defined(js_padding, "bottom")
            .and_then(|v| v.as_f64().map(|f| f as f32))
            .ok_or_else(|| js_err!("Padding object must have numeric 'bottom' property"))?;
        let l = get_prop_if_defined(js_padding, "left")
            .and_then(|v| v.as_f64().map(|f| f as f32))
            .ok_or_else(|| js_err!("Padding object must have numeric 'left' property"))?;
        Ok(geom::Padding::Custom { t, r, b, l })
    } else {
        Err(js_err!("Padding must be a number or an object with 'left', 'right', 'top', 'bottom' properties"))
    }
}
