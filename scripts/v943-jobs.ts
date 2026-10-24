/* ═══ v9.43 · Generador de JOBS para subagentes lexicógrafos ═════════
   Parte del déficit vivo (repo + pools ya generados) y escribe un
   archivo de instrucciones autocontenido por job en
   scripts/v943-pool/jobs/<id>.md. Cada subagent produce ~900 entradas
   en archivos part (≤330 entradas por Write). Formato idéntico al
   pool del generador SDK → el builder los fusiona y deduplica.

   Uso: bun scripts/v943-jobs.ts [--count 950]                      */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
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
import { TOPICS } from "./v943-topics";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = (typeof LEVELS)[number];
const TOTAL_TARGET = 16_000;
const SHAPE: Record<Level, number> = { A1: 560, A2: 560, B1: 2080, B2: 3200, C1: 4800, C2: 4800 };
const CUM: Record<Level, number> = { A1: 500, A2: 1000, B1: 2000, B2: 4000, C1: 8000, C2: 16000 };
const BAND_OF: Record<Level, "easy" | "mid" | "hard"> = { A1: "easy", A2: "easy", B1: "mid", B2: "mid", C1: "hard", C2: "hard" };
const LANG_NAME: Record<string, string> = {
  it: "italiano", en: "inglés americano", pt: "portugués de Portugal",
  fr: "francés de Francia", de: "alemán estándar (Hochdeutsch)",
};
const LANG_EXAMPLE: Record<string, string> = {
  it: "scaffale|estantería||S|cas|B2", en: "bookshelf|estantería||S|cas|B2",
  pt: "prateleira|estante||S|cas|B2", fr: "étagère|estantería||S|cas|B2",
  de: "das Regal|estantería||S|cas|B2",
};

const POOL = "/home/z/my-project/scripts/v943-pool";
const JOBS = `${POOL}/jobs`;
mkdirSync(JOBS, { recursive: true });

function lists(lang: string): { it: string; level: string }[][] {
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

/** conteo dedup por lema: repo + pool SDK + pool subagentes */
function current(lang: string): { counts: Record<Level, number>; lemmas: Map<string, { w: string; level: string }> } {
  const seen = new Map<string, { w: string; level: string }>();
  const counts: Record<Level, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  for (const list of lists(lang)) for (const w of list) {
    const k = normKey(w.it);
    if (!k || seen.has(k)) continue;
    seen.set(k, { w: w.it, level: w.level ?? "" });
    if ((w.level ?? "") in counts) counts[w.level as Level]++;
  }
  const files = [`${POOL}/${lang}.txt`, ...subFiles(lang)];
  for (const f of files) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const f6 = t.split("|");
      if (f6.length < 6) continue;
      const k = normKey(f6[0]);
      if (!k || seen.has(k)) continue;
      seen.set(k, { w: f6[0], level: f6[5] });
      if (LEVELS.includes(f6[5] as Level)) counts[f6[5] as Level]++;
    }
  }
  return { counts, lemmas: seen };
}
function subFiles(lang: string): string[] {
  const dir = `${POOL}/sub`;
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.startsWith(`${lang}-`) && f.endsWith(".txt")).map((f) => `${dir}/${f}`);
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

const TYPE_DOC = `S=sustantivo V=verbo A=adjetivo D=adverbio E=expresión L=locución P=pronombre R=preposición C=conjunción I=interjección`;
const CAT_DOC = `sal(saludos) fam(familia) cas(casa) ali(alimentación) cmp(compras) tra(transporte) vig(viajes) htl(hotel) sla(salud) lav(trabajo) stu(estudios) cit(ciudad) cli(clima) rop(ropa) tec(tecnología) spt(deporte) mus(música) cin(cine) rel(relaciones) fin(finanzas) ris(restaurante) pro(profesiones) att(actualidad) sci(ciencia) let(literatura) col(colores) cor(cuerpo) ani(animales) nat(naturaleza) tmp(tiempo) sve(ocio) emo(emociones) cmu(comunicación) ist(instituciones) cnn(conectores) ast(abstracto) art(arte)`;

function sampleLemmas(lemmas: Map<string, { w: string; level: string }>, band: "easy" | "mid" | "hard", n: number): string[] {
  const bandLevels = new Set(band === "easy" ? ["A1", "A2"] : band === "mid" ? ["B1", "B2"] : ["C1", "C2"]);
  const inBand: string[] = [];
  const rest: string[] = [];
  for (const { w, level } of lemmas.values()) (bandLevels.has(level) ? inBand : rest).push(w);
  const shuffle = <T,>(a: T[]): T[] => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  shuffle(inBand);
  shuffle(rest);
  // banda easy: el espacio está saturado → exclusión amplia (hasta 420)
  const cap = band === "easy" ? Math.max(n * 3, 420) : n;
  return [...inBand.slice(0, cap), ...rest.slice(0, Math.max(0, n - Math.min(inBand.length, cap)))];
}

