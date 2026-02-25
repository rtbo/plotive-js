# Browser examples

These examples are small apps that consume the package the same way an external application would: importing `plotive` (alias for the local `plotive-js` package), which itself depends on `plotive-wasm`.

## Basic example

Run from repository root:

```bash
pnpm run example:dev
```

`examples/basic` is configured with Vite aliases to local sources, so changes in `plotive-js/src` are picked up without reinstalling dependencies.

For Rust changes, rebuild WASM (in another terminal):

```bash
pnpm run build:wasm
```

Then refresh the browser.
