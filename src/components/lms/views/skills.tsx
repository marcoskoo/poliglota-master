"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Check, Languages, PenLine, Play, RotateCcw, Sparkles, Square, Volume2,
} from "lucide-react";
import { listeningFor, listeningImgFor, readingsFor, readingImgFor, writingsFor, writingImgFor, conversationFor, conversationImgFor } from "@/lib/lms/lang-extras";
import { ImgWithFallback } from "../theme-img";
import { getExercises } from "@/lib/lms/exercises";
import { CEFR_LEVELS, type CefrLevel } from "@/lib/lms/types";
import { useLms } from "@/lib/lms/store";
import { speak, stopSpeaking, speakDialogue } from "@/lib/lms/tts";
import { useVoiceCast, SpeakerAvatar, SpeakerChip, VoiceCastNote, DialogueLineButton, speakerIndexMap, uniqueSpeakers } from "../voice-cast";
import { SpeedControl, useDialogueRate } from "../speed-control";
import { PLANS, todayUsage, planLimits } from "@/lib/lms/plans";
import { QuizEngine } from "../quiz-engine";
import { StepReveal } from "../step-reveal";
import { AudioButton, VoiceHint } from "../audio-button";
import { cn } from "@/lib/utils";

/* ════════ Vista: ESCUCHA (Ascolto) ════════ */

