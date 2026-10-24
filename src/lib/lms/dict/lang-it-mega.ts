import { parsePack } from "./compact";
import { parseMega } from "./mega-parse";
import type { VocabWord } from "../types";

/* ═══ v9.42 · IT MEGA · fusión de bloques B1→C2 ═════════════════════
   Ampliación del diccionario italiano hacia las 10.000 palabras.
   Cada bloque se parsea con su nivel (parsePack valida campos e ids).
   mergePacks (vocabulary.ts) deduplica por lema contra la base y los
   packs históricos: el orden de push decide qué entrada enriquece.  */

import { IT_MEGA_B1_RAW } from "./lang-it-mega1";
import { IT_MEGA_B2A_RAW } from "./lang-it-mega2";
import { IT_MEGA_B2B_RAW } from "./lang-it-mega3";
import { IT_MEGA_C1_RAW } from "./lang-it-mega4";
import { IT_MEGA_C2_RAW } from "./lang-it-mega5";
import { IT_MEGA_B2C1A_RAW } from "./lang-it-mega6";
import { IT_MEGA_B2C1B_RAW } from "./lang-it-mega7";
import { IT_MEGA_C1C2_RAW } from "./lang-it-mega8";
import { IT_MEGA_FINAL_RAW } from "./lang-it-mega9";
import { IT_MEGA_COTID_RAW } from "./lang-it-mega10";
import { IT_MEGA_AVV_RAW } from "./lang-it-mega11";
import { IT_MEGA_NEGOZI_RAW } from "./lang-it-mega12";
import { IT_MEGA_CORPO_RAW } from "./lang-it-mega13";
import { IT_MEGA_GIOCHI_RAW } from "./lang-it-mega14";
import { IT_MEGA_FORMAGGI_RAW } from "./lang-it-mega15";
import { IT_MEGA_PASTA_RAW } from "./lang-it-mega16";

export const IT_MEGA: VocabWord[] = [
  ...parsePack(IT_MEGA_B1_RAW, "B1", "kxm-b1"),
  ...parsePack([IT_MEGA_B2A_RAW, IT_MEGA_B2B_RAW, IT_MEGA_B2C1A_RAW, IT_MEGA_B2C1B_RAW].join("\n"), "B2", "kxm-b2"),
  ...parsePack(IT_MEGA_C1_RAW, "C1", "kxm-c1"),
  ...parsePack([IT_MEGA_C2_RAW].join("\n"), "C2", "kxm-c2"),
  ...parseMega([IT_MEGA_C1C2_RAW, IT_MEGA_FINAL_RAW, IT_MEGA_COTID_RAW, IT_MEGA_AVV_RAW, IT_MEGA_NEGOZI_RAW, IT_MEGA_CORPO_RAW, IT_MEGA_GIOCHI_RAW, IT_MEGA_FORMAGGI_RAW, IT_MEGA_PASTA_RAW].join("\n"), "kxm"),
];
