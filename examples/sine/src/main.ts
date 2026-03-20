import { renderAsSvg, renderToImg } from 'plotive';

const figDiv = document.getElementById("figdiv");
const figImg = document.getElementById("figImg");

if (!(figDiv instanceof HTMLDivElement)) {
  throw new Error('Missing #figDiv element');
}
if (!(figImg instanceof HTMLImageElement)) {
  throw new Error('Missing #figImg element');
}

const x = Array.from({ length: 500 }, (_, i) => i / 499 * 2 * Math.PI);
const y = x.map(x => Math.sin(x));

const fig = {
  plot: {
    series: [
      {
        type: "line",
        x: x,
        y: y,
      },
    ]
  }
};

await renderAsSvg({
  title: "Sine wave rendered to SVG",
  ...fig
}, figDiv);


await renderToImg({
  title: "Sine wave rendered to PNG",
  ...fig
}, figImg);
