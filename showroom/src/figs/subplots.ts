import type { Figure } from 'plotive'

export default function (): Figure {
    const x1 = Array.from({ length: 500 }, (_, i) => i / 499 * 2 * Math.PI);
    const x2 = Array.from({ length: 500 }, (_, i) => i / 499 * 2 * Math.PI + 0.5 * Math.PI);
    const y1 = x1.map(x => Math.sin(x * x));
    const y2 = x1.map(x => -Math.sin(x * x));

    return {
        size: {
            width: 800,
            height: 900,
        },
        plots: [
            {
                series: {
                    type: "line",
                    x: x1,
                    y: y1,
                },
                xAxis: {
                    scale: {
                        type: "shared",
                        ref: "x2",
                    },
                    ticks: "auto",
                    grid: "auto",
                }
            },
            {
                series: {
                    type: "line",
                    x: x2,
                    y: y2,
                },
                xAxis: {
                    id: "x2",
                    ticks: "pimultiple",
                    grid: "auto",
                },
            }
        ],
    }
}
