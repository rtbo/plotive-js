import { defineStore } from "pinia";
import { ref } from "vue";

export const useBodeRlcStore = defineStore("bode-rlc", () => {
    const R = ref([1, 10, 100]);
    const L = ref(1E-4);
    const C = ref(1E-6);

    return {
        R, L, C
    }
})