interface Job {
  id: string; lang: string; langName: string; level: Level; count: number;
  topics: string[]; excl: string[];
}

/* ── registro de jobs emitidos (evita dobles coberturas) ──────────── */
interface RegEntry { id: string; lang: string; level: Level; count: number }
const REG_FILE = `${JOBS}/jobs.json`;
function loadReg(): RegEntry[] {
  if (existsSync(REG_FILE)) {
    try { return JSON.parse(readFileSync(REG_FILE, "utf8")); } catch { /* regenera */ }
  }
  /* siembra desde los .md existentes (formato v943-jobs original) */
  const seeded: RegEntry[] = [];
  for (const f of existsSync(JOBS) ? readdirSync(JOBS).filter((x) => x.endsWith(".md")).sort() : []) {
    const id = f.replace(/\.md$/, "");
    const m = id.match(/^([a-z]{2})-([a-z0-9]+)-\d+$/);
    if (!m) continue;
    const lvl = m[2].toUpperCase() as Level;
    if (!(LEVELS as readonly string[]).includes(lvl)) continue;
    const md = readFileSync(`${JOBS}/${f}`, "utf8");
    const n = Number(md.match(/^(\d+) palabras de/m)?.[1] ?? 0);
    if (n > 0) seeded.push({ id, lang: m[1], level: lvl, count: n });
  }
  return seeded;
}
function saveReg(r: RegEntry[]) {
  writeFileSync(REG_FILE, JSON.stringify(r, null, 1));
}
/** un job está ejecutado si ya existen sus archivos part */
function jobDone(id: string): boolean {
  const dir = `${POOL}/sub`;
  if (!existsSync(dir)) return false;
  return readdirSync(dir).some((f) => f.startsWith(`${id}-p`) && f.endsWith(".txt"));
}
/** id ocupado si existe su .md O sus part (evita sobrescribir pools tras rollbacks) */
function idTaken(id: string): boolean {
  if (existsSync(`${JOBS}/${id}.md`)) return true;
  return jobDone(id);
}

function jobMarkdown(j: Job): string {
  const excl = j.excl.length
    ? `\nPALABRAS QUE YA EXISTEN (NO las repitas; si das una variante distinta de la MISMA familia, máximo 2 por familia):\n${j.excl.join(", ")}\n`
    : "\n(No hay lista de exclusión: este nivel está casi vacío.)\n";
  const parts = Math.ceil(j.count / 330);
  const perPart = Math.ceil(j.count / parts);
  return `# Job lexicográfico ${j.id} · ${j.langName.toUpperCase()} nivel ${j.level}

Eres lexicógrafo profesional. Generas entradas para un diccionario didáctico ${j.langName.toUpperCase()}→ESPAÑOL para hispanohablantes.

## Objetivo
${j.count} palabras de ${j.langName} REALES del nivel ${j.level} del MCER, repartidas entre estos subtemas:
${j.topics.map((t) => `- ${t}`).join("\n")}

## Archivos de salida (herramienta Write, uno por llamada)
${Array.from({ length: parts }, (_, i) => `- /home/z/my-project/scripts/v943-pool/sub/${j.id}-p${i + 1}.txt  (~${perPart} entradas)`).join("\n")}
Cada archivo: SOLO líneas de datos, sin cabecera, sin comentarios, sin líneas vacías.

## Formato EXACTO por línea (6 campos separados por la barra vertical |, sin espacios alrededor de las barras)
palabra|traducción al español||CÓDIGO_TIPO|CÓDIGO_CATEGORÍA|${j.level}
Ejemplo real del formato: ${LANG_EXAMPLE[j.lang]}
- Campo 3 (fonética): SIEMPRE vacío → dos barras seguidas.
- Última columna: SIEMPRE ${j.level}.

## Códigos
- CÓDIGO_TIPO → ${TYPE_DOC}
- CÓDIGO_CATEGORÍA → ${CAT_DOC}

## Reglas de calidad (críticas)
1. SOLO palabras reales y verificables de ${j.langName}. Nada de invenciones, marcas, siglas, nombres propios ni topónimos.
2. Nivel ${j.level} ESTRICTO: ${j.level.startsWith("A") ? "vocabulario básico, concreto y frecuente" : j.level === "B1" || j.level === "B2" ? "vocabulario estándar pero específico del subtema, útil para describir y opinar; palabras triviales de nivel A NO valen" : "vocabulario avanzado, preciso, culto o especializado; las palabras de nivel B o inferior NO valen"}.
3. Traducción al español de España natural y específica del sentido de la palabra en su subtema (puede incluir aclaración breve entre paréntesis si hay ambigüedad).
4. Sin repetir la misma palabra ni su plural/infinitivo; variantes de una misma raíz: máximo 2 por familia (p. ej. «analizzare» y «analisi» sí; «analizzabile», «analizzato», «analizzatore» no).
5. Género y artículos: ${j.lang === "de" ? "los sustantivos alemanes SIEMPRE con artículo (der/die/das), p. ej. «der Regen»" : "sin artículo salvo que la palabra lo exija (p. ej. locuciones)"}.
6. Multiword: locuciones y expresiones válidas (máx. 4 palabras), tipo E o L.
7. Sin caracteres raros: solo letras del idioma, espacios, guion y apóstrofe.
8. Reparte las ~${j.count} entradas de forma aproximadamente uniforme entre los subtemas de la lista.
${excl}
## Verificación final (obligatoria, con Bash)
\`\`\`bash
cd /home/z/my-project/scripts/v943-pool/sub && wc -l ${j.id}-p*.txt && awk -F'|' 'NF!=6 {print FILENAME": "NR": "$0}' ${j.id}-p*.txt | head -5
\`\`\`
El awk NO debe imprimir nada (todas las líneas con 6 campos). Si imprime algo, corrígelo.

## Reporte final
Devuelve SOLO este resumen: job, archivos creados, entradas totales, si la verificación awk pasó.`;
}

