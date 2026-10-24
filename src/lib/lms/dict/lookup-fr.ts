import type { VocabWord, WordType } from "../types";
import { getFRDict } from "./lang-fr";

/* ═══ FR lemmatizer didáctico · français de France → español ════════
   Espejo del portugués (lookup-pt.ts) y del italiano (lookup.ts):
   heurística didáctica, no un lematizador completo. Orden: limpieza →
   pre-check raw (à/où/là/dès/sûr/dû) → exacto → suplemento (funcionales
   y contracciones) → elisiones (l'hôtel→hôtel, j'ai→ai) → irregulares
   (formas de être, avoir, aller…) → plurales (-s/-x, -aux→-al,
   -eaux→-eau) → femeninos (-e: grande→grand, -euse→-eux) → morfología
   verbal regular (-er/-é/-ée/-és/-ées/-e/-es/-ons/-ez/-ais/-ait/-aient/
   -erai/-erons/-ant, -ir, -re).                       */

/* ── índice perezoso ──────────────────────────────────────────────── */
let IDX: Map<string, VocabWord> | null = null;

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0300-\u036f]/g, "");
}

function index(): Map<string, VocabWord> {
  if (IDX) return IDX;
  IDX = new Map<string, VocabWord>();
  for (const w of getFRDict()) {
    const key = norm(w.it);
    if (!IDX.has(key)) IDX.set(key, w);
  }
  return IDX;
}

function find(form: string): VocabWord | undefined {
  return index().get(norm(form));
}

/* ── suplemento: funcionales, contracciones, números, días, meses ──
   Las claves van NORMALIZADAS (minúsculas, sin diacriticos); el campo
   opcional `it` lleva la forma con acento para la ficha sintética.  */
