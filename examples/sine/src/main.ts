import { renderToImg } from 'plotive';

const figImg = document.getElementById("figImg");

if (!(figImg instanceof HTMLImageElement)) {
  throw new Error('Missing #figImg element');
}

const x = Array.from({ length: 500 }, (_, i) => i / 499 * 2 * Math.PI);
const y = x.map(x => Math.sin(x));

await renderToImg(figImg, {
  title: "Sine wave rendered to PNG",
  plot: {
    series: [
      {
        type: "line",
        x: x,
        y: y,
      },
    ]
  }
});
