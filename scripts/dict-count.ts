/* Conteo de léxico por lengua: VOCAB (vocabulary.ts) + DICT (dict/lang-*.ts) tras dedupMerge */
import { VOCAB as IT_VOCAB } from "../src/lib/lms/vocabulary";
import { getENDict } from "../src/lib/lms/dict/lang-en";
import { getPTDict } from "../src/lib/lms/dict/lang-pt";
import { getFRDict } from "../src/lib/lms/dict/lang-fr";
import { getDEDict } from "../src/lib/lms/dict/lang-de";
import { EN_VOCAB } from "../src/lib/lms/lang/en/vocabulary";
import { PT_VOCAB } from "../src/lib/lms/lang/pt/vocabulary";
import { FR_VOCAB } from "../src/lib/lms/lang/fr/vocabulary";
import { DE_VOCAB } from "../src/lib/lms/lang/de/vocabulary";
import { normKey } from "../src/lib/lms/dict/mega-parse";

function count(name: string, lists: { it: string; level?: string }[][]) {
  const seen = new Set<string>();
  let total = 0;
  const byLevel: Record<string, number> = {};
  for (const list of lists) for (const w of list) {
    const k = normKey(w.it);
    if (seen.has(k)) continue;
    seen.add(k);
    total++;
    byLevel[w.level ?? "?"] = (byLevel[w.level ?? "?"] ?? 0) + 1;
  }
  console.log(`${name}: ${total}  ·  ${JSON.stringify(byLevel)}`);
  return total;
}

count("IT", [IT_VOCAB]);
count("EN", [EN_VOCAB, getENDict()]);
count("PT", [PT_VOCAB, getPTDict()]);
count("FR", [FR_VOCAB, getFRDict()]);
count("DE", [DE_VOCAB, getDEDict()]);
