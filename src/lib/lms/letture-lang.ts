/* ── v9.45 · Despacho multilingüe de la biblioteca clásica ──────────
   lettureFor(lang) devuelve la biblioteca de lecturas clásicas de la
   lengua de estudio: it → LETTURE (histórico, 58), en → EN_LETTURE,
   pt → PT_LETTURE, fr → FR_LETTURE, de → DE_LETTURE (24 cada una,
   A1→C2). Caché perezosa por lengua; lettureCatsFor localiza las
   etiquetas de categoría (la clave "storia-italia" es histórica del
   italiano: en las demás lenguas significa «historia del país/área
   de la lengua»).                                                    */

import type { LangCode } from "./types";
import { LETTURE, LETTURE_CATS, type Lettura, type LetturaCat } from "./letture";
import { EN_LETTURE } from "./lang/en/letture";
import { PT_LETTURE } from "./lang/pt/letture";
import { FR_LETTURE } from "./lang/fr/letture";
import { DE_LETTURE } from "./lang/de/letture";

const LISTS: Partial<Record<LangCode, Lettura[]>> = {};

/** Biblioteca clásica de la lengua activa (caché perezosa). */
export function lettureFor(lang: LangCode): Lettura[] {
  const cached = LISTS[lang];
  if (cached) return cached;
  const list: Lettura[] =
    lang === "en" ? EN_LETTURE
    : lang === "pt" ? PT_LETTURE
    : lang === "fr" ? FR_LETTURE
    : lang === "de" ? DE_LETTURE
    : LETTURE;
  LISTS[lang] = list;
  return list;
}

const BY_ID: Partial<Record<LangCode, Record<string, Lettura>>> = {};

/** Índice por id de la biblioteca de la lengua activa. */
export function lettureByIdFor(lang: LangCode): Record<string, Lettura> {
  const cached = BY_ID[lang];
  if (cached) return cached;
  const map: Record<string, Lettura> = Object.fromEntries(lettureFor(lang).map((t) => [t.id, t]));
  BY_ID[lang] = map;
  return map;
}

export type LetturaCatInfo = { label: string; emoji: string; desc: string };

/** Etiquetas de categoría localizadas por lengua de estudio. */
export const LETTURE_CATS_LANG: Record<LangCode, Record<LetturaCat, LetturaCatInfo>> = {
  it: LETTURE_CATS,
  en: {
    dialoghi: { label: "Dialogues", emoji: "💬", desc: "Real-life conversations with audio" },
    informazione: { label: "Information", emoji: "📰", desc: "Current topics with ideas to discuss" },
    "storia-italia": { label: "US history", emoji: "🏛️", desc: "From the Statue of Liberty to the space race" },
    "storia-mondo": { label: "World history", emoji: "🌍", desc: "Great stories from around the planet" },
    cultura: { label: "American culture", emoji: "🎨", desc: "Jazz, parks, Hollywood and the national pastime" },
  },
  pt: {
    dialoghi: { label: "Diálogos", emoji: "💬", desc: "Conversas da vida real com áudio" },
    informazione: { label: "Informação", emoji: "📰", desc: "Textos atuais com ideias para debater" },
    "storia-italia": { label: "História de Portugal", emoji: "🏛️", desc: "Dos Descobrimentos à independência do Brasil" },
    "storia-mondo": { label: "História do mundo", emoji: "🌍", desc: "Grandes histórias de todo o planeta" },
    cultura: { label: "Cultura portuguesa", emoji: "🎨", desc: "Fado, pastéis, azulejos e Pessoa" },
  },
  fr: {
    dialoghi: { label: "Dialogues", emoji: "💬", desc: "Conversations de la vie réelle avec audio" },
    informazione: { label: "Information", emoji: "📰", desc: "Textes d'actualité avec idées à débattre" },
    "storia-italia": { label: "Histoire de France", emoji: "🏛️", desc: "De Jeanne d'Arc à Versailles" },
    "storia-mondo": { label: "Histoire du monde", emoji: "🌍", desc: "Grandes histoires de la planète" },
    cultura: { label: "Culture française", emoji: "🎨", desc: "Cinéma, gastronomie et haute couture" },
  },
  de: {
    dialoghi: { label: "Dialoge", emoji: "💬", desc: "Gespräche aus dem Alltag mit Audio" },
    informazione: { label: "Sachtexte", emoji: "📰", desc: "Aktuelle Themen mit Diskussionsideen" },
    "storia-italia": { label: "Deutsche Geschichte", emoji: "🏛️", desc: "Vom Brandenburger Tor zum Mauerfall" },
    "storia-mondo": { label: "Weltgeschichte", emoji: "🌍", desc: "Große Geschichten vom ganzen Planeten" },
    cultura: { label: "Deutsche Kultur", emoji: "🎨", desc: "Brot, Musik, Bauhaus und Goethe" },
  },
};

export function lettureCatsFor(lang: LangCode): Record<LetturaCat, LetturaCatInfo> {
  return LETTURE_CATS_LANG[lang] ?? LETTURE_CATS;
}
