/* ═══ v9.43 · Generador SDK de diccionario CEFR 16.000 palabras/lengua ═══
   Llama al LLM del sandbox (z-ai-web-dev-sdk, coste 0 €) por lotes:
   cada petición pide N palabras de UN subtema + nivel MCER con una
   lista de exclusión de lemas ya cubiertos. Valida formato, juego de
   caracteres por lengua y duplicados (normKey); lo aceptado se
   appendiza al pool (scripts/v943-pool/<lang>.txt) → reanudable.
   (La cuota del chat API estuvo agotada durante la fase principal de
   v9.43: el grueso lo generaron los subagentes; este script queda
   como herramienta de recarga puntual.)

   Uso:
     bun scripts/v943-gen.ts --minutes 8.5 --workers 3
     bun scripts/v943-gen.ts --lang pt --limit 5
     bun scripts/v943-gen.ts --report                    */

import ZAI from "z-ai-web-dev-sdk";
import { mkdirSync, readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
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
import { TOPICS, type Topic } from "./v943-topics";

/* ── Configuración ─────────────────────────────────────────────────── */
const TOTAL_TARGET = 16_000;
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = (typeof LEVELS)[number];
const SHAPE: Record<Level, number> = { A1: 560, A2: 560, B1: 2080, B2: 3200, C1: 4800, C2: 4800 };
const CUM: Record<Level, number> = { A1: 500, A2: 1000, B1: 2000, B2: 4000, C1: 8000, C2: 16000 };
const BATCH: Record<Level, number> = { A1: 70, A2: 110, B1: 120, B2: 120, C1: 100, C2: 90 };
const BAND_OF: Record<Level, "easy" | "mid" | "hard"> = { A1: "easy", A2: "easy", B1: "mid", B2: "mid", C1: "hard", C2: "hard" };

const LANG_NAME: Record<string, string> = {
  it: "italiano",
  en: "inglés americano",
  pt: "portugués de Portugal",
  fr: "francés de Francia",
  de: "alemán estándar (Hochdeutsch)",
};

const WORD_RE: Record<string, RegExp> = {
  it: /^[A-Za-zàèéìòùÀÈÉÌÒÙ][A-Za-zàèéìòùÀÈÉÌÒÙ'’ -]{1,31}$/,
  en: /^[A-Za-z][A-Za-z'’ -]{1,31}$/,
  pt: /^[A-Za-záâãàçéêíóôõúÁÂÃÀÇÉÊÍÓÔÕÚ][A-Za-záâãàçéêíóôõúÁÂÃÀÇÉÊÍÓÔÕÚ'’ -]{1,31}$/,
  fr: /^[A-Za-zàâçéèêëîïôùûüœæÀÂÇÉÈÊËÎÏÔÙÛÜŒÆ][A-Za-zàâçéèêëîïôùûüœæÀÂÇÉÈÊËÎÏÔÙÛÜŒÆ'’ -]{1,31}$/,
  de: /^[A-Za-zäöüßÄÖÜ][A-Za-zäöüßÄÖÜ'’ -]{1,31}$/,
};
const ES_RE = /^[A-Za-zÁáÀàÄäÂâÉéÈèÊêÍíÌìÎîÓóÒòÔôÖöÚúÙùÛüÜüÇçÑñ'’().,;:/¡!¿? -]{2,64}$/;

const TYPES = new Set(["S", "V", "A", "D", "E", "P", "R", "C", "T", "N", "I", "L"]);
const CATS = new Set(["sal", "fam", "cas", "ali", "cmp", "tra", "vig", "htl", "sla", "lav", "stu", "cit", "cli", "rop", "tec", "spt", "mus", "cin", "rel", "fin", "ris", "pro", "att", "sci", "let", "col", "cor", "ani", "nat", "tmp", "sve", "emo", "cmu", "ist", "cnn", "ast", "art"]);

const POOL_DIR = "/home/z/my-project/scripts/v943-pool";
mkdirSync(POOL_DIR, { recursive: true });

/* ── Estado ────────────────────────────────────────────────────────── */
interface LangState {
  calls: number;
  byLevel: Record<string, number>;
  topicsUsed: string[];
  done: boolean;
  errors: number;
}
const state: Record<string, LangState> = {};
const existing: Record<string, Set<string>> = {};
const poolLemmas: Record<string, Set<string>> = {};
const poolEntries: Record<string, { w: string; level: Level }[]> = {};
const queues: Record<string, Topic[]> = {};

function loadState(lang: string): LangState {
  const f = `${POOL_DIR}/${lang}.state.json`;
  if (existsSync(f)) return JSON.parse(readFileSync(f, "utf8"));
  return { calls: 0, byLevel: {}, topicsUsed: [], done: false, errors: 0 };
}
function saveState(lang: string) {
  writeFileSync(`${POOL_DIR}/${lang}.state.json`, JSON.stringify(state[lang], null, 1));
}
function loadPool(lang: string) {
  const f = `${POOL_DIR}/${lang}.txt`;
  if (!existsSync(f)) return;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const t = line.trim();
    if (!t) continue;
    const f6 = t.split("|");
    if (f6.length < 6) continue;
    const k = normKey(f6[0]);
    if (!k) continue;
    poolLemmas[lang].add(k);
    const lvl = f6[5] as Level;
    (poolEntries[lang] ??= []).push({ w: f6[0], level: lvl });
  }
}

/* ── Conteo y objetivos ────────────────────────────────────────────── */
function langLists(lang: string): { it: string; level: string }[][] {
  const W = (x: unknown) => x as { it: string; level: string }[];
  switch (lang) {
    case "it": return [W(IT_VOCAB)];
    case "en": return [W(EN_VOCAB), W(getENDict())];
    case "pt": return [W(PT_VOCAB), W(getPTDict())];
    case "fr": return [W(FR_VOCAB), W(getFRDict())];
    case "de": return [W(DE_VOCAB), W(getDEDict())];
    default: return [];
  }
}
function currentCounts(lang: string): Record<Level, number> {
  const seen = new Set<string>();
  const out: Record<Level, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  for (const list of langLists(lang)) for (const w of list) {
    const k = normKey(w.it);
    if (seen.has(k)) continue;
    seen.add(k);
    if ((w.level ?? "") in out) out[w.level as Level]++;
  }
  for (const e of poolEntries[lang] ?? []) {
    const k = normKey(e.w);
    if (seen.has(k)) continue;
    seen.add(k);
    out[e.level]++;
  }
  return out;
}
function bandTargets(cur: Record<Level, number>): Record<Level, number> {
  const t: Record<Level, number> = { ...cur };
  for (const lv of LEVELS) t[lv] = Math.max(t[lv], SHAPE[lv]);
  for (const lv of LEVELS) {
    const prevSum = LEVELS.slice(0, LEVELS.indexOf(lv)).reduce((a, l) => a + t[l], 0);
    t[lv] = Math.max(t[lv], CUM[lv] - prevSum);
  }
  const sum = LEVELS.reduce((a, l) => a + t[l], 0);
  if (sum < TOTAL_TARGET) t.C2 += TOTAL_TARGET - sum;
  else if (sum > TOTAL_TARGET) t.C2 = Math.max(t.C2 - (sum - TOTAL_TARGET), cur.C2);
  return t;
}

/* ── Prompt ────────────────────────────────────────────────────────── */
const SYSTEM = "Eres un lexicógrafo profesional que compila diccionarios didácticos bilingües para hispanohablantes. Respondes EXACTAMENTE con el formato pedido, sin preámbulos, sin numeración, sin comentarios y sin bloques de código.";

function sampleExclusions(lang: string, lvl: Level, n = 150): string[] {
  const sameBand = (poolEntries[lang] ?? []).filter((e) => e.level === lvl).map((e) => e.w);
  const repoBand: string[] = [];
  for (const list of langLists(lang)) for (const w of list) if (w.level === lvl) repoBand.push(w.it);
  const cand = [...new Set([...repoBand, ...sameBand])];
  for (let i = cand.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cand[i], cand[j]] = [cand[j], cand[i]];
  }
  return cand.slice(0, n);
}

function buildPrompt(lang: string, topic: Topic, lvl: Level, batch: number): string {
  const excl = sampleExclusions(lang, lvl);
  const exclStr = excl.length ? `\n- EVITA estas palabras, que ya están en el diccionario: ${excl.join(", ")}` : "";
  return `Generas entradas para un diccionario didáctico ${LANG_NAME[lang].toUpperCase()}→ESPAÑOL para hispanohablantes.

TAREA: ${batch} palabras de ${LANG_NAME[lang]} REALES del nivel ${lvl} del MCER, campo semántico: «${topic.t}».

FORMATO — una entrada por línea, EXACTAMENTE 6 campos separados por la barra vertical |:
palabra|traducción al español||CÓDIGO_TIPO|${topic.cat}|${lvl}
El tercer campo (fonética) SIEMPRE vacío: dos barras seguidas.

CÓDIGO_TIPO: S=sustantivo V=verbo A=adjetivo D=adverbio E=expresión L=locución P=pronombre R=preposición C=conjunción I=interjección

REGLAS:
- Solo palabras reales y verificables de ${LANG_NAME[lang]}; nada de invenciones, marcas ni siglas.
- Nivel ${lvl} ESTRICTO: ${lvl.startsWith("A") ? "vocabulario básico y frecuente de este campo" : lvl === "B1" || lvl === "B2" ? "vocabulario estándar pero específico, útil para opinar y describir" : "vocabulario avanzado, preciso o especializado; las palabras triviales de nivel inferior NO valen"}.
- La traducción al español de España debe ser natural y específica del sentido de la palabra en este campo.
- Sin repetir palabras ni variantes de una misma raíz más de dos veces.
- Nombres propios, personajes y topónimos: NO.${exclStr}

Responde SOLO con las ${batch} líneas.`;
}

/* ── SDK ───────────────────────────────────────────────────────────── */
let ZAI_INST: Awaited<ReturnType<typeof ZAI.create>> | null = null;
async function zaiInst() {
  return (ZAI_INST ??= await ZAI.create());
}
let PAUSE_UNTIL = 0;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function chatOnce(prompt: string, timeoutMs = 150_000): Promise<string> {
  const inst = await zaiInst();
  return await Promise.race([
    (async () => {
      const c = await inst.chat.completions.create({
        messages: [
          { role: "assistant", content: SYSTEM },
          { role: "user", content: prompt },
        ],
        thinking: { type: "disabled" },
      });
      return c.choices[0]?.message?.content ?? "";
    })(),
    new Promise<string>((_, rej) => setTimeout(() => rej(new Error("timeout de llamada")), timeoutMs)),
  ]);
}

async function chatRetry(lang: string, prompt: string): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    try {
      if (Date.now() < PAUSE_UNTIL) await sleep(PAUSE_UNTIL - Date.now());
      const out = await chatOnce(prompt);
      if (!out.trim()) throw new Error("respuesta vacía");
      return out;
    } catch (e) {
      const msg = String((e as Error)?.message ?? e);
      const is429 = msg.includes("429") || /too many/i.test(msg);
      state[lang].errors++;
      if (attempt >= 7) throw new Error(`API falla tras ${attempt} intentos: ${msg.slice(0, 120)}`);
      if (is429) PAUSE_UNTIL = Math.max(PAUSE_UNTIL, Date.now() + Math.min(25_000 * attempt, 150_000));
      const wait = is429 ? Math.min(25_000 * attempt, 150_000) : 4_000 * attempt;
      log(`  ⚠ [${lang}] intento ${attempt}: ${msg.slice(0, 90)} → espera ${Math.round(wait / 1000)}s`);
      await sleep(wait);
    }
  }
}

/* ── Validación ────────────────────────────────────────────────────── */
interface ValidateOut { accepted: string[]; dupes: number; invalid: number; reasons: Record<string, number> }

function validate(lang: string, raw: string): ValidateOut {
  const out: ValidateOut = { accepted: [], dupes: 0, invalid: 0, reasons: {} };
  const text = raw.replace(/```[a-z]*\n?/gi, "");
  const seenBatch = new Set<string>();
  for (const rawLine of text.split("\n")) {
    let line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    line = line.replace(/^\s*(?:\d+[.)]\s*|[-*•]\s*)/, "");
    if (!line.includes("|")) { out.invalid++; out.reasons["sin |"] = (out.reasons["sin |"] ?? 0) + 1; continue; }
    let f = line.split("|");
    if (f.length > 7) f = f.slice(0, 7);
    if (f.length < 6) { out.invalid++; out.reasons["<6 campos"] = (out.reasons["<6 campos"] ?? 0) + 1; continue; }
    if (!f[5] && f.length >= 7) { const tmp = f.slice(); tmp.splice(5, 1); f = tmp.slice(0, 6).concat(tmp[6] ? [tmp[6]] : []); }
    const word = f[0].trim();
    const es = f[1].trim();
    const t = (f[3] ?? "").trim();
    const cat = (f[4] ?? "").trim();
    const lvl = (f[5] ?? "").trim().toUpperCase();
    let extras = (f[6] ?? "").trim();
    if (!TYPES.has(t)) { out.invalid++; out.reasons["tipo"] = (out.reasons["tipo"] ?? 0) + 1; continue; }
    if (!CATS.has(cat)) { out.invalid++; out.reasons["cat"] = (out.reasons["cat"] ?? 0) + 1; continue; }
    if (!(LEVELS as readonly string[]).includes(lvl)) { out.invalid++; out.reasons["nivel"] = (out.reasons["nivel"] ?? 0) + 1; continue; }
    if (!WORD_RE[lang].test(word)) { out.invalid++; out.reasons["charset palabra"] = (out.reasons["charset palabra"] ?? 0) + 1; continue; }
    if (!ES_RE.test(es)) { out.invalid++; out.reasons["traducción"] = (out.reasons["traducción"] ?? 0) + 1; continue; }
    if (/\$\{|`/.test(line)) { out.invalid++; out.reasons["backtick"] = (out.reasons["backtick"] ?? 0) + 1; continue; }
    if (extras && !/^[a-z]+=[^;|]*(;[a-z]+=[^;|]*)*$/.test(extras)) extras = "";
    const key = normKey(word);
    if (!key) { out.invalid++; continue; }
    if (existing[lang].has(key) || poolLemmas[lang].has(key) || seenBatch.has(key)) { out.dupes++; continue; }
    seenBatch.add(key);
    out.accepted.push(extras ? `${word}|${es}||${t}|${cat}|${lvl}|${extras}` : `${word}|${es}||${t}|${cat}|${lvl}`);
  }
  return out;
}

/* ── Selección de trabajos ─────────────────────────────────────────── */
function nextTopic(lang: string, band: "easy" | "mid" | "hard"): Topic {
  const q = (queues[lang] ??= []);
  if (q.length === 0) {
    const pool = TOPICS.filter((t) => t.band === band);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    q.push(...pool);
  }
  const idx = q.findIndex((t) => t.band === band);
  if (idx < 0) {
    const pool = TOPICS.filter((t) => t.band === band);
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const [t] = q.splice(idx, 1);
  state[lang].topicsUsed.push(t.t);
  if (state[lang].topicsUsed.length > 400) state[lang].topicsUsed = state[lang].topicsUsed.slice(-400);
  return t;
}

function pickLevel(lang: string, targets: Record<Level, number>, cur: Record<Level, number>): Level | null {
  const weights: [Level, number][] = [];
  for (const lv of LEVELS) {
    const rem = targets[lv] - cur[lv];
    if (rem > 0) weights.push([lv, rem ** 1.2]);
  }
  if (!weights.length) return null;
  const total = weights.reduce((a, [, w]) => a + w, 0);
  let r = Math.random() * total;
  for (const [lv, w] of weights) {
    r -= w;
    if (r <= 0) return lv;
  }
  return weights[weights.length - 1][0];
}

/* ── Logging ───────────────────────────────────────────────────────── */
const t0 = Date.now();
function log(s: string) {
  const el = Math.round((Date.now() - t0) / 1000);
  console.log(`[${String(Math.floor(el / 60)).padStart(2, "0")}:${String(el % 60).padStart(2, "0")}] ${s}`);
}

/* ── Main ──────────────────────────────────────────────────────────── */
function report() {
  for (const lang of Object.keys(state)) {
    const cur = currentCounts(lang);
    const tgt = bandTargets(cur);
    const tot = LEVELS.reduce((a, l) => a + cur[l], 0);
    const bands = LEVELS.map((l) => `${l} ${cur[l]}/${tgt[l]}`).join(" · ");
    log(`${lang.toUpperCase()}  total ${tot}/${TOTAL_TARGET}  ${state[lang].done ? "✔" : "…"}  ${bands}  (llamadas ${state[lang].calls})`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const argN = (name: string, dflt: number) => {
    const i = args.indexOf(name);
    return i >= 0 && args[i + 1] ? Number(args[i + 1]) : dflt;
  };
  const minutes = argN("--minutes", 8.5);
  const workers = argN("--workers", 3);
  const limit = argN("--limit", 100_000);
  const langArg = args.includes("--lang") ? args[args.indexOf("--lang") + 1] : null;
  const onlyReport = args.includes("--report");
  const langs = langArg ? [langArg] : ["it", "en", "pt", "fr", "de"];
  const deadline = Date.now() + minutes * 60_000;

  for (const lang of langs) {
    state[lang] = loadState(lang);
    poolLemmas[lang] = new Set();
    poolEntries[lang] = [];
    loadPool(lang);
    existing[lang] = new Set();
    for (const list of langLists(lang)) for (const w of list) existing[lang].add(normKey(w.it));
    queues[lang] = [];
  }
  if (onlyReport) { report(); return; }

  let batches = 0;
  const rrLangs = [...langs];
  let rr = 0;

  const globalTargets: Record<string, Record<Level, number>> = {};
  for (const lang of langs) globalTargets[lang] = bandTargets(currentCounts(lang));

  async function worker(id: number) {
    while (Date.now() < deadline && batches < limit) {
      let lang: string | null = null;
      for (let i = 0; i < rrLangs.length; i++) {
        const cand = rrLangs[(rr + i) % rrLangs.length];
        if (state[cand].done) continue;
        const cur = currentCounts(cand);
        const tot = LEVELS.reduce((a, l) => a + cur[l], 0);
        if (tot >= TOTAL_TARGET) { state[cand].done = true; saveState(cand); continue; }
        lang = cand;
        rr = (rr + i + 1) % rrLangs.length;
        break;
      }
      if (!lang) break;
      const cur = currentCounts(lang);
      const lvl = pickLevel(lang, globalTargets[lang], cur);
      if (!lvl) { state[lang].done = true; saveState(lang); continue; }
      const topic = nextTopic(lang, BAND_OF[lvl]);
      const prompt = buildPrompt(lang, topic, lvl, BATCH[lvl]);
      try {
        const raw = await chatRetry(lang, prompt);
        const v = validate(lang, raw);
        if (v.accepted.length) {
          appendFileSync(`${POOL_DIR}/${lang}.txt`, v.accepted.join("\n") + "\n");
          for (const a of v.accepted) {
            const f = a.split("|");
            poolLemmas[lang].add(normKey(f[0]));
            poolEntries[lang].push({ w: f[0], level: f[5] as Level });
            state[lang].byLevel[f[5]] = (state[lang].byLevel[f[5]] ?? 0) + 1;
          }
        }
        state[lang].calls++;
        saveState(lang);
        batches++;
        const tot = LEVELS.reduce((a, l) => a + currentCounts(lang)[l], 0);
        log(`#${id} [${lang}] ${lvl}/${topic.cat} «${topic.t.slice(0, 34)}» +${v.accepted.length} netas (${v.dupes} dup, ${v.invalid} inv) · ${tot}/${TOTAL_TARGET}`);
        if (v.invalid > 30 && Object.keys(v.reasons).length) log(`   motivos: ${JSON.stringify(v.reasons)}`);
      } catch (e) {
        log(`#${id} [${lang}] ERROR FATAL lote: ${String((e as Error).message).slice(0, 100)}`);
        state[lang].errors++;
        saveState(lang);
        await sleep(10_000);
      }
      await sleep(1200);
    }
  }

  log(`arranque: ${workers} workers · ${minutes} min · langs ${langs.join(",")}`);
  await Promise.all(Array.from({ length: workers }, (_, i) => worker(i + 1)));
  report();
  const poolTotals = langs.map((l) => `${l}:${(poolEntries[l] ?? []).length}`).join(" ");
  log(`FIN · lotes ${batches} · pool acumulado: ${poolTotals}`);
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
