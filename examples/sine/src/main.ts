import { render } from 'plotive';

const figDiv = document.getElementById("figdiv");
if (!(figDiv instanceof HTMLDivElement)) {
  throw new Error('Missing #figdiv element');
}

render({
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
}, figDiv);
