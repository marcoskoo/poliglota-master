"use client";

/* ── TTS manager (speechSynthesis) · multi-idioma v9.17 ─────────────
   v9.1 multi-voz: reparto de voces por personaje en diálogos.
   v9.17: pools de voces por lengua de estudio (it-IT, en-US, pt-PT,
   fr-FR, de-DE) con heurísticas de género por idioma.
   · Pool de TODAS las voces del locale disponibles (intercaladas por
     género para maximizar el contraste entre los 2 primeros hablantes).
   · buildCast(speakers, lang): asigna a cada personaje una voz distinta;
     cuando se agotan las voces físicas, diferencia por tono (pitch).
   · speakDialogue(): secuencia de battute con la voz de su personaje. */

import type { LangCode } from "./types";

const LOCALES: Record<LangCode, string> = {
  it: "it-IT",
  en: "en-US",
  pt: "pt-PT",
  fr: "fr-FR",
  de: "de-DE",
};

export function localeOf(lang: LangCode): string {
  return LOCALES[lang] ?? "it-IT";
}

/* pools por lengua (perezosos) */
const pools = new Map<string, SpeechSynthesisVoice[]>();
const defaults = new Map<string, SpeechSynthesisVoice | null>();
const listeners = new Set<() => void>();

/* ── Nombres de voces conocidos por género y lengua (heurística
     multi-plataforma: Chrome/Edge/macOS/Android) ──────────────────── */
const FEMALE_RE: Record<LangCode, RegExp> = {
  it: /alice|federica|elsa|isabella|paola|giorgia|cosima|lucia|mia|martina|valentina|chiara|alessia|giulia|anna|elisa|fabiana|silvia|francesca|google italiano|italiana\b/i,
  en: /samantha|zira|susan|ava|allison|serena|karen|moira|tessa|fiona|victoria|catherine|jenny|aria|michelle|sonia|sara|natasha|clara|emily|cora|linda|heather|eva|nadia|google us english|female|woman\b/i,
  pt: /am[eé]lia|luciana|h[eé]lia|carmen|in[eê]s|catarina|joana|am[eá]lia|francisca|leonor|marta|beatriz|mariana|carolina|sofia|aurora|filipa|nuno.*f|google portugu[eê]s|feminina/i,
  fr: /am[ée]lie|audrey|julie|marie|virginie|c[ée]line|aurelie|charlotte|denise|elle|zira|julia?ne|chloe|clarisse|coralie|[ée]lodie|google fran[cç]ais|f[eé]minine/i,
  de: /anna|katja|petra|marlene|vicki|helena|ingrid|greta|lena|christina|katrin|sabine|ulrike|franziska|hanna|google deutsch|weiblich/i,
};
const MALE_RE: Record<LangCode, RegExp> = {
  it: /\bluca\b|diego|cosimo|federico|giorgio|matteo|carlo\b|francesco|lorenzo|marco\b|davide|luigi|corrado|gianluca|fausto|alessandro|riccardo|mario\b|italiano\b|male\b/i,
  en: /\balex\b|daniel|fred|tom|david|mark|junior|aaron|guy|james|ryan|brandon|christopher|eric|george|paul|steffan|matthew|brian|arthur|richard|male|man\b/i,
  pt: /duarte|cristiano|rafael|bernardo|nuno|tiago|gon[cç]alo|francisco|jo[aã]o|pedro|miguel|[aá]lvaro|diogo|ricardo|masculino/i,
  fr: /\bthomas\b|\bpaul\b|henri|nicolas|claude|pierre|antoine|bruno|julien|franck|yannick|sydney|male|homme\b|masculin/i,
  de: /stefan|tobias|hans|konrad|markus|m[äa]nnlich|ralf|bjoern|bernd|carsten|heinz|joachim|klaus|male\b/i,
};

/** sufijos de idioma a limpiar en prettyVoiceName, por lengua */
const LANG_STRIP: Record<LangCode, RegExp> = {
  it: /\s*-\s*(Italian|Italia).*$/i,
  en: /\s*-\s*(English|United States|U\.S\.).*$/i,
  pt: /\s*-\s*(Portugu[eê]s|Portugal|European).*$/i,
  fr: /\s*-\s*(Fran[cç]ais|France).*$/i,
  de: /\s*-\s*(Deutsch|Deutschland|German).*$/i,
};
const LANG_DEFAULT_NAME: Record<LangCode, RegExp> = {
  it: /^(italian|italia)$/i,
  en: /^(english|united states|u\.s\.)$/i,
  pt: /^(portugu[eê]s|portugal|european portuguese)$/i,
  fr: /^(fran[cç]ais|france)$/i,
  de: /^(deutsch|deutschland|german)$/i,
};

