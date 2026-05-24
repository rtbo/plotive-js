import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useBodeRlcStore = defineStore("bode-rlc", () => {
    const R1 = ref(1);
    const R2 = ref(10);
    const R3 = ref(100);
    const R = computed(() => [R1.value, R2.value, R3.value]);
    const L = ref(1E-4);
    const C = ref(1E-6);

    return {
        R1, R2, R3,
        R, L, C
    }
})
