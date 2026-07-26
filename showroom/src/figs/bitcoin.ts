import type { Figure, DataCol } from "plotive";
import { getBcData } from "@/data/bitcoin";

export default async function (): Promise<Figure> {
    let data = await getBcData();
    let time = data["Date"] as DataCol;
    let price = data["Close"] as DataCol;
    let volume = data["Volume"] as DataCol;

    return {
        title: "Bitcoin historical data",
        plot: {
            series: [
                {
                    type: "line",
                    x: time,
                    y: price,
                    name: "Closing Price",
                },
                {
                    type: "line",
                    x: time,
                    y: volume,
                    name: "Volume",
                    yAxis: "volume",
                },
            ],
            xAxis: {
                title: "Date",
                ticks: "auto",
            },
            yAxes: [
                {
                    title: "Price [USD]",
                    scale: [0, 8e4],
                    ticks: "auto",
                    grid: "auto",
                },
                {
                    title: "Volume [USD]",
                    scale: [0, 4e11],
                    ticks: "auto",
                    id: "volume",
                    side: "right",
                },
            ],
            legend: "in-top-left",
        },
    };
}

