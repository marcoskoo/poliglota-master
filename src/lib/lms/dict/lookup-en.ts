import type { VocabWord, WordType } from "../types";
import { getENDict } from "./lang-en";

/* ═══ EN lemmatizer didáctico · inglés americano → español ═══════════
   Espejo del italiano (dict/lookup.ts): heurística didáctica, no un
   lematizador completo. Orden: pre-check (contracciones) → exacto →
   suplemento → irregulares → reglas (-s/-es/-ies, -ing, -ed).       */

/* ── índice perezoso ──────────────────────────────────────────────── */
let IDX: Map<string, VocabWord> | null = null;

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’\s]/g, "");
}

function index(): Map<string, VocabWord> {
  if (IDX) return IDX;
  IDX = new Map<string, VocabWord>();
  for (const w of getENDict()) {
    const key = norm(w.it);
    if (!IDX.has(key)) IDX.set(key, w);
  }
  return IDX;
}

function find(form: string): VocabWord | undefined {
  return index().get(norm(form));
}

/* ── pre-check: contracciones (la normalización borraría el apóstrofe) ── */
const CONTRACTIONS: Record<string, string> = {
  "i'm": "am", "im": "am", "i am": "am",
  "you're": "are", "youre": "are",
  "he's": "is", "shes": "is", "she's": "is",
  "it's": "is", "its": "it",
  "we're": "are", "were": "are", "we are": "are",
  "they're": "are", "theyre": "are",
  "that's": "is", "thats": "is",
  "what's": "is", "whats": "is",
  "who's": "is", "whos": "is",
  "there's": "is", "theres": "is",
  "how's": "is", "hows": "is",
  "don't": "do", "dont": "do",
  "doesn't": "does", "doesnt": "does",
  "isn't": "is", "isnt": "is",
  "aren't": "are", "arent": "are",
  "can't": "can", "cant": "can",
  "won't": "will", "wont": "will",
  "i'd": "would", "id": "would",
  "i'll": "will", "ill": "will",
  "you'll": "will", "youll": "will",
  "we'll": "will", "well": "will",
  "she'll": "will", "shell": "will",
  "he'll": "will", "hell": "will",
  "it'll": "will", "itll": "will",
  "let's": "let", "lets": "let",
  "y'all": "you", "yall": "you",
};

/* ── suplemento: funcional y lemas ausentes detectados midiendo ────
   la cobertura sobre los textos A1 en inglés (mismo patrón v9.14). */
