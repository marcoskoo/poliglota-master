"use client";

/* ── Notizie · Radiogiornale per studenti (v9.25 → v9.29) ───────────
   El método VOA Learning English (learningenglish.voanews.com) aplicado
   a la lengua de estudio, con texto y audio:
   1 · palabras clave ANTES de leer («Words in This Story»)
   2 · audio TTS a velocidad reducida, como VOA Special English
   3 · transcripción siempre visible + traducción ES conmutable
   4 · lectura sincronizada FRASE por frase con resaltado y auto-scroll
   5 · clic en cualquier frase para repetirla (sentence-level replay)
   6 · modo «solo audio»: escuchar antes de leer, como en la radio
   7 · quiz de comprensión + debate con el Tutor IA
   v9.28 · TODO el cromo de la vista sale del diccionario ui.news
   (it/en/pt/fr/de): antes estaba hardcodeado en italiano y la sección
   salía en italiano aunque la lengua de estudio fuera otra.
   v9.29 · ilustración por noticia (90 webp en /public/news/): cabecera
   de tarjeta + hero del Reader, como la foto de cabecera de cada
   artículo de VOA. Fallback → emoji de la categoría.                */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Check, ChevronLeft, ChevronRight, Coins, Ear, Headphones, Lightbulb,
  ListFilter, MessageCircle, Mic2, Pause, Play, Radio, Square, Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLms } from "@/lib/lms/store";
import { useUi } from "@/lib/lms/ui";
import { speak, stopSpeaking, onVoices, voicesFor, defaultVoiceFor, prettyVoiceName } from "@/lib/lms/tts";
import { VoiceHint } from "../audio-button";
import { HoverWords } from "../hover-words";
import { QuizEngine } from "../quiz-engine";
import { SpeedControl, useDialogueRate, SPEED_RATES } from "../speed-control";
import {
  NEWS_BY_LANG, NEWS_CATS,
  newsCatLabel, newsExercises, newsSentences, newsWordCount,
  type NewsCat, type NewsItem,
} from "@/lib/lms/news";
import { LANGS } from "@/lib/lms/languages";
import { tutorFor } from "@/lib/lms/tutor-persona";
import type { CefrLevel, LangCode } from "@/lib/lms/types";

const LEVELS: (CefrLevel | "tutti")[] = ["tutti", "A1", "A2", "B1", "B2", "C1", "C2"];

/* v9.47 · la velocidad inicial ya no es el default VOA del nivel: el
   SpeedControl compartido arranca con la preferencia persistente del
   usuario (settings.audioRate) y la recuerda entre noticias y vistas. */

/** «§…§» delimita el segmento que se renderiza en negrita (ui.news.methodIntro). */
function rich(text: string) {
  const p = text.split("§");
  if (p.length !== 3) return text;
  return <>{p[0]}<b>{p[1]}</b>{p[2]}</>;
}

