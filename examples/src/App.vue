<script setup lang="ts">
import Example from './components/Example.vue';
import ToggleSwitch from './components/ToggleSwitch.vue';
import sineFigure from './figs/sine';
import multipleAxesFigure from './figs/multiple-axes';
import sineCode from './figs/sine.ts?raw';
import multipleAxesCode from './figs/multiple-axes.ts?raw';

import { useParamsStore, Renderer } from './stores/params';
import { computed } from 'vue';

const params = useParamsStore();

const renderer = computed({
  get: () => params.renderer === Renderer.Png,
  set: (value) => {
    params.renderer = value ? Renderer.Png : Renderer.Svg;
  }
});

</script>

<template>
  <div class="app-header">
    <h1>Plotive examples</h1>
    <div class="settings">
      <span>SVG</span>
      <ToggleSwitch round always-on v-model="renderer" />
      <span>PNG</span>
    </div>
  </div>
  <Example name="Sine" :figure-fn="sineFigure" :figure-code="sineCode" />
  <Example name="Multiple Axes" :figure-fn="multipleAxesFigure" :figure-code="multipleAxesCode" />
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.settings {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