type SupKind = "fw" | "sup";
interface SupInfo { it?: string; es: string; type: WordType; exIt?: string; exEs?: string; note?: string }
const SUPPLEMENT: Record<string, SupInfo> = {
  /* contracciones y auxiliares */
  au: { it: "au", es: "a + el", type: "preposizione", exIt: "Je vais au marché.", exEs: "Voy al mercado." },
  aux: { it: "aux", es: "a + los / a las", type: "preposizione", exIt: "Elle va aux toilettes.", exEs: "Ella va a los aseos." },
  du: { it: "du", es: "de + el", type: "preposizione", exIt: "Le début du film.", exEs: "El principio de la película." },
  des: { it: "des", es: "de + los / de las", type: "preposizione", exIt: "La fin des vacances.", exEs: "El fin de las vacaciones." },
  "a la": { it: "à la", es: "a + la", type: "preposizione", exIt: "On va à la plage.", exEs: "Vamos a la playa." },
  "a l'": { it: "à l'", es: "a + el (elisión)", type: "preposizione", exIt: "À l'école, on apprend.", exEs: "En la escuela se aprende." },
  "de la": { it: "de la", es: "de + la", type: "preposizione", exIt: "La fin de la journée.", exEs: "El final del día." },
  "de l'": { it: "de l'", es: "de + el (elisión)", type: "preposizione", exIt: "Le milieu de l'après-midi.", exEs: "La mitad de la tarde." },
  est: { it: "est", es: "es (être, 3.ª persona)", type: "verbo", exIt: "Il est huit heures.", exEs: "Son las ocho." },
  a: { it: "a", es: "tiene (avoir, 3.ª persona)", type: "verbo", exIt: "Il a deux sœurs.", exEs: "Tiene dos hermanas." },
  "c'est": { it: "c'est", es: "es / este es", type: "espressione", exIt: "C'est délicieux !", exEs: "¡Está delicioso!" },
  ca: { it: "ça", es: "eso", type: "pronome", exIt: "Ça marche !", exEs: "¡Eso funciona!" },
  "ca va": { it: "ça va", es: "¿qué tal? / va bien", type: "espressione", exIt: "Salut, ça va ?", exEs: "Hola, ¿qué tal?" },
  "il y a": { it: "il y a", es: "hay", type: "espressione", exIt: "Il y a du pain sur la table.", exEs: "Hay pan en la mesa." },
  "il faut": { it: "il faut", es: "hace falta / hay que", type: "espressione", exIt: "Il faut partir tôt.", exEs: "Hay que salir temprano." },
  faut: { it: "faut", es: "hace falta (falloir)", type: "verbo", exIt: "Il faut du pain.", exEs: "Hace falta pan." },
  "il pleut": { it: "il pleut", es: "llueve", type: "espressione", exIt: "Il pleut sur Nantes.", exEs: "Llueve sobre Nantes." },
  pleut: { it: "pleut", es: "llueve (pleuvoir, 3.ª)", type: "verbo", exIt: "Il pleut des cordes.", exEs: "Llueve a cántaros." },
  "est-ce que": { it: "est-ce que", es: "¿…? (partícula interrogativa)", type: "locuzione", exIt: "Est-ce que tu viens ?", exEs: "¿Vienes?" },
  "qu'est-ce que": { it: "qu'est-ce que", es: "¿qué?", type: "locuzione", exIt: "Qu'est-ce que c'est ?", exEs: "¿Qué es esto?" },
  "n'est-ce pas": { it: "n'est-ce pas", es: "¿verdad?", type: "locuzione", exIt: "Tu viens, n'est-ce pas ?", exEs: "Vienes, ¿verdad?" },
  "s'il vous plait": { it: "s'il vous plaît", es: "por favor (formal)", type: "locuzione", exIt: "Un café, s'il vous plaît.", exEs: "Un café, por favor." },
  "s'il te plait": { it: "s'il te plaît", es: "por favor (informal)", type: "locuzione", exIt: "Ouvre, s'il te plaît.", exEs: "Abre, por favor." },
  "bien sur": { it: "bien sûr", es: "claro / por supuesto", type: "avverbio", exIt: "Bien sûr, je viens.", exEs: "Claro que voy." },
  voici: { it: "voici", es: "aquí está / este es", type: "verbo", exIt: "Voici ma chambre.", exEs: "Esta es mi habitación." },
  voila: { it: "voilà", es: "ahí está / ahí tienes", type: "verbo", exIt: "Voilà le bus !", exEs: "¡Ahí está el autobús!" },
  "de rien": { it: "de rien", es: "de nada", type: "locuzione", exIt: "— Merci ! — De rien.", exEs: "— ¡Gracias! — De nada." },
  /* funcionales */
  oui: { es: "sí", type: "avverbio", exIt: "Oui, je viens.", exEs: "Sí, voy." },
  non: { es: "no", type: "avverbio", exIt: "Non, merci.", exEs: "No, gracias." },
  merci: { es: "gracias", type: "interiezione", exIt: "Merci beaucoup !", exEs: "¡Muchas gracias!" },
  beaucoup: { es: "mucho / muchos", type: "avverbio", exIt: "Il pleut beaucoup.", exEs: "Llueve mucho." },
  tres: { it: "très", es: "muy", type: "avverbio", exIt: "C'est très bon.", exEs: "Está muy bueno." },
  aussi: { es: "también / tampoco", type: "avverbio", exIt: "Moi aussi, j'aime le café.", exEs: "A mí también me gusta el café." },
  bien: { es: "bien", type: "avverbio", exIt: "Ça va bien.", exEs: "Está bien." },
  mal: { es: "mal / malamente", type: "avverbio", exIt: "Je dors mal.", exEs: "Duermo mal." },
  peu: { es: "poco", type: "avverbio", exIt: "Un peu de lait, s'il vous plaît.", exEs: "Un poco de leche, por favor." },
  trop: { es: "demasiado", type: "avverbio", exIt: "Trop tard !", exEs: "¡Demasiado tarde!" },
  assez: { es: "bastante", type: "avverbio", exIt: "C'est assez grand.", exEs: "Es bastante grande." },
  ne: { es: "no (primera parte de la negación)", type: "avverbio", exIt: "Je ne sais pas.", exEs: "No lo sé.", note: "En francés coloquial se suele omitir: «je sais pas»." },
  pas: { es: "no (segunda parte de la negación)", type: "avverbio", exIt: "Pas maintenant.", exEs: "Ahora no." },
  plus: { es: "más / ya no", type: "avverbio", exIt: "Plus de café, merci.", exEs: "Más café, gracias.", note: "«ne…plus» = ya no; «plus» solo = más." },
  jamais: { es: "nunca / jamás", type: "avverbio", exIt: "Je ne fume jamais.", exEs: "Nunca fumo." },
  rien: { es: "nada", type: "pronome", exIt: "Ce n'est rien.", exEs: "No es nada." },
  "quelqu'un": { it: "quelqu'un", es: "alguien", type: "pronome", exIt: "Quelqu'un vient.", exEs: "Viene alguien." },
  "quelque chose": { it: "quelque chose", es: "algo", type: "pronome", exIt: "Je veux quelque chose de froid.", exEs: "Quiero algo frío." },
  "tout le monde": { it: "tout le monde", es: "todo el mundo", type: "pronome", exIt: "Tout le monde dort.", exEs: "Todo el mundo duerme." },
  /* pronombres personales y demostrativos */
  je: { es: "yo", type: "pronome", exIt: "Je suis Ana.", exEs: "Yo soy Ana." },
  tu: { es: "tú", type: "pronome", exIt: "Tu viens ?", exEs: "¿Vienes tú?" },
  il: { es: "él", type: "pronome", exIt: "Il dort.", exEs: "Él duerme." },
  elle: { es: "ella", type: "pronome", exIt: "Elle chante.", exEs: "Ella canta." },
  on: { es: "uno / nosotros (coloquial)", type: "pronome", exIt: "On va au cinéma ?", exEs: "¿Vamos al cine?" },
  nous: { es: "nosotros", type: "pronome", exIt: "Nous sommes contents.", exEs: "Estamos contentos." },
  vous: { es: "vosotros / usted", type: "pronome", exIt: "Vous êtes espagnol ?", exEs: "¿Es usted español?" },
  ils: { es: "ellos", type: "pronome", exIt: "Ils jouent.", exEs: "Ellos juegan." },
  elles: { es: "ellas", type: "pronome", exIt: "Elles dansent.", exEs: "Ellas bailan." },
  ce: { es: "este / eso (demostrativo)", type: "aggettivo", exIt: "Ce matin, ce café.", exEs: "Esta mañana, este café." },
  cette: { es: "esta", type: "aggettivo", exIt: "Cette chambre est grande.", exEs: "Esta habitación es grande." },
  ces: { es: "estos / estas", type: "aggettivo", exIt: "Ces enfants grandissent.", exEs: "Estos niños crecen." },
  /* posesivos */
  mon: { es: "mi", type: "aggettivo", exIt: "Mon frère aîné.", exEs: "Mi hermano mayor." },
  ma: { es: "mi (fem.)", type: "aggettivo", exIt: "Ma sœur cadette.", exEs: "Mi hermana pequeña." },
  mes: { es: "mis", type: "aggettivo", exIt: "Mes amis arrivent.", exEs: "Mis amigos llegan." },
  ton: { es: "tu", type: "aggettivo", exIt: "Ton sac est lourd.", exEs: "Tu bolso pesa." },
  ta: { es: "tu (fem.)", type: "aggettivo", exIt: "Ta chambre est jolie.", exEs: "Tu habitación es bonita." },
  tes: { es: "tus", type: "aggettivo", exIt: "Tes clés sont ici.", exEs: "Tus llaves están aquí." },
  son: { es: "su", type: "aggettivo", exIt: "Son chien aboie.", exEs: "Su perro ladra." },
  sa: { es: "su (fem.)", type: "aggettivo", exIt: "Sa voiture est rouge.", exEs: "Su coche es rojo." },
  ses: { es: "sus", type: "aggettivo", exIt: "Ses parents habitent à Nice.", exEs: "Sus padres viven en Niza." },
  notre: { es: "nuestro", type: "aggettivo", exIt: "Notre maison est petite.", exEs: "Nuestra casa es pequeña." },
  nos: { es: "nuestros", type: "aggettivo", exIt: "Nos enfants vont à l'école.", exEs: "Nuestros niños van al colegio." },
  votre: { es: "vuestro / su", type: "aggettivo", exIt: "Votre nom, s'il vous plaît ?", exEs: "¿Su nombre, por favor?" },
  vos: { es: "vuestros / sus", type: "aggettivo", exIt: "Vos bagages sont en bas.", exEs: "Su equipaje está abajo." },
  leur: { es: "su (de ellos)", type: "aggettivo", exIt: "Leur chat dort sur le canapé.", exEs: "Su gato duerme en el sofá." },
  leurs: { es: "sus (de ellos)", type: "aggettivo", exIt: "Leurs amis sont sympas.", exEs: "Sus amigos son simpáticos." },
  /* números básicos (un/une están en el diccionario como artículos) */
  deux: { es: "dos", type: "numerale", exIt: "Deux cafés, s'il vous plaît.", exEs: "Dos cafés, por favor." },
  trois: { es: "tres", type: "numerale", exIt: "Trois fois par semaine.", exEs: "Tres veces por semana." },
  quatre: { es: "cuatro", type: "numerale", exIt: "Quatre fromages.", exEs: "Cuatro quesos." },
  cinq: { es: "cinco", type: "numerale", exIt: "Cinq minutes à pied.", exEs: "Cinco minutos a pie." },
  six: { es: "seis", type: "numerale", exIt: "À six heures et demie.", exEs: "A las seis y media." },
  sept: { es: "siete", type: "numerale", exIt: "Le sept juillet.", exEs: "El siete de julio." },
  huit: { es: "ocho", type: "numerale", exIt: "Huit jours à la mer.", exEs: "Ocho días en la playa." },
  neuf: { es: "nueve", type: "numerale", exIt: "Neuf euros le kilo.", exEs: "Nueve euros el kilo." },
  dix: { es: "diez", type: "numerale", exIt: "Dix pages par jour.", exEs: "Diez páginas al día." },
  onze: { es: "once", type: "numerale", exIt: "Onze heures du soir.", exEs: "Las once de la noche." },
  douze: { es: "doce", type: "numerale", exIt: "Douze mois dans l'année.", exEs: "Doce meses en el año." },
  treize: { es: "trece", type: "numerale", exIt: "Treize à table.", exEs: "Trece a la mesa." },
  quatorze: { es: "catorce", type: "numerale", exIt: "Quatorze février, la Saint-Valentin.", exEs: "Catorce de febrero, San Valentín." },
  quinze: { es: "quince", type: "numerale", exIt: "Quinze jours de congé.", exEs: "Quince días de permiso." },
  seize: { es: "dieciséis", type: "numerale", exIt: "À seize ans, on rêve.", exEs: "A los dieciséis se sueña." },
  vingt: { es: "veinte", type: "numerale", exIt: "Vingt euros, ça va.", exEs: "Veinte euros, vale." },
  trente: { es: "treinta", type: "numerale", exIt: "Trente minutes d'attente.", exEs: "Treinta minutos de espera." },
  quarante: { es: "cuarenta", type: "numerale", exIt: "Quarante euros le panier.", exEs: "Cuarenta euros la compra." },
  cinquante: { es: "cincuenta", type: "numerale", exIt: "Cinquante kilos de bagages.", exEs: "Cincuenta kilos de equipaje." },
  soixante: { es: "sesenta", type: "numerale", exIt: "Soixante pour cent des voix.", exEs: "Sesenta por ciento de los votos." },
  cent: { es: "cien", type: "numerale", exIt: "Cent euros.", exEs: "Cien euros." },
  mille: { es: "mil", type: "numerale", exIt: "Mille merci !", exEs: "¡Mil gracias!" },
  /* días */
  lundi: { es: "lunes", type: "sostantivo", exIt: "Lundi, on recommence.", exEs: "El lunes se empieza de nuevo." },
  mardi: { es: "martes", type: "sostantivo", exIt: "Mardi, c'est le marché.", exEs: "El martes es el mercado." },
  mercredi: { es: "miércoles", type: "sostantivo", exIt: "Mercredi, on va à la piscine.", exEs: "El miércoles vamos a la piscina." },
  jeudi: { es: "jueves", type: "sostantivo", exIt: "Jeudi, on dîne chez Mamie.", exEs: "El jueves cenamos en casa de la abuela." },
  vendredi: { es: "viernes", type: "sostantivo", exIt: "Vendredi, c'est pizza.", exEs: "El viernes, pizza." },
  samedi: { es: "sábado", type: "sostantivo", exIt: "Samedi, on dort jusqu'à dix.", exEs: "El sábado dormimos hasta las diez." },
  dimanche: { es: "domingo", type: "sostantivo", exIt: "Dimanche, on flâne au bord de l'eau.", exEs: "El domingo vagamos junto al agua." },
  /* meses */
  janvier: { es: "enero", type: "sostantivo", exIt: "En janvier, les soldes.", exEs: "En enero, las rebajas." },
  fevrier: { it: "février", es: "febrero", type: "sostantivo", exIt: "Février est court.", exEs: "Febrero es corto." },
  mars: { es: "marzo", type: "sostantivo", exIt: "En mars, le vent du nord.", exEs: "En marzo, el viento del norte." },
  avril: { es: "abril", type: "sostantivo", exIt: "Avril à Paris est doux.", exEs: "Abril en París es suave." },
  mai: { es: "mayo", type: "sostantivo", exIt: "En mai, les premiers pique-niques.", exEs: "En mayo, los primeros piques." },
  juin: { es: "junio", type: "sostantivo", exIt: "Juin, c'est la musique.", exEs: "Junio es la fiesta de la música." },
  juillet: { es: "julio", type: "sostantivo", exIt: "Juillet au bord de la mer.", exEs: "Julio a orillas del mar." },
  aout: { it: "août", es: "agosto", type: "sostantivo", exIt: "Août, tout le monde est parti.", exEs: "Agosto, todo el mundo se ha ido." },
  septembre: { es: "septiembre", type: "sostantivo", exIt: "Septembre, on recommence l'école.", exEs: "Septiembre, vuelta al cole." },
  octobre: { es: "octubre", type: "sostantivo", exIt: "Octobre sent la pluie.", exEs: "Octubre huele a lluvia." },
  novembre: { es: "noviembre", type: "sostantivo", exIt: "Novembre, les champignons.", exEs: "Noviembre, setas." },
  decembre: { it: "décembre", es: "diciembre", type: "sostantivo", exIt: "Décembre, les lumières de Noël.", exEs: "Diciembre, las luces de Navidad." },
  /* tiempo */
  "aujourd'hui": { it: "aujourd'hui", es: "hoy", type: "avverbio", exIt: "Aujourd'hui, il fait beau.", exEs: "Hoy hace buen tiempo." },
  hier: { es: "ayer", type: "avverbio", exIt: "Hier, on a dormi chez Léo.", exEs: "Ayer dormimos en casa de Léo." },
  demain: { es: "mañana", type: "avverbio", exIt: "Demain, on part à la mer.", exEs: "Mañana nos vamos a la playa." },
};

