<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { computed, onMounted, ref, watch } from 'vue';
import { renderAsSvg, renderToImg, type Figure } from 'plotive';
import hljs from 'highlight.js/lib/core';
import ts from 'highlight.js/lib/languages/typescript';
import '@/dracula.css';

hljs.registerLanguage('typescript', ts);

const props = defineProps<{
    name: string;
    figureCode: string;
    figureFn: () => Figure;
}>();

const settings = useSettingsStore();
const svgContainer = ref<HTMLElement | null>(null);
const pngImage = ref<HTMLImageElement | null>(null);

const highlightedCode = computed(() => {
    return hljs.highlight(props.figureCode, { language: 'typescript' }).value;
});

async function drawFigure() {
    const fig = props.figureFn();
    const style = settings.theme || 'light';
    if (settings.renderer === 'SVG' && svgContainer.value) {
        await renderAsSvg(svgContainer.value, fig, style);
    }
    if (settings.renderer === 'PNG' && pngImage.value) {
        await renderToImg(pngImage.value, fig, style);
    }
}

onMounted(() => {
    void drawFigure();
});

watch(() => settings.renderer, () => {
    void drawFigure();
});
watch(() => settings.theme, () => {
    void drawFigure();
});

</script>

<template>
    <section class="mb-8">
        <div
            class="grid items-start gap-4 lg:grid-cols-[minmax(280px,1fr)_minmax(320px,1fr)] lg:grid-rows-[auto_1fr]"
        >
            <h2 class="text-lg lg:col-start-1 lg:row-start-1">{{ props.name }}</h2>
            <div
                class="min-h-56 p-3 text-center lg:col-start-1 lg:row-start-2 [&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-full"
                aria-label="figure preview"
            >
                <div v-show="settings.renderer === 'SVG'" ref="svgContainer"></div>
                <img
                    v-show="settings.renderer === 'PNG'"
                    ref="pngImage"
                    alt="figure render"
                    class="mx-auto block max-w-full"
                />
            </div>
            <pre
                class="m-0 overflow-auto p-3 text-sm leading-[1.4] rounded-xl self-start lg:col-start-2 lg:row-start-1 lg:row-span-2"
            >
                <code class="hljs language-typescript rounded-xl" v-html="highlightedCode"></code>
            </pre>
        </div>
    </section>
</template>
