<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { computed, onUnmounted, ref, watchEffect } from 'vue';
import type { Figure } from 'plotive';
import hljs from 'highlight.js/lib/core';
import ts from 'highlight.js/lib/languages/typescript';
import '@/dracula.css';
import RenderWorker from '@/workers/render.worker?worker';
import type { RenderRequest, RenderResponse } from '@/workers/render.worker';

hljs.registerLanguage('typescript', ts);

const props = defineProps<{
    name: string;
    figureCode: string;
    figureFn: () => Figure;
}>();

const settings = useSettingsStore();
const svgContainer = ref<HTMLElement | null>(null);
const pngImage = ref<HTMLImageElement | null>(null);

const worker = new RenderWorker();
let renderGeneration = 0;

const highlightedCode = computed(() => {
    return hljs.highlight(props.figureCode, { language: 'typescript' }).value;
});

async function drawFigure(fig: Figure) {
    const generation = ++renderGeneration;
    const style = settings.theme || 'light';
    const renderer = settings.renderer;

    const response = await new Promise<RenderResponse>((resolve) => {
        const handler = (e: MessageEvent<RenderResponse>) => {
            worker.removeEventListener('message', handler);
            resolve(e.data);
        };
        worker.addEventListener('message', handler);
        worker.postMessage({ fig, style, renderer } satisfies RenderRequest);
    });

    if (generation !== renderGeneration) return;
    if ('error' in response) { console.error(response.error); return; }

    if (renderer === 'SVG' && svgContainer.value) {
        svgContainer.value.innerHTML = response.result;
    }
    if (renderer === 'PNG' && pngImage.value) {
        pngImage.value.src = response.result;
    }
}

watchEffect(() => {
    // Track all reactive dependencies touched while building the figure,
    // including slider-driven store values used by props.figureFn.
    const fig = props.figureFn();
    void drawFigure(fig);
});

onUnmounted(() => {
    worker.terminate();
});

</script>

<template>
    <section class="mb-8">
        <div class="grid items-start gap-4 lg:grid-cols-[minmax(280px,1fr)_minmax(320px,1fr)]">
            <div class="lg:col-start-1">
                <h2 class="text-lg">{{ props.name }}</h2>
                <div v-if="$slots.default" class="example-controls mt-4">
                    <slot></slot>
                </div>
                <div class="min-h-56 p-3 text-center mt-4 [&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-full"
                    aria-label="figure preview">
                    <div v-show="settings.renderer === 'SVG'" ref="svgContainer"></div>
                    <img v-show="settings.renderer === 'PNG'" ref="pngImage" alt="figure render"
                        class="mx-auto block max-w-full" />
                </div>
            </div>
            <pre
                class="m-0 overflow-auto p-3 text-sm leading-[1.4] rounded-xl self-start lg:col-start-2">
                <code class="hljs language-typescript rounded-xl" v-html="highlightedCode"></code>
            </pre>
        </div>
    </section>
</template>

<style scoped>
.example-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
</style>
