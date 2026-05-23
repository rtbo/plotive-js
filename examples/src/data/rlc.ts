
export function rlcFreqResponse(R: number, L: number, C: number, f: number): { magnitude: number; phase: number } {
    const pulse = 2 * Math.PI * f;

    // H(jw) = 1 / (1 - w^2LC + jwRC)
    const num = 1.0;
    const real = 1.0 - pulse * pulse * L * C;
    const imag = pulse * R * C;

    const magnitude = num / Math.sqrt(real * real + imag * imag);
    const phase = -Math.atan2(imag, real);

    return { magnitude: 20.0 * Math.log10(magnitude), phase };
}

export function lcCutOffFreq(L: number, C: number): number {
    return 1.0 / (2 * Math.PI * Math.sqrt(L * C));
}