export function ListeningView() {
  const activeLang = (useLms((s) => s.activeLang) ?? "it") as import("@/lib/lms/types").LangCode;
  const LISTENING = useMemo(() => listeningFor(activeLang), [activeLang]);
  const LISTENING_IMG = useMemo(() => listeningImgFor(activeLang), [activeLang]);
  const [levelFilter, setLevelFilter] = useState<CefrLevel | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  /* v9.46 · velocidad de lectura unificada y persistente (diálogos + palabras) */
  const [speed, setSpeed] = useDialogueRate();
  const showSubs = useLms((s) => s.settings.showSubtitles);

  const tasks = useMemo(() => LISTENING.filter((t) => levelFilter === "all" || t.level === levelFilter), [LISTENING, levelFilter]);
  const task = LISTENING.find((t) => t.id === openId);

  /* reparto de voces por personaje (v9.1): cada hablante con su propia voz TTS */
  const cast = useVoiceCast(task?.dialogue ?? []);
  const speakers = useMemo(() => uniqueSpeakers(task?.dialogue ?? []), [task]);
  const sIdx = useMemo(() => speakerIndexMap((task?.dialogue ?? []).map((d) => d.speaker)), [task]);

  const playAll = (lines: { it: string; speaker?: string }[], rate: number) => {
    stopSpeaking();
    return speakDialogue(lines, cast, { rate, lang: activeLang, onIndex: (i) => setPlaying(i), onDone: () => setPlaying(null) });
  };

  if (task && quizOpen) {
    const exercises = getExercises(task.questions);
    return (
      <div>
        <button onClick={() => setQuizOpen(false)} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-it transition-colors hover:text-verde">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Torna all'ascolto
        </button>
        <QuizEngine exercises={exercises} title={`Comprensione · ${task.title}`} kind="prueba" label={`Escucha: ${task.title}`} skill="ascolto" xpPerCorrect={15} />
      </div>
    );
  }

  if (task) {
    return (
      <div>
        <button onClick={() => { stopSpeaking(); setOpenId(null); setPlaying(null); }} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-it transition-colors hover:text-verde">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Tutti gli ascolti
        </button>

        <div className="overflow-hidden rounded-3xl border border-soft bg-surface">
          {LISTENING_IMG[task.id] && (
            <ImgWithFallback src={LISTENING_IMG[task.id]} emoji="🎧" className="aspect-[16/9] w-full object-cover" eager />
          )}
          <div className="p-6 sm:p-8">
          <VoiceHint />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">{task.title}</h2>
            {/* v9.46 · presets unificados con el resto de reproductores de diálogo */}
            <SpeedControl value={speed} onChange={setSpeed} />
          </div>

          {/* palabras sueltas */}
          {task.kind === "parole" || task.kind === "dictato" ? (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {(task.words ?? []).map((w, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => speak(w, { rate: speed, lang: activeLang })}
                  className="flex min-h-12 items-center justify-between rounded-2xl border-2 border-soft bg-crema px-4 py-3 text-left font-medium transition-all hover:border-verde/50 hover:scale-[1.01]"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-verde-tenue font-mono text-xs font-bold text-verde-scuro dark:text-verde">{i + 1}</span>
                    {task.kind === "dictato" ? `Parola/frase ${i + 1}` : "🔊 ascolta"}
                  </span>
                  <Volume2 className="h-4 w-4 text-verde" aria-hidden="true" />
                </motion.button>
              ))}
            </div>
          ) : (
            /* diálogo con voces por personaje */
            <div className="mt-6 space-y-2.5">
              <VoiceCastNote speakers={speakers} cast={cast} className="mb-3" />
              {task.dialogue?.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border-2 p-4 transition-all",
                    playing === i ? "border-verde bg-verde-tenue" : "border-soft bg-crema"
                  )}
                >
                  {line.speaker && <SpeakerAvatar speaker={line.speaker} idx={sIdx[line.speaker] ?? 0} active={playing === i} />}
                  <div className="min-w-0 flex-1">
                    {line.speaker && <SpeakerChip speaker={line.speaker} idx={sIdx[line.speaker] ?? 0} active={playing === i} />}
                    <p className="mt-1 font-display text-lg leading-snug">{line.it}</p>
                    {showSubs && playing === null && <p className="mt-1 text-sm text-muted-it">{line.es}</p>}
                    {showSubs && <p className={cn("mt-1 text-sm transition-opacity", playing === i ? "text-muted-it opacity-100" : "hidden")}>{line.es}</p>}
                  </div>
                  <DialogueLineButton line={line} cast={cast} rate={speed} className="mt-1" />
                </div>
              ))}
            </div>
          )}

          {/* controles */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {task.dialogue && (
              <button
                onClick={() => playing === null ? playAll(task.dialogue!, speed) : (stopSpeaking(), setPlaying(null))}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-verde px-6 py-3 font-bold text-white shadow-lg shadow-verde/25 transition-all hover:scale-[1.03]"
              >
                {playing === null ? <><Play className="h-4 w-4" aria-hidden="true" /> Riproduci tutto</> : <><Square className="h-4 w-4" aria-hidden="true" /> Stop</>}
              </button>
            )}
            <button
              onClick={() => setQuizOpen(true)}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-inchiostro/15 px-6 py-3 font-bold transition-all hover:border-verde/40"
            >
              <Check className="h-4 w-4" aria-hidden="true" /> Comprensione ({task.questions.length} domande)
            </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VoiceHint />
      <div className="flex flex-wrap gap-2">
        <LevelFilter value={levelFilter} onChange={setLevelFilter} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setOpenId(t.id)}
            className="group relative overflow-hidden rounded-3xl border-2 border-soft bg-surface text-left transition-all hover:-translate-y-1 hover:border-verde/40 hover:shadow-lg"
          >
            {LISTENING_IMG[t.id] ? (
              <ImgWithFallback
                src={LISTENING_IMG[t.id]}
                emoji="🎧"
                className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div aria-hidden="true" className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-azzurro/15 via-crema-scura/40 to-verde-tenue/60 dark:from-azzurro/10 dark:via-inchiostro/25 dark:to-verde-tenue/15">
                <span className="text-4xl opacity-80">🎧</span>
              </div>
            )}
            <span className="absolute right-3 top-3 rounded-full bg-inchiostro/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-white backdrop-blur-sm">{t.level}</span>
            <div className="p-5">
              <p className="font-display text-lg font-semibold">{t.title}</p>
              <p className="mt-1 text-xs text-muted-it">
                {t.kind === "dialogo" ? `${t.dialogue?.length ?? 0} battute di dialogo` : t.kind === "dictato" ? "dettato" : `${t.words?.length ?? 0} parole`} · {t.questions.length} domande
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ════════ Vista: LECTURA (Lettura) ════════ */

