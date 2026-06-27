import type { Figure, Series } from "plotive";
import { logSpace, humanize } from "@/utils";
import { rlcFreqResponse, lcCutOffFreq } from "@/data/rlc";
import { useBodeRlcStore } from "@/stores/bode-rlc";

export default function (): Figure {
    const { R, L, C } = useBodeRlcStore();

    const freq = logSpace(100, 1E6, 500);

    const cutoff = lcCutOffFreq(L, C);

    const magSeries: Series[] = [];
    const phaseSeries: Series[] = [];

    R.forEach(r => {
        const mag = [];
        const phase = [];
        for (let f of freq) {
            const response = rlcFreqResponse(r, L, C, f);
            mag.push(response.magnitude);
            phase.push(response.phase);
        }
        magSeries.push({ name: `R = ${humanize(r)}Ω`, type: "line", x: freq, y: mag });
        phaseSeries.push({ type: "line", x: freq, y: phase });
    });

    return {
        // Text in array is parsed as rich text, with one line per element
        title: [
            `Bode plot of RLC circuit`,
            `[size=18;italic]L = ${humanize(L)}H, C = ${humanize(C)}F[/size;italic]`,
        ],

        legend: "right",
        plots: [
            {
                series: magSeries,
                xAxis: {
                    scale: {
                        type: "shared",
                        ref: "freq",
                    },
                    ticks: "auto",
                    minorTicks: "auto",
                    grid: "auto",
                },
                yAxis: {
                    title: "Magnitude (dB)",
                    ticks: "auto",
                    grid: "auto",
                },
                annotations: [
                    {
                        type: "line",
                        vertical: cutoff,
                        pattern: "dashed",
                    },
                    {
                        type: "label",
                        xy: [cutoff, -60],
                        text: `${(cutoff / 1000).toFixed(2)} kHz`,
                        anchor: "bottom-left",
                        angle: 90,
                    },
                    {
                        type: "line",
                        twoPoints: [
                            [cutoff, 0],
                            [cutoff * 10, -40],
                        ],
                        pattern: "dashed",
                    },
                    {
                        type: "label",
                        xy: [cutoff * 10, -40],
                        text: `-40 dB/decade`,
                        anchor: "bottom-left",
                    }
                ]
            },
            {
                series: phaseSeries,
                xAxis: {
                    scale: "log",
                    id: "freq",
                    ticks: "auto",
                    grid: "auto",
                    minorTicks: "auto",
                },
                yAxis: {
                    title: "Phase (rad)",
                    ticks: "pimultiple",
                    grid: "auto",
                }
            }
        ],
    }
}