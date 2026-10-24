"use client";

import { useMemo, useRef, useState, type TouchEvent as ReactTouchEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Volume2 } from "lucide-react";
import { dictByIdFor } from "@/lib/lms/dict/active";
import type { LangCode } from "@/lib/lms/types";
import { CATEGORY_IMG } from "@/lib/lms/types";
import { ThemeImg } from "./theme-img";
import { newCard, review, dueCards } from "@/lib/lms/srs";
import { useLms } from "@/lib/lms/store";
import { speak } from "@/lib/lms/tts";
import { AudioButton } from "./audio-button";
import { cn } from "@/lib/utils";

/* ── Sesión de flashcards con repetición espaciada ────────────────── */

const GRADES = [
  { g: 0, label: "Otra vez", sub: "≤ 6 min", cls: "border-rosso/40 bg-rosso-tenue text-rosso-scuro hover:border-rosso dark:text-rosso" },
  { g: 1, label: "Difícil", sub: "1-3 días", cls: "border-oro/40 bg-oro-tenue text-oro-scuro hover:border-oro dark:text-oro" },
  { g: 2, label: "Bien", sub: "×2.5", cls: "border-verde/40 bg-verde-tenue text-verde-scuro hover:border-verde dark:text-verde" },
  { g: 3, label: "Fácil", sub: "×3.0", cls: "border-verde-scuro/40 bg-verde-tenue text-verde-scuro hover:border-verde-scuro dark:text-verde" },
];

/* Umbral de gesto: deslizamiento horizontal dominante (≥48px, 1.5× el eje vertical) */
const SWIPE_MIN = 48;

