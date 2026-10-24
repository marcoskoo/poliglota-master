/* ═══ v9.39 · Datos de destrezas por lengua de estudio ══════════════
   Resolutor central: vocabulario (+léxico cerrado del analizador),
   gramática, escucha/lectura/escritura/conversación, situaciones,
   cultura, shadowing, test de nivel y pronunciación.
   IT → módulos históricos; EN/PT/FR/DE → lang/<l>/*.                */

import type { LangCode } from "./types";
import type { VocabWord, WordCategory, GrammarTopic, ListeningTask, ReadingText, WritingPrompt, ConversationScenario, Situation, CultureArticle } from "./types";
import type { ShadowPhrase } from "./shadowing";
import type { LevelTestItem } from "./leveltest";
import { VOCAB as IT_VOCAB } from "./vocabulary";
import { GRAMMAR as IT_GRAMMAR, GRAMMAR_IMG } from "./grammar";
import { LISTENING, LISTENING_IMG } from "./listening";
import { READINGS, READING_IMG } from "./reading";
import { WRITINGS } from "./writing";
import { CONVERSATION_SCENARIOS, CONVERSATION_IMG } from "./conversation";
import { SITUATIONS, SITUATION_IMG } from "./situations";
import { CULTURE, CULTURE_IMG } from "./culture";
import { SHADOW_PHRASES, ORAL_TASKS } from "./shadowing";
import { LEVEL_TEST } from "./leveltest";

import { EN_VOCAB, EN_CLOSED } from "./lang/en/vocabulary";
import { EN_GRAMMAR } from "./lang/en/grammar";
import { EN_LISTENING, EN_READINGS, EN_WRITINGS, EN_CONVERSATION } from "./lang/en/skills";
import { EN_SITUATIONS } from "./lang/en/situations";
import { EN_CULTURE } from "./lang/en/culture";
import { EN_SHADOWING } from "./lang/en/shadowing";
import { EN_LEVEL_TEST } from "./lang/en/leveltest";
import { EN_PRONUNCIATION } from "./lang/en/pronunciation";

import { PT_VOCAB, PT_CLOSED } from "./lang/pt/vocabulary";
import { PT_GRAMMAR } from "./lang/pt/grammar";
import { PT_LISTENING, PT_READINGS, PT_WRITINGS, PT_CONVERSATION } from "./lang/pt/skills";
import { PT_SITUATIONS } from "./lang/pt/situations";
import { PT_CULTURE } from "./lang/pt/culture";
import { PT_SHADOWING } from "./lang/pt/shadowing";
import { PT_LEVEL_TEST } from "./lang/pt/leveltest";
import { PT_PRONUNCIATION } from "./lang/pt/pronunciation";

import { FR_VOCAB, FR_CLOSED } from "./lang/fr/vocabulary";
import { FR_GRAMMAR } from "./lang/fr/grammar";
import { FR_LISTENING, FR_READINGS, FR_WRITINGS, FR_CONVERSATION } from "./lang/fr/skills";
import { FR_SITUATIONS } from "./lang/fr/situations";
import { FR_CULTURE } from "./lang/fr/culture";
import { FR_SHADOWING } from "./lang/fr/shadowing";
import { FR_LEVEL_TEST } from "./lang/fr/leveltest";
import { FR_PRONUNCIATION } from "./lang/fr/pronunciation";

import { DE_VOCAB, DE_CLOSED } from "./lang/de/vocabulary";
import { DE_GRAMMAR } from "./lang/de/grammar";
import { DE_LISTENING, DE_READINGS, DE_WRITINGS, DE_CONVERSATION } from "./lang/de/skills";
import { DE_SITUATIONS } from "./lang/de/situations";
import { DE_CULTURE } from "./lang/de/culture";
import { DE_SHADOWING } from "./lang/de/shadowing";
import { DE_LEVEL_TEST } from "./lang/de/leveltest";
import { DE_PRONUNCIATION } from "./lang/de/pronunciation";

