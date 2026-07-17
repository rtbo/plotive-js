import type { Figure } from "plotive";

export default function (): Figure {
    const x = Array.from({ length: 500 }, (_, i) => (i / 499) * Math.PI);
    const y1 = x.map((x) => Math.sin(x) - 0.8 * Math.sin(x) ** 2);
    const y2 = x.map((x) => 100 * Math.cos(x - Math.PI / 4));
    const y3 = x.map((x) => 1000 * Math.sin(x));

    return {
        plot: {
            series: [
                {
                    type: "line",
                    name: "y1 = sin(x) - 0.8*sin(x)^2",
                    x: x,
                    y: y1,
                    yAxis: 0, // referring to Y1 by its index (optional as it is the first Y-axis)
                },
                {
                    type: "line",
                    name: "y2 = 100 * cos(x - π/4)",
                    x: x,
                    y: y2,
                    yAxis: "y2", // referring to Y2 by its id
                },
                {
                    type: "line",
                    name: "y3 = 1000 * sin(x)",
                    x: x,
                    y: y3,
                    yAxis: "Y3", // referring to Y3 by its title
                },
            ],
            xAxis: {
                title: "X",
                ticks: "pimultiple",
            },
            yAxes: [
                {
                    title: "Y1",
                    ticks: "percent",
                },
                {
                    id: "y2",
                    title: "Y2",
                    ticks: "auto",
                    side: "right",
                },
                {
                    title: "Y3",
                    ticks: "auto",
                    side: "right",
                },
            ],
        },
        legend: "bottom",
    };
}