/* ── contracciones → ficha fw; el resto del suplemento → ficha sup ── */
const FW_KEYS = ["au", "aux", "du", "des", "a la", "a l'", "de la", "de l'", "est", "a"];

/* ── pre-check raw: acentos que distinguen significado ──────────────
   «à» (prep) vs «a» (avoir) · «où» (donde) vs «ou» (o) · «là» (allí)
   vs «la» (artículo) · «dès» (desde) vs «des» (contracción) · «sûr»
   (seguro) vs «sur» (sobre) · «dû» (devoir) vs «du» (de + el).     */
const RAW_PRECHECK: Record<string, SupInfo> = {
  "à": { es: "a, en (preposición)", type: "preposizione", exIt: "Je vais à Paris.", exEs: "Voy a París." },
  "où": { es: "donde", type: "avverbio", exIt: "Où habites-tu ?", exEs: "¿Dónde vives?" },
  "là": { es: "allí / ahí", type: "avverbio", exIt: "Reste là !", exEs: "¡Quédate ahí!" },
  "dès": { es: "desde (a partir de)", type: "preposizione", exIt: "Dès neuf heures.", exEs: "Desde las nueve." },
  "sûr": { es: "seguro", type: "aggettivo", exIt: "Je suis sûr de moi.", exEs: "Estoy seguro de mí." },
  "dû": { es: "debido (participio de devoir)", type: "verbo", exIt: "Le rapport est dû lundi.", exEs: "El informe se debe el lunes." },
};