type SupKind = "fw" | "sup";
interface SupInfo { es: string; type: WordType; exIt?: string; exEs?: string; }
const SUPPLEMENT: Record<string, SupInfo> = {
  a: { es: "un / una (artículo indefinido)", type: "articolo", exIt: "A coffee, please.", exEs: "Un café, por favor." },
  an: { es: "un / una (ante sonido vocal)", type: "articolo", exIt: "An orange juice, please.", exEs: "Un jugo de naranja, por favor." },
  the: { es: "el / la / los / las (artículo definido)", type: "articolo", exIt: "The cup is warm.", exEs: "La taza está tibia." },
  will: { es: "futuro («I'll go» = iré)", type: "verbo", exIt: "I'll be right back.", exEs: "Ya vuelvo enseguida." },
  would: { es: "condicional (quisiera)", type: "verbo", exIt: "Would you like some dessert?", exEs: "¿Quieres algún postre?" },
  can: { es: "poder", type: "verbo", exIt: "Can I get a refill?", exEs: "¿Puedo traer un relleno?" },
  gonna: { es: "going to (va a · habla casual)", type: "espressione", exIt: "You're gonna love it.", exEs: "Te va a encantar." },
  wanna: { es: "want to (quiero · habla casual)", type: "espressione", exIt: "I wanna try Colorado.", exEs: "Quiero probar Colorado." },
  gotta: { es: "have to (tengo que · habla casual)", type: "espressione", exIt: "You gotta try it.", exEs: "Tienes que probarlo." },
  ok: { es: "OK / está bien", type: "interiezione", exIt: "OK, see you at 8.", exEs: "OK, nos vemos a las 8." },
  okay: { es: "OK / está bien", type: "interiezione", exIt: "Okay, that works.", exEs: "Vale, me sirve." },
  yeah: { es: "sí (informal)", type: "interiezione", exIt: "Yeah, I'm in!", exEs: "¡Sí, me apunto!" },
  hey: { es: "oye / hola (informal)", type: "interiezione", exIt: "Hey, how's it going?", exEs: "Oye, ¿qué tal?" },
  as: { es: "como (en calidad de)", type: "congiunzione", exIt: "I answer like a pro.", exEs: "Respondo como un profesional." },
  same: { es: "mismo / igual", type: "aggettivo", exIt: "The same joke as always.", exEs: "El mismo chiste de siempre." },
  different: { es: "diferente", type: "aggettivo", exIt: "Same planet, different clocks.", exEs: "Mismo planeta, diferentes relojes." },
  delicious: { es: "delicioso", type: "aggettivo", exIt: "Everything was delicious!", exEs: "¡Todo estuvo delicioso!" },
  funny: { es: "gracioso / divertido", type: "aggettivo", exIt: "Time zones are funny.", exEs: "Las zonas horarias son graciosas." },
  clock: { es: "reloj (de pared)", type: "sostantivo", exIt: "Different clocks.", exEs: "Diferentes relojes." },
  midnight: { es: "medianoche", type: "sostantivo", exIt: "I go to bed after midnight.", exEs: "Me acuesto después de medianoche." },
  noon: { es: "mediodía", type: "sostantivo", exIt: "I have lunch at noon.", exEs: "Almuerzo al mediodía." },
  everyone: { es: "todo el mundo", type: "pronome", exIt: "Everyone runs at 8.", exEs: "Todos corren a las 8." },
  shop: { es: "tienda", type: "sostantivo", exIt: "The coffee shop is on the corner.", exEs: "La cafetería está en la esquina." },
  call: { es: "llamar", type: "verbo", exIt: "They call my name.", exEs: "Dicen mi nombre." },
  sign: { es: "firmar", type: "verbo", exIt: "I sign the lease on Friday.", exEs: "Firmo el contrato el viernes." },
  bring: { es: "traer", type: "verbo", exIt: "She brings three cups.", exEs: "Ella trae tres tazas." },
  travel: { es: "viajar", type: "verbo", exIt: "The warmth travels to your chest.", exEs: "El calor viaja a tu pecho." },
  try: { es: "probar / intentar", type: "verbo", exIt: "Try both jackets.", exEs: "Pruébate ambas chaquetas." },
  let: { es: "dejar / permitir", type: "verbo", exIt: "Let the people off first.", exEs: "Deja salir a la gente primero." },
  stay: { es: "quedarse", type: "verbo", exIt: "Stay here for three breaths.", exEs: "Quédate aquí tres respiraciones." },
  think: { es: "pensar", type: "verbo", exIt: "I think: this is better than wifi.", exEs: "Pienso: esto es mejor que el wifi." },
  know: { es: "saber / conocer", type: "verbo", exIt: "The guards know everything.", exEs: "Los guardias lo saben todo." },
  win: { es: "ganar", type: "verbo", exIt: "We win 24-21!", exEs: "¡Ganamos 24-21!" },
  lose: { es: "perder (partido)", type: "verbo", exIt: "We lose, but nobody is sad.", exEs: "Perdemos, pero nadie está triste." },
  hang: { es: "colgar", type: "verbo", exIt: "Grandma hangs up after an hour.", exEs: "La abuela cuelga tras una hora." },
  drop: { es: "dejar caer / bajar", type: "verbo", exIt: "Drop your shoulders.", exEs: "Deja caer los hombros." },
  grow: { es: "crecer", type: "verbo", exIt: "You get used to it.", exEs: "Te acostumbras (creces con ello)." },
  end: { es: "terminar", type: "verbo", exIt: "We end up laughing.", exEs: "Terminamos riendo." },
  wake: { es: "despertar", type: "verbo", exIt: "You wake up at 7.", exEs: "Despiertas a las 7." },
  commercial: { es: "anuncio (comercial)", type: "sostantivo", exIt: "The commercials are better than the game.", exEs: "Los anuncios son mejores que el juego." },
  marathon: { es: "maratón", type: "sostantivo", exIt: "The Sunday marathon on the couch.", exEs: "El maratón dominical del sofá." },
  halftime: { es: "medio tiempo", type: "sostantivo", exIt: "Stretch at halftime.", exEs: "Estira en el descanso." },
  stretch: { es: "estiramiento / estirar", type: "verbo", exIt: "Sit forward and touch your toes.", exEs: "Siéntate al borde y toca tus pies." },
  jar: { es: "frasco", type: "sostantivo", exIt: "The tip jar on the counter.", exEs: "El frasco de propinas en el mostrador." },
  salsa: { es: "salsa", type: "sostantivo", exIt: "Salsa and chips everywhere.", exEs: "Salsa y chips por todas partes." },
  chips: { es: "papitas fritas (de maíz)", type: "sostantivo", exIt: "Salsa and chips on game day.", exEs: "Salsa y chips el día de partido." },
  jersey: { es: "camiseta deportiva", type: "sostantivo", exIt: "Friends arrive with jerseys.", exEs: "Llegan amigos con camisetas." },
  touchdown: { es: "touchdown (anotación)", type: "sostantivo", exIt: "Touchdown: explosion!", exEs: "¡Touchdown: explosión!" },
  applause: { es: "aplausos", type: "sostantivo", exIt: "Applause in the line.", exEs: "Aplausos en la fila." },
  beep: { es: "pitido", type: "verbo", exIt: "The register beeps like a video game.", exEs: "La caja pita como un juego." },
  videogame: { es: "videojuego", type: "sostantivo", exIt: "Beeps like a videogame.", exEs: "Pita como un videojuego." },
  wink: { es: "guiño", type: "verbo", exIt: "She winks: Sunday paper, kid.", exEs: "Guiña el ojo: el periódico del domingo, chico." },
  master: { es: "maestro/a", type: "sostantivo", exIt: "Teach me, master.", exEs: "Enseñe, maestra." },
  paper: { es: "papel / periódico", type: "sostantivo", exIt: "The coupons live in the Sunday paper.", exEs: "Los cupones viven en el periódico del domingo." },
  pretzel: { es: "pretzel (pan salado)", type: "sostantivo", exIt: "We split a pretzel at the food court.", exEs: "Compartimos un pretzel en el patio de comidas." },
  foodcourt: { es: "patio de comidas", type: "sostantivo", exIt: "The food court is packed at noon.", exEs: "El patio de comidas está lleno al mediodía." },
  turkey: { es: "pavo", type: "sostantivo", exIt: "Half a pound of turkey.", exEs: "Media libra de pavo." },
  ham: { es: "jamón", type: "sostantivo", exIt: "Turkey, ham and cheese.", exEs: "Pavo, jamón y queso." },
  deli: { es: "sección de fiambres", type: "sostantivo", exIt: "Everything is per pound at the deli.", exEs: "Todo va por libra en el deli." },
  slice: { es: "rebanar / porción", type: "verbo", exIt: "Pizza by the slice.", exEs: "Pizza por porción." },
  scale: { es: "balanza", type: "sostantivo", exIt: "The scale never lies.", exEs: "La balanza nunca miente." },
  freedom: { es: "libertad", type: "sostantivo", exIt: "Freedom units, but they work.", exEs: "Unidades de libertad, pero funcionan." },
  unit: { es: "unidad", type: "sostantivo", exIt: "A washer in the unit.", exEs: "Una lavadora en el apartamento." },
  subtitle: { es: "subtítulo", type: "sostantivo", exIt: "Turn on the subtitles.", exEs: "Enciende los subtítulos." },
  anthem: { es: "himno", type: "sostantivo", exIt: "Stand up for the anthem.", exEs: "Párate para el himno." },
  sixpack: { es: "six-pack (seis paquetes)", type: "sostantivo", exIt: "He shows up with six-packs.", exEs: "Aparece con seis paquetes." },
  tattoo: { es: "tatuaje", type: "sostantivo", exIt: "My cousin shows his new tattoo.", exEs: "Mi primo muestra su tatuaje." },
  hostel: { es: "hostal", type: "sostantivo", exIt: "A hostel bed in Brooklyn.", exEs: "Una cama de hostal en Brooklyn." },
  hotdog: { es: "hot dog (pancho)", type: "sostantivo", exIt: "A hot dog from a cart.", exEs: "Un pancho de un carrito." },
  heaven: { es: "cielo / gloria", type: "sostantivo", exIt: "$3, heaven.", exEs: "$3, el cielo." },
  statue: { es: "estatua", type: "sostantivo", exIt: "The Statue of Liberty tomorrow.", exEs: "La Estatua de la Libertad mañana." },
  liberty: { es: "libertad", type: "sostantivo", exIt: "The Statue of Liberty.", exEs: "La Estatua de la Libertad." },
  sidewalk: { es: "acera", type: "sostantivo", exIt: "Don't stop in the middle of the sidewalk.", exEs: "No te pares en mitad de la acera." },
  introvert: { es: "introvertido/a", type: "sostantivo", exIt: "A gift for introverts.", exEs: "Un regalo para los introvertidos." },
  keyboard: { es: "teclado", type: "sostantivo", exIt: "Only keyboards and pages turning.", exEs: "Solo teclados y páginas pasando." },
  page: { es: "página", type: "sostantivo", exIt: "Pages turning in the quiet car.", exEs: "Páginas pasando en el vagón silencioso." },
  wifi: { es: "wifi", type: "sostantivo", exIt: "Wi-Fi is free on board.", exEs: "El wifi es gratis a bordo." },
  tower: { es: "torre", type: "sostantivo", exIt: "Little towns with water towers.", exEs: "Pueblos con tanques de agua." },
  grid: { es: "cuadrícula", type: "sostantivo", exIt: "American cities are a grid.", exEs: "Las ciudades americanas son una cuadrícula." },
  logic: { es: "lógica", type: "sostantivo", exIt: "Numbered streets, easy logic.", exEs: "Calles numeradas, lógica fácil." },
  credit: { es: "crédito", type: "sostantivo", exIt: "Cash back or store credit?", exEs: "¿Reembolso o crédito de tienda?" },
  signature: { es: "firma", type: "sostantivo", exIt: "Two minutes, one signature.", exEs: "Dos minutos, una firma." },
  worry: { es: "preocupación", type: "sostantivo", exIt: "Emails, worries, memories.", exEs: "Correos, preocupaciones, recuerdos." },
  memory: { es: "recuerdo / memoria", type: "sostantivo", exIt: "Your mind makes another list.", exEs: "Tu mente fabrica otra lista." },
  email: { es: "correo electrónico", type: "sostantivo", exIt: "No emails for ten minutes.", exEs: "Sin correos por diez minutos." },
  product: { es: "producto", type: "sostantivo", exIt: "The storm of products.", exEs: "La tormenta de productos." },
  design: { es: "diseño", type: "sostantivo", exIt: "Supermarkets are designed to excite you.", exEs: "Los supermercados están diseñados para excitarte." },
  excite: { es: "excitar / estimular", type: "verbo", exIt: "Colors and offers excite the mind.", exEs: "Los colores y ofertas excitan la mente." },
  trick: { es: "truco", type: "sostantivo", exIt: "The oldest trick: follow your list.", exEs: "El truco más antiguo: sigue tu lista." },
  potroast: { es: "pot roast (asado de olla)", type: "sostantivo", exIt: "Pot roast in the oven.", exEs: "Asado de olla al horno." },
  oven: { es: "horno", type: "sostantivo", exIt: "The house smells like home.", exEs: "La casa huele a hogar." },
  accent: { es: "acento", type: "sostantivo", exIt: "A girl with a Boston accent.", exEs: "Una chica con acento de Boston." },
  downtown: { es: "el centro (de la ciudad)", type: "sostantivo", exIt: "I work in an office downtown.", exEs: "Trabajo en una oficina del centro." },
  ramen: { es: "ramen (sopa)", type: "sostantivo", exIt: "He eats ramen when I eat pancakes.", exEs: "Él come ramen cuando yo como panqueques." },
  pancake: { es: "panqueque", type: "sostantivo", exIt: "I eat pancakes at 7 a. m.", exEs: "Como panqueques a las 7 a. m." },
  timezone: { es: "zona horaria", type: "sostantivo", exIt: "Time zones are funny.", exEs: "Las zonas horarias son graciosas." },
  copy: { es: "copia", type: "sostantivo", exIt: "You are a copy of dad!", exEs: "¡Eres una copia de papá!" },
  wedding: { es: "boda", type: "sostantivo", exIt: "My grandparents' wedding photo.", exEs: "La foto de boda de mis abuelos." },
  popcorn: { es: "palomitas", type: "sostantivo", exIt: "The house smells like wings and popcorn.", exEs: "La casa huele a alitas y palomitas." },
  break: { es: "descanso / pausa", type: "sostantivo", exIt: "Commercial breaks are useful.", exEs: "Los cortes comerciales son útiles." },
  survive: { es: "sobrevivir", type: "verbo", exIt: "My A1 English survived the city.", exEs: "Mi inglés A1 sobrevivió a la ciudad." },
  row: { es: "fila", type: "sostantivo", exIt: "Rows of stores at the outlet.", exEs: "Filas de tiendas en el outlet." },
  fabric: { es: "tela", type: "sostantivo", exIt: "Read the tags: fabric, size, care.", exEs: "Lee las etiquetas: tela, talla, cuidados." },
  tag: { es: "etiqueta", type: "sostantivo", exIt: "The price tag is not final.", exEs: "El precio de la etiqueta no es final." },
  care: { es: "cuidado", type: "sostantivo", exIt: "Fabric, size, care.", exEs: "Tela, talla, cuidados." },
  democracy: { es: "democracia", type: "sostantivo", exIt: "Names in columns. Democracy!", exEs: "Nombres en columnas. ¡Democracia!" },
  chore: { es: "quehacer (doméstico)", type: "sostantivo", exIt: "The chore chart on the fridge.", exEs: "La tabla de quehaceres en el refrigerador." },
  magnet: { es: "imán", type: "sostantivo", exIt: "A magnet on the fridge.", exEs: "Un imán en el refrigerador." },
  column: { es: "columna", type: "sostantivo", exIt: "Names in columns.", exEs: "Nombres en columnas." },
  sacred: { es: "sagrado", type: "aggettivo", exIt: "The last slice of pizza is sacred.", exEs: "La última porción de pizza es sagrada." },
  activity: { es: "actividad", type: "sostantivo", exIt: "Cooking is a group activity.", exEs: "Cocinar es actividad de grupo." },
  group: { es: "grupo", type: "sostantivo", exIt: "A group activity.", exEs: "Una actividad de grupo." },
  month: { es: "mes", type: "sostantivo", exIt: "Six months later.", exEs: "Seis meses después." },
  anymore: { es: "ya no / ya más", type: "avverbio", exIt: "We are not roommates anymore.", exEs: "Ya no somos compañeros de cuarto." },
  latte: { es: "latte (café con leche)", type: "sostantivo", exIt: "A tall latte, please.", exEs: "Un latte grande, por favor." },
  cookie: { es: "galleta", type: "sostantivo", exIt: "A chocolate cookie, please.", exEs: "Una galleta de chocolate, por favor." },
  blueberry: { es: "arándano", type: "sostantivo", exIt: "A blueberry muffin, please.", exEs: "Un muffin de arándanos, por favor." },
  peanut: { es: "maní / cacahuete", type: "sostantivo", exIt: "Where's the peanut butter?", exEs: "¿Dónde está la mantequilla de maní?" },
  jam: { es: "mermelada", type: "sostantivo", exIt: "Aisle 5, next to the jams.", exEs: "Pasillo 5, junto a las mermeladas." },
  grain: { es: "grano / integral", type: "sostantivo", exIt: "Do you have any whole-grain bread?", exEs: "¿Tienen pan integral?" },
  bakery: { es: "panadería", type: "sostantivo", exIt: "In the bakery section, aisle 2.", exEs: "En la sección de panadería, pasillo 2." },
  produce: { es: "frescos (fruta y verdura)", type: "sostantivo", exIt: "Prices are per pound in produce.", exEs: "Los precios van por libra en frescos." },
  november: { es: "noviembre", type: "sostantivo", exIt: "By November, I ask for two pounds.", exEs: "Para noviembre, pido dos libras." },

  around: { es: "alrededor · por ahí", type: "avverbio", exIt: "The city is a teacher, the island around it calm.", exEs: "La ciudad es maestra; la isla alrededor, calmada." },
  than: { es: "que (comparativo) · que (conjunción)", type: "congiunzione", exIt: "Better than a fast regret.", exEs: "Mejor que un arrepentimiento rápido." },
  each: { es: "cada", type: "aggettivo", exIt: "Each cloud passes.", exEs: "Cada nube pasa." },
  choose: { es: "elegir", type: "verbo", exIt: "Today you choose like a ritual.", exEs: "Hoy eliges como un ritual." },
  maybe: { es: "quizás / tal vez", type: "avverbio", exIt: "Maybe smiling.", exEs: "Quizás sonriendo." },
  normal: { es: "normal", type: "aggettivo", exIt: "Slower than normal.", exEs: "Más lento de lo normal." },
  ground: { es: "suelo (tierra)", type: "sostantivo", exIt: "Feel your heel touch the ground.", exEs: "Siente tu talón tocar el suelo." },
  vacation: { es: "vacaciones", type: "sostantivo", exIt: "Your vacation starts on the vehicle.", exEs: "Tus vacaciones empiezan en el vehículo." },
  happens: { es: "sucede (happen)", type: "verbo", exIt: "Life happens on the street.", exEs: "La vida ocurre en la calle." },
  options: { es: "opciones", type: "sostantivo", exIt: "Two options, one decision.", exEs: "Dos opciones, una decisión." },
  presence: { es: "presencia", type: "sostantivo", exIt: "Calm is the presence of attention.", exEs: "La calma es la presencia de atención." },
  potroast2: { es: "pot roast (asado de olla)", type: "sostantivo", exIt: "Pot roast in the oven.", exEs: "Asado de olla al horno." },
  spa2: { es: "spa (baño de vapor)", type: "sostantivo", exIt: "A little spa in every coffee cup.", exEs: "Un pequeño spa en cada taza." },
  silent2: { es: "silencioso", type: "aggettivo", exIt: "The house is silent at 6.", exEs: "La casa está silenciosa a las 6." },
  pause2: { es: "pausa · pausar", type: "sostantivo", exIt: "Take one silent pause.", exEs: "Haz una pausa silenciosa." },
  continues: { es: "continúa (continue)", type: "verbo", exIt: "The noise continues outside.", exEs: "El ruido sigue afuera." },
  feast2: { es: "festín", type: "sostantivo", exIt: "A feast in miniature.", exEs: "Un festín en miniatura." },
  dawn2: { es: "amanecer · al alba", type: "sostantivo", exIt: "The driver on the highway at dawn.", exEs: "El camionero en la carretera al alba." },
  lock2: { es: "cerradura · cerrar", type: "verbo", exIt: "You can find the quiet center and lock the noise out.", exEs: "Encuentras el centro quieto y cierras el ruido afuera." },
  simply2: { es: "simplemente", type: "avverbio", exIt: "Times change, simply.", exEs: "Los tiempos cambian, simplemente." },
  pillow: { es: "almohada", type: "sostantivo", exIt: "Your head is on the pillow.", exEs: "Tu cabeza está en la almohada." },
  tonight: { es: "esta noche", type: "avverbio", exIt: "No phone tonight.", exEs: "Sin teléfono esta noche." },
  favorite2: { es: "favorito", type: "aggettivo", exIt: "Pizza is my favorite.", exEs: "La pizza es mi favorita." },
  party: { es: "fiesta", type: "sostantivo", exIt: "The welcome party starts at 8.", exEs: "La fiesta de bienvenida empieza a las 8." },
  girl: { es: "chica / niña", type: "sostantivo", exIt: "A girl with a Boston accent.", exEs: "Una chica con acento de Boston." },
  art2: { es: "arte", type: "sostantivo", exIt: "She studies art.", exEs: "Ella estudia arte." },
  promise2: { es: "promesa · prometer", type: "verbo", exIt: "I promise, grandma.", exEs: "Te lo prometo, abuela." },
  owl: { es: "búho", type: "sostantivo", exIt: "The night owl and the early bird.", exEs: "El noctámbulo y el matutino." },
  pass2: { es: "pasar (la sal) · pasar", type: "verbo", exIt: "Pass the salt, please.", exEs: "Pásame la sal, por favor." },
  style: { es: "estilo", type: "sostantivo", exIt: "Customer service, American style.", exEs: "Servicio al cliente, estilo americano." },
  slide: { es: "resbaladilla · deslizar", type: "verbo", exIt: "The train slides out of the station.", exEs: "El tren se desliza fuera de la estación." },
  kindly: { es: "amablemente", type: "avverbio", exIt: "Let the people off first, a man says kindly.", exEs: "Deja salir a la gente primero, dice un hombre amable." },
  greet: { es: "saludar", type: "verbo", exIt: "New York greets us with noise and light.", exEs: "Nueva York nos recibe con ruido y luz." },
  gentleman: { es: "caballero (gentlemen plural)", type: "sostantivo", exIt: "Ladies and gentlemen.", exEs: "Señoras y señores." },
  facts: { es: "datos / hechos", type: "sostantivo", exIt: "Energy better than a list of facts.", exEs: "Energía mejor que una lista de datos." },
  meat: { es: "carne", type: "sostantivo", exIt: "Prices are per pound for meat.", exEs: "Los precios van por libra en carne." },
  vegetable: { es: "verdura", type: "sostantivo", exIt: "Meat and vegetables at the deli.", exEs: "Carne y verduras en el deli." },
  method2: { es: "método", type: "sostantivo", exIt: "A teacher with a hard method.", exEs: "Una maestra de método duro." },
  invite: { es: "invitar", type: "verbo", exIt: "My neighbor family invites me to dinner.", exEs: "La familia vecina me invita a cenar." },
  hunting: { es: "caza · de caza", type: "sostantivo", exIt: "Are we there yet? The joke of every road trip.", exEs: "¿Ya llegamos? El chiste de todo viaje." },
  pro: { es: "profesional (como un pro)", type: "sostantivo", exIt: "I answer like a pro.", exEs: "Respondo como un profesional." },

};


