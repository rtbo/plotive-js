<script setup lang="ts">
import Example from './components/Example.vue';
import sineFigure from './figs/sine';
import multipleAxesFigure from './figs/multiple-axes';
import sineCode from './figs/sine.ts?raw';
import multipleAxesCode from './figs/multiple-axes.ts?raw';
import { BUILTIN_STYLES, type BuiltinStyleName } from 'plotive';
import SelectButton from 'primevue/selectbutton';
import Select from 'primevue/select';

import { useSettingsStore } from './stores/settings';
import { computed } from 'vue';

const settings = useSettingsStore();

const darkMode = computed({
  get: () => settings.darkMode ? 'dark' : 'light',
  set: (value: string) => settings.setDarkMode(value === 'dark')
});

const THEME_LABELS = [
  ['light', 'light (default)'],
  ['okabe-ito', 'okabe-ito (colorblind)'],
  ['tol-bright', 'tol-bright (colorblind)'],
];
const themeToLabel = (key: string) => THEME_LABELS.find(([k, _]) => k === key)?.[1] || key;
const labelToTheme = (label: string) => THEME_LABELS.find(([_, l]) => l === label)?.[0] || label;

const themes = Object.keys(BUILTIN_STYLES).map(themeToLabel);

const currentTheme = computed({
  get: () => themeToLabel(settings.theme),
  set: (value: string) => settings.theme = labelToTheme(value) as BuiltinStyleName
});

</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-50 border-b border-surface-200 shadow-sm backdrop-blur">
      <div class="mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <h1 class="text-xl font-semibold tracking-tight">Plotive examples</h1>
        <div class="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Select v-model="currentTheme" :options="themes" />
          <SelectButton v-model="settings.renderer" :options="['PNG', 'SVG']" />
          <SelectButton v-model="darkMode" :options="['light', 'dark']" />
        </div>
      </div>
    </header>

    <main class="mx-auto flex w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <Example name="Sine" :figure-fn="sineFigure" :figure-code="sineCode" />
      <Example name="Multiple Axes" :figure-fn="multipleAxesFigure" :figure-code="multipleAxesCode" />
    </main>
  </div>
</template>

<style scoped></style>
