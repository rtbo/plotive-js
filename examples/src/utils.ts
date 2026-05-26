export function logSpace(min: number, max: number, num: number): number[] {
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    const step = (logMax - logMin) / (num - 1);

    return Array.from({length: num}, (_, i) => Math.pow(10, logMin + i * step));
}

export function humanize(num: number, precision: number = 2): string {
    if (num === 0) return "0";
    const prefixes = ["p", "n", "µ", "m", "", "k", "M", "G", "T"];
    const exponent = Math.floor(Math.log10(Math.abs(num)) / 3);
    const prefix = prefixes[exponent + 4];
    const unit = prefix === undefined ? `e${exponent * 3}` : prefix;
    const value = num / Math.pow(1000, exponent);
    const roundedValue = value.toFixed(precision).replace(/\.?0+$/, "");
    return `${roundedValue} ${unit}`;
}
