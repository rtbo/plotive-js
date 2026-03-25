import { renderAsSvg } from 'plotive';

const figDiv = document.getElementById("figdiv");

if (!(figDiv instanceof HTMLDivElement)) {
  throw new Error('Missing #figDiv element');
}

const x = Array.from({ length: 500 }, (_, i) => i / 499 * Math.PI);
const y1 = x.map(x => 1000 * Math.sin(x));
const y2 = x.map(x => Math.sin(x) - 0.8 * Math.sin(x) ** 2)

await renderAsSvg(figDiv, {
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
});