/* ── Vocabulario ────────────────────────────────────────────────────
   v9.41 · las lenguas no italianas usan el DICCIONARIO COMPLETO
   (base A1-B1 + pack plus B1-C2), igual que el italiano histórico:
   los juegos (memoria/ahorcado) y las fichas ganan todo el léxico. */
import { getENDict } from "./dict/lang-en";
import { getPTDict } from "./dict/lang-pt";
import { getFRDict } from "./dict/lang-fr";
import { getDEDict } from "./dict/lang-de";
/* v9.43 · CEFR 16.000: la unión VOCAB∪DICT se materializa bajo demanda
   con caché por lengua (16.000×5 entradas no caben en el arranque). */
const VOCAB_CACHE: Partial<Record<LangCode, VocabWord[]>> = {};
export function vocabFor(lang: string | undefined | null): VocabWord[] {
  const key = (["it", "en", "pt", "fr", "de"] as LangCode[]).includes((lang ?? "it") as LangCode)
    ? ((lang ?? "it") as LangCode)
    : "it";
  const cached = VOCAB_CACHE[key];
  if (cached) return cached;
  const list: VocabWord[] =
    key === "en" ? [...EN_VOCAB, ...getENDict()]
    : key === "pt" ? [...PT_VOCAB, ...getPTDict()]
    : key === "fr" ? [...FR_VOCAB, ...getFRDict()]
    : key === "de" ? [...DE_VOCAB, ...getDEDict()]
    : IT_VOCAB;
  VOCAB_CACHE[key] = list;
  return list;
}
export function wordsByCategoryFor(lang: string | undefined | null, cat: WordCategory): VocabWord[] {
  return vocabFor(lang).filter((w) => w.cat === cat);
}

/* ── Léxico cerrado (Analizador de frases) ──────────────────────────
   El italiano histórico vive inline en analyzer.tsx; se replica aquí
   para exponer una única fuente por lengua.                          */
const IT_CLOSED: Record<string, string> = {
  il: "el", lo: "el", la: "la", i: "los", gli: "los", le: "las", un: "un", uno: "un", una: "una",
  un_: "un", di: "de", a: "a", da: "de/desde", in: "en", con: "con", su: "sobre", per: "para",
  del: "del", della: "de la", dei: "de los", degli: "de los", delle: "de las", al: "al", alla: "a la",
  ai: "a los", agli: "a los", alle: "a las", dal: "del", dalla: "de la", dai: "de los", dagli: "de los",
  dalle: "de las", nel: "en el", nella: "en la", nei: "en los", negli: "en los", nelle: "en las",
  sul: "sobre el", sulla: "sobre la", sui: "sobre los", sulle: "sobre las", col: "con el",
  e: "y", o: "o", ma: "pero", però: "sin embargo", che: "que", se: "si", perché: "porque/por qué",
  come: "cómo/como", dove: "dónde", quando: "cuándo", quanto: "cuánto", quale: "cuál", chi: "quién",
  cosa: "qué", non: "no", anche: "también", molto: "mucho", poco: "poco", più: "más", meno: "menos",
  già: "ya", ancora: "todavía", sempre: "siempre", mai: "nunca", oggi: "hoy", domani: "mañana", ieri: "ayer",
  qui: "aquí", là: "allí", adesso: "ahora", poi: "después", prima: "antes", bene: "bien", male: "mal",
  io: "yo", tu: "tú", lui: "él", lei: "ella", noi: "nosotros", voi: "vosotros", loro: "ellos",
  mi: "me", ti: "te", si: "se", ci: "nos", vi: "os", è: "es", sono: "son/soy", era: "era", erano: "eran",
  ho: "he/tengo", hai: "has/tienes", ha: "ha/tiene", abbiamo: "hemos/tenemos", avete: "habéis/tenéis",
  hanno: "han/tienen", "c'è": "hay (sing.)", "ci sono": "hay (plural)",
  questo: "este", questa: "esta", questi: "estos", quello: "ese/aquél", quella: "esa/aquélla",
  sì: "sí", no: "no", grazie: "gracias", prego: "de nada", tutto: "todo", tutti: "todos",
  ogni: "cada", tra: "entre", fra: "entre", verso: "hacia", senza: "sin", sotto: "debajo", sopra: "encima",
  davanti: "delante", dietro: "detrás", mentre: "mientras", quindi: "por lo tanto", invece: "en cambio",
};
const CLOSED_BY_LANG: Record<LangCode, Record<string, string>> = {
  it: IT_CLOSED, en: EN_CLOSED, pt: PT_CLOSED, fr: FR_CLOSED, de: DE_CLOSED,
};
export function closedLexiconFor(lang: string | undefined | null): Record<string, string> {
  return CLOSED_BY_LANG[(lang ?? "it") as LangCode] ?? IT_CLOSED;
}

