"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, Ear, Globe2, GraduationCap,
  Languages, Library, Lightbulb, ListChecks, Mic2, PenLine, Sparkles, Target, Trophy,
  Play, Pause, Volume2, Eye, EyeOff, ExternalLink, PartyPopper, Table2,
} from "lucide-react";
import { CB_STEPS, type CbQuizItem, type CbUnit, type CbStepId } from "@/lib/lms/cambridge";
import { unitById, levelOfUnit, langContent } from "@/lib/lms/lang";
import { langOfId, LANGS } from "@/lib/lms/languages";
import { uiFor } from "@/lib/lms/ui";
import { READINGS } from "@/lib/lms/reading";
import { LETTURE_BY_ID } from "@/lib/lms/letture";
import { GRAMMAR_IMG } from "@/lib/lms/grammar";
import { useLms } from "@/lib/lms/store";
import { buildCast, speak, stopSpeaking, speakDialogue, type SpeakerVoice } from "@/lib/lms/tts";
import { AudioButton } from "./audio-button";
import { SpeedControl, useDialogueRate } from "./speed-control";
import { HoverWords } from "./hover-words";
import { ClozeReadings } from "./cloze-readings";
import { MindReadings } from "./mind-readings";
import { ThemeImg } from "./theme-img";
import { cn } from "@/lib/utils";

/* ═══ v9.8 · Reproductor de unidad comunicativa (12 pasos Cambridge) ══
   Motivazione → Ascolto → Comprensione → Vocabolario → Grammatica →
   Pronuncia → Parlato → Lettura → Scrittura → Cultura → Missione →
   Autovalutazione. Cada sección otorga XP y alimenta su destreza.    */

const STEP_ICONS = [Lightbulb, Ear, ListChecks, Library, BookOpen, Volume2, Mic2, BookOpen, PenLine, Globe2, Sparkles, Target];

/* ── v9.13 · Mezcla estable de opciones en los quizzes ──────────────
   Permutación determinística por texto de pregunta: la opción correcta
   no queda siempre en la misma posición entre renders.               */
function cbHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function cbPerm(seed: number, len: number): number[] {
  let a = seed >>> 0;
  const rnd = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const idx = Array.from({ length: len }, (_, i) => i);
  for (let i = len - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

/* ── Mini-quiz inline (comprensión / gaps / repaso) ───────────────── */
function CbQuiz({ items, title, onPass, passPct = 60, ui }: { items: CbQuizItem[]; title?: string; onPass?: (score: number, total: number) => void; passPct?: number; ui?: ReturnType<typeof uiFor> }) {
  const u = ui ?? uiFor("it");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const shuffled = useMemo(() => items.map((it) => {
    const perm = cbPerm(cbHash(it.q), it.options.length);
    return { q: it.q, options: perm.map((i) => it.options[i]), answer: perm.indexOf(it.answer), explain: it.explain };
  }), [items]);
  const answered = Object.keys(answers).length;
  const score = shuffled.reduce((n, it, i) => n + (answers[i] === it.answer ? 1 : 0), 0);
  const finished = answered === shuffled.length;
  const passed = finished && score / shuffled.length * 100 >= passPct;

  return (
    <div>
      {title && <h3 className="mb-4 font-display text-lg font-semibold">{title}</h3>}
      <div className="space-y-4">
        {shuffled.map((it, i) => (
          <div key={i} className={cn("rounded-2xl border-2 p-4 transition-colors", answers[i] === undefined ? "border-soft bg-surface" : answers[i] === it.answer ? "border-verde/50 bg-verde-tenue/40" : "border-rosso/40 bg-rosso-tenue/20")}>
            <p className="font-semibold leading-snug">{i + 1}. {it.q}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {it.options.map((op, oi) => {
                const chosen = answers[i] === oi;
                const reveal = answers[i] !== undefined;
                const isCorrect = oi === it.answer;
                return (
                  <button
                    key={oi}
                    disabled={reveal}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                    className={cn(
                      "min-h-11 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all",
                      !reveal && "border-soft bg-crema hover:border-verde/50 hover:bg-verde-tenue",
                      reveal && isCorrect && "border-verde bg-verde text-white",
                      reveal && !isCorrect && chosen && "border-rosso bg-rosso/90 text-white",
                      reveal && !isCorrect && !chosen && "border-soft bg-crema opacity-50",
                    )}
                  >
                    {op}
                  </button>
                );
              })}
            </div>
            {answers[i] !== undefined && (
              <p className="mt-2 text-xs font-semibold text-muted-it">
                {answers[i] === it.answer ? u.unit.quizEsatto : u.common.wrongMark} {it.explain || (answers[i] === it.answer ? "" : u.unit.quizRespuesta(it.options[it.answer]))}
              </p>
            )}
          </div>
        ))}
      </div>
      {finished && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("mt-5 rounded-2xl p-4 text-center", passed ? "bg-verde-tenue" : "bg-rosso-tenue/30")}>
          <p className="font-display text-lg font-bold">{score}/{shuffled.length} · {Math.round(score / shuffled.length * 100)}%</p>
          <p className="text-sm text-muted-it">{passed ? u.unit.quizSuperato : u.unit.quizNeedMore(Math.ceil(shuffled.length * passPct / 100))}</p>
          {onPass && passed && <AutoPass onPass={() => onPass(score, items.length)} />}
        </motion.div>
      )}
      {!finished && <p className="mt-3 text-center text-xs font-semibold text-muted-it">{u.unit.quizAnswered(answered, shuffled.length)}</p>}
    </div>
  );
}

