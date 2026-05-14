type RuntimeOps<Fig> = {
  init: () => Promise<void>;
  normalize: (fig: Fig) => Fig;
  renderToSvg: (fig: Fig) => string;
  renderToPng: (fig: Fig) => string;
};

export function createRuntime<Fig>(ops: RuntimeOps<Fig>) {
  async function renderToSvgString(fig: Fig): Promise<string> {
    const initPromise = ops.init();
    const normalized = ops.normalize(fig);
    await initPromise;
    return ops.renderToSvg(normalized);
  }

  async function renderToPngDataUrl(fig: Fig): Promise<string> {
    const initPromise = ops.init();
    const normalized = ops.normalize(fig);
    await initPromise;
    return ops.renderToPng(normalized);
  }

  async function renderAsSvg(elem: Element, fig: Fig): Promise<void> {
    const initPromise = ops.init();
    const normalized = ops.normalize(fig);
    await initPromise;
    const svg = await renderToSvgString(normalized);
    elem.innerHTML = svg;
  }

  async function renderToImg(elem: HTMLImageElement, fig: Fig): Promise<void> {
    const initPromise = ops.init();
    const normalized = ops.normalize(fig);
    const data = await renderToPngDataUrl(normalized);
    elem.src = data;
  }

  return {
    renderAsSvg,
    renderToSvgString,
    renderToImg,
    renderToPngDataUrl,
  };
}
