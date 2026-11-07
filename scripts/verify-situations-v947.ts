/* v9.47 · Validación mecánica de las situaciones reales en 5 lenguas
   - cuenta por lengua y nivel (debe haber 20 por lengua)
   - ids únicos
   - vocab >= 6, diálogo 5-7 líneas con es no vacío
   - exerciseIds existen en el orquestador global
   - roleplay con it y es                                    */
import { SITUATIONS } from "../src/lib/lms/situations";
import { EN_SITUATIONS } from "../src/lib/lms/lang/en/situations";
import { PT_SITUATIONS } from "../src/lib/lms/lang/pt/situations";
import { FR_SITUATIONS } from "../src/lib/lms/lang/fr/situations";
import { DE_SITUATIONS } from "../src/lib/lms/lang/de/situations";
import { getExercises } from "../src/lib/lms/exercises";

const BY_LANG: Record<string, typeof SITUATIONS> = {
  it: SITUATIONS, en: EN_SITUATIONS, pt: PT_SITUATIONS, fr: FR_SITUATIONS, de: DE_SITUATIONS,
};

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
let errors = 0;
const err = (lang: string, msg: string) => { errors++; console.log(`✗ [${lang}] ${msg}`); };

for (const [lang, list] of Object.entries(BY_LANG)) {
  // 1. total = 20
  if (list.length !== 20) err(lang, `total ${list.length} ≠ 20`);

  // 2. ids únicos
  const ids = list.map((s) => s.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) err(lang, `ids duplicados: ${dup.join(", ")}`);

  // 3. niveles
  const byLevel: Record<string, number> = {};
  for (const s of list) {
    if (!LEVELS.includes(s.level)) err(lang, `${s.id}: nivel inválido ${s.level}`);
    byLevel[s.level] = (byLevel[s.level] ?? 0) + 1;

    // 4. contenido (mínimo histórico: 5 vocab; las nuevas v9.47: >= 6)
    const isNew = /^(en|pt|fr|de)-sit-(coffee|pharmacy|laundry|rideshare|gym|mechanic|library|jobinterview|dinner|returns|apartment|townhall|presentation|podcast|padaria|autocarro|quiosque|taxi|centro-saude|tasca|museu|emprego|ctt|banco|imobiliaria|reuniao|conferencia|debate|fromagerie|kiosque|epicerie|bus|gare|medecin|bricolage|entretien|restaurant|assurance|colloque|apotheke|buergeramt|bahnsteig|fahrrad|buchhandlung|bewerbung|zahnarzt|versicherung|betriebsrat|vortrag|podium)/.test(s.id);
    const minVocab = isNew ? 6 : 5;
    if (s.vocab.length < minVocab) err(lang, `${s.id}: vocab ${s.vocab.length} < ${minVocab}${isNew ? " (nueva v9.47)" : " (histórico)"}`);
    for (const v of s.vocab) {
      if (!v.it.trim() || !v.es.trim()) err(lang, `${s.id}: vocab con campos vacíos`);
    }
    if (s.dialogue.length < 5 || s.dialogue.length > 7) err(lang, `${s.id}: diálogo ${s.dialogue.length} líneas`);
    for (const d of s.dialogue) {
      if (!d.it.trim() || !d.es.trim()) err(lang, `${s.id}: battuta con campos vacíos`);
    }
    if (!s.roleplay.it.trim() || !s.roleplay.es.trim()) err(lang, `${s.id}: roleplay vacío`);
    if (!s.intro.trim()) err(lang, `${s.id}: intro vacía`);

    // 5. ejercicios resueltos
    const resolved = getExercises(s.exerciseIds);
    if (resolved.length !== s.exerciseIds.length) {
      const missing = s.exerciseIds.filter((id) => !getExercises([id]).length);
      err(lang, `${s.id}: exerciseIds sin resolver: ${missing.join(", ")}`);
    }
  }
  console.log(`── ${lang}: ${list.length} situaciones · ` + LEVELS.map((l) => `${l}:${byLevel[l] ?? 0}`).join(" "));
}

console.log(errors === 0 ? "\n✓ TODO CORRECTO: 5 lenguas × 20 situaciones, ejercicios íntegros" : `\n✗ ${errors} problemas`);
process.exit(errors === 0 ? 0 : 1);