/* ── elisiones: l'hôtel → hôtel · j'ai → ai · d'accord → accord ─────
   qu'il → il · c'était → était · à l'/de l' se eliminan enteros.  */
function stripElision(w: string): { stem: string; had: boolean } {
  const m = w.match(/^(?:(?:à|a|de) )?(jusqu'|qu'|l'|d'|n'|s'|j'|m'|t'|c')(.+)$/);
  if (m && m[2]) return { stem: m[2], had: true };
  return { stem: w, had: false };
}

/* ── irregulares: formas → lema del diccionario (claves norm.) ────── */
const IRREGULAR: Record<string, string> = {
  // être
  suis: "être", es: "être", sommes: "être", etes: "être", sont: "être",
  etais: "être", etait: "être", etaient: "être", etions: "être", etiez: "être",
  ete: "être", etee: "être",
  serai: "être", seras: "être", sera: "être", serons: "être", serez: "être", seront: "être",
  fus: "être", fut: "être",
  // avoir
  ai: "avoir", as: "avoir", avons: "avoir", avez: "avoir", ont: "avoir",
  avais: "avoir", avait: "avoir", avaient: "avoir",
  aurai: "avoir", auras: "avoir", aura: "avoir", aurons: "avoir", aurez: "avoir", auront: "avoir",
  eu: "avoir", eue: "avoir", eus: "avoir", eues: "avoir",
  // aller
  vais: "aller", vas: "aller", va: "aller", allons: "aller", allez: "aller", vont: "aller",
  allais: "aller", allait: "aller", allaient: "aller",
  irai: "aller", iras: "aller", ira: "aller", irons: "aller", irez: "aller", iront: "aller",
  ale: "aller", ales: "aller",
  // faire
  fais: "faire", fait: "faire", faisons: "faire", faites: "faire", font: "faire",
  faisais: "faire", faisait: "faire", faisaient: "faire",
  ferai: "faire", feras: "faire", fera: "faire", ferons: "faire", ferez: "faire", feront: "faire",
  fit: "faire", fis: "faire",
  // pouvoir
  peux: "pouvoir", peut: "pouvoir", pouvons: "pouvoir", pouvez: "pouvoir", peuvent: "pouvoir",
  pouvais: "pouvoir", pouvait: "pouvoir", pouvaient: "pouvoir",
  pourrai: "pouvoir", pourras: "pouvoir", pourra: "pouvoir", pourrons: "pouvoir", pourrez: "pouvoir", pourront: "pouvoir",
  pu: "pouvoir",
  // vouloir
  veux: "vouloir", veut: "vouloir", voulons: "vouloir", voulez: "vouloir", veulent: "vouloir",
  voulais: "vouloir", voulait: "vouloir", voulaient: "vouloir",
  voudrai: "vouloir", voudras: "vouloir", voudra: "vouloir", voudrons: "vouloir", voudrez: "vouloir", voudront: "vouloir",
  voudrais: "vouloir", voudrait: "vouloir", voulu: "vouloir",
  // devoir
  dois: "devoir", doit: "devoir", devons: "devoir", devez: "devoir", doivent: "devoir",
  devais: "devoir", devait: "devoir", devaient: "devoir",
  devrai: "devoir", devras: "devoir", devra: "devoir", devrons: "devoir", devrez: "devoir", devront: "devoir",
  // savoir
  sais: "savoir", sait: "savoir", savons: "savoir", savez: "savoir", savent: "savoir",
  savais: "savoir", savait: "savoir", savaient: "savoir",
  saurai: "savoir", sauras: "savoir", saura: "savoir", saurons: "savoir", saurez: "savoir", sauront: "savoir",
  su: "savoir",
  // venir
  viens: "venir", vient: "venir", venons: "venir", venez: "venir", viennent: "venir",
  venais: "venir", venait: "venir", venaient: "venir",
  viendrai: "venir", viendras: "venir", viendra: "venir", viendrons: "venir", viendrez: "venir", viendront: "venir",
  venu: "venir", venue: "venir", venus: "venir", venues: "venir",
  // prendre
  prends: "prendre", prend: "prendre", prenons: "prendre", prenez: "prendre", prennent: "prendre",
  prenais: "prendre", prenait: "prendre", prenaient: "prendre",
  pris: "prendre", prise: "prendre", prises: "prendre", prendrai: "prendre",
  // mettre
  mets: "mettre", met: "mettre", mettons: "mettre", mettez: "mettre", mettent: "mettre",
  mettais: "mettre", mettait: "mettre", mettaient: "mettre",
  mis: "mettre", mise: "mettre", mises: "mettre", mettrai: "mettre",
  // voir
  vois: "voir", voit: "voir", voyons: "voir", voyez: "voir", voient: "voir",
  voyais: "voir", voyait: "voir", voyaient: "voir",
  verrai: "voir", verras: "voir", verra: "voir", verrons: "voir", verrez: "voir", verront: "voir",
  vu: "voir", vue: "voir", vus: "voir", vues: "voir",
  // dire
  dis: "dire", dit: "dire", disons: "dire", dites: "dire", disent: "dire",
  disais: "dire", disait: "dire", disaient: "dire",
  dirai: "dire", diras: "dire", dira: "dire", dirons: "dire", direz: "dire", diront: "dire",
  // boire
  bois: "boire", boit: "boire", buvons: "boire", buvez: "boire", boivent: "boire",
  buvais: "boire", buvait: "boire", buvaient: "boire",
  boirai: "boire", boiras: "boire", boira: "boire", boirons: "boire", boirez: "boire", boiront: "boire",
  bu: "boire",
  // partir
  pars: "partir", part: "partir", partons: "partir", partez: "partir", partent: "partir",
  partais: "partir", partait: "partir", partaient: "partir",
  partirai: "partir", partiras: "partir", partira: "partir", partirons: "partir", partirez: "partir", partiront: "partir",
  parti: "partir", partie: "partir", partis: "partir", parties: "partir",
  // sortir
  sors: "sortir", sort: "sortir", sortons: "sortir", sortez: "sortir", sortent: "sortir",
  sortais: "sortir", sortait: "sortir", sortaient: "sortir",
  sortirai: "sortir", sortira: "sortir", sortiront: "sortir",
  sorti: "sortir", sortie: "sortir", sortis: "sortir", sorties: "sortir",
  // tenir
  tiens: "tenir", tient: "tenir", tenons: "tenir", tenez: "tenir", tiennent: "tenir",
  tenais: "tenir", tenait: "tenir", tenaient: "tenir",
  tiendrai: "tenir", tiendra: "tenir", tiendront: "tenir",
  tenu: "tenir", tenue: "tenir", tenues: "tenir",
  // ouvrir
  ouvre: "ouvrir", ouvres: "ouvrir", ouvrent: "ouvrir",
  ouvrais: "ouvrir", ouvrait: "ouvrir", ouvraient: "ouvrir",
  ouvrirai: "ouvrir", ouvrira: "ouvrir", ouvriront: "ouvrir",
  ouvert: "ouvrir", ouverte: "ouvrir", ouverts: "ouvrir", ouvertes: "ouvrir",
  // attendre
  attends: "attendre", attend: "attendre", attendons: "attendre", attendez: "attendre", attendent: "attendre",
  attendais: "attendre", attendait: "attendre", attendaient: "attendre",
  attendrai: "attendre", attendra: "attendre", attendront: "attendre", attendu: "attendre",
  // dormir
  dors: "dormir", dort: "dormir", dormons: "dormir", dormez: "dormir", dorment: "dormir",
  dormais: "dormir", dormait: "dormir", dormaient: "dormir",
  dormirai: "dormir", dormira: "dormir", dormiront: "dormir", dormi: "dormir",
  // lire
  lis: "lire", lit: "lire", lisons: "lire", lisez: "lire", lisent: "lire",
  lisais: "lire", lisait: "lire", lisaient: "lire",
  lirai: "lire", lira: "lire", liront: "lire", lu: "lire",
  // écrire
  ecris: "écrire", ecrit: "écrire", ecrivons: "écrire", ecrivez: "écrire", ecrivent: "écrire",
  ecrivais: "écrire", ecrivait: "écrire", ecrivaient: "écrire",
  ecrirai: "écrire", ecrira: "écrire", ecriront: "écrire",
  // comprendre
  comprends: "comprendre", comprenons: "comprendre", comprenez: "comprendre", comprennent: "comprendre",
  comprenais: "comprendre", comprenait: "comprendre", comprenaient: "comprendre", compris: "comprendre",
  // connaître
  connais: "connaître", connait: "connaître", connaissons: "connaître", connaissez: "connaître", connaissent: "connaître",
  connaissais: "connaître", connaissait: "connaître", connaissaient: "connaître",
  connu: "connaître", connue: "connaître", connues: "connaître",
  // répondre
  reponds: "répondre", repond: "répondre", repondons: "répondre", repondez: "répondre", repondent: "répondre",
  repondais: "répondre", repondait: "répondre", repondaient: "répondre", repondu: "répondre",
  // entendre
  entends: "entendre", entend: "entendre", entendons: "entendre", entendez: "entendre", entendent: "entendre",
  entendais: "entendre", entendait: "entendre", entendaient: "entendre", entendu: "entendre",
  // appeler (doblando la l)
  appelle: "appeler", appelles: "appeler", appellent: "appeler",
  // finir / choisir / réussir (-ir con -iss-)
  finis: "finir", finit: "finir", finissons: "finir", finissez: "finir", finissent: "finir",
  finissais: "finir", finissait: "finir", finissaient: "finir",
  finirai: "finir", finira: "finir", finiront: "finir", fini: "finir",
  choisis: "choisir", choisit: "choisir", choisissons: "choisir", choisissez: "choisir", choisissent: "choisir",
  choisi: "choisir", choisie: "choisir",
  reussis: "réussir", reussit: "réussir", reussissons: "réussir", reussissent: "réussir", reussi: "réussir",
  // vendre / descendre / rendre visite
  vends: "vendre", vend: "vendre", vendons: "vendre", vendez: "vendre", vendent: "vendre",
  vendais: "vendre", vendait: "vendre", vendaient: "vendre",
  vendrai: "vendre", vendra: "vendre", vendront: "vendre", vendu: "vendre",
  descends: "descendre", descend: "descendre", descendons: "descendre", descendez: "descendre", descendent: "descendre",
  descendu: "descendre",
  rends: "rendre visite", rend: "rendre visite", rendons: "rendre visite", rendez: "rendre visite",
  rendent: "rendre visite", rendu: "rendre visite",
  // apprendre
  apprends: "apprendre", apprend: "apprendre", apprenons: "apprendre", apprenez: "apprendre",
  apprennent: "apprendre", appris: "apprendre", apprise: "apprendre", apprendrai: "apprendre",
  // plurales irregulares que cuelan por el camino
  yeux: "œil", travaux: "travail", chevaux: "cheval", jeux: "jeu", animaux: "animal",
};

