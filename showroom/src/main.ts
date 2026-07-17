import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import { definePreset } from "@primeuix/themes";
import { content } from "@primeuix/themes/aura/accordion";

const app = createApp(App);

app.use(createPinia());

const MyPreset = definePreset(Aura, {
    semantic: {
        colorScheme: {
            light: {
                content: {
                    background: "{surface.100}",
                },
            },
            dark: {
                content: {
                    background: "{surface.800}",
                },
            },
        },
    },
});

app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            darkModeSelector: ".app-dark-mode",
        },
    },
});
app.mount("#app");
