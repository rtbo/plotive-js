import type { Figure, Params, TextProps } from "plotive";
import { renderToPngBytes } from "plotive";

import fs from "node:fs";

const customFont = {
    family: "Merriweather",
    style: "italic",
    weight: 700,
    size: 24,
}

// Fetch Noto Japanese font from Google Fonts
async function fetchGoogleFont(): Promise<ArrayBuffer> {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@1,700&display=swap`);
    const cssText = await css.text();
    console.log("Fetched Font CSS:", cssText);
    const fontUrlMatch = cssText.match(/url\(([^)]+)\)/);
    if (fontUrlMatch) {
        const fontUrl = fontUrlMatch[1];
        const fontResponse = await fetch(fontUrl);
        const fontArrayBuffer = await fontResponse.arrayBuffer();
        return fontArrayBuffer;
    } else {
        throw new Error('Font URL not found in CSS');
    }
}

const fontBin = await fetchGoogleFont();
const params: Params = {
    style: "dracula",
    fontdb: [fontBin]
}

const x = Array.from({ length: 500 }, (_, i) => i / 499 * Math.PI);
const y1 = x.map(x => 1000 * Math.sin(x));
const y2 = x.map(x => Math.sin(x) - 0.8 * Math.sin(x) ** 2)

const fig: Figure = {
    title: {
        fmt: "Example plot that [custom-font]uses a custom Font[/custom-font]",
        props: {
            "custom-font": customFont,
        }
    },
    legend: {
        pos: 'top',
        font: customFont,
    },
    plot: {
        series: [
            {
                type: "line",
                name: '1000 * sin(x)',
                x: x,
                y: y1,
                yAxis: 'y1',
            },
            {
                type: "line",
                name: 'sin(x) - 0.8*sin(x)^2',
                x: x,
                y: y2,
                yAxis: 'Y2', // referring to Y2 by its title (options are id, index or title)
            }
        ],
        xAxis: {
            title: 'X',
            ticks: 'pimultiple',
        },
        yAxes: [
            {
                id: 'y1',
                title: 'Y1',
                ticks: 'auto',
            },
            {
                title: 'Y2', // id is optional if not referred to by series
                side: 'right',
                ticks: 'percent',
            }
        ],
    },
}

const pngBytes = await renderToPngBytes(fig, params);
await fs.promises.writeFile('custom_font.png', Buffer.from(pngBytes));

export { }
