import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export enum Renderer {
    Png = 'png',
    Svg = 'svg',
}

export enum Theme {
    BlackWhite = 'black-white',
    Light = 'light (default)',
    Dark = 'dark',
    OkabeIto = 'okabe-ito',
    TolBright = 'tol-bright',
    CatppuccinMocha = 'catppuccin-mocha',
    CatppuccinMachiatto = 'catppuccin-machiatto',
    CatppuccinFrappe = 'catppuccin-frappe',
    CatppuccinLatte = 'catppuccin-latte',
}

export const useParamsStore = defineStore('params', () => {
    const renderer = ref(Renderer.Svg)
    const scale = ref(1.0)
    const theme = ref(Theme.Light)

    return { renderer, scale, theme }
})
