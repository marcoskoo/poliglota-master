/* ── Importatore · lógica (v6.0) ────────────────────────────────────
   Convierte cualquier texto italiano (pegado o importado de una URL)
   en una lección interactiva: cada palabra clicable → entrada del
   diccionario → añadir al repaso SRS. Sin APIs de pago. */

import { VOCAB } from "./vocabulary";
import type { CefrLevel, LangCode, VocabWord, WordType } from "./types";
import { CEFR_LEVELS } from "./types";
import { lookupWordEn } from "./dict/lookup-en";
import { lookupWordPt } from "./dict/lookup-pt";
import { getENDict } from "./dict/lang-en";
import { getPTDict } from "./dict/lang-pt";

export const TOTAL_LEMMAS = VOCAB.length;

/* v9.19 · lemas totales de la lengua activa (importador + HUD de cobertura) */
export function totalLemmasFor(lang: LangCode): number {
  if (lang === "en") return getENDict().length;
  if (lang === "pt") return getPTDict().length;
  return TOTAL_LEMMAS;
}

/* v9.19 · lookup por lengua: en usa el lematizador americano (contracciones,
   irregulares, -ing/-ed); pt el portugués europeo (clíticos, conjugaciones,
   plurales); el resto conserva el histórico italiano. */
export function hitFor(lang: LangCode, token: string): DictHit | null {
  if (lang === "en") {
    const w = lookupWordEn(token);
    return w ? { word: w } : null;
  }
  if (lang === "pt") {
    const w = lookupWordPt(token);
    return w ? { word: w } : null;
  }
  return lookupWord(token);
}

export interface DictHit {
  word: VocabWord;
  inflected?: string;   // aviso: la palabra en el texto estaba flexionada
}

/* Normalización de lema (misma política que dict/dictionary.ts) */
export function normLemma(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(l'|un'|il|lo|la|i|gli|le|un|uno|una)\s*/i, "")
    .replace(/['’]/g, "")
    .trim();
}

const normType = (s: string): string =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/['’\s]/g, "");

let INDEX: Map<string, VocabWord> | null = null;

/** Índice lema-normalizado → VocabWord (se construye una sola vez) */
function getIndex(): Map<string, VocabWord> {
  if (INDEX) return INDEX;
  INDEX = new Map();
  for (const w of VOCAB) {
    const k = normLemma(w.it);
    if (!INDEX.has(k)) INDEX.set(k, w); // el primero gana (packs más básicos primero)
  }
  return INDEX;
}

/** Busca una palabra del texto en el diccionario, con heurísticas
    de flexión (plurales y apócopes frecuentes). */
export function lookupWord(token: string): DictHit | null {
  const idx = getIndex();
  const direct = normLemma(token);
  const hit = idx.get(direct);
  if (hit) return { word: hit };
  // heurísticas de plural/singular italianos
  const tries: [string, string][] = [];
  if (direct.endsWith("i")) { tries.push([direct.slice(0, -1) + "o", "plural masc."], [direct.slice(0, -1) + "e", "plural"]); }
  if (direct.endsWith("e")) { tries.push([direct.slice(0, -1) + "a", "plural fem."], [direct.slice(0, -1) + "o", "variante"]); }
  if (direct.endsWith("a")) tries.push([direct.slice(0, -1) + "o", "femenino/masculino"]);
  if (direct.endsWith("o")) tries.push([direct.slice(0, -1) + "a", "masculino/femenino"]);
  for (const [cand, why] of tries) {
    const h = idx.get(cand);
    if (h) return { word: h, inflected: why };
  }
  return null;
}

/* ── Tokenización ─────────────────────────────────────────────────── */

export interface Token { raw: string; isWord: boolean; }

/** Separa el texto en palabras (con apóstrofos) y no-palabras */
export function tokenize(text: string): Token[] {
  return text
    .split(/([\p{L}\p{M}]+)/u)
    .filter((s) => s.length > 0)
    .map((raw) => ({ raw, isWord: raw.length > 1 && /[\p{L}]/u.test(raw) }));
}

export interface TextStats {
  totalWords: number;      // palabras del texto
  uniqueWords: number;     // lemas únicos (normalizados)
  found: number;           // únicos encontrados en el diccionario
  known: number;           // únicos ya en el SRS del usuario
  coverage: number;        // % de palabras del texto cubiertas por el diccionario
}

export function analyze(text: string, srs: Record<string, unknown>, lang: LangCode = "it"): TextStats {
  const tokens = tokenize(text).filter((t) => t.isWord);
  const seen = new Set<string>();
  const uniqueIds = new Map<string, string>(); // norm → wordId (si está en dict)
  let found = 0, known = 0;
  for (const t of tokens) {
    const n = normLemma(t.raw);
    if (seen.has(n)) continue;
    seen.add(n);
    const hit = hitFor(lang, t.raw);
    if (hit) {
      found++;
      uniqueIds.set(n, hit.word.id);
      if (hit.word.id in srs) known++;
    }
  }
  return {
    totalWords: tokens.length,
    uniqueWords: seen.size,
    found,
    known,
    coverage: tokens.length ? Math.round((found / seen.size) * 100) : 0,
  };
}

/** Palabras nuevas recomendadas: en el texto + en diccionario + no en SRS,
    ordenadas por frecuencia del italiano (banda 1 primero) y nivel. */
export function recommendWords(text: string, srs: Record<string, unknown>, maxLevel: CefrLevel, limit = 12, lang: LangCode = "it"): VocabWord[] {
  const levelCap = CEFR_LEVELS.indexOf(maxLevel);
  const out: VocabWord[] = [];
  const seen = new Set<string>();
  for (const t of tokenize(text)) {
    if (!t.isWord) continue;
    const n = normLemma(t.raw);
    if (seen.has(n)) continue;
    seen.add(n);
    const hit = hitFor(lang, t.raw);
    if (hit && !(hit.word.id in srs) && CEFR_LEVELS.indexOf(hit.word.level) <= levelCap) {
      out.push(hit.word);
      if (out.length >= limit * 3) break; // pool antes de ordenar
    }
  }
  return out
    .sort((a, b) => (a.freq ?? 3) - (b.freq ?? 3))
    .slice(0, limit);
}

/** Todas las palabras del texto que están en el diccionario y no en el SRS */
export function allNewWords(text: string, srs: Record<string, unknown>, lang: LangCode = "it"): VocabWord[] {
  const out: VocabWord[] = [];
  const seen = new Set<string>();
  for (const t of tokenize(text)) {
    if (!t.isWord) continue;
    const n = normLemma(t.raw);
    if (seen.has(n)) continue;
    seen.add(n);
    const hit = hitFor(lang, t.raw);
    if (hit && !(hit.word.id in srs)) out.push(hit.word);
  }
  return out;
}

export const TYPE_LABELS: Record<WordType, string> = {
  sostantivo: "sustantivo", verbo: "verbo", aggettivo: "adjetivo", avverbio: "adverbio",
  espressione: "expresión", pronome: "pronombre", preposizione: "preposición",
  congiunzione: "conjunción", articolo: "artículo", numerale: "numeral",
  interiezione: "interjección", locuzione: "locución",
};