/* dispara onPass una única vez */
function AutoPass({ onPass }: { onPass: () => void }) {
  const [done, setDone] = useState(false);
  if (!done) { setDone(true); onPass(); }
  return null;
}

/* ── Reproductor completo ─────────────────────────────────────────── */
export function CambridgeUnitView({ unitId, onBack }: { unitId: string; onBack: () => void }) {
  const navigate = useLms((s) => s.navigate);
  const addXp = useLms((s) => s.addXp);
  const progress = useLms((s) => s.cambridgeProgress[unitId]);
  const markCambridgeSection = useLms((s) => s.markCambridgeSection);
  const completeCambridgeUnit = useLms((s) => s.completeCambridgeUnit);
  /* v9.16 · can-do persistentes (Quadro MCER) */
  const candoDone = useLms((s) => s.candoDone);
  const toggleCando = useLms((s) => s.toggleCando);
  const [step, setStep] = useState(0);
  const [showTr, setShowTr] = useState(false);
  const [playing, setPlaying] = useState(false);
  /* v9.46 · velocidad de lectura del diálogo (persistente) */
  const [dlgRate, setDlgRate] = useDialogueRate();
  const [essay, setEssay] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [reviewPassed, setReviewPassed] = useState(false);

  const unit = unitById(unitId) as CbUnit | undefined;
  /* v9.17 · lengua de esta unidad: decide TTS, hover y contenidos */
  const ulang = unit ? langOfId(unit.id) : "it";
  /* v9.18 · fichas y enunciados en la lengua de la unidad */
  const u = uiFor(ulang);
  const ulContent = langContent(ulang);
  const ulangInfo = LANGS[ulang];
  const cast: Record<string, SpeakerVoice> = useMemo(() => (unit ? buildCast(unit.dialogue.map((d) => d.speaker), ulang) : {}), [unit, ulang]);
  const doneSections = progress?.sections ?? [];
  const unitDone = progress?.done ?? false;

  if (!unit) return <p className="text-muted-it">{u.common.unitNotFound}</p>;

  const done = (s: CbStepId) => doneSections.includes(s);
  const mark = (s: CbStepId) => markCambridgeSection(unitId, s);
  const stepId = CB_STEPS[step].id as CbStepId;
  const Icon = STEP_ICONS[step];

  const playDialogue = () => {
    if (playing) { stopSpeaking(); setPlaying(false); return; }
    setPlaying(true);
    speakDialogue(unit.dialogue, cast, { rate: dlgRate, lang: ulang, onDone: () => setPlaying(false) });
  };

  const nextStep = () => { if (step < CB_STEPS.length - 1) setStep(step + 1); };
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const reading = unit.reading.sourceId ? READINGS.find((r) => r.id === unit.reading.sourceId) : undefined;
  const lettura = unit.reading.letturaId ? LETTURE_BY_ID[unit.reading.letturaId] : undefined;
  const deep = ulContent?.deep[unitId];

  return (
    <div>
      {/* cabecera */}
      <button onClick={onBack} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-it transition-colors hover:text-verde">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {u.unit.back(unit.level, unit.n)}
      </button>

      <header className="overflow-hidden rounded-3xl border border-soft bg-surface">
        <div className="relative h-40 w-full sm:h-52">
          <ThemeImg src={unit.img} alt={unit.titleIt} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-inchiostro/85 via-inchiostro/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest opacity-90">{u.unit.kicker(unit.level, unit.n)}</p>
            <h1 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{unit.titleIt}</h1>
            <p className="text-sm italic opacity-90">{unit.title} — {unit.goal}</p>
          </div>
          {unitDone && (
            <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-verde px-3 py-1.5 text-xs font-bold text-white shadow-lg">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> {u.unit.completedBadge}
            </span>
          )}
        </div>
      </header>

      {/* stepper */}
      <div className="sticky top-[98px] z-30 -mx-4 mt-6 overflow-x-auto border-b border-soft bg-crema/90 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 md:top-16">
        <div className="flex gap-1.5" role="tablist" aria-label={u.unit.stepsAria}>
          {CB_STEPS.map((s, i) => {
            const SIcon = STEP_ICONS[i];
            const isDone = done(s.id as CbStepId);
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={step === i}
                onClick={() => setStep(i)}
                className={cn(
                  "flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all",
                  step === i ? "bg-verde text-white shadow-md shadow-verde/20" : "text-muted-it hover:bg-verde-tenue hover:text-verde-scuro dark:hover:text-verde",
                )}
              >
                {isDone ? <CheckCircle2 className="h-3.5 w-3.5 text-verde-scuro dark:text-verde" aria-hidden="true" /> : <SIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                {i + 1}. {u.unit.steps[s.id] ?? s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* contenido del paso */}
      <motion.main key={stepId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
        <div className="rounded-3xl border border-soft bg-surface p-6 sm:p-8">

          {/* 1 · MOTIVAZIONE */}
          {stepId === "scenario" && (
            <div className="space-y-6">
              <SectionTitle icon={<Lightbulb className="h-5 w-5 text-oro" aria-hidden="true" />} n={1} title={u.unit.tScenario} />
              <p className="rounded-2xl bg-crema-scura p-5 text-lg leading-relaxed dark:bg-inchiostro/10">{unit.scenario}</p>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold">{u.unit.goalsTitle}</h3>
                  <span className="rounded-full bg-verde-tenue px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-verde-scuro dark:text-verde">
                    {u.unit.candoChip}
                  </span>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {unit.goals.map((g, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-2xl bg-verde-tenue/50 p-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-verde font-mono text-xs font-bold text-white">{i + 1}</span>
                      <span className="leading-relaxed">{g}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-it">
                  {u.unit.candoNote(unit.level)}{" "}
                  <button onClick={() => navigate("quadro")} className="font-bold text-verde underline underline-offset-2 hover:text-verde-scuro dark:hover:text-verde">
                    {u.unit.compareScale}
                  </button>
                </p>
              </div>
              <StepDone done={done("scenario")} onDone={() => mark("scenario")} label={u.unit.doneScenario} ui={u} />
            </div>
          )}

          {/* 2 · ASCOLTO */}
          {stepId === "ascolto" && (
            <div className="space-y-5">
              <SectionTitle icon={<Ear className="h-5 w-5 text-verde" aria-hidden="true" />} n={2} title={u.unit.tAscolto} />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={playDialogue}
                  className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-verde px-5 py-3 text-sm font-bold text-white shadow-md shadow-verde/25 transition-all hover:scale-[1.03]"
                >
                  {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
                  {playing ? u.common.stop : u.unit.listenDialogue}
                </button>
                <button onClick={() => setShowTr(!showTr)} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-soft bg-crema px-4 py-2.5 text-xs font-bold transition-all hover:border-verde/40">
                  {showTr ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  {showTr ? u.common.hideEs : u.common.showEs}
                </button>
                <SpeedControl value={dlgRate} onChange={setDlgRate} className="ml-auto" />
              </div>
              {/* v9.15 · hover de traducción en cada battuta del dialogo */}
              <p className="rounded-xl bg-crema-scura px-3.5 py-2 text-xs font-semibold text-muted-it dark:bg-inchiostro/10">
                {u.common.hoverHint}
              </p>
              <div className="space-y-3">
                {unit.dialogue.map((l, i) => (
                  <div key={i} className={cn("flex gap-3 rounded-2xl border border-soft p-4", l.speaker === "Tu" ? "bg-verde-tenue/30" : "bg-crema dark:bg-inchiostro/5")}>
                    <span className="shrink-0 rounded-full bg-verde px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-white">{l.speaker}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className="flex-1 leading-relaxed"><HoverWords text={l.it} lang={ulang} /></p>
                        <AudioButton text={l.it} size="sm" lang={ulang} rate={dlgRate} />
                      </div>
                      {showTr && <p className="mt-1.5 text-sm italic text-muted-it">{l.es}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-muted-it">{u.unit.tipListen}</p>
              <StepDone done={done("ascolto")} onDone={() => mark("ascolto")} label={u.unit.doneAscolto} ui={u} />
            </div>
          )}

          {/* 3 · COMPRENSIONE */}
          {stepId === "comprensione" && (
            <div className="space-y-5">
              <SectionTitle icon={<ListChecks className="h-5 w-5 text-rosso" aria-hidden="true" />} n={3} title={u.unit.tComprensione} />
              <CbQuiz
                items={unit.comprehension}
                onPass={() => { if (!done("comprensione")) mark("comprensione"); }}
              />
            </div>
          )}

          {/* 4 · VOCABOLARIO (chunks) */}
          {stepId === "vocabolario" && (
            <div className="space-y-5">
              <SectionTitle icon={<Library className="h-5 w-5 text-verde-scuro" aria-hidden="true" />} n={4} title={u.unit.tVocabolario} />
              <p className="text-sm text-muted-it">{u.unit.chunksNoteA}<strong>chunks</strong>{u.unit.chunksNoteB}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {unit.chunks.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border border-soft bg-crema p-4 dark:bg-inchiostro/5">
                    <AudioButton text={c.it} size="md" lang={ulang} />
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug">{c.it}</p>
                      <p className="text-sm text-muted-it">{c.es}</p>
                    </div>
                  </div>
                ))}
              </div>
              <StepDone done={done("vocabolario")} onDone={() => mark("vocabolario")} label={u.unit.doneVocab} ui={u} />
            </div>
          )}

          {/* 5 · GRAMMATICA (inductiva) */}
          {stepId === "grammatica" && (
            <div className="space-y-5">
              <SectionTitle icon={<BookOpen className="h-5 w-5 text-oro" aria-hidden="true" />} n={5} title={u.unit.tGrammatica(unit.grammar.focus)} />
              <p className="text-sm font-semibold text-muted-it">{u.unit.observe}</p>
              <div className="space-y-3">
                {unit.grammar.inductive.map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border border-soft bg-crema p-4 dark:bg-inchiostro/5">
                    <AudioButton text={ex.it} size="md" lang={ulang} />
                    <div>
                      <p className="font-semibold leading-snug"><HoverWords text={ex.it} lang={ulang} /></p>
                      <p className="text-sm italic text-muted-it">{ex.es}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 rounded-2xl bg-oro-tenue/40 p-5">
                <h4 className="font-display font-semibold">{u.unit.theRule}</h4>
                {unit.grammar.rule.map((r, i) => <p key={i} className="leading-relaxed">{r}</p>)}
              </div>
              {/* v9.36 · tavole di reglas de construcción (mismo estándar de la vista Grammatica) */}
              {unit.grammar.tables && unit.grammar.tables.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-display text-lg font-semibold">{u.unit.ruleTables}</h4>
                  {unit.grammar.tables.map((tb, k) => (
                    <div key={k} className="overflow-hidden rounded-2xl border-2 border-soft">
                      <p className="flex items-center gap-2 border-b border-soft bg-verde-tenue px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-verde-scuro dark:text-verde">
                        <Table2 className="h-3.5 w-3.5" aria-hidden="true" /> {tb.title}
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[420px] border-collapse text-sm">
                          <thead>
                            <tr className="bg-surface">
                              {tb.headers.map((h, hi) => (
                                <th key={hi} scope="col" className="whitespace-nowrap px-3 py-2 text-left font-display text-xs font-bold text-muted-it">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tb.rows.map((row, ri) => (
                              <tr key={ri} className={cn("border-t border-soft", ri % 2 === 0 ? "bg-surface" : "bg-crema-scura/60 dark:bg-inchiostro/5")}>
                                {row.map((cell, ci) => (
                                  <td key={ci} className={cn("px-3 py-2", ci === 0 ? "font-semibold text-inchiostro" : "font-mono text-[13px] text-inchiostro/90")}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {tb.note && <p className="border-t border-soft bg-oro-tenue px-4 py-2 text-xs leading-relaxed text-oro-scuro dark:text-oro">💡 {tb.note}</p>}
                    </div>
                  ))}
                </div>
              )}
              {/* v9.15 · spiegazione completa: formación, uso, trampas del español */}
              {deep && (
                <div className="space-y-3">
                  <h4 className="font-display text-lg font-semibold">{u.unit.fullExplain}</h4>
                  {deep.sezioni.map((s, i) => (
                    <div key={i} className="rounded-2xl border border-soft bg-crema p-5 dark:bg-inchiostro/5">
                      <h5 className="font-mono text-[11px] font-bold uppercase tracking-wider text-verde-scuro dark:text-verde">{s.t}</h5>
                      <p className="mt-2 leading-relaxed">{s.body}</p>
                    </div>
                  ))}
                </div>
              )}
              {/* v9.15 · altri esempi con audio y hover de traducción */}
              {deep && deep.esempi.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-display text-lg font-semibold">{u.unit.moreExamples}</h4>
                  {deep.esempi.map((ex, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl border border-soft bg-crema p-4 dark:bg-inchiostro/5">
                      <AudioButton text={ex.it} size="md" lang={ulang} />
                      <div className="min-w-0">
                        <p className="font-semibold leading-snug"><HoverWords text={ex.it} lang={ulang} /></p>
                        <p className="text-sm italic text-muted-it">{ex.es}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <CbQuiz items={unit.grammar.gaps} title={u.unit.putToTest} ui={u} onPass={() => { if (!done("grammatica")) mark("grammatica"); }} />
              {/* v9.15 · esercizio di uso: qué forma encaja en este contexto */}
              {deep && deep.usi.length > 0 && (
                <CbQuiz items={deep.usi} title={u.unit.chooseUse} ui={u} onPass={() => { if (!done("grammatica")) mark("grammatica"); }} />
              )}
              {/* v9.13 · allenamiento extra: trasformazioni + correzione errori */}
              {ulContent?.drills[unit.id] && (
                <>
                  <CbQuiz items={ulContent.drills[unit.id].transform} title={u.unit.extraTransform} ui={u} onPass={() => { if (!done("grammatica")) mark("grammatica"); }} />
                  <CbQuiz items={ulContent.drills[unit.id].errors} title={u.unit.fixError} ui={u} onPass={() => { if (!done("grammatica")) mark("grammatica"); }} />
                </>
              )}
              {unit.grammar.topicId && (
                <button
                  onClick={() => navigate("grammatica", { grammarId: unit.grammar!.topicId } as never)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-verde/40 bg-verde-tenue px-4 py-2.5 text-xs font-bold transition-all hover:border-verde"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" /> {u.unit.fullTopic}
                </button>
              )}
            </div>
          )}

          {/* 6 · PRONUNCIA */}
          {stepId === "pronuncia" && (
            <div className="space-y-5">
              <SectionTitle icon={<Volume2 className="h-5 w-5 text-rosso" aria-hidden="true" />} n={6} title={u.unit.tPronuncia(unit.pronunciation.focus)} />
              <div className="rounded-2xl bg-crema-scura p-5 leading-relaxed dark:bg-inchiostro/10">{unit.pronunciation.tip}</div>
              <div className="space-y-3">
                {unit.pronunciation.pairs.map((p, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-3 rounded-2xl border border-soft bg-crema p-4 dark:bg-inchiostro/5">
                    <div className="flex items-center gap-2">
                      <AudioButton text={p.a} size="sm" lang={ulang} />
                      <span className="font-semibold">{p.a}</span>
                    </div>
                    <span className="text-muted-it">vs</span>
                    <div className="flex items-center gap-2">
                      <AudioButton text={p.b} size="sm" lang={ulang} />
                      <span className="font-semibold">{p.b}</span>
                    </div>
                    {p.note && <span className="text-xs italic text-muted-it">· {p.note}</span>}
                  </div>
                ))}
              </div>
              <StepDone done={done("pronuncia")} onDone={() => mark("pronuncia")} label={u.unit.donePron} ui={u} />
            </div>
          )}

          {/* 7 · PARLATO */}
          {stepId === "parlato" && (
            <div className="space-y-5">
              <SectionTitle icon={<Mic2 className="h-5 w-5 text-verde" aria-hidden="true" />} n={7} title={u.unit.tParlato} />
              <div className="space-y-3">
                {unit.speaking.steps.map((s, i) => (
                  <div key={i} className="rounded-2xl border-l-4 border-verde bg-crema p-4 dark:bg-inchiostro/5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-verde-scuro dark:text-verde">
                      {i + 1} · {s.kind === "controllato" ? u.unit.kindCtrl : s.kind === "semi" ? u.unit.kindSemi : s.kind === "comunicativo" ? u.unit.kindComm : u.unit.kindAuth}
                    </span>
                    <p className="mt-1 leading-relaxed">{s.task}</p>
                  </div>
                ))}
              </div>
              <StepDone done={done("parlato")} onDone={() => mark("parlato")} label={u.unit.doneParlato} ui={u} />
            </div>
          )}

          {/* 8 · LETTURA */}
          {stepId === "lettura" && (
            <div className="space-y-5">
              <SectionTitle icon={<BookOpen className="h-5 w-5 text-oro" aria-hidden="true" />} n={8} title={u.unit.tLettura} />
              {/* v9.13 · 3 letture tematiche (meditazione/spiritualità/qui-ora/relax) con 7 strategie */}
              <MindReadings unitId={unit.id} lang={ulang} />
              {/* v9.12 · 3 letture cloze (inferenza lessicale contestuale) */}
              <ClozeReadings unitId={unit.id} lang={ulang} />
              <details className="group rounded-3xl border border-soft bg-surface">
                <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-5 py-3 text-sm font-bold text-muted-it transition-colors hover:text-verde">
                  <BookOpen className="h-4 w-4 shrink-0 text-oro" aria-hidden="true" />
                  {u.unit.extReading}
                  <span className="ml-auto text-xs font-normal opacity-70 group-open:hidden">{u.unit.show}</span>
                  <span className="ml-auto hidden text-xs font-normal opacity-70 group-open:inline">{u.unit.hide}</span>
                </summary>
                <div className="space-y-4 border-t border-soft p-5">
              {reading ? (
                <>
                  <div className="rounded-2xl border-l-4 border-oro bg-oro-tenue/30 p-5">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-oro-scuro">{reading.genre} · {reading.minutes} min · {reading.level}</p>
                    <h4 className="font-display text-xl font-semibold">{reading.titleIt}</h4>
                    <p className="text-sm italic text-muted-it">{reading.title}</p>
                  </div>
                  <div className="space-y-4">
                    {reading.paragraphs.slice(0, 3).map((p, i) => (
                      <div key={i}>
                        <div className="flex items-start gap-2">
                          <p className="flex-1 leading-relaxed">{p.it}</p>
                          <AudioButton text={p.it} size="sm" lang={ulang} />
                        </div>
                        <p className="mt-1 text-sm italic text-muted-it">{p.es}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate("lettura", { textId: reading.id } as never)} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-verde/40 bg-verde-tenue px-4 py-2.5 text-xs font-bold transition-all hover:border-verde">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" /> Continúa la lectura (con glosario y preguntas)
                  </button>
                </>
              ) : lettura ? (
                <>
                  <div className="rounded-2xl border-l-4 border-oro bg-oro-tenue/30 p-5">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-oro-scuro">{u.unit.courseReading}</p>
                    <h4 className="font-display text-xl font-semibold">{lettura.title}</h4>
                    <p className="text-sm italic text-muted-it">{lettura.titleEs}</p>
                  </div>
                  <div className="relative h-36 w-full overflow-hidden rounded-2xl">
                    <ThemeImg src={`/images/letture/${lettura.id}.jpg`} alt={lettura.title} className="h-full w-full object-cover" />
                  </div>
                  <button onClick={() => navigate("letture", { letturaId: lettura.id } as never)} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-verde/40 bg-verde-tenue px-4 py-2.5 text-xs font-bold transition-all hover:border-verde">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" /> {u.unit.openFull}
                  </button>
                </>
              ) : unit.reading.lines ? (
                <div className="space-y-4">
                  {unit.reading.lines.map((p, i) => (
                    <div key={i}>
                      <div className="flex items-start gap-2">
                        <p className="flex-1 leading-relaxed">{p.it}</p>
                        <AudioButton text={p.it} size="sm" lang={ulang} />
                      </div>
                      <p className="mt-1 text-sm italic text-muted-it">{p.es}</p>
                    </div>
                  ))}
                </div>
              ) : null}
                </div>
              </details>
              {unit.reading.question && (
                <div className="rounded-2xl bg-verde-tenue/50 p-5">
                  <p className="font-semibold">🤔 {unit.reading.question}</p>
                  <p className="mt-1 text-xs text-muted-it">{u.unit.readQuestion}</p>
                </div>
              )}
              <StepDone done={done("lettura")} onDone={() => mark("lettura")} label={u.unit.doneLettura} ui={u} />
            </div>
          )}

          {/* 9 · SCRITTURA */}
          {stepId === "scrittura" && (
            <div className="space-y-5">
              <SectionTitle icon={<PenLine className="h-5 w-5 text-rosso" aria-hidden="true" />} n={9} title={u.unit.tScrittura} />
              <div className="rounded-2xl border-l-4 border-rosso bg-crema p-5 dark:bg-inchiostro/5">
                <p className="leading-relaxed">{unit.writing.task}</p>
                <p className="mt-2 font-mono text-xs font-bold text-muted-it">{u.unit.minWords(unit.writing.minWords)}</p>
              </div>
              <ul className="space-y-2">
                {unit.writing.tips.map((t, i) => <li key={i} className="rounded-xl bg-crema-scura px-4 py-3 text-sm dark:bg-inchiostro/10">💡 {t}</li>)}
              </ul>
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                rows={7}
                placeholder={u.unit.writePh}
                className="w-full rounded-2xl border-2 border-soft bg-crema p-4 leading-relaxed outline-none transition-colors focus:border-verde dark:bg-inchiostro/10"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs font-bold text-muted-it">{u.unit.wordsCount(essay.trim() ? essay.trim().split(/\s+/).length : 0, unit.writing.minWords)}</p>
                <button onClick={() => setShowModel(!showModel)} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-soft bg-crema px-4 py-2.5 text-xs font-bold transition-all hover:border-verde/40">
                  {showModel ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  {showModel ? u.unit.hideModel : u.unit.viewModel}
                </button>
              </div>
              {showModel && (
                <div className="space-y-2 rounded-2xl bg-oro-tenue/40 p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider">{u.unit.modelTitle}</p>
                  {unit.writing.model.map((m, i) => <p key={i} className="leading-relaxed">{m}</p>)}
                </div>
              )}
              <StepDone done={done("scrittura")} onDone={() => mark("scrittura")} label={u.unit.doneScrittura} ui={u} />
            </div>
          )}

          {/* 10 · CULTURA */}
          {stepId === "cultura" && (
            <div className="space-y-5">
              <SectionTitle icon={<Globe2 className="h-5 w-5 text-verde-scuro" aria-hidden="true" />} n={10} title={u.unit.tCultura(unit.culture.title)} />
              <div className="relative overflow-hidden rounded-2xl">
                <ThemeImg src={unit.img} alt={unit.culture.title} className="h-32 w-full object-cover" />
              </div>
              <p className="rounded-2xl bg-crema-scura p-5 leading-relaxed dark:bg-inchiostro/10">{unit.culture.text}</p>
              <p className="text-xs font-semibold text-muted-it">{u.unit.cultureNote}</p>
              <StepDone done={done("cultura")} onDone={() => mark("cultura")} label={u.unit.doneCultura} ui={u} />
            </div>
          )}

          {/* 11 · MISSIONE */}
          {stepId === "missione" && (
            <div className="space-y-5">
              <SectionTitle icon={<Sparkles className="h-5 w-5 text-oro" aria-hidden="true" />} n={11} title={u.unit.tMissione(unit.finalTask.title)} />
              <div className="rounded-2xl border-2 border-dashed border-oro/50 bg-oro-tenue/25 p-5">
                <p className="leading-relaxed">{unit.finalTask.brief}</p>
              </div>
              <h4 className="font-display font-semibold">{u.unit.checklist}</h4>
              <ul className="space-y-2">
                {unit.finalTask.checklist.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-xl bg-crema px-4 py-3 text-sm dark:bg-inchiostro/5">
                    <span className="text-verde">✔</span> {c}
                  </li>
                ))}
              </ul>
              <StepDone done={done("missione")} onDone={() => mark("missione")} label={u.unit.doneMissione} ui={u} />
            </div>
          )}

          {/* 12 · AUTOVALUTAZIONE */}
          {stepId === "autovalutazione" && (
            <div className="space-y-6">
              <SectionTitle icon={<Target className="h-5 w-5 text-rosso" aria-hidden="true" />} n={12} title={u.unit.tAutovalutazione} />
              <p className="rounded-2xl bg-crema-scura p-4 text-sm leading-relaxed dark:bg-inchiostro/10">
                {u.unit.selfIntroA} {u.unit.selfIntroB(unit.level)}{" "}
                <button onClick={() => navigate("quadro")} className="font-bold text-verde underline underline-offset-2">{u.nav.items.quadro ?? "Quadro MCER"}</button>.
              </p>
              <div className="space-y-2.5">
                {unit.cando.map((c, i) => {
                  const cKey = `${unitId}:${i}`;
                  const checked = !!candoDone[cKey];
                  return (
                    <button
                      key={i}
                      onClick={() => toggleCando(cKey)}
                      aria-pressed={checked}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                        checked ? "border-verde bg-verde-tenue" : "border-soft bg-crema hover:border-verde/40 dark:bg-inchiostro/5",
                      )}
                    >
                      {checked ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-verde" aria-hidden="true" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-inchiostro/25" aria-hidden="true" />}
                      <span className="leading-relaxed">{c}</span>
                    </button>
                  );
                })}
              </div>
              {(() => {
                const doneCount = unit.cando.filter((_, i) => candoDone[`${unitId}:${i}`]).length;
                return (
                  <div className="rounded-2xl border border-soft p-4">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>{u.unit.candoConfirmed}</span>
                      <span className={cn("font-mono", doneCount === unit.cando.length ? "text-verde" : "text-muted-it")}>
                        {doneCount}/{unit.cando.length}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-inchiostro/10">
                      <motion.div
                        className="h-full rounded-full bg-verde"
                        initial={false}
                        animate={{ width: `${(doneCount / unit.cando.length) * 100}%` }}
                      />
                    </div>
                    {doneCount === unit.cando.length && (
                      <p className="mt-2 text-xs font-bold text-verde-scuro dark:text-verde">
                        {u.unit.candoComplete}
                      </p>
                    )}
                  </div>
                );
              })()}
              <CbQuiz items={unit.review} title={u.unit.reviewQuiz} ui={u} onPass={() => {
                setReviewPassed(true);
                if (!done("autovalutazione")) mark("autovalutazione");
              }} />
              {reviewPassed && !unitDone && (
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-3xl border-2 border-verde bg-verde-tenue p-6 text-center">
                  <PartyPopper className="mx-auto h-10 w-10 text-verde" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-2xl font-bold">{u.unit.unitDone(unit.n)}</h3>
                  <p className="mt-1 text-sm text-muted-it">+{60} XP · {u.unit.unitDoneSub}</p>
                  <button
                    onClick={() => completeCambridgeUnit(unitId, 100)}
                    className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-verde px-6 py-3 text-sm font-bold text-white shadow-lg shadow-verde/25 transition-all hover:scale-[1.03]"
                  >
                    <GraduationCap className="h-4 w-4" aria-hidden="true" /> {u.unit.claimDiploma}
                  </button>
                </motion.div>
              )}
              {unitDone && (
                <div className="rounded-3xl border-2 border-verde bg-verde-tenue p-6 text-center">
                  <Trophy className="mx-auto h-10 w-10 text-verde" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-xl font-bold">{u.unit.alreadyDone}</h3>
                  <p className="mt-1 text-sm text-muted-it">{u.unit.reviewAnytime}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* navegación inferior */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-between">
          <button onClick={prevStep} disabled={step === 0} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-soft bg-crema px-5 py-2.5 text-sm font-bold transition-all enabled:hover:border-verde/40 disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {u.unit.prev}
          </button>
          <p className="order-first w-full text-center font-mono text-xs font-bold text-muted-it sm:order-none sm:w-auto">{u.unit.stepCount(step + 1, doneSections.length)}</p>
          <button onClick={nextStep} disabled={step === CB_STEPS.length - 1} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-verde px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-verde/25 transition-all enabled:hover:scale-[1.03] disabled:opacity-40">
            {u.unit.next} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </motion.main>
    </div>
  );
}

function SectionTitle({ icon, n, title }: { icon: React.ReactNode; n: number; title: string }) {
  return (
    <h2 className="flex items-center gap-2.5 font-display text-2xl font-semibold">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-crema-scura dark:bg-inchiostro/10">{icon}</span>
      <span className="font-mono text-xs font-bold text-muted-it">{n}/12</span>
      {title}
    </h2>
  );
}

function StepDone({ done, onDone, label, ui }: { done: boolean; onDone: () => void; label: string; ui?: ReturnType<typeof uiFor> }) {
  const u = ui ?? uiFor("it");
  return (
    <button
      onClick={onDone}
      disabled={done}
      className={cn(
        "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 px-5 py-3 text-sm font-bold transition-all",
        done ? "border-verde bg-verde-tenue text-verde-scuro dark:text-verde" : "border-dashed border-verde/50 bg-crema hover:border-verde hover:bg-verde-tenue/50",
      )}
    >
      {done ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Circle className="h-4 w-4" aria-hidden="true" />}
      {done ? u.unit.doneSection : label}
    </button>
  );
}
