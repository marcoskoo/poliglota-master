import type { VocabWord, WordType, WordCategory } from "../types";
import { DE_PLUS } from "./lang-de-plus";
import { DE_MEGA } from "./lang-de-mega";
import { DE_V943 } from "./lang-de-v943";
import { dedupMerge } from "./mega-parse";

/* ═══ DE Dictionary · Deutsch (Deutschland) → español (A1-B1) ═══════
   Formato de líneas: Wort|es|ipa|T|cat|freq|exDe|exEs[|p=…;n=…;ff=1]
   · T → S sustantivo · V verbo · A adjetivo · D adverbio · E expresión
         P pronombre · R preposición · C conjunción · T artículo
         N numeral · I interjección · L locución
   · cat → código temático (igual que el italiano/portugués)
   · p= plural irregular · n= nota contrastiva · ff= falso amigo DE-ES
   · Campos `.it` = alemán (lengua de estudio), `.es` = español.
   · Los funcionales puros (der/die/das, ich, nicht, ist…) viven en el
     SUPPLEMENT de lookup-de.ts, no aquí como lemmas.                 */

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

function parseDe(lines: string): VocabWord[] {
  const out: VocabWord[] = [];
  for (const raw of lines.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const f = line.split("|");
    if (f.length < 8) continue;
    const extrasRaw = f[8] ?? "";
    const extras = new Map<string, string>();
    for (const kv of extrasRaw.split(";")) {
      const i = kv.indexOf("=");
      if (i > 0) extras.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim());
    }
    const freq = (Number(f[5]) || 3) as 1 | 2 | 3 | 4 | 5;
    const level: VocabWord["level"] = freq >= 4 ? "A1" : freq === 3 ? "A2" : "B1";
    out.push({
      id: `de-${f[0].toLowerCase().replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
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

const DE_DICT_BASE: VocabWord[] = parseDe(`
Hallo|hola|haˈloː|I|sal|5|Hallo! Wie geht es dir?|¡Hola! ¿Cómo estás?
Guten Morgen|buenos días (por la mañana)|ˈɡuːtn̩ ˈmɔʁɡn̩|L|sal|5|Guten Morgen, Frau Müller!|¡Buenos días, señora Müller!
Guten Tag|buenos días (durante el día)|ˈɡuːtn̩ ˈtaːk|L|sal|5|Guten Tag! Was kann ich für Sie tun?|¡Buenos días! ¿Qué puedo hacer por usted?
Guten Abend|buenas tardes (al anochecer)|ˈɡuːtn̩ ˈaːbn̩t|L|sal|5|Guten Abend, Herr Schmidt!|¡Buenas tardes, señor Schmidt!
Gute Nacht|buenas noches (al ir a dormir)|ˈɡuːtə ˈnaxt|L|sal|5|Gute Nacht, schlaf gut!|¡Buenas noches, duerme bien!
Tschüss|chao|tʃʏs|I|sal|5|Tschüss, bis morgen!|¡Chao, hasta mañana!
Auf Wiedersehen|adiós (formal)|aʊ̯f ˈviːdɐˌzeːən|L|sal|5|Auf Wiedersehen und danke schön!|Adiós y muchas gracias.
Bis bald|hasta pronto|bɪs ˈbalt|L|sal|5|Ich muss los. Bis bald!|Me tengo que ir. ¡Hasta pronto!
Bis später|hasta luego|bɪs ˈʃpɛːtɐ|L|sal|4|Ich bin gleich zurück. Bis später!|Vuelvo enseguida. ¡Hasta luego!
Bis morgen|hasta mañana|bɪs ˈmɔʁɡn̩|L|sal|5|Gute Nacht. Bis morgen in der Schule!|Buenas noches. ¡Hasta mañana en la escuela!
Wie geht es dir?|¿cómo estás?|viː ɡeːt əs ˈdiːɐ̯|E|sal|5|Hallo Anna! Wie geht es dir?|¡Hola, Anna! ¿Cómo estás?
Wie geht es Ihnen?|¿cómo está usted?|viː ɡeːt əs ˈiːnən|E|sal|5|Guten Tag! Wie geht es Ihnen?|¡Buenos días! ¿Cómo está usted?
Mir geht es gut|estoy bien|miːɐ̯ ɡeːt əs ˈɡuːt|E|sal|5|Danke, mir geht es gut.|Gracias, estoy bien.
Freut mich|mucho gusto|fʁɔʏ̯t mɪç|L|sal|5|Ich bin Lena. Freut mich!|Soy Lena. ¡Mucho gusto!
Willkommen|bienvenido|ˈvɪlkɔmən|A|sal|5|Herzlich willkommen in Berlin!|¡Bienvenido a Berlín!
Entschuldigung|disculpe|ɛntˈʃʊldɪɡʊŋ|I|cmu|5|Entschuldigung, wo ist der Bahnhof?|Disculpe, ¿dónde está la estación?
Es tut mir leid|lo siento|ɛs tuːt miːɐ̯ ˈlaɪ̯t|E|cmu|4|Es tut mir leid, ich komme zu spät.|Lo siento, llego tarde.
Guten Appetit|buen provecho|ˈɡuːtn̩ apɛˈtiːt|L|ali|4|Setz dich, das Essen ist fertig. Guten Appetit!|Siéntate, la comida está lista. ¡Buen provecho!
Zum Wohl|salud (brindis)|tsʊm ˈvɔl|L|ali|4|Alle heben die Gläser: Zum Wohl!|Todos alzan las copas: ¡salud!
Alles Gute|¡todo lo mejor!|ˈaləs ˈɡuːtə|E|cmu|3|Alles Gute zum neuen Jahr!|¡Feliz año nuevo!
Frohe Weihnachten|feliz Navidad|ˈfʁoːə ˈvaɪ̯naxtn̩|E|ist|3|Frohe Weihnachten und einen guten Rutsch!|¡Feliz Navidad y próspero año nuevo!
Viel Glück|mucha suerte|fiːl ˈɡlʏk|E|cmu|4|Morgen ist die Prüfung. Viel Glück!|Mañana es el examen. ¡Mucha suerte!
Viel Spaß|¡que lo pases bien!|fiːl ˈʃpaːs|E|sve|4|Du fährst nach München? Viel Spaß!|¿Vas a Múnich? ¡Que lo pases bien!
der Name|el nombre|ˈnaːmə|S|cmu|5|Mein Name ist Anna Weber.|Mi nombre es Anna Weber.
heißen|llamarse|ˈhaɪ̯sn̩|V|cmu|5|Wie heißt du? Ich heiße Max.|¿Cómo te llamas? Me llamo Max.
die Sprache|el idioma|ˈʃpʁaːxə|S|cmu|4|Spanisch ist eine schöne Sprache.|El español es una lengua bonita.
Deutsch|alemán (idioma)|dɔʏ̯tʃ|S|cmu|5|Ich lerne Deutsch seit einem Jahr.|Aprendo alemán desde hace un año.;n=como adjetivo, «deutsch» = alemán: die deutsche Sprache
das Wort|la palabra|vɔʁt|S|cmu|4|Was bedeutet dieses Wort?|¿Qué significa esta palabra?;p=Wörter
die Frage|la pregunta|ˈfʁaːɡə|S|cmu|5|Hast du eine Frage?|¿Tienes alguna pregunta?
die Antwort|la respuesta|ˈantvɔʁt|S|cmu|4|Deine Antwort ist richtig.|Tu respuesta es correcta.
sagen|decir|ˈzaːɡn̩|V|cmu|5|Was sagst du dazu?|¿Qué te parece?
erzählen|contar|ɛɐ̯ˈtsɛːlən|V|cmu|3|Erzähl mir von deiner Reise!|¡Cuéntame tu viaje!
wiederholen|repetir|viːdɐˈhoːlən|V|cmu|4|Können Sie das bitte wiederholen?|¿Puede repetirlo, por favor?
verstehen|entender|fɛɐ̯ˈʃteːən|V|cmu|5|Ich verstehe dich gut.|Te entiendo bien.
kennen|conocer|ˈkɛnən|V|cmu|5|Ich kenne Lena seit der Schule.|Conozco a Lena desde la escuela.
wissen|saber|ˈvɪsn̩|V|cmu|5|Ich weiß, wo er wohnt.|Sé dónde vive.
fragen|preguntar|ˈfʁaːɡn̩|V|cmu|5|Frag doch den Lehrer!|¡Pregunta al profesor!
antworten|responder|ˈantvɔʁtn̩|V|cmu|4|Warum antwortest du nicht?|¿Por qué no respondes?
schreiben|escribir|ˈʃʁaɪ̯bn̩|V|cmu|5|Schreib mir eine Nachricht!|¡Escríbeme un mensaje!
lesen|leer|ˈleːzn̩|V|cmu|5|Ich lese gern Krimis.|Me gusta leer novela negra.
hören|oír, escuchar|ˈhøːʁən|V|cmu|5|Hörst du die Musik?|¿Oyes la música?
langsam|despacio / lento|ˈlaŋzaːm|A|cmu|5|Sprich bitte langsam!|¡Habla despacio, por favor!
laut|alto (sonido)|laʊ̯t|A|cmu|4|Die Musik ist zu laut.|La música suena demasiado alta.
leise|bajo (sonido)|ˈlaɪ̯zə|A|cmu|4|Sei bitte leise!|¡Habla bajito, por favor!
die Nummer|el número (de teléfono)|ˈnʊmɐ|S|cmu|5|Gib mir deine Nummer!|¡Dame tu número!
die Nachricht|el mensaje|ˈnaːxʁɪçt|S|cmu|4|Ich schicke dir eine Nachricht.|Te envío un mensaje.
die Familie|la familia|faˈmiːli̯ə|S|fam|5|Meine Familie wohnt in Madrid.|Mi familia vive en Madrid.
die Mutter|la madre|ˈmʊtɐ|S|fam|5|Meine Mutter kocht heute.|Mi madre cocina hoy.
der Vater|el padre|ˈfaːtɐ|S|fam|5|Mein Vater arbeitet viel.|Mi padre trabaja mucho.
die Eltern|los padres|ˈɛltɐn|S|fam|5|Meine Eltern kommen um acht.|Mis padres llegan a las ocho.
der Sohn|el hijo|zoːn|S|fam|4|Ihr Sohn heißt Jonas.|Su hijo se llama Jonas.
die Tochter|la hija|ˈtɔxtɐ|S|fam|4|Seine Tochter ist Studentin.|Su hija es estudiante.
das Kind|el niño|kɪnt|S|fam|5|Das Kind spielt im Garten.|El niño juega en el jardín.;p=Kinder
der Bruder|el hermano|ˈbʁuːdɐ|S|fam|5|Mein Bruder heißt Felix.|Mi hermano se llama Felix.
die Schwester|la hermana|ˈʃvɛstɐ|S|fam|5|Meine Schwester ist zwölf.|Mi hermana tiene doce años.
die Geschwister|los hermanos|ɡəˈʃvɪstɐ|S|fam|4|Hast du Geschwister?|¿Tienes hermanos?
die Oma|la abuela|ˈoːma|S|fam|5|Oma backt einen Kuchen.|La abuela hornea un pastel.
der Opa|el abuelo|ˈoːpa|S|fam|5|Opa erzählt Geschichten.|El abuelo cuenta historias.
die Großeltern|los abuelos|ˈɡʁoːsˌɛltɐn|S|fam|4|Meine Großeltern wohnen am See.|Mis abuelos viven junto al lago.
der Onkel|el tío|ˈɔŋkl̩|S|fam|4|Mein Onkel wohnt in Wien.|Mi tío vive en Viena.
die Tante|la tía|ˈtantə|S|fam|4|Die Tante kommt am Sonntag.|La tía viene el domingo.
der Cousin|el primo|kuˈzɛŋ|S|fam|3|Mein Cousin besucht uns.|Mi primo nos visita.
der Mann|el hombre / el marido|man|S|fam|5|Der Mann dort ist mein Onkel.|El hombre de allí es mi tío.
die Frau|la mujer / la esposa|fʁaʊ|S|fam|5|Die Frau da ist meine Lehrerin.|La mujer de allí es mi profesora.
das Mädchen|la niña|ˈmɛːtçən|S|fam|5|Das Mädchen malt ein Bild.|La niña dibuja un cuadro.
heiraten|casarse|ˈhaɪ̯ʁaːtn̩|V|fam|3|Sie heiraten im Juni.|Se casan en junio.
verheiratet|casado|fɛɐ̯ˈhaɪ̯ʁaːtət|A|fam|3|Bist du verheiratet?|¿Estás casado?
das Baby|el bebé|ˈbeːbi|S|fam|4|Das Baby schläft gerade.|El bebé está durmiendo.
die Verwandten|los parientes|fɛɐ̯ˈvantn̩|S|fam|3|Wir besuchen die Verwandten.|Visitamos a los parientes.
das Haus|la casa|haʊ̯s|S|cas|5|Unser Haus hat einen Garten.|Nuestra casa tiene jardín.;p=Häuser
die Wohnung|el piso|ˈvɔʁnʊŋ|S|cas|5|Die Wohnung ist hell und groß.|El piso es luminoso y grande.
das Zimmer|la habitación|ˈtsɪmɐ|S|cas|5|Mein Zimmer ist klein.|Mi habitación es pequeña.
die Küche|la cocina|ˈkʏçə|S|cas|5|Mama ist in der Küche.|Mamá está en la cocina.
das Bad|el cuarto de baño|baːt|S|cas|5|Wo ist das Bad, bitte?|¿Dónde está el baño, por favor?;p=Bäder
das Schlafzimmer|el dormitorio|ˈʃlaːfˌtsɪmɐ|S|cas|4|Das Schlafzimmer ist oben.|El dormitorio está arriba.
das Wohnzimmer|el salón|ˈvoːnˌtsɪmɐ|S|cas|4|Im Wohnzimmer steht ein Sofa.|En el salón hay un sofá.
der Garten|el jardín|ˈɡaʁtn̩|S|cas|4|Der Garten ist schön grün.|El jardín está muy verde.;p=Gärten
der Balkon|el balcón|balˈkɔŋ|S|cas|3|Wir frühstücken auf dem Balkon.|Desayunamos en el balcón.
der Tisch|la mesa|tɪʃ|S|cas|5|Das Buch liegt auf dem Tisch.|El libro está sobre la mesa.
der Stuhl|la silla|ʃtuːl|S|cas|5|Nimm bitte den Stuhl dort.|Toma, por favor, la silla de allí.
das Bett|la cama|bɛt|S|cas|5|Das Bett ist sehr bequem.|La cama es muy cómoda.
das Sofa|el sofá|ˈzoːfa|S|cas|4|Die Katze schläft auf dem Sofa.|El gato duerme en el sofá.
der Schrank|el armario|ʃʁaŋk|S|cas|4|Häng die Jacke in den Schrank.|Cuelga la chaqueta en el armario.
das Regal|la estantería|reˈɡaːl|S|cas|4|Die Bücher stehen im Regal.|Los libros están en la estantería.
die Lampe|la lámpara|ˈlampə|S|cas|4|Die Lampe ist zu dunkel.|La lámpara da poca luz.
der Spiegel|el espejo|ˈʃpiːɡl̩|S|cas|4|Der Spiegel hängt im Flur.|El espejo cuelga en el pasillo.
der Teppich|la alfombra|ˈtɛpɪç|S|cas|3|Der Teppich ist neu.|La alfombra es nueva.
die Decke|la manta|ˈdɛkə|S|cas|3|Nimm eine Decke, es ist kalt.|Toma una manta, que hace frío.
die Waschmaschine|la lavadora|ˈvaʃmaʃiːnə|S|cas|3|Die Waschmaschine ist kaputt.|La lavadora está estropeada.
der Kühlschrank|el frigorífico|ˈkyːlʃʁaŋk|S|cas|4|Die Milch ist im Kühlschrank.|La leche está en el frigorífico.
die Dusche|la ducha|ˈduːʃə|S|cas|4|Ich nehme eine schnelle Dusche.|Me doy una ducha rápida.
die Toilette|el váter|toalˈɛtə|S|cas|4|Darf ich die Toilette benutzen?|¿Puedo usar el baño?
der Schlüssel|la llave|ˈʃlʏsl̩|S|cas|5|Ich habe meinen Schlüssel verloren.|He perdido la llave.
die Tür|la puerta|tyːɐ̯|S|cas|5|Die Tür ist offen.|La puerta está abierta.
das Fenster|la ventana|ˈfɛnstɐ|S|cas|5|Öffne bitte das Fenster!|¡Abre la ventana, por favor!
die Wand|la pared|vant|S|cas|4|An der Wand hängt ein Bild.|En la pared cuelga un cuadro.
die Treppe|la escalera|ˈtʁɛpə|S|cas|4|Die Treppe führt nach oben.|La escalera sube al piso de arriba.
das Dach|el tejado|dax|S|cas|3|Das Dach ist rot.|El tejado es rojo.;p=Dächer
wohnen|vivir (residir)|ˈvoːnən|V|cas|5|Ich wohne in Köln.|Vivo en Colonia.
aufstehen|levantarse|ˈaʊ̯fˌʃteːən|V|cas|5|Ich stehe um sieben auf.|Me levanto a las siete.
duschen|ducharse|ˈduːʃən|V|cas|5|Ich dusche schnell und gehe.|Me ducho rápido y me voy.
putzen|limpiar|ˈpʊtsn̩|V|cas|4|Ich putze das Bad.|Limpio el baño.
aufräumen|recoger (ordenar)|ˈaʊ̯fˌʁaʊ̯mən|V|cas|3|Räum bitte dein Zimmer auf!|¡Recoge tu habitación, por favor!
das Essen|la comida|ˈɛsn̩|S|ali|5|Das Essen ist schon fertig.|La comida ya está lista.
essen|comer|ˈɛsn̩|V|ali|5|Wir essen um acht Uhr.|Comemos a las ocho.
trinken|beber|ˈtʁɪŋkn̩|V|ali|5|Was möchtest du trinken?|¿Qué quieres beber?
das Frühstück|el desayuno|ˈfʁyːʃtʏk|S|ali|5|Zum Frühstück trinke ich Kaffee.|Para desayunar bebo café.
das Abendessen|la cena|ˈaːbn̩tˌɛsn̩|S|ali|4|Nach dem Abendessen sehen wir fern.|Después de la cena vemos la tele.
das Brot|el pan|bʁoːt|S|ali|5|Ich kaufe Brot beim Bäcker.|Compro pan en la panadería.
das Brötchen|el bollo|ˈbʁøːtçən|S|ali|5|Ich esse ein Brötchen mit Käse.|Como un bollo con queso.
die Butter|la mantequilla|ˈbʊtɐ|S|ali|5|Brot mit Butter und Käse.|Pan con mantequilla y queso.
der Käse|el queso|ˈkɛːzə|S|ali|5|Ich möchte ein Käsebrötchen.|Quiero un bollo de queso.
die Wurst|el embutido|vʊʁst|S|ali|5|Ein Brot mit Wurst, bitte.|Un bocadillo de embutido, por favor.;p=Würste
das Ei|el huevo|aɪ̯|S|ali|5|Ich frühstücke zwei Eier.|Desayuno dos huevos.;p=Eier
die Milch|la leche|mɪlç|S|ali|5|Trinkst du Milch oder Saft?|¿Bebes leche o zumo?
der Kaffee|el café|kaˈfeː|S|ali|5|Ein Kaffee, bitte!|¡Un café, por favor!
der Tee|el té|teː|S|ali|5|Ich trinke Tee am Nachmittag.|Bebo té por la tarde.
das Wasser|el agua|ˈvasɐ|S|ali|5|Ein Glas Wasser, bitte.|Un vaso de agua, por favor.
der Saft|el zumo|zaft|S|ali|4|Ein Glas Apfelsaft zum Frühstück.|Un vaso de zumo de manzana para desayunar.;p=Säfte
das Bier|la cerveza|biːɐ̯|S|ali|5|Ein Bier, bitte!|¡Una cerveza, por favor!
der Wein|el vino|vaɪ̯n|S|ali|4|Ein Glas roter Wein.|Una copa de vino tinto.
der Zucker|el azúcar|ˈtsʊkɐ|S|ali|4|Nimmst du Zucker in den Kaffee?|¿Pones azúcar en el café?
das Salz|la sal|zalts|S|ali|4|Das Essen braucht mehr Salz.|La comida necesita más sal.
das Öl|el aceite|øːl|S|ali|4|Olivenöl für den Salat.|Aceite de oliva para la ensalada.
der Reis|el arroz|ʁaɪ̯s|S|ali|4|Reis mit Gemüse.|Arroz con verdura.
die Nudeln|la pasta|ˈnuːdl̩n|S|ali|5|Spaghetti sind meine Lieblingsnudeln.|Los espaguetis son mi pasta favorita.
die Kartoffel|la patata|kaʁˈtɔfl̩|S|ali|5|Pell die Kartoffeln, bitte.|Pela las patatas, por favor.
die Suppe|la sopa|ˈzʊpə|S|ali|4|Die Suppe schmeckt gut.|La sopa está buena.
der Salat|la ensalada|zaˈlaːt|S|ali|4|Ein grüner Salat dazu.|Una ensalada verde de acompañamiento.
das Gemüse|la verdura|ɡəˈmyːzə|S|ali|4|Iss mehr Gemüse!|¡Come más verdura!
das Obst|la fruta|oːpst|S|ali|4|Obst ist gesund.|La fruta es sana.
der Apfel|la manzana|ˈapfl̩|S|ali|5|Ein Apfel am Tag.|Una manzana al día.;p=Äpfel
die Banane|el plátano|baˈnaːnə|S|ali|5|Die Banane ist noch grün.|El plátano está aún verde.
die Tomate|el tomate|toˈmaːtə|S|ali|5|Tomaten für den Salat.|Tomates para la ensalada.
die Zwiebel|la cebolla|ˈtsviːbl̩|S|ali|4|Schneide die Zwiebeln klein.|Pica la cebolla.
das Fleisch|la carne|flaɪ̯ʃ|S|ali|4|Ich esse kein Fleisch.|No como carne.
das Hähnchen|el pollo|ˈhɛnçən|S|ali|4|Ein gegrilltes Hähnchen.|Un pollo asado.
der Fisch|el pescado|fɪʃ|S|ali|4|Fisch oder Fleisch?|¿Pescado o carne?
der Kuchen|el pastel|ˈkuːxn̩|S|ali|4|Oma backt einen Kuchen.|La abuela hornea un pastel.
das Eis|el helado / el hielo|aɪ̯s|S|ali|4|Zwei Kugeln Eis, bitte.|Dos bolas de helado, por favor.;n=«das Eis» significa también el hielo
die Schokolade|el chocolate|ʃokoˈlaːdə|S|ali|5|Schokolade macht glücklich.|El chocolate alegra el ánimo.
die Brezel|el pretzel|ˈbʁeːtsl̩|S|ali|3|Eine warme Brezel vom Bäcker.|Un pretzel caliente de la panadería.
das Schnitzel|el escalope|ˈʃnɪtsl̩|S|ali|3|Ein Schweineschnitzel mit Pommes.|Un escalope de cerdo con patatas fritas.
die Bratwurst|la salchicha a la plancha|ˈbʁaːtvʊʁst|S|ali|3|Zwei Bratwürste mit Senf.|Dos salchichas con mostaza.
das Sauerkraut|el chucrut|ˈzaʊ̯ɐ̯kʁaʊ̯t|S|ali|2|Sauerkraut ist typisch deutsch.|El chucrut es típico alemán.
der Döner|el döner (kebab)|ˈdøːnɐ|S|ali|3|Ein Döner mit allem, bitte.|Un döner con todo, por favor.
lecker|rico|ˈlɛkɐ|A|ali|5|Das Essen ist wirklich lecker.|La comida está realmente rica.
kochen|cocinar|ˈkɔxn̩|V|ali|5|Ich koche heute für alle.|Hoy cocino para todos.
schmecken|saber (tener sabor)|ˈʃmɛkn̩|V|ali|4|Wie schmeckt die Suppe?|¿Qué tal está la sopa?
der Hunger|el hambre|ˈhʊŋɐ|S|ali|4|Ich habe Hunger.|Tengo hambre.
der Durst|la sed|dʊʁst|S|ali|4|Nach dem Sport habe ich Durst.|Después del deporte tengo sed.
hungrig|hambriento|ˈhʊŋʁɪç|A|ali|4|Die Kinder sind hungrig.|Los niños tienen hambre.
durstig|sediento|ˈdʊʁstɪç|A|ali|4|Ich bin so durstig!|¡Qué sed tengo!
frisch|fresco|fʁɪʃ|A|ali|4|Das Brot ist noch frisch.|El pan está fresco.
das Restaurant|el restaurante|ʁɛstoˈʁã|S|ris|4|Das Restaurant ist klein, aber gut.|El restaurante es pequeño, pero bueno.
die Speisekarte|la carta|ˈʃpaɪ̯zəˌkaʁtə|S|ris|4|Die Speisekarte, bitte.|La carta, por favor.
der Kellner|el camarero|ˈkɛlnɐ|S|ris|4|Der Kellner kommt gleich.|El camarero viene enseguida.
bestellen|pedir|bəˈʃtɛlən|V|ris|4|Ich bestelle eine Pizza.|Pido una pizza.
bezahlen|pagar|bəˈtsaːlən|V|ris|5|Möchten Sie bezahlen?|¿Desea pagar?
die Rechnung|la cuenta|ˈʁɛçnʊŋ|S|ris|4|Die Rechnung, bitte!|¡La cuenta, por favor!
die Gabel|el tenedor|ˈɡaːbl̩|S|ris|5|Leg die Gabel neben den Teller.|Deja el tenedor junto al plato.
der Teller|el plato|ˈtɛlɐ|S|ris|5|Ein sauberer Teller.|Un plato limpio.
das Glas|el vaso|ɡlaːs|S|ris|5|Ein Glas Wasser, bitte.|Un vaso de agua, por favor.;p=Gläser
die Tasse|la taza|ˈtasə|S|ris|5|Eine Tasse Kaffee.|Una taza de café.
kaufen|comprar|ˈkaʊ̯fən|V|cmp|5|Ich kaufe Brot und Milch.|Compro pan y leche.
einkaufen|hacer la compra|ˈaɪ̯nˌkaʊ̯fən|V|cmp|4|Samstags gehe ich einkaufen.|Los sábados voy de compras.
der Laden|la tienda|ˈlaːdn̩|S|cmp|4|Der Laden öffnet um neun.|La tienda abre a las nueve.
der Supermarkt|el supermercado|ˈzuːpɐˌmaʁkt|S|cmp|5|Im Supermarkt ist alles teuer.|En el supermercado todo es caro.
der Preis|el precio|pʁaɪ̯s|S|cmp|5|Der Preis ist zu hoch.|El precio es demasiado alto.
kosten|costar|ˈkɔstn̩|V|cmp|5|Wie viel kostet das?|¿Cuánto cuesta?
billig|barato|ˈbɪlɪç|A|cmp|5|Die Schuhe sind sehr billig.|Los zapatos son muy baratos.
teuer|caro|ˈtɔʏ̯ɐ|A|cmp|5|Das Auto ist zu teuer.|El coche es demasiado caro.
die Kasse|la caja|ˈkasə|S|cmp|4|Bitte zahlen Sie an der Kasse.|Pague en caja, por favor.
der Verkäufer|el vendedor|fɛɐ̯ˈkɔʏ̯fɐ|S|cmp|4|Der Verkäufer ist sehr freundlich.|El vendedor es muy amable.
das Geld|el dinero|ɡɛlt|S|cmp|5|Ich habe kein Geld dabei.|No llevo dinero encima.
der Euro|el euro|ˈɔʏ̯ʁo|S|cmp|5|Das kostet zehn Euro.|Eso cuesta diez euros.
bar|en efectivo|baːɐ̯|A|cmp|4|Zahlen Sie bar oder mit Karte?|¿Paga en efectivo o con tarjeta?
die Größe|la talla / el tamaño|ˈɡʁøːsə|S|cmp|4|Welche Größe brauchen Sie?|¿Qué talla necesita?
anprobieren|probarse (ropa)|ˈanpʁoˌbiːʁən|V|cmp|4|Kann ich das anprobieren?|¿Puedo probármelo?
der Markt|el mercado|maʁkt|S|cmp|4|Auf dem Markt gibt es frisches Obst.|En el mercado hay fruta fresca.
die Stadt|la ciudad|ʃtat|S|cit|5|Berlin ist eine große Stadt.|Berlín es una ciudad grande.;p=Städte
das Dorf|el pueblo|dɔʁf|S|cit|4|Meine Oma wohnt im Dorf.|Mi abuela vive en el pueblo.
die Straße|la calle|ˈʃtʁaːsə|S|cit|5|Die Straße ist sehr belebt.|La calle está muy animada.
der Platz|la plaza|plats|S|cit|4|Wir treffen uns am Platz.|Nos vemos en la plaza.
die Kirche|la iglesia|ˈkɪʁçə|S|cit|4|Die Kirche ist sehr alt.|La iglesia es muy antigua.
der Bahnhof|la estación de tren|ˈbaːnhoːf|S|cit|5|Wie komme ich zum Bahnhof?|¿Cómo llego a la estación?
der Flughafen|el aeropuerto|ˈfluːkhaːfn̩|S|cit|4|Der Flughafen ist weit weg.|El aeropuerto está lejos.
der Park|el parque|paʁk|S|cit|5|Die Kinder spielen im Park.|Los niños juegan en el parque.
das Museum|el museo|muˈzeːʊm|S|cit|4|Das Museum öffnet um zehn.|El museo abre a las diez.
das Kino|el cine|ˈkiːno|S|cit|5|Am Freitag gehen wir ins Kino.|El viernes vamos al cine.
die Bibliothek|la biblioteca|biblioˈteːk|S|cit|4|In der Bibliothek ist es ruhig.|En la biblioteca se está tranquilo.
die Schule|la escuela|ˈʃuːlə|S|cit|5|Die Schule beginnt um acht.|La escuela empieza a las ocho.
die Universität|la universidad|univɛʁziˈtɛːt|S|cit|4|Sie studiert an der Universität.|Estudia en la universidad.
das Krankenhaus|el hospital|ˈkʁaŋkn̩ˌhaʊ̯s|S|cit|4|Das Krankenhaus ist neu.|El hospital es nuevo.
die Apotheke|la farmacia|apoˈteːkə|S|cit|4|Die Apotheke hat bis acht offen.|La farmacia abre hasta las ocho.
die Bank|el banco|baŋk|S|cit|4|Ich gehe kurz zur Bank.|Voy un momento al banco.;n=también «die Bank» = el banco para sentarse
die Post|la oficina de correos|pɔst|S|cit|4|Die Post schließt um sechs.|Correos cierra a las seis.
die Polizei|la policía|pɔliˈtsaɪ̯|S|cit|4|Ruf die Polizei!|¡Llama a la policía!
das Schwimmbad|la piscina|ˈʃvɪmbaːt|S|cit|4|Das Schwimmbad ist im Sommer offen.|La piscina abre en verano.
das Café|la cafetería|kaˈfeː|S|cit|5|Trinken wir einen Kaffee im Café?|¿Tomamos un café en la cafetería?
die Bäckerei|la panadería|ˈbɛkəˌʁaɪ̯|S|cit|5|Die Bäckerei verkauft frische Brötchen.|La panadería vende bollos recién hechos.
das Zentrum|el centro|ˈtsɛntʁʊm|S|cit|4|Wir wohnen im Zentrum.|Vivimos en el centro.
die Altstadt|el casco antiguo|ˈaltˌʃtat|S|cit|3|Die Altstadt ist wunderschön.|El casco antiguo es precioso.
die Brücke|el puente|ˈbʁʏkə|S|cit|4|Über die Brücke und dann links.|Cruza el puente y luego a la izquierda.
die Ecke|la esquina|ˈɛkə|S|cit|4|Um die Ecke ist eine Bäckerei.|A la vuelta de la esquina hay una panadería.
die Ampel|el semáforo|ˈampl̩|S|cit|3|Warte an der Ampel!|¡Espera en el semáforo!
das Auto|el coche|ˈaʊ̯to|S|tra|5|Mein Auto ist rot.|Mi coche es rojo.
der Bus|el autobús|bʊs|S|tra|5|Der Bus kommt in fünf Minuten.|El autobús llega en cinco minutos.
der Zug|el tren|tsuːk|S|tra|5|Der Zug hat zehn Minuten Verspätung.|El tren llega con diez minutos de retraso.
die Straßenbahn|el tranvía|ˈʃtʁaːsn̩ˌbaːn|S|tra|4|Nimm die Straßenbahn Linie 3.|Toma el tranvía línea 3.
die U-Bahn|el metro|ˈuːbaːn|S|tra|4|Die U-Bahn fährt alle fünf Minuten.|El metro pasa cada cinco minutos.
das Fahrrad|la bicicleta|ˈfaːɐ̯tsiːk|S|tra|4|Ich fahre mit dem Fahrrad zur Arbeit.|Voy en bici al trabajo.
das Taxi|el taxi|ˈtaksi|S|tra|4|Rufen wir ein Taxi!|¡Llamemos un taxi!
das Flugzeug|el avión|ˈfluːkˌtsoɪ̯k|S|tra|4|Das Flugzeug landet um zehn.|El avión aterriza a las diez.
fahren|ir en vehículo / conducir|ˈfaːʁən|V|tra|5|Ich fahre mit dem Bus zur Arbeit.|Voy en autobús al trabajo.
einsteigen|subir (al transporte)|ˈaɪ̯nˌʃtaɪ̯ɡn̩|V|tra|4|Steigen Sie hier ein?|¿Sube usted aquí?
aussteigen|bajar (del transporte)|ˈaʊ̯sˌʃtaɪ̯ɡn̩|V|tra|4|Ich steige an der nächsten Station aus.|Me bajo en la próxima parada.
umsteigen|hacer transbordo|ˈʊmˌʃtaɪ̯ɡn̩|V|tra|3|Sie müssen am Hauptbahnhof umsteigen.|Tiene que hacer transbordo en la estación central.
abfahren|salir (transporte)|ˈapˌfaːʁən|V|tra|4|Der Zug fährt um Punkt acht ab.|El tren sale a las ocho en punto.
ankommen|llegar|ˈanˌkɔmən|V|tra|4|Wann kommt der Bus an?|¿Cuándo llega el autobús?
der Bahnsteig|el andén|ˈbaːnˌʃtaɪ̯k|S|tra|3|Der Zug steht auf Bahnsteig 7.|El tren está en el andén 7.
die Fahrkarte|el billete|ˈfaːɐ̯ˌkaʁtə|S|tra|5|Eine Fahrkarte nach Bonn, bitte.|Un billete para Bonn, por favor.
der Fahrplan|el horario|ˈfaːɐ̯ˌplaːn|S|tra|3|Schau im Fahrplan nach!|¡Consulta el horario!
die Verspätung|el retraso|fɛɐ̯ˈʃpɛːtʊŋ|S|tra|4|Der Zug hat Verspätung.|El tren va con retraso.
der Parkplatz|el aparcamiento|ˈpaʁkˌplats|S|tra|4|Der Parkplatz ist voll.|El aparcamiento está lleno.
der Stau|el atasco|ʃtaʊ̯|S|tra|3|Auf der Autobahn ist Stau.|En la autopista hay un atasco.
zu Fuß|a pie|tsuː ˈfuːs|L|tra|4|Ich gehe zu Fuß zur Arbeit.|Voy al trabajo a pie.
die Reise|el viaje|ˈʁaɪ̯zə|S|vig|4|Die Reise nach Wien war toll.|El viaje a Viena fue estupendo.
reisen|viajar|ˈʁaɪ̯zn̩|V|vig|4|Wir reisen gern mit dem Zug.|Nos gusta viajar en tren.
der Urlaub|las vacaciones (viaje)|ˈuːɐ̯laʊ̯p|S|vig|4|Ich habe zwei Wochen Urlaub.|Tengo dos semanas de vacaciones.
die Ferien|las vacaciones|ˈfeːʁi̯ən|S|vig|4|In den Ferien fahre ich ans Meer.|En las vacaciones voy al mar.
das Hotel|el hotel|hoˈtɛl|S|vig|4|Das Hotel liegt direkt am Strand.|El hotel está justo en la playa.
der Koffer|la maleta|ˈkɔfɐ|S|vig|4|Mein Koffer ist zu schwer.|Mi maleta pesa demasiado.
der Rucksack|la mochila|ˈʁʊkzak|S|vig|4|Nimm den Rucksack mit!|¡Llévate la mochila!
der Pass|el pasaporte|pas|S|vig|4|Zeigen Sie bitte Ihren Pass.|Muestre su pasaporte, por favor.
buchen|reservar|ˈbuːxn̩|V|vig|3|Ich buche das Hotel online.|Reservo el hotel por internet.
der Ausflug|la excursión|ˈaʊ̯sflʊk|S|vig|3|Wir machen einen Ausflug in die Berge.|Hacemos una excursión a la montaña.
wandern|hacer senderismo|ˈvandɐn|V|vig|3|Am Wochenende wandern wir gern.|Los fines de semana nos gusta ir de senderismo.
die Sehenswürdigkeit|el monumento|ˈzeːənsˌvʏʁdɪçkaɪ̯t|S|vig|3|Berlin hat viele Sehenswürdigkeiten.|Berlín tiene muchos monumentos.
die Zeit|el tiempo|tsaɪ̯t|S|tmp|5|Ich habe keine Zeit.|No tengo tiempo.
die Uhr|el reloj / la hora|uːɐ̯|S|tmp|5|Wie viel Uhr ist es?|¿Qué hora es?
die Stunde|la hora (duración)|ˈʃtʊndə|S|tmp|5|Ich warte schon eine Stunde.|Llevo una hora esperando.
die Minute|el minuto|ˈmɪnuːtə|S|tmp|5|Nur noch fünf Minuten!|¡Solo quedan cinco minutos!
der Tag|el día|taːk|S|tmp|5|Heute ist ein schöner Tag.|Hoy es un día bonito.
die Woche|la semana|ˈvɔxə|S|tmp|5|Nächste Woche habe ich Urlaub.|La semana que viene tengo vacaciones.
der Monat|el mes|ˈmoːnat|S|tmp|5|Nächsten Monat fahre ich nach Spanien.|El mes que viene voy a España.
das Jahr|el año|jaːɐ̯|S|tmp|5|Ich bin seit einem Jahr hier.|Llevo un año aquí.
der Morgen|la mañana|ˈmɔʁɡn̩|S|tmp|5|Am Morgen trinke ich Kaffee.|Por la mañana bebo café.;n=en minúscula y sin artículo, «morgen» = mañana (el día siguiente)
der Nachmittag|la tarde|ˈnaxˌmɪtaːk|S|tmp|5|Am Nachmittag arbeite ich.|Por la tarde trabajo.
der Abend|la noche (atardecer)|ˈaːbn̩t|S|tmp|5|Am Abend sehe ich fern.|Por la noche veo la tele.
die Nacht|la noche|naxt|S|tmp|5|In der Nacht schlafe ich gut.|De noche duermo bien.
heute|hoy|ˈhɔʏ̯tə|D|tmp|5|Heute bleibe ich zu Hause.|Hoy me quedo en casa.
gestern|ayer|ˈɡɛstɐn|D|tmp|5|Gestern war ich im Kino.|Ayer fui al cine.
das Wochenende|el fin de semana|ˈvɔxənˌɛndə|S|tmp|5|Am Wochenende schlafe ich lange.|El fin de semana duermo hasta tarde.
der Geburtstag|el cumpleaños|ˈɡeːbʊʁtsˌtaːk|S|tmp|4|Morgen habe ich Geburtstag.|Mañana cumplo años.
der Termin|la cita|tɛʁˈmiːn|S|tmp|4|Ich habe einen Termin beim Zahnarzt.|Tengo cita con el dentista.
früh|temprano|fʁyː|A|tmp|5|Ich stehe früh auf.|Me levanto temprano.
spät|tarde (hora)|ʃpɛːt|A|tmp|5|Es ist schon spät.|Ya es tarde.
jetzt|ahora|jɛtst|D|tmp|5|Jetzt habe ich Hunger.|Ahora tengo hambre.
wann|cuándo|van|D|tmp|5|Wann kommst du endlich?|¿Cuándo vienes de una vez?
oft|a menudo|ɔft|D|tmp|5|Ich gehe oft schwimmen.|Voy a menudo a nadar.
manchmal|a veces|ˈmançmaːl|D|tmp|5|Manchmal regnet es im Sommer.|A veces llueve en verano.
selten|rara vez|ˈzɛltn̩|D|tmp|4|Er ist selten zu Hause.|Rara vez está en casa.
nie|nunca|niː|D|tmp|4|Ich rauche nie.|Yo no fumo nunca.
die Arbeit|el trabajo|ˈaʁbaɪ̯t|S|lav|5|Die Arbeit macht mir Spaß.|El trabajo me divierte.
arbeiten|trabajar|ˈaʁbaɪ̯tn̩|V|lav|5|Ich arbeite in einem Büro.|Trabajo en una oficina.
das Büro|la oficina|byˈʁoː|S|lav|5|Das Büro ist im dritten Stock.|La oficina está en el tercer piso.
der Kollege|el compañero de trabajo|kɔˈlɛːɡə|S|lav|4|Mein Kollege hilft mir immer.|Mi compañero siempre me ayuda.
die Kollegin|la compañera de trabajo|kɔˈlɛːɡɪn|S|lav|4|Meine Kollegin ist krank.|Mi compañera está enferma.
die Sitzung|la reunión|ˈzɪtsʊŋ|S|lav|3|Die Sitzung beginnt um neun.|La reunión empieza a las nueve.
das Gehalt|el sueldo|ɡəˈhalt|S|lav|3|Das Gehalt kommt am Monatsende.|El sueldo llega a fin de mes.
die Stelle|el puesto de trabajo|ˈʃtɛlə|S|lav|3|Sie sucht eine Stelle als Lehrerin.|Busca un puesto de profesora.
die Bewerbung|la solicitud de empleo|bəˈvɛʁbʊŋ|S|lav|3|Ich schicke morgen meine Bewerbung.|Mañana envío mi solicitud.
das Vorstellungsgespräch|la entrevista de trabajo|ˈfoːɐ̯ʃtɛlʊŋsɡəˌʃpʁɛːç|S|lav|2|Morgen habe ich ein Vorstellungsgespräch.|Mañana tengo una entrevista de trabajo.
die Pause|el descanso|ˈpaʊ̯zə|S|lav|5|Machen wir eine Pause!|¡Hagamos un descanso!
der Feierabend|el fin de la jornada|ˈfaɪ̯ɐˌʔaːbn̩t|S|lav|3|Um fünf ist Feierabend!|¡A las cinco se acaba la jornada!
das Projekt|el proyecto|pʁoˈjɛkt|S|lav|3|Das Projekt dauert ein Jahr.|El proyecto dura un año.
die Aufgabe|la tarea|ˈaʊ̯fɡaːbə|S|lav|3|Diese Aufgabe ist schwer.|Esta tarea es difícil.
der Chef|el jefe|ʃɛf|S|lav|4|Mein Chef ist sehr nett.|Mi jefe es muy majo.;ff=1;n=«der Chef» = el jefe; el «chef» de cocina alemán es der Koch
die Firma|la empresa|ˈfɪʁma|S|lav|4|Die Firma hat 50 Mitarbeiter.|La empresa tiene 50 empleados.;ff=1;n=«die Firma» = la empresa; la firma (autógrafo) es die Unterschrift
der Lehrer|el profesor|ˈleːʁɐ|S|pro|5|Der Lehrer spricht langsam und klar.|El profesor habla despacio y claro.
die Lehrerin|la profesora|ˈleːʁɪn|S|pro|5|Meine Lehrerin kommt aus Spanien.|Mi profesora es de España.
der Arzt|el médico|aʁtst|S|pro|5|Der Arzt verschreibt ein Medikament.|El médico receta un medicamento.;p=Ärzte
die Ärztin|la médica|ˈɛʁtsɪn|S|pro|4|Die Ärztin ist sehr geduldig.|La médica es muy paciente.
die Krankenschwester|la enfermera|ˈkʁaŋkn̩ˌʃvɛstɐ|S|pro|4|Die Krankenschwester arbeitet nachts.|La enfermera trabaja de noche.
der Ingenieur|el ingeniero|ɪŋeniˈøːɐ̯|S|pro|3|Er ist Ingenieur bei Siemens.|Es ingeniero en Siemens.
der Koch|el cocinero|kɔx|S|pro|4|Der Koch kocht ausgezeichnet.|El cocinero cocina de maravilla.
der Bäcker|el panadero|ˈbɛkɐ|S|pro|4|Der Bäcker öffnet um sechs.|El panadero abre a las seis.
der Polizist|el policía|poliˈtsɪst|S|pro|4|Der Polizist hilft der alten Dame.|El policía ayuda a la anciana.
der Student|el estudiante universitario|ˈʃtʊdnt|S|pro|5|Der Student wohnt in Köln.|El estudiante vive en Colonia.
der Schüler|el alumno|ˈʃyːlɐ|S|pro|4|Die Schüler machen Hausaufgaben.|Los alumnos hacen los deberes.
die Sekretärin|la secretaria|zɛkʁeˈtɛːʁɪn|S|pro|3|Die Sekretärin nimmt den Anruf an.|La secretaria atiende la llamada.
der Apotheker|el farmacéutico|apoˈteːkɐ|S|pro|3|Der Apotheker empfiehlt einen Tee.|El farmacéutico recomienda un té.
die Verkäuferin|la vendedora|fɛɐ̯ˈkɔʏ̯fɐɪn|S|pro|4|Die Verkäuferin ist sehr freundlich.|La vendedora es muy amable.
der Landwirt|el agricultor|lantviːɐ̯t|S|pro|2|Der Landwirt hat Kühe und Schafe.|El agricultor tiene vacas y ovejas.
die Gesundheit|la salud|ɡəˈzʊnthaɪ̯t|S|sla|4|Gesundheit ist wichtiger als Geld.|La salud es más importante que el dinero.
gesund|sano|ɡəˈzʊnt|A|sla|5|Ich fühle mich gesund.|Me siento sano.
krank|enfermo|kʁaŋk|A|sla|5|Das Kind ist krank.|El niño está enfermo.
der Schmerz|el dolor|ʃmɛʁts|S|sla|3|Ich habe Schmerzen im Rücken.|Me duele la espalda.
die Kopfschmerzen|el dolor de cabeza|ˈkɔpfʃmɛʁtsn̩|S|sla|4|Ich habe starke Kopfschmerzen.|Tengo un dolor de cabeza fuerte.
die Bauchschmerzen|el dolor de tripa|ˈbaʊ̯xʃmɛʁtsn̩|S|sla|4|Nach dem Essen habe ich Bauchschmerzen.|Después de comer me duele la tripa.
das Fieber|la fiebre|ˈfiːbɐ|S|sla|4|Das Kind hat hohes Fieber.|El niño tiene mucha fiebre.
der Husten|la tos|ˈhʊstn̩|S|sla|4|Ich habe Husten und Schnupfen.|Tengo tos y mocos.
die Erkältung|el resfriado|ɛɐ̯ˈkɛltʊŋ|S|sla|4|Ich habe eine Erkältung.|Estoy resfriado.
die Grippe|la gripe|ˈɡʁɪpə|S|sla|4|Die Grippe dauert eine Woche.|La gripe dura una semana.
das Medikament|el medicamento|mediˈkamɛnt|S|sla|4|Nimm das Medikament dreimal täglich.|Toma el medicamento tres veces al día.
die Tablette|la pastilla|tabˈlɛtə|S|sla|4|Eine Tablette gegen den Schmerz.|Una pastilla contra el dolor.
das Rezept|la receta médica|ʁeˈtsɛpt|S|sla|4|Der Arzt schreibt ein Rezept.|El médico extiende una receta.
der Notfall|la emergencia|ˈnoːtfal|S|sla|3|Im Notfall ruf die 112 an!|¡En caso de emergencia llama al 112!
der Unfall|el accidente|ˈʊnfal|S|sla|3|Es gab einen kleinen Unfall.|Hubo un pequeño accidente.
der Krankenwagen|la ambulancia|ˈkʁaŋkn̩ˌvaːɡn̩|S|sla|3|Der Krankenwagen kommt sofort.|La ambulancia llega de inmediato.
das Blut|la sangre|bluːt|S|sla|4|Der Arzt nimmt eine Blutprobe.|El médico toma una muestra de sangre.
der Zahnarzt|el dentista|ˈtsaːnˌaʁtst|S|sla|4|Ich habe Angst vor dem Zahnarzt.|Tengo miedo al dentista.
das Gift|el veneno|ɡɪft|S|sla|3|Gift ist gefährlich!|¡El veneno es peligroso!;ff=1;n=«das Gift» = el veneno; el regalo es das Geschenk (trampa del inglés gift)
der Körper|el cuerpo|ˈkœʁpɐ|S|cor|4|Sport ist gut für den Körper.|El deporte es bueno para el cuerpo.
der Kopf|la cabeza|kɔpf|S|cor|5|Mein Kopf tut weh.|Me duele la cabeza.
das Haar|el pelo|haːɐ̯|S|cor|5|Sie hat lange Haare.|Ella tiene el pelo largo.
das Auge|el ojo|ˈaʊ̯ɡə|S|cor|5|Ihre Augen sind braun.|Sus ojos son marrones.
das Ohr|la oreja|oːɐ̯|S|cor|5|Der Kopfhörer sitzt auf dem Ohr.|El auricular se pone en la oreja.
die Nase|la nariz|ˈnaːzə|S|cor|5|Die Nase ist rot vor Kälte.|La nariz está roja de frío.
der Mund|la boca|mʊnt|S|cor|5|Öffne bitte den Mund!|¡Abre la boca, por favor!
der Zahn|el diente|tsaːn|S|cor|5|Putz dir die Zähne!|¡Lávate los dientes!;p=Zähne
der Hals|el cuello / la garganta|hals|S|cor|4|Ich habe Halsschmerzen.|Me duele la garganta.
die Schulter|el hombro|ˈʃʊltɐ|S|cor|4|Die Tasche hängt auf der Schulter.|El bolso cuelga del hombro.
der Arm|el brazo|aʁm|S|cor|5|Der Arm ist gebrochen.|Tiene el brazo roto.
die Hand|la mano|hant|S|cor|5|Gib mir die Hand!|¡Dame la mano!;p=Hände
der Finger|el dedo de la mano|ˈfɪŋɐ|S|cor|5|Der Ring passt an keinen Finger.|El anillo no cabe en ningún dedo.
der Bauch|la tripa|baʊ̯x|S|cor|4|Der Bauch tut weh.|Le duele la tripa.
der Rücken|la espalda|ˈʁʏkn̩|S|cor|4|Mein Rücken schmerzt.|Me duele la espalda.
das Bein|la pierna|baɪ̯n|S|cor|5|Das Bein ist eingeschlafen.|La pierna se ha dormido.
das Knie|la rodilla|kniː|S|cor|4|Das Knie ist geschwollen.|La rodilla está hinchada.
der Fuß|el pie|fuːs|S|cor|5|Der Schuh drückt am Fuß.|El zapato aprieta el pie.;p=Füße
das Herz|el corazón|hɛʁts|S|cor|4|Mein Herz schlägt schnell.|El corazón me late rápido.
das Gesicht|la cara|ɡəˈzɪçt|S|cor|5|Sie wäscht sich das Gesicht.|Ella se lava la cara.
rot|rojo|roːt|A|col|5|Das Auto ist rot.|El coche es rojo.
blau|azul|blaʊ̯|A|col|5|Der Himmel ist blau.|El cielo es azul.
grün|verde|ɡʁyːn|A|col|5|Die Wiese ist grün.|La pradera es verde.
gelb|amarillo|ɡɛlp|A|col|5|Die Sonne ist gelb.|El sol es amarillo.
schwarz|negro|ʃvaʁts|A|col|5|Der Kater ist schwarz.|El gato es negro.
weiß|blanco|vaɪ̯s|A|col|5|Die Wand ist weiß.|La pared es blanca.
braun|marrón|bʁaʊ̯n|A|col|5|Sie hat braune Haare.|Ella tiene el pelo castaño.
grau|gris|ɡʁaʊ̯|A|col|5|Der Himmel ist heute grau.|Hoy el cielo está gris.
orange|naranja (color)|oˈʁanʒə|A|col|4|Die Tasche ist orange.|El bolso es naranja.
rosa|rosa|ˈʁoːza|A|col|4|Die Blume ist rosa.|La flor es rosa.
lila|lila|ˈliːla|A|col|4|Der Pullover ist lila.|El jersey es lila.
dunkel|oscuro|ˈdʊŋkl̩|A|col|4|Draußen wird es dunkel.|Fuera anochece.
hell|claro (luz / color)|hɛl|A|col|4|Das Zimmer ist hell.|La habitación es luminosa.
die Kleidung|la ropa|ˈklaɪ̯dʊŋ|S|rop|4|Ich brauche neue Kleidung.|Necesito ropa nueva.
das Hemd|la camisa|hɛmt|S|rop|5|Das weiße Hemd ist neu.|La camisa blanca es nueva.
die Bluse|la blusa|ˈbluːzə|S|rop|4|Sie trägt eine rote Bluse.|Lleva una blusa roja.
die Hose|los pantalones|ˈhoːzə|S|rop|5|Die Hose ist zu eng.|Los pantalones quedan estrechos.
der Rock|la falda|ʁɔk|S|rop|4|Sie trägt einen langen Rock.|Lleva una falda larga.
das Kleid|el vestido|klaɪ̯t|S|rop|4|Ein schönes Kleid für die Party.|Un vestido bonito para la fiesta.
die Jacke|la chaqueta|ˈjakə|S|rop|5|Nimm die Jacke mit!|¡Llévate la chaqueta!
der Mantel|el abrigo|ˈmantl̩|S|rop|4|Im Winter trage ich einen Mantel.|En invierno llevo abrigo.
der Pullover|el jersey|pʊˈlɔvɐ|S|rop|5|Der Pullover ist zu warm.|El jersey da demasiado calor.
die Jeans|los vaqueros|dʒiːns|S|rop|5|Die Jeans passen perfekt.|Los vaqueros me quedan perfectos.
der Schuh|el zapato|ʃuː|S|rop|5|Der Schuh drückt.|El zapato aprieta.;p=Schuhe
die Socke|el calcetín|ˈzɔkə|S|rop|5|Ein Paar Socken kostet drei Euro.|Un par de calcetines cuesta tres euros.
die Mütze|el gorro|ˈmʏtsə|S|rop|4|Die Mütze mit Bommel.|El gorro con pompón.
der Hut|el sombrero|huːt|S|rop|4|Ein Hut gegen die Sonne.|Un sombrero para el sol.
der Schal|la bufanda|ʃaːl|S|rop|4|Der Schal hält warm.|La bufanda abriga.
der Handschuh|el guante|ˈhantʃuː|S|rop|4|Ein Handschuh ist verschwunden.|Ha desaparecido un guante.
der Anzug|el traje|ˈantsuːk|S|rop|3|Er trägt einen schwarzen Anzug.|Lleva un traje negro.
die Krawatte|la corbata|kʁaˈvatə|S|rop|3|Die Krawatte passt zum Hemd.|La corbata combina con la camisa.
die Tasche|el bolso|ˈtaʃə|S|rop|5|Die Tasche ist zu schwer.|El bolso pesa demasiado.
anziehen|ponerse (ropa)|ˈantsiːən|V|rop|4|Zieh dich warm an!|¡Abrígate!
passen|quedar bien|ˈpasn̩|V|rop|4|Die Hose passt gut.|Los pantalones me quedan bien.
tragen|llevar (puesto)|ˈtʁaːɡn̩|V|rop|4|Sie trägt ein rotes Kleid.|Lleva un vestido rojo.
das Wetter|el tiempo (clima)|ˈvɛtɐ|S|cli|5|Wie ist das Wetter heute?|¿Qué tiempo hace hoy?
die Sonne|el sol|ˈzɔnə|S|cli|5|Die Sonne scheint heute.|Hoy brilla el sol.
die Wolke|la nube|ˈvɔlkə|S|cli|5|Am Himmel gibt es viele Wolken.|En el cielo hay muchas nubes.
der Regen|la lluvia|ˈreːɡn̩|S|cli|5|Der Regen hört nicht auf.|La lluvia no cesa.
der Schnee|la nieve|ʃneː|S|cli|5|Der Schnee liegt einen Meter hoch.|Hay un metro de nieve.
der Wind|el viento|vɪnt|S|cli|5|Der Wind ist heute stark.|Hoy sopla fuerte el viento.
warm|caluroso (clima)|vaʁm|A|cli|5|Heute ist es warm.|Hoy hace calor.
kalt|frío|kalt|A|cli|5|Im Winter ist es kalt.|En invierno hace frío.
heiß|muy caliente|haɪ̯s|A|cli|5|Der Tee ist zu heiß.|El té está demasiado caliente.
der Sommer|el verano|ˈzɔmɐ|S|cli|5|Im Sommer fahren wir ans Meer.|En verano vamos al mar.
der Winter|el invierno|ˈvɪntɐ|S|cli|5|Im Winter schneit es oft.|En invierno nieva a menudo.
der Frühling|la primavera|ˈfʁyːlɪŋ|S|cli|4|Im Frühling blühen die Blumen.|En primavera florecen las flores.
der Herbst|el otoño|hɛʁpst|S|cli|4|Im Herbst fallen die Blätter.|En otoño caen las hojas.
der Regenschirm|el paraguas|ˈʁeːɡn̩ʃɪʁm|S|cli|3|Nimm den Regenschirm mit!|¡Llévate el paraguas!
der Himmel|el cielo|ˈhɪml̩|S|nat|5|Der Himmel ist wolkenlos.|El cielo está despejado.
der Baum|el árbol|baʊ̯m|S|nat|5|Der Baum ist hundert Jahre alt.|El árbol tiene cien años.;p=Bäume
der Wald|el bosque|valt|S|nat|4|Wir spazieren durch den Wald.|Paseamos por el bosque.
die Blume|la flor|ˈbluːmə|S|nat|5|Die Blume duftet schön.|La flor huele bien.
das Blatt|la hoja|blat|S|nat|4|Das Blatt ist grün.|La hoja es verde.;p=Blätter
der Fluss|el río|flʊs|S|nat|4|Der Rhein ist ein langer Fluss.|El Rin es un río largo.;p=Flüsse
der See|el lago|zeː|S|nat|4|Am See ist es schön.|Junto al lago se está bien.;n=«die See» (femenino) = el mar
der Berg|la montaña|bɛʁk|S|nat|4|Die Alpen sind hohe Berge.|Los Alpes son montañas altas.;p=Berge
der Strand|la playa|ʃtʁant|S|nat|4|Wir liegen den ganzen Tag am Strand.|Pasamos el día entero en la playa.
das Meer|el mar|meːɐ̯|S|nat|4|Das Meer ist heute ruhig.|Hoy el mar está en calma.
die Luft|el aire|lʊft|S|nat|4|Die frische Luft tut gut.|El aire fresco sienta bien.
das Land|el país / el campo|lant|S|nat|5|Spanien ist ein schönes Land.|España es un país bonito.;n=«auf dem Land» = en el campo (fuera de la ciudad)
das Tier|el animal|tiːɐ̯|S|ani|5|Das Tier schläft tief.|El animal duerme profundamente.
der Hund|el perro|hʊnt|S|ani|5|Der Hund bellt laut.|El perro ladra fuerte.
die Katze|el gato|ˈkatsə|S|ani|5|Die Katze trinkt Milch.|El gato bebe leche.
die Maus|el ratón|maʊ̯s|S|ani|5|Die Katze jagt die Maus.|El gato persigue al ratón.;p=Mäuse
der Vogel|el pájaro|ˈfoːɡl̩|S|ani|5|Der Vogel singt am Morgen.|El pájaro canta por la mañana.
die Kuh|la vaca|kuː|S|ani|4|Die Kuh gibt Milch.|La vaca da leche.;p=Kühe
das Schwein|el cerdo|ʃvaɪ̯n|S|ani|4|Das Schwein ist rosa.|El cerdo es rosa.
das Huhn|la gallina|huːn|S|ani|4|Das Huhn legt ein Ei.|La gallina pone un huevo.
die Ente|el pato|ˈɛntə|S|ani|4|Die Enten schwimmen im See.|Los patos nadan en el lago.
der Zoo|el zoo|tsoː|S|ani|4|Im Zoo gibt es Löwen und Elefanten.|En el zoo hay leones y elefantes.
die Liebe|el amor|ˈliːbə|S|emo|4|Die Liebe ist wichtig im Leben.|El amor es importante en la vida.
die Angst|el miedo|aŋst|S|emo|5|Ich habe Angst vor großen Hunden.|Tengo miedo a los perros grandes.
die Freude|la alegría|ˈfʁɔʏ̯də|S|emo|4|Die Freude ist groß.|La alegría es enorme.
das Glück|la suerte / la felicidad|ɡlʏk|S|emo|4|Ich wünsche dir viel Glück!|¡Te deseo mucha suerte!;ff=1;n=«Glück» cubre suerte y felicidad: Glück haben = tener suerte, glücklich sein = ser feliz
glücklich|feliz|ˈɡlʏklɪç|A|emo|4|Sie ist glücklich in Berlin.|Ella es feliz en Berlín.
traurig|triste|ˈtʁaʊ̯ʁɪç|A|emo|4|Der Film hat mich traurig gemacht.|La película me ha entristecido.
müde|cansado|ˈmyːdə|A|emo|5|Nach der Arbeit bin ich müde.|Después del trabajo estoy cansado.
ruhig|tranquilo|ˈʁuːɪç|A|emo|4|Bleib ruhig und atme tief.|Tranquilízate y respira hondo.
lieben|querer (a alguien)|ˈliːbn̩|V|emo|4|Ich liebe dich.|Te quiero.
mögen|gustar|ˈmoːɡn̩|V|emo|5|Ich mag Kaffee ohne Zucker.|Me gusta el café sin azúcar.
lachen|reír|ˈlaxn̩|V|emo|5|Der Film ist lustig, wir lachen viel.|La película es divertida y nos reímos mucho.
weinen|llorar|ˈvaɪ̯nən|V|emo|4|Das Baby weint wieder.|El bebé llora otra vez.
sich freuen|alegrarse / estar deseando|zɪç ˈfʁɔʏ̯ən|V|emo|4|Ich freue mich auf den Urlaub.|Estoy deseando que lleguen las vacaciones.
der Sport|el deporte|ʃpɔʁt|S|spt|5|Sport macht gesund und glücklich.|El deporte da salud y alegría.
der Fußball|el fútbol|ˈfuːsbal|S|spt|5|Wir spielen jeden Samstag Fußball.|Jugamos al fútbol cada sábado.
spielen|jugar|ʃpiːlən|V|spt|5|Die Kinder spielen im Park.|Los niños juegan en el parque.
die Mannschaft|el equipo|ˈmanʃaft|S|spt|4|Die Mannschaft gewinnt 2:1.|El equipo gana 2 a 1.
schwimmen|nadar|ˈʃvɪmən|V|spt|5|Ich schwimme gern im See.|Me gusta nadar en el lago.
laufen|correr|ˈlaʊ̯fən|V|spt|4|Ich laufe jeden Morgen eine Stunde.|Corro una hora cada mañana.
das Tor|la portería / el gol|toːɐ̯|S|spt|4|Tor! Zwei zu null!|¡Gol! ¡Dos a cero!
die Freizeit|el tiempo libre|ˈfʁaɪ̯tsaɪ̯t|S|sve|4|In meiner Freizeit lese ich.|En mi tiempo libre leo.
das Hobby|el pasatiempo|ˈhɔbi|S|sve|5|Mein Hobby ist Fotografieren.|Mi pasatiempo es la fotografía.
das Buch|el libro|buːx|S|let|5|Das Buch ist sehr spannend.|El libro es apasionante.
die Zeitung|el periódico|ˈtsaɪ̯tʊŋ|S|sve|4|Ich lese die Zeitung am Morgen.|Leo el periódico por la mañana.
die Party|la fiesta|ˈpaʁti|S|sve|4|Am Samstag gibt es eine Party.|El sábado hay una fiesta.
tanzen|bailar|ˈtantsn̩|V|sve|5|Sie tanzt sehr gut.|Ella baila muy bien.
ausgehen|salir (de fiesta)|ˈaʊ̯sˌɡeːən|V|sve|3|Am Freitag gehen wir aus.|El viernes salimos de fiesta.
treffen|quedar (con alguien)|ˈtʁɛfn̩|V|sve|5|Ich treffe mich um acht mit Anna.|Quedo con Anna a las ocho.
das Fest|la fiesta (celebración)|fɛst|S|sve|3|Das Oktoberfest ist ein großes Fest.|El Oktoberfest es una gran fiesta.
die Musik|la música|ˈmuːzɪk|S|mus|5|Ich höre gern Musik.|Me gusta escuchar música.
das Lied|la canción|liːt|S|mus|4|Dieses Lied kenne ich gut.|Esta canción me la sé bien.;p=Lieder
singen|cantar|ˈzɪŋən|V|mus|5|Wir singen zusammen.|Cantamos juntos.
die Gitarre|la guitarra|ɡiˈtaʁə|S|mus|4|Ich lerne Gitarre spielen.|Aprendo a tocar la guitarra.
der Film|la película|fɪlm|S|cin|5|Der Film beginnt um acht.|La película empieza a las ocho.
der Fernseher|el televisor|ˈfɛʁnˌzeːɐ̯|S|cin|5|Der Fernseher ist neu.|El televisor es nuevo.
fernsehen|ver la televisión|fɛʁnˈzeːən|V|cin|4|Abends sehen wir fern.|Por las noches vemos la tele.
die Serie|la serie|ˈzeːʁi̯ə|S|cin|3|Ich schaue eine Serie auf Netflix.|Veo una serie en Netflix.
das Handy|el móvil|ˈhɛndi|S|tec|5|Mein Handy ist leer.|Mi móvil está sin batería.
anrufen|llamar por teléfono|ˈanˌʁuːfən|V|tec|5|Ich rufe dich heute Abend an.|Te llamo esta noche.
die E-Mail|el correo electrónico|ˈiːmeːl|S|tec|5|Ich schicke dir gleich eine E-Mail.|Te envío un correo enseguida.
der Computer|el ordenador|kɔmˈpjuːtɐ|S|tec|5|Ich arbeite jeden Tag am Computer.|Trabajo cada día con el ordenador.
das Internet|internet|ˈɪntɐnɛt|S|tec|5|Ohne Internet ist alles langsamer.|Sin internet todo va más lento.
das Konto|la cuenta bancaria|ˈkɔnto|S|fin|3|Ich überprüfe mein Konto online.|Reviso mi cuenta bancaria online.
der Geldautomat|el cajero automático|ˈɡɛltˌaʊ̯tomat|S|fin|3|Wo ist der nächste Geldautomat?|¿Dónde está el cajero más cercano?
kostenlos|gratis|ˈkɔstn̩loːs|A|fin|4|Der Eintritt ist kostenlos.|La entrada es gratis.
das Wechselgeld|el cambio (dinero)|ˈvɛksl̩ˌɡɛlt|S|fin|3|Behalten Sie das Wechselgeld.|Quédese el cambio.
der Freund|el amigo|fʁɔʏ̯nt|S|rel|5|Mein bester Freund heißt Tim.|Mi mejor amigo se llama Tim.
die Freundin|la amiga / la novia|ˈfʁɔʏ̯ndɪn|S|rel|5|Meine Freundin kommt aus Peru.|Mi novia es de Perú.
der Nachbar|el vecino|ˈnaːbaχ|S|rel|4|Der Nachbar hilft uns oft.|El vecino nos ayuda a menudo.
der Gast|el invitado|ɡast|S|rel|3|Wir haben Gäste zum Essen.|Tenemos invitados a comer.
der Besuch|la visita|bəˈzuːx|S|rel|3|Der Besuch kommt um sieben.|La visita llega a las siete.
besuchen|visitar|bəˈzuːxn̩|V|rel|4|Wir besuchen das neue Museum.|Visitamos el museo nuevo.
allein|solo|aˈlaɪ̯n|A|rel|4|Ich wohne allein.|Vivo solo.
zusammen|juntos|tsuˈzamən|A|rel|5|Wir gehen zusammen ins Kino.|Vamos juntos al cine.
einladen|invitar|ˈaɪ̯nˌlaːdn̩|V|rel|3|Ich lade dich zum Essen ein.|Te invito a comer.
der Unterricht|la clase (lección)|ˈʊntɐˌʁɪçt|S|stu|4|Der Unterricht beginnt um neun.|La clase empieza a las nueve.
die Klasse|la clase (grupo)|ˈklasə|S|stu|4|Meine Klasse hat 20 Schüler.|Mi clase tiene 20 alumnos.
die Prüfung|el examen|ˈpʁyːfʊŋ|S|stu|4|Die Prüfung ist schwierig.|El examen es difícil.
die Hausaufgabe|los deberes|ˈhaʊ̯sˌaʊ̯fɡaːbə|S|stu|4|Mach zuerst deine Hausaufgaben!|¡Haz primero los deberes!
lernen|aprender / estudiar|ˈlɛʁnən|V|stu|5|Ich lerne jeden Tag Deutsch.|Aprendo alemán cada día.
die Note|la nota (calificación)|ˈnoːtə|S|stu|3|Ich habe eine gute Note bekommen.|He sacado una buena nota.
studieren|estudiar (una carrera)|ʃtuˈdiːʁən|V|stu|4|Sie studiert Medizin in Bonn.|Estudia medicina en Bonn.
das Gymnasium|el instituto de enseñanza media|ɡʏmˈnaːzi̯ʊm|S|stu|3|Mein Sohn geht aufs Gymnasium.|Mi hijo va al instituto.;ff=1;n=«das Gymnasium» = el instituto alemán; el gimnasio deportivo es die Turnhalle
der Kindergarten|la guardería|ˈkɪndɐɡaʁtn̩|S|stu|3|Die Kleine geht in den Kindergarten.|La pequeña va a la guardería.
der Roman|la novela|ʁoˈmaːn|S|let|3|Ich lese gerade einen spannenden Roman.|Estoy leyendo una novela apasionante.;ff=1;n=«der Roman» = la novela; «romano» (de Roma) es der Römer
die Geschichte|la historia / el cuento|ɡəˈʃɪçtə|S|let|4|Erzähl mir eine Geschichte!|¡Cuéntame un cuento!
die Kunst|el arte|kʊnst|S|art|3|Ich interessiere mich für Kunst.|Me interesa el arte.
der Künstler|el artista|ˈkʏnstlɐ|S|art|3|Der Künstler malt ein Bild.|El artista pinta un cuadro.
das Bild|el cuadro / la imagen|bɪlt|S|art|4|An der Wand hängt ein schönes Bild.|En la pared cuelga un cuadro bonito.
Deutschland|Alemania|ˈdɔʏ̯tʃlant|S|ist|4|Deutschland liegt in der Mitte Europas.|Alemania está en el centro de Europa.
die Regierung|el gobierno|ʁeˈɡiːʁʊŋ|S|ist|2|Die Regierung sitzt in Berlin.|El gobierno reside en Berlín.
der Weihnachtsmarkt|el mercado de Navidad|ˈvaɪ̯naxtsˌmaʁkt|S|ist|3|Der Weihnachtsmarkt öffnet im November.|El mercado de Navidad abre en noviembre.
die Autobahn|la autopista|ˈaʊ̯tobaːn|S|tra|3|Auf vielen Autobahnen gibt es kein Tempolimit.|En muchas autopistas no hay límite de velocidad.
vielleicht|quizás|fiˈlaɪ̯çt|D|cnn|5|Kommst du mit? — Vielleicht.|¿Vienes? — Quizás.
natürlich|por supuesto|naˈtyːʁlɪç|D|cnn|5|Möchtest du Kaffee? — Natürlich!|¿Quieres café? — ¡Por supuesto!
wirklich|de verdad|ˈvɪʁklɪç|D|cnn|5|Ist das wirklich wahr?|¿De verdad es verdad?
leider|por desgracia|ˈlaɪ̯dɐ|D|cnn|5|Leider habe ich heute keine Zeit.|Por desgracia hoy no tengo tiempo.
hoffentlich|ojalá|ˈhɔfn̩tlɪç|D|cnn|4|Hoffentlich regnet es nicht.|Ojalá no llueva.
zuerst|primero|tsuˈeːɐ̯st|D|cnn|4|Zuerst frühstücken wir in Ruhe.|Primero desayunamos tranquilos.
dann|después / luego|dan|D|cnn|5|Dann gehen wir zusammen einkaufen.|Luego vamos juntos de compras.
deshalb|por eso|ˈdɛshalp|D|cnn|4|Es regnet, deshalb bleiben wir zu Hause.|Llueve, por eso nos quedamos en casa.
gehen|ir (a pie)|ˈɡeːən|V|ast|5|Ich gehe zur Arbeit.|Voy al trabajo a pie.
kommen|venir|ˈkɔmən|V|ast|5|Komm bitte hierher!|¡Ven aquí, por favor!
machen|hacer|ˈmaxn̩|V|ast|5|Was machst du gerade?|¿Qué estás haciendo?
sehen|ver|ˈzeːən|V|ast|5|Ich sehe das Meer von hier.|Veo el mar desde aquí.
geben|dar|ˈɡeːbn̩|V|ast|5|Gib mir bitte das Buch!|¡Dame el libro, por favor!
nehmen|tomar|ˈneːmən|V|ast|5|Nimm den Bus 5.|Toma el autobús 5.
finden|encontrar|ˈfɪndn̩|V|ast|5|Ich finde den Schlüssel nicht.|No encuentro la llave.
bleiben|quedarse|ˈblaɪ̯bn̩|V|ast|5|Heute bleibe ich zu Hause.|Hoy me quedo en casa.
beginnen|empezar|bəˈɡɪnən|V|ast|4|Der Film beginnt um acht.|La película empieza a las ocho.
aufhören|dejar de (hacer algo)|ˈaʊ̯fˌhøːʁən|V|ast|4|Hör bitte auf zu rauchen!|¡Deja de fumar, por favor!
das Leben|la vida|ˈleːbn̩|S|ast|5|Das Leben ist schön.|La vida es bella.
leben|vivir|ˈleːbn̩|V|ast|5|Meine Oma lebt noch.|Mi abuela sigue viva.
schlafen|dormir|ˈʃlaːfn̩|V|ast|5|Das Baby schläft endlich.|El bebé por fin duerme.
warten|esperar|ˈvaʁtn̩|V|ast|5|Warte bitte hier auf mich!|¡Espérame aquí, por favor!
suchen|buscar|ˈzuːxən|V|ast|5|Ich suche meine Brille.|Busco mis gafas.
brauchen|necesitar|ˈbʁaʊ̯xən|V|ast|5|Ich brauche deine Hilfe.|Necesito tu ayuda.
helfen|ayudar|ˈhɛlfn̩|V|ast|5|Ich helfe meiner Mutter beim Kochen.|Ayudo a mi madre a cocinar.
denken|pensar|ˈdɛŋkn̩|V|ast|5|Ich denke oft an dich.|Pienso a menudo en ti.
glauben|creer|ˈɡlaʊ̯bn̩|V|ast|5|Ich glaube dir.|Te creo.
vergessen|olvidar|fɛɐ̯ˈɡɛsn̩|V|ast|4|Ich vergesse den Termin.|Se me olvida la cita.
gefallen|gustar (agradar)|ɡəˈfalən|V|ast|4|Das Kleid gefällt mir.|El vestido me gusta.
möchten|quisiera (forma de cortesía)|ˈmœçtn̩|V|cmu|5|Ich möchte einen Kaffee, bitte.|Quisiera un café, por favor.
können|poder|ˈkœnən|V|cmu|5|Kannst du mir helfen?|¿Puedes ayudarme?
müssen|tener que / deber|ˈmʏsn̩|V|cmu|5|Ich muss morgen früh aufstehen.|Mañana tengo que levantarme temprano.
wollen|querer|ˈvɔlən|V|cmu|5|Ich will Kaffee trinken.|Quiero beber café.
sollen|deber (según otros)|ˈzɔlən|V|cmu|4|Ich soll mehr Sport machen.|Dicen que debería hacer más deporte.
dürfen|poder (tener permiso)|ˈdʏʁfən|V|cmu|4|Darf ich hereinkommen?|¿Puedo pasar?
bekommen|recibir|bəˈkɔmən|V|ast|5|Ich bekomme morgen ein Paket.|Mañana recibo un paquete.;ff=1;n=«bekommen» = recibir; «llegar a ser» es werden — trampa del inglés become
groß|grande|ɡʁoːs|A|ast|5|Berlin ist eine große Stadt.|Berlín es una ciudad grande.
klein|pequeño|klaɪ̯n|A|ast|5|Das Zimmer ist klein.|La habitación es pequeña.
gut|bueno|ɡuːt|A|ast|5|Das Essen ist sehr gut.|La comida es muy buena.
schlecht|malo|ʃlɛçt|A|ast|5|Das Wetter ist schlecht.|El tiempo es malo.
neu|nuevo|nɔʏ̯|A|ast|5|Mein Handy ist neu.|Mi móvil es nuevo.
alt|viejo|alt|A|ast|5|Das Haus ist alt.|La casa es vieja.
jung|joven|jʊŋ|A|ast|5|Meine Schwester ist noch jung.|Mi hermana es todavía joven.
schön|bonito|ʃøːn|A|ast|5|Heute ist ein schöner Tag.|Hoy es un día bonito.
interessant|interesante|ɪntəʁɛˈsant|A|ast|4|Der Film ist interessant.|La película es interesante.
langweilig|aburrido|ˈlaŋvaɪ̯lɪç|A|ast|4|Der Vortrag ist langweilig.|La charla es aburrida.
wichtig|importante|ˈvɪçtɪç|A|ast|4|Gesundheit ist wichtiger als Geld.|La salud es más importante que el dinero.
leicht|fácil / ligero|laɪ̯çt|A|ast|4|Die Prüfung ist leicht.|El examen es fácil.
schwer|difícil / pesado|ʃveːɐ̯|A|ast|4|Die Aufgabe ist schwer.|La tarea es difícil.
schnell|rápido|ʃnɛl|A|ast|5|Der Zug ist sehr schnell.|El tren es muy rápido.
richtig|correcto|ˈʁɪçtɪç|A|ast|4|Deine Antwort ist richtig.|Tu respuesta es correcta.
falsch|incorrecto|falʃ|A|ast|4|Das Wort ist falsch.|La palabra es incorrecta.
voll|lleno|fɔl|A|ast|4|Der Bus ist voll.|El autobús va lleno.
leer|vacío|ˈleːɐ̯|A|ast|4|Das Glas ist leer.|El vaso está vacío.
frei|libre / desocupado|fʁaɪ̯|A|ast|4|Morgen habe ich frei.|Mañana tengo libre.
gefährlich|peligroso|ɡəˈfɛːɐ̯lɪç|A|ast|3|Die Straße ist gefährlich.|La calle es peligrosa.
nett|simpático|nɛt|A|ast|5|Meine Nachbarin ist nett.|Mi vecina es simpática.
lustig|divertido|ˈlʊstɪç|A|ast|4|Der Film ist lustig.|La película es divertida.
lang|largo|laŋ|A|ast|4|Der Film ist lang.|La película es larga.
kurz|corto|kʊʁts|A|ast|4|Der Weg ist kurz.|El camino es corto.
fertig|acabado / listo|ˈfɛʁtɪç|A|ast|4|Das Essen ist fertig.|La comida está lista.
kaputt|estropeado|kaˈpʊt|A|ast|4|Mein Handy ist kaputt.|Mi móvil está estropeado.
die Sache|la cosa (asunto)|ˈzaxə|S|ast|4|Das ist eine gute Sache.|Es un buen asunto.
der Ort|el lugar|ɔʁt|S|ast|4|Dieser Ort ist wunderschön.|Este lugar es precioso.
der Grund|el motivo|ɡʁʊnt|S|ast|4|Aus welchem Grund kommst du spät?|¿Por qué motivo llegas tarde?
das Beispiel|el ejemplo|bɪˈʃpiːl|S|ast|4|Zum Beispiel: Apfel und Banane.|Por ejemplo: manzana y plátano.
das Problem|el problema|pʁoˈbleːm|S|ast|5|Wir haben ein kleines Problem.|Tenemos un pequeño problema.
die Idee|la idea|iˈdeː|S|ast|4|Ich habe eine Idee!|¡Tengo una idea!
die Welt|el mundo|vɛlt|S|ast|5|Die Welt ist groß und schön.|El mundo es grande y bonito.
das Ende|el final|ˈɛndə|S|ast|4|Das Ende des Films ist traurig.|El final de la película es triste.
der Anfang|el comienzo|ˈanfaŋ|S|ast|4|Am Anfang ist es schwer.|Al principio cuesta.
der Teil|la parte|taɪ̯l|S|ast|4|Der beste Teil kommt noch.|La mejor parte aún llega.
die Art|el tipo / la manera|aʁt|S|ast|4|Was für eine Art Musik hörst du gern?|¿Qué tipo de música te gusta?;ff=1;n=«die Art» = el tipo, la manera; «arte» es die Kunst
fast|casi|fast|D|ast|5|Es ist fast acht Uhr.|Casi son las ocho.;ff=1;n=«fast» = casi; «rápido» es schnell — trampa del inglés fast
brav|bueno (obediente)|bʁaːf|A|ast|3|Das Kind ist ganz brav.|El niño se porta muy bien.;ff=1;n=«brav» = bueno y obediente; «bravo» (valiente) es mutig
der Rat|el consejo|ʁaːt|S|ast|3|Ich brauche deinen Rat.|Necesito tu consejo.;ff=1;n=«der Rat» = el consejo; «la rata» es die Ratte
die Not|la penuria|noːt|S|ast|2|Die Familie lebt in großer Not.|La familia vive en gran penuria.;ff=1;n=«die Not» = la penuria, la necesidad; «la nota» es die Note
spenden|donar|ˈʃpɛndn̩|V|fin|3|Er spendet regelmäßig für die Tafel.|Dona periódicamente para el banco de alimentos.;ff=1;n=«spenden» = donar; «gastar» es ausgeben — trampa del inglés to spend
die Rente|la pensión de jubilación|ˈʁɛntə|S|fin|2|Mit 67 geht er in Rente.|A los 67 años se jubila.;ff=1;n=«die Rente» = la pensión de jubilación; la renta (ingresos) es das Einkommen
`);
/* v9.41 · Basis A1-B1 + Plus-Pack B1-C2 (Stufe explizit): vollständiges Wörterbuch
   v9.43 · CEFR 16.000: fauler Parse mit Cache (siehe lang-en.ts). */
let _deDict: VocabWord[] | null = null;
export function getDEDict(): VocabWord[] {
  return (_deDict ??= dedupMerge(DE_DICT_BASE, DE_PLUS, DE_MEGA, DE_V943));
}
