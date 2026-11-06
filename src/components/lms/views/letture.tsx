"use client";

/* ── Letture & Storia (v9.0) · multilingüe (v9.45) ───────────────────
   Biblioteca de lecturas largas por lengua de estudio:
   · audio TTS sincronizado: párrafo activo resaltado + auto-scroll
   · velocidad ajustable y subtítulos ES conmutables
   · comprensión lectora (QuizEngine) con recompensas
   · idee per discutir con deep-link al Tutor IA
   v9.45: cada lengua tiene su biblioteca clásica propia (lettureFor):
   IT 58 históricas + EN/PT/FR/DE 24 nuevas (A1→C2) con categorías
   localizadas, voces TTS de la lengua activa y UI traducida.        */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Check, Coins, Lightbulb, ListFilter, MessageCircle, Pause, Play, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLms } from "@/lib/lms/store";
import { speak, stopSpeaking, hasVoiceFor, onVoices } from "@/lib/lms/tts";
import { useVoiceCast, SpeakerAvatar, SpeakerChip, VoiceCastNote, speakerIndexMap, uniqueSpeakers } from "../voice-cast";
import { LETTURE_IMG, letturaExercises, type Lettura, type LetturaCat } from "@/lib/lms/letture";
import { lettureFor, lettureByIdFor, lettureCatsFor } from "@/lib/lms/letture-lang";
import { tutorFor } from "@/lib/lms/tutor-persona";
import type { CefrLevel, LangCode } from "@/lib/lms/types";
import { QuizEngine } from "../quiz-engine";
import { VoiceHint } from "../audio-button";
import { Mascot } from "../mascot";
import { HoverWords } from "../hover-words";
import { MindCollection } from "../mind-library";
import { useUi } from "@/lib/lms/ui";

const LEVELS: (CefrLevel | "tutti")[] = ["tutti", "A1", "A2", "B1", "B2", "C1", "C2"];
const RATES = [0.75, 0.9, 1, 1.2];

const CAT_STYLES: Record<LetturaCat, string> = {
  dialoghi: "border-azzurro/30 bg-azzurro/10 text-azzurro-scuro dark:text-azzurro",
  informazione: "border-oro/30 bg-oro-tenue text-oro-scuro dark:text-oro",
  "storia-italia": "border-verde/30 bg-verde-tenue text-verde-scuro dark:text-verde",
  "storia-mondo": "border-terracotta/30 bg-terracotta/10 text-terracotta-scuro dark:text-terracotta",
  cultura: "border-viola/30 bg-viola-tenue text-viola-scuro dark:text-viola",
};

