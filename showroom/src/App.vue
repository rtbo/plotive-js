<script setup lang="ts">
import Example from "./components/Example.vue";
import { BUILTIN_STYLES, type BuiltinStyleName } from "plotive";
import SelectButton from "primevue/selectbutton";
import Select from "primevue/select";
import Slider from "primevue/slider";

import sineFigure from "./figs/sine.ts";
import sineTsCode from "./figs/sine.ts?raw";
import sineRsCode from "./figs/sine.rs?raw";
import sinePyCode from "./figs/sine.py?raw";

import scatterFigure from "./figs/scatter.ts";
import scatterTsCode from "./figs/scatter.ts?raw";
import scatterRsCode from "./figs/scatter.rs?raw";
import scatterPyCode from "./figs/scatter.py?raw";

import multipleAxesFigure from "./figs/multiple-axes.ts";
import multipleAxesTsCode from "./figs/multiple-axes.ts?raw";
import multipleAxesRsCode from "./figs/multiple-axes.rs?raw";
import multipleAxesPyCode from "./figs/multiple-axes.py?raw";

import bcFigure from "./figs/bitcoin.ts";
import bcTsCode from "./figs/bitcoin.ts?raw";
import bcRsCode from "./figs/bitcoin.rs?raw";
import bcPyCode from "./figs/bitcoin.py?raw";

import irisFigure from "./figs/iris.ts";
import irisTsCode from "./figs/iris.ts?raw";
import irisRsCode from "./figs/iris.rs?raw";
import irisPyCode from "./figs/iris.py?raw";

import subplotsFigure from "./figs/subplots.ts";
import subplotsTsCode from "./figs/subplots.ts?raw";
import subplotsRsCode from "./figs/subplots.rs?raw";
import subplotsPyCode from "./figs/subplots.py?raw";

import colormapFigure from "./figs/colormap.ts";
import colormapTsCode from "./figs/colormap.ts?raw";
import colormapRsCode from "./figs/colormap.rs?raw";
import colormapPyCode from "./figs/colormap.py?raw";

import bodeRlcFigure from "./figs/bode-rlc.ts";
import bodeRlcTsCode from "./figs/bode-rlc.ts?raw";
import bodeRlcRsCode from "./figs/bode-rlc.rs?raw";
import bodeRlcPyCode from "./figs/bode-rlc.py?raw";

import { useSettingsStore } from "./stores/settings.ts";
import { computed } from "vue";
import { useBodeRlcStore } from "./stores/bode-rlc.ts";

const settings = useSettingsStore();

const darkMode = computed({
    get: () => (settings.darkMode ? "dark" : "light"),
    set: (value: string) => settings.setDarkMode(value === "dark"),
});

const THEME_LABELS = [
    ["light", "light (default)"],
    ["okabe-ito", "okabe-ito (colorblind)"],
    ["tol-bright", "tol-bright (colorblind)"],
];
const themeToLabel = (key: string) =>
    THEME_LABELS.find(([k, _]) => k === key)?.[1] || key;
const labelToTheme = (label: string) =>
    THEME_LABELS.find(([_, l]) => l === label)?.[0] || label;

const themes = Object.keys(BUILTIN_STYLES).map(themeToLabel);

const currentTheme = computed({
    get: () => themeToLabel(settings.theme),
    set: (value: string) =>
        (settings.theme = labelToTheme(value) as BuiltinStyleName),
});

const bodeRlcStore = useBodeRlcStore();

type BodeParam = "R1" | "R2" | "R3" | "C" | "L";

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function createLogSliderModel(
    param: BodeParam,
    minValue: number,
    maxValue: number,
) {
    const minExp = Math.log10(minValue);
    const maxExp = Math.log10(maxValue);

    return computed({
        get: () => Math.log10(clamp(bodeRlcStore[param], minValue, maxValue)),
        set: (expValue: number) => {
            bodeRlcStore[param] = Math.pow(10, clamp(expValue, minExp, maxExp));
        },
    });
}

const R1Log = createLogSliderModel("R1", 0.1, 100);
const R2Log = createLogSliderModel("R2", 0.1, 100);
const R3Log = createLogSliderModel("R3", 0.1, 100);
const CLog = createLogSliderModel("C", 1e-7, 1e-5);
const LLog = createLogSliderModel("L", 1e-5, 1e-3);