/* ── Gramática ────────────────────────────────────────────────────── */
const GRAMMAR_BY_LANG: Record<LangCode, GrammarTopic[]> = {
  it: IT_GRAMMAR, en: EN_GRAMMAR, pt: PT_GRAMMAR, fr: FR_GRAMMAR, de: DE_GRAMMAR,
};
export function grammarFor(lang: string | undefined | null): GrammarTopic[] {
  return GRAMMAR_BY_LANG[(lang ?? "it") as LangCode] ?? IT_GRAMMAR;
}

/* ── Destrezas: escucha / lectura / escritura / conversación ──────── */
const LISTENING_BY_LANG: Record<LangCode, ListeningTask[]> = {
  it: LISTENING, en: EN_LISTENING, pt: PT_LISTENING, fr: FR_LISTENING, de: DE_LISTENING,
};
const READINGS_BY_LANG: Record<LangCode, ReadingText[]> = {
  it: READINGS, en: EN_READINGS, pt: PT_READINGS, fr: FR_READINGS, de: DE_READINGS,
};
const WRITINGS_BY_LANG: Record<LangCode, WritingPrompt[]> = {
  it: WRITINGS, en: EN_WRITINGS, pt: PT_WRITINGS, fr: FR_WRITINGS, de: DE_WRITINGS,
};
const CONVERSATION_BY_LANG: Record<LangCode, ConversationScenario[]> = {
  it: CONVERSATION_SCENARIOS, en: EN_CONVERSATION, pt: PT_CONVERSATION, fr: FR_CONVERSATION, de: DE_CONVERSATION,
};
export function listeningFor(lang: string | undefined | null): ListeningTask[] {
  return LISTENING_BY_LANG[(lang ?? "it") as LangCode] ?? LISTENING;
}
export function readingsFor(lang: string | undefined | null): ReadingText[] {
  return READINGS_BY_LANG[(lang ?? "it") as LangCode] ?? READINGS;
}
export function writingsFor(lang: string | undefined | null): WritingPrompt[] {
  return WRITINGS_BY_LANG[(lang ?? "it") as LangCode] ?? WRITINGS;
}
export function conversationFor(lang: string | undefined | null): ConversationScenario[] {
  return CONVERSATION_BY_LANG[(lang ?? "it") as LangCode] ?? CONVERSATION_SCENARIOS;
}

/* ── Ilustraciones v9.40 · fotos realistas por lengua ───────────────
   El italiano conserva sus jpg históricos; EN/PT/FR/DE estrenan fotos
   realistas generadas (mismo patrón de ruta: /images/<carpeta>/<id>). */
const imgMap = (list: { id: string }[], folder: string, ext = "jpg") =>
  Object.fromEntries(list.map((t) => [t.id, `/images/${folder}/${t.id}.${ext}`]));

