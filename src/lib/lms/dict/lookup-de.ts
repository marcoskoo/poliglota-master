import type { VocabWord, WordType } from "../types";
import { getDEDict } from "./lang-de";

/* ═══ DE lemmatizer didáctico · Deutsch → español ══════════════════
   Espejo del portugués (lookup-pt.ts): heurística didáctica, no un
   lematizador completo. Orden: limpieza → caso formal (Sie/Ihnen) →
   índice raw (diacríticos intactos: distingue schön/schon) →
   SUPPLEMENT de funcionales (der/die/das, ich, nicht, ist…) →
   índice normalizado (ä→a, ö→o, ü→u, ß→ss) → irregulares →
   plurales y declinación de caso (-e/-en/-er/-s/-nen/-em/-es) →
   verbos (ge-…-t, ge-…-en, pretérito -te, presente -e/-st/-t,
   pretéritos con cambio vocálico vía IRREGULAR) → -ung.           */

/* ── índices perezosos ──────────────────────────────────────────────── */
let IDX: Map<string, VocabWord> | null = null;    // claves normalizadas
let RAWIDX: Map<string, VocabWord> | null = null; // claves con diacríticos

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function rawKey(s: string): string {
  return s.toLowerCase().replace(/ß/g, "ss");
}

function index(): Map<string, VocabWord> {
  if (IDX) return IDX;
  IDX = new Map<string, VocabWord>();
  for (const w of getDEDict()) {
    const key = norm(w.it);
    if (!IDX.has(key)) IDX.set(key, w);
  }
  return IDX;
}

function rawIndex(): Map<string, VocabWord> {
  if (RAWIDX) return RAWIDX;
  RAWIDX = new Map<string, VocabWord>();
  for (const w of getDEDict()) {
    const key = rawKey(w.it);
    if (!RAWIDX.has(key)) RAWIDX.set(key, w);
  }
  return RAWIDX;
}

function find(form: string): VocabWord | undefined {
  return index().get(norm(form));
}

/* ── índice de sustantivos sin artículo: "das Kind" → clave "Kind" ──
   Los lemas alemanes se guardan CON artículo (el género se aprende
   con cada sustantivo); los textos flexionan el sustantivo solo.   */
let BAREIDX: Map<string, VocabWord> | null = null;

function bareIndex(): Map<string, VocabWord> {
  if (BAREIDX) return BAREIDX;
  BAREIDX = new Map<string, VocabWord>();
  for (const w of getDEDict()) {
    const m = w.it.match(/^(?:der|die|das)\s+(.+)$/);
    if (m) {
      const key = rawKey(m[1]);
      if (!BAREIDX.has(key)) BAREIDX.set(key, w);
    }
  }
  return BAREIDX;
}

function findBare(form: string): VocabWord | undefined {
  return bareIndex().get(rawKey(form));
}

/* ── suplemento: funcionales, artículos de caso, números, días, meses ── */
type SupKind = "fw" | "sup";
interface SupInfo {
  es: string;
  type: WordType;
  exIt?: string; // ejemplo en alemán
  exEs?: string;
  note?: string;
  w?: string; // forma canónica con diacríticos (p. ej. für, fünf, März)
}

/* Formas con mayúscula distintiva, comprobadas ANTES de minúsculas */
const CASE_PRECHECK: Record<string, SupInfo> = {
  Sie: { es: "usted / ustedes (formal)", type: "pronome", exIt: "Wie heißen Sie?", exEs: "¿Cómo se llama usted?", note: "siempre con mayúscula en cartas y correos" },
  Ihnen: { es: "a usted (dativo de Sie)", type: "pronome", exIt: "Wie geht es Ihnen?", exEs: "¿Cómo está usted?" },
};

