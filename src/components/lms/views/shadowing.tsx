"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, ChevronLeft, ChevronRight, Circle, Lightbulb, Mic, Pause, Play,
  Rabbit, RotateCcw, Square, Timer, Turtle, Volume2, XCircle,
} from "lucide-react";
import { useLms } from "@/lib/lms/store";
import { AudioButton } from "../audio-button";
import { Mascot } from "../mascot";
import { cn } from "@/lib/utils";
import { scoreSpeech, shadowVerdict, type ShadowScore } from "@/lib/lms/shadowing";
import { shadowPhrasesFor, ORAL_TASKS_IT_ONLY as ORAL_TASKS } from "@/lib/lms/lang-extras";
import { CEFR_LEVELS, LEVEL_LABELS, type CefrLevel } from "@/lib/lms/types";
import { speak } from "@/lib/lms/tts";
import { SpeedControl, useDialogueRate } from "../speed-control";

/* ── Tipos mínimos para Web Speech API (no están en lib.dom) ─────── */
interface SRAlternative { transcript: string; confidence: number; }
interface SRResult { 0: SRAlternative; isFinal: boolean; length: number; }
interface SREvent { resultIndex: number; results: { length: number; [i: number]: SRResult }; }
interface SpeechRec {
  lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number;
  start: () => void; stop: () => void;
  onresult: ((e: SREvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SRCtor = new () => SpeechRec;

function getSpeechRecognition(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/* ── Hook de grabación (MediaRecorder, 100% navegador) ───────────── */
type RecState = "idle" | "recording" | "ready";

function useRecorder() {
  const [state, setState] = useState<RecState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const urlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recRef.current?.state === "recording") recRef.current.stop();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const start = useCallback(async (onStop?: () => void) => {
    setError(null);
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; setUrl(null); }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === "undefined") {
      setError("Este navegador no permite grabación de audio. Usa Chrome, Edge o Safari actualizados.");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const u = URL.createObjectURL(blob);
        urlRef.current = u;
        setUrl(u);
        setState("ready");
        if (timerRef.current) clearInterval(timerRef.current);
        onStop?.();
      };
      recRef.current = rec;
      rec.start();
      setSeconds(0);
      setState("recording");
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      return true;
    } catch {
      setError("No se pudo acceder al micrófono. Revisa los permisos del navegador.");
      setState("idle");
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    if (recRef.current?.state === "recording") recRef.current.stop();
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
    setUrl(null);
    setSeconds(0);
    setState("idle");
  }, []);

  const play = useCallback(() => {
    if (!urlRef.current) return;
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = urlRef.current;
    void audioRef.current.play();
  }, []);

  return { state, seconds, url, error, start, stop, reset, play };
}

/* ── Vista: Shadowing ─────────────────────────────────────────────── */

const XP_SCORED = 8;
const XP_MANUAL = 4;

export function ShadowingView() {
  const [tab, setTab] = useState<"frasi" | "orale">("frasi");
  const addXp = useLms((s) => s.addXp);
  const trackQuest = useLms((s) => s.trackQuest);
  const navigate = useLms((s) => s.navigate);
  const level = useLms((s) => s.level);
  const activeLang = (useLms((s) => s.activeLang) ?? "it") as import("@/lib/lms/types").LangCode;
  const itOnly = activeLang === "it"; /* el simulacro oral (CILS) es italiano */
  const PHRASES = useMemo(() => shadowPhrasesFor(activeLang), [activeLang]);

  const recognitionCtor = useMemo(() => getSpeechRecognition(), []);
  const canRecognize = recognitionCtor !== null;

  return (
    <div className="space-y-6">
      {/* intro */}
      <section className="rounded-3xl border border-verde/25 bg-verde-tenue/60 p-6">
        <h2 className="font-display text-2xl font-semibold">🎙️ Il metodo shadowing</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-it">
          Escucha la frase → repítela en voz alta <em>mientras</em> grabas → compara tu voz con la original.
          {canRecognize
            ? " Tu navegador reconoce el italiano: cada intento recibe una puntuación palabra por palabra, como un examinador."
            : " Tu navegador no soporta reconocimiento de voz (úsalo en Chrome/Edge para puntuación automática): aquí puedes grabar, escuchar y autoevaluarte."}
        </p>
      </section>

      {/* tabs */}
      <div className="flex gap-2 rounded-2xl bg-crema-scura/60 p-1.5 dark:bg-inchiostro/10" role="tablist">
        {([["frasi", "🗣️ Frasi da ripetere"], ["orale", "🎓 Simulacro orale (CILS)"]] as const).filter(([id]) => itOnly || id === "frasi").map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
              tab === id ? "bg-verde text-white shadow-md" : "text-muted-it hover:text-inchiostro dark:hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "frasi" ? (
        <FrasiTab canRecognize={canRecognize} recognitionCtor={recognitionCtor} addXp={addXp} trackQuest={trackQuest} defaultLevel={level} phrases={PHRASES} lang={activeLang} />
      ) : (
        <OraleTab navigate={navigate} />
      )}
    </div>
  );
}

