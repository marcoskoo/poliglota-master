"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award, BookOpen, Brain, CheckCircle2, Compass, ExternalLink, GraduationCap, Landmark,
  Library, ListChecks, RotateCcw, Scale, Target,
} from "lucide-react";
import {
  ACTFL_MAP, CEFR_COMPLIANCE, CEFR_GLOBAL_SCALE, CEFR_GRID, CEFR_LEVELS, ITALIAN_CERTS,
} from "@/lib/lms/cefr";
import { CAMBRIDGE, CB_LEVEL_OF } from "@/lib/lms/cambridge";
import { langContent, levelOfUnit } from "@/lib/lms/lang";
import { CERTS_BY_LANG, LANGS, SHIPPED_LEVELS, langOfId } from "@/lib/lms/languages";
import { vocabFor } from "@/lib/lms/lang-extras";
import { lettureFor } from "@/lib/lms/letture-lang";
import { normKey } from "@/lib/lms/dict/mega-parse";
import type { LangCode } from "@/lib/lms/types";
import { GRAMMAR } from "@/lib/lms/grammar";
import { MIND_LIBRARY, mindLevel } from "@/lib/lms/extra/readings-mind";
import { CB_CLOZE } from "@/lib/lms/extra/readings-cloze";
import { useLms } from "@/lib/lms/store";
import { useUi } from "@/lib/lms/ui";
import { cn } from "@/lib/utils";
import type { CefrLevel } from "@/lib/lms/types";

/* ── Vista: Quadro MCER (v9.16 · estándares internacionales) ────────
   El QCER/MCER (Consejo de Europa, 2001 · Companion Volume 2020) es
   el estándar internacional de referencia para enseñanza, evaluación
   y certificación de lenguas. Esta vista lo hace tangible: escala
   global, autoevaluación oficial, cobertura de la app y
   certificaciones, con correspondencia ACTFL/ILR.               */

const LV: Record<CefrLevel, { chip: string; ring: string; bar: string }> = {
  A1: { chip: "bg-verde-tenue text-verde-scuro dark:text-verde", ring: "border-verde bg-verde text-white", bar: "bg-verde" },
  A2: { chip: "bg-azzurro-tenue text-azzurro-scuro dark:text-azzurro", ring: "border-azzurro bg-azzurro text-white", bar: "bg-azzurro" },
  B1: { chip: "bg-oro-tenue text-oro-scuro", ring: "border-oro bg-oro text-inchiostro", bar: "bg-oro" },
  B2: { chip: "bg-terracotta-tenue text-terracotta-scuro dark:text-terracotta", ring: "border-terracotta bg-terracotta text-white", bar: "bg-terracotta" },
  C1: { chip: "bg-rosso-tenue text-rosso-scuro dark:text-rosso", ring: "border-rosso bg-rosso text-white", bar: "bg-rosso" },
  C2: { chip: "bg-viola-tenue text-viola-scuro dark:text-viola", ring: "border-viola bg-viola text-white", bar: "bg-viola" },
};

function LevelChip({ level, className }: { level: CefrLevel; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 font-mono text-xs font-bold", LV[level].chip, className)}>
      {level}
    </span>
  );
}

