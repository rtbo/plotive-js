import type { Figure } from 'plotive'

export default function (): Figure {
    const x = Array.from({ length: 500 }, (_, i) => i / 499 * 2 * Math.PI);
    const y = x.map(x => Math.sin(x));

    return {
        title: "Sine line series",
        plot: {
            series: {
                type: "line",
                x,
                y,
            },
        }
    }
}
