import { parseMega } from "./mega-parse";
import type { VocabWord } from "../types";
import { DE_MEGA_1_RAW } from "./lang-de-mega1";
import { DE_MEGA_2_RAW } from "./lang-de-mega2";

/* v9.42 · DE MEGA · fusión de bloques */
export const DE_MEGA: VocabWord[] = parseMega([DE_MEGA_1_RAW, DE_MEGA_2_RAW].join("\n"), "dem");
