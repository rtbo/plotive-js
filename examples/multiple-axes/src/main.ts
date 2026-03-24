import { renderAsSvg } from 'plotive';

const figDiv = document.getElementById("figdiv");

if (!(figDiv instanceof HTMLDivElement)) {
  throw new Error('Missing #figDiv element');
}

const x = Array.from({ length: 500 }, (_, i) => i / 499 * Math.PI);
const y1 = x.map(x => 1000 * Math.sin(x));
const y2 = x.map(x => Math.sin(x) - 0.8 * Math.sin(x) ** 2)

const fig = {
  title: "Example plot",
  legend: {
    pos: 'bottom',
  },
  plot: {
    series: [
      {
        type: "line",
        name: '1000 * sin(x)',
        x: x,
        y: y1,
        y_axis: 0,
      },
      {
        type: "line", 
        name: 'sin(x) - 0.8*sin(x)^2',
        x: x,
        y: y2,
        y_axis: 1,
      }
    ],
    x_axis: {
      title: 'X',
      ticks: {
        locator: {
          type: 'pimultiple',
        },
        formatter: {
          type: 'auto',
        }
      },
    },
    y_axes: [
      {
        title: 'Y1',
        ticks: {},
      },
      {
        title: 'Y2',
        side: 'right',
        ticks: {
          locator: {
            type: 'auto',
          },
          formatter: {
            type: 'percent',
          }
        },
      }
    ],
  },
};

await renderAsSvg(fig, figDiv);