const LISTENING_IMG_BY_LANG: Record<LangCode, Record<string, string>> = {
  it: LISTENING_IMG,
  en: imgMap(EN_LISTENING, "ascolto"), pt: imgMap(PT_LISTENING, "ascolto"),
  fr: imgMap(FR_LISTENING, "ascolto"), de: imgMap(DE_LISTENING, "ascolto"),
};
const READING_IMG_BY_LANG: Record<LangCode, Record<string, string>> = {
  it: READING_IMG,
  en: imgMap(EN_READINGS, "testi"), pt: imgMap(PT_READINGS, "testi"),
  fr: imgMap(FR_READINGS, "testi"), de: imgMap(DE_READINGS, "testi"),
};
const CONVERSATION_IMG_BY_LANG: Record<LangCode, Record<string, string>> = {
  it: CONVERSATION_IMG,
  en: imgMap(EN_CONVERSATION, "conversazione"), pt: imgMap(PT_CONVERSATION, "conversazione"),
  fr: imgMap(FR_CONVERSATION, "conversazione"), de: imgMap(DE_CONVERSATION, "conversazione"),
};
/* v9.40 · nueva carpeta de fotos para los ejercicios de escritura */
const WRITING_IMG_BY_LANG: Record<LangCode, Record<string, string>> = {
  it: imgMap(WRITINGS, "scrittura"),
  en: imgMap(EN_WRITINGS, "scrittura"), pt: imgMap(PT_WRITINGS, "scrittura"),
  fr: imgMap(FR_WRITINGS, "scrittura"), de: imgMap(DE_WRITINGS, "scrittura"),
};
export function listeningImgFor(lang: string | undefined | null): Record<string, string> {
  return LISTENING_IMG_BY_LANG[(lang ?? "it") as LangCode] ?? LISTENING_IMG;
}
export function readingImgFor(lang: string | undefined | null): Record<string, string> {
  return READING_IMG_BY_LANG[(lang ?? "it") as LangCode] ?? READING_IMG;
}
export function conversationImgFor(lang: string | undefined | null): Record<string, string> {
  return CONVERSATION_IMG_BY_LANG[(lang ?? "it") as LangCode] ?? CONVERSATION_IMG;
}
export function writingImgFor(lang: string | undefined | null): Record<string, string> {
  return WRITING_IMG_BY_LANG[(lang ?? "it") as LangCode] ?? WRITING_IMG_BY_LANG.it;
}
export function grammarImgFor(lang: string | undefined | null): Record<string, string> {
  return (lang ?? "it") === "it" ? GRAMMAR_IMG : {};
}

/* ── Situaciones ──────────────────────────────────────────────────── */
const SITUATIONS_BY_LANG: Record<LangCode, Situation[]> = {
  it: SITUATIONS, en: EN_SITUATIONS, pt: PT_SITUATIONS, fr: FR_SITUATIONS, de: DE_SITUATIONS,
};
export function situationsFor(lang: string | undefined | null): Situation[] {
  return SITUATIONS_BY_LANG[(lang ?? "it") as LangCode] ?? SITUATIONS;
}
export function situationImgFor(lang: string | undefined | null): Record<string, string> {
  const l = (lang ?? "it") as LangCode;
  if (l === "it") return SITUATION_IMG;
  const map: Record<LangCode, { id: string }[]> = {
    it: [], en: EN_SITUATIONS, pt: PT_SITUATIONS, fr: FR_SITUATIONS, de: DE_SITUATIONS,
  };
  return imgMap(map[l] ?? [], "situazioni");
}

/* ── Cultura ──────────────────────────────────────────────────────── */
const CULTURE_BY_LANG: Record<LangCode, CultureArticle[]> = {
  it: CULTURE, en: EN_CULTURE, pt: PT_CULTURE, fr: FR_CULTURE, de: DE_CULTURE,
};
export function cultureFor(lang: string | undefined | null): CultureArticle[] {
  return CULTURE_BY_LANG[(lang ?? "it") as LangCode] ?? CULTURE;
}
export function cultureImgFor(lang: string | undefined | null): Record<string, string> {
  const l = (lang ?? "it") as LangCode;
  if (l === "it") return CULTURE_IMG;
  const map: Record<LangCode, { id: string }[]> = {
    it: [], en: EN_CULTURE, pt: PT_CULTURE, fr: FR_CULTURE, de: DE_CULTURE,
  };
  return imgMap(map[l] ?? [], "cultura");
}