const SUPPLEMENT2: Record<string, SupInfo> = {
  meet: { es: "encontrarse · conocer", type: "verbo", exIt: "Nice to meet you!", exEs: "¡Encantado de conocerte!" },
  really: { es: "realmente · muy", type: "avverbio", exIt: "I'm really into hiking.", exEs: "Me apasiona el senderismo." },
  all: { es: "todo / todos", type: "aggettivo", exIt: "All set!", exEs: "¡Todo listo!" },
  part: { es: "parte", type: "sostantivo", exIt: "Pets are part of the family.", exEs: "Las mascotas son parte de la familia." },
  course: { es: "curso", type: "sostantivo", exIt: "The course starts at 8.", exEs: "El curso empieza a las 8." },
  has_v: { es: "(forma de have)", type: "verbo", exIt: "She has one brother.", exEs: "Ella tiene un hermano." },
  introduce: { es: "presentar", type: "verbo", exIt: "Servers introduce themselves.", exEs: "Los camareros se presentan." },
  campus: { es: "campus", type: "sostantivo", exIt: "I live near the campus.", exEs: "Vivo cerca del campus." },
  toast: { es: "tostada", type: "sostantivo", exIt: "Eggs and toast for breakfast.", exEs: "Huevos y tostadas de desayuno." },
  orange: { es: "naranja (de naranja)", type: "aggettivo", exIt: "An orange juice, please.", exEs: "Un jugo de naranja, por favor." },
  enough: { es: "suficiente", type: "aggettivo", exIt: "Early enough for the gym.", exEs: "Suficientemente temprano para el gimnasio." },
  gym: { es: "gimnasio", type: "sostantivo", exIt: "I go to the gym at 5.", exEs: "Voy al gimnasio a las 5." },
  weekday: { es: "día de semana", type: "sostantivo", exIt: "On weekdays I get up at 6:30.", exEs: "Entre semana me levanto a las 6:30." },
  dininghall: { es: "comedor (universitario)", type: "sostantivo", exIt: "I have lunch at the dining hall.", exEs: "Almuerzo en el comedor." },
  hall: { es: "salón / comedor", type: "sostantivo", exIt: "The dining hall is packed at noon.", exEs: "El comedor está lleno al mediodía." },
  after: { es: "después de", type: "preposizione", exIt: "After the game, we eat pizza.", exEs: "Después del partido, comemos pizza." },
  large: { es: "grande", type: "aggettivo", exIt: "I'd like a large coffee.", exEs: "Quisiera un café grande." },
  set: { es: "conjunto · listo (all set)", type: "sostantivo", exIt: "All set! Have a nice day.", exEs: "¡Todo listo! Que tengas un buen día." },
  daily: { es: "diario", type: "aggettivo", exIt: "My daily routine is fast.", exEs: "Mi rutina diaria es rápida." },
  life: { es: "vida", type: "sostantivo", exIt: "Life happens on the street.", exEs: "La vida ocurre en la calle." },
  before: { es: "antes de", type: "preposizione", exIt: "Look at the plate before the first bite.", exEs: "Mira el plato antes del primer bocado." },
  tall: { es: "alto (¡el tamaño PEQUEÑO en Starbucks!)", type: "aggettivo", exIt: "Tall, grande or venti?", exEs: "¿Tall, grande o venti?" },
  grande: { es: "grande (tamaño mediano Starbucks)", type: "sostantivo", exIt: "Tall (small!), grande (medium), venti (large).", exEs: "Tall (¡pequeño!), grande (mediano), venti (grande)." },
  medium: { es: "mediano", type: "aggettivo", exIt: "A medium coffee, please.", exEs: "Un café mediano, por favor." },
  venti: { es: "venti (tamaño grande Starbucks)", type: "sostantivo", exIt: "Venti is the large size.", exEs: "Venti es el tamaño grande." },
  move: { es: "moverse", type: "verbo", exIt: "The line moves; you do not move inside.", exEs: "La fila avanza; tú no te mueves por dentro." },
  often: { es: "a menudo", type: "avverbio", exIt: "How often do you find a bench?", exEs: "¿Con qué frecuencia encuentras una banca?" },
  gesture: { es: "gesto", type: "sostantivo", exIt: "A gesture of respect.", exEs: "Un gesto de respeto." },
  chocolate: { es: "chocolate", type: "sostantivo", exIt: "A chocolate cookie, please.", exEs: "Una galleta de chocolate, por favor." },
  milkshake: { es: "malteada", type: "sostantivo", exIt: "A chocolate milkshake, please.", exEs: "Una malteada de chocolate, por favor." },
  us: { es: "nosotros (objeto)", type: "pronome", exIt: "Join us this weekend!", exEs: "¡Únete a nosotros este finde!" },
  few: { es: "unos pocos", type: "aggettivo", exIt: "A few minutes with the menu.", exEs: "Unos minutos con el menú." },
  cheeseburger: { es: "hamburguesa con queso", type: "sostantivo", exIt: "A cheeseburger with fries.", exEs: "Una hamburguesa con queso y papas." },
  fries: { es: "papas fritas", type: "sostantivo", exIt: "A cheeseburger with fries.", exEs: "Una hamburguesa con queso y papas." },
  choice: { es: "elección", type: "sostantivo", exIt: "Great choice!", exEs: "¡Buena elección!" },
  onion: { es: "cebolla", type: "sostantivo", exIt: "No onions, please.", exEs: "Sin cebolla, por favor." },
  could: { es: "podría (pasado de can · cortesía)", type: "verbo", exIt: "Could we get the check?", exEs: "¿Nos podría traer la cuenta?" },
  rare: { es: "poco hecho (carne) · raro", type: "aggettivo", exIt: "Medium or well done?", exEs: "¿A punto o bien hecha?" },
  themselves: { es: "se (a sí mismos)", type: "pronome", exIt: "Servers introduce themselves.", exEs: "Los camareros se presentan." },
  soda: { es: "gaseosa", type: "sostantivo", exIt: "Refills of soda are free.", exEs: "Los rellenos de gaseosa son gratis." },
  iced: { es: "helado (con hielo)", type: "aggettivo", exIt: "Iced tea with lemon.", exEs: "Té helado con limón." },
  refill: { es: "relleno (recarga)", type: "sostantivo", exIt: "Can we get a refill?", exEs: "¿Nos trae un relleno?" },
  include: { es: "incluir", type: "verbo", exIt: "The tip is included?", exEs: "¿La propina está incluida?" },
  good: { es: "bueno", type: "aggettivo", exIt: "Have a good one!", exEs: "¡Que te vaya bien!" },
  base: { es: "base", type: "sostantivo", exIt: "Servers earn a small base wage.", exEs: "Los camareros ganan un sueldo base bajo." },
  rude: { es: "grosero", type: "aggettivo", exIt: "Not tipping is rude.", exEs: "No dejar propina es grosero." },
  optional: { es: "opcional", type: "aggettivo", exIt: "In America, tipping is not optional.", exEs: "En América, la propina no es opcional." },
  diner: { es: "diner (comedor americano)", type: "sostantivo", exIt: "We stop at diners on the road.", exEs: "Paramos en diners por la carretera." },
  last: { es: "último", type: "aggettivo", exIt: "The last slice of pizza is sacred.", exEs: "La última porción de pizza es sagrada." },
  super: { es: "súper (muy)", type: "avverbio", exIt: "Our server was super friendly.", exEs: "Nuestro camarero fue súper amable." },
  anything: { es: "algo / cualquier cosa", type: "pronome", exIt: "Anything else?", exEs: "¿Algo más?" },
  special: { es: "especial", type: "aggettivo", exIt: "Anything special?", exEs: "¿Buscas algo especial?" },
  fit: { es: "quedar (de talla) · encajar", type: "verbo", exIt: "How does it fit?", exEs: "¿Cómo le queda?" },
  preference: { es: "preferencia", type: "sostantivo", exIt: "Any color preference?", exEs: "¿Prefiere algún color?" },
  plus: { es: "más (suma) · además", type: "preposizione", exIt: "It's $59.99 plus tax.", exEs: "Cuesta $59.99 más impuesto." },
  off: { es: "fuera / sin (descuento) · libre", type: "avverbio", exIt: "Everything is 20% off.", exEs: "Todo está con 20 % de descuento." },
  clothing: { es: "ropa (genérico)", type: "sostantivo", exIt: "American clothing sizes are letters.", exEs: "Las tallas americanas de ropa son letras." },
  letter: { es: "letra (del alfabeto)", type: "sostantivo", exIt: "Sizes are letters: XS, S, M, L.", exEs: "Las tallas son letras: XS, S, M, L." },
  final: { es: "final", type: "sostantivo", exIt: "The final of the championship.", exEs: "La final del campeonato." },
  everywhere: { es: "por todas partes", type: "avverbio", exIt: "Sales are everywhere on holidays.", exEs: "Hay rebajas por todas partes en los feriados." },
  holiday: { es: "feriado", type: "sostantivo", exIt: "Black Friday is a shopping holiday.", exEs: "El Black Friday es un feriado de compras." },
  biggest: { es: "el más grande", type: "aggettivo", exIt: "The biggest shopping day of the year.", exEs: "El mayor día de compras del año." },
  year: { es: "año", type: "sostantivo", exIt: "Eighty years old, calm like a lake.", exEs: "Ochenta años, serena como un lago." },
  keep: { es: "guardar / mantener", type: "verbo", exIt: "Keep the receipt.", exEs: "Guarda el recibo." },
  return: { es: "devolver / devolución", type: "verbo", exIt: "Returns are easy in the U.S.", exEs: "Devolver es fácil en EE. UU." },
  item: { es: "artículo (producto)", type: "sostantivo", exIt: "Return items within 30 days.", exEs: "Devuelve los artículos en 30 días." },
  better: { es: "mejor", type: "aggettivo", exIt: "A calm decision is better than a fast one.", exEs: "Una decisión calmada es mejor que una rápida." },
  best: { es: "el mejor", type: "aggettivo", exIt: "The commercials are better than the game.", exEs: "Los anuncios son mejores que el juego." },
  public: { es: "público", type: "aggettivo", exIt: "How do I get to the public library?", exEs: "¿Cómo llego a la biblioteca pública?" },
  then: { es: "entonces / luego", type: "avverbio", exIt: "Go straight, then turn left.", exEs: "Sigue recto, entonces gira a la izquierda." },
  far: { es: "lejos", type: "aggettivo", exIt: "Is it far from here?", exEs: "¿Está lejos de aquí?" },
  next: { es: "próximo / después", type: "aggettivo", exIt: "The next train leaves at 9:10.", exEs: "El próximo tren sale a las 9:10." },
  across: { es: "al otro lado / a través", type: "preposizione", exIt: "The café is across the street.", exEs: "El café está al otro lado de la calle." },
  avenue: { es: "avenida", type: "sostantivo", exIt: "Streets and avenues cross each other.", exEs: "Las calles y las avenidas se cruzan." },
  them: { es: "los / las (objeto)", type: "pronome", exIt: "Try them on before buying.", exEs: "Pruébatelos antes de comprar." },
  number: { es: "número · numerar", type: "sostantivo", exIt: "Streets are numbered.", exEs: "Las calles están numeradas." },
  south: { es: "sur", type: "sostantivo", exIt: "14th Street is south of 42nd.", exEs: "La 14 va al sur de la 42." },
  directions: { es: "direcciones (indicaciones)", type: "sostantivo", exIt: "Ask for directions to the museum.", exEs: "Pide direcciones al museo." },
  drive: { es: "manejar", type: "verbo", exIt: "If you drive, limits are in miles.", exEs: "Si manejas, los límites son en millas." },
  speed: { es: "velocidad", type: "sostantivo", exIt: "Speed limits are in miles per hour.", exEs: "Los límites de velocidad son en mph." },
  limit: { es: "límite", type: "sostantivo", exIt: "Speed limits in mph.", exEs: "Límites de velocidad en mph." },
  per: { es: "por (por cada)", type: "preposizione", exIt: "Prices are per pound.", exEs: "Los precios van por libra." },
  distance: { es: "distancia", type: "sostantivo", exIt: "Distance is in blocks, not meters.", exEs: "La distancia se mide en cuadras, no en metros." },
  apartment: { es: "apartamento", type: "sostantivo", exIt: "The apartment has two baths.", exEs: "El apartamento tiene dos baños." },
  fountain: { es: "fuente (de agua)", type: "sostantivo", exIt: "The bus stop is across from the fountain.", exEs: "La parada está enfrente de la fuente." },
  cafe: { es: "café (local)", type: "sostantivo", exIt: "The café is on the corner.", exEs: "El café está en la esquina." },
  help: { es: "ayuda · ayudar", type: "sostantivo", exIt: "Give help with patience.", exEs: "Da ayuda con paciencia." },
  round: { es: "redondo · (en) vuelta", type: "aggettivo", exIt: "A round-trip ticket.", exEs: "Un billete de ida y vuelta." },
  coach: { es: "clase turista", type: "sostantivo", exIt: "$78 in coach, $129 in business.", exEs: "$78 en turista, $129 en business." },
  board: { es: "a bordo · tablero", type: "sostantivo", exIt: "Wi-Fi is free on board.", exEs: "El wifi es gratis a bordo." },
  national: { es: "nacional", type: "aggettivo", exIt: "The national passenger train company.", exEs: "La compañía nacional de trenes." },
  passenger: { es: "pasajero", type: "sostantivo", exIt: "Passenger trains connect big cities.", exEs: "Los trenes de pasajeros conectan grandes ciudades." },
  company: { es: "empresa", type: "sostantivo", exIt: "Amtrak is a company.", exEs: "Amtrak es una empresa." },
  comfortable: { es: "cómodo", type: "aggettivo", exIt: "Seats are comfortable.", exEs: "Los asientos son cómodos." },
  fly: { es: "volar", type: "verbo", exIt: "For long distances, Americans fly.", exEs: "En largas distancias, los americanos vuelan." },
  flight: { es: "vuelo", type: "sostantivo", exIt: "Flights are cheap and fast.", exEs: "Los vuelos son baratos y rápidos." },
  cheap: { es: "barato", type: "aggettivo", exIt: "Flights are cheap.", exEs: "Los vuelos son baratos." },
  announcement: { es: "anuncio (por megafonía)", type: "sostantivo", exIt: "We are now arriving at Penn Station.", exEs: "Estamos llegando a Penn Station." },
  soccer: { es: "fútbol (soccer en EE. UU.)", type: "sostantivo", exIt: "I like playing soccer.", exEs: "Me gusta jugar fútbol." },
  amazing: { es: "increíble", type: "aggettivo", exIt: "Colorado has amazing trails.", exEs: "Colorado tiene rutas increíbles." },
  trail: { es: "ruta / sendero", type: "sostantivo", exIt: "Colorado has amazing trails.", exEs: "Colorado tiene rutas increíbles." },
  vs: { es: "contra (versus)", type: "preposizione", exIt: "The Chiefs vs. the Bills.", exEs: "Los Chiefs contra los Bills." },
  football: { es: "fútbol americano", type: "sostantivo", exIt: "Sundays belong to football.", exEs: "Los domingos son del fútbol americano." },
  gather: { es: "reunirse", type: "verbo", exIt: "Families gather around the TV.", exEs: "Las familias se reúnen frente al TV." },
  beer: { es: "cerveza", type: "sostantivo", exIt: "Wings, pizza and beer.", exEs: "Alitas, pizza y cerveza." },
  backyard: { es: "patio trasero", type: "sostantivo", exIt: "Grilling in the backyard.", exEs: "Parrilla en el patio." },
  classic: { es: "clásico", type: "aggettivo", exIt: "A classic question.", exEs: "Una pregunta clásica." },
  interview: { es: "entrevista", type: "sostantivo", exIt: "It's small talk, not an interview.", exEs: "Es small talk, no una entrevista." },
  energy: { es: "energía", type: "sostantivo", exIt: "Answer with energy.", exEs: "Responde con energía." },
  join: { es: "unirse", type: "verbo", exIt: "Join us this weekend!", exEs: "¡Únete este finde!" },
  mijo: { es: "mijo ( cariño: mi hijo)", type: "interiezione", exIt: "How's your apartment, mijo?", exEs: "¿Cómo está tu apartamento, hijo?" },
  grill: { es: "parrilla · asar a la parrilla", type: "sostantivo", exIt: "There's even a grill on the balcony.", exEs: "Hasta hay una parrilla en el balcón." },
  dishwasher: { es: "lavavajillas", type: "sostantivo", exIt: "The kitchen has a dishwasher.", exEs: "La cocina tiene lavavajillas." },
  use: { es: "usar", type: "verbo", exIt: "We use it for storage.", exEs: "Lo usamos de bodega." },
  storage: { es: "bodega / almacenaje", type: "sostantivo", exIt: "We use the garage for storage.", exEs: "Usamos el garaje de bodega." },
  bike: { es: "bici", type: "sostantivo", exIt: "A small storage room for your bike.", exEs: "Una bodega pequeña para tu bici." },
  tool: { es: "herramienta", type: "sostantivo", exIt: "Full of boxes, bikes and tools.", exEs: "Lleno de cajas, bicis y herramientas." },
  bath: { es: "baño (habitación)", type: "sostantivo", exIt: "A two-bed, two-bath apartment.", exEs: "Un apartamento de dos dormitorios y dos baños." },
  standard: { es: "estándar", type: "aggettivo", exIt: "Two-bed, two-bath is standard.", exEs: "Dos y dos es el estándar." },
  describe: { es: "describir", type: "verbo", exIt: "Houses are described in square feet.", exEs: "Las casas se describen en pies cuadrados." },
  square: { es: "cuadrado", type: "aggettivo", exIt: "Measured in square feet.", exEs: "Medido en pies cuadrados." },
  almost: { es: "casi", type: "avverbio", exIt: "Early enough — almost!", exEs: "Suficientemente temprano — ¡casi!" },
  rarely: { es: "rara vez", type: "avverbio", exIt: "The garage is rarely for the car.", exEs: "El garaje rara vez es para el auto." },
  patio: { es: "patio", type: "sostantivo", exIt: "A small patio with plants.", exEs: "Un patio pequeño con plantas." },
  suburb: { es: "suburbio", type: "sostantivo", exIt: "Houses in the suburbs.", exEs: "Casas en los suburbios." },
  else: { es: "más / sino", type: "avverbio", exIt: "Anything else?", exEs: "¿Algo más?" },
  section: { es: "sección", type: "sostantivo", exIt: "In the bakery section, aisle 2.", exEs: "En la sección de panadería, pasillo 2." },
  find: { es: "encontrar", type: "verbo", exIt: "Find three things in the room.", exEs: "Encuentra tres cosas en la habitación." },
  plastic: { es: "plástico", type: "sostantivo", exIt: "Paper or plastic?", exEs: "¿Papel o plástico?" },
  huge: { es: "enorme", type: "aggettivo", exIt: "The portions are huge.", exEs: "Las porciones son enormes." },
  once: { es: "una vez", type: "avverbio", exIt: "People shop once a week.", exEs: "La gente compra una vez a la semana." },
  cereal: { es: "cereal", type: "sostantivo", exIt: "Cereal in family-size boxes.", exEs: "Cereal en cajas familiares." },
  meal: { es: "comida (del día)", type: "sostantivo", exIt: "A meal is a chain of invisible work.", exEs: "Una comida es una cadena de trabajo invisible." },
  prep: { es: "prep (preparación)", type: "sostantivo", exIt: "Sundays are for meal prep.", exEs: "Los domingos son de meal prep." },
  container: { es: "contenedor", type: "sostantivo", exIt: "Cooking for the week in containers.", exEs: "Cocinar la semana en contenedores." },
  chicken: { es: "pollo · de pollo", type: "sostantivo", exIt: "Two pounds of chicken.", exEs: "Dos libras de pollo." },
  pasta: { es: "pasta", type: "sostantivo", exIt: "Aisle 7, next to the pasta.", exEs: "Pasillo 7, junto a la pasta." },
  visit: { es: "visitar", type: "verbo", exIt: "I'm visiting the city!", exEs: "¡Estoy visitando la ciudad!" },
  discount: { es: "descuento", type: "sostantivo", exIt: "There's a discount today.", exEs: "Hay descuento hoy." },
  superlative: { es: "superlativo", type: "sostantivo", exIt: "The city of superlatives.", exEs: "La ciudad de los superlativos." },
  language: { es: "lengua / idioma", type: "sostantivo", exIt: "800 languages in one city.", exEs: "800 lenguas en una ciudad." },
  literal: { es: "literal", type: "aggettivo", exIt: "«The city that never sleeps» is literal.", exEs: "«La ciudad que nunca duerme» es literal." },
  excuse: { es: "disculpa · disculpar", type: "sostantivo", exIt: "Excuse me, where's the library?", exEs: "Disculpe, ¿dónde está la biblioteca?" },
  lot: { es: "mucho (a lot)", type: "sostantivo", exIt: "The rent is a lot in L.A.", exEs: "El alquiler es mucho en Los Angeles." },
  middle: { es: "en medio / mitad", type: "sostantivo", exIt: "Don't stop in the middle of the sidewalk.", exEs: "No te pares en mitad de la acera." },
  anywhere: { es: "en cualquier lugar", type: "avverbio", exIt: "You can do it anywhere in the U.S.", exEs: "Puedes hacerlo en cualquier lugar de EE. UU." },
  out: { es: "fuera", type: "avverbio", exIt: "We eat out on Fridays.", exEs: "Comemos fuera los viernes." },
  exist: { es: "existir", type: "verbo", exIt: "Nothing else exists.", exEs: "Nada más existe." },
  difference: { es: "diferencia", type: "sostantivo", exIt: "Feel the difference.", exEs: "Siente la diferencia." },
  thank: { es: "agradecer", type: "verbo", exIt: "Say thank you, hands.", exEs: "Di: gracias, manos." },
  stress: { es: "estrés", type: "sostantivo", exIt: "We carry stress in our shoulders.", exEs: "Cargamos estrés en los hombros." },
  space: { es: "espacio", type: "sostantivo", exIt: "Feel the space between your ears and shoulders.", exEs: "Siente el espacio entre orejas y hombros." },
  away: { es: "lejos / fuera de", type: "avverbio", exIt: "Miles away from here.", exEs: "A millas de aquí." },
  service: { es: "servicio", type: "sostantivo", exIt: "Service compris: the tip is included by law.", exEs: "Servicio incluido: la propina viene por ley." },
  dark: { es: "oscuro", type: "aggettivo", exIt: "Some clouds are dark.", exEs: "Algunas nubes son oscuras." },
  bad: { es: "malo", type: "aggettivo", exIt: "When a bad thought arrives.", exEs: "Cuando llega un mal pensamiento." },
  fight: { es: "pelear / luchar", type: "verbo", exIt: "Do not fight the cloud.", exEs: "No luches contra la nube." },
  mental: { es: "mental", type: "aggettivo", exIt: "Mental relaxation is trusting the walk.", exEs: "La relajación mental es confiar en el caminar." },
  eighty: { es: "ochenta", type: "numerale", exIt: "She is eighty years old.", exEs: "Tiene ochenta años." },
  happiness: { es: "felicidad", type: "sostantivo", exIt: "Happiness is simple.", exEs: "La felicidad es simple." },
  enter: { es: "entrar", type: "verbo", exIt: "You enter it many times a day.", exEs: "Entras en ella muchas veces al día." },
  front: { es: "frente / delantero", type: "sostantivo", exIt: "The river of people flows in front of you.", exEs: "El río de gente fluye delante de ti." },
  other: { es: "otro", type: "aggettivo", exIt: "One after the other.", exEs: "Uno después del otro." },
  hurry: { es: "prisa · apurar", type: "sostantivo", exIt: "No phone, no hurry.", exEs: "Sin teléfono, sin prisa." },
  step: { es: "paso", type: "sostantivo", exIt: "Slow steps, like a cat.", exEs: "Pasos lentos, como un gato." },
  follow: { es: "seguir", type: "verbo", exIt: "Your mind follows your body.", exEs: "Tu mente sigue a tu cuerpo." },
  natural: { es: "natural", type: "aggettivo", exIt: "Your breath finds its natural rhythm.", exEs: "Tu respiración encuentra su ritmo natural." },
  rhythm: { es: "ritmo", type: "sostantivo", exIt: "The traveler's rhythm.", exEs: "El ritmo del viajero." },
  dance: { es: "baile · bailar", type: "sostantivo", exIt: "Her hands move like a slow dance.", exEs: "Sus manos se mueven como una danza lenta." },
  machine: { es: "máquina", type: "sostantivo", exIt: "The machine sings.", exEs: "La máquina canta." },
  sing: { es: "cantar", type: "verbo", exIt: "The machine sings.", exEs: "La máquina canta." },
  line: { es: "fila · línea", type: "sostantivo", exIt: "The line is long.", exEs: "La fila es larga." },
  delay: { es: "retraso · retrasar", type: "sostantivo", exIt: "Every delay is a door to presence.", exEs: "Cada retraso es una puerta a la presencia." },
  sip: { es: "sorbo · sorber", type: "sostantivo", exIt: "Before your first sip.", exEs: "Antes del primer sorbo." },
  spiritual: { es: "espiritual", type: "aggettivo", exIt: "A spiritual act.", exEs: "Un acto espiritual." },
  connect: { es: "conectar", type: "verbo", exIt: "Gratitude connects you to thousands of people.", exEs: "La gratitud te conecta con miles de personas." },
  miracle: { es: "milagro", type: "sostantivo", exIt: "A small miracle of cooperation.", exEs: "Un pequeño milagro de cooperación." },
  cooperation: { es: "cooperación", type: "sostantivo", exIt: "A small miracle of cooperation.", exEs: "Un pequeño milagro de cooperación." },
  both: { es: "ambos", type: "aggettivo", exIt: "Warm hands, warm heart: both.", exEs: "Manos cálidas, corazón cálido: ambos." },
  palm: { es: "palma (de la mano)", type: "sostantivo", exIt: "The warmth travels from your palms.", exEs: "El calor viaja de tus palmas." },
  nervous: { es: "nervioso", type: "aggettivo", exIt: "Your nervous system calms down.", exEs: "Tu sistema nervioso se calma." },
  system: { es: "sistema", type: "sostantivo", exIt: "Your nervous system calms down.", exEs: "Tu sistema nervioso se calma." },
  touch: { es: "tocar · toque", type: "verbo", exIt: "Slow touch calms the body.", exEs: "El toque lento calma el cuerpo." },
  surface: { es: "superficie", type: "sostantivo", exIt: "Feel the warm surface of the cup.", exEs: "Siente la superficie tibia de la taza." },
  become: { es: "convertirse en", type: "verbo", exIt: "You become the island.", exEs: "Te conviertes en la isla." },
  bite: { es: "mordisco · morder", type: "sostantivo", exIt: "The first bite with full attention.", exEs: "El primer bocado con toda la atención." },
  task: { es: "tarea", type: "sostantivo", exIt: "No hurry, no next task.", exEs: "Sin prisa, sin tarea siguiente." },
  miniature: { es: "miniatura", type: "sostantivo", exIt: "A feast in miniature.", exEs: "Un banquete en miniatura." },
  highway: { es: "carretera (autopista)", type: "sostantivo", exIt: "The driver on the highway at dawn.", exEs: "El camionero en la autopista al alba." },
  chain: { es: "cadena", type: "sostantivo", exIt: "A chain of invisible work.", exEs: "Una cadena de trabajo invisible." },
  invisible: { es: "invisible", type: "aggettivo", exIt: "A chain of invisible work.", exEs: "Una cadena de trabajo invisible." },
  bless: { es: "bendecir", type: "verbo", exIt: "People bless the food.", exEs: "La gente bendice la comida." },
  religion: { es: "religión", type: "sostantivo", exIt: "You do not need a religion for this.", exEs: "No necesitas una religión para esto." },
  respect: { es: "respeto · respetar", type: "sostantivo", exIt: "Two seconds of respect.", exEs: "Dos segundos de respeto." },
  complete: { es: "completo · completar", type: "aggettivo", exIt: "A complete prayer.", exEs: "Una oración completa." },
  mirror: { es: "espejo", type: "sostantivo", exIt: "A small box of mirrors and light.", exEs: "Una caja de espejos y luz." },
  conscious: { es: "consciente", type: "aggettivo", exIt: "One conscious moment.", exEs: "Un momento consciente." },
  center: { es: "centro", type: "sostantivo", exIt: "The quiet center.", exEs: "El centro quieto." },
  swing: { es: "balancear · balanceo", type: "verbo", exIt: "Let the arms swing.", exEs: "Deja balancear los brazos." },
  wood: { es: "madera", type: "sostantivo", exIt: "Walk like water, not like wood.", exEs: "Camina como agua, no como madera." },
  jaw: { es: "mandíbula", type: "sostantivo", exIt: "Jaws, shoulders, knees: three soft spots.", exEs: "Mandíbula, hombros, rodillas: tres puntos suaves." },
  spot: { es: "punto / lugar", type: "sostantivo", exIt: "Three soft spots.", exEs: "Tres puntos suaves." },
  past: { es: "pasado", type: "sostantivo", exIt: "You do not think about yesterday: the past.", exEs: "No piensas en el ayer: el pasado." },
  future: { es: "futuro", type: "sostantivo", exIt: "No worry about tomorrow: the future.", exEs: "Sin preocupación por el mañana: el futuro." },
  decide: { es: "decidir", type: "verbo", exIt: "You decide calmly.", exEs: "Decides con calma." },
  decision: { es: "decisión", type: "sostantivo", exIt: "A calm decision is better.", exEs: "Una decisión calmada es mejor." },
  notice: { es: "notar", type: "verbo", exIt: "Notice your breath.", exEs: "Nota tu respiración." },
  truth: { es: "verdad", type: "sostantivo", exIt: "Natural light tells the truth.", exEs: "La luz natural dice la verdad." },
  regret: { es: "arrepentimiento · arrepentirse", type: "sostantivo", exIt: "A fast regret tomorrow.", exEs: "Un arrepentimiento rápido mañana." },
  map: { es: "mapa", type: "sostantivo", exIt: "The map is an idea; the street is real.", exEs: "El mapa es una idea; la calle es real." },
  real: { es: "real", type: "aggettivo", exIt: "The street is real.", exEs: "La calle es real." },
  pocket: { es: "bolsillo", type: "sostantivo", exIt: "The phone stays in your pocket.", exEs: "El teléfono queda en tu bolsillo." },
  sense: { es: "sentido (sentidos)", type: "sostantivo", exIt: "Walk with your senses open.", exEs: "Camina con los sentidos abiertos." },
  uncertainty: { es: "incertidumbre", type: "sostantivo", exIt: "The mind hates uncertainty.", exEs: "La mente odia la incertidumbre." },
  trust: { es: "confianza · confiar", type: "verbo", exIt: "Trusting the walk more than the plan.", exEs: "Confiar más en el caminar que en el plan." },
  draw: { es: "dibujar", type: "verbo", exIt: "He draws a little map with his hands.", exEs: "Dibuja un pequeño mapa con las manos." },
  web: { es: "red (tela de araña)", type: "sostantivo", exIt: "A web of small kindness.", exEs: "Una red de pequeñas amabilidades." },
  path: { es: "camino / sendero", type: "sostantivo", exIt: "The spiritual path of the street.", exEs: "El camino espiritual de la calle." },
  bridge: { es: "puente", type: "sostantivo", exIt: "Thank you is a bridge between strangers.", exEs: "Gracias es un puente entre desconocidos." },
  session: { es: "sesión", type: "sostantivo", exIt: "Two blocks are enough for a session.", exEs: "Dos cuadras bastan para una sesión." },
  heel: { es: "talón", type: "sostantivo", exIt: "First, feel your heel touch the ground.", exEs: "Primero, siente tu talón tocar el suelo." },
  sole: { es: "planta (del pie)", type: "sostantivo", exIt: "Then the sole, then the toes.", exEs: "Luego la planta, luego los dedos." },
  destination: { es: "destino", type: "sostantivo", exIt: "The walk is the destination.", exEs: "El caminar es el destino." },
  push: { es: "empujar", type: "verbo", exIt: "Your toes push off.", exEs: "Tus dedos empujan." },
  pure: { es: "puro", type: "aggettivo", exIt: "Zero ego, pure joy.", exEs: "Cero ego, alegría pura." },
  plane: { es: "avión", type: "sostantivo", exIt: "By plane or by train?", exEs: "¿En avión o en tren?" },
  mark: { es: "marca / señalar", type: "sostantivo", exIt: "Las marcas de la edad?", exEs: "The marks of use." },
  movement: { es: "movimiento", type: "sostantivo", exIt: "One minute of movement every hour.", exEs: "Un minuto de movimiento cada hora." },
  ankle: { es: "tobillo", type: "sostantivo", exIt: "Move your ankles, neck and hands.", exEs: "Mueve tobillos, cuello y manos." },
  neck: { es: "cuello", type: "sostantivo", exIt: "Move your ankles, neck and hands.", exEs: "Mueve tobillos, cuello y manos." },
  vehicle: { es: "vehículo", type: "sostantivo", exIt: "Your vacation starts on the vehicle.", exEs: "Tus vacaciones empiezan en el vehículo." },
  hotel: { es: "hotel", type: "sostantivo", exIt: "Not at the hotel.", exEs: "No en el hotel." },
  program: { es: "programa", type: "sostantivo", exIt: "A movie that nobody programs.", exEs: "Una película que nadie programa." },
  simple_w: { es: "simple · simplemente", type: "aggettivo", exIt: "Times change, simply.", exEs: "Los tiempos cambian, simplemente." },
  retreat: { es: "retiro", type: "sostantivo", exIt: "People pay for retreats to learn this.", exEs: "La gente paga retiros para aprender esto." },
  point: { es: "punto", type: "sostantivo", exIt: "You are the still point of the station.", exEs: "Eres el punto quieto de la estación." },
  modern: { es: "moderno", type: "aggettivo", exIt: "The temples of the modern world.", exEs: "Los templos del mundo moderno." },
  opposite: { es: "opuesto", type: "sostantivo", exIt: "Practice the opposite.", exEs: "Practica lo contrario." },
  flow: { es: "fluir · flujo", type: "verbo", exIt: "Let the river of people flow.", exEs: "Deja fluir el río de gente." },
  disappear: { es: "desaparecer", type: "verbo", exIt: "An hour disappears when you play.", exEs: "Una hora desaparece cuando juegas." },
  disappearance: { es: "desaparición", type: "sostantivo", exIt: "This disappearance is the old sacred feeling.", exEs: "Esa desaparición es el viejo sentimiento sagrado." },
  zero: { es: "cero", type: "numerale", exIt: "Zero ego, pure joy.", exEs: "Cero ego, alegría pura." },
  ego: { es: "ego (yo)", type: "sostantivo", exIt: "Zero ego, pure joy.", exEs: "Cero ego, alegría pura." },
  puzzle: { es: "rompecabezas", type: "sostantivo", exIt: "Cards, soccer or a puzzle.", exEs: "Cartas, fútbol o un rompecabezas." },
  suffer: { es: "sufrir", type: "verbo", exIt: "Nobody suffers: there's next Sunday.", exEs: "Nadie sufre: hay próximo domingo." },
  twice: { es: "dos veces", type: "avverbio", exIt: "Shared presence is twice as strong.", exEs: "La presencia compartida es dos veces más fuerte." },
  worth: { es: "valer la pena", type: "verbo", exIt: "Sixty minutes are worth more.", exEs: "Sesenta minutos valen más." },
  soul: { es: "alma", type: "sostantivo", exIt: "Her mind is calm, her soul at ease.", exEs: "Su mente está serena, su alma en calma." },
  forward: { es: "hacia adelante", type: "avverbio", exIt: "One paw in front of the other: forward.", exEs: "Una pata delante de la otra: adelante." },
  roll: { es: "rodar · (rodillas) rodillas", type: "verbo", exIt: "Roll your shoulders slowly.", exEs: "Rueda los hombros despacio." },
  during: { es: "durante", type: "preposizione", exIt: "Breathe during the game.", exEs: "Respira durante el partido." },
  inner: { es: "interior", type: "aggettivo", exIt: "The quiet room inside: your inner room.", exEs: "La habitación silenciosa interior." },
  noisy: { es: "ruidoso", type: "aggettivo", exIt: "When your home is noisy.", exEs: "Cuando tu casa es ruidosa." },
  house: { es: "casa (edificio)", type: "sostantivo", exIt: "A house with a yard.", exEs: "Una casa con patio." },
  superpower: { es: "superpoder", type: "sostantivo", exIt: "Inner quiet is a superpower.", exEs: "La quietud interior es un superpoder." },
  muscle: { es: "músculo", type: "sostantivo", exIt: "Train it like a muscle.", exEs: "Entrénalo como un músculo." },
  begin: { es: "empezar", type: "verbo", exIt: "The altar begins at home.", exEs: "El altar empieza en casa." },
  act: { es: "acto · actuar", type: "sostantivo", exIt: "Small acts of order.", exEs: "Pequeños actos de orden." },
  old: { es: "viejo", type: "aggettivo", exIt: "The oldest rule works even in Times Square.", exEs: "La regla más antigua funciona incluso en Times Square." },
  oldest: { es: "el más antiguo", type: "aggettivo", exIt: "The oldest spiritual rule.", exEs: "La regla espiritual más antigua." },
  human: { es: "humano", type: "aggettivo", exIt: "The oldest human ritual.", exEs: "El ritual humano más antiguo." },
  heavy: { es: "pesado", type: "aggettivo", exIt: "Let your body get heavy.", exEs: "Deja que tu cuerpo pese." },
  stone: { es: "piedra", type: "sostantivo", exIt: "Like a stone in warm water.", exEs: "Como una piedra en agua tibia." },
  another: { es: "otro / una más", type: "aggettivo", exIt: "Energy for one more story.", exEs: "Energía para una historia más." },
  bowl: { es: "tazón", type: "sostantivo", exIt: "Fruit is the present moment in a bowl.", exEs: "La fruta es el presente en un tazón." },
  boring: { es: "aburrido", type: "aggettivo", exIt: "A boring errand turns into meditation.", exEs: "Un recado aburrido se vuelve meditación." },
  errand: { es: "recado / diligencia", type: "sostantivo", exIt: "A boring errand.", exEs: "Un recado aburrido." },
  candy: { es: "caramelo · dulces", type: "sostantivo", exIt: "The candy shelf screams.", exEs: "El estante de dulces grita." },
  shelf: { es: "estante", type: "sostantivo", exIt: "The candy shelf.", exEs: "El estante de dulces." },
  scream: { es: "gritar", type: "verbo", exIt: "The candy shelf screams.", exEs: "El estante de dulces grita." },
  generosity: { es: "generosidad", type: "sostantivo", exIt: "In a big city you see generosity and hurry.", exEs: "En una gran ciudad ves generosidad y prisa." },
  siren: { es: "sirena", type: "sostantivo", exIt: "Sirens, horns, millions of steps.", exEs: "Sirenas, bocinas, millones de pasos." },
  horn: { es: "bocina", type: "sostantivo", exIt: "Sirens and horns.", exEs: "Sirenas y bocinas." },
  steel: { es: "acero", type: "sostantivo", exIt: "A river of steel.", exEs: "Un río de acero." },
  cannot: { es: "no poder (can't)", type: "verbo", exIt: "You cannot silence Manhattan.", exEs: "No puedes silenciar Manhattan." },
  fine: { es: "bien / fino", type: "aggettivo", exIt: "The noise continues, and that is fine.", exEs: "El ruido sigue, y está bien." },
  absence: { es: "ausencia", type: "sostantivo", exIt: "Calm is not the absence of sound.", exEs: "La calma no es la ausencia de sonido." },
  tourist: { es: "turista", type: "sostantivo", exIt: "You walk like a tourist, you arrive like a local.", exEs: "Caminas como turista, llegas como local." },
  stair: { es: "escalera / escalón", type: "sostantivo", exIt: "Ten thousand steps, stairs, subway.", exEs: "Diez mil pasos, escaleras, metro." },
  zone: { es: "zona", type: "sostantivo", exIt: "Time zones are funny.", exEs: "Las zonas horarias son graciosas." },
  freeze: { es: "congelar · congelamiento", type: "verbo", exIt: "Two streak freezes per week.", exEs: "Dos congelamientos de racha por semana." },
  local: { es: "local / de la zona", type: "sostantivo", exIt: "The local says: you can't get lost.", exEs: "El local dice: no puedes perderte." },
  crazy: { es: "loco", type: "aggettivo", exIt: "The sizes are crazy.", exEs: "Los tamaños son una locura." },
  pumpkin: { es: "calabaza", type: "sostantivo", exIt: "A pumpkin spice latte.", exEs: "Un latte de calabaza." },
  spice: { es: "especia", type: "sostantivo", exIt: "Pumpkin spice latte.", exEs: "Latte de calabaza y especias." },
  understand: { es: "entender", type: "verbo", exIt: "Now I understand: tipping is culture.", exEs: "Ahora entiendo: la propina es cultura." },
  lesson: { es: "lección", type: "sostantivo", exIt: "Culture lesson learned.", exEs: "Lección de cultura aprendida." },
  magic: { es: "magia · mágico", type: "sostantivo", exIt: "Your cup is a small miracle, almost magic.", exEs: "Tu taza es un pequeño milagro, casi magia." },
  sauce: { es: "salsa", type: "sostantivo", exIt: "Ranch, ketchup, BBQ: a rainbow of sauces.", exEs: "Ranch, ketchup, BBQ: un arcoíris de salsas." },
  ketchup: { es: "ketchup", type: "sostantivo", exIt: "Ranch, ketchup, BBQ.", exEs: "Ranch, ketchup, BBQ." },
  flavor: { es: "sabor", type: "sostantivo", exIt: "A rainbow of flavors.", exEs: "Un arcoíris de sabores." },
  portion: { es: "porción", type: "sostantivo", exIt: "The portions are huge.", exEs: "Las porciones son enormes." },
  hungry: { es: "hambriento", type: "aggettivo", exIt: "Nobody leaves a U.S. restaurant hungry.", exEs: "Nadie sale con hambre de un restaurante americano." },
  yourself: { es: "ti mismo", type: "pronome", exIt: "Bring nothing, just yourself.", exEs: "No traigas nada, solo tú." },
  explain: { es: "explicar", type: "verbo", exIt: "Sizes run small here, he explains.", exEs: "Las tallas salen pequeñas, explica." },
  mission: { es: "misión", type: "sostantivo", exIt: "Your last mission: New York.", exEs: "Tu última misión: Nueva York." },
  later: { es: "más tarde", type: "avverbio", exIt: "See you later!", exEs: "¡Nos vemos!" },
  court: { es: "cancha · corte · corte de comida", type: "sostantivo", exIt: "At the food court.", exEs: "En el patio de comidas." },
  problem: { es: "problema", type: "sostantivo", exIt: "No problem: returns are easy.", exEs: "Sin problema: devolver es fácil." },
  meter: { es: "metro (unidad)", type: "sostantivo", exIt: "Distance is in blocks, not meters.", exEs: "La distancia en cuadras, no en metros." },
  recommend: { es: "recomendar", type: "verbo", exIt: "A guard recommends the painting wing.", exEs: "Un guardia recomienda el ala de pintura." },
  wing: { es: "ala (de un edificio)", type: "sostantivo", exIt: "The painting wing.", exEs: "El ala de pintura." },
  speaker: { es: "altavoz · hablante", type: "sostantivo", exIt: "The speaker says: we are arriving.", exEs: "El altavoz dice: estamos llegando." },
  should: { es: "debería", type: "verbo", exIt: "The quiet car should be a law.", exEs: "El vagón silencioso debería ser ley." },
  expect: { es: "esperar (anticipar)", type: "verbo", exIt: "They expect energy in the answer.", exEs: "Esperan energía en la respuesta." },
  gear: { es: "equipo / engranaje", type: "sostantivo", exIt: "Ten minutes of trails and gear.", exEs: "Diez minutos de rutas y equipo." },
  less: { es: "menos", type: "aggettivo", exIt: "Listen more, talk less.", exEs: "Escuchar más, hablar menos." },
  fan: { es: "fanático / admirador", type: "sostantivo", exIt: "One Chiefs fan, one Bills fan.", exEs: "Un fan de los Chiefs, una fan de los Bills." },
  seat: { es: "asiento", type: "sostantivo", exIt: "Seat 12A, body check.", exEs: "Asiento 12A, chequeo corporal." },
  playlist: { es: "lista de reproducción", type: "sostantivo", exIt: "A playlist of 200 songs.", exEs: "Una lista de 200 canciones." },
  gas: { es: "gas · gasolinera", type: "sostantivo", exIt: "We stop at diners and gas stations.", exEs: "Paramos en diners y gasolineras." },
  weird: { es: "extraño / raro", type: "aggettivo", exIt: "Gas stations and weird attractions.", exEs: "Gasolineras y atracciones raras." },
  ad: { es: "anuncio (publicidad)", type: "sostantivo", exIt: "Are we there yet? The joke of every ad.", exEs: "¿Ya llegamos? El chiste de todo anuncio." },
  washer: { es: "lavadora", type: "sostantivo", exIt: "A washer in the unit.", exEs: "Lavadora en el apartamento." },
  dryer: { es: "secadora", type: "sostantivo", exIt: "Washer and dryer in unit.", exEs: "Lavadora y secadora en el apto." },
  sigh: { es: "suspiro · suspirar", type: "verbo", exIt: "Welcome to California, sighs the agent.", exEs: "Bienvenido a California, suspira el agente." },
  place: { es: "lugar", type: "sostantivo", exIt: "The first place is a disaster.", exEs: "El primer lugar es un desastre." },
  view: { es: "vista", type: "sostantivo", exIt: "A balcony with a view.", exEs: "Un balcón con vista." },
  college: { es: "universidad (college)", type: "sostantivo", exIt: "An old couch from college.", exEs: "Un viejo sillón de la universidad." },
  except: { es: "excepto", type: "preposizione", exIt: "Everything except the car!", exEs: "¡Todo menos el auto!" },
  project: { es: "proyecto", type: "sostantivo", exIt: "Weekend projects and stuff.", exEs: "Proyectos de fin de semana y cosas." },
  sushi: { es: "sushi", type: "sostantivo", exIt: "A bakery, a pharmacy and a sushi bar.", exEs: "Panadería, farmacia y bar de sushi." },
  bar: { es: "barra / bar", type: "sostantivo", exIt: "A sushi bar in the supermarket.", exEs: "Un bar de sushi en el súper." },
  own: { es: "propio", type: "aggettivo", exIt: "You bag your own groceries.", exEs: "Embolsas tu propia compra." },
  groceries: { es: "compra (del súper)", type: "sostantivo", exIt: "Bag your own groceries.", exEs: "Embolsa tu propia compra." },
  whisper: { es: "susurro · susurrar", type: "verbo", exIt: "Teach me, master, I whisper.", exEs: "Enséñame, maestra, susurro." },
  gram: { es: "gramo", type: "sostantivo", exIt: "454 grams per pound.", exEs: "454 gramos por libra." },
  kilo: { es: "kilo", type: "sostantivo", exIt: "My brain still thinks in kilos.", exEs: "Mi cerebro sigue pensando en kilos." },
  clerk: { es: "empleado (mostrador)", type: "sostantivo", exIt: "You'll get used to it, says the clerk.", exEs: "Te acostumbrarás, dice el empleado." },
  catch: { es: "atrapar · coger (tren)", type: "verbo", exIt: "I have a train to catch.", exEs: "Tengo que tomar un tren." },
  guy: { es: "chico / tipo", type: "sostantivo", exIt: "Have a nice day, shouts the guy.", exEs: "Que tengas un buen día, grita el chico." },
  aside: { es: "a un lado", type: "avverbio", exIt: "Step aside, don't stop at the door.", exEs: "Hazte a un lado, no te pares en la puerta." },
  eye: { es: "ojo", type: "sostantivo", exIt: "No eye contact with the dancers.", exEs: "Sin contacto visual con los bailarines." },
  contact: { es: "contacto", type: "sostantivo", exIt: "No eye contact.", exEs: "Sin contacto visual." },
  dancer: { es: "bailarín", type: "sostantivo", exIt: "The break dancers on the train.", exEs: "Los bailarines de breakdance." },
  pole: { es: "tubo (poste)", type: "sostantivo", exIt: "The pole is for hands, not for backs.", exEs: "El tubo es para las manos, no para la espalda." },
  platform: { es: "andén", type: "sostantivo", exIt: "On the platform, a sign says it best.", exEs: "En el andén, un cartel lo resume." },
  gentleman: { es: "caballero", type: "sostantivo", exIt: "Ladies and gentlemen, backpacks are for backs.", exEs: "Señoras y señores, las mochilas son para la espalda." },
  backpack: { es: "mochila", type: "sostantivo", exIt: "Backpacks are for backs, not for the floor.", exEs: "Mochilas a la espalda, no al suelo." },
  warmth: { es: "calor / calidez", type: "sostantivo", exIt: "The warmth travels from your palms to your chest.", exEs: "El calor viaja de tus palmas a tu pecho." },
  chest: { es: "pecho", type: "sostantivo", exIt: "From your palms to your chest.", exEs: "De tus palmas a tu pecho." },
  die: { es: "morir", type: "verbo", exIt: "The joke never dies.", exEs: "El chiste nunca muere." },
  understand_v2: { es: "(ya cubierto)", type: "verbo", exIt: ".", exEs: "." },
};