const SUPPLEMENT: Record<string, SupInfo> = {
  /* artículos determinados e indeterminados (nominativo + casos) */
  der: { es: "el (artículo masculino)", type: "articolo", exIt: "Der Zug fährt um acht.", exEs: "El tren sale a las ocho.", note: "el género se aprende con cada sustantivo" },
  die: { es: "la / los-las (plural)", type: "articolo", exIt: "Die Sonne scheint. Die Kinder spielen.", exEs: "El sol brilla. Los niños juegan.", note: "die también forma todos los plurales" },
  das: { es: "el-lo (artículo neutro)", type: "articolo", exIt: "Das Kind schläft.", exEs: "El niño duerme.", note: "neutros: palabras en -chen y -lein" },
  den: { es: "el (acusativo masc.) / a el", type: "articolo", exIt: "Ich sehe den Mann.", exEs: "Veo al hombre." },
  dem: { es: "al / del (dativo)", type: "articolo", exIt: "Ich helfe dem Kind.", exEs: "Ayudo al niño." },
  des: { es: "del (genitivo)", type: "articolo", exIt: "Das Auto des Nachbarn ist rot.", exEs: "El coche del vecino es rojo." },
  ein: { es: "un", type: "articolo", exIt: "Ein Kaffee, bitte.", exEs: "Un café, por favor." },
  eine: { es: "una", type: "articolo", exIt: "Eine Cola, bitte.", exEs: "Una cola, por favor." },
  einen: { es: "un (acusativo masc.)", type: "articolo", exIt: "Ich möchte einen Tee.", exEs: "Quisiera un té." },
  einem: { es: "a un (dativo)", type: "articolo", exIt: "Ich komme aus einem kleinen Dorf.", exEs: "Vengo de un pueblo pequeño." },
  eines: { es: "de un (genitivo)", type: "articolo", exIt: "Der Preis eines Tickets.", exEs: "El precio de una entrada." },
  /* pronombres personales y posesivos */
  ich: { es: "yo", type: "pronome", exIt: "Ich heiße Laura.", exEs: "Me llamo Laura." },
  du: { es: "tú", type: "pronome", exIt: "Wie heißt du?", exEs: "¿Cómo te llamas?" },
  er: { es: "él", type: "pronome", exIt: "Er ist Lehrer.", exEs: "Él es profesor." },
  sie: { es: "ella / ellos-ellas", type: "pronome", exIt: "Sie ist Ärztin. Sie kommen um acht.", exEs: "Ella es médica. Ellos llegan a las ocho.", note: "«Sie» con mayúscula = usted" },
  es: { es: "ello / eso (impersonal)", type: "pronome", exIt: "Es ist kalt heute.", exEs: "Hoy hace frío." },
  wir: { es: "nosotros", type: "pronome", exIt: "Wir wohnen in Bonn.", exEs: "Vivimos en Bonn." },
  ihr: { es: "vosotros / su (de ella)", type: "pronome", exIt: "Wo wohnt ihr?", exEs: "¿Dónde vivís?", note: "también posesivo: ihr Bruder = su hermano (de ella)" },
  man: { es: "uno / se (impersonal)", type: "pronome", exIt: "Man spricht hier Deutsch.", exEs: "Aquí se habla alemán." },
  mein: { es: "mi", type: "aggettivo", exIt: "Mein Bruder heißt Tim.", exEs: "Mi hermano se llama Tim." },
  meine: { es: "mi (femenino / plural)", type: "aggettivo", exIt: "Meine Mutter kocht.", exEs: "Mi madre cocina." },
  dein: { es: "tu", type: "aggettivo", exIt: "Wie heißt dein Hund?", exEs: "¿Cómo se llama tu perro?" },
  deine: { es: "tu (femenino / plural)", type: "aggettivo", exIt: "Deine Jacke ist schön.", exEs: "Tu chaqueta es bonita." },
  unser: { es: "nuestro", type: "aggettivo", exIt: "Unser Haus ist klein.", exEs: "Nuestra casa es pequeña." },
  euer: { es: "vuestro", type: "aggettivo", exIt: "Wo ist euer Auto?", exEs: "¿Dónde está vuestro coche?" },
  kein: { es: "ningún / no… (negación con sustantivo)", type: "aggettivo", exIt: "Ich habe kein Auto.", exEs: "No tengo coche." },
  keine: { es: "ninguna / no… (fem. o plural)", type: "aggettivo", exIt: "Ich habe keine Zeit.", exEs: "No tengo tiempo." },
  alles: { es: "todo", type: "pronome", exIt: "Alles klar!", exEs: "¡Todo en orden!" },
  etwas: { es: "algo / un poco", type: "pronome", exIt: "Möchtest du etwas essen?", exEs: "¿Quieres comer algo?" },
  nichts: { es: "nada", type: "pronome", exIt: "Ich habe nichts gesagt.", exEs: "No he dicho nada." },
  mehr: { es: "más (cantidad)", type: "avverbio", exIt: "Ich brauche mehr Zeit.", exEs: "Necesito más tiempo." },
  /* sein / haben / werden (los funcionales verbales) */
  sein: { es: "ser", type: "verbo", exIt: "Ich bin müde.", exEs: "Estoy cansado.", note: "también posesivo «sein» = su (de él)" },
  ist: { es: "es (sein)", type: "verbo", exIt: "Das ist mein Bruder.", exEs: "Este es mi hermano." },
  sind: { es: "son / somos / sois (sein)", type: "verbo", exIt: "Wir sind Studenten.", exEs: "Somos estudiantes." },
  haben: { es: "tener", type: "verbo", exIt: "Ich habe Zeit.", exEs: "Tengo tiempo." },
  hat: { es: "tiene (haben)", type: "verbo", exIt: "Er hat Hunger.", exEs: "Tiene hambre." },
  habe: { es: "tengo (haben)", type: "verbo", exIt: "Ich habe eine Frage.", exEs: "Tengo una pregunta." },
  werden: { es: "llegar a ser / auxiliar del futuro", type: "verbo", exIt: "Ich werde Arzt. Ich werde kommen.", exEs: "Voy a ser médico. Vendré." },
  /* negación, conjunciones, respuestas */
  nicht: { es: "no (negación)", type: "avverbio", exIt: "Ich verstehe nicht.", exEs: "No entiendo." },
  und: { es: "y", type: "congiunzione", exIt: "Tee und Kaffee.", exEs: "Té y café." },
  aber: { es: "pero", type: "congiunzione", exIt: "Ich mag Kaffee, aber ohne Zucker.", exEs: "Me gusta el café, pero sin azúcar." },
  oder: { es: "o", type: "congiunzione", exIt: "Tee oder Kaffee?", exEs: "¿Té o café?" },
  weil: { es: "porque (verbo al final)", type: "congiunzione", exIt: "Ich bleibe zu Hause, weil ich müde bin.", exEs: "Me quedo en casa porque estoy cansado." },
  dass: { es: "que (conjunción)", type: "congiunzione", exIt: "Ich denke, dass er kommt.", exEs: "Creo que él viene.", note: "siempre coma antes de la subordinada" },
  ob: { es: "si (interrogativo indirecto)", type: "congiunzione", exIt: "Ich weiß nicht, ob er kommt.", exEs: "No sé si viene." },
  denn: { es: "pues / es que (pregunta)", type: "congiunzione", exIt: "Wie spät ist es denn?", exEs: "¿Qué hora es, pues?" },
  doch: { es: "sin embargo / sí que (réplica)", type: "avverbio", exIt: "Kommst du nicht? — Doch!", exEs: "¿No vienes? — ¡Sí que voy!" },
  ja: { es: "sí", type: "avverbio", exIt: "Ja, gerne!", exEs: "¡Sí, con gusto!" },
  nein: { es: "no (respuesta)", type: "avverbio", exIt: "Nein, danke.", exEs: "No, gracias." },
  /* cortesía */
  bitte: { es: "por favor / de nada", type: "avverbio", exIt: "Einen Kaffee, bitte. — Danke! — Bitte!", exEs: "Un café, por favor. — ¡Gracias! — ¡De nada!" },
  danke: { es: "gracias", type: "interiezione", exIt: "Danke schön!", exEs: "¡Muchas gracias!" },
  gern: { es: "con gusto (gustar hacer algo)", type: "avverbio", exIt: "Ich trinke gern Tee.", exEs: "Me gusta beber té." },
  gerne: { es: "con gusto (variante de gern)", type: "avverbio", exIt: "Gerne, ich komme mit!", exEs: "¡Claro, voy contigo!" },
  /* adverbios y deixis */
  sehr: { es: "muy", type: "avverbio", exIt: "Das ist sehr interessant.", exEs: "Eso es muy interesante." },
  auch: { es: "también", type: "avverbio", exIt: "Ich komme auch mit.", exEs: "Yo también voy." },
  noch: { es: "todavía / aún / más", type: "avverbio", exIt: "Noch ein Bier, bitte.", exEs: "Una cerveza más, por favor." },
  schon: { es: "ya", type: "avverbio", exIt: "Ich habe schon gegessen.", exEs: "Ya he comido.", note: "no confundir con «schön» = bonito" },
  immer: { es: "siempre", type: "avverbio", exIt: "Er kommt immer zu spät.", exEs: "Siempre llega tarde." },
  bald: { es: "pronto", type: "avverbio", exIt: "Der Bus kommt bald.", exEs: "El autobús no tarda." },
  warum: { es: "por qué", type: "avverbio", exIt: "Warum lernst du Deutsch?", exEs: "¿Por qué aprendes alemán?" },
  wenn: { es: "si / cuando (condicional)", type: "congiunzione", exIt: "Wenn es regnet, bleibe ich da.", exEs: "Si llueve, me quedo." },
  wie: { es: "cómo / como", type: "avverbio", exIt: "Wie heißt du?", exEs: "¿Cómo te llamas?" },
  was: { es: "qué", type: "pronome", exIt: "Was machst du?", exEs: "¿Qué haces?" },
  wo: { es: "dónde", type: "avverbio", exIt: "Wo wohnst du?", exEs: "¿Dónde vives?" },
  hier: { es: "aquí", type: "avverbio", exIt: "Ich warte hier.", exEs: "Espero aquí." },
  dort: { es: "allí", type: "avverbio", exIt: "Das Café ist dort.", exEs: "La cafetería está allí." },
  /* preposiciones y contracciones */
  von: { es: "de / desde", type: "preposizione", exIt: "Ich komme von der Arbeit.", exEs: "Vengo del trabajo." },
  zu: { es: "a / hacia", type: "preposizione", exIt: "Ich fahre zu meiner Oma.", exEs: "Voy a casa de mi abuela." },
  mit: { es: "con", type: "preposizione", exIt: "Ich fahre mit dem Bus.", exEs: "Voy en autobús." },
  nach: { es: "después de / a (ciudades)", type: "preposizione", exIt: "Nach der Arbeit gehe ich nach Hause.", exEs: "Después del trabajo voy a casa." },
  bei: { es: "en / cerca de / en casa de", type: "preposizione", exIt: "Ich wohne bei meiner Tante.", exEs: "Vivo en casa de mi tía." },
  aus: { es: "de / desde (origen)", type: "preposizione", exIt: "Ich komme aus Spanien.", exEs: "Soy de España." },
  fur: { w: "für", es: "para / por", type: "preposizione", exIt: "Ein Geschenk für dich.", exEs: "Un regalo para ti." },
  um: { es: "a (hora) / alrededor de", type: "preposizione", exIt: "Der Film beginnt um acht.", exEs: "La película empieza a las ocho." },
  seit: { es: "desde (hace)", type: "preposizione", exIt: "Ich lerne seit einem Jahr Deutsch.", exEs: "Aprendo alemán desde hace un año." },
  gegen: { es: "contra / hacia (aproximado)", type: "preposizione", exIt: "Ich bin gegen den Vorschlag.", exEs: "Estoy en contra de la propuesta." },
  ohne: { es: "sin", type: "preposizione", exIt: "Kaffee ohne Zucker, bitte.", exEs: "Café sin azúcar, por favor." },
  uber: { w: "über", es: "sobre / por encima de / acerca de", type: "preposizione", exIt: "Das Bild hängt über dem Sofa.", exEs: "El cuadro cuelga sobre el sofá." },
  unter: { es: "bajo / entre", type: "preposizione", exIt: "Die Katze ist unter dem Tisch.", exEs: "El gato está bajo la mesa." },
  auf: { es: "sobre / encima de / a", type: "preposizione", exIt: "Das Buch liegt auf dem Tisch.", exEs: "El libro está sobre la mesa." },
  an: { es: "en / junto a", type: "preposizione", exIt: "Die Lampe ist an der Wand.", exEs: "La lámpara está en la pared." },
  in: { es: "en / dentro de", type: "preposizione", exIt: "Ich wohne in Madrid.", exEs: "Vivo en Madrid." },
  im: { es: "en el (in dem)", type: "preposizione", exIt: "Im Sommer fahre ich weg.", exEs: "En verano me voy." },
  am: { es: "en el / a el (an dem)", type: "preposizione", exIt: "Am Montag habe ich frei.", exEs: "El lunes tengo libre." },
  zum: { es: "al (zu dem)", type: "preposizione", exIt: "Ich gehe zum Arzt.", exEs: "Voy al médico." },
  zur: { es: "a la (zu der)", type: "preposizione", exIt: "Wir fahren zur Schule.", exEs: "Vamos a la escuela." },
  vom: { es: "del (von dem)", type: "preposizione", exIt: "Das Auto vom Nachbarn.", exEs: "El coche del vecino." },
  ins: { es: "al / en el (in das)", type: "preposizione", exIt: "Wir gehen ins Kino.", exEs: "Vamos al cine." },
  /* números */
  eins: { es: "uno", type: "numerale", exIt: "Ich nehme nur eins.", exEs: "Solo tomo uno." },
  zwei: { es: "dos", type: "numerale", exIt: "Zwei Tickets, bitte.", exEs: "Dos billetes, por favor." },
  drei: { es: "tres", type: "numerale", exIt: "Drei Minuten noch!", exEs: "¡Tres minutos más!" },
  vier: { es: "cuatro", type: "numerale", exIt: "Wir sind zu viert — vier Freunde.", exEs: "Somos cuatro amigos." },
  funf: { w: "fünf", es: "cinco", type: "numerale", exIt: "Ich komme um fünf.", exEs: "Vengo a las cinco." },
  sechs: { es: "seis", type: "numerale", exIt: "Es ist sechs Uhr.", exEs: "Son las seis." },
  sieben: { es: "siete", type: "numerale", exIt: "Sieben Tage eine Woche.", exEs: "Siete días tiene la semana." },
  acht: { es: "ocho", type: "numerale", exIt: "Der Zug fährt um acht.", exEs: "El tren sale a las ocho." },
  neun: { es: "nueve", type: "numerale", exIt: "Das Museum öffnet um neun.", exEs: "El museo abre a las nueve." },
  zehn: { es: "diez", type: "numerale", exIt: "Ich habe zehn Euro dabei.", exEs: "Llevo diez euros encima." },
  elf: { es: "once", type: "numerale", exIt: "Es ist fünf elf.", exEs: "Son las once y cinco." },
  zwolf: { w: "zwölf", es: "doce", type: "numerale", exIt: "Meine Schwester ist zwölf.", exEs: "Mi hermana tiene doce años." },
  dreizehn: { es: "trece", type: "numerale", exIt: "Der Dreizehnte ist ein Freitag.", exEs: "El día trece es viernes." },
  zwanzig: { es: "veinte", type: "numerale", exIt: "Das kostet zwanzig Euro.", exEs: "Eso cuesta veinte euros." },
  dreissig: { w: "dreißig", es: "treinta", type: "numerale", exIt: "Ich bin dreißig Jahre alt.", exEs: "Tengo treinta años." },
  vierzig: { es: "cuarenta", type: "numerale", exIt: "Es ist vierzig nach acht.", exEs: "Son las ocho y cuarenta." },
  funfzig: { w: "fünfzig", es: "cincuenta", type: "numerale", exIt: "Die Firma hat fünfzig Mitarbeiter.", exEs: "La empresa tiene cincuenta empleados." },
  hundert: { es: "cien / cientos", type: "numerale", exIt: "Der Turm ist hundert Meter hoch.", exEs: "La torre mide cien metros." },
  tausend: { es: "mil", type: "numerale", exIt: "Tausend Dank!", exEs: "¡Mil gracias!" },
  /* días de la semana */
  montag: { w: "Montag", es: "lunes", type: "sostantivo", exIt: "Am Montag arbeite ich.", exEs: "El lunes trabajo." },
  dienstag: { w: "Dienstag", es: "martes", type: "sostantivo", exIt: "Dienstag habe ich einen Termin.", exEs: "El martes tengo una cita." },
  mittwoch: { w: "Mittwoch", es: "miércoles", type: "sostantivo", exIt: "Am Mittwoch ist Markt.", exEs: "El miércoles hay mercado." },
  donnerstag: { w: "Donnerstag", es: "jueves", type: "sostantivo", exIt: "Donnerstags essen wir Fisch.", exEs: "Los jueves comemos pescado." },
  freitag: { w: "Freitag", es: "viernes", type: "sostantivo", exIt: "Am Freitag gehen wir ins Kino.", exEs: "El viernes vamos al cine." },
  samstag: { w: "Samstag", es: "sábado", type: "sostantivo", exIt: "Am Samstag schlafe ich lange.", exEs: "El sábado duermo hasta tarde.", note: "en el norte también «Sonnabend»" },
  sonntag: { w: "Sonntag", es: "domingo", type: "sostantivo", exIt: "Sonntags bleibe ich zu Hause.", exEs: "Los domingos me quedo en casa." },
  /* meses */
  januar: { w: "Januar", es: "enero", type: "sostantivo", exIt: "Im Januar ist es kalt.", exEs: "En enero hace frío." },
  februar: { w: "Februar", es: "febrero", type: "sostantivo", exIt: "Der Februar ist kurz.", exEs: "Febrero es corto." },
  marz: { w: "März", es: "marzo", type: "sostantivo", exIt: "Im März beginnt der Frühling.", exEs: "En marzo empieza la primavera." },
  april: { w: "April", es: "abril", type: "sostantivo", exIt: "Aprilwetter ist wechselhaft.", exEs: "El tiempo de abril es cambiante." },
  mai: { w: "Mai", es: "mayo", type: "sostantivo", exIt: "Der Mai bringt Blumen.", exEs: "Mayo trae flores." },
  juni: { w: "Juni", es: "junio", type: "sostantivo", exIt: "Im Juni sind die Nächte kurz.", exEs: "En junio las noches son cortas." },
  juli: { w: "Juli", es: "julio", type: "sostantivo", exIt: "Im Juli fahren wir in Urlaub.", exEs: "En julio nos vamos de vacaciones." },
  august: { w: "August", es: "agosto", type: "sostantivo", exIt: "Der August ist warm.", exEs: "Agosto es caluroso." },
  september: { w: "September", es: "septiembre", type: "sostantivo", exIt: "Im September beginnt die Schule.", exEs: "En septiembre empieza la escuela." },
  oktober: { w: "Oktober", es: "octubre", type: "sostantivo", exIt: "Im Oktober trägt man eine Jacke.", exEs: "En octubre se lleva chaqueta." },
  november: { w: "November", es: "noviembre", type: "sostantivo", exIt: "Der November ist grau.", exEs: "Noviembre es gris." },
  dezember: { w: "Dezember", es: "diciembre", type: "sostantivo", exIt: "Im Dezember gibt es Weihnachtsmärkte.", exEs: "En diciembre hay mercados de Navidad." },
};