export function LettureView() {
  const [cat, setCat] = useState<LetturaCat | "tutte">("tutte");
  const [level, setLevel] = useState<CefrLevel | "tutti">("tutti");
  /* v9.14: modo biblioteca clásica o colección Meditazione e consapevolezza
     v9.45: cada lengua tiene biblioteca clásica propia → «libri» por
     defecto también en EN/PT/FR/DE. */
  const activeLang0 = (useLms.getState().activeLang ?? "it") as LangCode;
  const [collection, setCollection] = useState<"libri" | "mente">(() =>
    useLms.getState().navParams.mindId ? "mente" : "libri"
  );
  const activeLang = useLms((s) => s.activeLang) as LangCode;
  const u = useUi();
  // deep-link inicial (navParams.letturaId): la vista se monta ya en la lettura pedida
  const [openId, setOpenId] = useState<string | null>(() => {
    const p = useLms.getState().navParams.letturaId;
    return p && lettureByIdFor(activeLang0)[p] ? p : null;
  });

  const readingsRead = useLms((s) => s.readingsRead);

  const texts = useMemo(() => {
    const lib = lettureFor(activeLang);
    return lib.filter((t) => (cat === "tutte" || t.cat === cat) && (level === "tutti" || t.level === level));
  }, [cat, level, activeLang]);
  const text = openId ? lettureByIdFor(activeLang)[openId] ?? null : null;
  const cats = lettureCatsFor(activeLang);

  if (text) return <Reader key={text.id} text={text} onBack={() => setOpenId(null)} />;

  if (collection === "mente") {
    return (
      <div className="space-y-6">
        <VoiceHint lang={activeLang} />
        <MindCollection initialId={useLms.getState().navParams.mindId} onBack={() => setCollection("libri")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VoiceHint lang={activeLang} />

      {/* colección temática v9.14 */}
      <button
        onClick={() => setCollection("mente")}
        className="group flex w-full flex-wrap items-center gap-4 rounded-3xl border-2 border-oro/35 bg-gradient-to-r from-oro-tenue/80 via-crema to-verde-tenue/50 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-oro/60 hover:shadow-lg dark:from-oro-tenue/25 dark:via-inchiostro/10 dark:to-verde-tenue/10 sm:p-5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-2xl shadow-sm">🧘</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2 font-display text-base font-bold">
            {u.letture.mindTitle}
            <span className="rounded-full bg-oro px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{u.letture.mindBadge}</span>
          </span>
          <span className="mt-0.5 block text-sm leading-relaxed text-muted-it">
            {u.letture.mindDesc}
          </span>
        </span>
        <span className="shrink-0 rounded-xl bg-verde px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-verde/25 transition-transform group-hover:scale-105">
          {u.letture.explore}
        </span>
      </button>

      {/* filtros por categoría */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={cat === "tutte"} onClick={() => setCat("tutte")}>{u.letture.all}</FilterChip>
        {(Object.keys(cats) as LetturaCat[]).map((c) => (
          <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>
            {cats[c].emoji} {cats[c].label}
          </FilterChip>
        ))}
      </div>
      {/* filtros por nivel */}
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <FilterChip key={l} active={level === l} onClick={() => setLevel(l)} small>
            {l === "tutti" ? u.letture.levelsAll : l}
          </FilterChip>
        ))}
      </div>

      <p className="text-sm text-muted-it">
        <ListFilter className="mr-1 inline h-4 w-4" aria-hidden="true" />
        {u.letture.countLine(texts.length)}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {texts.map((t, i) => {
          const done = readingsRead.includes(t.id);
          const img = LETTURE_IMG[t.id];
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setOpenId(t.id)}
              className={cn(
                "group relative overflow-hidden rounded-3xl border-2 border-soft bg-surface text-left transition-all hover:-translate-y-1 hover:border-verde/40 hover:shadow-lg",
                done && "border-verde/50"
              )}
            >
              {img && (
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="ita-img aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className={cn("p-5", img && "pt-4")}>
              {done && (
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-verde text-white shadow-md" title={u.letture.doneTitle}>
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase", CAT_STYLES[t.cat])}>
                  {cats[t.cat].emoji} {cats[t.cat].label}
                </span>
                <span className="rounded-full bg-inchiostro/5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-muted-it dark:bg-inchiostro/15">
                  {t.level}
                </span>
              </div>
              <p className="mt-3.5 font-display text-lg font-semibold leading-snug">{t.title}</p>
              <p className="mt-1 text-sm italic text-muted-it">{t.titleEs}</p>
              <p className="mt-2.5 text-xs text-muted-it">
                {u.letture.meta(t.lines.length, t.cat === "dialoghi", t.minutes, t.questions.length)}
              </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children, small }: { active: boolean; onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border-2 font-bold transition-all",
        small ? "px-3 py-1 text-xs" : "min-h-11 px-4 py-2 text-sm",
        active ? "border-verde bg-verde text-white shadow-md shadow-verde/25" : "border-soft bg-surface hover:border-verde/40"
      )}
    >
      {children}
    </button>
  );
}

/* ══════════ READER ════════════════════════════════════════════════ */

function Reader({ text, onBack }: { text: Lettura; onBack: () => void }) {
  const settingsRate = useLms((s) => s.settings.audioRate);
  const settingsSubs = useLms((s) => s.settings.showSubtitles);
  const trackQuest = useLms((s) => s.trackQuest);
  const markReadingDone = useLms((s) => s.markReadingDone);
  const navigate = useLms((s) => s.navigate);
  const activeLang = useLms((s) => s.activeLang) as LangCode;
  const u = useUi();

  const [rate, setRate] = useState(RATES.includes(settingsRate) ? settingsRate : 0.9);
  const [subs, setSubs] = useState(settingsSubs);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);        // riproduzione continua
  const [linePlaying, setLinePlaying] = useState<number | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; coins: number } | null>(null);

  const cancelRef = useRef<(() => void) | null>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [voiceOk, setVoiceOk] = useState(true);

  /* reparto de voces por personaje (v9.1): cada hablante con su propia voz TTS
     v9.45: voces de la lengua de estudio activa */
  const speakers = useMemo(() => uniqueSpeakers(text.lines), [text.lines]);
  const cast = useVoiceCast(text.lines, activeLang);
  const sIdx = useMemo(() => speakerIndexMap(text.lines.map((l) => l.speaker)), [text.lines]);

  useEffect(() => {
    const upd = () => setVoiceOk(hasVoiceFor(activeLang) || typeof window === "undefined");
    upd();
    const off = onVoices(upd);
    return () => { off(); };
  }, [activeLang]);

  const stopAll = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    stopSpeaking();
    setPlaying(false);
    setLinePlaying(null);
    setActiveIdx(null);
  }, []);

  // cleanup al desmontar (cambio de lettura incluido: el Reader se re-monta por key)
  useEffect(() => () => { cancelRef.current?.(); stopSpeaking(); }, []);

  /* reproducir todo desde un índice: secuencia con resaltado + auto-scroll.
     En los diálogos cada battute se lee con la voz de su personaje. */
  const playFrom = useCallback((start: number) => {
    cancelRef.current?.();
    let i = start;
    const next = () => {
      if (i >= text.lines.length) { setPlaying(false); setActiveIdx(null); return; }
      const idx = i;
      i += 1;
      setActiveIdx(idx);
      trackQuest("listen");
      lineRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
      const p = cast[text.lines[idx].speaker ?? ""];
      speak(text.lines[idx].it, {
        rate: rate * (p?.rateFactor ?? 1),
        pitch: p?.pitch ?? 1,
        voice: p?.voice ?? null,
        lang: activeLang,
        onEnd: () => setTimeout(next, text.cat === "dialoghi" ? 420 : 320),
      });
    };
    setPlaying(true);
    next();
    cancelRef.current = () => { cancelRef.current = null; stopSpeaking(); };
  }, [text.lines, text.cat, rate, trackQuest, cast, activeLang]);

  /* reproducir una sola battuta (con la voz de su personaje) */
  const playLine = useCallback((idx: number) => {
    cancelRef.current?.();
    setLinePlaying(idx);
    setActiveIdx(idx);
    trackQuest("listen");
    const p = cast[text.lines[idx].speaker ?? ""];
    speak(text.lines[idx].it, {
      rate: rate * (p?.rateFactor ?? 1),
      pitch: p?.pitch ?? 1,
      voice: p?.voice ?? null,
      lang: activeLang,
      onEnd: () => { setLinePlaying(null); setActiveIdx(null); },
    });
  }, [text.lines, rate, trackQuest, cast, activeLang]);

  const onFinishQuiz = useCallback((score: number, total: number) => {
    const r = markReadingDone(text.id);
    setResult({ score, total, coins: r.coinsEarned });
    setTimeout(() => lineRefs.current[lineRefs.current.length - 1]?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
  }, [markReadingDone, text.id]);

  if (quizOpen) {
    return (
      <div>
        <button onClick={() => setQuizOpen(false)} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-it transition-colors hover:text-verde">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {u.letture.backToText}
        </button>
        <QuizEngine
          exercises={letturaExercises(text)}
          title={u.letture.comprehension(text.title)}
          kind="prueba"
          label={u.letture.quizLabel(text.title)}
          skill="lettura"
          xpPerCorrect={12}
          onFinish={onFinishQuiz}
        />
        {result && (
          <div className="mt-5 rounded-2xl border border-verde/40 bg-verde-tenue p-5 text-center">
            {/* v9.34 · Pappagallo celebra la lectura completada */}
            <Mascot pose="party" className="mx-auto h-16 w-16" />
            <p className="mt-2 font-display text-lg font-bold">
              {u.letture.completed(result.score, result.total, result.coins)} {result.coins > 0 ? <Coins className="inline h-4 w-4 text-oro" aria-hidden="true" /> : null}
            </p>
            <p className="mt-1 text-sm text-muted-it">{u.letture.afterQuiz}</p>
            <button onClick={() => setQuizOpen(false)} className="mt-3 rounded-xl bg-verde px-5 py-2.5 text-sm font-bold text-white">
              {u.letture.backToText}
            </button>
          </div>
        )}
      </div>
    );
  }

  const isDialogue = text.cat === "dialoghi";

  return (
    <div>
      <button onClick={() => { stopAll(); onBack(); }} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-it transition-colors hover:text-verde">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {u.letture.backToList}
      </button>

      <article className="overflow-hidden rounded-3xl border border-soft bg-surface">
        {LETTURE_IMG[text.id] && (
          <div className="relative">
            <img
              src={LETTURE_IMG[text.id]}
              alt={text.title}
              loading="eager"
              decoding="async"
              className="ita-img aspect-[16/9] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden="true" />
            <div className="absolute bottom-3 left-4 right-4">
              <span className={cn("rounded-full border bg-surface/90 px-2.5 py-1 text-[10px] font-bold uppercase backdrop-blur", CAT_STYLES[text.cat])}>
                {lettureCatsFor(activeLang)[text.cat].emoji} {lettureCatsFor(activeLang)[text.cat].label}
              </span>
            </div>
          </div>
        )}
        <div className="p-5 sm:p-8">
        {/* cabecera */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {!LETTURE_IMG[text.id] && (
              <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase", CAT_STYLES[text.cat])}>
                {lettureCatsFor(activeLang)[text.cat].emoji} {lettureCatsFor(activeLang)[text.cat].label}
              </span>
            )}
            <h2 className="mt-2.5 font-display text-2xl font-semibold sm:text-3xl">{text.title}</h2>
            <p className="mt-1 text-sm italic text-muted-it">
              {text.titleEs} · {u.letture.meta(text.lines.length, isDialogue, text.minutes, text.questions.length)}
            </p>
          </div>
        </div>

        {/* barra del reproductor */}
        <div className="sticky top-2 z-10 mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-verde/25 bg-surface/95 p-3 shadow-sm backdrop-blur">
          {!playing ? (
            <button onClick={() => playFrom(0)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-verde px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-verde/25 transition-all hover:scale-105">
              <Play className="h-4 w-4" aria-hidden="true" /> {u.letture.listenAll}
            </button>
          ) : (
            <button onClick={stopAll} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-rosso px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105">
              <Square className="h-4 w-4" aria-hidden="true" /> {u.letture.stop}
            </button>
          )}
          <div className="flex items-center gap-1" role="group" aria-label={u.letture.speedAria}>
            {RATES.map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                aria-pressed={rate === r}
                className={cn("rounded-lg border-2 px-2.5 py-1.5 text-xs font-bold transition-all", rate === r ? "border-verde bg-verde-tenue text-verde-scuro dark:text-verde" : "border-soft")}
              >
                {r}×
              </button>
            ))}
          </div>
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted-it">
            <input type="checkbox" checked={subs} onChange={(e) => setSubs(e.target.checked)} className="h-4 w-4 accent-[var(--verde)]" />
            {u.letture.subsLabel}
          </label>
        </div>
        {!voiceOk && (
          <p className="mt-2 rounded-xl border border-oro/40 bg-oro-tenue px-4 py-2 text-xs text-oro-scuro dark:text-oro">
            {u.letture.voiceWarning}
          </p>
        )}
        {isDialogue && <VoiceCastNote speakers={speakers} cast={cast} className="mt-2" />}

        {/* párrafos / battute */}
        <div className="mt-6 space-y-3">
          {text.lines.map((l, i) => {
            const active = activeIdx === i;
            return (
              <div
                key={i}
                ref={(el) => { lineRefs.current[i] = el; }}
                onClick={() => playFrom(i)}
                className={cn(
                  "group cursor-pointer rounded-2xl border p-4 transition-all",
                  active
                    ? "border-verde/60 bg-verde-tenue shadow-md"
                    : "border-transparent hover:border-soft hover:bg-crema-scura/60 dark:hover:bg-inchiostro/5"
                )}
              >
                <div className="flex items-start gap-3">
                  {isDialogue && l.speaker ? (
                    <SpeakerAvatar speaker={l.speaker} idx={sIdx[l.speaker] ?? 0} active={active} />
                  ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (active && playing) { stopAll(); }
                      else if (playing) { playFrom(i); }
                      else { playLine(i); }
                    }}
                    aria-label={active ? u.letture.stopPara(i) : u.letture.playPara(i)}
                    className={cn(
                      "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all",
                      active
                        ? "border-verde bg-verde text-white animate-pulse"
                        : "border-verde/30 bg-verde-tenue text-verde-scuro hover:scale-110 dark:text-verde"
                    )}
                  >
                    {(active && playing) || linePlaying === i ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
                  </button>
                  )}
                  <div className="min-w-0 flex-1">
                    {isDialogue && l.speaker && (
                      <div className="flex items-center gap-2">
                        <SpeakerChip speaker={l.speaker} idx={sIdx[l.speaker] ?? 0} active={active} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (active && playing) { stopAll(); }
                            else if (playing) { playFrom(i); }
                            else { playLine(i); }
                          }}
                          aria-label={active ? u.letture.stopLine(l.speaker ?? "") : u.letture.playLine(l.speaker ?? "")}
                          className={cn(
                            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all",
                            active
                              ? "border-verde bg-verde text-white animate-pulse"
                              : "border-verde/30 bg-verde-tenue text-verde-scuro hover:scale-110 dark:text-verde"
                          )}
                        >
                          {(active && playing) || linePlaying === i ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
                        </button>
                      </div>
                    )}
                    <p className={cn("leading-[1.85] transition-colors", active ? "text-lg font-medium text-inchiostro dark:text-surface" : "text-lg")}><HoverWords text={l.it} lang={activeLang} /></p>
                    {subs && <p className="mt-1 text-sm italic text-muted-it">{l.es}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* glosario */}
        <div className="mt-6 rounded-2xl bg-crema-scura p-5 dark:bg-inchiostro/10">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-it">{u.letture.glossary}</p>
          <div className="flex flex-wrap gap-2">
            {text.glossary.map((g, i) => (
              <button
                key={i}
                onClick={() => { trackQuest("listen"); speak(g.it, { rate, lang: activeLang }); }}
                className="group inline-flex items-center gap-1.5 rounded-full border border-verde/25 bg-surface px-3 py-1.5 text-xs font-semibold transition-all hover:border-verde/60"
                title={u.letture.listenPron}
              >
                <Volume2 className="h-3 w-3 text-verde opacity-60 group-hover:opacity-100" aria-hidden="true" />
                <span className="font-display italic">{g.it}</span> · {g.es}
              </button>
            ))}
          </div>
        </div>

        {/* comprensión */}
        <button
          onClick={() => { stopAll(); setQuizOpen(true); }}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-verde px-6 py-3 font-bold text-white shadow-lg shadow-verde/25 transition-all hover:scale-[1.01]"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" /> {u.letture.quizButton(text.questions.length)}
        </button>
        </div>
      </article>

      {/* debate */}
      <section className="mt-6 rounded-3xl border border-oro/30 bg-oro-tenue/50 p-6 dark:bg-oro-tenue/20">
        <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
          <Lightbulb className="h-5 w-5 text-oro-scuro dark:text-oro" aria-hidden="true" /> {u.letture.discussTitle}
        </h3>
        <p className="mt-1.5 text-sm text-muted-it">
          {u.letture.discussIntro}
        </p>
        <div className="mt-4 space-y-2.5">
          {text.discuss.map((d, i) => (
            <div key={i} className="rounded-2xl border border-soft bg-surface p-4">
              <p className="flex gap-2.5 text-base leading-relaxed">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-oro-tenue text-xs font-bold text-oro-scuro dark:text-oro">{i + 1}</span>
                {d.it}
              </p>
              <p className="mt-1 pl-8.5 text-sm italic text-muted-it">{d.es}</p>
              <button
                onClick={() => navigate("tutor", { tutorSeed: tutorFor(activeLang).seedFromReading(d.it, text.level) })}
                className="mt-2.5 ml-8.5 inline-flex min-h-9 items-center gap-1.5 rounded-xl border-2 border-verde/30 bg-verde-tenue px-3.5 py-1.5 text-xs font-bold text-verde-scuro transition-all hover:scale-105 dark:text-verde"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> {u.letture.discussWithTutor}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