/* ── Shadowing ──────────────────────────────────────────────────────
   IT: SHADOW_PHRASES plano. EN/PT/FR/DE: guiones (ShadowingScript[])
   que se aplanan a frases; si la frase no trae level, hereda el del
   guion. Los ORAL_TASKS siguen siendo italianos → solo en IT.        */
type RawScript = { level?: string; phrases: { id: string; level?: string; it: string; es: string; tip?: string }[] };
function flatten(scripts: RawScript[]): ShadowPhrase[] {
  return scripts.flatMap((s) =>
    s.phrases.map((p) => ({
      id: p.id,
      level: (p.level ?? s.level ?? "A1") as ShadowPhrase["level"],
      it: p.it,
      es: p.es,
      tip: p.tip,
    }))
  );
}
const SHADOW_BY_LANG: Record<LangCode, ShadowPhrase[]> = {
  /* FR llegó como array plano de frases (mismo formato que IT) */
  it: SHADOW_PHRASES, en: flatten(EN_SHADOWING), pt: flatten(PT_SHADOWING), fr: FR_SHADOWING, de: flatten(DE_SHADOWING),
};
export function shadowPhrasesFor(lang: string | undefined | null): ShadowPhrase[] {
  return SHADOW_BY_LANG[(lang ?? "it") as LangCode] ?? SHADOW_PHRASES;
}
export const ORAL_TASKS_IT_ONLY = ORAL_TASKS;

/* ── Test de nivel ────────────────────────────────────────────────── */
const LEVELTEST_BY_LANG: Record<LangCode, LevelTestItem[]> = {
  it: LEVEL_TEST, en: EN_LEVEL_TEST, pt: PT_LEVEL_TEST, fr: FR_LEVEL_TEST, de: DE_LEVEL_TEST,
};
export function levelTestFor(lang: string | undefined | null): LevelTestItem[] {
  return LEVELTEST_BY_LANG[(lang ?? "it") as LangCode] ?? LEVEL_TEST;
}

