import init, { greet } from 'plotive-wasm'



interface Figure {
    title?: string;
}

export async function showFig(fig: Figure) {
    await init();
    greet()
}
