import type { Figure } from 'plotive'

export default function (): Figure {
    const NUM = 50;

    const x = Array.from({ length: NUM }, () => Math.random() * 10);
    const y = Array.from({ length: NUM }, () => Math.random() * 10);
    const sizes = Array.from({ length: NUM }, () => Math.random() * 19.5 + 0.5);
    const colors = Array.from({ length: NUM }, (_, i) => i * 10 / (NUM - 1) + 10);

    return {
        plot: {
            series: {
                type: "scatter",
                x,
                y,
                sizes,
                colors,
                // uses the default "viridis" colormap,
                // which has perceptual interpolation
                // colormap scales autoamatically to the range of
                // the colors array, but can be customized
            },
            xAxis: {
                ticks: "auto",
                grid: "default",
            },
            yAxis: {
                ticks: "auto",
                grid: "default",
            },
            colorbar: "auto"
        },
    }
}
