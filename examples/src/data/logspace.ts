export default function(min: number, max: number, num: number): number[] {
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    const step = (logMax - logMin) / (num - 1);

    return Array.from({length: num}, (_, i) => Math.pow(10, logMin + i * step));
}