/* ── Pronunciación ────────────────────────────────────────────────── */
export interface PronSound { id: string; title: string; rule: string; words: { w: string; es: string }[]; level: string; }
const IT_PRONUNCIATION: PronSound[] = [
  { id: "pr-ch", title: "La «ch» italiana", level: "A1", rule: "«ch» suena siempre /k/: chiesa, chiave. Nunca como la «ch» española de «chico». Error típico: pronunciar «ciao» como /chao/ en vez de /chao/ con /k/... es /CHAO/ con la «ch» a la italiana: /kiao/.", words: [{ w: "ciao", es: "hola/adiós" }, { w: "chiesa", es: "iglesia" }, { w: "chiave", es: "llave" }, { w: "anche", es: "también" }] },
  { id: "pr-gn", title: "«gn» = ñ", level: "A1", rule: "«gn» equivale a la ñ española: bagno, gnocchi. Es el mismo sonido de «ñoño».", words: [{ w: "bagno", es: "baño" }, { w: "gnocchi", es: "ñoquis" }, { w: "lasagne", es: "lasaña" }, { w: "ogni", es: "cada" }] },
  { id: "pr-gl", title: "«gli» = ll", level: "A2", rule: "«gli» suena como «ll» (o «y» rioplatense): famiglia, figlio. Antes de vocal puede sonar más suave: maglione.", words: [{ w: "famiglia", es: "familia" }, { w: "figlio", es: "hijo" }, { w: "maglione", es: "suéter" }, { w: "bottiglia", es: "botella" }] },
  { id: "pr-sc", title: "«sc» doble cara", level: "A2", rule: "«sc» ante e/i suena /sh/: pesce, scena. Ante a/o/u/consonante suena /sk/: scala, scuro.", words: [{ w: "pesce", es: "pescado" }, { w: "scena", es: "escena" }, { w: "scala", es: "escalera" }, { w: "scuola", es: "escuela" }] },
  { id: "pr-r", title: "La R vibrante", level: "A1", rule: "La «r» italiana es vibrante simple (una vibración corta), nunca aspirada ni gutural: Roma, caro.", words: [{ w: "Roma", es: "Roma" }, { w: "caro", es: "caro" }, { w: "rosso", es: "rojo" }, { w: "vero", es: "verdadero" }] },
  { id: "pr-z", title: "«z» sonora o sorda", level: "B1", rule: "«z» puede ser /ts/ (pizza, stazione) o /dz/ (zero, zaino). No hay regla fija: se aprende palabra por palabra.", words: [{ w: "pizza", es: "pizza" }, { w: "stazione", es: "estación" }, { w: "zero", es: "cero" }, { w: "zaino", es: "mochila" }] },
  { id: "pr-doppie", title: "Consonantes dobles", level: "B1", rule: "La consonante doble se pronuncia más larga y cierra la vocal anterior: pala vs palla suenan distintas. Es clave para el significado.", words: [{ w: "palla", es: "pelota" }, { w: "nonno", es: "abuelo" }, { w: "sette", es: "siete" }, { w: "caffè", es: "café" }] },
  { id: "pr-accento", title: "El acento tónico", level: "B1", rule: "La mayoría de palabras son llanas (cóppa, càne). El acento gráfico solo se escribe en las esdrújulas y en los monosílabos tónicos: città, caffè, più, però.", words: [{ w: "città", es: "ciudad" }, { w: "però", es: "sin embargo" }, { w: "più", es: "más" }, { w: "caffè", es: "café" }] },
  { id: "pr-e-o", title: "E y O abiertas/cerradas", level: "C1", rule: "La «e» y la «o» pueden ser abiertas (è) o cerradas (é): pesca puede significar «pesca» (abierta) o «durazno» (cerrada) según el sonido. Varía por región.", words: [{ w: "pesca", es: "pesca/durazno" }, { w: "botte", es: "barril/golpe" }, { w: "venti", es: "veinte/vientos" }, { w: "scelta", es: "elección" }] },
  { id: "pr-tronche", title: "Palabras troncheadas", level: "C1", rule: "Muchos plurales pierden la sílaba final: uomo/uomini, cielo/cieli. La pronunciación debe seguir la forma nueva, no la raíz.", words: [{ w: "uomini", es: "hombres" }, { w: "cavalli", es: "caballos" }, { w: "specchi", es: "espejos" }, { w: "centinaia", es: "centenares" }] },
];
const PRON_BY_LANG: Record<LangCode, PronSound[]> = {
  it: IT_PRONUNCIATION, en: EN_PRONUNCIATION, pt: PT_PRONUNCIATION, fr: FR_PRONUNCIATION, de: DE_PRONUNCIATION,
};
export function pronunciationFor(lang: string | undefined | null): PronSound[] {
  return PRON_BY_LANG[(lang ?? "it") as LangCode] ?? IT_PRONUNCIATION;
}

/* v9.40 · fotos realistas por sonido (boca articulando) en 5 lenguas */
const PRON_IMG_BY_LANG: Record<LangCode, Record<string, string>> = {
  it: imgMap(IT_PRONUNCIATION, "pronuncia", "webp"),
  en: imgMap(EN_PRONUNCIATION, "pronuncia", "webp"),
  pt: imgMap(PT_PRONUNCIATION, "pronuncia", "webp"),
  fr: imgMap(FR_PRONUNCIATION, "pronuncia", "webp"),
  de: imgMap(DE_PRONUNCIATION, "pronuncia", "webp"),
};
export function pronImgFor(lang: string | undefined | null): Record<string, string> {
  return PRON_IMG_BY_LANG[(lang ?? "it") as LangCode] ?? PRON_IMG_BY_LANG.it;
}
