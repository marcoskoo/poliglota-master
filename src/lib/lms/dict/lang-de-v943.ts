import { parseMega } from "./mega-parse";
import type { VocabWord } from "../types";
import { DE_V943_1_RAW } from "./lang-de-v943-1";
import { DE_V943_2_RAW } from "./lang-de-v943-2";
import { DE_V943_3_RAW } from "./lang-de-v943-3";
import { DE_V943_4_RAW } from "./lang-de-v943-4";
import { DE_V943_5_RAW } from "./lang-de-v943-5";
import { DE_V943_6_RAW } from "./lang-de-v943-6";
import { DE_V943_7_RAW } from "./lang-de-v943-7";
import { DE_V943_8_RAW } from "./lang-de-v943-8";
import { DE_V943_9_RAW } from "./lang-de-v943-9";
import { DE_V943_10_RAW } from "./lang-de-v943-10";
import { DE_V943_11_RAW } from "./lang-de-v943-11";
import { DE_V943_12_RAW } from "./lang-de-v943-12";
import { DE_V943_13_RAW } from "./lang-de-v943-13";
import { DE_V943_14_RAW } from "./lang-de-v943-14";
import { DE_V943_15_RAW } from "./lang-de-v943-15";
import { DE_V943_16_RAW } from "./lang-de-v943-16";

/* v9.43 · DE MEGA 16.000 · bloques generados (ids de943-m<lvl>-<slug>) */
export const DE_V943: VocabWord[] = parseMega([DE_V943_1_RAW, DE_V943_2_RAW, DE_V943_3_RAW, DE_V943_4_RAW, DE_V943_5_RAW, DE_V943_6_RAW, DE_V943_7_RAW, DE_V943_8_RAW, DE_V943_9_RAW, DE_V943_10_RAW, DE_V943_11_RAW, DE_V943_12_RAW, DE_V943_13_RAW, DE_V943_14_RAW, DE_V943_15_RAW, DE_V943_16_RAW].join("\n"), "de943");