function formatValue(value: number, digits = 2) {
    return value.toLocaleString("fr-FR", {
        maximumFractionDigits: digits,
        minimumFractionDigits: 0,
    });
}

function formatExponential(value: number) {
    return value.toExponential(2);
}
</script>

<template>
    <div class="min-h-screen">
        <header class="app-header sticky top-0 z-50 border-b border-surface-200 shadow-sm backdrop-blur">
            <div class="app-header__overlay" aria-hidden="true"></div>
            <div class="relative mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <h1 class="text-xl font-semibold tracking-tight">
                    Plotive examples
                </h1>
                <div class="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                    <Select v-model="currentTheme" :options="themes" />
                    <SelectButton v-model="settings.renderer" :options="['PNG', 'Canvas', 'SVG']" />
                    <SelectButton v-model="darkMode" :options="['light', 'dark']" />
                </div>
            </div>
        </header>

        <main class="mx-auto flex w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
            <Example name="Simple Line Plot" :figure-fn="sineFigure" :ts-code="sineTsCode" :rs-code="sineRsCode"
                :py-code="sinePyCode" />
            <Example name="Scatter Plot" :figure-fn="scatterFigure" :ts-code="scatterTsCode" :rs-code="scatterRsCode"
                :py-code="scatterPyCode" />
            <Example name="Multiple Axes" :figure-fn="multipleAxesFigure" :ts-code="multipleAxesTsCode"
                :rs-code="multipleAxesRsCode" :py-code="multipleAxesPyCode" />
            <Example name="Time Series" :figure-fn="bcFigure" :ts-code="bcTsCode" :rs-code="bcRsCode"
                :py-code="bcPyCode" />
            <Example name="Iris DataSet" :figure-fn="irisFigure" :ts-code="irisTsCode" :rs-code="irisRsCode"
                :py-code="irisPyCode" />
            <Example name="Subplots with shared axis" :figure-fn="subplotsFigure" :ts-code="subplotsTsCode"
                :rs-code="subplotsRsCode" :py-code="subplotsPyCode" />
            <Example name="Colormap and Colorbar" :figure-fn="colormapFigure" :ts-code="colormapTsCode"
                :rs-code="colormapRsCode" :py-code="colormapPyCode" />
            <Example name="Reactive Annotated Bode Plot" :figure-fn="bodeRlcFigure" :ts-code="bodeRlcTsCode"
                :rs-code="bodeRlcRsCode" :py-code="bodeRlcPyCode">
                <div
                    class="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4 px-2 py-2 sm:px-3">
                    <label class="text-sm font-medium">R1</label>
                    <Slider v-model="R1Log" :min="-1" :max="2" :step="0.01" class="w-full" />
                    <span class="min-w-22 text-right text-sm tabular-nums opacity-80">{{ formatValue(bodeRlcStore.R1, 1)
                        }}
                        Ω</span>

                    <label class="text-sm font-medium">R2</label>
                    <Slider v-model="R2Log" :min="-1" :max="2" :step="0.01" class="w-full" />
                    <span class="min-w-22 text-right text-sm tabular-nums opacity-80">{{ formatValue(bodeRlcStore.R2, 1)
                        }}
                        Ω</span>

                    <label class="text-sm font-medium">R3</label>
                    <Slider v-model="R3Log" :min="-1" :max="2" :step="0.01" class="w-full" />
                    <span class="min-w-22 text-right text-sm tabular-nums opacity-80">{{ formatValue(bodeRlcStore.R3, 1)
                        }}
                        Ω</span>

                    <label class="text-sm font-medium">C</label>
                    <Slider v-model="CLog" :min="-7" :max="-5" :step="0.01" class="w-full" />
                    <span class="min-w-22 text-right text-sm tabular-nums opacity-80">{{
                        formatExponential(bodeRlcStore.C) }}
                        F</span>

                    <label class="text-sm font-medium">L</label>
                    <Slider v-model="LLog" :min="-5" :max="-3" :step="0.01" class="w-full" />
                    <span class="min-w-22 text-right text-sm tabular-nums opacity-80">{{
                        formatExponential(bodeRlcStore.L) }}
                        H</span>
                </div>
            </Example>
        </main>
    </div>
</template>

<style scoped>
.app-header {
    isolation: isolate;
}

.app-header__overlay {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: color-mix(in srgb,
            var(--p-content-background) 70%,
            transparent);
    pointer-events: none;
}
</style>