/** Nombre limpio y legible de una voz. */
export function prettyVoiceName(v: SpeechSynthesisVoice | null, lang: LangCode = "it"): string {
  if (!v) return "voce di sistema";
  const L = v.lang?.toLowerCase().split("-")[0] as LangCode ?? lang;
  const strip = LANG_STRIP[L] ?? LANG_STRIP[lang];
  let n = v.name
    .replace(/^(Microsoft|Google|Apple)\s+/i, "")
    .replace(/\s*(Online|Server)?\s*(\((Natural|Enhanced|Premium|Compact)\))?\s*-\s*.*$/i, "")
    .replace(/\s*\((Natural|Enhanced|Premium|Compact)\)\s*/i, " ")
    .replace(strip, "")
    .trim();
  if (!n || LANG_DEFAULT_NAME[L]?.test(n) || LANG_DEFAULT_NAME[lang]?.test(n)) {
    n = v.name.split(/[-–(]/)[0].trim() || "voce di sistema";
  }
  return n;
}

function genderOf(v: SpeechSynthesisVoice, lang: LangCode): "f" | "m" | "?" {
  if (FEMALE_RE[lang]?.test(v.name)) return "f";
  if (MALE_RE[lang]?.test(v.name)) return "m";
  return "?";
}

/** Intercala femeninas y masculinas: [f1, m1, f2, m2, …] */
function interleaveByGender(voices: SpeechSynthesisVoice[], lang: LangCode): SpeechSynthesisVoice[] {
  const seen = new Set<string>();
  const uniq: SpeechSynthesisVoice[] = [];
  for (const v of voices) {
    const key = prettyVoiceName(v, lang).toLowerCase();
    if (seen.has(key)) {
      const existing = uniq.find((u) => prettyVoiceName(u, lang).toLowerCase() === key);
      if (existing && !existing.localService && v.localService) uniq[uniq.indexOf(existing)] = v;
      continue;
    }
    seen.add(key);
    uniq.push(v);
  }
  const fem = uniq.filter((v) => genderOf(v, lang) === "f");
  const male = uniq.filter((v) => genderOf(v, lang) === "m");
  const rest = uniq.filter((v) => genderOf(v, lang) === "?");
  const out: SpeechSynthesisVoice[] = [];
  const max = Math.max(fem.length, male.length);
  for (let i = 0; i < max; i++) {
    if (fem[i]) out.push(fem[i]);
    if (male[i]) out.push(male[i]);
  }
  return [...out, ...rest];
}

export function initVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const load = () => {
    const voices = window.speechSynthesis.getVoices();
    for (const lang of Object.keys(LOCALES) as LangCode[]) {
      const pref = voices.filter((v) => v.lang?.toLowerCase().startsWith(lang));
      // en: prefer en-US; pt: prefer pt-PT sobre pt-BR
      let pool = pref;
      if (lang === "en") pool = pref.filter((v) => !v.lang?.toLowerCase().includes("gb")) ;
      if (lang === "pt") pool = pref.filter((v) => !v.lang?.toLowerCase().includes("br"));
      defaults.set(lang, pool[0] ?? pref[0] ?? null);
      pools.set(lang, interleaveByGender(pool.length ? pool : pref, lang));
    }
    listeners.forEach((l) => l());
  };
  load();
  window.speechSynthesis.onvoiceschanged = load;
}