export function ReadingView() {
  const activeLang = (useLms((s) => s.activeLang) ?? "it") as import("@/lib/lms/types").LangCode;
  const READINGS = useMemo(() => readingsFor(activeLang), [activeLang]);
  const READING_IMG = useMemo(() => readingImgFor(activeLang), [activeLang]);
  const [levelFilter, setLevelFilter] = useState<CefrLevel | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const plan = useLms((s) => s.plan);
  const navigate = useLms((s) => s.navigate);
  const exclusiveOk = planLimits(plan).exclusiveContent;

  const texts = useMemo(() => READINGS.filter((t) => levelFilter === "all" || t.level === levelFilter), [READINGS, levelFilter]);
  const text = READINGS.find((t) => t.id === openId);

  if (text && quizOpen) {
    const exercises = getExercises(text.questions);
    return (
      <div>
        <button onClick={() => setQuizOpen(false)} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-it transition-colors hover:text-verde">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Torna al testo
        </button>
        <QuizEngine exercises={exercises} title={`Comprensione · ${text.title}`} kind="prueba" label={`Lectura: ${text.title}`} skill="lettura" xpPerCorrect={15} />
      </div>
    );
  }

  if (text) {
    return (
      <div>
        <button onClick={() => setOpenId(null)} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-it transition-colors hover:text-verde">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Tutte le letture
        </button>
        <article className="overflow-hidden rounded-3xl border border-soft bg-surface">
          {READING_IMG[text.id] && (
            <ImgWithFallback src={READING_IMG[text.id]} emoji="📖" className="aspect-[16/9] w-full object-cover" eager />
          )}
          <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">{text.title}</h2>
              <p className="mt-1 font-mono text-xs italic text-muted-it">{text.titleIt} · {text.genre} · {text.minutes} min · {text.level}</p>
            </div>
            <AudioButton text={text.paragraphs.map((p) => p.it).join(" ")} variant="full" label="Leggi ad alta voce" />
          </div>

          <div className="mt-6 space-y-4">
            {text.paragraphs.map((p, i) => (
              <div key={i}>
                <p className="text-lg leading-[1.85]">{p.it}</p>
                <p className="mt-1 text-sm italic text-muted-it">{p.es}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-crema-scura p-5 dark:bg-inchiostro/10">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-it">Glossario</p>
            <div className="flex flex-wrap gap-2">
              {text.glossary.map((g, i) => (
                <span key={i} className="rounded-full border border-verde/25 bg-surface px-3 py-1.5 text-xs font-semibold">
                  <span className="font-display italic">{g.it}</span> · {g.es}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setQuizOpen(true)}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-verde px-6 py-3 font-bold text-white shadow-lg shadow-verde/25 transition-all hover:scale-[1.01]"
          >
            <Check className="h-4 w-4" aria-hidden="true" /> Rispondi alle domande ({text.questions.length})
          </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <LevelFilter value={levelFilter} onChange={setLevelFilter} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {texts.map((t, i) => {
          const exclusive = t.level === "B2" || t.level === "C1";
          const locked = exclusive && !exclusiveOk;
          return (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => (locked ? navigate("piani") : setOpenId(t.id))}
            className={cn(
              "group relative overflow-hidden rounded-3xl border-2 text-left transition-all",
              locked
                ? "border-dashed border-oro/50 bg-oro-tenue/25 dark:bg-oro-tenue/10"
                : "border-soft bg-surface hover:-translate-y-1 hover:border-verde/40 hover:shadow-lg"
            )}
          >
            {locked && (
              <span className="absolute right-3.5 top-3.5 z-10 inline-flex items-center gap-1 rounded-full plan-gold-bg px-2 py-0.5 text-[9px] font-bold text-white shadow">
                🔒 PREMIUM
              </span>
            )}
            {READING_IMG[t.id] && (
              <ImgWithFallback
                src={READING_IMG[t.id]}
                emoji="📖"
                className={cn("aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105", locked && "opacity-60")}
              />
            )}
            <span className={cn("absolute left-3 top-3 z-10 rounded-full bg-inchiostro/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-white backdrop-blur-sm", locked && "opacity-80")}>{t.level}</span>
            <div className="p-5">
              <p className={cn("font-display text-lg font-semibold leading-snug", locked && "opacity-70")}>{t.title}</p>
              <p className="mt-1 text-xs text-muted-it">{locked ? "🔒 Lettura esclusiva PREMIUM" : `${t.genre} · ${t.minutes} min · ${t.questions.length} domande`}</p>
            </div>
          </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ════════ Vista: ESCRITURA (Scrittura) ════════ */

export function WritingView() {
  const activeLang = (useLms((s) => s.activeLang) ?? "it") as import("@/lib/lms/types").LangCode;
  const WRITINGS = useMemo(() => writingsFor(activeLang), [activeLang]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const saveWriting = useLms((s) => s.saveWriting);
  const addXp = useLms((s) => s.addXp);
  const level = useLms((s) => s.level);
  const userName = useLms((s) => s.userName);
  const plan = useLms((s) => s.plan);
  const writingCount = useLms((s) => s.writingCount);
  const writingCountDate = useLms((s) => s.writingCountDate);
  const incrementWriting = useLms((s) => s.incrementWriting);

  const wLimit = planLimits(plan).writingPerDay;
  const wUsed = todayUsage(writingCount, writingCountDate);
  const wBlocked = wLimit >= 0 && wUsed >= wLimit;

  const prompts = WRITINGS;
  const prompt = WRITINGS.find((p) => p.id === openId);
  /* v9.40 · foto realista por ejercicio de escritura (5 lenguas) */
  const WRITING_IMG = useMemo(() => writingImgFor(activeLang), [activeLang]);

  const correct = async () => {
    if (!prompt || text.trim().split(/\s+/).length < 5 || wBlocked) return;
    setLoading(true);
    setAiFeedback(null);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Corrige este texto de escritura (${prompt.title}): "${text}"` }],
          level: prompt.level,
          mode: "correct",
          userName,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setAiFeedback(data.reply);
        incrementWriting();
        addXp(20, "scrittura");
        saveWriting({ id: `${Date.now()}`, title: prompt.title, text, feedback: data.reply.slice(0, 400), date: new Date().toISOString() });
      } else {
        setAiFeedback(`⚠️ ${data.error ?? "Error del tutor"}`);
      }
    } catch {
      setAiFeedback("⚠️ No se pudo conectar con el tutor. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (prompt) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return (
      <div>
        <button onClick={() => { setOpenId(null); setText(""); setAiFeedback(null); setShowModel(false); }} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-it transition-colors hover:text-verde">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Tutte le proposte
        </button>

        <div className="overflow-hidden rounded-3xl border border-soft bg-surface">
          {WRITING_IMG[prompt.id] && (
            <ImgWithFallback src={WRITING_IMG[prompt.id]} emoji="✍️" className="aspect-[16/9] w-full object-cover" eager />
          )}
          <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-semibold">{prompt.title}</h2>
            <span className="rounded-full bg-inchiostro/5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-muted-it dark:bg-inchiostro/15">
              {prompt.level} · min. {prompt.minWords} parole
            </span>
          </div>
          <p className="mt-3 rounded-2xl bg-verde-tenue/70 p-4 leading-relaxed dark:bg-verde-tenue/30">✍️ {prompt.task}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {prompt.tips.map((tip, i) => (
              <span key={i} className="rounded-full border border-oro/30 bg-oro-tenue px-3 py-1.5 text-xs font-semibold text-oro-scuro dark:text-oro">💡 {tip}</span>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Scrivi qui il tuo testo in italiano…"
            aria-label="Tu texto en italiano"
            className="mt-5 w-full rounded-2xl border-2 border-soft bg-crema p-4 text-base leading-relaxed outline-none transition-colors focus:border-verde"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-it">
            <span>{words} parole {words >= prompt.minWords ? "✓" : `(obiettivo: ${prompt.minWords})`}</span>
            <span className={cn("font-bold", wLimit < 0 ? "text-verde-scuro dark:text-verde" : wBlocked ? "text-rosso" : "text-muted-it")}>
              {wLimit < 0 ? "Correzioni IA ∞" : `Correzioni IA oggi: ${wUsed}/${wLimit}`}
            </span>
          </div>

          {wBlocked && (
            <div className="mt-4 rounded-2xl border-2 border-oro/45 bg-oro-tenue p-4 text-center text-sm leading-relaxed dark:bg-oro-tenue/20">
              🔒 Limite giornaliero di correzioni raggiunto ({PLANS[plan].name}).
              Con PREMIUM e PLATINUM le correzioni sono <strong>illimitate</strong>.
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={correct}
              disabled={loading || words < 5 || wBlocked}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-verde px-6 py-3 font-bold text-white shadow-lg shadow-verde/25 transition-all hover:scale-[1.03] disabled:opacity-40"
            >
              {loading ? <><RotateCcw className="h-4 w-4 animate-spin" aria-hidden="true" /> Il tutor sta correggendo…</> : <><Sparkles className="h-4 w-4" aria-hidden="true" /> Correggi con il Tutor IA (+20 XP)</>}
            </button>
            <button
              onClick={() => setShowModel(!showModel)}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-inchiostro/15 px-6 py-3 font-bold transition-all hover:border-verde/40"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" /> {showModel ? "Nascondi" : "Vedi"} il modello
            </button>
          </div>

          {aiFeedback && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 whitespace-pre-wrap rounded-2xl border border-verde/30 bg-verde-tenue/60 p-5 text-sm leading-relaxed dark:bg-verde-tenue/25">
              {aiFeedback}
            </motion.div>
          )}

          {showModel && (
            <div className="mt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-it">Testo modello · revelado línea a línea</p>
              <StepReveal title="Come lo scriverebbe un italophone" steps={prompt.model} accent="oro" compact />
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-crema-scura p-5 dark:bg-inchiostro/10">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-widest text-muted-it">Autovalutazione</p>
            <ul className="space-y-1.5">
              {prompt.checklist.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-verde" aria-hidden="true" />{c}</li>
              ))}
            </ul>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {prompts.map((p, i) => (
        <motion.button
          key={p.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => setOpenId(p.id)}
          className="group overflow-hidden rounded-3xl border-2 border-soft bg-surface text-left transition-all hover:-translate-y-1 hover:border-verde/40 hover:shadow-lg"
        >
          {WRITING_IMG[p.id] && (
            <ImgWithFallback src={WRITING_IMG[p.id]} emoji="✍️" className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          )}
          <div className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
              <PenLine className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="rounded-full bg-inchiostro/5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-muted-it dark:bg-inchiostro/15">{p.level}</span>
          </div>
          <p className="mt-3.5 font-display text-lg font-semibold">{p.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-it">{p.task}</p>
          <p className="mt-2 text-xs text-muted-it">min. {p.minWords} parole · corrección IA</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/* ════════ Vista: CONVERSACIÓN ════════ */

export function ConversationView() {
  const activeLang = (useLms((s) => s.activeLang) ?? "it") as import("@/lib/lms/types").LangCode;
  const CONVERSATION_SCENARIOS = useMemo(() => conversationFor(activeLang), [activeLang]);
  const CONVERSATION_IMG = useMemo(() => conversationImgFor(activeLang), [activeLang]);
  const navigate = useLms((s) => s.navigate);
  const level = useLms((s) => s.level);
  const plan = useLms((s) => s.plan);
  const exclusiveOk = planLimits(plan).exclusiveContent;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-verde/30 bg-gradient-to-br from-verde-tenue to-surface p-6 dark:from-verde-tenue/30">
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
          <Languages className="h-6 w-6 text-verde" aria-hidden="true" /> Parliamo!
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-it">
          Escenarios reales de conversación: frases útiles con audio, consejos culturales y práctica
          guiada con el Tutor IA. Cada escenario está calibrado a un nivel MCER
          {level ? ` (tu nivel actual: ${level})` : ""}.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONVERSATION_SCENARIOS.map((s, i) => {
          const exclusive = s.level === "B1" || s.level === "B2";
          const locked = exclusive && !exclusiveOk;
          return (
          <motion.article
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "relative flex min-w-0 flex-col rounded-3xl border-2 p-5",
              locked ? "border-dashed border-oro/50 bg-oro-tenue/25 dark:bg-oro-tenue/10" : "border-soft bg-surface"
            )}
          >
            {locked && (
              <span className="absolute right-3.5 top-3.5 z-10 inline-flex items-center gap-1 rounded-full plan-gold-bg px-2 py-0.5 text-[9px] font-bold text-white shadow">
                🔒 PREMIUM
              </span>
            )}
            <div className={cn("flex items-center justify-between", locked && "opacity-60")}>
              {CONVERSATION_IMG[s.id] && (
                <ImgWithFallback src={CONVERSATION_IMG[s.id]} emoji={s.emoji ?? "💬"} className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
              )}
              <span className="rounded-full bg-inchiostro/5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-muted-it dark:bg-inchiostro/15">{s.level}</span>
            </div>
            <h3 className={cn("mt-3 font-display text-lg font-semibold", locked && "opacity-70")}>{s.title}</h3>

            {locked ? (
              <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-oro/30 bg-surface/60 p-4 text-center dark:bg-inchiostro/10">
                <p className="text-sm font-bold text-oro-scuro dark:text-oro">Scenario esclusivo PREMIUM</p>
                <p className="text-xs leading-relaxed text-muted-it">Colloquio di lavoro e dibattito: le conversazioni avanzate che preparano a B2–C1.</p>
                <button
                  onClick={() => navigate("piani")}
                  className="mt-1 inline-flex min-h-10 items-center gap-1.5 rounded-xl plan-gold-bg px-4 py-2 text-xs font-bold text-white shadow-md shadow-oro/30 transition-all hover:scale-105"
                >
                  🔒 Sblocca con PREMIUM
                </button>
              </div>
            ) : (
              <>
            <div className="mt-3 space-y-2">
              {s.phrases.slice(0, 3).map((p, j) => (
                <div key={j} className="flex items-start gap-2 rounded-xl bg-crema-scura p-2.5 dark:bg-inchiostro/10">
                  <AudioButton text={p.it} size="sm" className="!h-6 !w-6" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.it}</p>
                    <p className="truncate text-xs text-muted-it">{p.es}</p>
                  </div>
                </div>
              ))}
              {s.phrases.length > 3 && <p className="text-center text-xs text-muted-it">+{s.phrases.length - 3} frasi più…</p>}
            </div>

            <ul className="mt-3 space-y-1">
              {s.tips.slice(0, 2).map((tip, j) => (
                <li key={j} className="text-xs leading-relaxed text-muted-it">💡 {tip}</li>
              ))}
            </ul>

            <button
              onClick={() => navigate("tutor", { tutorSeed: s.tutorSeed })}
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-verde px-4 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02] dark:text-inchiostro"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" /> Pratica con Marco
            </button>
              </>
            )}
          </motion.article>
          );
        })}
      </div>
    </div>
  );
}

/* ── filtro de nivel reutilizable ── */
function LevelFilter({ value, onChange }: { value: CefrLevel | "all"; onChange: (v: CefrLevel | "all") => void }) {
  return (
    <>
      {(["all", ...CEFR_LEVELS] as const).map((lv) => (
        <button
          key={lv}
          onClick={() => onChange(lv)}
          aria-pressed={value === lv}
          className={cn(
            "min-h-10 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all",
            value === lv ? "border-verde bg-verde-tenue text-verde-scuro dark:text-verde" : "border-soft bg-surface text-muted-it hover:border-verde/40"
          )}
        >
          {lv === "all" ? "Tutti" : lv}
        </button>
      ))}
    </>
  );
}