/* ═══ TAB 1 · Frases ─══════════════════════════════════════════════ */

function FrasiTab({ canRecognize, recognitionCtor, addXp, trackQuest, defaultLevel, phrases: SHADOW_PHRASES, lang }: {
  canRecognize: boolean;
  recognitionCtor: SRCtor | null;
  addXp: (n: number, skill?: "pronuncia") => void;
  trackQuest: (t: "shadow", n?: number) => void;
  defaultLevel: CefrLevel | null;
  phrases: import("@/lib/lms/shadowing").ShadowPhrase[];
  lang: import("@/lib/lms/types").LangCode;
}) {
  /* v9.5.3: el nivel del perfil se valida contra los datos reales — un nivel
     sin frases (p. ej. C2 antes de esta versión, o un valor corrupto)
     arrancaba con lista vacía y phrase undefined → TypeError que tumbaba
     toda la app. Ahora: nivel sin datos → "tutti"; sin nivel → "A1". */
  const [lvl, setLvl] = useState<CefrLevel | "tutti">(() => {
    if (defaultLevel && SHADOW_PHRASES.some((p) => p.level === defaultLevel)) return defaultLevel;
    return defaultLevel ? "tutti" : "A1";
  });
  const list = useMemo(() => {
    if (lvl === "tutti") return SHADOW_PHRASES;
    const filtered = SHADOW_PHRASES.filter((p) => p.level === lvl);
    return filtered.length > 0 ? filtered : SHADOW_PHRASES; /* nunca vacía */
  }, [lvl, SHADOW_PHRASES]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState<ShadowScore | null>(null);
  const [manualDone, setManualDone] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  /* v9.47 · velocidad de escucha ajustable y persistente (igual que los
     diálogos); «Lento» sigue fijo a 0.62 como atajo pedagógico. */
  const [rate, setRate] = useDialogueRate();
  const transcriptRef = useRef<string | null>(null);
  const rec = useRecorder();
  const phrase = list.length > 0 ? list[Math.min(idx, list.length - 1)] : undefined;

  const changePhrase = useCallback((delta: number) => {
    setIdx((i) => (i + delta + list.length) % list.length);
    setScore(null);
    setManualDone(false);
    rec.reset();
  }, [list.length, rec]);

  const startAttempt = useCallback(async () => {
    setScore(null);
    setManualDone(false);
    transcriptRef.current = null;
    // reconocimiento en paralelo con la grabación (si está soportado)
    if (canRecognize && recognitionCtor) {
      try {
        const r = new recognitionCtor();
        r.lang = "it-IT";
        r.continuous = true;
        r.interimResults = false;
        r.maxAlternatives = 1;
        r.onresult = (e: SREvent) => {
          let t = "";
          for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript + " ";
          transcriptRef.current = (transcriptRef.current ?? "") + t;
        };
        r.onerror = () => { /* mic denegado o no-match: seguimos con grabación sola */ };
        setRecognizing(true);
        r.start();
        const ok = await rec.start(() => {
          try { r.stop(); } catch { /* ya parado */ }
          setRecognizing(false);
          // evaluar al terminar
          setTimeout(() => {
            const heard = transcriptRef.current;
            if (heard && phrase && heard.trim().length > 0) {
              const sc = scoreSpeech(phrase.it, heard);
              setScore(sc);
              addXp(XP_SCORED, "pronuncia");
              trackQuest("shadow");
            }
          }, 250);
        });
        if (!ok) { setRecognizing(false); try { r.stop(); } catch { /* noop */ } }
      } catch {
        setRecognizing(false);
        await rec.start();
      }
    } else {
      await rec.start();
    }
  }, [canRecognize, recognitionCtor, rec, phrase, addXp, trackQuest]);

  const rateManual = useCallback((ok: boolean) => {
    if (manualDone) return;
    setManualDone(true);
    addXp(ok ? XP_MANUAL : 2, "pronuncia");
    trackQuest("shadow");
  }, [manualDone, addXp, trackQuest]);

  const verdict = score ? shadowVerdict(score.score) : null;

  /* cinturón y tirantes: sin frases disponibles → mensaje claro, nunca crash */
  if (!phrase) {
    return (
      <section className="rounded-3xl border border-soft bg-surface p-8 text-center">
        <p className="font-display text-lg font-semibold">Nessuna frase disponibile</p>
        <p className="mt-2 text-sm text-muted-it">No hay frases para este nivel: elige «Tutti» u otro nivel para practicar.</p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {/* filtro de nivel */}
      <div className="flex flex-wrap gap-2">
        {(["tutti", ...CEFR_LEVELS] as const).map((l) => (
          <button
            key={l}
            onClick={() => { setLvl(l as CefrLevel | "tutti"); setIdx(0); setScore(null); setManualDone(false); rec.reset(); }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-bold transition-all",
              lvl === l ? "border-verde bg-verde text-white" : "border-soft bg-surface text-muted-it hover:border-verde/40"
            )}
          >
            {l === "tutti" ? "Tutti" : `${l} · ${LEVEL_LABELS[l as CefrLevel].split(" ")[0]}`}
          </button>
        ))}
      </div>

      {/* tarjeta de frase */}
      <motion.div
        key={phrase.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-soft bg-surface p-6 sm:p-8"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-verde-tenue px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-verde-scuro dark:text-verde">
            {phrase.level} · frase {idx + 1}/{list.length}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <AudioButton text={phrase.it} rate={rate} lang={lang} variant="full" label="Ascolta" />
            <AudioButton text={phrase.it} rate={0.62} lang={lang} variant="full" label="Lento" />
            <SpeedControl value={rate} onChange={setRate} />
          </div>
        </div>

        <p className="mt-5 font-display text-2xl font-semibold leading-snug sm:text-3xl">
          {score ? (
            score.matched.map((m, i) => (
              <span key={i} className={m ? "text-verde-scuro dark:text-verde" : "text-rosso underline decoration-rosso/50 decoration-wavy"}>
                {phrase.it.split(" ")[i]}{" "}
              </span>
            ))
          ) : (
            phrase.it
          )}
        </p>
        <p className="mt-2 text-sm italic text-muted-it">{phrase.es}</p>
        {phrase.tip && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-oro-tenue px-4 py-3 text-xs leading-relaxed text-oro-scuro dark:text-oro">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {phrase.tip}
          </p>
        )}

        {/* controles de grabación */}
        <div className="mt-7 flex flex-col items-center gap-4">
          {rec.state === "idle" ? (
            <button
              onClick={() => void startAttempt()}
              className="group inline-flex h-24 w-24 items-center justify-center rounded-full bg-rosso text-white shadow-xl shadow-rosso/30 transition-all hover:scale-105 active:scale-95"
              aria-label="Grabar mi voz repitiendo la frase"
            >
              <Mic className="h-9 w-9 transition-transform group-hover:scale-110" aria-hidden="true" />
            </button>
          ) : rec.state === "recording" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-end gap-1.5" aria-hidden="true">
                {[0.9, 0.5, 1.1, 0.7, 1.3, 0.6, 1.0, 0.8, 1.2, 0.5].map((d, i) => (
                  <span
                    key={i}
                    className="w-2 animate-pulse rounded-full bg-rosso"
                    style={{ height: `${14 + d * 22}px`, animationDelay: `${i * 90}ms`, animationDuration: `${0.7 + (i % 3) * 0.2}s` }}
                  />
                ))}
              </div>
              <p className="font-mono text-2xl font-bold tabular-nums text-rosso">
                {String(Math.floor(rec.seconds / 60)).padStart(2, "0")}:{String(rec.seconds % 60).padStart(2, "0")}
              </p>
              <button
                onClick={rec.stop}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-inchiostro px-6 py-3 font-bold text-white transition-all hover:scale-[1.02] active:scale-95 dark:bg-white dark:text-inchiostro"
              >
                <Square className="h-4 w-4" aria-hidden="true" /> Stop
              </button>
              {recognizing && <p className="text-xs font-semibold text-muted-it">🎧 Riconoscimento vocale in ascolto…</p>}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button onClick={rec.play} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-verde/40 bg-verde-tenue px-5 py-3 text-sm font-bold text-verde-scuro transition-all hover:border-verde active:scale-95 dark:text-verde">
                  <Play className="h-4 w-4" aria-hidden="true" /> La tua voce
                </button>
                <button
                  onClick={() => speak(phrase.it, { lang })}
                  className="inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-oro/40 bg-oro-tenue px-5 py-3 text-sm font-bold text-oro-scuro transition-all hover:border-oro active:scale-95 dark:text-oro"
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" /> Originale
                </button>
                <button onClick={() => { rec.reset(); setScore(null); setManualDone(false); }} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-soft px-4 py-3 text-sm font-bold text-muted-it transition-all hover:border-rosso/40 hover:text-rosso active:scale-95">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> Riprova
                </button>
              </div>

              {/* puntuación automática */}
              {score && verdict ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "w-full rounded-2xl border-2 p-5 text-center",
                    verdict.tone === "verde" && "border-verde/40 bg-verde-tenue/60",
                    verdict.tone === "oro" && "border-oro/40 bg-oro-tenue/60",
                    verdict.tone === "rosso" && "border-rosso/40 bg-rosso-tenue/60"
                  )}
                >
                  <p className="font-display text-4xl font-bold">{score.score}%</p>
                  {/* v9.34 · Pappagallo reacciona a tu pronunciación */}
                  <Mascot pose={verdict.tone === "rosso" ? "study" : "party"} className="mx-auto mt-2 h-16 w-16" />
                  <p className="mt-1 text-sm font-bold">{verdict.label}</p>
                  <p className="mt-1 text-xs text-muted-it">{verdict.msg}</p>
                  <p className="mt-2 truncate rounded-lg bg-white/60 px-3 py-1.5 font-mono text-[11px] text-muted-it dark:bg-black/20" title={score.heard}>
                    🎧 «{score.heard}»
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-verde-scuro dark:text-verde">+{XP_SCORED} XP · missione shadowing aggiornata</p>
                </motion.div>
              ) : !canRecognize ? (
                <div className="w-full rounded-2xl border border-soft bg-crema-scura/50 p-5 text-center dark:bg-inchiostro/10">
                  <p className="text-sm font-bold">Come ti è sembrata la tua pronuncia?</p>
                  <div className="mt-3 flex justify-center gap-3">
                    <button onClick={() => rateManual(true)} disabled={manualDone} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-verde px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Bene!
                    </button>
                    <button onClick={() => rateManual(false)} disabled={manualDone} className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-rosso/40 px-5 py-2.5 text-sm font-bold text-rosso transition-all hover:bg-rosso-tenue active:scale-95 disabled:opacity-50">
                      <XCircle className="h-4 w-4" aria-hidden="true" /> Da rifare
                    </button>
                  </div>
                  {manualDone && <p className="mt-2 text-xs font-semibold text-verde-scuro dark:text-verde">+XP registrati · riprova quando vuoi</p>}
                </div>
              ) : recognizing ? (
                <p className="text-sm font-semibold text-muted-it">🎧 Elaborazione del riconoscimento…</p>
              ) : (
                <p className="text-sm text-muted-it">No ho capito la voce. <button onClick={() => void startAttempt()} className="font-bold text-verde underline">Riprova</button> avvicinandoti al microfono.</p>
              )}
            </div>
          )}

          {rec.error && <p className="text-sm font-semibold text-rosso">{rec.error}</p>}
        </div>

        {/* navegación */}
        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => changePhrase(-1)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-soft px-4 py-2 text-sm font-bold transition-all hover:border-verde/40 active:scale-95">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Precedente
          </button>
          <button onClick={() => changePhrase(1)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-verde px-5 py-2 text-sm font-bold text-white transition-all hover:bg-verde-scuro active:scale-95">
            Successiva <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </motion.div>

      {/* ayuda de velocidad */}
      <p className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-it">
        <span className="inline-flex items-center gap-1.5"><Rabbit className="h-3.5 w-3.5" aria-hidden="true" /> Ascolta: a la velocidad que elijas (se recuerda)</span>
        <span className="inline-flex items-center gap-1.5"><Turtle className="h-3.5 w-3.5" aria-hidden="true" /> Lento: 60% más despacio, ideal para imitar</span>
      </p>
    </section>
  );
}

