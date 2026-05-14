import { renderToImg, renderAsSvg, Figure } from 'plotive';


async function renderFigToElement(id: string, figure: Figure) {
  const el = document.getElementById(id);

  if (el === null) {
    throw new Error(`Missing #${id} element`);
  }

  if (el instanceof HTMLImageElement) {
    await renderToImg(el, figure);
  }
  else if (el instanceof HTMLDivElement) {
    await renderAsSvg(el, figure);
  } else {
    throw new Error(`Incompatible #${id} element`);
  }
}

const FIGS: [string, () => Figure][] = [
  ["sine", () => {
    const x = Array.from({ length: 500 }, (_, i) => i / 499 * 2 * Math.PI);
    const y = x.map(x => Math.sin(x));
    return {
      title: "Sine line series",
      plot: {
        series: [
          {
            type: "line",
            x: x,
            y: y,
          },
        ]
      }
    }
  }],

  ["multiple-axes", () => {
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
            yAxis: 'y2',
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
            id: 'y2',
            title: 'Y2',
            side: 'right',
            ticks: 'percent',
          }
        ],
      },
    }
  }],
];

for (const [id, figFn] of FIGS) {
  await renderFigToElement(id, figFn());
}