export function FlashcardSession({ cardIds, onExit, lang = "it" }: { cardIds: string[]; onExit?: () => void; lang?: LangCode }) {
  const srs = useLms((s) => s.srs);
  const upsertSrs = useLms((s) => s.upsertSrs);
  const addXp = useLms((s) => s.addXp);
  const audioRate = useLms((s) => s.settings.audioRate);
  const [queue, setQueue] = useState<string[]>(cardIds);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const [againCount, setAgainCount] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const currentId = queue[0];
  /* v9.33 · índice de la lengua activa (it → VOCAB_BY_ID histórico) para que
     las tarjetas EN/PT/FR/DE del Dizionario resuelvan y suenen con su voz */
  const word = currentId ? dictByIdFor(lang)[currentId] : undefined;

  const grade = (g: number) => {
    if (!currentId) return;
    const card = srs[currentId] ?? newCard(currentId);
    const updated = review(card, g);
    upsertSrs(currentId, updated);
    addXp(g === 0 ? 3 : 6, "vocabolario");
    setDone(done + 1);
    if (g === 0) setAgainCount(againCount + 1);
    setFlipped(false);
    // "otra vez" reencola al final tras un pequeño delay visual
    setTimeout(() => {
      setQueue((q) => (g === 0 ? [...q.slice(1), q[0]] : q.slice(1)));
    }, 120);
  };

  /* Gestos táctiles: → Bien (grado 2) · ← Otra vez (grado 0).
     En el anverso, cualquier deslizamiento también revela la tarjeta. */
  const onTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: ReactTouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || !word) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 1.5) return; // scroll o tap
    if (!flipped) {
      setFlipped(true);
      speak(word.it, { rate: audioRate });
      return;
    }
    grade(dx > 0 ? 2 : 0);
  };

  if (!word) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-soft bg-surface p-8 text-center">
        <p className="text-4xl" aria-hidden="true">🏁</p>
        <h3 className="mt-3 font-display text-xl font-semibold">Sessione finita!</h3>
        <p className="mt-2 text-sm text-muted-it">
          {done > 0 ? `${done} tarjetas repasadas · ${againCount} marcadas "otra vez"` : "No hay tarjetas en esta cola."}
        </p>
        {done > 0 && <p className="mt-1 text-xs text-muted-it">El próximo repaso aparece en Repaso inteligente según tu memoria.</p>}
        {onExit && (
          <button onClick={onExit} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-verde px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02]">
            Torna indietro
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-verde-tenue px-3 py-1 text-xs font-bold text-verde-scuro dark:text-verde">
          {queue.length} en cola · {done} hechas
        </span>
        <button
          onClick={() => { setQueue([]); }}
          className="text-xs font-semibold text-muted-it underline-offset-2 hover:underline"
        >
          Terminar sesión
        </button>
      </div>

      {/* tarjeta */}
      <div className="[perspective:1200px]" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <motion.button
          key={currentId + String(flipped)}
          onClick={() => {
            if (!flipped) { setFlipped(true); speak(word.it, { rate: audioRate, lang }); }
          }}
          initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className={cn(
            "relative min-h-64 w-full touch-pan-y rounded-3xl border-2 p-8 text-center shadow-lg transition-colors select-none",
            flipped ? "border-verde/40 bg-verde-tenue/50" : "border-soft bg-surface"
          )}
          aria-label={flipped ? "Ver anverso" : "Revelar traducción"}
        >
          <span className="absolute left-4 top-4 rounded-full bg-inchiostro/5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-it dark:bg-inchiostro/15">
            {word.cat} · {word.level}
          </span>
          <span className="absolute right-4 top-4">
            <Volume2 className="h-4 w-4 text-muted-it" aria-hidden="true" />
          </span>

          <div className="flex min-h-48 flex-col items-center justify-center">
            {!flipped && CATEGORY_IMG[word.cat] && (
              <ThemeImg
                src={CATEGORY_IMG[word.cat]}
                alt=""
                className="mb-4 h-20 w-20 rounded-2xl border border-soft object-cover shadow-sm sm:h-24 sm:w-24"
              />
            )}
            <p className="font-display text-4xl font-semibold leading-tight">{flipped ? word.es : word.it}</p>
            {word.pron && <p className="mt-2 font-mono text-sm text-muted-it">{flipped ? word.pron : `/ ${word.pron} /`}</p>}
            {flipped && word.example.it && (
              <div className="mt-5 space-y-1.5">
                <p className="text-sm italic text-muted-it">“{word.example.it}”</p>
                <p className="text-xs text-muted-it">{word.example.es}</p>
              </div>
            )}
          </div>

          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-widest text-muted-it">
            {flipped ? "← otra vez · bien →" : "Toca para revelar"}
          </span>
        </motion.button>
      </div>

      {/* botones de grado */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4"
          >
            {GRADES.map((g) => (
              <button
                key={g.g}
                onClick={() => grade(g.g)}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-2 py-2.5 text-sm font-bold transition-all hover:scale-[1.03] active:scale-95",
                  g.cls
                )}
              >
                {g.label}
                <span className="text-[10px] font-medium opacity-70">{g.sub}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex justify-center">
        <AudioButton text={word.it} variant="full" label={lang === "it" ? "Ripeti l'audio" : "Escuchar de nuevo"} lang={lang} />
      </div>
    </div>
  );
}

/* ── Cola de repaso según vencimiento SRS ────────────────────────── */
export function useDueQueue(limit = 20): string[] {
  const srs = useLms((s) => s.srs);
  return useMemo(() => dueCards(srs).slice(0, limit).map((c) => c.wordId), [srs, limit]);
}

export function FlashcardsEmpty({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-soft bg-surface p-8 text-center">
      <p className="text-4xl" aria-hidden="true">🌱</p>
      <h3 className="mt-3 font-display text-xl font-semibold">Nessuna carta dovuta</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-it">
        No tienes tarjetas que repasar ahora mismo. Añade palabras desde <strong>Vocabulario</strong> o
        <strong> Diccionario</strong> y el algoritmo de repetición espaciada programará tus repasos.
      </p>
      <button onClick={onStart} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-verde px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02]">
        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Ir a Vocabulario
      </button>
    </div>
  );
}
