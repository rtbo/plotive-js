import type { Figure } from "plotive";
import { prepareIrisData } from "@/data/iris";

export default function (): Figure {
    const data = prepareIrisData();
    return {
        title: "Iris Dataset",
        legend: "right",
        plot: {
            series: [
                {
                    type: "scatter",
                    name: "Setosa",
                    x: data.setosa.sepalLength,
                    y: data.setosa.sepalWidth,
                },
                {
                    type: "scatter",
                    name: "Versicolor",
                    x: data.versicolor.sepalLength,
                    y: data.versicolor.sepalWidth,
                },
                {
                    type: "scatter",
                    name: "Virginica",
                    x: data.virginica.sepalLength,
                    y: data.virginica.sepalWidth,
                },
            ],
            xAxis: {
                title: "Sepal Length (cm)",
                ticks: "auto",
                grid: "auto",
            },
            yAxis: {
                title: "Sepal Width (cm)",
                ticks: "auto",
                grid: "auto",
            },
        },
    };
}
