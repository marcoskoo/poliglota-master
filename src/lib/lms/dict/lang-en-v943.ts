import { parseMega } from "./mega-parse";
import type { VocabWord } from "../types";
import { EN_V943_1_RAW } from "./lang-en-v943-1";
import { EN_V943_2_RAW } from "./lang-en-v943-2";
import { EN_V943_3_RAW } from "./lang-en-v943-3";
import { EN_V943_4_RAW } from "./lang-en-v943-4";
import { EN_V943_5_RAW } from "./lang-en-v943-5";
import { EN_V943_6_RAW } from "./lang-en-v943-6";
import { EN_V943_7_RAW } from "./lang-en-v943-7";
import { EN_V943_8_RAW } from "./lang-en-v943-8";
import { EN_V943_9_RAW } from "./lang-en-v943-9";
import { EN_V943_10_RAW } from "./lang-en-v943-10";
import { EN_V943_11_RAW } from "./lang-en-v943-11";
import { EN_V943_12_RAW } from "./lang-en-v943-12";
import { EN_V943_13_RAW } from "./lang-en-v943-13";

/* v9.43 · EN MEGA 16.000 · bloques generados (ids en943-m<lvl>-<slug>) */
export const EN_V943: VocabWord[] = parseMega([EN_V943_1_RAW, EN_V943_2_RAW, EN_V943_3_RAW, EN_V943_4_RAW, EN_V943_5_RAW, EN_V943_6_RAW, EN_V943_7_RAW, EN_V943_8_RAW, EN_V943_9_RAW, EN_V943_10_RAW, EN_V943_11_RAW, EN_V943_12_RAW, EN_V943_13_RAW].join("\n"), "en943");
