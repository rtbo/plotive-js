const wasmNode = require('./wasm-node/plotive_wasm.js');
wasmNode.set_panic_hook();

async function renderAsSvg(fig, elem) {
    const svg = wasmNode.render_to_svg_string(fig);
    elem.innerHTML = svg;
}

async function renderToSvgString(fig) {
    return wasmNode.render_to_svg_string(fig);
}

async function renderToImg(fig, elem) {
    const data = wasmNode.render_to_png_data_url(fig);
    elem.src = data;
}

async function renderToPngDataUrl(fig) {
    return wasmNode.render_to_png_data_url(fig);
}

module.exports = {
    renderAsSvg,
    renderToSvgString,
    renderToImg,
    renderToPngDataUrl,
};
