import type { VocabWord, WordType, WordCategory } from "../types";

/* ═══ v9.42 · Parser «mega» · ampliación a 10.000 palabras/lengua ═══
   v9.43 · objetivo CEFR C2: 16.000 palabras/lengua — ahora también A1/A2.
   Formato corto por líneas (sin ejemplo, IPA opcional):

     word|es|ipa|T|cat|LVL[|extras]

   · LVL  → A1 | A2 | B1 | B2 | C1 | C2 (explícito)
   · ipa  → puede quedar vacía (la tarjeta la omite)
   · extras → p= plural · g= m|f · n= nota · ff=1 (falso amigo)
              s= sinónimos · a= antónimos · rel= relacionados
              r= inf|neu|for|col|let|tec · c= colocaciones
   · example → { it: "", es: "" }: la UI oculta el bloque si está vacío
   · id → <prefix>-m<lvl>-<slug>: jamás colisiona con base/plus
   El pack se concatena con dedupMerge(): la primera ocurrencia de
   cada lema gana (base → plus → mega), igual que buildDictionary. */

const TYPE: Record<string, WordType> = {
  S: "sostantivo", V: "verbo", A: "aggettivo", D: "avverbio", E: "espressione",
  P: "pronome", R: "preposizione", C: "congiunzione", T: "articolo",
  N: "numerale", I: "interiezione", L: "locuzione",
};
const CAT: Record<string, WordCategory> = {
  sal: "saluti", fam: "famiglia", cas: "casa", ali: "alimentazione", cmp: "compras",
  tra: "transporte", vig: "viaggi", htl: "hotel", sla: "salud", lav: "lavoro",
  stu: "studi", cit: "citta", cli: "clima", rop: "ropa", tec: "tecnologia",
  spt: "sport", mus: "musica", cin: "cinema", rel: "relazioni", fin: "finanze",
  ris: "ristorante", pro: "professioni", att: "attualita", sci: "scienza",
  let: "letteratura", col: "colori", cor: "corpo", ani: "animali", nat: "natura",
  tmp: "tempo", sve: "svago", emo: "emozioni", cmu: "comunicazione",
  ist: "istituzioni", cnn: "connettivi", ast: "astratto", art: "arte",
};
const REG: Record<string, NonNullable<VocabWord["register"]>> = {
  inf: "informale", neu: "neutro", for: "formale", col: "colloquiale",
  let: "letterario", tec: "tecnico",
};
const FREQ: Record<string, 1 | 2 | 3> = { A1: 3, A2: 3, B1: 3, B2: 2, C1: 2, C2: 1 };

/** Llave de deduplicación de lemas: minúsculas, sin acentos/espacios/apóstrofes. */
export function normKey(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’\s]/g, "");
}

function slug(w: string): string {
  return w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/['’\s]+/g, "-").replace(/[^a-z0-9-]/g, "")
    .replace(/(^-|-$)/g, "");
}

export function parseMega(lines: string, prefix: string): VocabWord[] {
  const out: VocabWord[] = [];
  const seen = new Set<string>();
  for (const raw of lines.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    /* v9.42: varias entradas por línea separadas por « ~ » (densidad):
       el separador no aparece nunca en el contenido léxico. */
    for (const piece of line.split("~")) {
      const entry = piece.trim();
      if (!entry) continue;
      const f = entry.split("|");
      if (f.length < 6) continue;
      const lvl = (f[5] ?? "").trim().toUpperCase();
      if (!/^(A1|A2|B1|B2|C1|C2)$/.test(lvl)) continue;
      const word = f[0].trim();
      const es = f[1].trim();
      if (!word || !es) continue;
      const id = `${prefix}-m${lvl.toLowerCase()}-${slug(word)}`;
      if (seen.has(id)) continue; // dedup por id dentro del pack
      seen.add(id);
      const extras = new Map<string, string>();
      for (const kv of (f[6] ?? "").split(";")) {
        const i = kv.indexOf("=");
        if (i > 0) extras.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim());
      }
      const ipa = (f[2] ?? "").trim();
      const w: VocabWord = {
        id,
        it: word,
        es,
        pron: ipa,
        ipa: ipa || undefined,
        type: TYPE[(f[3] ?? "").trim()] ?? "sostantivo",
        cat: CAT[(f[4] ?? "").trim()] ?? "astratto",
        level: lvl as VocabWord["level"],
        freq: FREQ[lvl],
        example: { it: "", es: "" },
      };
      const g = extras.get("g");
      if (g === "m" || g === "f") w.gender = g;
      if (extras.get("p")) w.plural = extras.get("p");
      if (extras.get("n")) w.note = extras.get("n");
      if (extras.get("ff") === "1") w.ff = true;
      if (extras.get("s")) w.syn = extras.get("s")!.split(",").map((x) => x.trim()).filter(Boolean);
      if (extras.get("a")) w.ant = extras.get("a")!.split(",").map((x) => x.trim()).filter(Boolean);
      if (extras.get("rel")) w.related = extras.get("rel")!.split(",").map((x) => x.trim()).filter(Boolean);
      if (REG[extras.get("r") ?? ""]) w.register = REG[extras.get("r")!];
      if (extras.get("c")) w.collocations = extras.get("c")!.split(",").map((x) => x.trim()).filter(Boolean);
      out.push(w);
    }
  }
  return out;
}

/** Fusión con deduplicación por lema: la PRIMERA ocurrencia gana.
    Orden de llamada: base → plus → mega (las entradas más ricas primero). */
export function dedupMerge(...lists: VocabWord[][]): VocabWord[] {
  const seen = new Set<string>();
  const out: VocabWord[] = [];
  for (const list of lists) {
    for (const w of list) {
      const k = normKey(w.it);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(w);
    }
  }
  return out;
}
