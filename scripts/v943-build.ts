/* v9.43 builder: pools → lang-XX-v943-<n>.ts + hub. Idempotente. [--dry] */
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from "fs";
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

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = (typeof LEVELS)[number];
const TOTAL = 16_000;
const SHAPE: Record<Level, number> = { A1: 560, A2: 560, B1: 2080, B2: 3200, C1: 4800, C2: 4800 };
const CUM: Record<Level, number> = { A1: 500, A2: 1000, B1: 2000, B2: 4000, C1: 8000, C2: 16000 };
const POOL = "/home/z/my-project/scripts/v943-pool";
const SRC = "/home/z/my-project/src/lib/lms/dict";
const BLOCK = 700;
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

function harvest(lang: string) {
  const repoSeen = new Set<string>();
  const repo: Record<Level, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  for (const list of lists(lang)) for (const w of list) {
    const k = normKey(w.it);
    if (!k || repoSeen.has(k)) continue;
    repoSeen.add(k);
    if ((w.level ?? "") in repo) repo[w.level as Level]++;
  }
  const poolSeen = new Set<string>();
  const lines: string[] = [];
  const byLevel: Record<Level, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  let dropped = 0;
  const files: string[] = [];
  const sdk = `${POOL}/${lang}.txt`;
  if (existsSync(sdk)) files.push(sdk);
  const dir = `${POOL}/sub`;
  if (existsSync(dir)) files.push(...readdirSync(dir).filter((f) => f.startsWith(`${lang}-`) && f.endsWith(".txt")).sort().map((f) => `${dir}/${f}`));
  for (const f of files) {
    for (const raw of readFileSync(f, "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const fd = line.split("|");
      if (fd.length < 6 || fd.length > 7) { dropped++; continue; }
      const [word, es, , t, cat, lvlRaw] = fd;
      const lvl = (lvlRaw ?? "").trim().toUpperCase();
      if (!word || !es || !TYPES.has(t) || !CATS.has(cat) || !(LEVELS as readonly string[]).includes(lvl)) { dropped++; continue; }
      if (!WORD_RE[lang].test(word) || !ES_RE.test(es) || /[`$]/.test(line)) { dropped++; continue; }
      const k = normKey(word);
      if (!k || repoSeen.has(k) || poolSeen.has(k)) { dropped++; continue; }
      poolSeen.add(k);
      lines.push(line);
      byLevel[lvl as Level]++;
    }
  }
  return { lines, byLevel, repo, dropped };
}

/* v2 FIX CUMULATIVO: extrae las líneas RAW de los bloques hub existentes.
   El hub anterior YA está fusionado en el repo (los consumers lo importan),
   por lo que el nuevo build debe REGRABAR esas líneas + las nuevas del pool.
   Sin esto, cada rebuild perdería el contenido de hubs anteriores. */
function hubLines(lang: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`^lang-${lang}-v943-(\\d+)\\.ts$`);
  const files = existsSync(SRC)
    ? readdirSync(SRC).filter((f) => re.test(f)).sort((a, b) => Number(a.match(re)![1]) - Number(b.match(re)![1]))
    : [];
  for (const f of files) {
    const m = readFileSync(`${SRC}/${f}`, "utf8").match(/= `\n([\s\S]*?)\n`;/);
    if (!m) continue;
    for (const raw of m[1].split("\n")) {
      const t = raw.trim();
      if (t && !t.startsWith("#")) out.push(t);
    }
  }
  return out;
}

function bandTargets(cur: Record<Level, number>): Record<Level, number> {
  const t: Record<Level, number> = { ...cur };
  for (const lv of LEVELS) t[lv] = Math.max(t[lv], SHAPE[lv]);
  for (const lv of LEVELS) {
    const prev = LEVELS.slice(0, LEVELS.indexOf(lv)).reduce((a, l) => a + t[l], 0);
    t[lv] = Math.max(t[lv], CUM[lv] - prev);
  }
  const sum = LEVELS.reduce((a, l) => a + t[l], 0);
  if (sum < TOTAL) t.C2 += TOTAL - sum;
  return t;
}

function main() {
  const dry = process.argv.includes("--dry");
  let shortfall = 0;
  for (const lang of ["it", "en", "pt", "fr", "de"]) {
    const { lines, byLevel, repo, dropped } = harvest(lang);
    const totals: Record<Level, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const lv of LEVELS) totals[lv] = repo[lv] + byLevel[lv];
    const tgt = bandTargets(totals);
    const tot = LEVELS.reduce((a, l) => a + totals[l], 0);
    const short = LEVELS.filter((l) => totals[l] < tgt[l]);
    if (tot < TOTAL || short.length) shortfall++;
    console.log(`${lang.toUpperCase()}: repo ${LEVELS.reduce((a, l) => a + repo[l], 0)} + pool ${lines.length} (desc ${dropped}) = ${tot}/16000 · ${LEVELS.map((l) => `${l}:${totals[l]}/${tgt[l]}`).join(" ")}${short.length ? ` · FALTA ${short.join(",")}` : " ✔"}`);
    if (dry || !lines.length) continue;
    /* v2: bloques CUMULATIVOS = hub anterior (revalidado) + pool neto nuevo */
    const hub = hubLines(lang);
    const hubOk = hub.filter((line) => {
      const fd = line.split("|");
      if (fd.length < 6 || fd.length > 7) return false;
      const [word, es, , t, cat, lvlRaw] = fd;
      const lvl = (lvlRaw ?? "").trim().toUpperCase();
      return !!(word && es && TYPES.has(t) && CATS.has(cat) && (LEVELS as readonly string[]).includes(lvl) && WORD_RE[lang].test(word) && ES_RE.test(es) && !/[`$]/.test(line));
    });
    const hubDropped = hub.length - hubOk.length;
    const all = [...hubOk, ...lines];
    const blocks: string[][] = [];
    for (let i = 0; i < all.length; i += BLOCK) blocks.push(all.slice(i, i + BLOCK));
    if (hubDropped) console.log(`  · hub previo: ${hubOk.length} líneas regrabadas (${hubDropped} descartadas por formato)`);
    else console.log(`  · hub previo: ${hubOk.length} líneas regrabadas`);
    blocks.forEach((b, i) => {
      const U = lang.toUpperCase();
      writeFileSync(`${SRC}/lang-${lang}-v943-${i + 1}.ts`, `/* v9.43 · ${U} bloque ${i + 1}/${blocks.length} · ${b.length} entradas */\nexport const ${U}_V943_${i + 1}_RAW = \`\n${b.join("\n")}\n\`;\n`);
    });
    for (const f of readdirSync(SRC)) {
      const m = f.match(new RegExp(`^lang-${lang}-v943-(\\d+)\\.ts$`));
      if (m && Number(m[1]) > blocks.length) rmSync(`${SRC}/${f}`);
    }
    const U = lang.toUpperCase();
    const imports = blocks.map((_, i) => `import { ${U}_V943_${i + 1}_RAW } from "./lang-${lang}-v943-${i + 1}";`).join("\n");
    const arr = blocks.map((_, i) => `${U}_V943_${i + 1}_RAW`).join(", ");
    writeFileSync(`${SRC}/lang-${lang}-v943.ts`, `import { parseMega } from "./mega-parse";\nimport type { VocabWord } from "../types";\n${imports}\n\n/* v9.43 · ${U} MEGA 16.000 · bloques generados (ids ${lang}943-m<lvl>-<slug>) */\nexport const ${U}_V943: VocabWord[] = parseMega([${arr}].join("\\n"), "${lang}943");\n`);
    console.log(`  → ${lang}: ${blocks.length} bloques`);
  }
  if (dry) console.log("(dry)");
  process.exit(shortfall ? 1 : 0);
}
main();
