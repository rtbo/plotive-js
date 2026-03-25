# Plotive

A JavaScript library for creating charts and data visualizations. Plotive is a set of JavaScript bindings for the [plotive](https://github.com/rtbo/plotive) project written in Rust.

## Features

- 📊 Create charts and data visualizations
- 🚀 Works in both browser and Node.js environments
- 🎨 Full customization of styles and themes
- 📐 Support for multiple axes and subplots
- 🏷️ Flexible legends and annotations

## Installation

```bash
npm install plotive
```

or with pnpm:

```bash
pnpm add plotive
```

## Usage

### In the Browser

```typescript
import { renderAsSvg } from 'plotive';

const x = Array.from({ length: 100 }, (_, i) => i / 99 * 2 * Math.PI);
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

const container = document.getElementById('chart-container');
await renderAsSvg(fig, container);
```

### In Node.js

```javascript
import { renderToSvgString } from 'plotive';

const x = Array.from({ length: 100 }, (_, i) => i / 99 * 2 * Math.PI);
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

const svgString = await renderToSvgString(fig);
console.log(svgString);
```

## API

### `renderAsSvg(figure, element)`

Renders a figure as SVG and inserts it into a DOM element.

```typescript
await renderAsSvg(fig, document.getElementById('chart'));
```

### `renderToSvgString(figure)`

Renders a figure as SVG and returns it as a string.

```typescript
const svg = await renderToSvgString(fig);
```

### `renderToImg(figure, element)`

Renders a figure as PNG and assigns it to an image element.

```typescript
await renderToImg(fig, document.querySelector('img'));
```

### `renderToPngDataUrl(figure)`

Renders a figure as PNG and returns a Data URL.

```typescript
const dataUrl = await renderToPngDataUrl(fig);
img.src = dataUrl;
```

## Examples

### Basic Example: Sine Wave

```typescript
import { renderAsSvg } from 'plotive';

const x = Array.from({ length: 500 }, (_, i) => i / 499 * 2 * Math.PI);
const y = x.map(x => Math.sin(x));

const fig = {
  title: "Sine Wave",
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

await renderAsSvg(fig, document.getElementById('chart'));
```

### Advanced Example: Multiple Y-Axes

```typescript
import { renderAsSvg } from 'plotive';

const x = Array.from({ length: 500 }, (_, i) => i / 499 * Math.PI);
const y1 = x.map(x => 1000 * Math.sin(x));
const y2 = x.map(x => Math.sin(x) - 0.8 * Math.sin(x) ** 2);

const fig = {
  title: "Example with Multiple Y-Axes",
  legend: { pos: 'top' },
  plot: {
    series: [
      {
        type: "line",
        name: "1000 * sin(x)",
        x: x,
        y: y1,
        y_axis: 0,
      },
      {
        type: "line",
        name: "sin(x) - 0.8*sin(x)²",
        x: x,
        y: y2,
        y_axis: 1,
      }
    ],
    x_axis: {
      title: "X",
      ticks: "pimultiple",
    },
    y_axes: [
      {
        title: "Y1",
        ticks: "auto",
      },
      {
        title: "Y2",
        side: "right",
        ticks: "percent",
      }
    ],
  },
};

await renderAsSvg(fig, document.getElementById('chart'));
```

## Figure Structure

```typescript
interface Figure {
  // Chart configuration
  size?: [number, number];           // Dimensions [width, height]
  title?: string;                     // Figure title
  padding?: number | [number, number] | [number, number, number, number];
  fill?: ThemeFill;                   // Background color
  legend?: FigLegend;                 // Legend configuration
  
  // Content
  plot?: Plot;                        // Single plot
  plots?: Plot[];                     // Multiple plots
}

interface Plot {
  series: Series[];                   // Data series
  title?: string;                     // Plot title
  x_axis?: Axis;                      // X axis
  x_axes?: Axis[];                    // Multiple X axes
  y_axis?: Axis;                      // Y axis
  y_axes?: Axis[];                    // Multiple Y axes
  legend?: PlotLegend;                // Plot legend
  annotations?: Annotation[];         // Annotations
  subplot?: [number, number];         // Subplot position
}

interface Series {
  type: "line" | "scatter";           // Series type
  x: number[];                        // X data
  y: number[];                        // Y data
  name?: string;                      // Series name
  y_axis?: number;                    // Y axis index
  // ... other style options
}
```

## About

Plotive is a set of JavaScript bindings for the [plotive](https://github.com/rtbo/plotive) project written in **Rust**. It brings the power of Rust for chart generation while providing the flexibility of JavaScript.

## License

See the [LICENSE](LICENSE) file for details.

## Author

Rémi Thebault