export function NotizieView() {
  const [cat, setCat] = useState<NewsCat | "tutte">("tutte");
  const [level, setLevel] = useState<CefrLevel | "tutti">("tutti");
  const [openId, setOpenId] = useState<string | null>(null);

  const activeLang = (useLms((s) => s.activeLang) ?? "it") as LangCode;
  const readingsRead = useLms((s) => s.readingsRead);
  const u = useUi();
  const langName = LANGS[activeLang].nativeName;

  /* v9.26 · paquete de noticias de la lengua activa (it/en/pt/fr/de) */
  const pool = NEWS_BY_LANG[activeLang] ?? NEWS_BY_LANG.it;
  const texts = useMemo(
    () => pool.filter((t) => (cat === "tutte" || t.cat === cat) && (level === "tutti" || t.level === level)),
    [pool, cat, level]
  );
  const text = openId ? pool.find((n) => n.id === openId) ?? null : null;

  if (text) return <Reader key={text.id} news={text} lang={activeLang} onBack={() => setOpenId(null)} />;

  return (
    <div className="space-y-6">
      <VoiceHint lang={activeLang} />

      {/* método VOA */}
      <section className="overflow-hidden rounded-3xl border-2 border-azzurro/30 bg-gradient-to-br from-azzurro/10 via-crema to-verde-tenue/40 p-5 sm:p-6 dark:via-inchiostro/10 dark:to-verde-tenue/10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-2xl shadow-sm">📻</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold leading-snug">
              {u.news.methodTitle}
              <span className="ml-2 rounded-full bg-azzurro px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-white">A1–C2</span>
              <span className="ml-1.5 rounded-full border border-azzurro/30 bg-azzurro/10 px-2 py-0.5 align-middle text-[10px] font-bold text-azzurro-scuro dark:text-azzurro">
                {LANGS[activeLang].flag} {langName}
              </span>
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-it">
              {rich(u.news.methodIntro(langName))}
            </p>
          </div>
        </div>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {u.news.steps.map((st, i) => ({ n: i + 1, t: st.t, d: st.d(langName) })).map((s) => (
            <li key={s.n} className="rounded-2xl border border-soft bg-surface p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-it">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-azzurro text-white">{s.n}</span>
                {s.t}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-it">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* filtros */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={cat === "tutte"} onClick={() => setCat("tutte")}>{u.news.all}</FilterChip>
        {(Object.keys(NEWS_CATS) as NewsCat[]).map((c) => (
          <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>
            {NEWS_CATS[c].emoji} {newsCatLabel(c, activeLang)}
          </FilterChip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <FilterChip key={l} active={level === l} onClick={() => setLevel(l)} small>
            {l === "tutti" ? u.news.cefr : l}
          </FilterChip>
        ))}
      </div>

      <p className="text-sm text-muted-it">
        <ListFilter className="mr-1 inline h-4 w-4" aria-hidden="true" />
        {u.news.count(texts.length)}
      </p>

      {/* tarjetas */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {texts.map((t, i) => {
          const done = readingsRead.includes(t.id);
          const w = newsWordCount(t);
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setOpenId(t.id)}
              className={cn(
                "group relative overflow-hidden rounded-3xl border-2 border-soft bg-surface text-left transition-all hover:-translate-y-1 hover:border-azzurro/40 hover:shadow-lg",
                done && "border-verde/50"
              )}
            >
              {done && (
                <span className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-verde text-white shadow-md" title={u.news.completed}>
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
              )}
              {/* v9.29 · ilustración de la noticia (estilo VOA) */}
              <div className="relative aspect-[7/4] w-full overflow-hidden">
                <NewsImg
                  id={t.id} alt={t.title} cat={t.cat} eager={i < 3}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-it">
                  {u.news.edition(t.place, t.level)}
                </p>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase", NEWS_CATS[t.cat].chip)}>
                    {NEWS_CATS[t.cat].emoji} {newsCatLabel(t.cat, activeLang)}
                  </span>
                  <span className="rounded-full bg-inchiostro/5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-muted-it dark:bg-inchiostro/15">
                    {t.level}
                  </span>
                </div>
                <p className="mt-3 font-display text-lg font-semibold leading-snug">{t.title}</p>
                <p className="mt-1 text-sm italic text-muted-it">{t.titleEs}</p>
                <p className="mt-2.5 text-xs text-muted-it">
                  {u.news.cardMeta(w, t.minutes, t.questions.length)}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-azzurro-scuro dark:text-azzurro">
                  <Headphones className="h-3.5 w-3.5" aria-hidden="true" /> {u.news.listenCta(SPEED_RATES.length)}
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
        active ? "border-azzurro bg-azzurro text-white shadow-md shadow-azzurro/25" : "border-soft bg-surface hover:border-azzurro/40"
      )}
    >
      {children}
    </button>
  );
}

/* v9.29 · Ilustración de la noticia (/public/news/{id}.webp, 7:4).
   Si el archivo no carga (p. ej. noticia futura sin imagen) cae a un
   cromo degradado con el emoji de la categoría — nunca un broken img. */
function NewsImg({ id, alt, cat, className, eager }: {
  id: string; alt: string; cat: NewsCat; className?: string; eager?: boolean;
}) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-azzurro/15 via-crema-scura/40 to-verde-tenue/60 dark:from-azzurro/10 dark:via-inchiostro/25 dark:to-verde-tenue/15",
          className
        )}
      >
        <span className="text-4xl opacity-80">{NEWS_CATS[cat].emoji}</span>
      </div>
    );
  }
  return (
    <img
      src={`/news/${id}.webp`}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setErr(true)}
      className={cn("bg-crema-scura/40 object-cover dark:bg-inchiostro/20", className)}
    />
  );
}

