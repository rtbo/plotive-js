<script setup lang="ts">
import Example from './components/Example.vue';
import sineFigure from './figs/sine';
import multipleAxesFigure from './figs/multiple-axes';
import sineCode from './figs/sine.ts?raw';
import multipleAxesCode from './figs/multiple-axes.ts?raw';

</script>

<template>
  <h1>Plotive examples</h1>
  <Example name="Sine" :figure-fn="sineFigure" :figure-code="sineCode" />
  <Example name="Multiple Axes" :figure-fn="multipleAxesFigure" :figure-code="multipleAxesCode" />
</template>

<style scoped>

</style>