/* ── síntesis de entradas del suplemento / pre-check ──────────────── */
function synthEntry(lemma: string, info: SupInfo, kind: SupKind): VocabWord {
  return {
    id: `fr-${kind}-${norm(lemma).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    it: info.it ?? lemma,
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

/** Busca la entrada del diccionario FR para una forma flexionada. */
export function lookupWordFr(form: string): VocabWord | undefined {
  const raw = form.trim();
  if (!raw) return undefined;

  // 0 · limpiar puntuación extrema (conserva apóstrofos, guiones, œ/æ)
  let w = raw.toLowerCase().replace(/^[^a-zà-ÿœæ'-]+|[^a-zà-ÿœæ'-]+$/g, "");
  if (!w) return undefined;

  // 1 · pre-check raw (acento distintivo): «à» vs «a», «où» vs «ou»…
  const pre = RAW_PRECHECK[w];
  if (pre) return synthEntry(w, pre, "fw");

  // 2 · forma exacta en el diccionario (l'hôtel aún con su artículo)
  let hit = find(w);
  if (hit) return hit;

  // 3 · suplemento exacto (funcionales y contracciones)
  let n = norm(w);
  const sup = SUPPLEMENT[n];
  if (sup) return synthEntry(n, sup, FW_KEYS.includes(n) ? "fw" : "sup");

  // 4 · elisiones: l'hôtel → hôtel, j'ai → ai, d'accord → accord, qu'il → il
  const { stem, had } = stripElision(w);
  if (had && stem) {
    w = stem;
    hit = find(w);
    if (hit) return hit;
    n = norm(w);
    const sup2 = SUPPLEMENT[n];
    if (sup2) return synthEntry(n, sup2, FW_KEYS.includes(n) ? "fw" : "sup");
    const irr0 = IRREGULAR[n];
    if (irr0) {
      const h = find(irr0);
      if (h) return h;
    }
  }

  // 5 · irregulares (clave normalizada sin acentos)
  const irr = IRREGULAR[n];
  if (irr) {
    hit = find(irr);
    if (hit) return hit;
  }

  // 6 · plurales: -s / -x / -aux→-al / -eaux→-eau / -oux→-ou
  const PLURAL_RULES: [RegExp, (m: string) => string[]][] = [
    [/eaux$/, (m) => [m.slice(0, -4) + "eau"]],
    [/aux$/, (m) => [m.slice(0, -3) + "al"]],
    [/oux$/, (m) => [m.slice(0, -1)]],
    [/es$/, (m) => [m.slice(0, -2)]],
    [/s$/, (m) => [m.slice(0, -1)]],
    [/x$/, (m) => [m.slice(0, -1)]],
  ];
  for (const [re, mk] of PLURAL_RULES) {
    if (re.test(n)) {
      for (const c of mk(n)) {
        hit = find(c) ?? find(c.replace(/aux$/, "al"));
        if (hit) return hit;
        const supP = SUPPLEMENT[c];
        if (supP) return synthEntry(c, supP, FW_KEYS.includes(c) ? "fw" : "sup");
      }
    }
  }

  // 7 · femeninos -e: grande→grand, heureuse→heureux, actrice→acteur,
  //                     bonne→bon, parisienne→parisien, belle→beau
  if (/e$/.test(n) && n.length > 3) {
    const cands = [
      n.replace(/euse$/, "eux"),
      n.replace(/euse$/, "eur"),   // chanteuse → chanteur (nombres agente)
      n.replace(/rice$/, "eur"),
      n.replace(/elle$/, "eau"),
      n.replace(/enne$/, "en"),
      n.replace(/onne$/, "on"),
      n.slice(0, -1),
    ];
    for (const c of cands) {
      hit = find(c);
      if (hit) return hit;
    }
  }

  // 8 · morfología verbal regular (elisión de acentos ya hecha por norm)
  const VERB_ENDINGS: [string, string][] = [
    // futuro y condicional (2.ª/3.ª sing. incluidas)
    ["erai", "er"], ["eras", "er"], ["era", "er"], ["erons", "er"], ["erais", "er"], ["erait", "er"],
    // presente -er y participios é/ée/és/ées (aquí e/ee/es/ees)
    ["ons", "er"], ["ez", "er"], ["ee", "er"], ["ees", "er"], ["e", "er"], ["es", "er"],
    // imperfecto -er
    ["ais", "er"], ["ait", "er"], ["aient", "er"],
    // gerundio
    ["ant", "er"],
    // -ir (finir): -iss- y 3.ª sg -it, participio -i
    ["issons", "ir"], ["issez", "ir"], ["issent", "ir"], ["is", "ir"], ["it", "ir"], ["i", "ir"],
    // -re (vendre/attendre): 3.ª pl -ent, 2.ª sg -ds, 3.ª sg -d→-dre
    ["ent", "re"], ["ds", "re"], ["d", "dre"],
  ];
  for (const [end, inf] of VERB_ENDINGS) {
    if (n.endsWith(end) && n.length > end.length + 1) {
      const stem = n.slice(0, -end.length);
      const cands = [
        stem + inf,
        stem.replace(/e$/, "") + inf,        // mangeons → manger (verbos en -ger)
        stem.replace(/([lt])\1$/, "$1") + inf, // appelle→appeler, jette→jeter
      ];
      for (const c of cands) {
        hit = find(c);
        if (hit) return hit;
        const supV = SUPPLEMENT[c];
        if (supV) return synthEntry(c, supV, FW_KEYS.includes(c) ? "fw" : "sup");
      }
    }
  }

  return undefined;
}

