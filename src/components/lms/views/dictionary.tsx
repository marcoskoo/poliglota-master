"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, Gauge, Info, Link2, Search, Sparkles, Star, Waves } from "lucide-react";
import {
  CEFR_VOCAB_TARGETS, searchDictionary,
} from "@/lib/lms/dict/dictionary";
import { dictListFor, dictByIdFor } from "@/lib/lms/dict/active";
import type { LangCode } from "@/lib/lms/types";
import { CATEGORY_META, CATEGORY_IMG, CEFR_LEVELS, type VocabWord, type CefrLevel } from "@/lib/lms/types";
import { ThemeImg } from "../theme-img";
import { useLms } from "@/lib/lms/store";
import { newCard } from "@/lib/lms/srs";
import { AudioButton } from "../audio-button";
import { FlashcardSession } from "../flashcards";
import { Mascot } from "../mascot";
import { useUi } from "@/lib/lms/ui";
import { cn } from "@/lib/utils";

/* ════════ Vista: DICCIONARIO (Dizionario didattico v2.0) ════════
   Cumple estándares internacionales de lexicografía didáctica:
   · MCER/CEFR A1–C2 con metas de cobertura por nivel
   · IPA (Alfabeto Fonético Internacional)
   · Bandas de frecuencia (cf. De Mauro, DIB)
   · Registro, colocaciones y variantes
   · Lexicografía contrastiva (falsos amigos y notas de uso)        */

const ALL_TYPES = ["sostantivo", "verbo", "aggettivo", "avverbio", "espressione", "pronome", "preposizione", "congiunzione", "articolo", "numerale", "interiezione", "locuzione"];
const PAGE = 60;

/* v9.17→v9.24 · diccionario por lengua vía despacho central
   (dict/active.ts): it → DICTIONARY/VOCAB (8.031 lemas); en → EN_DICT;
   pt → PT_DICT; fr → FR_DICT (v9.23); de → DE_DICT (v9.24). Sin
   ternarios locales: una sola fuente para todas las vistas.     */