/* ══════════ READER ════════════════════════════════════════════════ */

function Reader({ news, lang, onBack }: { news: NewsItem; lang: LangCode; onBack: () => void }) {
  const settingsSubs = useLms((s) => s.settings.showSubtitles);
  const trackQuest = useLms((s) => s.trackQuest);
  const markReadingDone = useLms((s) => s.markReadingDone);
  const navigate = useLms((s) => s.navigate);
  const loc = useUi().news; /* v9.28 · cromo del reader en la lengua de estudio */

  /* v9.47 · velocidad unificada con el resto de reproductores (persistente) */
  const [rate, setRate] = useDialogueRate();
  const [subs, setSubs] = useState(settingsSubs);
  const [mode, setMode] = useState<"lettura" | "ascolto">("lettura");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceIdx, setVoiceIdx] = useState(-1); // -1 = voz de sistema

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [linePlaying, setLinePlaying] = useState<number | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; coins: number } | null>(null);

  const cancelRef = useRef<(() => void) | null>(null);
  const sentRefs = useRef<(HTMLSpanElement | null)[]>([]);

  /* frases "planas" + índices por párrafo */
  const flat = useMemo(() => newsSentences(news), [news]);
  const parGroups = useMemo(() => {
    const g: number[][] = news.paragraphs.map(() => []);
    flat.forEach((f, fi) => g[f.p].push(fi));
    return g;
  }, [flat, news]);

  /* pool de voces de la lengua de estudio (selector de locutor) */
  useEffect(() => {
    const upd = () => setVoices(voicesFor(lang));
    upd();
    const off = onVoices(upd);
    return () => { off(); };
  }, [lang]);
  useEffect(() => () => { cancelRef.current?.(); stopSpeaking(); }, []);

  const voice = voiceIdx >= 0 && voices[voiceIdx] ? voices[voiceIdx] : null;
  const defVoice = defaultVoiceFor(lang);
  const voiceLabel = voice
    ? prettyVoiceName(voice, lang)
    : voiceIdx === -1
      ? (defVoice ? prettyVoiceName(defVoice, lang) : loc.systemVoice)
      : loc.systemVoice;

  const stopAll = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    stopSpeaking();
    setPlaying(false);
    setLinePlaying(null);
    setActiveIdx(null);
  }, []);

  /* reproducción continua desde una frase, con resaltado + auto-scroll */
  const playFrom = useCallback((start: number) => {
    cancelRef.current?.();
    let i = start;
    const next = () => {
      if (i >= flat.length) { setPlaying(false); setActiveIdx(null); return; }
      const idx = i;
      i += 1;
      setActiveIdx(idx);
      if (mode === "lettura") sentRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
      speak(flat[idx].text, {
        lang, rate, voice,
        onEnd: () => setTimeout(next, 300),
      });
    };
    setPlaying(true);
    trackQuest("listen");
    next();
    cancelRef.current = () => { cancelRef.current = null; stopSpeaking(); };
  }, [flat, lang, rate, voice, mode, trackQuest]);

  /* reproducir una sola frase (replay) */
  const playSentence = useCallback((idx: number) => {
    cancelRef.current?.();
    setLinePlaying(idx);
    setActiveIdx(idx);
    trackQuest("listen");
    speak(flat[idx].text, { lang, rate, voice, onEnd: () => { setLinePlaying(null); setActiveIdx(null); } });
  }, [flat, lang, rate, voice, trackQuest]);

  const toggleSentence = useCallback((fi: number) => {
    if (activeIdx === fi && (playing || linePlaying === fi)) { stopAll(); return; }
    if (playing) { playFrom(fi); return; }
    playSentence(fi);
  }, [activeIdx, playing, linePlaying, playFrom, playSentence, stopAll]);

  /* salto de frase (⏮ / ⏭) */
  const step = useCallback((d: number) => {
    const cur = activeIdx ?? 0;
    const t = Math.min(Math.max(cur + d, 0), flat.length - 1);
    if (playing) playFrom(t);
    else playSentence(t);
  }, [activeIdx, flat.length, playing, playFrom, playSentence]);

  const onFinishQuiz = useCallback((score: number, total: number) => {
    const r = markReadingDone(news.id);
    setResult({ score, total, coins: r.coinsEarned });
  }, [markReadingDone, news.id]);

  if (quizOpen) {
    return (
      <div>
        <button onClick={() => setQuizOpen(false)} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-it transition-colors hover:text-verde">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {loc.backToNews}
        </button>
        <QuizEngine
          exercises={newsExercises(news)}
          title={loc.quizTitle(news.title)}
          kind="prueba"
          label={loc.quizLabel(news.title)}
          skill="lettura"
          xpPerCorrect={12}
          onFinish={onFinishQuiz}
        />
        {result && (
          <div className="mt-5 rounded-2xl border border-verde/40 bg-verde-tenue p-5 text-center">
            <p className="font-display text-lg font-bold">
              {loc.quizDone(result.score, result.total)} {result.coins > 0 ? <>+{result.coins} <Coins className="inline h-4 w-4 text-oro" aria-hidden="true" /></> : null}
            </p>
            <p className="mt-1 text-sm text-muted-it">{loc.quizDoneSub}</p>
            <button onClick={() => setQuizOpen(false)} className="mt-3 rounded-xl bg-verde px-5 py-2.5 text-sm font-bold text-white">
              {loc.backToNews}
            </button>
          </div>
        )}
      </div>
    );
  }

  const progIdx = activeIdx !== null && playing ? activeIdx : linePlaying;
  const progress = progIdx !== null ? ((progIdx + 1) / flat.length) * 100 : 0;
  const catInfo = NEWS_CATS[news.cat];
  const catLbl = newsCatLabel(news.cat, lang);

  return (
    <div>
      <button onClick={() => { stopAll(); onBack(); }} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-it transition-colors hover:text-azzurro">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {loc.backToAll}
      </button>

      <article className="overflow-hidden rounded-3xl border border-soft bg-surface">
        <div className="p-5 sm:p-8">
          {/* cabecera estilo noticia */}
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-it">
            {loc.dateline(news.place, news.level)}
          </p>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase", catInfo.chip)}>
              {catInfo.emoji} {catLbl}
            </span>
            <span className="rounded-full bg-inchiostro/5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-muted-it dark:bg-inchiostro/15">
              {news.level} · {news.minutes} min
            </span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold leading-tight sm:text-3xl">{news.title}</h2>
          <p className="mt-1 text-sm italic text-muted-it">{news.titleEs}</p>

          {/* v9.29 · ilustración de cabecera (estilo VOA: foto sobre el texto) */}
          <NewsImg
            id={news.id} alt={news.title} cat={news.cat} eager
            className="mt-5 aspect-[7/4] w-full rounded-2xl border border-soft object-cover"
          />

          {/* entradilla */}
          <p className="mt-4 border-l-4 border-azzurro/50 pl-4 text-base font-medium leading-relaxed text-inchiostro dark:text-surface">
            {news.lead.it}
          </p>
          {subs && <p className="mt-1.5 border-l-4 border-transparent pl-4 text-sm italic text-muted-it">{news.lead.es}</p>}

          {/* palabras clave ANTES del texto (método VOA: Words in This Story) */}
          <div className="mt-5 rounded-2xl border border-oro/35 bg-oro-tenue/60 p-5 dark:bg-oro-tenue/20">
            <p className="text-xs font-bold uppercase tracking-widest text-oro-scuro dark:text-oro">
              {loc.wordsTitle}
            </p>
            <p className="mt-1 text-xs text-muted-it">{loc.wordsIntro}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {news.words.map((w, i) => (
                <button
                  key={i}
                  onClick={() => { trackQuest("listen"); speak(w.it, { lang, rate }); }}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-oro/40 bg-surface px-3 py-1.5 text-xs font-semibold transition-all hover:border-oro hover:scale-105"
                  title={loc.wordTip}
                >
                  <Volume2 className="h-3 w-3 text-oro-scuro opacity-70 group-hover:opacity-100 dark:text-oro" aria-hidden="true" />
                  <span className="font-display italic">{w.it}</span>
                  <span className="text-muted-it">· {w.es}{w.note ? ` (${w.note})` : ""}</span>
                </button>
              ))}
            </div>
          </div>

          {/* barra del reproductor (sticky) */}
          <div className="sticky top-2 z-10 mt-5 rounded-2xl border border-azzurro/25 bg-surface/95 p-3 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              {!playing ? (
                <button onClick={() => playFrom(0)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-azzurro px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-azzurro/25 transition-all hover:scale-105">
                  <Play className="h-4 w-4" aria-hidden="true" /> {loc.playAll}
                </button>
              ) : (
                <button onClick={stopAll} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-rosso px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105">
                  <Square className="h-4 w-4" aria-hidden="true" /> {loc.stop}
                </button>
              )}
              <div className="flex items-center">
                <button onClick={() => step(-1)} aria-label={loc.prevSentence} className="inline-flex h-11 w-9 items-center justify-center rounded-l-xl border-2 border-r-0 border-soft transition-colors hover:border-azzurro/50 hover:text-azzurro">
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button onClick={() => step(1)} aria-label={loc.nextSentence} className="inline-flex h-11 w-9 items-center justify-center rounded-r-xl border-2 border-soft transition-colors hover:border-azzurro/50 hover:text-azzurro">
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {/* v9.47 · SpeedControl compartido (tone azzurro del Radiogiornale) */}
              <SpeedControl value={rate} onChange={setRate} tone="azzurro" />
              <button
                onClick={() => setVoiceIdx((v) => { const nv = v + 1; return nv >= voices.length ? -1 : nv; })}
                title={loc.voiceChange}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-soft px-3 py-2 text-xs font-bold transition-all hover:border-azzurro/50"
              >
                <Mic2 className="h-3.5 w-3.5 text-azzurro-scuro dark:text-azzurro" aria-hidden="true" /> {loc.voicePrefix} {voiceLabel}
              </button>
              <button
                onClick={() => setMode(mode === "lettura" ? "ascolto" : "lettura")}
                aria-pressed={mode === "ascolto"}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all",
                  mode === "ascolto" ? "border-azzurro bg-azzurro text-white shadow-md shadow-azzurro/25" : "border-soft hover:border-azzurro/50"
                )}
                title={loc.soloAudioTip}
              >
                <Ear className="h-3.5 w-3.5" aria-hidden="true" /> {loc.soloAudio}
              </button>
              <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted-it">
                <input type="checkbox" checked={subs} onChange={(e) => setSubs(e.target.checked)} className="h-4 w-4 accent-[var(--azzurro)]" />
                {loc.subsEs}
              </label>
            </div>
            <p className="mt-2 px-1 font-mono text-[10px] uppercase tracking-wider text-muted-it">
              {loc.playerStatus(
                `${rate}×`,
                flat.length,
                mode === "ascolto"
              )}
            </p>
          </div>

          {/* cuerpo: modo ascolto (solo audio) o lettura (transcripción) */}
          {mode === "ascolto" ? (
            <div className="mt-6 rounded-2xl border-2 border-dashed border-azzurro/40 bg-azzurro/5 p-6 text-center sm:p-10">
              <Radio className={cn("mx-auto h-10 w-10 text-azzurro-scuro dark:text-azzurro", playing && "animate-pulse")} aria-hidden="true" />
              <p className="mt-3 font-display text-lg font-bold">
                {playing
                  ? <>{loc.listening((activeIdx ?? 0) + 1, flat.length)}</>
                  : linePlaying !== null
                    ? <>{loc.sentenceOf(linePlaying + 1, flat.length)}</>
                    : <>{loc.soloIntro}</>}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-it">
                {loc.soloDesc}
              </p>
              <div className="mx-auto mt-4 h-2 w-full max-w-sm overflow-hidden rounded-full bg-inchiostro/10 dark:bg-inchiostro/20" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-azzurro transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <button onClick={() => setMode("lettura")} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-azzurro px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-azzurro/25 transition-all hover:scale-105">
                <BookOpen className="h-4 w-4" aria-hidden="true" /> {loc.revealText}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {news.paragraphs.map((par, p) => (
                <div key={p} className="group">
                  <p className="text-lg leading-[1.95]">
                    {parGroups[p].map((fi) => {
                      const active = activeIdx === fi;
                      return (
                        <span
                          key={fi}
                          ref={(el) => { sentRefs.current[fi] = el; }}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleSentence(fi)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSentence(fi); } }}
                          aria-label={loc.sentenceAria(fi + 1)}
                          className={cn(
                            "cursor-pointer rounded-sm transition-colors",
                            active
                              ? "bg-verde-tenue px-1 font-medium text-inchiostro underline decoration-azzurro decoration-2 underline-offset-4 dark:text-surface"
                              : "hover:bg-crema-scura/70 dark:hover:bg-inchiostro/10"
                          )}
                        >
                          <HoverWords text={flat[fi].text} />{" "}
                        </span>
                      );
                    })}
                  </p>
                  {subs && <p className="mt-1 text-sm italic leading-relaxed text-muted-it">{par.es}</p>}
                </div>
              ))}
              <p className="pt-1 text-center text-xs text-muted-it">
                <Ear className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                {loc.sentenceHint}
              </p>
            </div>
          )}

          {/* comprensión */}
          <button
            onClick={() => { stopAll(); setQuizOpen(true); }}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-azzurro px-6 py-3 font-bold text-white shadow-lg shadow-azzurro/25 transition-all hover:scale-[1.01]"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" /> {loc.answerCta(news.questions.length)}
          </button>

          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-wider text-muted-it">
            {loc.footerNote(news.level)}
          </p>
        </div>
      </article>

      {/* debate */}
      <section className="mt-6 rounded-3xl border border-oro/30 bg-oro-tenue/50 p-6 dark:bg-oro-tenue/20">
        <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
          <Lightbulb className="h-5 w-5 text-oro-scuro dark:text-oro" aria-hidden="true" /> {loc.discussTitle}
        </h3>
        <p className="mt-1.5 text-sm text-muted-it">
          {loc.discussIntro}
        </p>
        <div className="mt-4 space-y-2.5">
          {news.discuss.map((d, i) => (
            <div key={i} className="rounded-2xl border border-soft bg-surface p-4">
              <p className="flex gap-2.5 text-base leading-relaxed">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-oro-tenue text-xs font-bold text-oro-scuro dark:text-oro">{i + 1}</span>
                {d.it}
              </p>
              <p className="mt-1 pl-8.5 text-sm italic text-muted-it">{d.es}</p>
              <button
                onClick={() => navigate("tutor", {
                  tutorSeed: tutorFor(lang).seedFromReading(d.it, news.level),
                })}
                className="mt-2.5 ml-8.5 inline-flex min-h-9 items-center gap-1.5 rounded-xl border-2 border-azzurro/30 bg-azzurro/10 px-3.5 py-1.5 text-xs font-bold text-azzurro-scuro transition-all hover:scale-105 dark:text-azzurro"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> {loc.discussCta}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