function main() {
  const args = process.argv.slice(2);
  const perJob = args.includes("--count") ? Number(args[args.indexOf("--count") + 1]) : 950;

  const reg = loadReg().filter((e) => jobDone(e.id) ? false : existsSync(`${JOBS}/${e.id}.md`));
  const jobs: Job[] = [];
  for (const lang of ["it", "en", "pt", "fr", "de"]) {
    const { counts, lemmas } = current(lang);
    const tgt = bandTargets(counts);
    // déficit por nivel MENOS lo ya asignado a jobs pendientes
    const pending: Record<string, number> = {};
    for (const e of reg) if (e.lang === lang) pending[e.level] = (pending[e.level] ?? 0) + e.count;
    const deficit: [Level, number][] = [];
    for (const lv of LEVELS) {
      const d = tgt[lv] - counts[lv] - (pending[lv] ?? 0);
      if (d > 0) deficit.push([lv, Math.ceil(d * 1.12)]);
    }
    // agrupar A1+A2 en un solo paquete de nivel mixto si ambos tienen déficit
    const groups: { levels: Level[]; need: number }[] = [];
    const a1 = deficit.find(([l]) => l === "A1");
    const a2 = deficit.find(([l]) => l === "A2");
    if (a1 && a2) groups.push({ levels: ["A1", "A2"], need: a1[1] + a2[1] });
    else {
      if (a1) groups.push({ levels: ["A1"], need: a1[1] });
      if (a2) groups.push({ levels: ["A2"], need: a2[1] });
    }
    for (const [lv, n] of deficit) if (lv !== "A1" && lv !== "A2") groups.push({ levels: [lv], need: n });

    // numeración monotónica por lengua a partir del registro
    let jobN = reg.filter((e) => e.lang === lang).reduce((a, e) => {
      const m = e.id.match(/-(\d+)$/);
      return Math.max(a, m ? Number(m[1]) : 0);
    }, 0);
    for (const g of groups) {
      const nJobs = Math.max(1, Math.round(g.need / perJob));
      const per = Math.ceil(g.need / nJobs);
      const band = BAND_OF[g.levels[0]];
      const topics = TOPICS.filter((t) => t.band === band).map((t) => t.t);
      for (let i = 0; i < nJobs; i++) {
        const lvl2 = g.levels.length > 1 ? (i % 2 === 0 ? g.levels[0] : g.levels[1]) : g.levels[0];
        let id = "";
        do {
          jobN++;
          id = `${lang}-${lvl2.toLowerCase()}-${String(jobN).padStart(2, "0")}`;
        } while (idTaken(id));
        const tPer = Math.max(4, Math.floor(topics.length / nJobs));
        const start = (i * tPer) % topics.length;
        const slice = Array.from({ length: Math.min(tPer, topics.length) }, (_, k) => topics[(start + k) % topics.length]);
        jobs.push({
          id,
          lang, langName: LANG_NAME[lang], level: lvl2, count: per,
          topics: slice, excl: sampleLemmas(lemmas, band, 110),
        });
      }
    }
  }

  let written = 0;
  const out: Job[] = [];
  for (const j of jobs) {
    const f = `${JOBS}/${j.id}.md`;
    if (existsSync(f)) continue;
    writeFileSync(f, jobMarkdown(j));
    reg.push({ id: j.id, lang: j.lang, level: j.level, count: j.count });
    written++;
    out.push(j);
  }
  saveReg(reg);
  const totalEntries = jobs.reduce((a, j) => a + j.count, 0);
  console.log(`jobs nuevos: ${written} · entradas objetivo: ${totalEntries} · pendientes registrados: ${reg.length}`);
  for (const j of out) console.log(`  ${j.id.padEnd(10)} ${j.level} ×${j.count}  (${j.topics.length} subtemas)`);
}

main();
