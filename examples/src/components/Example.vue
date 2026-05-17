<script setup lang="ts">
import { Renderer, useParamsStore } from '@/stores/params';
import { computed, onMounted, ref, watch } from 'vue';
import { renderAsSvg, renderToImg, type Figure } from 'plotive';
import hljs from 'highlight.js/lib/core';
import ts from 'highlight.js/lib/languages/typescript';
import 'highlight.js/styles/github-dark-dimmed.css';

hljs.registerLanguage('typescript', ts);

const props = defineProps<{
    name: string;
    figureCode: string;
    figureFn: () => Figure;
}>();

const params = useParamsStore();
const svgContainer = ref<HTMLElement | null>(null);
const pngImage = ref<HTMLImageElement | null>(null);

const highlightedCode = computed(() => {
    return hljs.highlight(props.figureCode, { language: 'typescript' }).value;
});

async function drawFigure() {
    const fig = props.figureFn();
    if (params.renderer === Renderer.Svg && svgContainer.value) {
        await renderAsSvg(svgContainer.value, fig);
    }
    if (params.renderer === Renderer.Png && pngImage.value) {
        await renderToImg(pngImage.value, fig);
    }
}

onMounted(() => {
    void drawFigure();
});

watch(() => params.renderer, () => {
    void drawFigure();
});

</script>

<template>
    <section class="example">
        <h2>{{ props.name }}</h2>
        <div class="content">
            <div class="figure" aria-label="figure preview">
                <div v-show="params.renderer === 'svg'" ref="svgContainer"></div>
                <img v-show="params.renderer === 'png'" ref="pngImage" alt="figure render" />
            </div>
            <pre class="code"><code class="hljs language-typescript" v-html="highlightedCode"></code></pre>
        </div>
    </section>
</template>

<style scoped>
.example {
    margin-bottom: 2rem;
}

.content {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(320px, 1fr);
    gap: 1rem;
    align-items: start;
}

.figure {
    padding: 0.75rem;
    min-height: 220px;
    text-align: center;
}

.figure img {
    max-width: 100%;
    display: block;
    margin: auto;
}

.figure :deep(svg) {
    max-width: 100%;
    height: auto;
    display: block;
    margin: auto;
}

.code {
    margin: 0;
    padding: 0.75rem;
    overflow: auto;
    font-size: 0.875rem;
    line-height: 1.4;
}

@media (max-width: 960px) {
    .content {
        grid-template-columns: 1fr;
    }
}
</style>
