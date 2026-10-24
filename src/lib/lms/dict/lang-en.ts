import type { VocabWord, WordType, WordCategory } from "../types";
import { EN_PLUS } from "./lang-en-plus";
import { EN_MEGA } from "./lang-en-mega";
import { dedupMerge } from "./mega-parse";

/* ═══ EN Dictionary · inglés americano → español (A1-A2) ══════════════
   Formato de líneas: word|es|ipa|T|cat|freq|exEn|exEs[|p=plural;n=note;ff=1]
   · T → S sustantivo · V verbo · A adjetivo · D adverbio · E expresión
         P pronombre · R preposición · C conjunción · T artículo
         N numeral · I interjección · L locución
   · cat → código temático (igual que el italiano)
   · p= plural irregular · n= nota contrastiva · ff= falso amigo EN-ES
   · Campos `.it` = inglés (lengua de estudio), `.es` = español.     */

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

function parseEn(lines: string): VocabWord[] {
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
      id: `en-${f[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
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

const EN_DICT_BASE: VocabWord[] = parseEn(`
hi|hola|haɪ|I|sal|5|Hi! I'm Alex.|¡Hola! Soy Alex.
hello|hola|həˈloʊ|I|sal|5|Hello! How are you?|¡Hola! ¿Cómo estás?
goodbye|adiós|ˌɡʊdˈbaɪ|I|sal|5|Goodbye, see you tomorrow!|Adiós, ¡hasta mañana!
bye|chau|baɪ|I|sal|5|Bye! Have a nice day.|¡Chau! Que tengas un buen día.
good morning|buenos días|ɡʊd ˈmɔːrnɪŋ|L|sal|5|Good morning, class!|¡Buenos días, clase!
good night|buenas noches|ɡʊd naɪt|L|sal|5|Good night, mom.|Buenas noches, mamá.
please|por favor|pliːz|D|cmu|5|Two coffees, please.|Dos cafés, por favor.
thanks|gracias|θæŋks|N|cmu|5|Thanks for your help.|Gracias por tu ayuda.
thank you|gracias (formal)|ˈθæŋk juː|L|cmu|5|Thank you very much!|¡Muchísimas gracias!
you're welcome|de nada|jʊr ˈwɛlkəm|L|cmu|4|You're welcome!|¡De nada!
excuse me|disculpe|ɪkˈskjuːz miː|L|cmu|5|Excuse me, where's the library?|Disculpe, ¿dónde está la biblioteca?
sorry|perdón|ˈsɑːri|A|cmu|5|Sorry, I'm late.|Perdón, llego tarde.
nice to meet you|encantado de conocerte|naɪs tə miːt juː|L|sal|5|Hi, I'm Emma — nice to meet you!|Hola, soy Emma — ¡encantada!
how's it going|¿qué tal?|haʊz ɪt ˈɡoʊɪŋ|E|sal|5|How's it going? — Great!|¿Qué tal? — ¡Genial!
how are you|¿cómo estás?|haʊ ɑːr juː|E|sal|5|How are you today?|¿Cómo estás hoy?
welcome|bienvenido|ˈwɛlkəm|A|sal|4|Welcome to Austin!|¡Bienvenido a Austin!
name|nombre|neɪm|S|cmu|5|My name is Alejandro.|Me llamo Alejandro.
what's your name|¿cómo te llamas?|wɑts jʊr neɪm|E|cmu|5|What's your name?|¿Cómo te llamas?
friend|amigo|frɛnd|S|rel|5|This is my friend Jake.|Este es mi amigo Jake.
everybody|todo el mundo|ˈɛvriˌbɑːdi|P|rel|4|Everybody calls me Alex.|Todos me dicen Alex.
everyone|todos|ˈɛvriwʌn|P|rel|4|Everyone is here.|Todos están aquí.
stranger|desconocido|ˈstreɪndʒər|S|rel|3|Strangers are friends here.|Aquí los desconocidos son amigos.
student|estudiante|ˈstuːdənt|S|stu|5|I'm a student at the university.|Soy estudiante en la universidad.
teacher|profesor|ˈtiːtʃər|S|stu|5|Our teacher is American.|Nuestra profesora es estadounidense.
class|clase|klæs|S|stu|5|Classes start at 8.|Las clases empiezan a las 8.
school|escuela|skuːl|S|stu|5|The school is near my house.|La escuela está cerca de mi casa.
university|universidad|ˌjuːnəˈvɜːrsəti|S|stu|4|The university is big.|La universidad es grande.
library|biblioteca|ˈlaɪbrɛri|S|stu|5|I study at the library.|Estudio en la biblioteca.
book|libro|bʊk|S|stu|5|I read a book on the train.|Leo un libro en el tren.
word|palabra|wɜːrd|S|cmu|4|Say one word inside.|Di una palabra adentro.
question|pregunta|ˈkwɛstʃən|S|cmu|4|Every street asks you a question.|Cada calle te hace una pregunta.
answer|respuesta|ˈænsər|S|cmu|4|The answer is simple.|La respuesta es simple.
english|inglés|ˈɪŋɡlɪʃ|S|stu|5|I study English.|Estudio inglés.
be|ser / estar|biː|V|ast|5|I'm happy to be here.|Estoy contento de estar aquí.
am|soy / estoy|æm|V|ast|5|I am a student.|Yo soy estudiante.
is|es / está|ɪz|V|ast|5|She is from Chicago.|Ella es de Chicago.
are|son / están|ɑːr|V|ast|5|We are students.|Nosotros somos estudiantes.
have|tener|hæv|V|ast|5|Do you have brothers or sisters?|¿Tienes hermanos o hermanas?
do|hacer (auxiliar)|duː|V|cnn|5|Do you like it?|¿Te gusta?
does|hace (auxiliar 3ª)|dʌz|V|cnn|5|What time does it start?|¿A qué hora empieza?
go|ir|ɡoʊ|V|tra|5|I go to the park.|Voy al parque.
come|venir|kʌm|V|tra|5|Come home soon!|¡Ven a casa pronto!
get up|levantarse|ɡɛt ʌp|V|tmp|5|I get up at 6:30.|Me levanto a las 6:30.
wake up|despertar|weɪk ʌp|V|tmp|5|I wake up early.|Despierto temprano.
eat|comer|iːt|V|ali|5|We eat pizza on Fridays.|Comemos pizza los viernes.
drink|beber|drɪŋk|V|ali|5|Americans drink coffee on the go.|Los americanos beben café en movimiento.
grab|tomar rápido|ɡræb|V|ali|4|I grab a coffee before class.|Tomo un café antes de clase.
make|hacer|meɪk|V|lav|5|She makes coffee all morning.|Hace café toda la mañana.
take|tomar / llevar|teɪk|V|tra|5|Take the N train.|Toma el tren N.
give|dar|ɡɪv|V|cmu|4|Give help with patience.|Da ayuda con paciencia.
get|obtener / recibir|ɡɛt|V|cmu|5|Can I get a refill?|¿Me trae un relleno?
put|poner|pʊt|V|cas|5|Put the phone in your pocket.|Guarda el teléfono en el bolsillo.
look|mirar|lʊk|V|per|5|Look at the plate.|Mira el plato.
see|ver|siː|V|per|5|You see everything in a big city.|Ves todo en una gran ciudad.
watch|mirar (TV/juego)|wɑtʃ|V|sve|5|We watch the game on Sunday.|Vemos el partido el domingo.
read|leer|riːd|V|stu|5|I read the news every morning.|Leo las noticias cada mañana.
write|escribir|raɪt|V|stu|5|Write one sentence.|Escribe una frase.
listen|escuchar|ˈlɪsən|V|per|4|Listen to their voice.|Escucha su voz.
hear|oír|hɪr|V|per|5|You hear one bird.|Oyes un pájaro.
say|decir|seɪ|V|cmu|5|Say thank you, hands.|Di: gracias, manos.
tell|contar|tɛl|V|cmu|4|He tells the same joke.|Cuenta el mismo chiste.
talk|hablar|tɔːk|V|cmu|5|I talk with everybody.|Hablo con todo el mundo.
speak|hablar (idioma)|spiːk|V|cmu|5|She speaks English and Spanish.|Ella habla inglés y español.
ask|preguntar|æsk|V|cmu|5|Ask a stranger for directions.|Pide direcciones a un desconocido.
answer back|responder|ˈænsər bæk|V|cmu|3|«You too!» answers Leo.|«¡Tú también!», responde Leo.
work|trabajar|wɜːrk|V|lav|5|I work in an office downtown.|Trabajo en una oficina del centro.
study|estudiar|ˈstʌdi|V|stu|5|I study business and English.|Estudio negocios e inglés.
learn|aprender|lɜːrn|V|stu|5|You learn fast.|Aprendes rápido.
teach|enseñar|tiːtʃ|V|stu|4|The city teaches you.|La ciudad te enseña.
play|jugar|pleɪ|V|sve|5|I like playing soccer.|Me gusta jugar fútbol.
run|correr|rʌn|V|spt|5|I run in the park.|Corro en el parque.
walk|caminar · caminata|wɔːk|V|tra|5|Walk like a cat. · The walk is the destination.|Camina como un gato. · El caminar es el destino.
sit|sentarse|sɪt|V|cas|5|Sit down and close your eyes.|Siéntate y cierra los ojos.
stand|estar de pie|stænd|V|cas|4|Stand like a mountain.|Párate como una montaña.
wait|esperar|weɪt|V|tmp|5|The line moves; you wait calm.|La fila avanza; tú esperas tranquilo.
buy|comprar|baɪ|V|cmp|5|I buy the jacket.|Compro la chaqueta.
pay|pagar|peɪ|V|fin|5|Can I pay with a card?|¿Puedo pagar con tarjeta?
cost|costar|kɔːst|V|fin|5|How much does it cost?|¿Cuánto cuesta?
save|ahorrar|seɪv|V|fin|4|You saved $4.50 with coupons.|Ahorraste $4.50 con cupones.
order|pedir|ˈɔːrdər|V|ris|4|Are you ready to order?|¿Listo para pedir?
try|probar|traɪ|V|cmu|5|Try both jackets.|Pruébate ambas chaquetas.
wear|usar (ropa)|wɛr|V|rop|4|She wears a white dress.|Ella viste un vestido blanco.
live|vivir|lɪv|V|cit|5|I live in Boston now.|Vivo en Boston ahora.
love|amar / encantar|lʌv|V|emo|5|I love New York.|Amo Nueva York.
like|gustar|laɪk|V|emo|5|I like playing soccer.|Me gusta jugar fútbol.
hate|odiar|heɪt|V|emo|3|I hate waking up early.|Odio despertar temprano.
need|necesitar|niːd|V|ast|5|You need one awake breath.|Necesitas una respiración despierta.
want|querer|wɑnt|V|emo|5|Do you want some dessert?|¿Quieres algún postre?
open|abrir · abierto|ˈoʊpən|V|cas|5|Open the window. · Is the library open on Sundays?|Abre la ventana. · ¿La biblioteca abre los domingos?
close|cerrar|kloʊz|V|cas|5|Close your eyes.|Cierra los ojos.
start|empezar|stɑːrt|V|tmp|5|Classes start at 8.|Las clases empiezan a las 8.|n=Empezar = start o begin · «empezar a» = start to o start + -ing
finish|terminar|ˈfɪnɪʃ|V|tmp|5|I finish at 4 p. m.|Termino a las 4 p. m.
stop|parar · parada|stɑːp|V|tra|4|The train stops here. · The bus stop is across from the fountain.|El tren para aquí. · La parada está enfrente de la fuente.
arrive|llegar|əˈraɪv|V|tra|5|We arrive at Penn Station.|Llegamos a Penn Station.
leave|salir|liːv|V|tra|5|The train leaves at 9:10.|El tren sale a las 9:10.
turn|girar|tɜːrn|V|tra|5|Turn left on 6th Street.|Gira a la izquierda en la 6th.
cross|cruzar|krɔːs|V|tra|5|Cross the park.|Cruza el parque.
carry|llevar (cargar)|ˈkæri|V|tra|4|The hands that carry the coffee.|Las manos que llevan el café.
hold|sostener|hoʊld|V|per|4|Hold your coffee with two hands.|Sostén tu café con dos manos.
feel|sentir|fiːl|V|emo|5|Feel the difference.|Siente la diferencia.
breathe|respirar|briːð|V|cor|5|Breathe in, breathe out.|Inhala, exhala.
smile|sonreír|smaɪl|V|emo|5|Smile inside.|Sonríe por dentro.
laugh|reír|læf|V|emo|5|We laugh at the same joke.|Reímos del mismo chiste.
shout|gritar|ʃaʊt|V|emo|4|Shout with your whole face.|Grita con toda la cara.
sleep|dormir|sliːp|V|cor|5|I sleep eight hours.|Duermo ocho horas.
rest|descansar|rɛst|V|cor|4|Rest your feet at every bench.|Descansa tus pies en cada banca.
relax|relajarse|rɪˈlæks|V|cor|5|Relax your shoulders.|Relaja tus hombros.
cook|cocinar · cocinero|kʊk|V|cas|5|Jake loves cooking tex-mex. · The cook with tired eyes.|A Jake le encanta cocinar tex-mex. · El cocinero de ojos cansados.
wash|lavar|wɑʃ|V|cas|4|Wash one dish with attention.|Lava un plato con atención.
fold|doblar|foʊld|V|cas|3|Fold one shirt with care.|Dobla una camisa con cuidado.
bag|bolsa / bolso|bæɡ|S|cmp|5|Six bags from the outlet.|Seis bolsas del outlet.
box|caja|bɑːks|S|cas|4|The garage is full of boxes.|El garaje está lleno de cajas.
cup|taza|kʌp|S|cas|5|The cup is warm.|La taza está tibia.
glass|vaso|ɡlæs|S|cas|4|A glass of water, please.|Un vaso de agua, por favor.
bottle|botella|ˈbɑːtəl|S|ali|4|A bottle of water for the road.|Una botella de agua para el camino.
plate|plato|pleɪt|S|cas|5|Look at the plate: colors and steam.|Mira el plato: colores y vapor.
table|mesa|ˈteɪbəl|S|cas|5|Wings on the table.|Alitas en la mesa.
chair|silla|tʃɛr|S|cas|5|Sit on a chair in the kitchen.|Siéntate en una silla en la cocina.
couch|sofá|kaʊtʃ|S|cas|4|Friends on the couch.|Amigos en el sofá.
bed|cama|bɛd|S|cas|5|You are in bed at 10 p. m.|Estás en la cama a las 10 p. m.
room|habitación|ruːm|S|cas|5|The quiet room inside.|La habitación silenciosa interior.
living room|sala|ˈlɪvɪŋ ruːm|S|cas|5|The living room is big.|La sala es grande.
kitchen|cocina|ˈkɪtʃən|S|cas|5|The kitchen smells like home.|La cocina huele a hogar.
bathroom|baño|ˈbæθruːm|S|cas|5|The apartment has two bathrooms.|El apartamento tiene dos baños.
bedroom|dormitorio|ˈbɛdruːm|S|cas|5|There are two bedrooms.|Hay dos dormitorios.
window|ventana|ˈwɪndoʊ|S|cas|5|The window is a movie.|La ventanilla es una película.
door|puerta|dɔːr|S|cas|5|The door of the quiet room is your breath.|La puerta de la quietud es tu respiración.
wall|pared|wɔːl|S|cas|4|Light on the wall.|Luz en la pared.
floor|piso|flɔːr|S|cas|5|Feel your feet on the floor.|Siente tus pies en el suelo.
balcony|balcón|ˈbælkəni|S|cas|4|There's a small balcony with plants.|Hay un balcón pequeño con plantas.
garden|jardín|ˈɡɑːrdən|S|cas|4|Is there a garden? — No, there isn't.|¿Hay jardín? — No, no hay.
yard|patio|jɑːrd|S|cas|3|Houses in the suburbs have a yard.|Las casas de suburbio tienen patio.
garage|garaje|ɡəˈrɑːʒ|S|cas|4|The garage is for storage.|El garaje es de bodega.
closet|armario|ˈklɔːzɪt|S|cas|4|There are two closets in the room.|Hay dos armarios en el cuarto.
fridge|refrigerador|frɪdʒ|S|cas|4|There's a big fridge in the kitchen.|Hay un refrigerador grande en la cocina.
dish|plato (loza)|dɪʃ|S|cas|4|Do the dishes after dinner.|Lava los platos después de cenar.
dishes|los platos (quehacer)|ˈdɪʃɪz|S|cas|4|The chore chart says: dishes.|La tabla de quehaceres dice: platos.
trash|basura|træʃ|S|cas|4|Take out the trash, please.|Saca la basura, por favor.
thing|cosa|θɪŋ|S|ast|5|Find three things in the room.|Encuentra tres cosas en la habitación.
stuff|cosas (informal)|stʌf|S|ast|4|A room for stuff.|Una habitación para las cosas.
clothes|ropa|kloʊdz|S|rop|5|Mountains of clothes at the outlet.|Montañas de ropa en el outlet.
jacket|chaqueta|ˈdʒækɪt|S|rop|5|I'm looking for a jacket.|Busco una chaqueta.
shirt|camisa|ʃɜːrt|S|rop|5|A nice blue shirt.|Una camisa azul bonita.
t-shirt|camiseta|ˈtiː ʃɜːrt|S|rop|5|A t-shirt and shorts in summer.|Camiseta y shorts en verano.
pants|pantalones|pænts|S|rop|5|These pants are too long.|Estos pantalones quedan muy largos.
dress|vestido|drɛs|S|rop|4|My grandma wears a white dress.|Mi abuela viste un vestido blanco.
skirt|falda|skɜːrt|S|rop|3|A blue skirt and a white shirt.|Una falda azul y una camisa blanca.
shoe|zapato|ʃuː|S|rop|5|The shoe section is big.|La sección de zapatos es grande.
sneakers|zapatillas|ˈsniːkərz|S|rop|4|I wear sneakers for walking.|Uso zapatillas para caminar.
size|talla|saɪz|S|rop|5|What size are you?|¿Qué talla usas?
color|color|ˈkʌlər|S|col|5|It comes in blue, black and gray.|La tienen en azul, negro y gris.
blue|azul|bluː|A|col|5|The sky is still blue.|El cielo sigue azul.
red|rojo|rɛd|A|col|5|Red, green, big, small.|Rojo, verde, grande, pequeño.
green|verde|ɡriːn|A|col|5|The apple section: red and green.|La sección de manzanas: rojas y verdes.
black|negro|blæk|A|col|5|It comes in blue, black and gray.|La tienen en azul, negro y gris.
gray|gris|ɡreɪ|A|col|5|Gray, please.|Gris, por favor.
white|blanco|waɪt|A|col|5|A white dress.|Un vestido blanco.
yellow|amarillo|ˈjɛloʊ|A|col|4|A river of yellow cabs.|Un río de taxis amarillos.
coffee|café|ˈkɔːfi|S|ali|5|I grab a coffee before class.|Tomo un café antes de clase.
tea|té|tiː|S|ali|5|Grandma drinks her tea in silence.|La abuela bebe su té en silencio.
water|agua · regar|ˈwɔːtər|S|ali|5|A glass of water, please. · Water a plant on the balcony.|Un vaso de agua. · Riega una planta en el balcón.
milk|leche|mɪlk|S|ali|5|How much is a gallon of milk?|¿Cuánto cuesta un galón de leche?
juice|jugo|dʒuːs|S|ali|5|I always have breakfast: eggs and orange juice.|Siempre desayuno: huevos y jugo de naranja.
food|comida|fuːd|S|ali|5|I love American food.|Me encanta la comida americana.
breakfast|desayuno|ˈbrɛkfəst|S|ali|5|I have breakfast at home.|Desayuno en casa.
lunch|almuerzo|lʌntʃ|S|ali|5|I have lunch with my coworkers.|Almuerzo con mis compañeros.
dinner|cena|ˈdɪnər|S|ali|5|Dinner starts at 6:30.|La cena empieza a las 6:30.
snack|bocadillo|snæk|S|ali|4|Snacks in the back seat.|Bocadillos en el asiento trasero.
pizza|pizza|ˈpiːtsə|S|ali|5|Pizza by the slice.|Pizza por porción.
burger|hamburguesa|ˈbɜːrɡər|S|ali|5|A cheeseburger with fries.|Una hamburguesa con queso y papas.
sandwich|sándwich|ˈsænwɪtʃ|S|ali|5|We usually eat sandwiches.|Usualmente comemos sándwiches.
eggs|huevos|ɛɡz|S|ali|5|A dozen eggs, please.|Una docena de huevos, por favor.
bread|pan|brɛd|S|ali|5|Only warm bread and you.|Solo pan tibio y tú.
bagel|bagel|ˈbeɪɡəl|S|ali|4|A bagel with cream cheese.|Un bagel con queso crema.
muffin|mollete|ˈmʌfɪn|S|ali|4|A blueberry muffin, please.|Un muffin de arándanos, por favor.
wings|alitas|wɪŋz|S|ali|4|Wings on the table on game day.|Alitas en la mesa el día de partido.
fruit|fruta|fruːt|S|ali|5|Fruit is the present moment in a bowl.|La fruta es el presente en un tazón.
apple|manzana|ˈæpəl|S|ali|5|Choosing an apple like a ritual.|Elegir una manzana como un ritual.
rice|arroz|raɪs|S|ali|4|A five-pound bag of rice.|Una bolsa de arroz de cinco libras.
sugar|azúcar|ˈʃʊɡər|S|ali|4|We don't have any sugar.|No tenemos azúcar.
salt|sal|sɔːlt|S|ali|4|Pass the salt, please.|Pásame la sal, por favor.
cream|crema|kriːm|S|ali|4|Do you want room for cream?|¿Quieres espacio para la crema?
butter|mantequilla|ˈbʌtər|S|ali|4|Peanut butter is in aisle 5.|La mantequilla de maní está en el pasillo 5.
cheese|queso|tʃiːz|S|ali|5|Half a pound of cheese.|Media libra de queso.
coffee shop|cafetería|ˈkɔːfi ʃɑːp|S|vig|5|The coffee shop is on the corner.|La cafetería está en la esquina.
restaurant|restaurante|ˈrɛstərɑːnt|S|ris|5|The restaurant is noisy.|El restaurante es ruidoso.
menu|menú|ˈmɛnjuː|S|ris|5|The menu is a mystery.|El menú es un misterio.
check|cuenta|tʃɛk|S|fin|5|Could we get the check, please?|¿Nos trae la cuenta, por favor?|ff=1; n=check = cuenta en restaurante (NO «cheque» bancario en este uso)
bill|cuenta (británico)|bɪl|S|fin|3|In the U.S. they say check, not bill.|En EE. UU. dicen check, no bill.
tip|propina|tɪp|S|fin|5|The tip is 15-20 percent.|La propina es del 15-20 %.
tax|impuesto|tæks|S|fin|5|The tax is added at checkout.|El impuesto se agrega al pagar.
price|precio|praɪs|S|fin|5|The price tag is not final.|El precio de la etiqueta no es final.
money|dinero|ˈmʌni|S|fin|5|Time is money? No: time is soft.|¿El tiempo es dinero? No: el tiempo es suave.
card|tarjeta|kɑːrd|S|fin|5|Card or cash? — Card, please.|¿Tarjeta o efectivo? — Tarjeta, por favor.
cash|efectivo|kæʃ|S|fin|5|I don't have any cash.|No tengo efectivo.
coupon|cupón|ˈkuːpɑːn|S|fin|4|I have some coupons.|Tengo algunos cupones.
change|cambio (moneda)|tʃeɪndʒ|S|fin|4|Keep the change!|¡Quédese con el cambio!
receipt|recibo|rɪˈsiːt|S|fin|4|I write the tip on the receipt.|Escribo la propina en el recibo.
sale|rebaja|seɪl|S|cmp|4|It's on sale today.|Está en oferta hoy.
store|tienda|stɔːr|S|cmp|5|The store is two blocks away.|La tienda está a dos cuadras.
mall|centro comercial|mɔːl|S|cmp|4|Soft knees at the mall.|Rodillas suaves en el mall.
outlet|outlet (fábrica)|ˈaʊtlɛt|S|cmp|3|Rows of stores at the outlet.|Filas de tiendas en el outlet.
market|mercado|ˈmɑːrkɪt|S|cmp|4|The market is on Sundays.|El mercado es los domingos.
supermarket|supermercado|ˈsuːpərˌmɑːrkɪt|S|cmp|5|The supermarket is huge.|El supermercado es enorme.
aisle|pasillo|aɪl|S|cmp|4|Peanut butter is in aisle 5.|La mantequilla de maní está en el pasillo 5.
cart|carrito|kɑːrt|S|cmp|4|Forty things in the cart.|Cuarenta cosas en el carrito.
list|lista|lɪst|S|cmu|5|Follow your shopping list.|Sigue tu lista del mercado.
counter|mostrador|ˈkaʊntər|S|cmp|4|The tip jar on the counter.|El frasco de propinas en el mostrador.
cashier|cajero|kæˈʃɪr|S|pro|4|The cashier asks: paper or plastic?|La cajera pregunta: ¿papel o plástico?
register|caja registradora|ˈrɛdʒɪstər|S|cmp|3|The register beeps like a video game.|La caja pita como un juego.
fitting room|probador|ˈfɪtɪŋ ruːm|S|cmp|4|The fitting room is over there.|El probador está allí.
city|ciudad|ˈsɪti|S|cit|5|The city is a teacher.|La ciudad es una maestra.
street|calle|striːt|S|cit|5|Life happens on the street.|La vida ocurre en la calle.
block|cuadra|blɑːk|S|cit|5|Go straight for two blocks.|Sigue recto dos cuadras.
corner|esquina|ˈkɔːrnər|S|cit|5|The café is on the corner.|El café está en la esquina.
station|estación|ˈsteɪʃən|S|tra|5|We arrive at Penn Station.|Llegamos a Penn Station.
subway|metro|ˈsʌbweɪ|S|tra|5|Take the subway — the N train.|Toma el metro — el tren N.
train|tren|treɪn|S|tra|5|The train leaves at 9:10.|El tren sale a las 9:10.
track|vía|træk|S|tra|4|The train leaves from track 4.|El tren sale de la vía 4.
bus|autobús|bʌs|S|tra|5|The bus is cheap.|El autobús es barato.
car|auto|kɑːr|S|tra|5|The car sleeps on the street.|El auto duerme en la calle.
cab|taxi|kæb|S|tra|4|A river of yellow cabs.|Un río de taxis amarillos.
ticket|billete|ˈtɪkɪt|S|tra|5|One ticket to Hamilton.|Una entrada para Hamilton.
trip|viaje|trɪp|S|tra|5|How long is the trip?|¿Cuánto dura el viaje?
ride|pase / vuelta (en vehículo)|raɪd|S|tra|4|A cab ride or a walk?|¿Un pase en taxi o caminar?
road|carretera|roʊd|S|tra|4|The road trip begins on Friday.|El viaje en carretera empieza el viernes.
way|camino|weɪ|S|tra|5|The walk is the destination.|El caminar es el destino.
airport|aeropuerto|ˈɛrpɔːrt|S|tra|4|Airports are the temples of the modern world.|Los aeropuertos son los templos del mundo moderno.
park|parque|pɑːrk|S|nat|5|I run in the park.|Corro en el parque.
bench|banca|bɛntʃ|S|cit|4|Find a bench at every two hours.|Encuentra una banca cada dos horas.
courthouse|juzgado|ˈkɔːrtˌhaʊs|S|ist|2|It's next to the courthouse.|Está al lado del juzgado.
bank|banco|bæŋk|S|fin|4|The pharmacy is across from the bank.|La farmacia está enfrente del banco.
pharmacy|farmacia|ˈfɑːrməsi|S|sla|4|The pharmacy is open on Sundays.|La farmacia abre los domingos.
hospital|hospital|ˈhɑːspɪtəl|S|sla|4|He's a nurse at a hospital.|Es enfermero en un hospital.
museum|museo|mjuˈziːəm|S|art|4|Talk to the guards at the museum.|Habla con los guardias del museo.
show|espectáculo|ʃoʊ|S|art|4|The show starts at 8 p. m.|La función empieza a las 8 p. m.
game|partido / juego|ɡeɪm|S|spt|5|The game starts at 2 p. m.|El partido empieza a las 2 p. m.
movie|película|ˈmuːvi|S|cin|5|I watch a movie in the evening.|Veo una película por la noche.
song|canción|sɔːŋ|S|mus|4|A playlist of 200 songs.|Una lista de 200 canciones.
photo|foto|ˈfoʊtoʊ|S|sve|5|A photo of my family.|Una foto de mi familia.
picture|imagen|ˈpɪktʃər|S|sve|4|Look at the picture.|Mira la imagen.
phone|teléfono|foʊn|S|tec|5|The phone stays in my pocket.|El teléfono queda en mi bolsillo.
screen|pantalla|skriːn|S|tec|4|Ten minutes without screens.|Diez minutos sin pantallas.
music|música|ˈmjuːzɪk|S|mus|5|Stores use colors, offers and music.|Las tiendas usan colores, ofertas y música.
noise|ruido|nɔɪz|S|nat|4|Without the noise, the world speaks softly.|Sin ruido, el mundo habla suave.
sound|sonido|saʊnd|S|nat|4|There is only this sound.|Solo existe este sonido.
silence|silencio|ˈsaɪləns|S|nat|4|Silence is not empty.|El silencio no está vacío.
light|luz|laɪt|S|nat|5|Light on the wall.|Luz en la pared.
smell|olor|smɛl|S|cor|4|The smell is strong.|El aroma es fuerte.
taste|sabor|teɪst|S|ali|4|The here and now has a taste.|El aquí y el ahora tiene un sabor.
steam|vapor|stiːm|S|nat|3|Colors and steam on the plate.|Colores y vapor en el plato.
breath|respiración|brɛθ|S|cor|5|Take one slow breath.|Da una respiración lenta.
air|aire|ɛr|S|nat|5|Fresh air in the morning.|Aire fresco por la mañana.
sky|cielo|skaɪ|S|nat|5|The sky stays, quiet and open.|El cielo permanece, quieto y abierto.
cloud|nube|klaʊd|S|nat|4|Thoughts are clouds.|Los pensamientos son nubes.
rain|lluvia|reɪn|S|cli|4|Thank you to the rain.|Gracias a la lluvia.
sun|sol|sʌn|S|cli|4|The farmer works under the sun.|El agricultor trabaja bajo el sol.
wind|viento|wɪnd|S|cli|3|The wind in the park.|El viento en el parque.
weather|clima|ˈwɛðər|S|cli|4|We talk about the weather.|Hablamos del clima.
morning|mañana|ˈmɔːrnɪŋ|S|tmp|5|My mornings are fast.|Mis mañanas son rápidas.
afternoon|tarde|ˌæftərˈnuːn|S|tmp|5|I study in the afternoon.|Estudio por la tarde.
evening|tarde-noche|ˈiːvnɪŋ|S|tmp|5|In the evening I watch a movie.|Por la noche veo una película.
night|noche|naɪt|S|tmp|5|The city never sleeps at night.|La ciudad nunca duerme de noche.
day|día|deɪ|S|tmp|5|What a day!|¡Vaya día!
week|semana|wiːk|S|tmp|5|See you next week.|Nos vemos la próxima semana.
weekend|fin de semana|ˈwiːkɛnd|S|tmp|5|What do you like doing on weekends?|¿Qué te gusta hacer los fines de semana?
hour|hora|ˈaʊər|S|tmp|5|An hour disappears when you play.|Una hora desaparece cuando juegas.
minute|minuto|ˈmɪnɪt|S|tmp|5|Wait for one minute.|Espera un minuto.
second|segundo|ˈsɛkənd|S|tmp|5|Gratitude is a practice of one second.|La gratitud es una práctica de un segundo.
time|tiempo|taɪm|S|tmp|5|Time becomes soft.|El tiempo se vuelve suave.
today|hoy|təˈdeɪ|D|tmp|5|Today, call one person you love.|Hoy, llama a una persona que amas.
tomorrow|mañana (futuro)|təˈmɑːroʊ|D|tmp|5|I don't worry about tomorrow.|No me preocupo por el mañana.
yesterday|ayer|ˈjɛstərdeɪ|D|tmp|5|You do not think about yesterday.|No piensas en el ayer.
now|ahora|naʊ|D|tmp|5|Right now, nothing else exists.|Ahora mismo, nada más existe.
early|temprano|ˈɜːrli|A|tmp|5|Classes start early.|Las clases empiezan temprano.
late|tarde|leɪt|A|tmp|5|Sorry I'm late!|¡Perdón por llegar tarde!
always|siempre|ˈɔːlweɪz|D|tmp|5|I always have breakfast.|Siempre desayuno.
never|nunca|ˈnɛvər|D|tmp|5|I never watch TV in the morning.|Nunca veo TV por la mañana.
usually|usualmente|ˈjuːʒuəli|D|tmp|4|We usually eat sandwiches.|Usualmente comemos sándwiches.
sometimes|a veces|ˈsʌmtaɪmz|D|tmp|4|Sometimes the sky is gray.|A veces el cielo está gris.
again|de nuevo|əˈɡɛn|D|tmp|5|Again and again, like a friend.|Una y otra vez, como un amigo.
still|todavía|stɪl|D|tmp|4|The sky is still blue.|El cielo sigue azul.
already|ya|ɔːlˈrɛdi|D|tmp|4|Are we there already?|¿Ya llegamos?
soon|pronto|suːn|D|tmp|5|Come home soon!|¡Ven a casa pronto!
fast|rápido|fæst|A|tmp|4|My mornings are fast.|Mis mañanas son rápidas.
slow|lento|sloʊ|A|tmp|5|Take one slow breath.|Da una respiración lenta.
soft|suave|sɔːft|A|ast|5|Time becomes soft.|El tiempo se vuelve suave.
quiet|silencioso|ˈkwaɪət|A|emo|5|A quiet room inside.|Una habitación silenciosa adentro.|ff=1; n=quiet NO es «quieto» (eso es still) · significa sin ruido o en calma
loud|ruidoso|laʊd|A|emo|4|No loud music after 10.|Sin música alta después de las 10.
happy|feliz|ˈhæpi|A|emo|5|I'm happy to be here.|Estoy contento de estar aquí.
sad|triste|sæd|A|emo|4|Nobody is sad: there's next Sunday.|Nadie está triste: hay próximo domingo.
tired|cansado|ˈtaɪərd|A|cor|4|The cook with tired eyes.|El cocinero de ojos cansados.
angry|enojado|ˈæŋɡri|A|emo|3|Calm is not angry.|La calma no está enojada.
great|genial|ɡreɪt|A|emo|5|How's it going? — Great!|¿Qué tal? — ¡Genial!
nice|bonito / agradable|naɪs|A|emo|5|A nice gray jacket.|Una chaqueta gris bonita.
beautiful|hermoso|ˈbjuːtɪfəl|A|emo|5|It's a beautiful city.|Es una ciudad hermosa.
big|grande|bɪɡ|A|ast|5|The sizes are big.|Los tamaños son grandes.
small|pequeño|smɔːl|A|ast|5|Tall (small!), grande, venti.|Tall (¡pequeño!), grande, venti.
little|pequeño / poquito|ˈlɪtəl|A|ast|5|A little tight in the shoulders.|Un poco ajustada en los hombros.
young|joven|jʌŋ|A|ast|4|She looks young.|Parece joven.
old|viejo|oʊld|A|ast|4|A kitchen from 1980 is old.|Una cocina de 1980 es vieja.
new|nuevo|nuː|A|ast|5|New home, new life!|¡Nueva casa, nueva vida!
free|gratis / libre|friː|A|fin|5|Presence is free.|La presencia es gratis.
busy|ocupado|ˈbɪzi|A|lav|4|The station is busy at 8.|La estación está llena a las 8.
full|lleno|fʊl|A|ast|5|Silence is full of peace.|El silencio está lleno de paz.
empty|vacío|ˈɛmpti|A|ast|4|Silence is not empty.|El silencio no está vacío.
warm|tibio|wɔːrm|A|nat|5|The cup is warm.|La taza está tibia.
hot|caliente|hɑːt|A|nat|5|The coffee is hot.|El café está caliente.
cold|frío|koʊld|A|cli|5|A cold morning in Chicago.|Una mañana fría en Chicago.
fresh|fresco|frɛʃ|A|ali|4|Arrive fresh at the hotel.|Llega fresco al hotel.
tight|ajustado|taɪt|A|rop|5|It's a little tight in the shoulders.|Queda un poco ajustada en los hombros.
loose|holgado|luːs|A|rop|4|It's loose — try a small.|Queda holgada — prueba una S.
long|largo|lɔːŋ|A|ast|5|These pants are too long.|Estos pantalones quedan muy largos.
short|corto|ʃɔːrt|A|ast|4|My mom has long hair; mine is short.|Mi mamá tiene pelo largo; el mío, corto.
clean|limpio|kliːn|A|cas|4|A clean table is a calm table.|Una mesa limpia es una mesa calmada.
safe|seguro|seɪf|A|sla|4|A safe corner in the city.|Un rincón seguro en la ciudad.
easy|fácil|ˈiːzi|A|ast|5|Returns are easy in the U.S.|Devolver es fácil en EE. UU.
hard|difícil|hɑːrd|A|ast|4|Meditation looks hard; it is simple.|La meditación parece difícil; es simple.
simple|simple|ˈsɪmpəl|A|ast|5|Meditation is simple.|La meditación es simple.
strong|fuerte|strɔːŋ|A|ast|4|The smell is strong.|El aroma es fuerte.
deep|profundo|diːp|A|ast|4|The night is deeper after three breaths.|La noche es más profunda tras tres respiraciones.
whole|entero|hoʊl|A|ast|4|Watch the game with your whole face.|Mira el juego con toda la cara.
awake|despierto|əˈweɪk|A|cor|4|One awake breath.|Una respiración despierta.
present|presente|ˈprɛzənt|A|tmp|5|Traveling in the present is a gift.|Viajar en el presente es un regalo.|ff=1; n=Como sustantivo present = regalo · como adjetivo aquí = presente (el aquí y ahora)
perfect|perfecto|ˈpɜːrfɪkt|A|ast|5|The L is perfect.|La L queda perfecta.
sure|seguro (estar seguro)|ʃʊr|A|cmu|5|Sleep on it if you are not sure.|Duerme el asunto si no estás seguro.
ready|listo|ˈrɛdi|A|ast|5|Are you ready to order?|¿Listo para pedir?
friendly|amistoso|ˈfrɛndli|A|rel|5|People are friendly here.|La gente es amistosa aquí.
fun|diversión|fʌn|S|sve|5|What do you do for fun?|¿Qué haces para divertirte?
hobby|pasatiempo|ˈhɑːbi|S|sve|4|Talk about your hobbies with energy.|Habla de tus pasatiempos con energía.
sport|deporte|spɔːrt|S|spt|4|Saturday is for kids' sports.|El sábado es del deporte juvenil.
hiking|senderismo|ˈhaɪkɪŋ|S|spt|4|I'm really into hiking.|Me apasiona el senderismo.
yoga|yoga|ˈjoʊɡə|S|spt|3|She does yoga in the morning.|Ella hace yoga por la mañana.
shower|ducha|ˈʃaʊər|S|cas|5|I take a shower at 6:30.|Me ducho a las 6:30.
dream|sueño|driːm|S|ast|3|The American dream has a room for stuff.|El sueño americano tiene habitación para las cosas.
story|historia|ˈstɔːri|S|let|4|You arrive with energy for one more story.|Llegas con energía para una historia más.
joke|chiste|dʒoʊk|S|cmu|4|He tells the same joke as always.|Cuenta el mismo chiste de siempre.
practice|práctica|ˈpræktɪs|S|ast|5|Meditation is a practice, not a talent.|La meditación es una práctica, no un talento.
exercise|ejercicio|ˈɛksərsaɪz|S|cor|4|I need the exercise.|Necesito el ejercicio.
habit|hábito|ˈhæbɪt|S|ast|4|A small habit with a big gift.|Un hábito pequeño con un gran regalo.
gift|regalo|ɡɪft|S|rel|4|Silence is a gift for your mind.|El silencio es un regalo para la mente.
moment|momento|ˈmoʊmənt|S|tmp|5|The here and now has a taste.|El aquí y el ahora tiene un sabor.
peace|paz|piːs|S|emo|4|Peace begins with one person.|La paz empieza con una persona.
joy|alegría|dʒɔɪ|S|emo|4|Zero ego, pure joy.|Cero ego, alegría pura.
love (sent.)|amor|lʌv|S|emo|5|A meal is a chain of invisible love.|Una comida es una cadena de amor invisible.
attention|atención|əˈtɛnʃən|S|cor|5|Calm is the presence of attention.|La calma es la presencia de atención.
patience|paciencia|ˈpeɪʃəns|S|emo|4|Give help with patience.|Da ayuda con paciencia.
kindness|amabilidad|ˈkaɪndnəs|S|emo|3|A web of small kindness.|Una red de pequeñas amabilidades.
gratitude|gratitud|ˈɡrætɪtuːd|S|emo|3|Gratitude is a spiritual practice.|La gratitud es una práctica espiritual.
spirituality|espiritualidad|ˌspɪrɪtuˈæləti|S|ast|3|Spirituality is not far away.|La espiritualidad no está lejos.
meditation|meditación|ˌmɛdɪˈteɪʃən|S|ast|4|Meditation is simple.|La meditación es simple.
relaxation|relajación|ˌriːlækˈseɪʃən|S|cor|3|Mental relaxation is trusting the walk.|La relajación mental es confiar en el caminar.
silence (int.)|quietud|ˈsaɪləns|S|ast|4|Train your inner quiet like a muscle.|Entrena tu quietud interior como un músculo.
calm|calma|kɑːm|S|emo|4|You are the calm inside the storm.|Tú eres la calma dentro de la tormenta.
storm|tormenta|stɔːrm|S|nat|3|The storm of products.|La tormenta de productos.
wave|ola|weɪv|S|nat|4|You do not stop the waves.|No detienes las olas.
island|isla|ˈaɪlənd|S|nat|3|You become the island.|Te conviertes en la isla.
mountain|montaña|ˈmaʊntən|S|nat|4|Stand like a mountain.|Párate como una montaña.
river|río|ˈrɪvər|S|nat|4|The city sounds like a river of steel.|La ciudad suena como un río de acero.
lake|lago|leɪk|S|nat|3|Her mind is calm like a lake.|Su mente está serena como un lago.
forest|bosque|ˈfɔːrɪst|S|nat|4|Connecticut slides by: forests and rivers.|Connecticut pasa: bosques y ríos.
field|campo|fiːld|S|nat|4|Fields and little towns from the window.|Campos y pueblos desde la ventanilla.
tree|árbol|triː|S|nat|5|A tree in the yard.|Un árbol en el patio.
plant|planta|plænt|S|nat|5|Water a plant on the balcony.|Riega una planta en el balcón.
flower|flor|ˈflaʊər|S|nat|4|Buy flowers on Sunday.|Compra flores el domingo.
grass|césped|ɡræs|S|nat|3|Bare feet on the grass.|Pies descalzos en el césped.
skyline|horizonte (de la ciudad)|ˈskaɪlaɪn|S|cit|3|The skyline at night.|El perfil de la ciudad de noche.
building|edificio|ˈbɪldɪŋ|S|cit|4|The building has a garage.|El edificio tiene garaje.
neighbor|vecino|ˈneɪbər|S|cit|4|My neighbor knows everybody.|Mi vecino conoce a todos.
neighborhood|barrio|ˈneɪbərhʊd|S|cit|4|A quiet neighborhood in Denver.|Un barrio tranquilo en Denver.
town|pueblo|taʊn|S|cit|4|Little towns with water towers.|Pueblos con tanques de agua.
village|aldea|ˈvɪlɪdʒ|S|cit|3|A quiet village.|Una aldea tranquila.
country|país|ˈkʌntri|S|ast|5|What a big country!|¡Vaya país!|ff=1; n=country = país · no confundir con countryside (campo)
world|mundo|wɜːrld|S|ast|5|The world speaks softly.|El mundo habla suave.
planet|planeta|ˈplænɪt|S|sci|4|Same planet, different clocks.|Mismo planeta, diferentes relojes.
earth|tierra|ɜːrθ|S|nat|4|Thank you to the earth.|Gracias a la tierra.
people|gente|ˈpiːpəl|S|rel|5|People run around you.|La gente corre a tu alrededor.|p=people; n=Sustantivo plural irregular: people are (nunca people is)
person|persona|ˈpɜːrsən|S|rel|5|Peace begins with one person.|La paz empieza con una persona.|p=people
man|hombre|mæn|S|rel|5|A man with a friendly face.|Un hombre de rostro amable.|p=men
woman|mujer|ˈwʊmən|S|rel|5|A woman with a folder of coupons.|Una mujer con carpeta de cupones.|p=women
child|niño|tʃaɪld|S|fam|5|Children play without a clock.|Los niños juegan sin reloj.|p=children
children|niños|ˈtʃɪldrən|S|fam|5|Children do not watch the clock.|Los niños no miran el reloj.
family|familia|ˈfæməli|S|fam|5|My family is big.|Mi familia es grande.
mother|madre|ˈmʌðər|S|fam|5|My mother is a teacher.|Mi madre es profesora.
mom|mamá|mɑːm|S|fam|5|Hi, mom!|¡Hola, mamá!
father|padre|ˈfɑːðər|S|fam|5|My father's name is Carlos.|Mi padre se llama Carlos.
dad|papá|dæd|S|fam|5|You are a copy of dad!|¡Eres una copia de papá!
parents|padres|ˈpɛrənts|S|fam|5|My parents live in Lima.|Mis padres viven en Lima.
sister|hermana|ˈsɪstər|S|fam|5|I have one sister.|Tengo una hermana.
brother|hermano|ˈbrʌðər|S|fam|5|I have two brothers.|Tengo dos hermanos.
sister-in-law|cuñada|ˈsɪstər ɪn lɔː|S|fam|3|My sister-in-law cooks great.|Mi cuñada cocina genial.
grandma|abuela|ˈɡrænmɑː|S|fam|5|My grandma sits in her chair.|Mi abuela se sienta en su sillón.
grandpa|abuelo|ˈɡrænpɑː|S|fam|4|My grandpa wears a suit in the photo.|Mi abuelo viste traje en la foto.
grandmother|abuela|ˈɡrænmʌðər|S|fam|4|My grandmother drinks tea in silence.|Mi abuela bebe té en silencio.
grandparents|abuelos|ˈɡrænpɛrənts|S|fam|4|My grandparents' wedding photo.|La foto de boda de mis abuelos.
aunt|tía|ænt|S|fam|4|My aunt comes with a strategy.|Mi tía viene con una estrategia.
uncle|tío|ˈʌŋkəl|S|fam|4|My uncle tells the same joke.|Mi tío cuenta el mismo chiste.
cousin|primo|ˈkʌzən|S|fam|5|My cousin shows his new tattoo.|Mi primo muestra su tatuaje.
kid|niño / hijo|kɪd|S|fam|5|Their kids teach me table phrases.|Sus hijos me enseñan frases de mesa.
baby|bebé|ˈbeɪbi|S|fam|4|He's my baby, says a dog owner.|«Es mi bebé», dice un dueño de perro.
wife|esposa|waɪf|S|fam|4|His wife waits at the door.|Su esposa espera en la puerta.|p=wives
husband|esposo|ˈhʌzbənd|S|fam|4|Her husband parks the car.|Su esposo estaciona el auto.
couple|pareja|ˈkʌpəl|S|rel|4|A couple with two dogs.|Una pareja con dos perros.
roommate|compañero de cuarto|ˈruːmmeɪt|S|cas|4|My roommate is a night owl.|Mi compañero de cuarto es noctámbulo.
stepdad|padrastro|ˈstɛpdæd|S|fam|3|My stepdad loves grilling.|Mi padrastro ama la parrilla.
dog|perro|dɔːɡ|S|ani|5|Our dog is part of the family.|Nuestro perro es parte de la familia.
cat|gato|kæt|S|ani|5|We have a cat: her name is Luna.|Tenemos una gata: se llama Luna.
pet|mascota|pɛt|S|ani|5|Do you have any pets?|¿Tienes mascotas?
paw|pata|pɔː|S|ani|3|One paw in front of the other.|Una pata delante de la otra.
bird|pájaro|bɜːrd|S|ani|5|You hear one bird.|Oyes un pájaro.
farmer|agricultor|ˈfɑːrmər|S|pro|4|The farmer works under the sun.|El agricultor trabaja bajo el sol.
driver|conductor|ˈdraɪvər|S|pro|4|The driver on the highway at dawn.|El camionero en la carretera al alba.
server|camarero|ˈsɜːrvər|S|pro|4|Our server is super friendly.|Nuestro camarero es súper amable.
barista|barista|bəˈriːstə|S|pro|4|The barista makes coffee all morning.|El barista hace café toda la mañana.
salesperson|vendedor|ˈseɪlzpɜːrsən|S|pro|4|The salesperson brings a medium.|La vendedora trae una M.|p=salespeople
guard|guardia|ɡɑːrd|S|pro|3|Talk to the guards at the museum.|Habla con los guardias del museo.
agent|agente|ˈeɪdʒənt|S|pro|3|The agent asks: one way or round trip?|El agente pregunta: ¿ida o ida y vuelta?
conductor|revisor|kənˈdʌktər|S|pro|3|The conductor says: tickets, please!|El revisor dice: ¡billetes, por favor!
nurse|enfermero|nɜːrs|S|pro|5|He's a nurse at a hospital.|Es enfermero en un hospital.
engineer|ingeniero|ˌɛndʒəˈnɪr|S|pro|4|That's my father; he's an engineer.|Ese es mi padre; es ingeniero.
job|trabajo (empleo)|dʒɑːb|S|lav|5|I love my job.|Amo mi trabajo.
office|oficina|ˈɔːfɪs|S|lav|5|I work in an office downtown.|Trabajo en una oficina del centro.
coworker|compañero de trabajo|koʊˈwɜːrkər|S|lav|4|I have lunch with my coworkers.|Almuerzo con mis compañeros.
business|negocios|ˈbɪznəs|S|lav|4|I study business and English.|Estudio negocios e inglés.
wage|salario|weɪdʒ|S|lav|3|Servers earn a small base wage.|Los camareros ganan un sueldo base bajo.
schedule|horario|ˈskɛdʒuːl|S|tmp|4|Your body learns your schedule.|Tu cuerpo aprende tu horario.
rule|regla|ruːl|S|ast|4|The subway has unwritten rules.|El metro tiene reglas no escritas.
law|ley|lɔː|S|ist|3|The quiet car should be a law.|El vagón silencioso debería ser una ley.
sign|letrero|saɪn|S|cit|4|«70% off» signs everywhere.|Carteles de «70 % de descuento» por todas partes.
plan|plan|plæn|S|ast|5|Life happens on the street, not on the plan.|La vida ocurre en la calle, no en el plan.
idea|idea|aɪˈdiː|S|ast|5|The map is an idea; the street is real.|El mapa es una idea; la calle es real.
thought|pensamiento|θɔːt|S|ast|4|When a bad thought arrives.|Cuando llega un mal pensamiento.
mind|mente|maɪnd|S|cor|5|Your mind talks, and that is okay.|Tu mente habla, y está bien.
brain|cerebro|breɪn|S|sci|4|Two lists, one brain.|Dos listas, un cerebro.
body|cuerpo|ˈbɑːdi|S|cor|5|Your body says thank you.|Tu cuerpo dice gracias.
shoulders|hombros|ˈʃoʊldərz|S|cor|5|Let your shoulders down.|Deja caer los hombros.
knees|rodillas|niːz|S|cor|4|Soft knees at the mall.|Rodillas suaves en el mall.
feet|pies|fiːt|S|cor|5|Take the weight off your feet.|Quítale el peso a tus pies.
hands|manos|hændz|S|cor|5|Bless the hands that cook.|Bendice las manos que cocinan.
eyes|ojos|aɪz|S|cor|5|The cook with tired eyes.|El cocinero de ojos cansados.
ears|orejas|ɪrz|S|cor|4|The room between your ears.|La habitación entre tus orejas.
face|cara|feɪs|S|cor|5|Watch the game with your whole face.|Mira el juego con toda la cara.
voice|voz|vɔɪs|S|cor|5|Listen to their voice.|Escucha su voz.
heart|corazón|hɑːrt|S|cor|4|Warm hands, warm heart.|Manos cálidas, corazón cálido.
hair|pelo|hɛr|S|cor|4|My mom has long hair.|Mi mamá tiene pelo largo.
skin|piel|skɪn|S|cor|4|Look at the skin of the apple.|Mira la piel de la manzana.
weight|peso|weɪt|S|cor|4|Feel the weight of the cup.|Siente el peso de la taza.
shoulder|hombro|ˈʃoʊldər|S|cor|5|It's tight in the shoulders.|Queda ajustada en los hombros.
breathing|respiración (acción)|ˈbriːðɪŋ|S|cor|4|Monk breath, tourist feet.|Respiración de monje, pies de turista.
head|cabeza|hɛd|S|cor|5|Your head is on the pillow.|Tu cabeza está en la almohada.
arm|brazo|ɑːrm|S|cor|4|Let the arms swing.|Deja balancear los brazos.
leg|pierna|lɛɡ|S|cor|4|Legs like wood, walk like water.|Piernas de madera, camina como agua.
back|espalda|bæk|S|cor|4|A wall behind your back.|Una pared detrás de ti.
stomach|estómago|ˈstʌmək|S|cor|3|My stomach laughs too.|Mi estómago también ríe.
toe|dedo (del pie)|toʊ|S|cor|4|Touch your toes at halftime.|Toca tus pies en el descanso.
i|yo|aɪ|P|cmu|5|Hi! I'm Alex.|¡Hola! Soy Alex.
you|tú / usted|juː|P|cmu|5|How are you?|¿Cómo estás?
he|él|hiː|P|cmu|5|He's from Texas.|Él es de Texas.
she|ella|ʃiː|P|cmu|5|She's American.|Ella es estadounidense.
it|eso / ello (cosa, animal)|ɪt|P|cmu|5|It's a five-minute walk.|Está a cinco minutos a pie.
we|nosotros|wiː|P|cmu|5|We're students.|Somos estudiantes.
they|ellos|ðeɪ|P|cmu|5|They're my friends.|Son mis amigos.
me|mí / me|miː|P|cmu|5|Call me Alex.|Dime Alex.
my|mi|maɪ|P|cmu|5|My name is Alejandro.|Me llamo Alejandro.
your|tu / su|jʊr|P|cmu|5|What's your name?|¿Cómo te llamas?
his|su (de él)|hɪz|P|cmu|5|His name is Miguel.|Se llama Miguel.
her|su (de ella)|hɜːr|P|cmu|5|Her name is Carmen.|Se llama Carmen.
its|su (de cosa/animal)|ɪts|P|cmu|4|Its name is Luna.|Se llama Luna.
our|nuestro|ˈaʊər|P|cmu|5|Our dog is part of the family.|Nuestro perro es parte de la familia.
their|su (de ellos)|ðɛr|P|cmu|5|Their names are Daniela and Valeria.|Se llaman Daniela y Valeria.
this|este / esta|ðɪs|P|cmu|5|This is Jake.|Este es Jake.
that|ese / esa|ðæt|P|cmu|5|That's my father.|Ese es mi padre.
these|estos|ðiːz|P|cmu|5|These pants are too long.|Estos pantalones quedan muy largos.
those|esos|ðoʊz|P|cmu|4|Those are my friends.|Esos son mis amigos.
here|aquí|hɪr|D|tmp|5|You are here.|Estás aquí.
there|allí / ahí|ðɛr|D|tmp|5|There's a coffee shop across the street.|Hay una cafetería al otro lado.
where|dónde|wɛr|D|cmu|5|Where are you from?|¿De dónde eres?
when|cuándo|wɛn|D|tmp|5|When does the show start?|¿Cuándo empieza la función?
what|qué|wʌt|D|cmu|5|What time is it?|¿Qué hora es?
who|quién|huː|D|cmu|5|Who's this man?|¿Quién es este señor?
how|cómo|haʊ|D|cmu|5|How do I get to the library?|¿Cómo llego a la biblioteca?
why|por qué|waɪ|D|cmu|4|Why? Because servers live on tips.|¿Por qué? Porque los camareros viven de propinas.
which|cuál|wɪtʃ|D|cmu|4|Which one do you like?|¿Cuál te gusta?
yes|sí|jɛs|I|cmu|5|Yes, please!|¡Sí, por favor!
no|no|noʊ|D|cmu|5|No onions, please.|Sin cebolla, por favor.
not|no (negación)|nɑːt|D|cmu|5|I'm not tired.|No estoy cansado.
and|y|ænd|C|cnn|5|Coffee and toast.|Café y tostadas.
or|o|ɔːr|C|cnn|5|Card or cash?|¿Tarjeta o efectivo?
but|pero|bʌt|C|cnn|5|Small, but perfect.|Pequeño, pero perfecto.
because|porque|bɪˈkɔːz|C|cnn|5|I study English because my job needs it.|Estudio inglés porque mi trabajo lo necesita.
if|si|ɪf|C|cnn|4|If you are not sure, sleep on it.|Si no estás seguro, duerme el asunto.
so|así que / entonces|soʊ|C|cnn|4|It was tight, so I tried a large.|Quedaba ajustada, así que probé una L.
also|también|ˈɔːlsoʊ|D|cnn|4|I also speak English.|También hablo inglés.
too|también / demasiado|tuː|D|cnn|5|These pants are too long.|Estos pantalones quedan demasiado largos.
very|muy|ˈvɛri|D|cnn|5|Thank you very much!|¡Muchísimas gracias!
just|solo / justo|dʒʌst|D|cnn|4|Just yourself!|¡Solo tú!
even|hasta / incluso|ˈiːvən|D|cnn|4|There's even a small balcony.|Hasta hay un balcón pequeño.
only|solo|ˈoʊnli|D|cnn|4|Only warm bread and you.|Solo pan tibio y tú.
about|sobre / acerca de|əˈbaʊt|R|cnn|5|We talk about classes.|Hablan de las clases.
of|de|ʌv|R|cnn|5|A friend of mine.|Un amigo mío.
in|en|ɪn|R|cnn|5|I live in Boston.|Vivo en Boston.
on|en (superficie, calles)|ɑːn|R|cnn|5|The café is on the corner.|El café está en la esquina.
at|en (puntos: horas, lugares)|æt|R|cnn|5|Classes start at 8.|Las clases empiezan a las 8.
to|a / para|tuː|R|cnn|5|A ticket to New York.|Un billete a Nueva York.
for|para / por|fɔːr|R|cnn|5|Thanks for your help.|Gracias por tu ayuda.
from|de (origen)|frʌm|R|cnn|5|I'm from Peru.|Soy de Perú.
with|con|wɪð|R|cnn|5|Coffee with milk.|Café con leche.
without|sin|wɪˈðaʊt|R|cnn|4|Ten minutes without screens.|Diez minutos sin pantallas.
by|por / en (medio)|baɪ|R|cnn|4|By train or by plane?|¿En tren o en avión?
near|cerca de|nɪr|R|cit|5|It's near the courthouse.|Está cerca del juzgado.
next to|al lado de|nɛkst tuː|R|cit|5|Aisle 5, next to the jams.|Pasillo 5, junto a las mermeladas.
across from|enfrente de|əˈkrɔːs frʌm|R|cit|4|The pharmacy is across from the bank.|La farmacia está enfrente del banco.
between|entre|bɪˈtwiːn|R|cit|5|Between the park and the bank.|Entre el parque y el banco.
behind|detrás de|bɪˈhaɪnd|R|cit|4|A wall behind your back.|Una pared detrás de ti.
in front of|delante de|ɪn frʌnt ʌv|R|cit|4|The river of people flows in front of you.|El río de gente fluye delante de ti.
under|debajo|ˈʌndər|R|cit|4|The farmer works under the sun.|El agricultor trabaja bajo el sol.
over|más de / sobre|ˈoʊvər|R|cnn|4|The smell travels over the cup.|El aroma viaja sobre la taza.
into|dentro de / hacia|ˈɪntuː|R|cnn|4|I'm really into hiking.|Me apasiona el senderismo.
up|arriba|ʌp|D|cit|5|Shoulders up? Let them down.|¿Hombros arriba? Déjalos caer.
down|abajo|daʊn|D|cit|5|Let the shoulders down.|Deja caer los hombros.
left|izquierda|lɛft|A|cit|5|Turn left on 6th Street.|Gira a la izquierda en la 6th.
right|derecha|raɪt|A|cit|5|It's on your right.|Queda a tu derecha.
straight|recto|streɪt|D|cit|5|Go straight for two blocks.|Sigue recto dos cuadras.
together|juntos|təˈɡɛðər|D|rel|5|The miles together.|Las millas compartidas.
inside|adentro|ɪnˈsaɪd|D|cit|4|A quiet room inside.|Una habitación silenciosa adentro.
outside|afuera|ˌaʊtˈsaɪd|D|cit|4|The noise continues outside.|El ruido sigue afuera.
home|casa (hogar)|hoʊm|S|cas|5|Come home soon!|¡Ven a casa pronto!
every|cada|ˈɛvri|D|cnn|5|Every morning I grab a coffee.|Cada mañana tomo un café.
some|alguno / algo de|sʌm|D|cmu|5|I have some coupons.|Tengo algunos cupones.
any|alguno (neg./preg.)|ˈɛni|D|cmu|5|Do you have any bread?|¿Tienen pan?
more|más|mɔːr|A|cnn|5|Would you like some more coffee?|¿Quieres más café?
most|la mayoría|moʊst|D|cnn|4|Most stores give you 30 days.|La mayoría de tiendas da 30 días.
much|mucho (incont.)|mʌtʃ|D|cmu|5|How much is it?|¿Cuánto es?
many|muchos|ˈmɛni|D|cmu|5|How many eggs do we need?|¿Cuántos huevos necesitamos?
one|uno|wʌn|N|tmp|5|One ticket, please.|Una entrada, por favor.
two|dos|tuː|N|tmp|5|Two coffees, please.|Dos cafés, por favor.
three|tres|θriː|N|tmp|5|Three breaths before bed.|Tres respiraciones antes de dormir.
four|cuatro|fɔːr|N|tmp|4|About four hours.|Unas cuatro horas.
five|cinco|faɪv|N|tmp|4|Five minutes to eight.|Cinco para las ocho.
six|seis|sɪks|N|tmp|4|It's 6:30 a. m.|Son las 6:30 a. m.
seven|siete|ˈsɛvən|N|tmp|4|Seven days a week.|Siete días a la semana.
eight|ocho|eɪt|N|tmp|4|Classes start at 8.|Las clases empiezan a las 8.
nine|nueve|naɪn|N|tmp|4|Aisle nine.|Pasillo nueve.
ten|diez|tɛn|N|tmp|4|Ten minutes without screens.|Diez minutos sin pantallas.
eleven|once|ɪˈlɛvən|N|tmp|3|Gate eleven.|Puerta once.
twelve|doce|twɛlv|N|tmp|4|Half past twelve.|Las doce y media.
twenty|veinte|ˈtwɛnti|N|tmp|4|Twenty minutes early.|Veinte minutos antes.
thirty|treinta|ˈθɜːrti|N|tmp|4|Thirty seconds of respect.|Treinta segundos de respeto.
forty|cuarenta|ˈfɔːrti|N|tmp|3|Forty things in the cart.|Cuarenta cosas en el carrito.
fifty|cincuenta|ˈfɪfti|N|tmp|3|Fifty dollars a night.|Cincuenta dólares la noche.
hundred|cien / ciento|ˈhʌndrəd|N|fin|4|A hundred questions.|Cien preguntas.
thousand|mil|ˈθaʊzənd|N|fin|4|Ten thousand steps.|Diez mil pasos.
million|millón|ˈmɪljən|N|fin|4|Millions of steps.|Millones de pasos.
first|primero|fɜːrst|N|tmp|5|The first bite.|El primer bocado.
third|tercero|θɜːrd|N|tmp|4|Third Street.|La calle Tercera.
half|media / mitad|hæf|N|tmp|4|Half a pound of turkey.|Media libra de pavo.
quarter|cuarto|ˈkwɔːrtər|N|tmp|4|Quarter past nine.|Las nueve y cuarto.
percent|por ciento|pərˈsɛnt|N|fin|5|The tip is 18 percent.|La propina es del 18 %.
dollar|dólar|ˈdɑːlər|S|fin|5|That's five dollars.|Son cinco dólares.
cent|centavo|sɛnt|S|fin|4|Ninety-nine cents.|Noventa y nueve centavos.
pound|libra (peso)|paʊnd|S|fin|4|A five-pound bag of rice.|Una bolsa de arroz de cinco libras.
gallon|galón|ˈɡælən|S|fin|4|A gallon of milk.|Un galón de leche.
dozen|docena|ˈdʌzən|S|fin|4|A dozen eggs.|Una docena de huevos.
mile|milla|maɪl|S|tra|4|Ten miles away.|A diez millas.
everything|todo|ˈɛvriθɪŋ|P|ast|5|Everything was delicious.|Todo estuvo delicioso.
something|algo|ˈsʌmθɪŋ|P|cmu|5|Something to drink?|¿Algo de tomar?
nothing|nada|ˈnʌθɪŋ|P|ast|5|Nothing else exists.|Nada más existe.
someone|alguien|ˈsʌmwʌn|P|rel|4|Ask someone for directions.|Pide direcciones a alguien.
nobody|nadie|ˈnoʊbɑːdi|P|rel|4|Nobody parks inside!|¡Nadie estaciona adentro!
one way|solo ida|wʌn weɪ|E|tra|4|One way or round trip?|¿Solo ida o ida y vuelta?
round trip|ida y vuelta|raʊnd trɪp|E|tra|4|A round-trip ticket.|Un billete de ida y vuelta.
for here|para aquí|fɔːr hɪr|E|ris|5|For here or to go?|¿Para aquí o para llevar?
to go|para llevar|tə ɡoʊ|E|ris|5|To go, please.|Para llevar, por favor.
on sale|en oferta|ɑn seɪl|E|cmp|4|It's on sale today.|Está en oferta hoy.
paper or plastic|¿papel o plástico?|ˈpeɪpər ɔːr ˈplæstɪk|E|cmp|4|Paper or plastic? — Paper, please.|¿Papel o plástico? — Papel, por favor.
all set|todo listo|ɔːl sɛt|E|cmu|4|All set! Have a nice day!|¡Todo listo! ¡Que tengas un buen día!
have a nice day|que tengas un buen día|hæv ə naɪs deɪ|E|sal|5|Have a nice day! — You too!|¡Que tengas un buen día! — ¡Tú también!
here you go|aquí tiene|hɪr juː ɡoʊ|E|cmu|5|Here you go.|Aquí tiene.
come back|volver|kʌm bæk|V|tra|4|Come back any time!|¡Vuelve cuando quieras!
pass the salt|pásame la sal|pæs ðə sɔːlt|E|ris|3|Pass the salt, please.|Pásame la sal, por favor.
take out|sacar (fuera)|teɪk aʊt|V|cas|3|Take out the trash on Mondays.|Saca la basura los lunes.
turn on|encender|tɜːrn ɑːn|V|tec|4|Turn on the subtitles.|Enciende los subtítulos.
turn off|apagar|tɜːrn ɔːf|V|tec|4|Turn off your phone at the table.|Apaga el teléfono en la mesa.
pick up|recoger|pɪk ʌp|V|tra|4|I pick up my friends at 8.|Recojo a mis amigos a las 8.
grow up|crecer|ɡroʊ ʌp|V|fam|4|I grew up in Lima.|Crecí en Lima.
show up|aparecer|ʃoʊ ʌp|V|rel|3|He shows up with six-packs.|Aparece con seis paquetes.
slow down|desacelerar|sloʊ daʊn|V|tra|3|Slow down in the city.|Desacelera en la ciudad.
let go|soltar|lɛt ɡoʊ|V|cor|4|Let go of the stress.|Suelta el estrés.
hold on|esperar / aguantar|hoʊld ɑːn|V|cmu|4|Hold on a second.|Aguanta un segundo.
look for|buscar|lʊk fɔːr|V|cmp|5|I'm looking for a jacket.|Busco una chaqueta.
look at|mirar|lʊk æt|V|per|5|Look at your face in the mirror.|Mira tu cara en el espejo.
look like|parecerse a|lʊk laɪk|V|rel|4|You look like a tourist.|Pareces turista.
find out|averiguar|faɪnd aʊt|V|cmu|3|Find out the price first.|Averigua el precio primero.
give up|rendirse|ɡɪv ʌp|V|emo|3|Don't give up on A2!|¡No te rindas con el A2!
end up|terminar (por)|ɛnd ʌp|V|ast|3|We end up laughing.|Terminamos riendo.
hang up|colgar|hæŋ ʌp|V|tec|3|Grandma hangs up after an hour.|La abuela cuelga tras una hora.
check out|revisar / mirar|tʃɛk aʊt|V|cmp|3|Check out the bakery section.|Mira la sección de panadería.
run out|quedarse sin|rʌn aʊt|V|fin|3|We run out of milk.|Nos quedamos sin leche.
be into|estar apasionado por|bi ˈɪntuː|E|sve|4|I'm really into hiking.|Me apasiona el senderismo.
be back|volver|bi bæk|E|tra|4|I'll be right back with your food.|Ya vuelvo con su comida.
be over|haber terminado|bi ˈoʊvər|E|tmp|4|The day is over at midnight.|El día termina a medianoche.
stay up|trasnochar|steɪ ʌp|V|cor|3|We stay up for the game.|Trasnochamos para el partido.
sleep in|dormir hasta tarde|sliːp ɪn|V|cor|4|I sleep in on Sundays.|Duermo hasta tarde los domingos.
eat out|comer fuera|iːt aʊt|V|ris|4|We eat out on Fridays.|Comemos fuera los viernes.
drop off|dejar (a alguien)|drɑp ɔːf|V|tra|3|Drop me off at the corner.|Déjame en la esquina.
get to|llegar a|ɡɛt tuː|V|tra|5|How do I get to Times Square?|¿Cómo llego a Times Square?
go out|salir (de casa)|ɡoʊ aʊt|V|sve|4|We go out for pizza.|Salimos por pizza.
go by|pasar (tiempo/transporte)|ɡoʊ baɪ|V|tmp|4|The hours go by fast.|Las horas pasan rápido.
come in|entrar|kʌm ɪn|V|cas|4|Come in, the door is open.|Pasa, la puerta está abierta.
come over|venir (a casa)|kʌm ˈoʊvər|V|rel|4|Come over for dinner!|¡Ven a cenar!
sit down|sentarse|sɪt daʊn|V|cor|5|Sit down and close your eyes.|Siéntate y cierra los ojos.
stand up|ponerse de pie|stænd ʌp|V|cor|4|Stand up for the anthem.|Párate para el himno.
turn around|darse la vuelta|tɜːrn əˈraʊnd|V|cor|4|Turn around slowly.|Gira despacio.
count|contar|kaʊnt|V|sci|4|Count the streets.|Cuenta las calles.
measure|medir|ˈmɛʒər|V|sci|4|Houses are measured in square feet.|Las casas se miden en pies cuadrados.
park (verb)|estacionar|pɑːrk|V|tra|4|Nobody parks inside the garage.|Nadie estaciona adentro del garaje.
miss|extrañar / perder|mɪs|V|emo|4|I miss my family in Lima.|Extraño a mi familia en Lima.
mean|significar|miːn|V|cmu|4|What does it mean?|¿Qué significa?
believe|creer|bɪˈliːv|V|emo|4|Don't believe the map too much.|No creas demasiado en el mapa.
remember|recordar|rɪˈmɛmbər|V|cor|5|Remember: the tip is 15-20 percent.|Recuerda: la propina es del 15-20 %.
forget|olvidar|fərˈɡɛt|V|cor|4|Don't forget the receipt.|No olvides el recibo.
prefer|preferir|prɪˈfɜːr|V|emo|4|I prefer paper bags.|Prefiero bolsas de papel.
enjoy|disfrutar|ɛnˈdʒɔɪ|V|emo|4|Enjoy the calm.|Disfruta la calma.
share|compartir|ʃɛr|V|rel|4|We share a pretzel at the food court.|Compartimos un pretzel en la corte de comida.
offer|ofrecer|ˈɔːfər|V|cmu|4|Stores offer free refills.|Las tiendas ofrecen rellenos gratis.
receive|recibir|rɪˈsiːv|V|cmu|3|Receive help with gratitude.|Recibe ayuda con gratitud.
add|agregar|æd|V|fin|4|They add the tax at the register.|Agregan el impuesto en la caja.
double|duplicar|ˈdʌbəl|V|fin|3|Double the tax and you get the tip.|Duplica el tax y tienes la propina.
split|dividir|splɪt|V|fin|3|We split the check three ways.|Dividimos la cuenta en tres.
earn|ganar|ɜːrn|V|lav|4|Servers earn a small base wage.|Los camareros ganan un sueldo base bajo.
rent|alquiler|rɛnt|S|fin|4|The rent is a lot in California.|El alquiler es mucho en California.
lease|contrato de alquiler|liːs|S|fin|3|I sign the lease on Friday.|Firmo el contrato el viernes.
landlord|casero|ˈlændlɔːrd|S|fin|3|The landlord allows pets.|El casero permite mascotas.
candle|vela|ˈkændəl|S|cas|3|Altars require candles.|Los altares requieren velas.
prayer|oración|prɛr|S|ast|3|A complete prayer takes two seconds.|Una oración completa tarda dos segundos.
ritual|ritual|ˈrɪtʃuəl|S|ast|4|Choosing an apple like a ritual.|Elegir una manzana como un ritual.
tradition|tradición|trəˈdɪʃən|S|ast|4|In many traditions, people bless the food.|En muchas tradiciones, la gente bendice la comida.
temple|templo|ˈtɛmpəl|S|art|4|Home is the first temple.|La casa es el primer templo.
altar|altar|ˈɔːltər|S|art|3|The altar begins at home.|El altar empieza en casa.
church|iglesia|tʃɜːrtʃ|S|art|3|A quiet church after work.|Una iglesia tranquila después del trabajo.
`);
/* v9.41 · base A1-B1 + pack plus B1-C2 (nivel explícito): diccionario completo */
export const EN_DICT: VocabWord[] = dedupMerge(EN_DICT_BASE, EN_PLUS, EN_MEGA);
export const EN_DICT_COUNT = EN_DICT.length;
