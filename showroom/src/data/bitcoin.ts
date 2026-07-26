import BcCsv from "@/data/BTC-USD.csv?raw";
import { parseCsv } from "plotive";
import type { DataCol } from "plotive";

export async function getBcData(): Promise<Record<string, DataCol>> {
    return parseCsv(BcCsv);
}