export function DictionaryView() {
  const u = useUi();
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [ffOnly, setFfOnly] = useState(false);
  const [hfOnly, setHfOnly] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [statsOpen, setStatsOpen] = useState(true);
  const [favReview, setFavReview] = useState(false);

  const activeLang = (useLms((s) => s.activeLang) ?? "it") as LangCode;
  const WORD_INDEX = dictByIdFor(activeLang);
  const BASE_LIST: VocabWord[] = dictListFor(activeLang);
  const srs = useLms((s) => s.srs);
  const upsertSrs = useLms((s) => s.upsertSrs);
  const addXp = useLms((s) => s.addXp);
  const navParams = useLms((s) => s.navParams);
  const dictFavorites = useLms((s) => s.dictFavorites);
  const dictHistory = useLms((s) => s.dictHistory);
  const toggleDictFavorite = useLms((s) => s.toggleDictFavorite);
  const pushDictHistory = useLms((s) => s.pushDictHistory);

  const openWord = (id: string) => {
    setSelected(id);
  };

  /* registrar cronologia al abrir cualquier palabra (click o deep-link):
     sincronización con el store externo — nunca setState de React aquí */
  const lastHistoryPush = useRef<string | null>(null);
  useEffect(() => {
    if (selected && lastHistoryPush.current !== selected) {
      lastHistoryPush.current = selected;
      pushDictHistory(selected);
    }
  }, [selected, pushDictHistory]);

  /* v8.0: deep-link desde la ricerca globale (Ctrl+K) — ajuste de estado
     durante el render (patrón oficial de React, sin efectos) */
  const [appliedWordId, setAppliedWordId] = useState<string | null>(null);
  if (navParams.wordId && navParams.wordId !== appliedWordId) {
    setAppliedWordId(navParams.wordId);
    if (WORD_INDEX[navParams.wordId]) setSelected(navParams.wordId);
  }

  /* v9.19 · estadísticas del diccionario ACTIVO (antes siempre las del italiano) */
  const localStats = useMemo(() => {
    const total = BASE_LIST.length;
    const withIpa = BASE_LIST.filter((w) => w.ipa).length;
    const withFreq = BASE_LIST.filter((w) => w.freq).length;
    const withCollocations = BASE_LIST.filter((w) => w.collocations && w.collocations.length > 0).length;
    const withNotes = BASE_LIST.filter((w) => w.note).length;
    const ffCount = BASE_LIST.filter((w) => w.ff).length;
    const byLevel = CEFR_LEVELS.reduce((acc, lv) => {
      acc[lv] = BASE_LIST.filter((w) => w.level === lv).length;
      return acc;
    }, {} as Record<CefrLevel, number>);
    const coverage = (lv: CefrLevel) => {
      const idx = CEFR_LEVELS.indexOf(lv);
      const cumulative = CEFR_LEVELS.slice(0, idx + 1).reduce((a, l) => a + byLevel[l], 0);
      return Math.min(100, Math.round((cumulative / CEFR_VOCAB_TARGETS[lv]) * 100));
    };
    return { total, withIpa, withFreq, withCollocations, withNotes, ffCount, byLevel, coverage, ipaPct: total ? Math.round((withIpa / total) * 100) : 0 };
  }, [BASE_LIST]);

  const favoriteWords = useMemo(
    () => dictFavorites.map((id) => WORD_INDEX[id]).filter(Boolean) as VocabWord[],
    [dictFavorites, WORD_INDEX]
  );
  const historyWords = useMemo(
    () => dictHistory.map((id) => WORD_INDEX[id]).filter(Boolean) as VocabWord[],
    [dictHistory, WORD_INDEX]
  );

  const results = useMemo(() => {
    let list: VocabWord[] = query.trim()
      ? activeLang === "it"
        ? searchDictionary(query)
        : BASE_LIST.filter((w) => {
            const q = query.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return `${w.it} ${w.es} ${(w.example?.it ?? "")} ${(w.example?.es ?? "")}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q);
          })
      : BASE_LIST;
    if (levelFilter !== "all") list = list.filter((w) => w.level === levelFilter);
    if (catFilter !== "all") list = list.filter((w) => w.cat === catFilter);
    if (typeFilter !== "all") list = list.filter((w) => w.type === typeFilter);
    if (ffOnly) list = list.filter((w) => w.ff);
    if (hfOnly) list = list.filter((w) => (w.freq ?? 3) <= 2);
    const levelIdx = (lv: string) => CEFR_LEVELS.indexOf(lv as VocabWord["level"]);
    if (!query.trim()) list = [...list].sort((a, b) => levelIdx(a.level) - levelIdx(b.level) || a.it.localeCompare(b.it, "it"));
    return list;
  }, [query, levelFilter, catFilter, typeFilter, ffOnly, hfOnly, BASE_LIST, activeLang]);

  const visible = results.slice(0, limit);
  const word = selected ? WORD_INDEX[selected] : undefined;

  /* ── ripasso dei preferiti (v8.0) ── */
  if (favReview && favoriteWords.length >= 2) {
    return (
      <div>
        <button onClick={() => setFavReview(false)} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-it transition-colors hover:text-verde">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {u.dizionario.back}
        </button>
        <FlashcardSession cardIds={favoriteWords.map((w) => w.id)} onExit={() => setFavReview(false)} lang={activeLang} />
      </div>
    );
  }

  /* ── entrada completa ── */
  if (word) {
    const related = (word.related ?? [])
      .map((r) => BASE_LIST.find((v) => v.it === r))
      .filter(Boolean) as VocabWord[];
    return (
      <div>
        <button onClick={() => setSelected(null)} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-it transition-colors hover:text-verde">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {u.dizionario.back}
        </button>

        <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-soft bg-surface p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-4xl font-semibold sm:text-5xl">{word.it}</h2>
                <AudioButton text={word.it} size="lg" lang={activeLang} />
                {word.ff && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rosso-tenue px-3 py-1.5 text-xs font-bold text-rosso-scuro dark:text-rosso">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> {u.dizionario.ffTag}
                  </span>
                )}
              </div>
              {(word.ipa || word.pron) && (
                <p className="mt-2 font-mono text-lg text-muted-it">
                  {word.ipa ? "/" + word.ipa + "/" : "/" + word.pron + "/"}
                </p>
              )}
              <p className="mt-3 text-2xl text-verde-scuro dark:text-verde">{word.es}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full bg-verde-tenue px-3 py-1.5 text-xs font-bold text-verde-scuro dark:text-verde">{word.level} · {u.dizionario.cefrChip}</span>
              <button
                onClick={() => toggleDictFavorite(word.id)}
                aria-pressed={dictFavorites.includes(word.id)}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all",
                  dictFavorites.includes(word.id)
                    ? "border-oro bg-oro-tenue text-oro-scuro dark:text-oro"
                    : "border-soft text-muted-it hover:border-oro/50 hover:text-oro-scuro dark:hover:text-oro"
                )}
                title={dictFavorites.includes(word.id) ? u.dizionario.removeFavAria : u.dizionario.addFavAria}
              >
                <Star className={cn("h-3.5 w-3.5", dictFavorites.includes(word.id) && "fill-current")} aria-hidden="true" />
                {dictFavorites.includes(word.id) ? u.dizionario.inFav : u.dizionario.fav}
              </button>
              {word.freq && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-soft px-3 py-1.5 text-xs font-bold text-muted-it" title={u.data.freq[String(word.freq)]?.desc ?? ""}>
                  <Gauge className="h-3.5 w-3.5" aria-hidden="true" /> {u.dizionario.freqLabel} {u.data.freq[String(word.freq)]?.label ?? ""}
                </span>
              )}
              {word.register && word.register !== "neutro" && (
                <span className="rounded-full bg-oro-tenue px-3 py-1.5 text-xs font-bold text-oro-scuro dark:text-oro">{u.dizionario.registerLabel} {u.data.register[word.register] ?? word.register}</span>
              )}
              <button
                onClick={() => { if (!srs[word.id]) { upsertSrs(word.id, newCard(word.id)); addXp(2, "vocabolario"); } }}
                disabled={!!srs[word.id]}
                className={cn(
                  "rounded-xl border-2 px-4 py-2.5 text-xs font-bold transition-all",
                  srs[word.id] ? "border-verde/40 bg-verde-tenue text-verde-scuro dark:text-verde" : "border-oro/50 bg-oro-tenue text-oro-scuro hover:scale-105 dark:text-oro"
                )}
              >
                {srs[word.id] ? u.dizionario.inReview : u.dizionario.addToReview}
              </button>
            </div>
          </div>

          {word.ff && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-rosso/40 bg-rosso-tenue/60 p-4 dark:bg-rosso-tenue/25">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rosso-scuro dark:text-rosso" aria-hidden="true" />
              <div>
                <p className="font-display text-lg font-semibold text-rosso-scuro dark:text-rosso">{u.dizionario.ffTitle}</p>
                <p className="mt-1 text-sm leading-relaxed">{word.note}</p>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-crema-scura p-5 dark:bg-inchiostro/10">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-it">{u.dizionario.catGram}</p>
              <p className="mt-2 text-lg font-semibold">
                {u.data.types[word.type] ?? word.type}
                {word.gender && <span className={cn("ml-2 text-sm", word.gender === "m" ? "noun-m" : "noun-f")}>({word.gender === "m" ? u.dizionario.genderM : u.dizionario.genderF})</span>}
                {word.plural && <span className="ml-2 font-mono text-sm text-muted-it">· {u.dizionario.pluralShort} {word.plural}</span>}
              </p>
              {word.alt && word.alt.length > 0 && (
                <p className="mt-2 font-mono text-sm text-muted-it">{u.dizionario.variants} {word.alt.join(" · ")}</p>
              )}
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-it">{u.dizionario.catTheme}</p>
              <p className="mt-1.5 flex items-center gap-2 text-lg">
                <ThemeImg src={CATEGORY_IMG[word.cat] ?? ""} alt="" className="h-8 w-8 rounded-lg object-cover shadow-sm" />
                {u.data.categories[word.cat] ?? CATEGORY_META[word.cat].es}
              </p>
            </div>
            {word.example.it && (
              <div className="rounded-2xl bg-crema-scura p-5 dark:bg-inchiostro/10">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-it">{u.dizionario.example}</p>
                <p className="mt-2 font-display text-xl italic leading-snug">“{word.example.it}”</p>
                <p className="mt-1.5 text-sm text-muted-it">{word.example.es}</p>
              </div>
            )}
          </div>

          {word.collocations && word.collocations.length > 0 && (
            <div className="mt-4 rounded-2xl border border-verde/25 bg-verde-tenue/50 p-4 dark:bg-verde-tenue/20">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-verde-scuro dark:text-verde">
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" /> {u.dizionario.collocations}
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {word.collocations.map((c, i) => (
                  <li key={i} className="rounded-full border border-verde/30 bg-surface px-3 py-1 text-sm font-semibold">{c}</li>
                ))}
              </ul>
            </div>
          )}

          {word.note && !word.ff && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-oro/30 bg-oro-tenue p-4 dark:bg-oro-tenue/25">
              <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-oro-scuro dark:text-oro" aria-hidden="true" />
              <p className="text-sm leading-relaxed"><strong>{u.dizionario.useNote}</strong> {word.note}</p>
            </div>
          )}

          {(word.syn || word.ant || related.length > 0) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {word.syn && (
                <div className="rounded-2xl border border-verde/25 bg-verde-tenue/50 p-4 dark:bg-verde-tenue/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-verde-scuro dark:text-verde">{u.dizionario.syn}</p>
                  <ul className="mt-2 space-y-1 text-sm font-semibold">
                    {word.syn.map((s, i) => <li key={i}>≈ {s}</li>)}
                  </ul>
                </div>
              )}
              {word.ant && (
                <div className="rounded-2xl border border-rosso/25 bg-rosso-tenue/50 p-4 dark:bg-rosso-tenue/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-rosso-scuro dark:text-rosso">{u.dizionario.ant}</p>
                  <ul className="mt-2 space-y-1 text-sm font-semibold">
                    {word.ant.map((s, i) => <li key={i}>≠ {s}</li>)}
                  </ul>
                </div>
              )}
              {related.length > 0 && (
                <div className="rounded-2xl border border-oro/25 bg-oro-tenue/50 p-4 dark:bg-oro-tenue/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-oro-scuro dark:text-oro">{u.dizionario.related}</p>
                  <ul className="mt-2 space-y-1 text-sm font-semibold">
                    {related.map((r, i) => (
                      <li key={i}>
                        <button onClick={() => openWord(r.id)} className="underline decoration-dotted underline-offset-2 hover:text-verde">
                          {r.it} <span className="font-normal text-muted-it">({r.es})</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.article>
      </div>
    );
  }

  /* ── listado + filtros + panel MCER ── */
  return (
    <div className="space-y-5">
      {/* panel de estándares MCER */}
      <div className="rounded-3xl border border-soft bg-gradient-to-br from-verde-tenue to-surface p-5 dark:from-verde-tenue/25 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">{u.dizionario.panelTitle}</h2>
            <p className="mt-1 text-sm text-muted-it">
              {u.dizionario.statsLine(localStats.total)}
            </p>
          </div>
          <button
            onClick={() => setStatsOpen(!statsOpen)}
            aria-expanded={statsOpen}
            className="min-h-10 rounded-xl border-2 border-soft bg-surface px-4 py-2 text-xs font-bold text-muted-it transition-colors hover:border-verde/40"
          >
            {statsOpen ? u.dizionario.hideStats : u.dizionario.showStats}
          </button>
        </div>

        {statsOpen && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {CEFR_LEVELS.map((lv) => {
                const cov = localStats.coverage(lv);
                return (
                  <div key={lv} className="rounded-2xl border border-soft bg-surface p-3">
                    <p className="flex items-baseline justify-between">
                      <span className="font-display text-lg font-bold">{lv}</span>
                      <span className="text-xs font-bold text-muted-it">{localStats.byLevel[lv]} {u.dizionario.entries}</span>
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-inchiostro/10 dark:bg-inchiostro/25">
                      <div className="h-full rounded-full bg-verde" style={{ width: cov + "%" }} />
                    </div>
                    <p className="mt-1.5 text-[10px] leading-tight text-muted-it">
                      {u.dizionario.covNote(cov, CEFR_VOCAB_TARGETS[lv])}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-verde/30 bg-verde-tenue px-3 py-1.5 font-bold text-verde-scuro dark:text-verde">{u.dizionario.ipaChip(localStats.ipaPct)}</span>
              <span className="rounded-full border border-verde/30 bg-verde-tenue px-3 py-1.5 font-bold text-verde-scuro dark:text-verde"><Gauge className="mr-1 inline h-3.5 w-3.5" aria-hidden />{u.dizionario.freqChip(localStats.withFreq)}</span>
              <span className="rounded-full border border-oro/30 bg-oro-tenue px-3 py-1.5 font-bold text-oro-scuro dark:text-oro"><Link2 className="mr-1 inline h-3.5 w-3.5" aria-hidden />{u.dizionario.collocChip(localStats.withCollocations)}</span>
              <span className="rounded-full border border-oro/30 bg-oro-tenue px-3 py-1.5 font-bold text-oro-scuro dark:text-oro">{u.dizionario.notesChip(localStats.withNotes)}</span>
              <button
                onClick={() => { setFfOnly(!ffOnly); setQuery(""); }}
                aria-pressed={ffOnly}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-bold transition-colors",
                  ffOnly ? "border-rosso bg-rosso-tenue text-rosso-scuro dark:text-rosso" : "border-rosso/30 bg-rosso-tenue/60 text-rosso-scuro hover:bg-rosso-tenue dark:text-rosso"
                )}
              >
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> {u.dizionario.ffChip(localStats.ffCount)}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* buscador */}
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }}
          placeholder={u.dizionario.searchPh}
          aria-label={u.dizionario.searchAria}
          className="min-h-12 w-full rounded-2xl border-2 border-soft bg-surface pl-11 pr-4 text-base outline-none transition-colors focus:border-verde"
        />
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-it" aria-hidden="true" />
      </div>

      {/* preferiti + cronologia (v8.0) */}
      {(favoriteWords.length > 0 || historyWords.length > 0) && (
        <div className="space-y-2.5">
          {favoriteWords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-oro-scuro dark:text-oro">
                <Star className="h-3 w-3 fill-current" aria-hidden="true" /> {u.dizionario.favorites}
              </span>
              {favoriteWords.slice(0, 8).map((w) => (
                <button key={w.id} onClick={() => openWord(w.id)} className="rounded-full border border-oro/40 bg-oro-tenue px-3 py-1 text-xs font-bold text-oro-scuro transition-transform hover:scale-105 dark:text-oro">
                  {w.it}
                </button>
              ))}
              {favoriteWords.length >= 4 && (
                <button onClick={() => setFavReview(true)} className="rounded-full bg-verde px-3 py-1 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 dark:text-inchiostro">
                  {u.dizionario.reviewFavs(favoriteWords.length)}
                </button>
              )}
            </div>
          )}
          {historyWords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-it">{u.dizionario.history}</span>
              {historyWords.slice(0, 8).map((w) => (
                <button key={w.id} onClick={() => openWord(w.id)} className="rounded-full border border-soft bg-surface px-3 py-1 text-xs font-semibold text-muted-it transition-colors hover:border-verde/40 hover:text-verde">
                  {w.it}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* filtros */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-2">
          {["all", ...CEFR_LEVELS].map((lv) => (
            <button
              key={lv}
              onClick={() => { setLevelFilter(lv); setLimit(PAGE); }}
              aria-pressed={levelFilter === lv}
              className={cn("min-h-10 rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all", levelFilter === lv ? "border-verde bg-verde-tenue text-verde-scuro dark:text-verde" : "border-soft text-muted-it hover:border-verde/40")}
            >
              {lv === "all" ? u.dizionario.allLevels : lv}
            </button>
          ))}
          <button
            onClick={() => { setHfOnly(!hfOnly); setLimit(PAGE); }}
            aria-pressed={hfOnly}
            className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-all", hfOnly ? "border-verde bg-verde-tenue text-verde-scuro dark:text-verde" : "border-soft text-muted-it hover:border-verde/40")}
          >
            <Waves className="h-3.5 w-3.5" aria-hidden="true" /> {u.dizionario.highFreq}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={catFilter}
            onChange={(e) => { setCatFilter(e.target.value); setLimit(PAGE); }}
            aria-label={u.dizionario.catAria}
            className="min-h-10 rounded-xl border-2 border-soft bg-surface px-3 text-sm font-semibold outline-none focus:border-verde"
          >
            <option value="all">{u.dizionario.allCats}</option>
            {Object.entries(CATEGORY_META).map(([k, v]) => (
              <option key={k} value={k}>{v.emoji} {u.data.categories[k] ?? v.es}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setLimit(PAGE); }}
            aria-label={u.dizionario.typeAria}
            className="min-h-10 rounded-xl border-2 border-soft bg-surface px-3 text-sm font-semibold outline-none focus:border-verde"
          >
            <option value="all">{u.dizionario.allTypes}</option>
            {ALL_TYPES.map((t) => (
              <option key={t} value={t}>{u.data.types[t] ?? t}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-muted-it">
        {query
          ? u.dizionario.resultsFor(results.length, query)
          : u.dizionario.resultsN(results.length)}
        {ffOnly && u.dizionario.onlyFf}
        {hfOnly && u.dizionario.onlyHf}
      </p>

      {/* resultados */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {results.length === 0 && (
          <div className="col-span-full rounded-3xl border border-soft bg-surface p-8 text-center">
            {/* v9.34 · Pappagallo busca contigo en el estado vacío */}
            <Mascot pose="study" className="mx-auto h-20 w-20" />
            <p className="mt-3 font-display text-xl font-semibold">{u.dizionario.empty}</p>
            <p className="mt-1.5 text-sm text-muted-it">
              {u.dizionario.emptyHint(localStats.total)}
            </p>
          </div>
        )}
        {visible.map((w, i) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.3) }}
            role="button"
            tabIndex={0}
            aria-label={u.dizionario.openAria(w.it)}
            onClick={() => openWord(w.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openWord(w.id); } }}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-soft bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-verde/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-verde/50"
          >
            <AudioButton text={w.it} size="sm" lang={activeLang} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-display text-lg font-semibold leading-tight">
                {w.it}
                {w.gender && <span className={cn("text-[10px] font-sans font-bold", w.gender === "m" ? "noun-m" : "noun-f")}>{w.gender === "m" ? "m" : "f"}</span>}
                {w.ff && <AlertTriangle className="h-3.5 w-3.5 text-rosso-scuro dark:text-rosso" aria-label={u.dizionario.ffTag} />}
              </span>
              <span className="mt-0.5 block truncate text-sm text-muted-it">{w.es}</span>
              <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase text-muted-it">
                <span className="rounded-full bg-inchiostro/5 px-1.5 py-0.5 dark:bg-inchiostro/15">{w.level}</span>
                <span className="inline-flex items-center">
                  <ThemeImg src={CATEGORY_IMG[w.cat] ?? ""} alt="" className="mr-1 h-4 w-4 rounded object-cover" />
                </span>
                {(w.freq ?? 3) <= 2 && <span className="rounded-full bg-verde-tenue px-1.5 py-0.5 text-verde-scuro dark:text-verde">{u.dizionario.freqDot}</span>}
                {w.register && w.register !== "neutro" && <span className="rounded-full bg-oro-tenue px-1.5 py-0.5 text-oro-scuro dark:text-oro">{u.data.register[w.register] ?? w.register}</span>}
                {srs[w.id] && <span className="text-verde-scuro dark:text-verde">{u.dizionario.inReviewDot}</span>}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-it opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
          </motion.div>
        ))}
      </div>

      {results.length > visible.length && (
        <button
          onClick={() => setLimit(limit + PAGE)}
          className="mx-auto flex min-h-12 items-center gap-2 rounded-2xl border-2 border-verde/40 bg-surface px-6 py-3 text-sm font-bold text-verde-scuro transition-all hover:border-verde hover:shadow-lg dark:text-verde"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" /> {u.dizionario.loadMore(Math.min(PAGE, results.length - visible.length), visible.length, results.length)}
        </button>
      )}
    </div>
  );
}
