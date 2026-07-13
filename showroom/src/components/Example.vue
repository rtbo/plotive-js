<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';

import { renderToSvg, renderToCanvas, renderToImg } from 'plotive';
import type { Figure } from 'plotive';

import hljs from 'highlight.js/lib/core';
import ts from 'highlight.js/lib/languages/typescript';
import rs from 'highlight.js/lib/languages/rust';
import py from 'highlight.js/lib/languages/python';
import '@/dracula.css';

import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

import { computed, ref, watchEffect } from 'vue';

hljs.registerLanguage('typescript', ts);
hljs.registerLanguage('rust', rs);
hljs.registerLanguage('python', py);

const props = defineProps<{
    name: string;
    figureFn: () => Figure;
    tsCode: string;
    rsCode: string;
    pyCode: string;
}>();

const settings = useSettingsStore();
const canvasEl = ref<HTMLCanvasElement | null>(null);
const svgEl = ref<SVGElement | null>(null);
const imgEl = ref<HTMLImageElement | null>(null);

const langClass = computed(() => {
    if (settings.preferredLang === 'rust') {
        return 'language-rust';
    } else if (settings.preferredLang === 'python') {
        return 'language-python';
    } else {
        return 'language-typescript';
    }
});

const highlightedCode = computed(() => {
    if (settings.preferredLang === 'rust') {
        return hljs.highlight(props.rsCode, { language: 'rust' }).value;
    } else if (settings.preferredLang === 'python') {
        return hljs.highlight(props.pyCode, { language: 'python' }).value;
    } else {
        return hljs.highlight(props.tsCode, { language: 'typescript' }).value;
    }
});

async function drawFigure(fig: Figure) {
    const params = {
        style: settings.theme || 'light',
    };
    const renderer = settings.renderer;

    if (renderer === 'Canvas' && canvasEl.value) {
        try {
            await renderToCanvas(canvasEl.value, fig, params);
        } catch (err) {
            console.error('Error rendering to canvas:', err);
        }
    } else if (renderer === 'SVG' && svgEl.value) {
        try {
            await renderToSvg(svgEl.value, fig, params);
        } catch (err) {
            console.error('Error rendering to SVG:', err);
        }
    } else if (renderer === 'PNG' && imgEl.value) {
        try {
            await renderToImg(imgEl.value, fig, params);
        } catch (err) {
            console.error('Error rendering to PNG:', err);
        }
    } else {
        console.warn('No valid renderer or container found');
        return;
    }
}

watchEffect(() => {
    // Track all reactive dependencies touched while building the figure,
    // including slider-driven store values used by props.figureFn.
    const fig = props.figureFn();
    void drawFigure(fig);
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
                <div class="min-h-56 p-3 text-center mt-4" aria-label="figure preview">
                    <canvas v-show="settings.renderer === 'Canvas'" ref="canvasEl" class="mx-auto block max-w-full"></canvas>
                    <svg v-show="settings.renderer === 'SVG'" ref="svgEl" class="mx-auto block max-w-full"></svg>
                    <img v-show="settings.renderer === 'PNG'" ref="imgEl" alt="figure render"
                        class="mx-auto block max-w-full" />
                </div>
            </div>
            <pre class="m-0 overflow-auto p-3 text-sm leading-[1.4] rounded-xl self-start lg:col-start-2">
                <Tabs v-model:value="settings.preferredLang">
                    <TabList>
                        <Tab value="typescript">TypeScript</Tab>
                        <Tab value="rust">Rust</Tab>
                        <Tab value="python">Python</Tab>
                    </TabList>
                </Tabs>
                <code :class="['hljs', langClass, 'rounded-xl']" v-html="highlightedCode"></code>
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
