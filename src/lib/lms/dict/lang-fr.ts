import type { VocabWord, WordType, WordCategory } from "../types";
import { FR_PLUS } from "./lang-fr-plus";
import { FR_MEGA } from "./lang-fr-mega";
import { dedupMerge } from "./mega-parse";

/* ═══ FR Dictionary · français de France → español (A1-B1) ══════════════
   Formato de líneas: mot|es|ipa|T|cat|freq|exFr|exEs[|p=…;n=…;ff=1]
   · T → S sustantivo · V verbo · A adjetivo · D adverbio · E expresión
         P pronombre · R preposición · C conjunción · T artículo
         N numeral · I interjección · L locución
   · cat → código temático (igual que el italiano)
   · p= plural irregular · n= nota contrastiva · ff= falso amigo FR-ES
   · Campos `.it` = francés (lengua de estudio), `.es` = español.     */

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

function parseFr(lines: string): VocabWord[] {
  const out: VocabWord[] = [];
  for (const raw of lines.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const f = line.split("|");
    if (f.length < 7) continue;
    const extrasRaw = f[8] ?? "";
    const extras = new Map<string, string>();
    for (const kv of extrasRaw.split(";")) {
      const i = kv.indexOf("=");
      if (i > 0) extras.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim());
    }
    const freq = (Number(f[5]) || 3) as 1 | 2 | 3 | 4 | 5;
    const level: VocabWord["level"] = freq >= 4 ? "A1" : freq === 3 ? "A2" : "B1";
    out.push({
      id: `fr-${f[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      it: f[0],
      es: f[1],
      pron: f[2],
      ipa: f[2],
      type: TYPE[f[3]] ?? "sostantivo",
      cat: CAT[f[4]] ?? "astratto",
      level,
      freq,
      example: { it: f[6], es: f[7] },
      plural: extras.get("p"),
      note: extras.get("n"),
      ff: extras.get("ff") === "1",
    });
  }
  return out;
}

const FR_DICT_BASE: VocabWord[] = parseFr(`
# ── saludos y cortesía ─────────────────────────────────────────────
bonjour|buenos días / hola|bɔ̃ʒuʁ|I|sal|5|Bonjour, Madame !|¡Buenos días, señora!
bonsoir|buenas noches (al saludar)|bɔ̃swaʁ|I|sal|5|Bonsoir, entrez !|¡Buenas noches, pase!
salut|hola / salut|saly|I|sal|5|Salut, ça va ?|¡Hola, ¿qué tal?
au revoir|adiós|o ʁəvwaʁ|L|sal|5|Au revoir, à demain !|Adiós, ¡hasta mañana!
à bientôt|hasta pronto|a bjɛ̃to|L|sal|4|À bientôt, j'espère !|¡Hasta pronto, espero!
à demain|hasta mañana|a dɛmɛ̃|L|sal|5|À demain à l'école !|¡Hasta mañana en la escuela!
à tout à l'heure|hasta ahora|a tut a lœʁ|L|sal|4|À tout à l'heure au café !|¡Hasta ahora en el café!
bonne journée|buen día|bɔn ʒuʁne|L|sal|4|Bonne journée, Monsieur !|¡Buen día, señor!
bonne nuit|buenas noches (al acostarse)|bɔn nɥi|L|sal|4|Bonne nuit, fais de beaux rêves.|Buenas noches, sueña bonito.
bienvenue|bienvenido|bjɛ̃vəny|E|sal|4|Bienvenue à Paris !|¡Bienvenido a París!
enchanté|encantado|ɑ̃ʃɑ̃te|E|sal|4|Enchanté, je m'appelle Léo.|Encantado, me llamo Léo.
madame|señora|madam|N|cmu|5|Bonjour, Madame Dubois.|Buenos días, señora Dubois.
monsieur|señor|məsjø|N|cmu|5|Monsieur Martin, un café s'il vous plaît ?|¿Señor Martin, un café por favor?
mademoiselle|señorita|madmwazɛl|N|cmu|3|Mademoiselle, par ici !|¡Señorita, por aquí!
pardon|perdón|paʁdɔ̃|I|cmu|5|Pardon, je suis en retard.|Perdón, llego tarde.
excuser|disculpar|ɛkskyze|V|cmu|4|Excusez-moi, Madame.|Perdóneme, señora.
nom|nombre|nɔ̃|S|cmu|5|Mon nom est Ana Ruiz.|Mi nombre es Ana Ruiz.
prénom|nombre de pila|pʁenɔ̃|S|cmu|5|Quel est ton prénom ?|¿Cuál es tu nombre?
question|pregunta|kɛstjɔ̃|S|cmu|4|J'ai une question.|Tengo una pregunta.
réponse|respuesta|ʁepɔ̃s|S|cmu|4|Sa réponse est non.|Su respuesta es no.
# ── comunicación: verbos ───────────────────────────────────────────
parler|hablar|paʁle|V|cmu|5|Je parle un peu français.|Hablo un poco de francés.
dire|decir|diʁ|V|cmu|5|Comment dit-on «merci» ?|¿Cómo se dice «merci»?
demander|pedir / preguntar|dəmɑ̃de|V|cmu|4|Je demande mon chemin.|Pregunto por el camino.|ff=1; n=«demander» = preguntar/pedir · «demandar» (juicio) = «poursuivre»
répondre|responder|ʁepɔ̃dʁ|V|cmu|4|Réponds-moi vite !|¡Respóndeme rápido!
comprendre|entender|kɔ̃pʁɑ̃dʁ|V|cmu|5|Je ne comprends pas.|No entiendo.
expliquer|explicar|ɛksplike|V|cmu|4|Le professeur explique la règle.|El profesor explica la regla.
répéter|repetir|ʁepete|V|cmu|4|Répétez, s'il vous plaît.|Repita, por favor.
écouter|escuchar|ekyte|V|cmu|5|J'écoute la radio.|Escucho la radio.
entendre|oír|ɑ̃tɑ̃dʁ|V|cmu|5|Je n'entends pas bien.|No oigo bien.|ff=1; n=«entendre» = oír · «entender» = «comprendre»
appeler|llamar|aple|V|cmu|5|Comment tu t'appelles ?|¿Cómo te llamas?
traduire|traducir|tʁadɥiʁ|V|cmu|3|Peux-tu traduire en espagnol ?|¿Puedes traducir al español?
écrire|escribir|ekʁiʁ|V|let|5|J'écris une carte postale.|Escribo una postal.
lire|leer|liʁ|V|let|5|Je lis le journal.|Leo el periódico.
connaître|conocer|kɔnɛtʁ|V|cmu|4|Je connais bien Paris.|Conozco bien París.
rencontrer|conocer (por primera vez)|ʁɑ̃kɔ̃tʁ|V|rel|4|J'ai rencontré Camille hier.|Conocí a Camille ayer.
saluer|saludar|salɥe|V|cmu|3|Il salue ses voisins.|Saluda a sus vecinos.
# ── familia ─────────────────────────────────────────────────────────
famille|familia|famij|S|fam|5|Ma famille est grande.|Mi familia es grande.
père|padre|pɛʁ|S|fam|5|Mon père est médecin.|Mi padre es médico.
mère|madre|mɛʁ|S|fam|5|Ma mère travaille beaucoup.|Mi madre trabaja mucho.
parents|padres|paʁɑ̃|S|fam|5|Mes parents habitent à Lyon.|Mis padres viven en Lyon.
parent|pariente|paʁɑ̃|S|fam|3|Un parent éloigné viendra.|Vendrá un pariente lejano.
frère|hermano|fʁɛʁ|S|fam|5|Mon frère a dix ans.|Mi hermano tiene diez años.
sœur|hermana|sœʁ|S|fam|5|Ma sœur s'appelle Inès.|Mi hermana se llama Inès.
fils|hijo|fis|S|fam|5|Leur fils est petit.|Su hijo es pequeño.|p=fils
fille|hija|fij|S|fam|5|Sa fille a trois ans.|Su hija tiene tres años.
enfant|niño / hijo|ɑ̃fɑ̃|S|fam|5|L'enfant joue dans le parc.|El niño juega en el parque.
bébé|bebé|bebe|S|fam|4|Le bébé dort.|El bebé duerme.
mari|marido|maʁi|S|fam|4|Mon mari est espagnol.|Mi marido es español.
femme|mujer / esposa|fam|S|fam|5|Ma femme est professeure.|Mi mujer es profesora.
grand-père|abuelo|ɡʁɑ̃pɛʁ|S|fam|5|Mon grand-père raconte des histoires.|Mi abuelo cuenta historias.
grand-mère|abuela|ɡʁɑ̃mɛʁ|S|fam|5|Ma grand-mère fait des crêpes.|Mi abuela hace crepes.
oncle|tío|ɔ̃kl|S|fam|4|Mon oncle habite à Nice.|Mi tío vive en Niza.
tante|tía|tɑ̃t|S|fam|4|Ma tante adore le cinéma.|Mi tía adora el cine.
cousin|primo|kuzɛ̃|S|fam|4|Mon cousin est au lycée.|Mi primo está en el instituto.
cousine|prima|kuzin|S|fam|4|Ma cousine chante bien.|Mi prima canta bien.
petit-fils|nieto|pətifis|S|fam|3|Leur petit-fils est né hier.|Su nieto nació ayer.
petite-fille|nieta|pətitifij|S|fam|3|Sa petite-fille a cinq ans.|Su nieta tiene cinco años.
beau-père|suegro (y padrastro)|bopɛʁ|S|fam|3|Mon beau-père est retraité.|Mi suegro está jubilado.
belle-mère|suegra (y madrastra)|bɛlmɛʁ|S|fam|3|Ma belle-mère cuisine très bien.|Mi suegra cocina muy bien.
mariage|boda|maʁjaʒ|S|fam|3|Le mariage est en juin.|La boda es en junio.
# ── relaciones y personas ──────────────────────────────────────────
ami|amigo|ami|S|rel|5|C'est mon meilleur ami.|Es mi mejor amigo.
amie|amiga|ami|S|rel|5|Mon amie vient demain.|Mi amiga viene mañana.
copain|amigo / colega|kɔpɛ̃|S|rel|4|Je sors avec mes copains.|Salgo con mis colegas.
copine|amiga|kɔpin|S|rel|4|Ma copine adore danser.|Mi amiga adora bailar.
gens|gente|ʒɑ̃|S|rel|4|Les gens sont gentils ici.|La gente es amable aquí.
homme|hombre|ɔm|S|rel|5|Un homme attend dehors.|Un hombre espera fuera.
garçon|chico / niño|ɡaʁsɔ̃|S|rel|5|Le garçon lit un livre.|El chico lee un libro.
personne|persona|pɛʁsɔn|S|rel|4|Une personne très polie.|Una persona muy educada.
couple|pareja|kupl|S|rel|3|Un couple heureux.|Una pareja feliz.
amoureux|enamorado|amuʁø|A|rel|3|Ils sont amoureux.|Están enamorados.
voisin|vecino|vwazɛ̃|S|rel|4|Mon voisin est bricoleur.|Mi vecino es manitas.
voisine|vecina|vwazin|S|rel|4|Ma voisine a un chien.|Mi vecina tiene un perro.
aimer|querer / encantar|eme|V|rel|5|J'aime le chocolat.|Me encanta el chocolate.
adorer|adorar|adɔʁe|V|rel|4|J'adore ce film.|Adoro esta película.
détester|odiar|detɛste|V|rel|3|Elle déteste le bruit.|Ella odia el ruido.
embrasser|besar|ɑ̃bʁase|V|rel|3|Le bébé embrasse sa mère.|El bebé besa a su madre.
inviter|invitar|ɛ̃vite|V|rel|4|Je t'invite à dîner.|Te invito a cenar.
rendre visite|ir de visita|ʁɑ̃dʁə vizit|L|rel|3|On rend visite à mamie.|Vamos de visita a la abuela.
s'entendre bien|llevarse bien|sɑ̃tɑ̃dʁə bjɛ̃|L|rel|2|On s'entend bien depuis le début.|Nos llevamos bien desde el principio.
# ── casa ────────────────────────────────────────────────────────────
maison|casa|mɛzɔ̃|S|cas|5|Ma maison est petite.|Mi casa es pequeña.
appartement|piso|apaʁtmɑ̃|S|cas|4|Un appartement avec balcon.|Un piso con balcón.
chambre|habitación / dormitorio|ʃɑ̃bʁ|S|cas|5|Ma chambre est claire.|Mi habitación es luminosa.
cuisine|cocina (cuarto y comida)|kɥizin|S|cas|5|La cuisine sent bon.|La cocina huele bien.
salon|salón|salɔ̃|S|cas|4|Le salon donne sur la rue.|El salón da a la calle.
salle de bains|cuarto de baño|sal də bɛ̃|L|cas|4|La salle de bains est en haut.|El cuarto de baño está arriba.
toilettes|aseo|twalɛt|S|cas|3|Où sont les toilettes ?|¿Dónde está el aseo?|p=toilettes
lit|cama|li|S|cas|5|Je fais mon lit.|Hago mi cama.|n=«lit» = cama · «il lit» = él lee («lire»)
table|mesa|tabl|S|cas|5|Mets le couvert sur la table.|Pon la mesa.
chaise|silla|ʃɛz|S|cas|5|Une chaise et deux tabourets.|Una silla y dos taburetes.
fenêtre|ventana|fənɛtʁ|S|cas|5|Ferme la fenêtre, s'il te plaît.|Cierra la ventana, por favor.
porte|puerta|pɔʁt|S|cas|5|La porte est ouverte.|La puerta está abierta.
clé|llave|kle|S|cas|4|J'ai perdu mes clés.|He perdido mis llaves.
toit|tejado|twa|S|cas|3|Le toit est rouge.|El tejado es rojo.
mur|pared|myʁ|S|cas|4|Un tableau sur le mur.|Un cuadro en la pared.
sol|suelo|sɔl|S|cas|3|Le sol est en bois.|El suelo es de madera.
escalier|escalera|ɛskalje|S|cas|4|Monte l'escalier.|Sube la escalera.
ascenseur|ascensor|asɑ̃sœʁ|S|cas|4|Prends l'ascenseur.|Coge el ascensor.
étage|piso (de un edificio)|etaʒ|S|cas|4|J'habite au troisième étage.|Vivo en el tercer piso.
jardin|jardín|ʒaʁdɛ̃|S|cas|4|Un jardin avec des roses.|Un jardín con rosas.
balcon|balcón|balkɔ̃|S|cas|3|On prend l'apéritif au balcon.|Tomamos el aperitivo en el balcón.
garage|garaje|ɡaʁaʒ|S|cas|3|La voiture est au garage.|El coche está en el garaje.
cave|bodega / sótano|kav|S|cas|3|Le vin dort dans la cave.|El vino duerme en la bodega.|ff=1; n=«cave» = bodega/sótano · la «cava» española es el vino espumoso
meuble|mueble|møbl|S|cas|4|Des meubles anciens.|Muebles antiguos.
canapé|sofá|kanape|S|cas|4|Le chat dort sur le canapé.|El gato duerme en el sofá.
armoire|armario|aʁmwaʁ|S|cas|4|Les pulls dans l'armoire.|Los jerséis en el armario.
étagère|estantería|etaʒɛʁ|S|cas|3|Livres et plantes sur l'étagère.|Libros y plantas en la estantería.
tapis|alfombra|tapi|S|cas|3|Un tapis dans le salon.|Una alfombra en el salón.
lampe|lámpara|lɑ̃p|S|cas|4|Allume la lampe.|Enciende la lámpara.
douche|ducha|duʃ|S|cas|4|Je prends une douche.|Me ducho.
baignoire|bañera|bɛɲwaʁ|S|cas|3|Une baignoire blanche.|Una bañera blanca.
miroir|espejo|miʁwaʁ|S|cas|4|Regarde-toi dans le miroir.|Mírate en el espejo.
serviette|toalla|sɛʁvjɛt|S|cas|4|Une serviette propre.|Una toalla limpia.
couette|edredón|kukɛt|S|cas|2|Une couette douce.|Un edredón suave.
coussin|cojín|kusɛ̃|S|cas|2|Des coussins colorés.|Cojines de colores.
immeuble|edificio|imœbl|S|cas|4|Un immeuble haussmannien.|Un edificio hausmanniano.
propriétaire|propietario|pʁɔpʁjetɛʁ|S|cas|3|Le propriétaire est gentil.|El propietario es simpático.
loyer|alquiler (importe)|lwaje|S|cas|3|Le loyer est de 800 euros.|El alquiler es de 800 euros.
habiter|vivir (residir)|abite|V|cas|5|J'habite à Marseille.|Vivo en Marsella.
vivre|vivir|vivʁ|V|ast|3|On vit bien ici.|Se vive bien aquí.
louer|alquilar|lue|V|cas|4|Nous louons un studio.|Alquilamos un estudio.
déménager|mudarse|demenaʒe|V|cas|2|On déménage en septembre.|Nos mudamos en septiembre.
emménager|instalarse (en casa)|emenɑʒe|V|cas|2|J'emménage samedi.|Me instalo el sábado.
# ── comida y bebida ─────────────────────────────────────────────────
pain|pan|pɛ̃|S|ali|5|Une baguette bien cuite.|Una barra bien hecha.
beurre|mantequilla|bœʁ|S|ali|4|Du beurre sur les tartines.|Mantequilla en las tostadas.
confiture|mermelada|kɔ̃fytyʁ|S|ali|4|De la confiture de fraises.|Mermelada de fresas.
fromage|queso|fʁɔmaʒ|S|ali|5|Le fromage français est varié.|El queso francés es variado.
yaourt|yogur|jauʁt|S|ali|4|Un yaourt aux fruits.|Un yogur de frutas.
œuf|huevo|œf|S|ali|4|Deux œufs au plat.|Dos huevos fritos.|p=œufs
viande|carne|vjɑ̃d|S|ali|4|Je ne mange pas de viande.|No como carne.
poisson|pescado|pwassɔ̃|S|ali|4|Du poisson grillé.|Pescado a la plancha.
poulet|pollo|pulɛ|S|ali|4|Un poulet rôti.|Un pollo asado.
riz|arroz|ʁi|S|ali|4|Du riz au curry.|Arroz al curry.
pâtes|pasta|pɑt|S|ali|5|Des pâtes à l'huile d'olive.|Pasta con aceite de oliva.
soupe|sopa|sup|S|ali|4|De la soupe à l'oignon.|Sopa de cebolla.
salade|ensalada|salad|S|ali|5|Une salade verte.|Una ensalada verde.
tomate|tomate|tɔmat|S|ali|5|Des tomates du jardin.|Tomates del huerto.
pomme de terre|patata|pɔm də tɛʁ|L|ali|4|Des pommes de terre sautées.|Patatas salteadas.
légume|verdura|leɡym|S|ali|4|Mange des légumes !|¡Come verduras!
fruit|fruta|fʁɥi|S|ali|5|Un fruit après le repas.|Una fruta tras la comida.
pomme|manzana|pɔm|S|ali|5|Une pomme et un croissant.|Una manzana y un croissant.
poire|pera|pwaʁ|S|ali|4|Une poire bien mûre.|Una pera bien madura.
banane|plátano|banan|S|ali|5|Une banane pour le petit déjeuner.|Un plátano para desayunar.
orange|naranja (y color naranja)|oʁɑ̃ʒ|S|ali|5|Un jus d'orange, s'il vous plaît.|Un zumo de naranja, por favor.
fraise|fresa|fʁɛz|S|ali|4|Des fraises avec de la crème.|Fresas con nata.
raisin|uva|ʁɛzɛ̃|S|ali|4|Du raisin blanc et noir.|Uva blanca y negra.
citron|limón|sitʁɔ̃|S|ali|4|Un citron pressé.|Un limón exprimido.
prune|ciruela|pʁyn|S|ali|3|Une prune bien juteuse.|Una ciruela bien jugosa.|ff=1; n=«prune» = ciruela · «ciruela pasa» = «pruneau»
sucre|azúcar|sykʁ|S|ali|5|Un café sans sucre.|Un café sin azúcar.
sel|sal|sɛl|S|ali|5|Trop de sel n'est pas sain.|Demasiada sal no es sano.
poivre|pimienta|pwavʁ|S|ali|4|Le moulin à poivre.|El molino de pimienta.
huile|aceite|ɥil|S|ali|4|De l'huile d'olive.|Aceite de oliva.
gâteau|pastel / tarta|ɡato|S|ali|4|Un gâteau au chocolat.|Una tarta de chocolate.
crêpe|crep|kʁɛp|S|ali|4|Une crêpe au sucre.|Un crep con azúcar.
croissant|croissant|kʁwasɑ̃|S|ali|5|Un croissant chaud.|Un croissant caliente.
baguette|barra de pan|baɡɛt|S|ali|5|La baguette du matin.|La barra de la mañana.
chocolat|chocolate|ʃɔkɔla|S|ali|5|Du chocolat noir.|Chocolate negro.
glace|helado|ɡlas|S|ali|4|Une glace à la vanille.|Un helado de vainilla.
petit déjeuner|desayuno|pətidɛʒœne|L|ali|5|Le petit déjeuner à huit heures.|El desayuno a las ocho.
déjeuner|almuerzo (Francia)|deʒœne|S|ali|5|Le déjeuner est à midi et demi.|El almuerzo es a las doce y media.
dîner|cena|dine|S|ali|5|Le dîner est prêt.|La cena está lista.
repas|comida (del día)|ʁəpa|S|ali|4|Un repas léger le soir.|Una cena ligera por la noche.
faim|hambre|fɛ̃|S|ali|5|J'ai faim !|¡Tengo hambre!
soif|sed|swaf|S|ali|5|J'ai soif, il fait chaud.|Tengo sed, hace calor.
restaurant|restaurante|ʁɛstɔʁɑ̃|S|ris|5|Ce restaurant est sympa.|Este restaurante es agradable.
bistro|bistró|bistro|S|ris|3|On se voit au bistro de la place.|Nos vemos en el bistró de la plaza.
serveur|camarero|sɛʁvœʁ|S|ris|5|Le serveur prend la commande.|El camarero toma nota.
serveuse|camarera|sɛʁvœz|S|ris|4|La serveuse est très rapide.|La camarera es muy rápida.
addition|cuenta|adisjɔ̃|S|ris|4|L'addition, s'il vous plaît !|¡La cuenta, por favor!
menu|menú|məny|S|ris|4|Le menu du jour est à quinze euros.|El menú del día está a quince euros.
assiette|plato|asjɛt|S|ris|5|Une assiette creuse.|Un plato hondo.
verre|vaso|vɛʁ|S|ris|5|Un verre d'eau fraîche.|Un vaso de agua fresca.
tasse|taza|tas|S|ris|5|Une tasse de thé.|Una taza de té.
couteau|cuchillo|kuto|S|ris|5|Le couteau et la fourchette.|El cuchillo y el tenedor.
fourchette|tenedor|fuʁʃɛt|S|ris|5|Pose ta fourchette.|Deja el tenedor.
cuillère|cuchara|kɥijɛʁ|S|ris|5|Une cuillère à soupe.|Una cuchara.
bouteille|botella|butɛj|S|ali|5|Une bouteille d'eau.|Una botella de agua.
café|café (bebida y local)|kafe|S|ali|5|Un café en terrasse.|Un café en la terraza.
thé|té|te|S|ali|5|Un thé vert ou noir.|Un té verde o negro.
lait|leche|lɛ|S|ali|5|Du lait chaud.|Leche caliente.
eau|agua|o|S|ali|5|De l'eau plate ou gazeuse ?|¿Agua sin o con gas?
vin|vino|vɛ̃|S|ali|4|Un verre de vin rouge.|Una copa de vino tinto.
bière|cerveza|bjɛʁ|S|ali|4|Une bière bien fraîche.|Una cerveza bien fría.
apéritif|aperitivo|apeʁitif|S|ali|3|L'apéritif sur le zinc.|El aperitivo en la barra.
# ── cocina: verbos y expresiones ───────────────────────────────────
manger|comer|mɑ̃ʒe|V|ali|5|Je mange à la cantine.|Como en el comedor.
boire|beber|bwaʁ|V|ali|5|Bois ton lait !|¡Bebe tu leche!
goûter|probar (y merendar)|ɡute|V|ali|4|Goûte la soupe.|Prueba la sopa.
préparer|preparar|pʁepaʁe|V|ali|5|Je prépare le dîner.|Preparo la cena.
cuisiner|cocinar|kɥizine|V|ali|4|Il cuisine très bien.|Cocina muy bien.
servir|servir|sɛʁviʁ|V|ris|4|Que puis-je vous servir ?|¿Qué le puedo servir?
commander|pedir (en un bar)|kɔmɑ̃de|V|ris|4|On commande deux cafés.|Pedimos dos cafés.
partager|compartir|paʁtaʒe|V|rel|3|On partage le dessert.|Compartimos el postre.
bon appétit|buen provecho|bɔn apeti|L|ris|4|À table, bon appétit !|A mesa, ¡buen provecho!
# ── ciudad ──────────────────────────────────────────────────────────
ville|ciudad|vil|S|cit|5|Lyon est une belle ville.|Lyon es una ciudad bonita.
rue|calle|ʁy|S|cit|5|La rue est piétonne.|La calle es peatonal.
place|plaza|plas|S|cit|5|On se retrouve sur la place.|Quedamos en la plaza.
quartier|barrio|kaʁtje|S|cit|4|Mon quartier est tranquille.|Mi barrio es tranquilo.
centre-ville|centro de la ciudad|sɑ̃tʁəvil|S|cit|4|Le centre-ville est fermé le dimanche.|El centro está cerrado el domingo.
église|iglesia|eɡliz|S|cit|4|L'église est du XIIe siècle.|La iglesia es del siglo XII.
musée|museo|myze|S|cit|4|Le musée d'Orsay.|El museo de Orsay.
gare|estación|ɡaʁ|S|tra|5|La gare de Lyon.|La estación de Lyon.
aéroport|aeropuerto|aɛʁɔpɔʁ|S|tra|4|L'aéroport est loin.|El aeropuerto está lejos.
banque|banco|bɑ̃k|S|fin|5|La banque ouvre à neuf.|El banco abre a las nueve.
poste|correos|pɔst|S|ist|4|Je passe à la poste.|Paso por correos.
pharmacie|farmacia|faʁmasi|S|sla|5|La pharmacie de garde.|La farmacia de guardia.
boulangerie|panadería|bulɑ̃ʒʁi|S|ali|5|La boulangerie du coin.|La panadería del barrio.
marché|mercado|maʁʃe|S|cmp|5|Le marché du dimanche.|El mercado del domingo.
librairie|librería|libʁɛʁi|S|let|4|Une librairie près de la fac.|Una librería cerca de la facu.
mairie|ayuntamiento|mɛʁi|S|ist|3|La mairie de mon arrondissement.|El ayuntamiento de mi distrito.
pont|puente|pɔ̃|S|cit|5|Le pont Neuf à Paris.|El puente Neuf en París.
parc|parque|paʁk|S|cit|5|Les enfants jouent au parc.|Los niños juegan en el parque.
Seine|Sena (río de París)|sɛn|S|nat|4|On se promène au bord de la Seine.|Paseamos a orillas del Sena.
Tour Eiffel|torre Eiffel|tuʁ ɛfɛl|S|cit|4|La Tour Eiffel brille la nuit.|La torre Eiffel brilla de noche.
Louvre|Louvre (museo)|luvʁ|S|cit|4|Le Louvre est immense.|El Louvre es inmenso.
Champs-Élysées|Campos Elíseos|ʃɑ̃zelize|L|cit|3|On défile sur les Champs-Élysées.|Desfilamos por los Campos Elíseos.
métro|metro|metʁo|S|tra|5|Prends la ligne quatre.|Coge la línea cuatro.
arrêt|parada|aʁɛ|S|tra|4|Descends à l'arrêt suivant.|Baja en la parada siguiente.
# ── transporte y viajes ────────────────────────────────────────────
voiture|coche|vwatyʁ|S|tra|5|Ma voiture est au garage.|Mi coche está en el garaje.
train|tren|tʁɛ̃|S|tra|5|Le train part à huit heures.|El tren sale a las ocho.
avion|avión|avjɔ̃|S|tra|5|L'avion atterrit à dix.|El avión aterriza a las diez.
bus|autobús|bys|S|tra|5|Le bus passe toutes les dix minutes.|El autobús pasa cada diez minutos.
vélo|bici|velo|S|tra|5|Je vais au travail à vélo.|Voy al trabajo en bici.
taxi|taxi|taksi|S|tra|4|On prend un taxi pour la gare.|Cogemos un taxi para la estación.
bateau|barco|bato|S|vig|3|Le bateau-mouche sur la Seine.|El barco de paseo por el Sena.
billet|billete / boleto|bijɛ|S|tra|5|Un billet aller-retour.|Un billete de ida y vuelta.
voyage|viaje|vuajaʒ|S|vig|4|Bon voyage à Madrid !|¡Buen viaje a Madrid!
valise|maleta|valiz|S|vig|5|La valise est trop lourde.|La maleta pesa demasiado.
sac|bolso|sak|S|cmp|5|Un sac à main noir.|Un bolso negro.
sac à dos|mochila|saka do|S|stu|4|Un sac à dos d'école.|Una mochila de colegio.
passeport|pasaporte|paspɔʁ|S|vig|4|Passeport et carte d'identité.|Pasaporte y documento de identidad.
carte d'identité|documento de identidad|kaʁt didɑ̃tite|L|ist|4|Montre ta carte d'identité.|Enseña tu documento de identidad.
bagage|equipaje|baɡaʒ|S|htl|4|Les bagages pèsent vingt kilos.|El equipaje pesa veinte kilos.
hôtel|hotel|otɛl|S|htl|5|Un hôtel deux étoiles.|Un hotel de dos estrellas.
réception|recepción|ʁɛsɛpsjɔ̃|S|htl|4|La réception est à droite.|La recepción está a la derecha.
réserver|reservar|ʁɛzɛʁve|V|htl|5|Je réserve une chambre double.|Reservo una habitación doble.
arriver|llegar|aʁive|V|tra|5|On arrive à midi.|Llegamos a mediodía.
descendre|bajar|desɑ̃dʁ|V|tra|4|Je descends à la prochaine.|Bajo en la próxima.
monter|subir|mɔ̃te|V|tra|4|Monte l'escalier de droite.|Sube la escalera de la derecha.
passer|pasar|pase|V|tra|5|Passe me voir ce soir.|Pásate a verme esta tarde.
traverser|cruzar|tʁavɛʁse|V|tra|4|Traverse au piéton !|¡Cruza por el paso de peatones!
tourner|girar|tuʁne|V|tra|4|Tourne à gauche après la boulangerie.|Gira a la izquierda tras la panadería.
visiter|visitar|vizite|V|vig|4|On visite le Mont-Saint-Michel.|Visitamos el Mont-Saint-Michel.
voyager|viajar|vwajaʒe|V|vig|4|J'aime voyager en train.|Me gusta viajar en tren.
# ── direcciones ─────────────────────────────────────────────────────
bon voyage|buen viaje|bɔ̃ vuajaʒ|L|vig|4|Bon voyage et bonnes vacances !|¡Buen viaje y buenas vacaciones!
à droite|a la derecha|a dʁwat|L|cit|5|La pharmacie est à droite.|La farmacia está a la derecha.
à gauche|a la izquierda|a ɡoʃ|L|cit|5|Tourne à gauche au feu.|Gira a la izquierda en el semáforo.
tout droit|todo recto|tu dʁwa|L|cit|4|Continue tout droit deux cents mètres.|Sigue todo recto doscientos metros.
à côté de|al lado de|a kote də|L|cit|4|À côté du cinéma.|Al lado del cine.
près de|cerca de|pʁɛ də|L|cit|4|J'habite près du parc.|Vivo cerca del parque.
loin|lejos|lwɛ̃|D|cit|4|La mer n'est pas loin.|El mar no está lejos.
# ── trabajo ─────────────────────────────────────────────────────────
travail|trabajo|tʁavaj|S|lav|5|Le travail commence à neuf.|El trabajo empieza a las nueve.|p=travaux
travailler|trabajar|tʁavaje|V|lav|5|Je travaille de chez moi.|Trabajo desde casa.
bureau|despacho / oficina|byʁo|S|lav|5|Le bureau est au troisième.|La oficina está en el tercero.
entreprise|empresa|ɑ̃tʁəpʁiz|S|lav|4|Une entreprise familiale.|Una empresa familiar.
patron|jefe (dueño)|patʁɔ̃|S|lav|4|Le patron est content.|El jefe está contento.
chef|jefa / jefe|ʃɛf|S|lav|4|Le chef de service.|El jefe de servicio.
collègue|compañero de trabajo|kɔlɛɡ|S|lav|4|Mes collègues sont sympas.|Mis compañeros son simpáticos.
rendez-vous|cita|ʁɑ̃devu|S|lav|5|J'ai un rendez-vous à trois.|Tengo una cita a las tres.
réunion|reunión|ʁenyjɔ̃|S|lav|3|La réunion dure deux heures.|La reunión dura dos horas.
horaire|horario|ɔʁɛʁ|S|lav|3|Des horaires flexibles.|Un horario flexible.
salaire|salario|salɛʁ|S|lav|3|Un salaire correct.|Un salario decente.
chômage|paro|ʃomaʒ|S|lav|3|Il est au chômage.|Está en paro.
entretien|entrevista|ɑ̃tʁətjɛ̃|S|lav|3|L'entretien d'embauche.|La entrevista de trabajo.
contrat|contrato|kɔ̃tʁa|S|lav|3|Un contrat de six mois.|Un contrato de seis meses.
CV|currículum|seve|S|lav|3|J'envoie mon CV par mail.|Envío mi currículum por correo.
emploi|empleo|ɑ̃plwa|S|lav|4|Chercher un emploi à Lyon.|Buscar empleo en Lyon.
métier|oficio|metje|S|lav|3|Quel est ton métier ?|¿Cuál es tu oficio?
expérience|experiencia|ɛkspeʁjɑ̃s|S|lav|3|Trois ans d'expérience.|Tres años de experiencia.
congé|permiso / vacaciones|kɔ̃ʒe|S|lav|2|Un congé d'une semaine.|Una semana de permiso.
vacances|vacaciones|vakɑ̃s|S|vig|5|Bonnes vacances à la mer !|¡Buenas vacaciones en la playa!
retraite|jubilación / retiro|ʁətʁɛt|S|lav|3|Mon père est à la retraite.|Mi padre está jubilado.
gagner|ganar|ɡaɲe|V|fin|4|Il gagne bien sa vie.|Gana bien la vida.
# ── profesiones y estudios ─────────────────────────────────────────
professeur|profesor|pʁɔfɛsœʁ|S|pro|5|Le professeur de français.|El profesor de francés.
étudiant|estudiante|etydjɑ̃|S|stu|5|Un étudiant en médecine.|Un estudiante de medicina.
élève|alumno|elɛv|S|stu|4|Les élèves écoutent la leçon.|Los alumnos escuchan la lección.
avocat|abogado|avɔka|S|pro|3|Un avocat plaide demain.|Un abogado defiende mañana.|n=«avocat» = abogado y aguacate
ingénieur|ingeniero|ɛ̃ʒenjœʁ|S|pro|3|Ingénieur en informatique.|Ingeniero informático.
journaliste|periodista|ʒuʁnalist|S|pro|3|Une journaliste de France Info.|Una periodista de France Info.
cuisinier|cocinero|kɥizinje|S|pro|4|Le cuisinier prépare le menu.|El cocinero prepara el menú.
boulanger|panadero|bulɑ̃ʒe|S|pro|4|Le boulanger sort le pain.|El panadero saca el pan.
chauffeur|conductor|ʃofœʁ|S|pro|3|Le chauffeur de bus.|El conductor del autobús.
commerçant|tendero|kɔmɛʁsɑ̃|S|cmp|3|Un commerçant du quartier.|Un tendero del barrio.
artiste|artista|aʁtist|S|art|3|Une artiste peintre.|Una artista pintora.
chanteur|cantante|ʃɑ̃tœʁ|S|mus|4|Le chanteur monte sur scène.|El cantante sube al escenario.
écrivain|escritor|ekʁivɛ̃|S|let|3|Un écrivain célèbre.|Un escritor famoso.
dentiste|dentista|dɑ̃tist|S|pro|3|Le dentiste te reçoit à cinq.|El dentista te recibe a las cinco.
école|escuela|ekɔl|S|stu|5|L'école commence à huit heures et demie.|La escuela empieza a las ocho y media.
collège|instituto (12-15 años)|kɔlɛʒ|S|stu|4|Mon fils est au collège.|Mi hijo está en el instituto.
lycée|instituto (15-18 años)|lise|S|stu|4|Le lycée Henri IV.|El instituto Henri IV.
université|universidad|ynivɛʁsite|S|stu|4|L'université est en centre-ville.|La universidad está en el centro.
cours|clase / curso|kuʁ|S|stu|5|J'ai un cours à dix.|Tengo clase a las diez.
leçon|lección|ləsɔ̃|S|stu|4|La leçon de grammaire.|La lección de gramática.
exercice|ejercicio|ɛɡzɛʁsis|S|stu|4|Fais l'exercice trois.|Haz el ejercicio tres.
examen|examen|ɛɡzamɛ̃|S|stu|4|L'examen de fin d'année.|El examen de fin de curso.
crayon|lápiz|kʁɛjɔ̃|S|stu|4|Un crayon de papier.|Un lápiz de madera.
stylo|bolígrafo|stilo|S|stu|5|Écris avec ton stylo.|Escribe con tu bolígrafo.
cahier|cuaderno|kaje|S|stu|4|Un cahier de cent pages.|Un cuaderno de cien páginas.
livre|libro|livʁ|S|let|5|Ce livre est passionnant.|Este libro es apasionante.
tableau|pizarra / cuadro|tablo|S|stu|4|Le tableau noir de la classe.|La pizarra de la clase.
matière|asignatura|matjɛʁ|S|stu|3|Ma matière préférée.|Mi asignatura preferida.
histoire|historia (y cuento)|istwaʁ|S|stu|4|Une histoire de montagnes.|Una historia de montañas.
français|francés (lengua)|fʁɑ̃sɛ|S|stu|5|Le français est ma langue.|El francés es mi lengua.
espagnol|español (lengua)|ɛspaɲɔl|S|stu|4|L'espagnol s'apprend vite.|El español se aprende rápido.
anglais|inglés (lengua)|ɑ̃ɡlɛ|S|stu|4|Il parle anglais couramment.|Habla inglés con soltura.
italien|italiano (lengua)|italjɛ̃|S|stu|3|L'italien ressemble à l'espagnol.|El italiano se parece al español.
allemand|alemán (lengua)|almɑ̃|S|stu|3|L'allemand et le français.|El alemán y el francés.
langue|lengua / idioma|lɑ̃ɡ|S|stu|4|Quatre langues à la maison.|Cuatro lenguas en casa.
mot|palabra|mo|S|stu|4|Un mot inconnu.|Una palabra desconocida.
phrase|frase|fʁaz|S|stu|4|Une phrase simple.|Una frase simple.
étudier|estudiar|etydje|V|stu|5|J'étudie le soir.|Estudio por la tarde.
réviser|repasar|ʁevize|V|stu|3|Je révise pour l'examen.|Repaso para el examen.
réussir|aprobar / tener éxito|ʁeysiʁ|V|stu|3|Il a réussi son permis.|Ha aprobado el carné.
enseigner|enseñar|ɑ̃sɛɲe|V|stu|3|Elle enseigne au lycée.|Ella enseña en el instituto.
# ── salud ───────────────────────────────────────────────────────────
santé|salud|sɑ̃te|S|sla|5|Santé et sport vont ensemble.|La salud y el deporte van juntos.
malade|enfermo|malad|A|sla|5|Je suis malade aujourd'hui.|Hoy estoy enfermo.
maladie|enfermedad|malad|S|sla|4|Une maladie bénigne.|Una enfermedad leve.
médecin|médico|medsɛ̃|S|sla|5|Le médecin des urgences.|El médico de urgencias.
hôpital|hospital|opital|S|sla|4|L'hôpital est de l'autre côté.|El hospital está al otro lado.
ordonnance|receta (médica)|ɔʁdɔnɑ̃s|S|sla|3|Une ordonnance du docteur.|Una receta del médico.
comprimé|pastilla|kɔ̃pʁime|S|sla|3|Un comprimé matin et soir.|Una pastilla mañana y noche.
douleur|dolor|dulœʁ|S|sla|3|Une douleur au dos.|Un dolor de espalda.
blessure|herida|blɛsyʁ|S|sla|3|Une blessure au genou.|Una herida en la rodilla.
fièvre|fiebre|fjɛvʁ|S|sla|4|Il a de la fièvre.|Tiene fiebre.
toux|tos|tu|S|sla|4|Une toux sèche la nuit.|Una tos seca por la noche.
rhume|resfriado|ʁym|S|sla|4|Un rhume de trois jours.|Un resfriado de tres días.
blesser|herir|blɛse|V|sla|3|La chute lui a blessé le genou.|La caída le hirió la rodilla.|ff=1; n=«blesser» = herir · «ofender» = «offenser»
constipé|estreñido|kɔ̃stipe|A|sla|1|Il est constipé depuis deux jours.|Está estreñido desde hace dos días.|ff=1; n=«constipé» = estreñido · «resfriado» = «enrhumé»
enrhumé|resfriado|ɑ̃ʁyme|A|sla|2|Toute la famille est enrhumée.|Toda la familia está resfriada.
# ── cuerpo ──────────────────────────────────────────────────────────
corps|cuerpo|kɔʁ|S|cor|5|Le corps et l'esprit.|El cuerpo y la mente.
tête|cabeza|tɛt|S|cor|5|J'ai mal à la tête.|Me duele la cabeza.
cheveu|pelo (cabello)|ʃəvø|S|cor|4|Il se lave les cheveux.|Se lava el pelo.|p=cheveux
visage|cara|vizaʒ|S|cor|4|Le visage tourné vers la mer.|La cara vuelta hacia el mar.
œil|ojo|œj|S|cor|5|Ferme l'œil droit.|Cierra el ojo derecho.|p=yeux
oreille|oreja|ɔʁɛj|S|cor|5|À l'oreille, s'il te plaît.|Al oído, por favor.
nez|nariz|ne|S|cor|5|Le nez rouge de froid.|La nariz roja de frío.
bouche|boca|buʃ|S|cor|5|Ouvre la bouche, dis «ah».|Abre la boca, di «ah».
dent|diente|dɑ̃|S|cor|5|Une dent de sagesse.|Una muela del juicio.
épaule|hombro|epol|S|cor|4|L'épaule droite en avant.|El hombro derecho adelante.
bras|brazo|bʁa|S|cor|5|Les bras le long du corps.|Los brazos a lo largo del cuerpo.
main|mano|mɛ̃|S|cor|5|Serre-moi la main.|Dame la mano.
doigt|dedo|dwa|S|cor|5|Compte sur tes doigts.|Cuenta con los dedos.
dos|espalda|do|S|cor|5|Le dos droit, respire.|La espalda recta, respira.
ventre|vientre / barriga|vɑ̃tʁ|S|cor|4|J'ai mal au ventre.|Me duele la barriga.
jambe|pierna|ʒɑ̃b|S|cor|5|La jambe gauche en avant.|La pierna izquierda adelante.
genou|rodilla|ʒənu|S|cor|4|Le genou au sol.|La rodilla en el suelo.|p=genoux
pied|pie|pje|S|cor|5|Pieds nus sur le sable.|Pies descalzos en la arena.
cœur|corazón|kœʁ|S|cor|5|Le cœur bat la chamade.|El corazón late a mil.
sang|sangre|sɑ̃|S|cor|3|Le sang circule vite.|La sangre circula rápido.
peau|piel|po|S|cor|4|Une peau sensible au soleil.|Una piel sensible al sol.
dormir|dormir|dɔʁmiʁ|V|cor|5|Je dors huit heures.|Duermo ocho horas.
# ── compras y dinero ────────────────────────────────────────────────
magasin|tienda|maɡazɛ̃|S|cmp|5|Le magasin de la rue Nation.|La tienda de la calle Nation.
prix|precio|pʁi|S|cmp|5|Quel est le prix ?|¿Cuál es el precio?
cher|caro|ʃɛʁ|A|cmp|5|Ce manteau est trop cher.|Este abrigo es muy caro.
caisse|caja (para pagar)|kɛs|S|cmp|4|Payez à la caisse cinq.|Pague en la caja cinco.
client|cliente|kliɑ̃|S|cmp|4|Le client a toujours raison.|El cliente siempre tiene razón.
vendeur|vendedor|vɑ̃dœʁ|S|cmp|4|Le vendeur conseille bien.|El vendedor aconseja bien.
rayon|sección (de tienda)|ʁɛjɔ̃|S|cmp|3|Le rayon des enfants.|La sección de niños.
taille|talla|taj|S|cmp|4|Quelle est votre taille ?|¿Cuál es su talla?
soldes|rebajas|sɔld|S|cmp|3|Les soldes de janvier.|Las rebajas de enero.
essayer|probarse|eseje|V|cmp|4|Je peux l'essayer ?|¿Puedo probármelo?
acheter|comprar|aʃte|V|cmp|5|J'achète le pain chez le boulanger.|Compro el pan en la panadería.
dépenser|gastar|depɑ̃se|V|fin|3|Il dépense tout au café.|Se lo gasta todo en el café.
coûter|costar|kute|V|fin|4|Combien ça coûte ?|¿Cuánto cuesta?
gratuit|gratis|ɡʁatɥi|A|fin|3|L'entrée est gratuite.|La entrada es gratis.
argent|dinero|aʁʒɑ̃|S|fin|5|J'ai oublié mon argent.|He olvidado el dinero.
monnaie|cambio (vuelto)|mɔnɛ|S|fin|3|Gardez la monnaie.|Quédese el cambio.
euro|euro|øʁo|S|fin|5|Ça fait dix euros.|Son diez euros.
compte|cuenta (banco)|kɔ̃t|S|fin|3|Le compte est à zéro.|La cuenta está a cero.
dépense|gasto|depɑ̃s|S|fin|3|Les dépenses du mois.|Los gastos del mes.
payer|pagar|pajɛ|V|fin|5|Je paye par carte.|Pago con tarjeta.
riche|rico|ʁiʃ|A|fin|3|Une ville riche en histoire.|Una ciudad rica en historia.
pauvre|pobre|povʁ|A|fin|3|Une famille pauvre.|Una familia pobre.
# ── colores ─────────────────────────────────────────────────────────
rouge|rojo|ʁuʒ|A|col|5|Une robe rouge.|Un vestido rojo.
bleu|azul|blø|A|col|5|Le ciel est bleu.|El cielo es azul.
vert|verde|vɛʁ|A|col|5|Les yeux verts.|Los ojos verdes.
jaune|amarillo|ʒon|A|col|5|Un taxi jaune à New York.|Un taxi amarillo en Nueva York.
noir|negro|nwaʁ|A|col|5|Le chat noir.|El gato negro.
blanc|blanco|blɑ̃|A|col|5|Du vin blanc.|Vino blanco.
gris|gris|ɡʁi|A|col|4|Un ciel gris.|Un cielo gris.
marron|marrón / castaño|maʁɔ̃|A|col|4|Des chaussures marron.|Unos zapatos marrones.
rose|rosa|ʁoz|A|col|5|Une rose entre les roses.|Una rosa entre las rosas.
violet|violeta|vjɔlɛ|A|col|3|Des aubergines violettes.|Berenjenas violetas.
# ── ropa ────────────────────────────────────────────────────────────
robe|vestido|ʁɔb|S|rop|5|Elle porte une robe bleue.|Lleva un vestido azul.|ff=1; n=«robe» = vestido · «ropa» = «vêtements»
pantalon|pantalón|pɑ̃talɔ̃|S|rop|5|Un pantalon de survêtement.|Un pantalón de chándal.
chemise|camisa|ʃəmiz|S|rop|4|Une chemise à rayures.|Una camisa de rayas.
veste|chaqueta|vɛst|S|rop|4|Prends ta veste, il fait frais.|Coge la chaqueta, refresca.
manteau|abrigo|mɑ̃to|S|rop|4|Un manteau en laine.|Un abrigo de lana.
pull|jersey|pyl|S|rop|5|Un pull over la chemise.|Un jersey sobre la camisa.
jupe|falda|ʒyp|S|rop|4|Une jupe plissée.|Una falda plisada.
chaussure|zapato|ʃosyʁ|S|rop|5|Range tes chaussures !|¡Ordena tus zapatos!
t-shirt|camiseta|tiʃœʁt|S|rop|5|Un t-shirt de l'équipe de France.|Una camiseta de la selección francesa.
ceinture|cinturón|sɛ̃tyʁ|S|rop|4|Une ceinture en cuir noir.|Un cinturón de cuero negro.
chapeau|sombrero|ʃapo|S|rop|4|Un chapeau de paille.|Un sombrero de paja.
écharpe|bufanda|ɛʃaʁp|S|rop|4|Une écharpe rouge.|Una bufanda roja.
lunettes|gafas|lynɛt|S|cor|4|Mes lunettes de soleil.|Mis gafas de sol.
porter|llevar (puesto)|pɔʁte|V|rop|5|Il porte un costume sombre.|Lleva un traje oscuro.
# ── clima ───────────────────────────────────────────────────────────
soleil|sol|sɔlɛj|S|cli|5|Le soleil de Provence.|El sol de Provenza.
pluie|lluvia|plɥi|S|cli|5|La pluie sur les toits.|La lluvia sobre los tejados.
neige|nieve|nɛʒ|S|cli|4|La neige tombe en janvier.|Nieve en enero.
vent|viento|vɑ̃|S|cli|4|Le vent du nord.|El viento del norte.
nuage|nube|nɥaʒ|S|cli|4|Un nuage passe.|Pasa una nube.
ciel|cielo|sjɛl|S|cli|5|Le ciel sans nuage.|El cielo sin nubes.
froid|frío|fʁwa|A|cli|5|Il fait froid à Lille.|Hace frío en Lille.
chaud|calor / caliente|ʃo|A|cli|5|Il fait chaud à Séville.|Hace calor en Sevilla.
feu|fuego (y semáforo)|fø|S|cli|4|Passe au feu vert.|Pasa con el semáforo en verde.
pleuvoir|llover|plœvwaʁ|V|cli|4|Il va pleuvoir toute la semaine.|Va a llover toda la semana.
# ── naturaleza ──────────────────────────────────────────────────────
arbre|árbol|aʁbʁ|S|nat|5|Un arbre centenaire.|Un árbol centenario.
fleur|flor|flœʁ|S|nat|5|Des fleurs sur le balcon.|Flores en el balcón.
forêt|bosque / selva|fɔʁɛ|S|nat|3|La forêt des Landes.|El bosque de las Landas.
rivière|río|ʁivjɛʁ|S|nat|4|La rivière coule lentement.|El río fluye despacio.
mer|mar|mɛʁ|S|nat|5|La mer Méditerranée.|El mar Mediterráneo.
plage|playa|plaʒ|S|nat|5|La plage à marée basse.|La playa con marea baja.
montagne|montaña|mɔ̃taɲ|S|nat|4|La montagne en hiver.|La montaña en invierno.
île|isla|il|S|nat|3|Une île au large de la Corse.|Una isla frente a Córcega.
campagne|campo|kɑ̃paɲ|S|nat|4|La campagne au printemps.|El campo en primavera.
pays|país|pei|S|ist|5|Quel pays habites-tu ?|¿En qué país vives?
monde|mundo|mɔ̃d|S|ast|5|Le monde entier le sait.|El mundo entero lo sabe.
étoile|estrella|etwal|S|nat|4|Un hôtel trois étoiles.|Un hotel de tres estrellas.
# ── animales ────────────────────────────────────────────────────────
animal|animal|animɑ̃|S|ani|4|Un animal de compagnie.|Un animal de compañía.|p=animaux
chat|gato|ʃa|S|ani|5|Le chat dort au soleil.|El gato duerme al sol.
chien|perro|ʃjɛ̃|S|ani|5|Le chien aboie la nuit.|El perro ladra de noche.
oiseau|pájaro|wazo|S|ani|4|Un oiseau chante à la fenêtre.|Un pájaro canta en la ventana.
cheval|caballo|ʃəval|S|ani|4|Monter à cheval.|Montar a caballo.|p=chevaux
vache|vaca|vaʃ|S|ani|4|Les vaches dans le pré.|Las vacas en el prado.
cochon|cerdo|kɔʃɔ̃|S|ani|4|Un cochon rose.|Un cerdo rosa.
mouton|oveja|mutɔ̃|S|ani|3|Les moutons broutent.|Las ovejas pastan.
souris|ratón|suʁi|S|ani|4|Une souris dans la cuisine.|Un ratón en la cocina.
lapin|conejo|lapɛ̃|S|ani|4|Un lapin dans le potager.|Un conejo en el huerto.
# ── tiempo ──────────────────────────────────────────────────────────
temps|tiempo (y clima)|tɑ̃|S|tmp|5|Le temps passe vite.|El tiempo pasa rápido.
heure|hora|œʁ|S|tmp|5|Il est trois heures et quart.|Son las tres y cuarto.
minute|minuto|minut|S|tmp|5|Deux minutes de retard.|Dos minutos de retraso.
jour|día|ʒuʁ|S|tmp|5|Quel jour sommes-nous ?|¿Qué día es hoy?
semaine|semana|səmɛn|S|tmp|5|La semaine prochaine à Nantes.|La semana que viene en Nantes.
mois|mes|mwa|S|tmp|5|Le mois de juin est doux.|El mes de junio es suave.
an|año|ɑ̃|S|tmp|5|J'ai trente ans.|Tengo treinta años.
année|año (entero)|ane|S|tmp|5|Bonne année !|¡Feliz año!
matin|mañana|matɛ̃|S|tmp|5|Le matin, je bois un café.|Por la mañana bebo un café.
soir|tarde-noche|swaʁ|S|tmp|5|Ce soir, on reste à la maison.|Esta tarde-noche quedamos en casa.
nuit|noche|nɥi|S|tmp|5|La nuit tombe à six en hiver.|Anochece a las seis en invierno.
après-midi|tarde (12-18 h)|apʁemidi|S|tmp|4|L'après-midi, on joue au parc.|Por la tarde jugamos en el parque.
printemps|primavera|pʁɛ̃tɑ̃|S|tmp|4|Le printemps à Paris.|La primavera en París.
été|verano|ete|S|tmp|4|L'été au bord de la mer.|El verano a orillas del mar.
automne|otoño|otɔn|S|tmp|4|L'automne dans les vignes.|El otoño entre las viñas.
hiver|invierno|ivɛʁ|S|tmp|4|L'hiver à Chamonix.|El invierno en Chamonix.
# ── ocio ────────────────────────────────────────────────────────────
fête|fiesta|fɛt|S|sve|5|La fête du 14 Juillet.|La fiesta del 14 de Julio.
jeu|juego|ʒø|S|sve|5|Un jeu de société.|Un juego de mesa.|p=jeux
jouer|jugar|ʒwe|V|sve|5|Les enfants jouent dehors.|Los niños juegan fuera.
sport|deporte|spoʁ|S|sve|4|Le sport à l'école.|El deporte en el colegio.
football|fútbol|futbol|S|sve|4|Le football du dimanche.|El fútbol de los domingos.
musique|música|myzik|S|mus|5|Écouter de la musique.|Escuchar música.
chanson|canción|ʃɑ̃sɔ̃|S|mus|4|Une chanson de Brassens.|Una canción de Brassens.
danser|bailar|dɑ̃se|V|mus|5|On danse jusqu'à trois heures.|Bailamos hasta las tres.
chanter|cantar|ʃɑ̃te|V|mus|5|Je chante sous la douche.|Canto en la ducha.
cinéma|cine|sinema|S|cin|5|Aller au cinéma ce soir ?|¿Vamos al cine esta noche?
film|película|film|S|cin|5|Un film en version originale.|Una película en versión original.
acteur|actor|aktœʁ|S|cin|4|L'acteur principal du film.|El actor principal de la película.
roman|novela (libro)|ʁɔmɑ̃|S|let|3|Un roman de Simenon.|Una novela de Simenon.
photo|foto|foto|S|tec|4|Une photo du mariage.|Una foto de la boda.
télévision|televisión|televizjɔ̃|S|tec|4|La télévision dans la cuisine.|La televisión en la cocina.
week-end|fin de semana|wikɛnd|S|sve|4|Bon week-end à la montagne !|¡Buen fin de semana en la montaña!
# ── emociones y cualidades ─────────────────────────────────────────
grand|grande|ɡʁɑ̃|A|ast|5|Un grand immeuble gris.|Un edificio grande y gris.
petit|pequeño|pəti|A|ast|5|Un petit café de quartier.|Un café pequeño de barrio.
gros|gordo / grande|ɡʁo|A|ast|4|Un gros livre de recettes.|Un gran libro de recetas.
beau|bonito|bo|A|ast|5|Quel beau jour !|¡Qué día tan bonito!
vieux|viejo|vjø|A|ast|5|Un vieux quartier de pêcheurs.|Un barrio viejo de pescadores.
jeune|joven|ʒœn|A|ast|5|Une jeune fille au vélo.|Una chica joven en bici.
nouveau|nuevo|nuvo|A|ast|5|Un nouveau départ.|Un nuevo comienzo.
bon|bueno|bɔ̃|A|ast|5|Un bon restaurant pas cher.|Un buen restaurante barato.
mauvais|malo|movɛ|A|ast|5|Ce n'est pas une mauvaise idée.|No es una mala idea.
facile|fácil|fasil|A|ast|5|Le français est facile pour toi ?|¿El francés es fácil para ti?
difficile|difícil|difisil|A|ast|5|La grammaire est difficile.|La gramática es difícil.
long|largo|lɔ̃|A|ast|5|Un long week-end de trois jours.|Un fin de semana largo de tres días.
court|corto|kuʁ|A|ast|5|Un trajet court et direct.|Un trayecto corto y directo.
propre|limpio|pʁɔpʁ|A|ast|4|Une cuisine propre et rangée.|Una cocina limpia y ordenada.
vrai|verdadero|vʁɛ|A|ast|4|C'est une vraie tarte maison.|Es una tarta casera de verdad.
faux|falso|fo|A|ast|4|Un faux billet de vingt.|Un billete falso de veinte.
important|importante|ɛ̃poʁtɑ̃|A|ast|4|Une réunion importante.|Una reunión importante.
intéressant|interesante|ɛ̃teʁɛsɑ̃|A|ast|4|Un livre très intéressant.|Un libro muy interesante.
gentil|amable|ʒɑ̃ti|A|rel|4|Un chien très gentil.|Un perro muy amable.
sale|sucio|sal|A|ast|3|La cuisine est sale.|La cocina está sucia.|ff=1; n=«sale» = sucio · «salado» = «salé»
large|ancho|laʁʒ|A|ast|4|La rue est large.|La calle es ancha.|ff=1; n=«large» = ancho · «largo» = «long»
bizarre|raro|bizaʁ|A|ast|3|Ce bruit est bizarre.|Este ruido es raro.|ff=1; n=«bizarre» = raro · «bizarro» español = valiente, curtido
heureux|feliz|œʁø|A|emo|4|Ils forment un couple heureux.|Forman una pareja feliz.
fatigué|cansado|fatiɡe|A|emo|4|Je suis fatigué ce soir.|Estoy cansado esta noche.
peur|miedo|pœʁ|S|emo|4|J'ai peur du noir.|Tengo miedo a la oscuridad.
colère|rabia|kɔlɛʁ|S|emo|3|La colère monte.|La rabia sube.
amour|amor|amuʁ|S|emo|4|Un amour de jeunesse.|Un amor de juventud.
envie|ganas / antojo|ɑ̃vi|S|emo|3|J'ai envie de dormir.|Tengo ganas de dormir.|ff=1; n=«avoir envie de» = tener ganas de · «envidia» = «jalousie»
pleurer|llorar|plœʁe|V|emo|4|Le bébé pleure un peu.|El bebé llora un poco.
rire|reír|ʁiʁ|V|emo|4|On rit aux éclats.|Nos reímos a carcajadas.
sourire|sonreír|suʁiʁ|V|emo|4|Elle sourit à la voisine.|Sonríe a la vecina.
# ── verbos nucleares ────────────────────────────────────────────────
être|ser|ɛtʁ|V|ast|5|Aujourd'hui, je suis à la fac.|Hoy estoy en la facultad.
avoir|tener|avwaʁ|V|ast|5|J'ai deux frères.|Tengo dos hermanos.
aller|ir|ale|V|ast|5|Je vais au marché.|Voy al mercado.
faire|hacer|fɛʁ|V|ast|5|Qu'est-ce que tu fais ?|¿Qué haces?
pouvoir|poder|puvwaʁ|V|ast|5|Peux-tu m'aider ?|¿Puedes ayudarme?
vouloir|querer|vulwaʁ|V|ast|5|Je veux un café.|Quiero un café.
devoir|deber|dəvwaʁ|V|ast|5|Je dois partir à huit.|Tengo que irme a las ocho.|n=«devoir» también = tarea (escolaire)
savoir|saber|savwaʁ|V|cmu|4|Je sais ton numéro.|Sé tu número.
venir|venir|vəniʁ|V|ast|5|Viens chez moi !|¡Ven a mi casa!
prendre|tomar / coger|pʁɑ̃dʁ|V|ast|5|Je prends le bus de huit.|Cogo el autobús de las ocho.
mettre|poner(se)|mɛtʁ|V|ast|4|Mets ton manteau !|¡Ponte el abrigo!
voir|ver|vwaʁ|V|cmu|5|Je vois la tour Eiffel.|Veo la torre Eiffel.
partir|irse|paʁtiʁ|V|ast|5|On part en vacances.|Nos vamos de vacaciones.
sortir|salir|sɔʁtiʁ|V|ast|5|On sort ce soir.|Salimos esta noche.
tenir|sostener|təniʁ|V|ast|3|Tiens-moi le sac.|Sujétame el bolso.
ouvrir|abrir|uvʁiʁ|V|ast|4|Ouvre la fenêtre.|Abre la ventana.
attendre|esperar|atɑ̃dʁ|V|ast|4|J'attends le bus depuis dix minutes.|Espero el autobús desde hace diez minutos.|ff=1; n=«attendre» = esperar · «atender» = «s'occuper de»
donner|dar|dɔne|V|cmu|5|Donne-moi un stylo.|Dame un bolígrafo.
trouver|encontrar|tʁuve|V|ast|5|Je trouve mon chemin.|Encuentro mi camino.
chercher|buscar|ʃɛʁʃe|V|ast|5|Je cherche mes clés.|Busco mis llaves.
aider|ayudar|ede|V|cmu|5|Aide-moi, s'il te plaît.|Ayúdame, por favor.
montrer|mostrar|mɔ̃tʁe|V|cmu|4|Montre ta chambre.|Enseña tu habitación.
apporter|traer|apɔʁte|V|cmu|4|Apporte du pain.|Trae pan.
entrer|entrar|ɑ̃tʁe|V|ast|5|Entre, il fait froid !|¡Pasa, hace frío!
rester|quedarse|ʁɛste|V|ast|5|Reste dîner !|¡Quédate a cenar!
vendre|vender|vɑ̃dʁ|V|fin|3|On vend des crêpes.|Vendemos crepes.
choisir|elegir|ʃwaziʁ|V|ast|4|Choisis ton dessert.|Elige tu postre.
finir|terminar|finiʁ|V|ast|4|Je finis à six.|Termino a las seis.
commencer|empezar|kɔmɑ̃se|V|tmp|5|On commence à neuf.|Empezamos a las nueve.
apprendre|aprender|apʁɑ̃dʁ|V|stu|4|J'apprends le français.|Aprendo francés.
préférer|preferir|pʁefeʁe|V|ast|4|Je préfère le thé au café.|Prefiero el té al café.
décider|decidir|deside|V|ast|3|On décide ensemble.|Decidimos juntos.
espérer|esperar|ɛspeʁe|V|emo|3|J'espère te voir bientôt.|Espero verte pronto.
oublier|olvidar|ublje|V|cmu|4|N'oublie pas ton sac.|No olvides el bolso.
penser|pensar|pɑ̃se|V|emo|5|Je pense à toi.|Pienso en ti.
quitter|dejar / abandonar|kitte|V|ast|3|Je quitte Lyon demain.|Dejo Lyon mañana.|ff=1; n=«quitter» = irse de / abandonar · «quitar» = «enlever»
gaffe|metedura de pata|ɡaf|S|cmu|2|Il a fait une gaffe.|Ha hecho una metedura de pata.|ff=1; n=«gaffe» = torpeza, error · el «gafe» español viene de aquí
# ── verbos reflexivos ───────────────────────────────────────────────
se lever|levantarse|sələve|V|cor|5|Je me lève à sept.|Me levanto a las siete.
se coucher|acostarse|səkuʃe|V|cor|5|On se couche tard.|Nos acostamos tarde.
se dépêcher|darse prisa|sədepeʃe|V|tmp|3|Dépêche-toi !|¡Date prisa!
# ── funcionales: preposiciones, conjunciones, artículos ─────────────
de|de|də|R|cmu|5|Je viens de Madrid.|Vengo de Madrid.
en|en|ɑ̃|R|cmu|5|Elle est en classe.|Ella está en clase.
dans|dentro de / en|dɑ̃|R|cmu|5|Le pain est dans le sac.|El pan está en el bolso.
sur|sobre|syʁ|R|cmu|5|Le livre est sur la table.|El libro está sobre la mesa.
avec|con|avɛk|R|cmu|5|Café avec du lait.|Café con leche.
sans|sin|sɑ̃|R|cmu|5|Un café sans sucre.|Un café sin azúcar.
pour|para|puʁ|R|cmu|5|Un cadeau pour toi.|Un regalo para ti.
chez|en casa de|ʃɛ|R|cmu|4|On dîne chez Grand-mère.|Cenamos en casa de la abuela.
entre|entre|ɑ̃tʁ|R|cmu|4|Entre la gare et la mairie.|Entre la estación y el ayuntamiento.
et|y|e|C|cmu|5|Du thé et des biscuits.|Té y galletas.
ou|o|u|C|cmu|5|Thé ou café ?|¿Té o café?
mais|pero|mɛ|C|cmu|5|Je veux venir mais je travaille.|Quiero venir pero trabajo.
si|si|si|C|cmu|5|Si tu veux, on marche.|Si quieres, andamos.
que|que|kə|C|cmu|5|Le film que j'aime.|La película que me gusta.
quand|cuando|kɑ̃|C|tmp|5|Quand est-ce qu'on part ?|¿Cuándo nos vamos?
parce que|porque|paʁskə|L|cnn|5|Je reste parce qu'il pleut.|Me quedo porque llueve.
comme|como|kɔm|C|cmu|4|Fais comme moi.|Haz como yo.
accord|acuerdo|akɔʁ|S|ast|4|On est d'accord pour trois heures.|Quedamos a las tres, de acuerdo.
comment|cómo|kɔmɑ̃|D|cmu|5|Comment tu t'appelles ?|¿Cómo te llamas?
pourquoi|por qué|puʁkwa|D|cmu|5|Pourquoi pas ?|¿Por qué no?
combien|cuánto|kɔ̃bjɛ̃|D|cmp|5|Combien ça coûte ?|¿Cuánto cuesta?
un|un|œ̃|T|cmu|5|Un croissant, s'il vous plaît.|Un croissant, por favor.
une|una|yn|T|cmu|5|Une chambre pour deux.|Una habitación para dos.
le|el|lə|T|cmu|5|Le matin, le café au lait.|Por la mañana, el café con leche.
la|la|la|T|cmu|5|La rue est calme.|La calle está tranquila.
les|los / las|le|T|cmu|5|Les enfants dorment.|Los niños duermen.
`);

/* v9.41 · base A1-B1 + pack plus B1-C2 (niveau explicite) : dictionnaire complet
   v9.43 · CEFR 16.000 : parse paresseux avec cache (voir lang-en.ts). */
let _frDict: VocabWord[] | null = null;
export function getFRDict(): VocabWord[] {
  return (_frDict ??= dedupMerge(FR_DICT_BASE, FR_PLUS, FR_MEGA));
}
