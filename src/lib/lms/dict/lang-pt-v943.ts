import { parseMega } from "./mega-parse";
import type { VocabWord } from "../types";
import { PT_V943_1_RAW } from "./lang-pt-v943-1";
import { PT_V943_2_RAW } from "./lang-pt-v943-2";
import { PT_V943_3_RAW } from "./lang-pt-v943-3";
import { PT_V943_4_RAW } from "./lang-pt-v943-4";
import { PT_V943_5_RAW } from "./lang-pt-v943-5";
import { PT_V943_6_RAW } from "./lang-pt-v943-6";
import { PT_V943_7_RAW } from "./lang-pt-v943-7";
import { PT_V943_8_RAW } from "./lang-pt-v943-8";
import { PT_V943_9_RAW } from "./lang-pt-v943-9";
import { PT_V943_10_RAW } from "./lang-pt-v943-10";
import { PT_V943_11_RAW } from "./lang-pt-v943-11";
import { PT_V943_12_RAW } from "./lang-pt-v943-12";
import { PT_V943_13_RAW } from "./lang-pt-v943-13";

/* v9.43 · PT MEGA 16.000 · bloques generados (ids pt943-m<lvl>-<slug>) */
export const PT_V943: VocabWord[] = parseMega([PT_V943_1_RAW, PT_V943_2_RAW, PT_V943_3_RAW, PT_V943_4_RAW, PT_V943_5_RAW, PT_V943_6_RAW, PT_V943_7_RAW, PT_V943_8_RAW, PT_V943_9_RAW, PT_V943_10_RAW, PT_V943_11_RAW, PT_V943_12_RAW, PT_V943_13_RAW].join("\n"), "pt943");
