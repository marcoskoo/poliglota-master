import { parseMega } from "./mega-parse";
import type { VocabWord } from "../types";
import { IT_V943_1_RAW } from "./lang-it-v943-1";
import { IT_V943_2_RAW } from "./lang-it-v943-2";
import { IT_V943_3_RAW } from "./lang-it-v943-3";
import { IT_V943_4_RAW } from "./lang-it-v943-4";
import { IT_V943_5_RAW } from "./lang-it-v943-5";
import { IT_V943_6_RAW } from "./lang-it-v943-6";
import { IT_V943_7_RAW } from "./lang-it-v943-7";
import { IT_V943_8_RAW } from "./lang-it-v943-8";
import { IT_V943_9_RAW } from "./lang-it-v943-9";
import { IT_V943_10_RAW } from "./lang-it-v943-10";
import { IT_V943_11_RAW } from "./lang-it-v943-11";

/* v9.43 · IT MEGA 16.000 · bloques generados (ids it943-m<lvl>-<slug>) */
export const IT_V943: VocabWord[] = parseMega([IT_V943_1_RAW, IT_V943_2_RAW, IT_V943_3_RAW, IT_V943_4_RAW, IT_V943_5_RAW, IT_V943_6_RAW, IT_V943_7_RAW, IT_V943_8_RAW, IT_V943_9_RAW, IT_V943_10_RAW, IT_V943_11_RAW].join("\n"), "it943");