/** Busca también en el suplemento 2 (ampliación de cobertura A1). */
function synthEntry(key: string, info: SupInfo, kind: SupKind): VocabWord {
  return {
    id: `${kind === "fw" ? "fw-en" : "sup-en"}-${key}`,
    it: info.exIt ?? key,
    es: info.es,
    pron: "",
    type: info.type,
    cat: "astratto",
    level: "A1",
    example: { it: info.exIt ?? "", es: info.exEs ?? "" },
  };
}

/* ── irregulares de alta frecuencia (forma normalizada → lema) ───── */
const IRREGULAR: Record<string, string> = {
  // be
  was: "be", were: "be", been: "be", being: "be",
  has: "have", // (have ya existe como lema)
  // have
  had: "have", having: "have", has2: "has",
  // do
  did: "do", done: "do", doing: "do",
  // go
  went: "go", gone: "go", goes: "go", going: "go",
  // make
  made: "make", making: "make", makes: "make",
  // get
  got: "get", gotten: "get", gets: "get", getting: "get",
  // take
  took: "take", taken: "take", takes: "take", taking: "take",
  // come
  came: "come", comes: "come", coming: "come",
  // see
  saw: "see", seen: "see", sees: "see", seeing: "see",
  // eat
  ate: "eat", eaten: "eat", eats: "eat", eating: "eat",
  // drink
  drank: "drink", drunk: "drink", drinks: "drink", drinking: "drink",
  // say
  said: "say", says: "say", saying: "say",
  // tell
  told: "tell", tells: "tell", telling: "tell",
  // think
  thought: "think", thinks: "think", thinking: "think",
  // give
  gave: "give", given: "give", gives: "give", giving: "give",
  // find
  found: "find", finds: "find", finding: "find",
  // feel
  felt: "feel", feeling: "feel", feels: "feel",
  // sleep
  slept: "sleep", sleeps: "sleep", sleeping: "sleep",
  // put
  puts: "put", putting: "put",
  // let
  lets: "let", letting: "let",
  // cut
  cuts: "cut", cutting: "cut",
  // run
  ran: "run", runs: "run", running: "run",
  // sit
  sat: "sit", sits: "sit", sitting: "sit",
  // buy
  bought: "buy", buys: "buy", buying: "buy",
  // bring
  brought: "bring", brings: "bring", bringing: "bring",
  // teach
  taught: "teach", teaches: "teach", teaching: "teach",
  // learn
  learned: "learn", learnt: "learn", learns: "learn", learning: "learn",
  // wake
  woke: "wake", wakes: "wake", waking: "wake", waked: "wake",
  // pay
  paid: "pay", pays: "pay", paying: "pay",
  // mean
  meant: "mean", means: "mean", meaning: "mean",
  // hold
  held: "hold", holds: "hold", holding: "hold",
  // hear
  heard: "hear", hears: "hear", hearing: "hear",
  // leave
  leftv: "leave", leaves: "leave", leaving: "leave",
  // lose
  lost: "lose", loses: "lose", losing: "lose",
  // win
  won: "win", winning: "win", wins: "win",
  // wear
  wore: "wear", worn: "wear", wears: "wear", wearing: "wear",
  // choose
  chose: "choose", chooses: "choose", choosing: "choose",
  // know
  knew: "know", known: "know", knows: "know", knowing: "know",
  // build
  built: "build", builds: "build", building: "build",
  // read (same spelling past)
  reads: "read", reading: "read",
  // write
  wrote: "write", written: "write", writes: "write", writing: "write",
  // speak
  spoke: "speak", spoken: "speak", speaks: "speak", speaking: "speak",
  // grow
  grew: "grow", grown: "grow", grows: "grow", growing: "grow",
  // begin
  began: "begin", begun: "begin", begins: "begin", beginning: "begin",
  // keep
  kept: "keep", keeps: "keep", keeping: "keep",
  // spend
  spent: "spend", spends: "spend", spending: "spend",
  // meet
  met: "meet", meets: "meet", meeting: "meet",
  // drive
  drove: "drive", driven: "drive", drives: "drive", driving: "drive",
  // fly
  flew: "fly", flown: "fly", flies: "fly", flying: "fly",
  // sing
  sang: "sing", sung: "sing", sings: "sing", singing: "sing",
  // stand
  stood: "stand", stands: "stand", standing: "stand",
  // understand
  understood: "understand", understands: "understand", understanding: "understand",
  // work / play regulars ya cubiertos por regla -s
  // bring/teach ya arriba
  oldest: "old", bigger: "big", biggest: "big", slower: "slow", faster: "fast", deeper: "deep",
  loves: "love", likes: "like", wants: "want", needs: "need", met2: "meet", // save
  saved: "save", saves: "save", saving: "save",
  // answer
  answers: "answer", answering: "answer",
  // miss
  missed: "miss", misses: "miss", missing: "miss",
  // hang
  hung: "hang",
  // show
  showed: "show", shown: "show", shows: "show", showing: "show",
  // grow up (frasal)
  grewup: "grow",
};

