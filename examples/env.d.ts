/// <reference types="vite/client" />

declare module 'seedrandom/lib/alea.js' {
  type AleaRng = () => number;
  export default function seedrandom(seed?: string): AleaRng;
}
