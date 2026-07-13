import type { Figure } from 'plotive'

export default function (): Figure {
    const x = Array.from({ length: 500 }, (_, i) => i / 499 * 2 * Math.PI);
    const y = x.map(x => Math.sin(x));

    return {
        title: "Sine Wave",
        plot: {
            series: {
                type: "line",
                x,
                y,
                name: "y=sin(x)",
            },
            xAxis: {
                title: "x",
                ticks: "pimultiple",
                grid: "auto",
            },
            yAxis: {
                title: "sin(x)",
                ticks: "auto",
                grid: "auto",
            },
            legend: "in-top-right",
        }
    }
}
