import init, { greet } from 'plotive-wasm';
export async function showFig(fig) {
    await init();
    greet();
}
