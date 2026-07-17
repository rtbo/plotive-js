import type { Figure } from "plotive";
import random from "random";

export default function (): Figure {
    const normalX1 = random.normal(30, 5);
    const normalY1 = random.normal(20, 2);
    const normalX2 = random.normal(40, 2);
    const normalY2 = random.normal(10, 5);
    const x1 = Array.from({ length: 300 }, () => normalX1());
    const y1 = Array.from({ length: 300 }, () => normalY1());
    const x2 = Array.from({ length: 500 }, () => normalX2());
    const y2 = Array.from({ length: 500 }, () => normalY2());

    return {
        title: "Scatter Plot Example",
        plot: {
            series: [
                {
                    type: "scatter",
                    x: x1,
                    y: y1,
                    name: "Series 1",
                    marker: {
                        shape: "circle",
                        size: 3.0,
                    },
                },
                {
                    type: "scatter",
                    x: x2,
                    y: y2,
                    name: "Series 2",
                    marker: {
                        shape: "square",
                        size: 3.0,
                    },
                },
            ],
            xAxis: {
                ticks: "auto",
                grid: "auto",
            },
            yAxis: {
                ticks: "auto",
                grid: "auto",
            },
            legend: "in-bottom-left",
        },
    };
}
