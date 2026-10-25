import { parseMega } from "./mega-parse";
import type { VocabWord } from "../types";
import { FR_V943_1_RAW } from "./lang-fr-v943-1";
import { FR_V943_2_RAW } from "./lang-fr-v943-2";
import { FR_V943_3_RAW } from "./lang-fr-v943-3";
import { FR_V943_4_RAW } from "./lang-fr-v943-4";
import { FR_V943_5_RAW } from "./lang-fr-v943-5";
import { FR_V943_6_RAW } from "./lang-fr-v943-6";
import { FR_V943_7_RAW } from "./lang-fr-v943-7";
import { FR_V943_8_RAW } from "./lang-fr-v943-8";
import { FR_V943_9_RAW } from "./lang-fr-v943-9";
import { FR_V943_10_RAW } from "./lang-fr-v943-10";
import { FR_V943_11_RAW } from "./lang-fr-v943-11";

/* v9.43 · FR MEGA 16.000 · bloques generados (ids fr943-m<lvl>-<slug>) */
export const FR_V943: VocabWord[] = parseMega([FR_V943_1_RAW, FR_V943_2_RAW, FR_V943_3_RAW, FR_V943_4_RAW, FR_V943_5_RAW, FR_V943_6_RAW, FR_V943_7_RAW, FR_V943_8_RAW, FR_V943_9_RAW, FR_V943_10_RAW, FR_V943_11_RAW].join("\n"), "fr943");
