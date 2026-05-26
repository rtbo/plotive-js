import type { Figure } from 'plotive'

export default function (): Figure {
  const x = Array.from({ length: 500 }, (_, i) => i / 499 * Math.PI);
  const y1 = x.map(x => 1000 * Math.sin(x));
  const y2 = x.map(x => Math.sin(x) - 0.8 * Math.sin(x) ** 2)

  return {
    title: "Example plot",
    legend: 'top',
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
}