export function QuadroView() {
  const userLevel = useLms((s) => s.level);
  /* v9.17 · lengua activa: cobertura, certificaciones y griglia propias */
  const activeLang = useLms((s) => s.activeLang) as LangCode;
  /* v9.18 · chrome del Quadro en la lengua de estudio */
  const u = useUi();
  const langInfo = LANGS[activeLang];
  const CERTS = CERTS_BY_LANG[activeLang];
  const cefrSelf = useLms((s) => s.cefrSelf);
  const langSelf = useMemo(
    () => Object.fromEntries(Object.entries(cefrSelf).filter(([k]) => k.startsWith(`${activeLang}:`)).map(([k, v]) => [k.slice(3), v])) as Record<string, CefrLevel>,
    [cefrSelf, activeLang]
  );
  const setCefrSelf = useLms((s) => s.setCefrSelf);
  const resetCefrSelf = useLms((s) => s.resetCefrSelf);
  const cambridgeProgress = useLms((s) => s.cambridgeProgress);
  const candoDone = useLms((s) => s.candoDone);
  const navigate = useLms((s) => s.navigate);
  const [gridLang, setGridLang] = useState<"es" | "it">("es");

  /* ── cobertura real de la app por nivel MCER (v9.45: vocabulario y
     lecturas clásicas de la lengua activa en las 5 lenguas) ── */
  const coverageData = useMemo(() => {
    const content = langContent(activeLang);
    const clozeAll = content?.cloze ?? {};
    const clozeByLevel: Record<string, number> = {};
    for (const [unitId, texts] of Object.entries(clozeAll)) {
      const lv = levelOfUnit(unitId) ?? "A1";
      clozeByLevel[lv] = (clozeByLevel[lv] ?? 0) + texts.length;
    }
    const mindEntries = Object.entries(content?.mind ?? {}).flatMap(([unitId, rs]) => rs.map((r) => ({ unitId, reading: r })));
    /* lemas por nivel de la lengua activa (VOCAB ∪ DICT, dedup por normKey) */
    const vocabByLevel: Record<string, number> = {};
    const vocabSeen = new Set<string>();
    let vocabTotal = 0;
    for (const w of vocabFor(activeLang)) {
      const k = normKey(w.it);
      if (vocabSeen.has(k)) continue;
      vocabSeen.add(k);
      vocabTotal += 1;
      vocabByLevel[w.level] = (vocabByLevel[w.level] ?? 0) + 1;
    }
    /* biblioteca clásica de la lengua activa (IT 58 · EN/PT/FR/DE 24) */
    const classicList = lettureFor(activeLang);
    const rows = CEFR_LEVELS.map((l) => {
      const units = (content?.courses ?? CAMBRIDGE).find((c) => c.level === l)?.units ?? [];
      const unitsDone = units.filter((u) => cambridgeProgress[u.id]?.done).length;
      return {
        level: l,
        units: units.length,
        unitsDone,
        grammar: activeLang === "it" ? GRAMMAR.filter((g) => g.level === l).length : Object.values(content?.deep ?? {}).length,
        vocab: vocabByLevel[l] ?? 0,
        letture: classicList.filter((t) => t.level === l).length,
        mind: mindEntries.filter((e) => (levelOfUnit(e.unitId) ?? "A1") === l).length,
        cloze: clozeByLevel[l] ?? 0,
        cando: units.reduce((n, u) => n + u.cando.length, 0),
      };
    });
    return { rows, vocabTotal };
  }, [cambridgeProgress, activeLang]);
  const coverage = coverageData.rows;

  const totalCandoDone = Object.keys(candoDone).length;
  /* lemas totales de la lengua activa (dedup VOCAB ∪ DICT) — hero chip */
  const covVocabCount = coverageData.vocabTotal;

  /* ── nivel sugerido por la griglia (mediana conservadora) ── */
  const filled = CEFR_GRID.map((r) => langSelf[r.key]).filter(Boolean) as CefrLevel[];
  const suggested = useMemo(() => {
    if (filled.length < 3) return null; // con menos de 3 destrezas no sugerimos
    const idx = filled.map((l) => CEFR_LEVELS.indexOf(l)).sort((a, b) => a - b);
    return CEFR_LEVELS[idx[Math.floor((idx.length - 1) / 2)]];
  }, [langSelf]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ═══ 1 · Qué es el QCER ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border-2 border-soft bg-surface"
      >
        <div className="bg-verde p-6 text-white sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Landmark className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{u.quadro.heroTitle}</h1>
              <p className="text-sm font-semibold text-white/85">{u.quadro.heroSub}</p>
            </div>
          </div>
          <p className="mt-4 max-w-3xl leading-relaxed text-white/95">
            {u.quadro.heroDesc}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              u.quadro.chipUnits(coverage.reduce((n, c) => n + c.units, 0), u.common.country),
              activeLang === "it" ? u.quadro.chipVocabIt : u.quadro.chipVocab(covVocabCount.toLocaleString("en-US"), u.common.studyLangName),
              activeLang === "it" ? u.quadro.chipGrammarIt : u.quadro.chipGrammar(Object.keys(langContent(activeLang)?.deep ?? {}).length),
              u.quadro.chipReadings(coverage.reduce((n, c) => n + c.mind + c.cloze + c.letture, 0)),
              u.quadro.chipCert(CERTS[0]?.name ?? "", u.common.country),
            ].map((t) => (
              <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{t}</span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ 2 · Il tuo livello ═══ */}
      <section className="rounded-3xl border border-soft bg-surface p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Target className="h-5 w-5 text-verde" aria-hidden="true" /> {u.quadro.yourLevel}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-crema p-4 dark:bg-inchiostro/5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-it">{u.quadro.placementLevel}</p>
            <p className="mt-2 font-display text-3xl font-bold">
              {userLevel ? <LevelChip level={userLevel} className="text-sm" /> : <span className="text-muted-it">—</span>}
            </p>
            <p className="mt-2 text-xs text-muted-it">
              {userLevel
                ? u.quadro.guidedHours(CEFR_GLOBAL_SCALE[userLevel].userLabel, (langContent(activeLang)?.courses ?? CAMBRIDGE).find((c) => c.level === userLevel)?.hours ?? 0)
                : u.quadro.noTestYet}
            </p>
            {activeLang === "it" && (
            <button
              onClick={() => navigate("test")}
              className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-verde px-4 py-2 text-xs font-bold text-white transition-all hover:scale-[1.03]"
            >
              <Compass className="h-3.5 w-3.5" aria-hidden="true" /> {userLevel ? u.quadro.retakeTest : u.quadro.takeTest}
            </button>
            )}
          </div>
          <div className="rounded-2xl bg-crema p-4 dark:bg-inchiostro/5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-it">{u.quadro.selfTitle}</p>
            <p className="mt-2 font-display text-3xl font-bold">
              {suggested ? <LevelChip level={suggested} className="text-sm" /> : <span className="text-muted-it">—</span>}
            </p>
            <p className="mt-2 text-xs text-muted-it">
              {filled.length === 0
                ? u.quadro.markSkills
                : `${u.quadro.skillsMarked(filled.length)}${suggested ? "" : u.quadro.skillsMin3}`}
            </p>
            <button
              onClick={() => document.getElementById("cefr-griglia")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl border-2 border-verde/40 px-4 py-2 text-xs font-bold text-verde-scuro transition-all hover:bg-verde-tenue dark:text-verde"
            >
              <ListChecks className="h-3.5 w-3.5" aria-hidden="true" /> {u.quadro.goToGrid}
            </button>
          </div>
          <div className="rounded-2xl bg-crema p-4 dark:bg-inchiostro/5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-it">{u.quadro.candoTitle}</p>
            <p className="mt-2 font-display text-3xl font-bold">{totalCandoDone}</p>
            <p className="mt-2 text-xs text-muted-it">
              {u.quadro.candoSub}
            </p>
          </div>
        </div>
        {userLevel && suggested && (
          <p className="mt-4 rounded-2xl bg-verde-tenue p-4 text-sm leading-relaxed">
            {u.quadro.compareIntro(userLevel, suggested)}{" "}
            {CEFR_LEVELS.indexOf(suggested) > CEFR_LEVELS.indexOf(userLevel)
              ? u.quadro.compareUp
              : CEFR_LEVELS.indexOf(suggested) < CEFR_LEVELS.indexOf(userLevel)
                ? u.quadro.compareDown
                : u.quadro.compareEqual}
          </p>
        )}
      </section>

      {/* ═══ 3 · Griglia di autovalutazione (interactiva) ═══ */}
      <section id="cefr-griglia" className="rounded-3xl border border-soft bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              <CheckCircle2 className="h-5 w-5 text-verde" aria-hidden="true" /> {u.quadro.gridTitle}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-it">
              {u.quadro.gridIntro}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGridLang(gridLang === "es" ? "it" : "es")}
              className="rounded-xl border-2 border-soft px-3 py-1.5 text-xs font-bold transition-all hover:border-verde/40"
            >
              {gridLang === "es" ? "ES 🇪🇸" : "IT 🇮🇹"}
            </button>
            <button
              onClick={() => resetCefrSelf()}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-soft px-3 py-1.5 text-xs font-bold transition-all hover:border-rosso/40 hover:text-rosso"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {u.quadro.clear}
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {CEFR_GRID.map((row) => {
            const chosen = langSelf[row.key];
            return (
              <div key={row.key} className="rounded-2xl border border-soft bg-crema p-4 dark:bg-inchiostro/5">
                <p className="font-bold">{gridLang === "es" ? row.skillEs : row.skillIt}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {CEFR_LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setCefrSelf(`${activeLang}:${row.key}`, chosen === l ? null : l)}
                      aria-pressed={chosen === l}
                      className={cn(
                        "min-h-10 rounded-xl border-2 font-mono text-xs font-bold transition-all",
                        chosen === l ? LV[l].ring : "border-soft bg-surface hover:border-verde/40",
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="mt-3 min-h-11">
                  {chosen ? (
                    <motion.p
                      key={`${row.key}-${chosen}-${gridLang}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-surface p-3 text-sm leading-relaxed dark:bg-inchiostro/10"
                    >
                      <LevelChip level={chosen} className="mr-2" />
                      {gridLang === "es" ? row.cells[chosen].es : row.cells[chosen].it}
                    </motion.p>
                  ) : (
                    <p className="p-1 text-xs italic text-muted-it">
                      {u.quadro.markDescriptor}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {suggested && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-verde bg-verde-tenue p-5"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-it">{u.quadro.gridResult}</p>
              <p className="mt-1 font-display text-2xl font-bold">
                {u.quadro.suggested} <LevelChip level={suggested} className="mx-1 align-middle" /> — {CEFR_GLOBAL_SCALE[suggested].userLabel}
              </p>
              <p className="mt-1 text-xs text-muted-it">
                {u.quadro.suggestedNote}
              </p>
            </div>
            <button
              onClick={() => navigate("cursos", { level: suggested })}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-verde px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-verde/25 transition-all hover:scale-[1.03]"
            >
              <GraduationCap className="h-4 w-4" aria-hidden="true" /> {u.quadro.continueAt(suggested)}
            </button>
          </motion.div>
        )}
      </section>

      {/* ═══ 4 · Scala globale ufficiale ═══ */}
      <section className="rounded-3xl border border-soft bg-surface p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Scale className="h-5 w-5 text-oro" aria-hidden="true" /> {u.quadro.scaleTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-it">
          {u.quadro.scaleIntro}
        </p>
        <div className="mt-5 space-y-3">
          {CEFR_LEVELS.map((l) => {
            const e = CEFR_GLOBAL_SCALE[l];
            const mine = userLevel === l;
            const cov = coverage.find((c) => c.level === l)!;
            return (
              <div
                key={l}
                className={cn(
                  "rounded-2xl border p-4 sm:p-5",
                  mine ? "border-verde bg-verde-tenue/40" : "border-soft bg-crema dark:bg-inchiostro/5",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <LevelChip level={l} />
                  <p className="font-display font-bold">{e.label}</p>
                  {mine && (
                    <span className="rounded-full bg-verde px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {u.quadro.yourLevelTag}
                    </span>
                  )}
                  <span className="ml-auto font-mono text-xs font-bold text-muted-it">
                    {u.quadro.guidedH(e.hoursGuided[0], e.hoursGuided[1])}
                  </span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed">{e.es}</p>
                <p className="mt-1.5 text-sm italic leading-relaxed text-muted-it">{e.it}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] font-bold text-muted-it">
                  <span>{cov.units} {u.quadro.covUnits}</span>
                  <span>{cov.grammar} {u.quadro.covGrammar}</span>
                  <span>{cov.vocab.toLocaleString(activeLang === "en" ? "en-US" : activeLang === "pt" ? "pt-PT" : "it-IT")} {u.quadro.covEntries}</span>
                  <span>{cov.letture + cov.mind} {u.quadro.covReadings}</span>
                  {mine && <span className="text-verde-scuro dark:text-verde">{u.quadro.covDone(cov.unitsDone, cov.units)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ 5 · Copertura dell'app ═══ */}
      <section className="rounded-3xl border border-soft bg-surface p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Library className="h-5 w-5 text-verde-scuro" aria-hidden="true" /> {u.quadro.covTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-it">
          {u.quadro.covIntro}
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-soft">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-soft bg-crema text-left font-mono text-xs font-bold uppercase tracking-wide dark:bg-inchiostro/10">
                <th className="p-3">{u.quadro.th.level}</th>
                <th className="p-3">{u.quadro.th.units}</th>
                <th className="p-3">{u.quadro.th.grammar}</th>
                <th className="p-3">{u.quadro.th.vocab}</th>
                <th className="p-3">{u.quadro.th.classic}</th>
                <th className="p-3">{u.quadro.th.themed}</th>
                <th className="p-3">{u.quadro.th.cloze}</th>
                <th className="p-3">{u.quadro.th.cando}</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((c) => {
                const lv = CAMBRIDGE.find((x) => x.level === c.level);
                return (
                  <tr key={c.level} className="border-b border-soft last:border-0">
                    <td className="p-3">
                      <LevelChip level={c.level} />
                      <p className="mt-1 text-[11px] font-semibold text-muted-it">{lv?.label}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{c.unitsDone}/{c.units}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-inchiostro/10">
                        <div
                          className={cn("h-full rounded-full", LV[c.level].bar)}
                          style={{ width: c.units ? `${(c.unitsDone / c.units) * 100}%` : "0%" }}
                        />
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold">{c.grammar}</td>
                    <td className="p-3 font-mono font-bold">{c.vocab.toLocaleString("it-IT")}</td>
                    <td className="p-3 font-mono font-bold">{c.letture}</td>
                    <td className="p-3 font-mono font-bold">{c.mind}</td>
                    <td className="p-3 font-mono font-bold">{c.cloze}</td>
                    <td className="p-3 font-mono font-bold">{c.cando}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-it">
          {u.quadro.covNote}
        </p>
      </section>

      {/* ═══ 6 · Certificazioni ═══ */}
      <section className="rounded-3xl border border-soft bg-surface p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Award className="h-5 w-5 text-rosso" aria-hidden="true" /> {u.quadro.certsTitle(activeLang === "it" ? langInfo.variantEs : langInfo.variant)}
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-it">
          {u.quadro.certsIntro(u.common.studyLangName, u.common.country)}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {CERTS.map((cert) => (
            <div key={cert.id} className={cn(
              "flex flex-col rounded-2xl border-2 p-5",
              cert.appPrep ? "border-verde/50 bg-verde-tenue/30" : "border-soft bg-crema dark:bg-inchiostro/5",
            )}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-xl font-bold">{cert.name}</p>
                {cert.appPrep && (
                  <span className="rounded-full bg-verde px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    {u.quadro.prepIncluded}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs font-semibold text-muted-it">{cert.body}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed">{cert.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cert.levels.map((l) => (
                  <LevelChip key={l} level={l} className="px-2 py-0.5 text-[10px]" />
                ))}
              </div>
              <ul className="mt-3 space-y-1">
                {cert.extras.map((x) => (
                  <li key={x} className="text-xs text-muted-it">• {x}</li>
                ))}
              </ul>
              <p className="mt-3 flex items-center gap-1 font-mono text-[11px] font-bold text-muted-it">
                <ExternalLink className="h-3 w-3" aria-hidden="true" /> {cert.site}
              </p>
              {cert.appPrep && (
                <button
                  onClick={() => navigate("cils")}
                  className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-verde px-4 py-2.5 text-xs font-bold text-white transition-all hover:scale-[1.02]"
                >
                  <GraduationCap className="h-4 w-4" aria-hidden="true" /> Apri la preparazione CILS
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 7 · Confronto internazionale CEFR ↔ ACTFL ↔ ILR ═══ */}
      <section className="rounded-3xl border border-soft bg-surface p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Compass className="h-5 w-5 text-azzurro-scuro dark:text-azzurro" aria-hidden="true" /> {u.quadro.intlTitle}
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-it">
          {u.quadro.intlIntro}
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-soft">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-soft bg-crema text-left font-mono text-xs font-bold uppercase tracking-wide dark:bg-inchiostro/10">
                <th className="p-3">{u.quadro.thCefr}</th>
                <th className="p-3">{u.quadro.thActfl}</th>
                <th className="p-3">{u.quadro.thIlr}</th>
              </tr>
            </thead>
            <tbody>
              {ACTFL_MAP.map((r) => (
                <tr key={r.cefr} className="border-b border-soft last:border-0">
                  <td className="p-3"><LevelChip level={r.cefr} /></td>
                  <td className="p-3 font-semibold">{r.actfl}</td>
                  <td className="p-3">{r.ilr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 rounded-xl bg-crema-scura p-3 text-xs leading-relaxed text-muted-it dark:bg-inchiostro/10">
          {u.quadro.rigorNoteA}{" "}
          {u.quadro.rigorNoteB}
        </p>
      </section>

      {/* ═══ 8 · Cómo la app aplica el estándar ═══ */}
      <section className="rounded-3xl border border-soft bg-surface p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <BookOpen className="h-5 w-5 text-verde" aria-hidden="true" /> {u.quadro.applyTitle}
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-it">
          {u.quadro.applyIntro}
        </p>
        <div className="mt-5 space-y-3">
          {(u.quadro.compliance.length > 0 ? u.quadro.compliance : CEFR_COMPLIANCE).map((c, i) => (
            <motion.div
              key={c.point}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 rounded-2xl bg-crema p-4 dark:bg-inchiostro/5"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-verde" aria-hidden="true" />
              <div>
                <p className="font-bold">{c.point}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-it">{c.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => navigate("cursos")}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-verde px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-verde/25 transition-all hover:scale-[1.03]"
          >
            <GraduationCap className="h-4 w-4" aria-hidden="true" /> {u.quadro.backToPath}
          </button>
          <button
            onClick={() => navigate("cils")}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-verde/40 px-5 py-2.5 text-sm font-bold text-verde-scuro transition-all hover:bg-verde-tenue dark:text-verde"
          >
            <Brain className="h-4 w-4" aria-hidden="true" /> Preparazione CILS
          </button>
        </div>
      </section>
    </div>
  );
}
