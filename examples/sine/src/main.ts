import { renderAsSvg, renderToImg } from 'plotive';

const figDiv = document.getElementById("figdiv");
const figImg = document.getElementById("figImg");

if (!(figDiv instanceof HTMLDivElement)) {
  throw new Error('Missing #figDiv element');
}
if (!(figImg instanceof HTMLImageElement)) {
  throw new Error('Missing #figImg element');
}
console.log(figDiv);
console.log(figImg);

const fig = {
  title: "Example plot",
  plot: {
    series: [
      {
        type: "line",
        x: [1, 2, 3, 4, 5],
        y: [1, 4, 9, 16, 25],
      }
    ]
  }
};

await renderToImg(fig, figImg);
await renderAsSvg(fig, figDiv);