/* ═══ TAB 2 · Simulacro oral CILS ─═════════════════════════════════ */

type OralPhase = "info" | "prep" | "speak" | "done";

function OraleTab({ navigate }: { navigate: (v: "cils") => void }) {
  const [taskIdx, setTaskIdx] = useState(0);
  const [phase, setPhase] = useState<OralPhase>("info");
  const [left, setLeft] = useState(0);
  const rec = useRecorder();
  const addXp = useLms((s) => s.addXp);
  const trackQuest = useLms((s) => s.trackQuest);
  const task = ORAL_TASKS[taskIdx];

  const finish = useCallback(() => {
    rec.stop();
    setPhase("done");
    addXp(12, "parlato");
    trackQuest("shadow");
  }, [rec, addXp, trackQuest]);

  /* temporizadores dirigidos por fase: prep → speak → done
     (el display inicial se deriva de la fase; el tick llega en <250 ms) */
  useEffect(() => {
    if (phase !== "prep" && phase !== "speak") return;
    const secs = phase === "prep" ? task.prepSeconds : task.speakSeconds;
    const deadline = Date.now() + secs * 1000;
    if (phase === "speak") void rec.start();
    const t = setInterval(() => {
      const rem = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setLeft(rem);
      if (rem <= 0) {
        clearInterval(t);
        if (phase === "prep") setPhase("speak");
        else finish();
      }
    }, 250);
    return () => clearInterval(t);
  }, [phase, task, rec, finish]);

  const pickTask = (i: number) => {
    setTaskIdx(i);
    setPhase("info");
    rec.reset();
  };

  const phaseSecs = phase === "prep" ? task.prepSeconds : phase === "speak" ? task.speakSeconds : 0;
  const display = (phase === "prep" || phase === "speak") && left === 0 ? phaseSecs : left;
  const mm = String(Math.floor(display / 60)).padStart(2, "0");
  const ss = String(display % 60).padStart(2, "0");

  return (
    <section className="space-y-5">
      {/* selector de tarea */}
      <div className="flex flex-wrap gap-2">
        {ORAL_TASKS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => pickTask(i)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
              i === taskIdx ? "border-verde bg-verde text-white" : "border-soft bg-surface text-muted-it hover:border-verde/40"
            )}
          >
            {t.level} · {t.kind}
          </button>
        ))}
      </div>

      <motion.div key={task.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-soft bg-surface p-6 sm:p-8">
        <span className="rounded-full bg-terracotta/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-terracotta">
          Prova orale · {task.level} · {Math.round((task.prepSeconds + task.speakSeconds) / 60)} min
        </span>
        <h3 className="mt-4 font-display text-2xl font-semibold leading-snug">{task.prompt}</h3>
        <p className="mt-2 text-sm italic text-muted-it">🎧 «{task.it}»</p>

        {phase === "info" && (
          <div className="mt-6 space-y-4">
            <ul className="space-y-2">
              {task.tips.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm">
                  <Circle className="mt-1 h-3 w-3 shrink-0 text-verde" aria-hidden="true" />
                  <span><b>Che cosa valutare:</b> {t}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setPhase("prep")} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-verde px-6 py-3 font-bold text-white shadow-lg shadow-verde/25 transition-all hover:scale-[1.02] active:scale-95">
                <Timer className="h-4 w-4" aria-hidden="true" /> Inizia la prova ({task.prepSeconds}s preparación + {task.speakSeconds}s habla)
              </button>
              <button onClick={() => navigate("cils")} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-soft px-5 py-3 text-sm font-bold text-muted-it transition-all hover:border-verde/40 active:scale-95">
                Ver estructura completa del CILS
              </button>
            </div>
          </div>
        )}

        {(phase === "prep" || phase === "speak") && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className={cn("text-sm font-bold uppercase tracking-wider", phase === "prep" ? "text-oro-scuro dark:text-oro" : "text-rosso")}>
              {phase === "prep" ? "🧠 Preparazione — organizza le idee (silenzio)" : "🎙️ Parla ora! La prova si registra"}
            </p>
            <p className={cn("font-mono text-6xl font-bold tabular-nums", phase === "prep" ? "text-oro-scuro dark:text-oro" : "text-rosso animate-pulse")}>
              {mm}:{ss}
            </p>
            {phase === "prep" ? (
              <button onClick={() => setPhase("speak")} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-oro/50 bg-oro-tenue px-6 py-3 text-sm font-bold text-oro-scuro transition-all active:scale-95 dark:text-oro">
                <Play className="h-4 w-4" aria-hidden="true" /> Sono pronto, parlo ora
              </button>
            ) : (
              <div className="flex items-end gap-1.5" aria-hidden="true">
                {[1, 0.6, 1.2, 0.8, 1.4, 0.7, 1.1, 0.9, 1.3, 0.5].map((d, i) => (
                  <span key={i} className="w-2 animate-pulse rounded-full bg-rosso" style={{ height: `${12 + d * 24}px`, animationDelay: `${i * 80}ms` }} />
                ))}
              </div>
            )}
            <button
              onClick={finish}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-soft px-4 py-2 text-xs font-bold text-muted-it transition-all hover:border-rosso/40 hover:text-rosso active:scale-95"
            >
              <Pause className="h-3.5 w-3.5" aria-hidden="true" /> Termina prima
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border-2 border-verde/40 bg-verde-tenue/60 p-5 text-center">
              <p className="font-display text-xl font-bold">Prova completata! 🎉</p>
              <p className="mt-1 text-xs text-muted-it">+12 XP · escúchate con calma y compárate con los criterios del examen.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {rec.url && (
                <button onClick={rec.play} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-verde/40 bg-verde-tenue px-5 py-3 text-sm font-bold text-verde-scuro transition-all active:scale-95 dark:text-verde">
                  <Play className="h-4 w-4" aria-hidden="true" /> Riascoltati
                </button>
              )}
              <button onClick={() => pickTask(taskIdx)} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-soft px-5 py-3 text-sm font-bold text-muted-it transition-all hover:border-verde/40 active:scale-95">
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Ripeti la prova
              </button>
              {taskIdx < ORAL_TASKS.length - 1 && (
                <button onClick={() => pickTask(taskIdx + 1)} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-verde px-5 py-3 text-sm font-bold text-white transition-all hover:bg-verde-scuro active:scale-95">
                  Prossima prova <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <ul className="space-y-1.5 rounded-2xl bg-crema-scura/60 p-4 dark:bg-inchiostro/10">
              <li className="text-xs font-bold uppercase tracking-wider text-muted-it">Autovalutazione — ¿cumpliste…?</li>
              {task.tips.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm"><Circle className="mt-1 h-3 w-3 shrink-0 text-terracotta" aria-hidden="true" /> {t}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </section>
  );
}