/* ── irregulares: formas flexionadas → lema del diccionario ─────────── */
/* Claves normalizadas (ä→a, ö→o, ü→u, ß→ss). Los lemas de destino viven
   en DE_DICT o (sein/haben/werden) en el SUPPLEMENT.                  */
const IRREGULAR: Record<string, string> = {
  // sein
  bin: "sein", bist: "sein", seid: "sein",
  war: "sein", warst: "sein", waren: "sein", gewesen: "sein",
  // haben
  hast: "haben", habt: "haben",
  hatte: "haben", hattest: "haben", hatten: "haben", gehabt: "haben",
  // werden
  werde: "werden", wirst: "werden", wird: "werden", werdet: "werden",
  wurde: "werden", wurdest: "werden", wurden: "werden", geworden: "werden",
  // gehen
  gehe: "gehen", gehst: "gehen", geht: "gehen",
  ging: "gehen", gingst: "gehen", gingen: "gehen", gegangen: "gehen",
  // kommen
  komme: "kommen", kommst: "kommen", kommt: "kommen",
  kam: "kommen", kamst: "kommen", kamen: "kommen", gekommen: "kommen",
  // sehen
  siehst: "sehen", sieht: "sehen", sieh: "sehen",
  sah: "sehen", sahst: "sehen", sahen: "sehen", gesehen: "sehen",
  // geben
  gibst: "geben", gibt: "geben", gib: "geben",
  gab: "geben", gabst: "geben", gaben: "geben", gegeben: "geben",
  // nehmen
  nimmst: "nehmen", nimmt: "nehmen", nimm: "nehmen",
  nahm: "nehmen", nahmst: "nehmen", nahmen: "nehmen", genommen: "nehmen",
  // finden
  fand: "finden", fandest: "finden", fanden: "finden", gefunden: "finden",
  // fahren
  fahrst: "fahren", fahrt: "fahren", fahr: "fahren",
  fuhr: "fahren", fuhrst: "fahren", fuhren: "fahren", gefahren: "fahren",
  // schlafen
  schlafst: "schlafen", schlaft: "schlafen", schlaf: "schlafen",
  schlief: "schlafen", schliefst: "schlafen", schliefen: "schlafen", geschlafen: "schlafen",
  // essen
  isst: "essen", esst: "essen", iss: "essen",
  ass: "essen", asst: "essen", assen: "essen", gegessen: "essen",
  // trinken
  trank: "trinken", trankst: "trinken", tranken: "trinken", getrunken: "trinken",
  // lesen
  liest: "lesen", lies: "lesen", las: "lesen", lasest: "lesen", lasen: "lesen", gelesen: "lesen",
  // schreiben
  schrieb: "schreiben", schriebst: "schreiben", schrieben: "schreiben", geschrieben: "schreiben",
  // bleiben
  blieb: "bleiben", bliebst: "bleiben", blieben: "bleiben", geblieben: "bleiben",
  // beginnen
  begann: "beginnen", begannst: "beginnen", begannen: "beginnen", begonnen: "beginnen",
  // verstehen
  verstand: "verstehen", verstandest: "verstehen", verstanden: "verstehen",
  // wissen
  weiss: "wissen", weisst: "wissen", wisst: "wissen",
  wusste: "wissen", wusstest: "wissen", wussten: "wissen", gewusst: "wissen",
  // denken
  dachte: "denken", dachtest: "denken", dachten: "denken", gedacht: "denken",
  // gefallen
  gefallt: "gefallen", gefiel: "gefallen", gefielst: "gefallen", gefielen: "gefallen",
  // hören
  gehort: "hören", gehorte: "hören",
  // helfen
  hilfst: "helfen", hilft: "helfen", half: "helfen", halfst: "helfen", halfen: "helfen", geholfen: "helfen",
  // treffen
  triffst: "treffen", trifft: "treffen", triff: "treffen",
  traf: "treffen", trafst: "treffen", trafen: "treffen", getroffen: "treffen",
  // laufen
  lauft: "laufen", lief: "laufen", liefst: "laufen", liefen: "laufen", gelaufen: "laufen",
  // tragen
  tragt: "tragen", trug: "tragen", trugst: "tragen", trugen: "tragen", getragen: "tragen",
  // heißen
  hiess: "heißen", hiessen: "heißen", geheissen: "heißen",
  // vergessen
  vergisst: "vergessen", vergass: "vergessen", vergassen: "vergessen",
  // bekommen
  bekam: "bekommen", bekamst: "bekommen", bekamen: "bekommen",
  // mögen / möchten
  mag: "mögen", magst: "mögen", mögt: "mögen",
  mochte: "mögen", mochtest: "mögen", mochten: "mögen", gemocht: "mögen",
  möchte: "möchten", möchtest: "möchten", möchtet: "möchten",
  // können
  kann: "können", kannst: "können", könnt: "können",
  konnte: "können", konntest: "können", konnten: "können", gekonnt: "können",
  könnte: "können", könntest: "können", könnten: "können",
  // müssen
  muss: "müssen", musst: "müssen", müsst: "müssen",
  musste: "müssen", mussten: "müssen", gemusst: "müssen",
  müsste: "müssen", müssten: "müssen",
  // wollen
  will: "wollen", willst: "wollen", wollt: "wollen",
  wollte: "wollen", wolltest: "wollen", wollten: "wollen", gewollt: "wollen",
  // sollen
  soll: "sollen", sollst: "sollen", sollt: "sollen",
  sollte: "sollen", solltest: "sollen", sollten: "sollen", gesollt: "sollen",
  // dürfen
  darf: "dürfen", darfst: "dürfen", dürft: "dürfen",
  durfte: "dürfen", durftest: "dürfen", durften: "dürfen", gedurft: "dürfen",
  dürfte: "dürfen", dürften: "dürfen",
  // verbos separables: participios sin ge- intercalado
  angerufen: "anrufen",
  eingekauft: "einkaufen",
  aufgestanden: "aufstehen",
  einkaufen: "einkaufen", anrufen: "anrufen", aufstehen: "aufstehen",
};

