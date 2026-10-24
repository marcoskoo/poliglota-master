import { parseMega } from "./mega-parse";
import type { VocabWord } from "../types";
import { PT_MEGA_1_RAW } from "./lang-pt-mega1";
import { PT_MEGA_2_RAW } from "./lang-pt-mega2";

/* v9.42 · PT MEGA · fusión de bloques */
export const PT_MEGA: VocabWord[] = parseMega([PT_MEGA_1_RAW, PT_MEGA_2_RAW].join("\n"), "ptm");
