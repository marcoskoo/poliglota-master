"use client";

/* ── Reparto de voces por personaje (v9.1) ──────────────────────────
   Compartido por Letture (Dialoghi), Situazioni y Ascolto:
   · useVoiceCast: asigna una voz TTS distinta a cada hablante y se
     reconstruye cuando el navegador termina de cargar las voces.
   · SPEAKER_STYLES: color propio por hablante (turnos visibles).
   · SpeakerAvatar: burbuja con inicial del personaje.
   · VoiceCastNote: indica qué voz tiene cada personaje. */

import { useEffect, useMemo, useState } from "react";
import { Mic, Pause, Play } from "lucide-react";
import { buildCast, onVoices, speak, type SpeakerVoice } from "@/lib/lms/tts";
import type { LangCode } from "@/lib/lms/types";
import { useLms } from "@/lib/lms/store";
import { cn } from "@/lib/utils";

/** Colores por hablante (orden de primera aparición), ciclo de 5. */
export const SPEAKER_STYLES = [
  { chip: "border-azzurro/40 bg-azzurro-tenue text-azzurro-scuro dark:text-azzurro", avatar: "bg-azzurro", dot: "bg-azzurro" },
  { chip: "border-terracotta/40 bg-terracotta-tenue text-terracotta-scuro dark:text-terracotta", avatar: "bg-terracotta", dot: "bg-terracotta" },
  { chip: "border-oro/40 bg-oro-tenue text-oro-scuro dark:text-oro", avatar: "bg-oro", dot: "bg-oro" },
  { chip: "border-viola/40 bg-viola-tenue text-viola-scuro dark:text-viola", avatar: "bg-viola", dot: "bg-viola" },
  { chip: "border-rosso/40 bg-rosso-tenue text-rosso-scuro dark:text-rosso", avatar: "bg-rosso", dot: "bg-rosso" },
] as const;

export function speakerStyle(idx: number) {
  return SPEAKER_STYLES[idx % SPEAKER_STYLES.length];
}

/** Mapa personaje → índice de color (orden de aparición). */
export function speakerIndexMap(speakers: (string | undefined)[]): Record<string, number> {
  const map: Record<string, number> = {};
  let k = 0;
  for (const s of speakers) if (s && map[s] === undefined) map[s] = k++;
  return map;
}

/** Personajes únicos en orden de aparición. */
export function uniqueSpeakers(lines: { speaker?: string }[]): string[] {
  const out: string[] = [];
  for (const l of lines) if (l.speaker && !out.includes(l.speaker)) out.push(l.speaker);
  return out;
}

/** Asigna voces TTS a los personajes; se recalcula cuando cargan las voces del navegador.
 *  v9.45 · lang opcional: voces de la lengua de estudio (it por defecto). */
export function useVoiceCast(lines: { speaker?: string }[], lang: LangCode = "it"): Record<string, SpeakerVoice> {
  const speakers = useMemo(() => uniqueSpeakers(lines), [lines]);
  const key = speakers.join("¦");
  const [cast, setCast] = useState<Record<string, SpeakerVoice>>(() => buildCast(speakers, lang));
  useEffect(() => {
    const upd = () => setCast(buildCast(key ? key.split("¦") : [], lang));
    upd();
    const off = onVoices(upd);
    return () => { off(); };
  }, [key, lang]);
  return cast;
}

/** Burbuja coloreada con la inicial del personaje (turnos visibles de un vistazo). */
export function SpeakerAvatar({ speaker, idx, size = "md", active }: { speaker: string; idx: number; size?: "sm" | "md"; active?: boolean }) {
  const st = speakerStyle(idx);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full font-display font-bold uppercase text-white shadow-sm",
        st.avatar,
        size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm",
        active && "ring-2 ring-verde ring-offset-2 ring-offset-surface"
      )}
    >
      {speaker.charAt(0)}
    </span>
  );
}

/** Chip con el nombre del personaje en su color. */
export function SpeakerChip({ speaker, idx, active, className }: { speaker: string; idx: number; active?: boolean; className?: string }) {
  const st = speakerStyle(idx);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", st.chip, active && "shadow-sm", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} aria-hidden="true" />
      {speaker}
    </span>
  );
}

/** Indica el reparto de voces: qué voz del sistema tiene cada personaje. */
export function VoiceCastNote({ speakers, cast, className }: { speakers: string[]; cast: Record<string, SpeakerVoice>; className?: string }) {
  if (speakers.length < 2) return null;
  const distinct = speakers.filter((s) => cast[s]?.distinct).length;
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-verde/25 bg-verde-tenue/60 px-3.5 py-2 text-xs dark:bg-verde-tenue/30", className)}>
      <span className="flex items-center gap-1.5 font-bold text-verde-scuro dark:text-verde">
        <Mic className="h-3.5 w-3.5" aria-hidden="true" />
        {distinct >= 2 ? "Ogni personaggio ha la sua voce:" : distinct === 1 ? "Voci differenziate per tono:" : "Voci per tono:"}
      </span>
      {speakers.map((s, i) => (
        <span key={s} className="inline-flex items-center gap-1.5 text-muted-it" title={cast[s]?.voiceName}>
          <SpeakerChip speaker={s} idx={i} />
          <span className="italic">{cast[s]?.distinct ? cast[s].voiceName : distinct >= 1 ? "tono diverso" : cast[s]?.voiceName}</span>
        </span>
      ))}
    </div>
  );
}

/** Botón que reproduce UNA battuta con la voz de su personaje (no la voz por defecto). */
export function DialogueLineButton({ line, cast, rate = 0.9, className }: { line: { it: string; speaker?: string }; cast: Record<string, SpeakerVoice>; rate?: number; className?: string }) {
  const [playing, setPlaying] = useState(false);
  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaying(true);
    const p = line.speaker ? cast[line.speaker] : undefined;
    const ok = speak(line.it, {
      rate: rate * (p?.rateFactor ?? 1),
      pitch: p?.pitch ?? 1,
      voice: p?.voice ?? null,
      onEnd: () => setPlaying(false),
    });
    if (!ok) setPlaying(false);
    if (ok) useLms.getState().trackQuest("listen");
  };
  return (
    <button
      type="button"
      onClick={handle}
      aria-label={line.speaker ? `Ascoltare la battuta di ${line.speaker}` : "Ascoltare la frase"}
      title={line.speaker ? `Voci di ${line.speaker}` : "Ascolta"}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-verde/30 bg-verde-tenue text-verde-scuro transition-all hover:scale-110 active:scale-90 dark:text-verde",
        playing && "border-verde bg-verde text-white animate-pulse",
        className
      )}
    >
      {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  );
}
