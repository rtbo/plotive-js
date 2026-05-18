import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { BuiltinStyleName } from 'plotive'

export type Renderer = 'SVG' | 'PNG'

function initialDarkMode() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export const useSettingsStore = defineStore('settings', () => {
    const renderer = ref<Renderer>('SVG')
    const scale = ref(1.0)
    const theme = ref<BuiltinStyleName>("light")

    const darkMode = ref(initialDarkMode())
    const setDarkMode = (value: boolean) => {
        darkMode.value = value;
        if (value) {
            document.documentElement.classList.add('app-dark-mode');
        } else {
            document.documentElement.classList.remove('app-dark-mode');
        }
    };

    return { renderer, scale, theme, darkMode, setDarkMode }
})