export function onVoices(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/* compat v9.x (vistas italianas) */
export function hasItalianVoice() {
  return (defaults.get("it") ?? null) !== null;
}
export function italianVoiceCount() {
  return pools.get("it")?.length ?? 0;
}
/** v9.17 · nº de voces de una lengua */
export function voiceCountFor(lang: LangCode) {
  return pools.get(lang)?.length ?? 0;
}
/** v9.45 · hay voz disponible para la lengua de estudio */
export function hasVoiceFor(lang: LangCode) {
  return (defaults.get(lang) ?? null) !== null;
}
export function defaultVoiceFor(lang: LangCode) {
  return defaults.get(lang) ?? null;
}
/** v9.25 · pool de voces de una lengua (selector de locutor del notiziario) */
export function voicesFor(lang: LangCode): SpeechSynthesisVoice[] {
  return pools.get(lang) ?? [];
}

/* ── Reparto de voces por personaje ───────────────────────────────── */

export interface SpeakerVoice {
  voice: SpeechSynthesisVoice | null;  // null → voz por defecto del navegador
  pitch: number;                        // diferenciación por tono
  rateFactor: number;                   // micro-variación de velocidad
  distinct: boolean;                    // true = voz físicamente distinta
  voiceName: string;                    // nombre legible (para la UI)
}

const FALLBACK_PITCHES = [1.05, 0.76, 1.24, 0.86, 1.14, 0.7];
const FALLBACK_RATES = [1, 0.97, 1.04, 0.95, 1.02, 0.93];

/** Asigna una voz a cada personaje (orden de primera aparición).
    v9.17: `lang` selecciona el pool (default "it" = compat). */
export function buildCast(speakerNames: (string | undefined)[], lang: LangCode = "it"): Record<string, SpeakerVoice> {
  const pool = pools.get(lang) ?? [];
  const unique: string[] = [];
  for (const s of speakerNames) if (s && !unique.includes(s)) unique.push(s);
  const cast: Record<string, SpeakerVoice> = {};
  unique.forEach((name, k) => {
    if (pool.length === 0) {
      const j = k % FALLBACK_PITCHES.length;
      cast[name] = { voice: null, pitch: FALLBACK_PITCHES[j], rateFactor: FALLBACK_RATES[j], distinct: false, voiceName: "voce di sistema" };
    } else if (k < pool.length) {
      cast[name] = { voice: pool[k], pitch: 1, rateFactor: 1, distinct: true, voiceName: prettyVoiceName(pool[k], lang) };
    } else {
      const j = (k - pool.length) % (FALLBACK_PITCHES.length - 1) + 1;
      cast[name] = {
        voice: pool[k % pool.length],
        pitch: FALLBACK_PITCHES[j],
        rateFactor: FALLBACK_RATES[j],
        distinct: false,
        voiceName: prettyVoiceName(pool[k % pool.length], lang),
      };
    }
  });
  return cast;
}

/* ── Reproducción ─────────────────────────────────────────────────── */

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voice?: SpeechSynthesisVoice | null;
  lang?: LangCode;              // v9.17 · lengua de estudio (default it)
  onEnd?: () => void;
  onStart?: () => void;
}

export function speak(text: string, opts: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    opts.onEnd?.();
    return false;
  }
  window.speechSynthesis.cancel();
  const lang: LangCode = opts.lang ?? "it";
  const u = new SpeechSynthesisUtterance(text);
  u.lang = localeOf(lang);
  const v = opts.voice !== undefined ? opts.voice : (defaults.get(lang) ?? null);
  if (v) u.voice = v;
  u.rate = opts.rate ?? 0.9;
  u.pitch = opts.pitch ?? 1;
  u.onstart = () => opts.onStart?.();
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  window.speechSynthesis.speak(u);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/** Speak a sequence of lines, one after another. Returns cancel function. */
export function speakSequence(lines: string[], rate = 0.9, onIndex?: (i: number) => void, onDone?: () => void, lang: LangCode = "it") {
  let i = 0;
  let cancelled = false;
  const next = () => {
    if (cancelled) return;
    if (i >= lines.length) { onDone?.(); return; }
    const idx = i;
    i += 1;
    onIndex?.(idx);
    speak(lines[idx], { rate, lang, onEnd: () => setTimeout(next, 350) });
  };
  next();
  return () => { cancelled = true; stopSpeaking(); };
}

/* ── Diálogo multi-voz ────────────────────────────────────────────── */

export interface DialogueLine {
  it: string;
  speaker?: string;
}

export interface DialogueOptions {
  rate?: number;
  gap?: number;               // pausa entre battute (ms)
  lang?: LangCode;            // v9.17
  onIndex?: (i: number) => void;
  onDone?: () => void;
}

/** Reproduce un diálogo completo: cada battute con la voz de su personaje.
    Devuelve una función de cancelación. */
export function speakDialogue(lines: DialogueLine[], cast: Record<string, SpeakerVoice>, opts: DialogueOptions = {}) {
  const rate = opts.rate ?? 0.9;
  const gap = opts.gap ?? 420;
  const lang = opts.lang ?? "it";
  let i = 0;
  let cancelled = false;
  const next = () => {
    if (cancelled) return;
    if (i >= lines.length) { opts.onDone?.(); return; }
    const idx = i;
    i += 1;
    opts.onIndex?.(idx);
    const line = lines[idx];
    const p = line.speaker ? cast[line.speaker] : undefined;
    const ok = speak(line.it, {
      rate: rate * (p?.rateFactor ?? 1),
      pitch: p?.pitch ?? 1,
      voice: p?.voice ?? null,
      lang,
      onEnd: () => setTimeout(next, gap),
    });
    if (!ok) { opts.onDone?.(); return; }
  };
  next();
  return () => { cancelled = true; stopSpeaking(); };
}