/** Busca la entrada del diccionario EN para una forma flexionada. */
export function lookupWordEn(form: string): VocabWord | undefined {
  const raw = form.trim();
  if (!raw) return undefined;

  // 0 · limpiar puntuación extrema (comillas, guiones de diálogo, símbolos)
  let w = raw.toLowerCase().replace(/^[^a-z'’]+|[^a-z'’]+$/g, "");
  if (!w) return undefined;

  // 0.bis · contracciones (antes de que la normalización borre el apóstrofe)
  const cKey = w.replace(/’/g, "'");
  const contr = CONTRACTIONS[contrKey(cKey)];
  if (contr) {
    const hit = find(contr);
    if (hit) return hit;
    const sup = (SUPPLEMENT[contr] ?? SUPPLEMENT2[contr]);
    if (sup) return synthEntry(contr, sup, "fw");
  }

  // 1 · forma exacta
  const n = norm(w);
  let hit = find(w);
  if (hit) return hit;

  // 1.bis · suplemento
  const sup = (SUPPLEMENT[n] ?? SUPPLEMENT2[n]);
  if (sup) {
    const kind: SupKind = ["a", "an", "the", "will", "can", "would", "gonna", "wanna", "gotta", "ok", "okay", "yeah", "hey", "as", "same"].includes(n) ? "fw" : "sup";
    return synthEntry(n, sup, kind);
  }

  // 2 · irregulares frecuentes
  const irr = IRREGULAR[n];
  if (irr) {
    hit = find(irr);
    if (hit) return hit;
  }

  // 3 · sustantivos plurales irregulares clave
  const NOUN_PL: Record<string, string> = {
    men: "man", women: "woman", children: "child", people: "person",
    feet: "foot", teeth: "tooth", wives: "wife", shelves: "shelf",
    leaves: "leaf", lives: "life", knives: "knife", stories: "story",
    cities: "city", babies: "baby", activities: "activity",
    libraries: "library", universities: "university", studies: "study",
    memories: "memory", worries: "worry", democracies: "democracy",
  };
  const np = NOUN_PL[n];
  if (np) {
    hit = find(np);
    if (hit) return hit;
  }

  // 4 · tercera persona y plurales regulares: watches→watch, wings→wing
  if (w.endsWith("s")) {
    const candidates: string[] = [];
    if (w.endsWith("es")) candidates.push(w.slice(0, -2));            // watches→watch, boxes→box
    if (w.endsWith("ies")) candidates.push(w.slice(0, -3) + "y");       // carries→carry, cities→city
    candidates.push(w.slice(0, -1));                                     // wings→wing, cups→cup
    for (const c of candidates) {
      hit = find(c);
      if (hit) return hit;
      const sup2 = (SUPPLEMENT[norm(c)] ?? SUPPLEMENT2[norm(c)]);
      if (sup2) return synthEntry(norm(c), sup2, "sup");
    }
  }

  // 5 · formas en -ing: making→make, sitting→sit, coming→come
  if (w.endsWith("ing") && w.length > 5) {
    const stem = w.slice(0, -3);
    const candidates = [
      stem,                    // playing→play
      stem + "e",              // making→make, coming→come
      stem.slice(0, -1),       // sitting→sit (consonante duplicada)
      stem + "k",              // shopping? (shop→shopp no; shop directo)
    ];
    for (const c of candidates) {
      hit = find(c);
      if (hit) return hit;
      const sup2 = (SUPPLEMENT[norm(c)] ?? SUPPLEMENT2[norm(c)]);
      if (sup2) return synthEntry(norm(c), sup2, "sup");
    }
  }

  // 6 · pasado regular: watched→watch, arrived→arrive
  if (w.endsWith("ed") && w.length > 4) {
    const stem = w.slice(0, -2);
    const candidates = [stem, stem + "e", stem.slice(0, -1)];
    for (const c of candidates) {
      hit = find(c);
      if (hit) return hit;
      const sup2 = (SUPPLEMENT[norm(c)] ?? SUPPLEMENT2[norm(c)]);
      if (sup2) return synthEntry(norm(c), sup2, "sup");
    }
  }

  // 7 · adverbios en -ly: slowly→slow, calmly→calm, simply→simple (+e)
  if (w.endsWith("ly") && w.length > 5) {
    const stem = w.slice(0, -2);
    for (const c of [stem, stem + "e"]) {
      hit = find(c);
      if (hit) return hit;
      const sup2 = SUPPLEMENT[norm(c)] ?? SUPPLEMENT2[norm(c)];
      if (sup2) return synthEntry(norm(c), sup2, "sup");
    }
  }

  return undefined;
}

/** clave de contracción normalizada (sin apóstrofe) */
function contrKey(s: string): string {
  return s.replace(/'/g, "").toLowerCase();
}
