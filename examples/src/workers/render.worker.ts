import { renderToSvgString, renderToPngDataUrl } from 'plotive';
import type { Figure, BuiltinStyleName, Style } from 'plotive';

export type RenderRequest = {
    fig: Figure;
    style?: BuiltinStyleName | Style;
    renderer: 'SVG' | 'PNG';
};

export type RenderResponse =
    | { result: string; error?: never }
    | { error: string; result?: never };

self.onmessage = async (e: MessageEvent<RenderRequest>) => {
    const { fig, style, renderer } = e.data;
    try {
        const result = renderer === 'SVG'
            ? await renderToSvgString(fig, style)
            : await renderToPngDataUrl(fig, style);
        self.postMessage({ result } satisfies RenderResponse);
    } catch (err) {
        self.postMessage({ error: String(err) } satisfies RenderResponse);
    }
};