function synthEntry(lemma: string, info: SupInfo, kind: SupKind): VocabWord {
  return {
    id: `de-${kind}-${norm(lemma).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    it: info.w ?? lemma,
    es: info.es,
    pron: "",
    ipa: "",
    type: info.type,
    cat: "comunicazione",
    level: "A1" as const,
    freq: 5 as const,
    example: { it: info.exIt ?? "", es: info.exEs ?? "" },
    note: info.note,
  };
}

/** Busca la entrada del diccionario DE para una forma flexionada. */
export function lookupWordDe(form: string): VocabWord | undefined {
  const raw = form.trim();
  if (!raw) return undefined;

  // 0 · limpiar puntuación extrema (comillas, puntos, símbolos)
  let w = raw.replace(/^[^A-Za-zÄÖÜäöüß-]+|[^A-Za-zÄÖÜäöüß-]+$/g, "");
  if (!w) return undefined;

  // 1 · caso formal con mayúscula distintiva: Sie/Ihnen antes de minúsculas
  const caseHit = CASE_PRECHECK[w];
  if (caseHit) return synthEntry(w, caseHit, "fw");

  w = w.toLowerCase();

  // 2 · índice raw (diacríticos intactos: distingue schön/schon)
  let hit: VocabWord | undefined = rawIndex().get(rawKey(w));
  if (hit) return hit;

  // 2.bis · sustantivo alemán sin artículo: Kind → das Kind · Frauen → die Frau
  hit = findBare(w);
  if (hit) return hit;

  // 3 · suplemento exacto (claves ya normalizadas)
  const n = norm(w);
  const sup = SUPPLEMENT[n];
  if (sup) {
    const FW = ["der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem", "eines", "im", "am", "zum", "zur", "vom", "ins"];
    return synthEntry(n, sup, FW.includes(n) ? "fw" : "sup");
  }

  // 4 · índice normalizado (ä→a, ö→o, ü→u, ß→ss)
  hit = find(w);
  if (hit) return hit;

  // 5 · irregulares (clave normalizada): bin→sein, ging→gehen, möchte→mögen
  const irr = IRREGULAR[n];
  if (irr) {
    hit = find(irr) ?? rawIndex().get(rawKey(irr));
    if (hit) return hit;
    const supIrr = SUPPLEMENT[norm(irr)];
    if (supIrr) return synthEntry(irr, supIrr, "sup");
  }

  // 6 · participios con ge-: gekauft→kaufen, gekommen→kommen
  if (/^ge/.test(n) && n.length > 5) {
    const stem = n.slice(2);
    for (const c of [stem.replace(/t$/, "en"), stem]) {
      if (c.length < 3) continue;
      hit = find(c) ?? rawIndex().get(rawKey(c));
      if (hit) return hit;
    }
  }

  // 7 · plurales y declinación de caso: -nen/-ungen/-ern/-en/-em/-es/-er/-e/-s
  const CASE_PLURAL_RULES: [RegExp, (m: string) => string[]][] = [
    [/nen$/, (m) => [m.slice(0, -3)]],                       // Lehrerinnen → Lehrerin
    [/ungen$/, (m) => [m.slice(0, -2)]],                     // Wohnungen → Wohnung
    [/ern$/, (m) => [m.slice(0, -3)]],                       // Kindern → Kind · Häusern → Haus (vía norm)
    [/en$/, (m) => [m.slice(0, -2)]],                        // Frauen → Frau · guten → gut
    [/em$/, (m) => [m.slice(0, -2)]],                        // gutem → gut
    [/es$/, (m) => [m.slice(0, -2)]],                        // Hauses → Haus
    [/er$/, (m) => [m.slice(0, -2)]],                        // Kinder → Kind · Bücher → Buch (vía norm)
    [/e$/, (m) => [m.slice(0, -1)]],                         // Tische → Tisch · Bäume → Baum (vía norm)
    [/s$/, (m) => [m.slice(0, -1)]],                         // Autos → Auto
  ];
  for (const [re, mk] of CASE_PLURAL_RULES) {
    if (re.test(n) && n.length > 3) {
      for (const c of mk(n)) {
        hit = find(c) ?? rawIndex().get(rawKey(c)) ?? findBare(c);
        if (hit) return hit;
      }
    }
  }

  // 8 · formas verbales regulares: kaufe/kaufst/kauft/kaufte/kauften → kaufen
  const VERB_RULES: [RegExp, (m: string) => string[]][] = [
    [/est$/, (m) => [m.slice(0, -3) + "en"]],                // arbeitest → arbeiten
    [/tet$/, (m) => [m.slice(0, -3) + "en"]],                // kauftet → kaufen
    [/test$/, (m) => [m.slice(0, -4) + "en"]],               // kauftest → kaufen
    [/ten$/, (m) => [m.slice(0, -3) + "en"]],                // kauften → kaufen
    [/st$/, (m) => [m.slice(0, -2) + "en"]],                 // kaufst → kaufen
    [/te$/, (m) => [m.slice(0, -2) + "en"]],                 // kaufte → kaufen
    [/t$/, (m) => [m.slice(0, -1) + "en"]],                  // kauft → kaufen
    [/e$/, (m) => [m.slice(0, -1) + "en"]],                  // kaufe → kaufen · wohne → wohnen
  ];
  for (const [re, mk] of VERB_RULES) {
    if (re.test(n) && n.length > 4) {
      for (const c of mk(n)) {
        hit = find(c) ?? rawIndex().get(rawKey(c));
        if (hit) return hit;
      }
    }
  }

  return undefined;
}

