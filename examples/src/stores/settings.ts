import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { BuiltinStyleName } from 'plotive'

export type Renderer = 'SVG' | 'PNG'

export const useSettingsStore = defineStore('settings', () => {
    const renderer = ref<Renderer>('SVG')
    const scale = ref(1.0)
    const theme = ref<BuiltinStyleName>("light")
    const darkMode = ref(false)

    return { renderer, scale, theme, darkMode }
})
