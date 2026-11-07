"use client";

/* ── Control de velocidad de lectura de los diálogos (v9.46) ────────
   Botones de preset compartidos por TODOS los reproductores de
   diálogos (Letture·Dialoghi, Ascolto, Situazioni y unità Cambridge).
   · 4 velocidades: 0.75× lento · 0.9× normal · 1× · 1.2× rápido.
   · La velocidad elegida se guarda en settings.audioRate y se
     recuerda entre vistas y sesiones (compatible con el slider fino
     de Impostazioni: valores intermedios se ajustan al preset más
     cercano al abrir un diálogo).                                  */

import { useCallback, useState } from "react";
import { useLms } from "@/lib/lms/store";
import { useUi } from "@/lib/lms/ui";
import { cn } from "@/lib/utils";

export const SPEED_RATES = [0.75, 0.9, 1, 1.2] as const;

/** Velocidad inicial: el preset exacto de ajustes o el más cercano
    (el slider de Impostazioni permite valores intermedios 0.6–1.2). */
export function speedInit(settingsRate: number, fallback = 0.9): number {
  const rates = SPEED_RATES as readonly number[];
  if (rates.includes(settingsRate)) return settingsRate;
  let best = fallback;
  let bestD = Infinity;
  for (const r of rates) {
    const d = Math.abs(r - settingsRate);
    if (d < bestD) { bestD = d; best = r; }
  }
  return best;
}

interface SpeedControlProps {
  value: number;
  onChange: (rate: number) => void;
  className?: string;
  tone?: "verde" | "azzurro";   // v9.47 · azzurro = Radiogiornale
}

/** Grupo de botones 0.75× / 0.9× / 1× / 1.2× (etiquetado según lengua activa). */
export function SpeedControl({ value, onChange, className, tone = "verde" }: SpeedControlProps) {
  const u = useUi();
  return (
    <div className={cn("flex items-center gap-1", className)} role="group" aria-label={u.letture.speedAria}>
      {(SPEED_RATES as readonly number[]).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          aria-pressed={value === r}
          title={u.letture.speedAria}
          className={cn(
            "rounded-lg border-2 px-2.5 py-1.5 text-xs font-bold transition-all",
            value === r
              ? tone === "azzurro"
                ? "border-azzurro bg-azzurro/10 text-azzurro-scuro dark:text-azzurro"
                : "border-verde bg-verde-tenue text-verde-scuro dark:text-verde"
              : "border-soft text-muted-it hover:border-verde/40"
          )}
        >
          {r}×
        </button>
      ))}
    </div>
  );
}

/** Velocidad de diálogo reutilizable: estado local + persistencia en
    settings.audioRate para que se recuerde entre vistas y sesiones. */
export function useDialogueRate(fallback = 0.9) {
  const settingsRate = useLms((s) => s.settings.audioRate);
  const updateSettings = useLms((s) => s.updateSettings);
  const [rate, setRate] = useState(() => speedInit(settingsRate, fallback));
  const changeRate = useCallback((r: number) => {
    setRate(r);
    updateSettings({ audioRate: r });
  }, [updateSettings]);
  return [rate, changeRate] as const;
}
