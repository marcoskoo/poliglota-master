import type { VocabWord, LangCode } from "../types";
import { VOCAB_BY_ID } from "../vocabulary";
import { DICTIONARY } from "./dictionary";
import { getENDict } from "./lang-en";
import { getPTDict } from "./lang-pt";
import { getFRDict } from "./lang-fr";
import { getDEDict } from "./lang-de";

/* ═══ v9.21→v9.24 · Despacho central del diccionario por lengua ═════
   Una sola fuente para las vistas (dizionario, home, quadro, ricerca):
   elimina los ternarios activeLang === "en" repartidos por los
   componentes. it → DICTIONARY/VOCAB_BY_ID (histórico); en → EN_DICT;
   pt → PT_DICT; fr → FR_DICT (v9.23); de → DE_DICT (v9.24).
   v9.43 · CEFR 16.000: listas e índices por id se materializan con
   caché perezosa — parsear 80.000 entradas en el arranque mataría
   los móviles; cada lengua se parsea al usarse por primera vez.   */

const LISTS: Partial<Record<LangCode, VocabWord[]>> = {};

/** Lista base del diccionario de la lengua activa. */
export function dictListFor(lang: LangCode): VocabWord[] {
  const cached = LISTS[lang];
  if (cached) return cached;
  const list: VocabWord[] =
    lang === "en" ? getENDict()
    : lang === "pt" ? getPTDict()
    : lang === "fr" ? getFRDict()
    : lang === "de" ? getDEDict()
    : DICTIONARY;
  LISTS[lang] = list;
  return list;
}

/** Número de entradas del diccionario activo. */
export function dictCountFor(lang: LangCode): number {
  return dictListFor(lang).length;
}

const BY_ID: Partial<Record<LangCode, Record<string, VocabWord>>> = {};

/** Índice por id del diccionario activo. */
export function dictByIdFor(lang: LangCode): Record<string, VocabWord> {
  const cached = BY_ID[lang];
  if (cached) return cached;
  const map: Record<string, VocabWord> =
    lang === "it" ? VOCAB_BY_ID
    : Object.fromEntries(dictListFor(lang).map((w) => [w.id, w]));
  BY_ID[lang] = map;
  return map;
}
