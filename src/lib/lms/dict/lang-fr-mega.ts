import { parseMega } from "./mega-parse";
import type { VocabWord } from "../types";
import { FR_MEGA_1_RAW } from "./lang-fr-mega1";
import { FR_MEGA_2_RAW } from "./lang-fr-mega2";

/* v9.42 · FR MEGA · fusión de bloques */
export const FR_MEGA: VocabWord[] = parseMega([FR_MEGA_1_RAW, FR_MEGA_2_RAW].join("\n"), "frm");
