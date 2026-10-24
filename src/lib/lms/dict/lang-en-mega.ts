import { parseMega, dedupMerge } from "./mega-parse";
import type { VocabWord } from "../types";

/* ═══ v9.42 · EN MEGA · fusión de los 8 bloques ══════════════════════
   La fusión con dedupMerge aplica en lang-en.ts: base → plus → mega.
   Bloques: 1 cuerpo/casa/comida/ropa/ciudad · 2 naturaleza/trabajo/emo ·
   3 -tion · 4 concretos ampliados · 5 verbos B2 + sociedad ·
   6 -ly generados + derivados curados · 7 irregulares + phrasal ·
   8 C1/C2 académico + idioms. */

import { EN_MEGA_1_RAW } from "./lang-en-mega1";
import { EN_MEGA_2_RAW } from "./lang-en-mega2";
import { EN_MEGA_3_RAW } from "./lang-en-mega3";
import { EN_MEGA_4_RAW } from "./lang-en-mega4";
import { EN_MEGA_5_RAW } from "./lang-en-mega5";
import { EN_MEGA_6_RAW } from "./lang-en-mega6";
import { EN_MEGA_7_RAW } from "./lang-en-mega7";
import { EN_MEGA_8_RAW } from "./lang-en-mega8";

export const EN_MEGA: VocabWord[] = parseMega(
  [EN_MEGA_1_RAW, EN_MEGA_2_RAW, EN_MEGA_3_RAW, EN_MEGA_4_RAW, EN_MEGA_5_RAW, EN_MEGA_6_RAW, EN_MEGA_7_RAW, EN_MEGA_8_RAW].join("\n"),
  "enm",
);
