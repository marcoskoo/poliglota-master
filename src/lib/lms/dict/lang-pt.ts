import type { VocabWord, WordType, WordCategory } from "../types";
import { PT_PLUS } from "./lang-pt-plus";
import { PT_MEGA } from "./lang-pt-mega";
import { dedupMerge } from "./mega-parse";

/* ═══ PT Dictionary · português europeu → español (A1-A2) ══════════════
   Formato de líneas: word|es|ipa|T|cat|freq|exPt|exEs[|p=plural;n=note;ff=1]
   · T → S sustantivo · V verbo · A adjetivo · D adverbio · E expresión
         P pronombre · R preposición · C conjunción · T artículo
         N numeral · I interjección · L locución
   · cat → código temático (igual que el italiano)
   · p= plural irregular · n= nota contrastiva · ff= falso amigo PT-ES
   · Campos `.it` = portugués (lengua de estudio), `.es` = español.     */

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

function parsePt(lines: string): VocabWord[] {
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
      id: `pt-${f[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
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

const PT_DICT_BASE: VocabWord[] = parsePt(`
olá|hola|ɔˈla|I|sal|5|Olá! Como te chamas?|¡Hola! ¿Cómo te llamas?
bom dia|buenos días|bõ ˈdiɐ|L|sal|5|Bom dia, o senhor!|¡Buenos días, señor!
boa tarde|buenas tardes|ˈboɐ ˈtaɾdɨ|L|sal|5|Boa tarde! Deseja algo?|¡Buenas tardes! ¿Desea algo?
boa noite|buenas noches|ˈboɐ ˈnɔjtɨ|L|sal|5|Boa noite, até amanhã.|Buenas noches, hasta mañana.
adeus|adiós|ɐˈdewʃ|I|sal|4|Adeus, boa viagem!|Adiós, ¡buen viaje!
até logo|hasta luego|ɐˈtɛ ˈloɡu|L|sal|5|Até logo, Marta!|Hasta luego, ¡Marta!
até amanhã|hasta mañana|ɐˈtɛ ɐˈmɐ̃ɲɐ|L|sal|5|Até amanhã na aula!|¡Hasta mañana en clase!
tchau|chao|tʃaw|I|sal|4|Tchau, até já!|¡Chao, hasta ahora!
muito prazer|mucho gusto|ˈmujtu prɐˈzeɾ|L|sal|5|Muito prazer, Alex!|Mucho gusto, ¡Alex!
obrigado|gracias (habla un hombre)|obɾiˈɡadu|I|cmu|5|Obrigado pela ajuda!|¡Gracias por la ayuda!
obrigada|gracias (habla una mujer)|obɾiˈɡadɐ|I|cmu|5|Obrigada, senhora!|¡Gracias, señora!
não tem de quê|de nada|nɐ̃w̃ tɐ̃j̃ dɨ kɛ|L|cmu|4|— Obrigado! — Não tem de quê!|— ¡Gracias! — ¡De nada!
desculpe|disculpe|dɨʃˈkulpɨ|I|cmu|5|Desculpe, onde é o provador?|Disculpe, ¿dónde está el probador?
por favor|por favor|puɾ fɐˈvoɾ|L|cmu|5|Um café, por favor.|Un café, por favor.
com licença|con permiso|kõ liˈsẽsɐ|L|cmu|4|Com licença, passo.|Con permiso, paso.
tudo bem?|¿qué tal? / ¿todo bien?|ˈtudu bɐ̃j̃|E|sal|5|Olá! Tudo bem?|¡Hola! ¿Qué tal?
tudo bem (resposta)|todo bien|ˈtudu bɐ̃j̃|E|sal|4|Tudo bem, obrigado!|Todo bien, ¡gracias!
nome|nombre|ˈnomɨ|S|cmu|5|O meu nome é Alejandro.|Me llamo Alejandro.
chamar-se|llamarse|ʃɐˈmaɾ-sɨ|V|cmu|5|Como te chamas?|¿Cómo te llamas?
amigo|amigo|ɐˈmiɡu|S|rel|5|Este é o meu amigo Rui.|Este es mi amigo Rui.
amiga|amiga|ɐˈmiɡɐ|S|rel|5|Ela é minha amiga.|Ella es mi amiga.
estudante|estudiante|ɨʃtuˈdɐ̃tɨ|S|stu|5|Sou estudante de português.|Soy estudiante de português.
professor|profesor|pɾufɛˈsoɾ|S|pro|5|O professor é português.|El profesor es português.
professora|profesora|pɾufɛˈsoɾɐ|S|pro|5|A professora chama-se Helena.|La profesora se llama Helena.
turma|clase (grupo)|ˈtuɾmɐ|S|stu|4|A minha turma é divertida.|Mi clase es divertida.
aula|clase (lección)|ˈawlɐ|S|stu|5|A aula começa às nove.|La clase empieza a las nueve.
universidade|universidad|univɨɾsidɐˈdɨ|S|stu|4|Estudo na universidade.|Estudio en la universidad.
escola|escuela|ɨʃˈkɔlɐ|S|stu|4|A escola fica perto.|La escuela queda cerca.
biblioteca|biblioteca|bibliɔˈtɛkɐ|S|stu|4|Trabalho na biblioteca.|Trabajo en la biblioteca.
livraria|librería|liˈvrɐjɐ|S|stu|3|A livraria abre às dez.|La librería abre a las diez.
família|familia|fɐˈmiliɐ|S|fam|5|A minha família é grande.|Mi familia es grande.
pai|padre|pajʃ|S|fam|5|O meu pai é engenheiro.|Mi padre es ingeniero.
mãe|madre|mɐ̃j̃|S|fam|5|A minha mãe é professora.|Mi madre es profesora.
pais|padres|pajʃ|S|fam|5|Os meus pais moram em Lima.|Mis padres viven en Lima.|n=«pais» = padres; «país» (con acento) = nación
irmão|hermano|iɾˈmɐ̃w̃|S|fam|5|Tenho dois irmãos.|Tengo dos hermanos.
irmã|hermana|iɾˈmɐ̃|S|fam|5|A minha irmã estuda medicina.|Mi hermana estudia medicina.
avó|abuelo/a|ɐˈvɔ|S|fam|5|Almoço com os meus avós.|Almuerzo con mis abuelos.
avós|abuelos|ɐˈvɔʃ|S|fam|4|Os avós moram em Gaia.|Los abuelos viven en Gaia.
tio|tío|ˈtiu|S|fam|4|O meu tio é do Porto.|Mi tío es de Oporto.
tia|tía|ˈtiɐ|S|fam|4|A tia Beatriz cozinha bem.|La tía Beatriz cocina bien.
primo|primo|ˈpɾimu|S|fam|4|Os primos vêm ao domingo.|Los primos vienen el domingo.
filho|hijo|ˈfiʎu|S|fam|5|O filho mais velho estuda.|El hijo mayor estudia.
filha|hija|ˈfiʎɐ|S|fam|5|Tenho uma filha única.|Tengo una hija única.
casado|casado|kɐˈzadu|A|fam|3|É casado com a Ana.|Está casado con Ana.
solteiro|soltero|sulˈtejɾu|A|fam|3|Sou solteiro.|Estoy soltero.
casar-se|casarse|kɐˈzaɾ-sɨ|V|fam|3|Vão casar em junho.|Se casan en junio.
filho único|hijo único|ˈfiʎu ˈuniku|L|fam|4|Sou filho único.|Soy hijo único.
gato|gato|ˈɡatu|S|ani|5|O gato dorme ao sol.|El gato duerme al sol.
gata|gata|ˈɡatɐ|S|ani|4|A gata chama-se Lua.|La gata se llama Lua.
cão|perro|kɐ̃w̃|S|ani|4|O cão do vizinho late.|El perro del vecino ladra.|p=cães
animal de estimação|mascota|ɐniˈmal dɨ ɨʃtimɐˈsɐ̃w̃|L|ani|3|Têm animais de estimação?|¿Tienen mascotas?
dia|día|ˈdiɐ|S|tmp|5|Bom dia! Que dia é hoje?|¡Buen día! ¿Qué día es hoy?
semana|semana|sɨˈmɐnɐ|S|tmp|5|Trabalho de segunda a sexta.|Trabajo de lunes a viernes.
fim de semana|fin de semana|fĩ dɨ sɨˈmɐnɐ|S|tmp|5|O que fazes ao fim de semana?|¿Qué haces el finde?
manhã|mañana|mɐˈɲɐ̃|S|tmp|5|De manhã tomo um galão.|Por la mañana tomo un galão.
tarde|tarde|ˈtaɾdɨ|S|tmp|5|À tarde, estudo.|Por la tarde, estudio.
noite|noche|ˈnɔjtɨ|S|tmp|5|À noite, janto em casa.|Por la noche, ceno en casa.
hoje|hoy|ˈɔʒɨ|D|tmp|5|Hoje há sopa de legumes.|Hoy hay sopa de verduras.
ontem|ayer|õˈtɐ̃j̃|D|tmp|4|Ontem fui ao mercado.|Ayer fui al mercado.
amanhã|mañana (futuro)|ɐˈmɐ̃ɲɐ|D|tmp|5|Amanhã vou ao Porto.|Mañana voy a Oporto.
agora|ahora|ɐˈɡoɾɐ|D|tmp|5|Agora estou a estudar.|Ahora estoy estudiando.
hora|hora|ˈɔɾɐ|S|tmp|5|A que horas te levantas?|¿A qué hora te levantas?
a que horas|a qué hora|ɐ kɨ ˈɔɾɐʃ|E|tmp|5|A que horas parte o comboio?|¿A qué hora sale el tren?
meia-noite|medianoche|ˈmɐjɐ ˈnɔjtɨ|S|tmp|4|Deito-me à meia-noite.|Me acuesto a medianoche.
meio-dia|mediodía|ˈmju duˈiɐ|S|tmp|4|Almoço ao meio-dia.|Almuerzo al mediodía.
cedo|temprano|ˈseðu|D|tmp|4|Acordo muito cedo.|Me despierto muy temprano.
tarde (adv)|tarde|ˈtaɾdɨ|D|tmp|4|Cheguei tarde a casa.|Llegué tarde a casa.
sempre|siempre|ˈsɛmpɾɨ|D|tmp|5|Sempre tomo café.|Siempre tomo café.
às vezes|a veces|aʃ ˈvɛzɨʃ|L|tmp|5|Às vezes janto fora.|A veces ceno fuera.
nunca|nunca|ˈnũkɐ|D|tmp|5|Nunca como bacalhau salgado.|Nunca como bacalao salado.
quase nunca|casi nunca|ˈkwa.zɨ ˈnũkɐ|L|tmp|3|Quase nunca vejo televisão.|Casi nunca veo la tele.
primeiro|primero|pɾiˈmejɾu|D|tmp|5|Primeiro, a sopa.|Primero, la sopa.
depois|después|dɨˈpojʃ|D|tmp|5|Depois, o prato principal.|Después, el plato principal.
antes|antes|ˈɐ̃tɨʃ|D|tmp|4|Antes de dormir, leio.|Antes de dormir, leo.
enquanto|mientras|ẽˈkwɐ̃tu|C|tmp|3|Enquanto espero, leio.|Mientras espero, leo.
casa|casa|ˈkazɐ|S|cas|5|A minha casa é pequena.|Mi casa es pequeña.
apartamento|apartamento|ɐpɐɾtɐˈmẽtu|S|cas|5|Alugo um apartamento T2.|Alquilo un apartamento T2.
T2|piso de dos dormitorios|te ˈdojʃ|S|cas|4|O T2 tem varanda.|El T2 tiene balcón.
sala|salón|ˈsalɐ|S|cas|5|A sala é grande e luminosa.|El salón es grande y luminoso.
quarto|dormitorio|ˈkwaɾtu|S|cas|5|O quarto tem vista para o rio.|El dormitorio tiene vistas al río.
cozinha|cocina|kuˈzĩɲɐ|S|cas|5|A cozinha tem azulejos.|La cocina tiene azulejos.
casa de banho|cuarto de baño|ˈkazɐ dɨ ˈbɐ̃ɲu|L|cas|5|Onde está a casa de banho?|¿Dónde está el baño?|n=en Brasil es «banheiro»
corredor|pasillo|kuˈʁeðoɾ|S|cas|4|A casa de banho está no corredor.|El baño está en el pasillo.
janela|ventana|ʒɨˈnɛlɐ|S|cas|5|Abre a janela, por favor.|Abre la ventana, por favor.
porta|puerta|ˈpɔɾtɐ|S|cas|5|A porta está aberta.|La puerta está abierta.
varanda|balcón|vɐˈʁɐ̃dɐ|S|cas|4|Há roupa na varanda.|Hay ropa en el balcón.
escada|escalera|ɨʃˈkaðɐ|S|cas|4|A escada é estreita.|La escalera es estrecha.
elevador|ascensor|elɨvɐˈðoɾ|S|cas|4|O prédio não tem elevador.|El edificio no tiene ascensor.
andar|piso (altura)|ɐˈdaɾ|S|cas|4|Moro no terceiro andar.|Vivo en el tercer piso.
prédio|edificio|ˈpɾɛðju|S|cas|4|O prédio é antigo.|El edificio es antiguo.|ff=1; n=«prédio» = edificio, no «predio» rural
arrendamento|alquiler|ɐʁẽðɐˈmẽtu|S|cas|3|O arrendamento é caro em Lisboa.|El alquiler es caro en Lisboa.
renda|alquiler (mensual)|ˈʁẽdɐ|S|cas|4|A renda é de quinhentos euros.|El alquiler es de quinientos euros.
arrendar|alquilar|ɐʁẽˈdaɾ|V|cas|3|Queremos arrendar um T1.|Queremos alquilar un T1.
morar|vivir (residir)|muˈɾaɾ|V|cas|5|Moro em Lisboa.|Vivo en Lisboa.|n=«morar» = residir; «viver» = vivir (existir)
vizinho|vecino|viˈzĩɲu|S|rel|4|O vizinho é muito simpático.|El vecino es muy simpático.
azulejo|azulejo|ɐzuˈleʒu|S|art|4|A cozinha tem azulejos azuis.|La cocina tiene azulejos azules.
móvel|mueble|ˈmɔvɛɫ|S|cas|3|Os móveis são novos.|Los muebles son nuevos.
mesa|mesa|ˈmezɐ|S|cas|5|A mesa está posta.|La mesa está puesta.
cadeira|silla|kɐˈdejɾɐ|S|cas|5|Senta-te nesta cadeira.|Siéntate en esta silla.
cama|cama|ˈkɐmɐ|S|cas|5|A cama é confortável.|La cama es cómoda.
sofá|sofá|suˈfa|S|cas|4|O gato dorme no sofá.|El gato duerme en el sofá.
pequeno-almoço|desayuno|pɨˈkenu aɫˈmɐjzu|S|ali|5|Tomo o pequeno-almoço às oito.|Desayuno a las ocho.|n=en Brasil es «café da manhã»
almoço|almuerzo|ɐɫˈmuʃu|S|ali|5|O almoço é ao meio-dia.|El almuerzo es al mediodía.
jantar|cena|ʒɐˈnaɾ|S|ali|5|O jantar é às nove.|La cena es a las nueve.
lanche|merienda|ˈlɐ̃ʃɨ|S|ali|3|As crianças tomam um lanche.|Los niños toman una merienda.
comida|comida|kuˈmiðɐ|S|ali|5|A comida portuguesa é boa.|La comida portuguesa es buena.
sopa|sopa|ˈsɔpɐ|S|ali|5|Sempre há sopa em Portugal.|Siempre hay sopa en Portugal.
pão|pan|pɐ̃w̃|S|ali|5|Um pão quente, por favor.|Un pan caliente, por favor.
queijo|queso|ˈkejʒu|S|ali|5|O queijo da serra é famoso.|El queso da serra es famoso.
ovos|huevos|ˈɔvuʃ|S|ali|5|Queria meia dúzia de ovos.|Quería media docena de huevos.
fruta|fruta|ˈfɾutɐ|S|ali|5|Como fruta todos os dias.|Como fruta todos los días.
laranja|naranja|lɐˈʁɐ̃ʒɐ|S|ali|5|Um quilo de laranjas, por favor.|Un kilo de naranjas, por favor.
maçã|manzana|mɐˈsɐ̃w̃|S|ali|5|A maçã está doce.|La manzana está dulce.|ff=1; n=«massa» = masa/pasta; «maçã» = manzana
banana|banana|bɐˈnɐnɐ|S|ali|4|A banana está madura.|El plátano está maduro.
tomate|tomate|tuˈmatɨ|S|ali|5|Salada de tomate, por favor.|Ensalada de tomate, por favor.
batata|patata|bɐˈtatɐ|S|ali|5|Batatas fritas para dois.|Patatas fritas para dos.
arroz|arroz|ɐˈʁɔʃ|S|ali|5|Arroz de marisco, por favor.|Arroz con marisco, por favor.
peixe|pescado|ˈpejʃɨ|S|ali|5|Hoje há peixe fresco.|Hoy hay pescado fresco.
bacalhau|bacalao|bɐkɐˈʎaw|S|ali|5|Bacalhau à Brás é uma especialidade.|Bacalao à Brás es una especialidad.
sardinha|sardina|sɐɾˈdĩɲɐ|S|ali|4|Sardinha assada em junho.|Sardina asada en junio.
polvo|pulpo|ˈpɔlvu|S|ali|3|Polvo à lagareiro.|Pulpo à lagareiro.
frango|pollo|ˈfɾɐ̃ɡu|S|ali|4|Frango assado para o jantar.|Pollo asado para la cena.
carne|carne|ˈkaɾnɨ|S|ali|5|Não como carne.|No como carne.
azeite|aceite|ɐˈzejtɨ|S|ali|5|Meio litro de azeite.|Medio litro de aceite.
leite|leche|ˈlɐjtɨ|S|ali|5|Um café com leite.|Un café con leche.
manteiga|mantequilla|mɐ̃ˈtejɡɐ|S|ali|4|Pão com manteiga.|Pan con mantequilla.
sal|sal|saɫ|S|ali|5|Sem sal, por favor.|Sin sal, por favor.
açúcar|azúcar|ɐˈsukaɾ|S|ali|4|Um pouco de açúcar.|Un poco de azúcar.
água|agua|ˈaɡwɐ|S|ali|5|Uma água fresca, por favor.|Un agua fresca, por favor.
vinho|vino|ˈvinu|S|ali|5|Um vinho tinto do Douro.|Un vino tinto del Douro.
vinho verde|vino verde (joven)|ˈvinu ˈveɾðɨ|L|ali|4|Um vinho verde do Minho.|Un vino verde del Miño.
sumo|zumo|ˈsumu|S|ali|5|Um sumo de laranja natural.|Un zumo de naranja natural.
café|café / espresso|kɐˈfɛ|S|ris|5|Um café no balcão.|Un café en el mostrador.
galão|café con leche (en vaso)|ɡɐˈlɐ̃w̃|S|ris|4|Tomo um galão de manhã.|Tomo un galão por la mañana.
meia de leite|café con leche (mitad y mitad)|ˈmɐjɐ dɨ ˈlɐjtɨ|L|ris|4|Uma meia de leite, por favor.|Un café con leche, por favor.
pastel de nata|tarta de crema portuguesa|pɐʃˈtɛɫ dɨ ˈnatɐ|L|ris|5|Dois pastéis de nata, por favor.|Dos pasteles de nata, por favor.
tosta mista|tosta mixta|ˈtɔʃtɐ ˈmiʃtɐ|L|ris|4|Uma tosta mista e um galão.|Una tosta mixta y un galão.
casa de fado|casa de fado|ˈkazɐ dɨ ˈfaðu|L|sve|3|Jantámos numa casa de fado.|Cenamos en una casa de fado.
tasca|tasca (taberna)|ˈtaʃkɐ|S|ris|4|A tasca da esquina é típica.|La tasca de la esquina es típica.
ementa|carta / menú|ɨˈmẽtɐ|S|ris|5|A ementa do dia, por favor.|El menú del día, por favor.
prato do dia|plato del día|ˈpɾatu du ˈdiɐ|L|ris|5|Qual é o prato do dia?|¿Cuál es el plato del día?
conta|cuenta|ˈkõtɐ|S|ris|5|A conta, por favor.|La cuenta, por favor.
couvert|couvert (pan, manteiga e azeitonas)|kuˈvɛɾt|S|ris|4|O couvert já chegou à mesa.|El couvert ya llegó a la mesa.|n=se cobra si se consume
serviço|servicio|sɛɾˈvisiu|S|ris|4|O serviço está incluído.|El servicio está incluido.
empregado|camarero|ẽpɾɨˈɡaðu|S|pro|5|O empregado anota o pedido.|El camarero anota el pedido.
propina|propina (en la universidad)|pɾuˈpinɐ|S|ist|2|A propina da universidade.|La matrícula de la universidad.
gorjeta|propina (restaurante)|ɡoɾˈʒetɐ|S|ris|3|Não é obrigatório deixar gorjeta.|No es obligatorio dejar propina.
restaurante|restaurante|ʁɛʃtuˈʁɐ̃tɨ|S|ris|5|O restaurante fica na esquina.|El restaurante está en la esquina.
pastelaria|pastelería|pɐʃtɨˈlaɾiɐ|S|ris|5|A pastelaria abre às sete.|La pastelería abre a las siete.
balcão|mostrador|baɫˈkɐ̃w̃|S|ris|4|Bebo o café no balcão.|Bebo el café en el mostrador.
para levar|para llevar|ˈpaɾɐ lɨˈvaɾ|L|ris|5|É para levar, por favor.|Es para llevar, por favor.
para beber aqui|para tomar aquí|ˈpaɾɐ bɨˈbeɾ ɐˈsi|L|ris|4|Para beber aqui ou para levar?|¿Para tomar aquí o para llevar?
cidade|ciudad|siˈdaðɨ|S|cit|5|Lisboa é uma cidade bonita.|Lisboa es una ciudad bonita.
rua|calle|ˈʁuɐ|S|cit|5|A rua é estreita e antiga.|La calle es estrecha y antigua.
praça|plaza|ˈpɾasɐ|S|cit|4|A praça do Rossio é central.|La plaza del Rossio es céntrica.
esquina|esquina|ɨʃˈkinɐ|S|cit|4|O café fica na esquina.|El café está en la esquina.
bairro|barrio|ˈbajʃu|S|cit|5|Moro no Bairro Alto.|Vivo en el Bairro Alto.
miradouro|mirador|miɾɐˈðowɾu|S|cit|4|O miradouro tem vista para o rio.|El mirador tiene vistas al río.
igreja|iglesia|iˈɡɾeʒɐ|S|cit|4|A igreja fica no alto.|La iglesia está en lo alto.
banco|banco|ˈbɐ̃ku|S|ist|5|O banco abre às oito e meia.|El banco abre a las 8:30.
correio|correos|kuˈʁeju|S|ist|4|O correio fecha às dezassete e meia.|Correos cierra a las 17:30.
farmácia|farmacia|fɐɾˈmasiɐ|S|sla|5|Há uma farmácia aqui perto.|Hay una farmacia aquí cerca.
hospital|hospital|oʃpiˈtaɫ|S|sla|4|O hospital fica longe.|El hospital queda lejos.
museu|museo|muˈzew|S|art|4|O museu é gratuito ao domingo.|El museo es gratuito el domingo.
mercado|mercado|mɨɾˈkaðu|S|cmp|5|Vou ao mercado ao sábado.|Voy al mercado el sábado.
loja|tienda|ˈlɔʒɐ|S|cmp|5|A loja está em saldos.|La tienda está en rebajas.
centro comercial|centro comercial|ˈsẽtɾu kuɾsiuˈnaɫ|L|cmp|3|O centro comercial é grande.|El centro comercial es grande.
saldos|rebajas|ˈsaɫduʃ|S|cmp|3|Os saldos são em janeiro.|Las rebajas son en enero.
desconto|descuento|dɨʃˈkõtu|S|fin|4|Tem desconto de estudante.|Hay descuento de estudiante.
preço|precio|ˈpɾesu|S|cmp|5|Qual é o preço?|¿Cuál es el precio?
caro|caro|ˈkaɾu|A|cmp|5|É caro demais para mim.|Es demasiado caro para mí.
barato|barato|bɐˈɾatu|A|cmp|5|O café no balcão é barato.|El café en el mostrador es barato.
dinheiro|dinheiro|dɨˈɲejɾu|S|fin|5|Não tenho dinheiro comigo.|No llevo dinero encima.
euro|euro|ˈewɾu|S|fin|5|São dois euros e oitenta.|Son 2,80 €.
cêntimo|céntimo|ˈsẽtimu|S|fin|4|Cinquenta cêntimos, por favor.|Cincuenta céntimos, por favor.
cartão|tarjeta|kɐɾˈtɐ̃w̃|S|fin|5|Pode pagar com cartão.|Puede pagar con tarjeta.
nota (dinero)|billete|ˈnɔtɐ|S|fin|4|Uma nota de vinte euros.|Un billete de veinte euros.
troco|cambio (vuelto)|ˈtɾɔku|S|fin|4|Ficou com o troco?|¿Se quedó con el cambio?
comprar|comprar|kũˈpɾaɾ|V|cmp|5|Compro fruta no mercado.|Compro fruta en el mercado.
pagar|pagar|pɐˈɡaɾ|V|fin|5|Pago com cartão.|Pago con tarjeta.
custar|costar|kuʃˈtaɾ|V|cmp|5|Quanto custa o quilo?|¿Cuánto cuesta el kilo?
levar|llevar(se)|lɨˈvaɾ|V|cmp|5|Levo um quilo de laranjas.|Llevo un kilo de naranjas.
experimentar|probar(se)|ɨʃpɨɾimẽˈtaɾ|V|cmp|5|Posso experimentar o casaco?|¿Puedo probarme el abrigo?
provador|probador|pɾuvɐˈðoɾ|S|cmp|4|O provador é ali à direita.|El probador está allí a la derecha.
tamanho|talla|tɐˈmẽɲu|S|cmp|5|Que tamanho usa?|¿Qué talla usa?
roupa|ropa|ˈʁupɐ|S|rop|5|Preciso de roupa de inverno.|Necesito ropa de invierno.
casaco|abrigo|kɐˈzaku|S|rop|5|Este casaco fica-me bem.|Este abrigo me queda bien.
camisa|camisa|kɐˈmizɐ|S|rop|4|Uma camisa branca, por favor.|Una camisa blanca, por favor.
camisola|jersey|kɐmiˈzɔlɐ|S|rop|4|A camisola de lã é quente.|El jersey de lana es cálido.
calças|pantalones|ˈkaɫpɐʃ|S|rop|5|As calças ficam apertadas.|Los pantalones quedan estrechos.|n=siempre plural
vestido|vestido|vɨʃˈtiðu|S|rop|4|Um vestido para o casamento.|Un vestido para la boda.
saia|falda|ˈsajɐ|S|rop|4|A saia é comprida.|La falda es larga.
sapatos|zapatos|sɐˈpatuʃ|S|rop|5|Estes sapatos são cómodos.|Estos zapatos son cómodos.
botas|botas|ˈbɔtɐʃ|S|rop|4|Uso botas no inverno.|Uso botas en invierno.
guarda-chuva|paraguas|ɡwaɾˈdɐ ˈʃuɾvɐ|S|rop|4|Levo o guarda-chuva sempre.|Llevo el paraguas siempre.
grande|grande|ˈɡʁɐ̃dɨ|A|ast|5|A sala é grande.|El salón es grande.
pequeno|pequeño|pɨˈkenu|A|ast|5|O quarto é pequeno.|El dormitorio es pequeño.
novo|nuevo|ˈnovu|A|ast|5|O comboio é novo.|El tren es nuevo.
velho|viejo|ˈvɛʎu|A|ast|5|O prédio é velho.|El edificio es viejo.
bonito|bonito|buˈnitu|A|ast|5|A cidade é bonita.|La ciudad es bonita.
feio|feo|ˈfew|A|ast|3|O sapato é feio.|El zapato es feo.
bom|bueno|bõ|A|ast|5|O vinho é bom.|El vino es bueno.
mau|malo|maw|A|ast|4|O tempo está mau.|El tiempo está malo.
melhor|mejor|mɨˈʎoɾ|A|ast|5|Este é melhor que aquele.|Este es mejor que aquel.
pior|peor|piˈoɾ|A|ast|4|Hoje estou pior.|Hoy estoy peor.
fácil|fácil|ˈfasiw|A|ast|4|É fácil perder-se na Alfama.|Es fácil perderse en la Alfama.
difícil|difícil|diˈfisiw|A|ast|4|O português é difícil?|¿El portugués es difícil?
forte|fuerte|ˈfɔɾtɨ|A|ast|4|O café é forte.|El café es fuerte.
suave|suave|ˈswavɨ|A|ast|3|Um vinho suave.|Un vino suave.
aberto|abierto|ɐˈbɛɾtu|A|ast|5|O café está aberto.|El café está abierto.
fechado|cerrado|fɨˈʃaðu|A|ast|5|O banco está fechado.|El banco está cerrado.
quente|caliente|ˈkẽtɨ|A|ast|5|O café está quente.|El café está caliente.
frio|frío|ˈfɾiu|A|ast|5|Estou com frio.|Tengo frío.
doce|dulce|ˈdosɨ|A|ali|5|A laranja está doce.|La naranja está dulce.
picante|picante|piˈkɐ̃tɨ|A|ali|4|O molho é picante.|La salsa es picante.
delicioso|delicioso|dɨliˈsjozu|A|ali|5|A francesinha é deliciosa.|La francesinha es deliciosa.
esquisito|raro / extraño|ɨʃkiˈzitu|A|ast|3|O sabor é esquisito.|El sabor es raro.|ff=1; n=¡no significa «exquisito»!
largo|ancho|ˈlaɾɡu|A|ast|4|A rua é larga.|La calle es ancha.|ff=1; n=«largo» = ancho; «comprido» = largo
comprido|largo (extenso)|kũˈpɾiðu|A|ast|3|O vestido é comprido.|El vestido es largo.
estreito|estrecho|ɨʃˈtɾejtu|A|ast|4|A escada é estreita.|La escalera es estrecha.
alto|alto|ˈaɫtu|A|ast|5|O miradouro é alto.|El mirador es alto.
baixo|bajo|ˈbajʃu|A|ast|4|Falo baixo, desculpe.|Hablo bajo, disculpe.
branco|blanco|ˈbɾɐ̃ku|A|col|5|Uma camisa branca.|Una camisa blanca.
preto|negro|ˈpɾetu|A|col|5|O casaco é preto.|El abrigo es negro.
azul|azul|ɐˈzuɫ|A|col|5|O céu está azul.|El cielo está azul.
vermelho|rojo|vɨɾˈmeʎu|A|col|5|A camisola é vermelha.|El jersey es rojo.
verde|verde|ˈveɾðɨ|A|col|5|O vinho verde é fresco.|El vino verde es fresco.
amarelo|amarillo|ɐmɐˈʁɛlu|A|col|5|O elétrico é amarelo.|El elétrico es amarillo.
castanho|marrón|kɐʃˈtɐ̃ɲu|A|col|4|Um casaco castanho.|Un abrigo marrón.
cinzento|gris|sɨˈzẽtu|A|col|4|O céu está cinzento.|El cielo está gris.
cor|color|koɾ|S|col|5|Qual é a tua cor favorita?|¿Cuál es tu color favorito?
metro|metro|ˈmɛtɾu|S|tra|5|O metro de Lisboa é rápido.|El metro de Lisboa es rápido.
elétrico|tranvía|eˈlɛtɾiku|S|tra|5|O elétrico 28 passa pela Alfama.|El elétrico 28 pasa por la Alfama.
autocarro|autobús|awtuˈkaʁu|S|tra|5|Apanho o autocarro ao domingo.|Tomo el autobús el domingo.|n=en Brasil es «ônibus»
comboio|tren|kõˈboju|S|tra|5|O comboio parte às oito.|El tren sale a las ocho.|n=en Brasil es «trem»
estação|estación|ɨʃtɐˈsɐ̃w̃|S|tra|5|A estação de Santa Apolónia.|La estación de Santa Apolónia.
cais|andén|kajʃ|S|tra|4|O comboio parte do cais três.|El tren sale del andén 3.
bilhete|bilhete|biˈʎetɨ|S|tra|5|Um bilhete de ida e volta.|Un bilhete de ida y vuelta.
ida e volta|ida y vuelta|ˈiðɐ i ˈvɔɫtɐ|L|tra|5|Queria um bilhete de ida e volta.|Quería un bilhete de ida y vuelta.
só a ida|solo ida|ˈsɔ a ˈiðɐ|L|tra|4|É só a ida, por favor.|Es solo ida, por favor.
partir|salir|pɐɾˈtiɾ|V|tra|5|A que horas parte o comboio?|¿A qué hora sale el tren?
chegar|llegar|ʃɨˈɡaɾ|V|tra|5|Chegamos ao Porto às dez.|Llegamos a Oporto a las diez.
apanhar|tomar (transporte)|ɐpɐˈɲaɾ|V|tra|5|Apanho o elétrico 28.|Tomo el elétrico 28.
viajar|viajar|viɐˈʎaɾ|V|vig|5|Gosto de viajar de comboio.|Me gusta viajar en tren.
viagem|viaje|viˈaʒẽj̃|S|vig|5|Boa viagem!|¡Buen viaje!
demorar|tardar (durar)|dɨmuˈɾaɾ|V|tmp|4|A viagem demora três horas.|El viaje dura tres horas.
a pé|a pie|ɐ ˈpɛ|L|tra|5|Vou a pé, é perto.|Voy a pie, está cerca.
longe|lejos|ˈlõʒɨ|D|tra|5|É longe daqui?|¿Está lejos de aquí?
perto|cerca|ˈpɛɾtu|D|tra|5|Fica aqui perto.|Queda aquí cerca.
direita|dereita|diˈɾejtɐ|S|tra|5|Vire à direita.|Gire a la derecha.
esquerda|izquierda|ɨʃˈkɛɾðɐ|S|tra|5|A farmácia fica à esquerda.|La farmacia está a la izquierda.
em frente|recto / enfrente|ɐ̃ ˈfɾẽtɨ|L|tra|5|Siga em frente.|Siga recto.
direções|direcciones|diɾɨˈsõjʃ|S|tra|4|Pergunto as direções ao vizinho.|Pregunto las direcciones al vecino.
mapa|mapa|ˈmɐpɐ|S|vig|4|Preciso de um mapa de Lisboa.|Necesito un mapa de Lisboa.
perder-se|perderse|pɨɾˈdeɾ-sɨ|V|vig|4|É fácil perder-se na Alfama.|Es fácil perderse en la Alfama.
encontrar|encontrar|ẽkõˈtɾaɾ|V|rel|5|Onde encontro o Rui?|¿Dónde encuentro a Rui?
procurar|buscar|pɾukuˈɾaɾ|V|ast|5|Procuro o miradouro.|Busco el mirador.
ser|ser|seɾ|V|ast|5|Sou do Peru. ¿E tu?|Soy de Perú. ¿Y tú?
estar|estar|ɨʃˈtaɾ|V|ast|5|Estou a estudar português.|Estoy estudiando português.
ter|tener|teɾ|V|ast|5|Tenho dois irmãos.|Tengo dos hermanos.
ir|ir|iɾ|V|ast|5|Vou para o Porto amanhã.|Voy a Oporto mañana.
fazer|hacer|fɐˈzeɾ|V|ast|5|O que fazes ao sábado?|¿Qué haces el sábado?
poder|poder|puˈðeɾ|V|ast|5|Posso ajudar?|¿Puedo ayudar?
querer|querer|kɨˈɾeɾ|V|ast|5|Queria um café, por favor.|Quería un café, por favor.
gostar de|gustar (de)|ɡuʃˈtaɾ dɨ|V|emo|5|Gosto de ouvir fado.|Me gusta escuchar fado.
adorar|adorar|ɐðuˈɾaɾ|V|emo|5|Adoro pastéis de nata!|¡Adoro los pasteles de nata!
preferir|preferir|pɾɨfɨˈɾiɾ|V|emo|4|Prefiro chá, obrigado.|Prefiero té, gracias.
precisar de|necesitar|pɾɨsizaɾ dɨ|V|ast|5|Preciso de um casaco novo.|Necesito un abrigo nuevo.
levantar-se|levantarse|lɨvɐ̃ˈtaɾ-sɨ|V|cor|5|Levanto-me às sete e meia.|Me levanto a las 7:30.
deitar-se|acostarse|dejˈtaɾ-sɨ|V|cor|5|Deito-me tarde.|Me acuesto tarde.
acordar|despertar|ɐˈkoɾdaɾ|V|cor|5|Acordo às seis.|Me despierto a las seis.
dormir|dormir|duɾˈmiɾ|V|cor|5|Durmo oito horas.|Duermo ocho horas.
comer|comer|kuˈmeɾ|V|ali|5|Como na cantina.|Como en el comedor.
beber|beber|bɨˈbeɾ|V|ali|5|Bebo um galão de manhã.|Bebo un galão por la mañana.
tomar|tomar|tuˈmaɾ|V|ali|5|Tomo o pequeno-almoço em casa.|Desayuno en casa.
falar|hablar|fɐˈlaɾ|V|cmu|5|Falo português e espanhol.|Hablo português y español.
ouvir|escuchar|owˈviɾ|V|cmu|5|Gosto de ouvir música.|Me gusta escuchar música.
ver|ver|veɾ|V|cmu|5|Vejo um filme ao sábado.|Veo una película el sábado.
olhar|mirar|uˈʎaɾ|V|cmu|5|Olha para os telhados!|¡Mira los tejados!
dizer|decir|dɨˈzeɾ|V|cmu|5|Como se diz em português?|¿Cómo se dice en português?
perguntar|preguntar|pɨɾɡunˈtaɾ|V|cmu|5|Pergunto ao vizinho.|Pregunto al vecino.
responder|responder|ʁɨʃpõˈdeɾ|V|cmu|4|Respondo com calma.|Respondo con calma.
contar|contar|kõˈtaɾ|V|cmu|4|O avô conta histórias.|El abuelo cuenta historias.
saber|saber|sɐˈbeɾ|V|cmu|5|Não sei a resposta.|No sé la respuesta.
conhecer|conocer|kuniˈseɾ|V|cmu|4|Conheço Lisboa bem.|Conozco Lisboa bien.
trabalhar|trabajar|tɾɐbɐˈʎaɾ|V|lav|5|Trabalho numa livraria.|Trabajo en una librería.
estudar|estudar|ɨʃtuˈdaɾ|V|stu|5|Estudo português.|Estudio português.
abrir|abrir|ɐˈbɾiɾ|V|ast|5|A loja abre às dez.|La tienda abre a las diez.
fechar|cerrar|fɨˈʃaɾ|V|ast|5|O banco fecha às quinze.|El banco cierra a las 15:00.
viver|vivir (existir)|viˈveɾ|V|ast|4|Vivemos tempos estranhos.|Vivimos tiempos extraños.
ajudar|ayudar|ɐˈʒuðaɾ|V|rel|5|Posso ajudar?|¿Puedo ayudar?
esperar|esperar|ɨʃpɨˈɾaɾ|V|tmp|5|Espero pelo comboio.|Espero el tren.
dar|dar|daɾ|V|ast|5|Dá-me um café, por favor.|Dame un café, por favor.
ficar|quedar|fiˈkaɾ|V|ast|5|O casaco fica-me bem.|El abrigo me queda bien.
começar|empezar|ku mɨˈsaɾ|V|tmp|5|A aula começa às nove.|La clase empieza a las nueve.
acabar|terminar|ɐˈkabaɾ|V|tmp|4|O filme acaba à meia-noite.|La película termina a medianoche.
voltar|volver|vuɫˈtaɾ|V|tmp|5|Volto a Lisboa amanhã.|Vuelvo a Lisboa mañana.
sair|salir|sɐˈiɾ|V|tmp|5|Saio de casa às oito.|Salgo de casa a las ocho.
entrar|entrar|ẽˈtɾaɾ|V|tmp|5|Entremos na tasca!|¡Entremos en la tasca!
subir|subir|suˈbiɾ|V|tra|5|Suba a rua do Loreto.|Suba la rua do Loreto.
descer|bajar|dɨˈseɾ|V|tra|5|Descemos à Ribeira.|Bajamos a la Ribeira.
passar|pasar|pɐˈsaɾ|V|tmp|5|O elétrico passa aqui.|El elétrico pasa aquí.
morrer|morir|muˈʁeɾ|V|ast|2|Os barcos rabelo dormem no rio.|Los barcos rabelo duermen en el río.
dessalgar|desalar|dɨsaɫˈɡaɾ|V|ali|2|O bacalhau dessalga 48 horas.|El bacalao se desala 48 horas.
cozinhar|cocinar|kuziˈɲaɾ|V|ali|4|A avó cozinha para todos.|La abuela cocina para todos.
temperar|sazonar|tẽpɨˈɾaɾ|V|ali|3|Tempera com sal e azeite.|Sazona con sal y aceite.
provar|probar|pɾuˈvaɾ|V|ali|4|Prove a sopa!|¡Pruebe la sopa!
temperatura|temperatura|tẽpɨɾɐˈtuɾɐ|S|cli|4|Qual é a temperatura hoje?|¿Cuál es la temperatura hoy?
tempo|tiempo|ˈtẽpu|S|cli|5|O tempo está bom hoje.|El tiempo está bien hoy.
sol|sol|sɔɫ|S|cli|5|Hoje está sol.|Hoy hace sol.
chuva|lluvia|ˈʃuwɐ|S|cli|5|Levo o guarda-chuva: há chuva.|Llevo el paraguas: hay lluvia.
chover|llover|ʃuˈveɾ|V|cli|4|Está a chover em Lisboa.|Está lloviendo en Lisboa.
vento|viento|ˈvẽtu|S|cli|4|O vento é forte no inverno.|El viento es fuerte en invierno.
nuvem|nube|ˈnuvẽj̃|S|cli|4|O céu tem nuvens.|El cielo tiene nubes.
nevoeiro|niebla|nɨvuˈejɾu|S|cli|3|Há nevoeiro no Tejo.|Hay niebla en el Tajo.
verão|verano|vɨˈɾɐ̃w̃|S|cli|5|O verão é quente no sul.|El verano es caluroso en el sur.
inverno|invierno|ĩˈvɛɾnu|S|cli|5|O inverno de Lisboa é chuvoso.|El invierno de Lisboa es lluvioso.
primavera|primavera|pɾimɐˈvɛɾɐ|S|cli|4|A primavera em Lisboa é linda.|La primavera en Lisboa es preciosa.
outono|otoño|owˈtunu|S|cli|4|No outono chove muito.|En otoño llueve mucho.
estação do ano|estación del año|ɨʃtɐˈsɐ̃w̃ du ɐˈnu|L|cli|4|Qual é a tua estação favorita?|¿Cuál es tu estación favorita?
fado|fado|ˈfaðu|S|mus|5|O fado é a música da saudade.|El fado es la música de la saudade.
saudade|nostalgia amorosa|sɐwˈðaðɨ|S|emo|5|Sinto saudade de Lima.|Siento saudade de Lima.|n=palabra intraducible: nostalgia de lo amado
guitarra portuguesa|guitarra portuguesa|ɡiˈtaʀɐ puɾtuˈɡezɐ|L|mus|3|A guitarra portuguesa tem doze cordas.|La guitarra portuguesa tiene doce cuerdas.
música|música|ˈmuzikɐ|S|mus|5|Gosto de música ao vivo.|Me gusta la música en vivo.
canção|canción|kɐ̃ˈsɐ̃w̃|S|mus|4|A canção acabou em silêncio.|La canción acabó en silencio.
concerto|concierto|kõˈsɛɾtu|S|mus|4|Há um concerto na cave do vinho.|Hay un concierto en la bodega del vino.
futebol|fútbol|futeˈbɔɫ|S|spt|5|Vamos ver o futebol!|¡Vamos a ver el fútbol!
jogo|partido|ˈʒoɡu|S|spt|5|O jogo começa às oito.|El partido empieza a las ocho.
estádio|estadio|ɨʃˈtaðju|S|spt|4|O estádio da Luz é enorme.|El estadio da Luz es enorme.
jogar|jugar (deporte)|ʒuˈɡaɾ|V|spt|5|Jogo futebol ao domingo.|Juego al fútbol el domingo.
time|equipo|ˈtʃimɨ|S|spt|4|Qual é o teu time?|¿Cuál es tu equipo?|n=en pt-PT también «equipa»
equipa|equipo|ɨˈkipɐ|S|spt|4|A equipa do Porto ganhou.|El equipo del Porto ganó.
ganhar|ganar|ɡɐˈɲaɾ|V|spt|4|O Benfica ganha em casa.|El Benfica gana en casa.
perder|perder|pɨɾˈdeɾ|V|spt|4|Perdemos, mas ninguém está triste.|Perdemos, pero nadie está triste.
desporto|deporte|dɨʃˈpɔɾtu|S|spt|4|Faço desporto de manhã.|Hago deporte por la mañana.
ginásio|gimnasio|ʒiˈnaziu|S|spt|3|Vou ao ginásio à tarde.|Voy al gimnasio por la tarde.
bicicleta|bicicleta|bisiˈklɛtɐ|S|spt|4|Ando de bicicleta no parque.|Monto en bici en el parque.
passear|pasear|pɐsiˈaɾ|V|sve|4|Passeio junto ao rio.|Paseo junto al río.
praia|playa|ˈpɾajɐ|S|nat|4|No verão, vou à praia.|En verano, voy a la playa.
mar|mar|maɾ|S|nat|5|O mar fica ali em baixo.|El mar está allí abajo.
rio|río|ˈriu|S|nat|5|O Douro desagua devagar.|El Douro desemboca despacio.
montanha|montaña|mõˈtɐ̃ɲɐ|S|nat|4|A serra fica ao norte.|La sierra queda al norte.
livro|libro|ˈlivɾu|S|let|5|Leio um livro no comboio.|Leo un libro en el tren.
ler|leer|leɾ|V|let|5|Leio as notícias de manhã.|Leo las noticias por la mañana.
escrever|escribir|ɨʃkɾɨˈveɾ|V|let|5|Escrevo um e-mail.|Escribo un correo.
telemóvel|móvil|tɨlɨˈmɔvɛɫ|S|tec|5|O telemóvel fica na mesa.|El móvil queda en la mesa.|n=en Brasil es «celular»
computador|ordenador|kõputɐˈðoɾ|S|tec|4|Trabalho no computador.|Trabajo en el ordenador.
internet|internet|ĩtɐɾˈnɛt|S|tec|4|O wifi não funciona.|El wifi no funciona.
telemóvel (chamada)|llamada|tɨlɨˈmɔvɛɫ|S|cmu|3|Dou um telemóvel à mãe.|Llamo a mi madre.
mensagem|mensaje|mɨnˈsaʒẽj̃|S|cmu|4|Mando uma mensagem ao Rui.|Mando un mensaje a Rui.
pergunta|pregunta|pɨɾˈɡuntɐ|S|cmu|5|Tenho uma pergunta.|Tengo una pregunta.
resposta|respuesta|ʁɨʃˈpɔstɐ|S|cmu|5|A resposta é simples.|La respuesta es simple.
palavra|palabra|pɐˈlavrɐ|S|cmu|5|Uma palavra nova.|Una palabra nueva.
frase|frase|ˈfɾazɨ|S|cmu|4|Uma frase completa.|Una frase completa.
língua|idioma / lengua|ˈlĩɡwɐ|S|cmu|5|A língua portuguesa é bonita.|La lengua portuguesa es bonita.
português|portugués|puɾtuˈɡeʃ|S|cmu|5|Estudo português europeu.|Estudio portugués de Portugal.
sotaque|acento|suˈtakɨ|S|cmu|4|Falas com sotaque de Madrid.|Hablas con acento de Madrid.
tradução|traducción|tɾɐðuˈsɐ̃w̃|S|cmu|3|Qual é a tradução?|¿Cuál es la traducción?
significar|significar|siɣnifiˈkaɾ|V|cmu|4|O que significa isto?|¿Qué significa esto?
eu|yo|ew|P|cmu|5|Eu sou Alejandro.|Yo soy Alejandro.
tu|tú|tu|P|cmu|5|Como te chamas?|¿Cómo te llamas?
ele|él|eɫ|P|cmu|5|Ele é do Porto.|Él es de Oporto.
ela|ella|ˈɛlɐ|P|cmu|5|Ela estuda medicina.|Ella estudia medicina.
nós|nosotros|nɔʃ|P|cmu|5|Nós somos estudantes.|Nosotros somos estudiantes.
vocês|ustedes / vosotros|vuˈsɐjʃ|P|cmu|5|Vocês são de Espanha?|¿Ustedes son de España?
eles|ellos|eɫɨʃ|P|cmu|5|Eles trabalham juntos.|Ellos trabajan juntos.
elas|ellas|ˈɛlɐʃ|P|cmu|5|Elas moram em Coimbra.|Ellas viven en Coímbra.
meu|minha (masc.)|mew|P|cmu|5|O meu pai, a minha mãe.|Mi padre, mi madre.
teu|tu (masc.)|tew|P|cmu|5|O teu casaco é novo.|Tu abrigo es nuevo.
seu|su (formal)|sew|P|cmu|4|O seu bilhete, por favor.|Su bilhete, por favor.
nosso|nuestro|ˈnosu|P|cmu|4|O nosso apartamento.|Nuestro apartamento.
mim|mí|mĩ|P|cmu|5|Para mim, a sopa.|Para mí, la sopa.
comigo|conmigo|kuˈmiɡu|P|cmu|4|Vens comigo?|¿Vienes conmigo?
este|este|ˈɛʃtɨ|D|cmu|5|Quanto custa este casaco?|¿Cuánto cuesta este abrigo?
esta|esta|ˈɛʃtɐ|D|cmu|5|Esta rua é bonita.|Esta calle es bonita.
estes|estos|ˈɛʃtɨʃ|D|cmu|4|Estes sapatos são cómodos.|Estos zapatos son cómodos.
estas|estas|ˈɛʃtɐʃ|D|cmu|4|Estas botas ficam bem.|Estas botas quedan bien.
esse|ese|ˈesɨ|D|cmu|4|Esse livro é teu?|¿Ese libro es tuyo?
aquele|aquel|ɐˈkɛlɨ|D|cmu|4|Aquele miradouro é lindo.|Aquel mirador es precioso.
isto|esto|ˈiʃtu|P|cmu|5|O que é isto?|¿Qué es esto?
isso|eso|ˈisu|P|cmu|5|Isso é tudo, obrigado!|¡Eso es todo, gracias!
quem|quién|kɐ̃j̃|P|cmu|5|Quem é este senhor?|¿Quién es este señor?
o quê|qué|u kɛ|P|cmu|5|O que deseja?|¿Qué desea?
onde|dónde|ˈõdɨ|P|cmu|5|Onde está a casa de banho?|¿Dónde está el baño?
quando|cuándo|ˈkwɐ̃du|P|cmu|5|Quando parte o comboio?|¿Cuándo sale el tren?
porquê|por qué|puɾˈkɛ|P|cmu|4|Porquê tan cedo?|¿Por qué tan temprano?
como|cómo|ˈkomu|P|cmu|5|Como é que vou para o castelo?|¿Cómo llego al castillo?
quanto|cuánto|ˈkwɐ̃tu|P|cmu|5|Quanto custa?|¿Cuánto cuesta?
quantos|cuántos|ˈkwɐ̃tuʃ|P|cmu|5|Quantos quartos tem?|¿Cuántos dormitorios tiene?
qual|cuál|kwaɫ|P|cmu|5|Qual é mais rápido?|¿Cuál es más rápido?
sim|sí|sĩ|P|cmu|5|Sim, obrigado!|¡Sí, gracias!
não|no|nɐ̃w̃|P|cmu|5|Não, é tudo, obrigado.|No, es todo, gracias.
talvez|quizás|taɫˈvez|D|cmu|4|Talvez vá ao Porto amanhã.|Quizás vaya a Oporto mañana.
também|también|tɐ̃ˈbɐ̃j̃|D|cmu|5|Eu também gosto de fado.|A mí también me gusta el fado.
tão|tan|tɐ̃w̃|D|cmu|4|O Douro é tão bonito!|¡El Douro es tan bonito!
de|de|dɨ|R|cmu|5|Sou de Lima.|Soy de Lima.
em|en|ɐ̃j̃|R|cmu|5|Moro em Lisboa.|Vivo en Lisboa.
a|a|ɐ|R|cmu|5|Vou a Lisboa.|Voy a Lisboa.
para|para|ˈpaɾɐ|R|cmu|5|Um comboio para o Porto.|Un tren para Oporto.
com|con|kõ|R|cmu|5|Café com leite.|Café con leche.
sem|sin|sẽj̃|R|cmu|5|Café sem açúcar.|Café sin azúcar.
por|por|puɾ|R|cmu|5|Obrigado pela ajuda.|Gracias por la ayuda.
entre|entre|ˈẽtɾɨ|R|cmu|5|Entre o banco e o correio.|Entre el banco y correos.
sobre|sobre|ˈsobɾɨ|R|cmu|4|Um livro sobre fado.|Un libro sobre el fado.
até|hasta|ɐˈtɛ|R|cmu|5|Até logo!|¡Hasta luego!
desde|desde|ˈdezdɨ|R|cmu|4|Desde manhã até à noite.|Desde la mañana hasta la noche.
contra|contra|ˈkõtɾɐ|R|cmu|3|Benfica contra Porto.|Benfica contra Porto.
do|del / de + el|du|R|cmu|5|O café do balcão.|El café del mostrador.
da|de la|dɐ|R|cmu|5|A rua da Graça.|La calle de la Graça.
no|en el|nu|R|cmu|5|Bebo no balcão.|Bebo en el mostrador.
na|en la|nɐ|R|cmu|5|Na pastelaria.|En la pastelería.
ao|al / a + el|ow|R|cmu|5|Vou ao mercado.|Voy al mercado.
à|a la|a|R|cmu|5|Vire à direita.|Gire a la derecha.
ao lado de|al lado de|ow ˈlaðu dɨ|L|cmu|5|Fica ao lado do banco.|Está al lado del banco.
em frente de|enfrente de|ɐ̃ ˈfɾẽtɨ dɨ|L|cmu|4|Em frente da igreja.|Enfrente de la iglesia.
atrás de|detrás de|ɐˈtɾaʃ dɨ|L|cmu|4|Atrás da casa há um quintal.|Detrás de la casa hay un patio.
perto de|cerca de|ˈpɛɾtu dɨ|L|cmu|5|Perto do metro.|Cerca del metro.
longe de|lejos de|ˈlõʒɨ dɨ|L|cmu|4|Longe do centro.|Lejos del centro.
e|y|i|C|cmu|5|Café e pastel.|Café y pastel.
ou|o|ow|C|cmu|5|Para beber aqui ou para levar?|¿Para tomar aquí o para llevar?
mas|pero|maʃ|C|cmu|5|É caro mas é bom.|Es caro pero es bueno.
porque|porque|puɾˈkɨ|C|cmu|5|Fico em casa porque chove.|Me quedo en casa porque llueve.
se|si|sɨ|C|cmu|4|Se puder, vou.|Si puedo, voy.
que|que|kɨ|C|cmu|5|Um café que é forte.|Un café que es fuerte.
um|un|ũ|T|cmu|5|Um café, por favor.|Un café, por favor.
uma|una|ˈumɐ|T|cmu|5|Uma água fresca.|Un agua fresca.
o|el|u|T|cmu|5|O comboio parte às oito.|El tren sale a las ocho.
a|la|ɐ|T|cmu|5|A conta, por favor.|La cuenta, por favor.
os|los|uʃ|T|cmu|5|Os pastéis estão quentes.|Los pasteles están calientes.
as|las|ɐʃ|T|cmu|5|As ruas são estreitas.|Las calles son estrechas.
nada|nada|ˈnaðɐ|P|cmu|5|Não quero nada mais.|No quiero nada más.
tudo|todo|ˈtuðu|P|cmu|5|É tudo, obrigado!|¡Es todo, gracias!
algo|algo|ˈaɫɡu|P|cmu|3|Quer algo mais?|¿Quiere algo más?
ninguém|nadie|nĩˈɡɐ̃j̃|P|cmu|4|Não há ninguém em casa.|No hay nadie en casa.
todo o mundo|todo el mundo|ˈtɔðu u ˈmũdu|L|cmu|4|Todo o mundo fala comigo.|Todo el mundo habla conmigo.
muito|muy / mucho|ˈmujtu|D|cmu|5|Muito obrigado!|¡Muchas gracias!
pouco|poco|ˈpowku|D|cmu|5|Um pouco de açúcar.|Un poco de azúcar.
mais|mais|majʃ|D|cmu|5|Mais alguma coisa?|¿Algo más?
menos|menos|ˈmẽnuʃ|D|cmu|4|Menos sal, por favor.|Menos sal, por favor.
muito bom|muy bueno|ˈmujtu ˈbõ|L|cmu|5|Está muito bom!|¡Está muy bueno!
um pouco|un poco|ũ ˈpowku|L|cmu|5|Falo um pouco de português.|Hablo un poco de português.
bem|bien|bɐ̃j̃|D|cmu|5|Estou bem, obrigado.|Estoy bien, gracias.
mal|mal|maɫ|D|cmu|4|Durmo mal.|Duermo mal.
devagar|despacio|dɨvɐˈɡaɾ|D|cmu|5|Come devagar, por favor.|Come despacio, por favor.
depressa|deprisa|dɨˈpɾɛsɐ|D|cmu|4|Não corram, não é depressa.|No corráis, no hay prisa.
já|ya|ʒa|D|cmu|5|Até já!|¡Hasta ahora!
ainda não|todavía no|ɐˈiɲdɐ nɐ̃w̃|L|cmu|4|Ainda não comi.|Todavía no he comido.
cabeça|cabeza|kɐˈbɛsɐ|S|cor|5|Dói-me a cabeça.|Me duele la cabeza.
dor|dolor|doɾ|S|sla|4|Tenho dores de costas.|Tengo dolores de espalda.
doer|doler|duˈeɾ|V|sla|4|O que te dói?|¿Qué te duele?
garganta|garganta|ɡɐɾˈɡɐ̃tɐ|S|cor|4|Estou com a garganta inflamada.|Tengo la garganta inflamada.
barriga|barriga|bɐˈʁiɡɐ|S|cor|4|A barriga dói um pouco.|La barriga duele un poco.
costas|espalda|ˈkɔʃtɐʃ|S|cor|4|Dói-me as costas.|Me duele la espalda.
braço|brazo|ˈbɾasu|S|cor|5|O braço está cansado.|El brazo está cansado.
perna|pierna|ˈpɛɾnɐ|S|cor|5|As pernas doem da subida.|Las piernas duelen de la subida.
olho|ojo|ˈoʎu|S|cor|5|Fecha os olhos e respira.|Cierra los ojos y respira.
ouvido|oído|owˈviðu|S|cor|4|Ouvido, nariz e garganta.|Oído, nariz y garganta.
boca|boca|ˈbɔkɐ|S|cor|5|Abre a boca, por favor.|Abre la boca, por favor.
mão|mano|mɐ̃w̃|S|cor|5|Segura a chávena com as mãos.|Sostiene la taza con las manos.|p=mãos
pé|pie|pɛ|S|cor|5|Vou a pé.|Voy a pie.|p=pés
ombros|hombros|ˈõbɾuʃ|S|cor|4|Deixa os ombros para baixo.|Deja los hombros abajo.
coração|corazón|kuɾɐˈsɐ̃w̃|S|cor|4|O coração acelera na subida.|El corazón acelera en la subida.
respiração|respiración|ʁɨʃpiɾɐˈsɐ̃w̃|S|cor|4|Uma respiração lenta.|Una respiración lenta.
médico|médico|ˈmɛðiku|S|pro|5|Preciso de um médico.|Necesito un médico.
saúde|salud|saˈuðɨ|S|sla|5|Saúde! (brindis)|¡Salud!
doente|enfermo|duˈẽtɨ|A|sla|4|Estou doente, fico em casa.|Estoy enfermo, me quedo en casa.
feliz|feliz|fɨˈliʃ|A|emo|5|Estou muito feliz!|¡Estoy muy feliz!
contente|contento|kõˈtẽtɨ|A|emo|5|Estou contente por estar aqui.|Estoy contento de estar aquí.
triste|triste|ˈtɾiʃtɨ|A|emo|4|O fado às vezes é triste.|El fado a veces es triste.
zangado|enfadado|zɐ̃ˈɡaðu|A|emo|4|Não estou zangado contigo.|No estoy enfadado contigo.
cansado|cansado|kɐ̃ˈzadu|A|emo|5|Cheguei cansado da viagem.|Llegué cansado del viaje.
nervoso|nervioso|nɨɾˈvozu|A|emo|4|Não fiques nervoso.|No te pongas nervioso.
calmo|tranquilo|ˈkaɫmu|A|emo|5|Fica calmo e respira.|Quédate tranquilo y respira.
medo|miedo|ˈmeðu|S|emo|4|Tenho medo de altura.|Tengo miedo a las alturas.
raiva|rabia|ˈʁajvɐ|S|emo|3|A raiva passa.|La rabia pasa.
amor|amor|ɐˈmoɾ|S|emo|5|O amor é cego.|El amor es ciego.
sorriso|sonrisa|suˈʁisu|S|emo|4|Um sorriso abre portas.|Una sonrisa abre puertas.
fome|hambre|ˈfomɨ|S|ali|5|Estou com fome!|¡Tengo hambre!
sede|sed|ˈsɛdɨ|S|ali|5|Estou com sede.|Tengo sed.
sono|sueño|ˈsonu|S|cor|5|Estou com sono.|Tengo sueño.
pressa|prisa|ˈpɾɛsɐ|S|tmp|4|Não tenho pressa.|No tengo prisa.
razão|razón|ʁɐˈzɐ̃w̃|S|cmu|5|Estás com razão.|Tienes razón.
engenheiro|ingeniero|ẽʒɨˈɲejɾu|S|pro|5|O meu pai é engenheiro.|Mi padre es ingeniero.
enfermeiro|enfermero|ẽfɨɾˈmejɾu|S|pro|4|O Carlos é enfermeiro.|Carlos es enfermero.
advogado|abogado|ɐdvuˈɡaðu|S|pro|4|A minha irmã é advogada.|Mi hermana es abogada.
cozinheiro|cocinero|kuziˈɲejɾu|S|pro|4|O cozinheiro é do Minho.|El cocinero es del Miño.
marinheiro|marinero|mɐɾiˈɲejɾu|S|pro|3|O avô era marinheiro.|El abuelo era marinero.
motorista|conductor|mutuˈɾiʃtɐ|S|pro|4|O motorista do elétrico.|El conductor del elétrico.
vendedor|vendedor|vẽdeˈðoɾ|S|pro|4|O vendedor grita os preços.|El vendedor grita los precios.
funcionário|funcionario|fũsjuˈnaɾju|S|pro|3|A funcionária da bilheteira.|La funcionaria de la taquilla.
empregada|empleada (del hogar)|ẽpɾɨˈɡaðɐ|S|pro|4|A empregada limpa a casa.|La empleada limpia la casa.
aposentado|jubilado|ɐpuzẽˈtaðu|S|pro|3|O meu avô é aposentado.|Mi abuelo es jubilado.
desempregado|desempleado|dɨzẽpɾɨˈɡaðu|S|pro|3|Está desempregado há um ano.|Está desempleado desde hace un año.
então|entonces / pues|ẽˈtɐ̃w̃|I|cmu|5|Então, vamos?|Entonces, ¿vamos?|n=la palabra relleno más portuguesa
fixe|guay / genial|fiʃɨ|A|sve|4|O concerto foi fixe!|¡El concierto fue genial!
boa sorte|buena suerte|ˈboɐ ˈsoɾtɨ|L|cmu|4|Boa sorte no exame!|¡Buena suerte en el examen!
boa viagem|buen viaje|ˈboɐ viˈaʒẽj̃|L|vig|5|Boa viagem para o Porto!|¡Buen viaje a Oporto!
bom apetite|buen provecho|bõ ɐpɨˈtitɨ|L|ali|5|Bom apetite!|¡Buen provecho!
saúde (brindar)|salud (brindis)|saˈuðɨ|I|ali|4|Saúde! — Saúde!|¡Salud! — ¡Salud!
parabéns|felicidades|pɐɾɐˈbẽjʃ|I|cmu|4|Parabéns pelo aniversário!|¡Felicidades por el cumpleaños!
feliz aniversário|feliz cumpleaños|fɨˈliʒ ɐnivɨɾˈsaɾju|L|cmu|3|Feliz aniversário, Marta!|¡Feliz cumpleaños, Marta!
desculpa|perdón|dɨʃˈkulpɐ|I|cmu|5|Desculpa, cheguei tarde.|Perdón, llegué tarde.
estou com fome|tengo hambre|ɨʃˈtow kõ ˈfomɨ|E|ali|5|Estou com fome, vamos almoçar?|Tengo hambre, ¿vamos a almorzar?
como é que se diz…?|¿cómo se dice…?|ˈkomu ɛ kɨ sɨ ˈdiʃ|E|cmu|5|Como é que se diz em português?|¿Cómo se dice en português?
não percebi|no lo entendí|nɐ̃w̃ pɨɾsɨˈbi|E|cmu|4|Desculpa, não percebi.|Perdona, no lo entendí.
pode repetir?|¿puede repetir?|pɔðɨ ʁɨpɨˈtiɾ|E|cmu|4|Pode repetir, por favor?|¿Puede repetir, por favor?
fala mais devagar|hable más despacio|ˈfaɫɐ majʃ dɨvɐˈɡaɾ|E|cmu|4|Fala mais devagar, por favor.|Hable más despacio, por favor.
é tudo|es todo|ɛ ˈtuðu|E|ris|5|É tudo, obrigado!|¡Es todo, gracias!
mais alguma coisa?|¿algo más?|majʃ awˈɡumɐ ˈkwejzɐ|E|ris|5|Mais alguma coisa?|¿Algo más?
francesinha|francesinha (sándwich do Porto)|fɾɐ̃sɨˈzĩɲɐ|S|ali|3|A francesinha é do Porto.|La francesinha es de Oporto.
rabelo|barco rabelo|ʁɐˈbɛlu|S|vig|3|Os barcos rabelo traziam o vinho.|Los barcos rabelo traían el vino.
ponte|puente|põtɨ|S|cit|5|A ponte de Dom Luís I.|El puente de D. Luís I.
Douro|Douro (río)|ˈdowɾu|S|nat|4|O Douro desagua no Atlântico.|El Douro desemboca en el Atlántico.
Tejo|Tajo (río de Lisboa)|ˈtɛʒu|S|nat|4|O Tejo passa por Lisboa.|El Tajo pasa por Lisboa.
Alfama|Alfama (barrio)|aɫˈfamɐ|S|cit|4|Perder-se na Alfama é fácil.|Perderse en la Alfama es fácil.
Ribeira|Ribeira (zona do rio)|ʁiˈbɐjɾɐ|S|cit|4|A Ribeira do Porto é colorida.|La Ribeira de Oporto es colorida.
Alfa Pendular|Alfa Pendular (tren rápido)|ˈaɫfɐ pẽduˈlaɾ|S|tra|3|O Alfa Pendular chega às dez e meia.|El Alfa Pendular llega a las 10:30.
Intercidades|Intercidades (tren)|ĩtɨɾsiˈdaðɨʃ|S|tra|3|O Intercidades é mais barato.|El Intercidades es más barato.
cartão jovem|carnet joven|kɐɾˈtɐ̃w̃ ˈʒovẽj̃|L|tra|3|O cartão jovem dá desconto nos comboios.|El carnet joven da descuento en los trenes.
Navegante|Navegante (tarjeta de transporte)|naveˈɡɐ̃tɨ|S|tra|3|Uso o cartão Navegante no metro.|Uso la tarjeta Navegante en el metro.
broa|pan de maíz|ˈbɾoɐ|S|ali|3|Sardinha com broa.|Sardina con pan de maíz.
pastéis de Belém|pasteis de Belém|pɐʃˈtejʒ dɨ bɨˈlẽj̃|L|ali|3|Os pastéis de Belém são famosos.|Los pasteis de Belém son famosos.
vinho do Porto|vino de Oporto|ˈvinu du ˈpoɾtu|L|ali|4|O vinho do Porto envelhece em Gaia.|El vino de Oporto envejece en Gaia.
sardinha assada|sardina asada|sɐɾˈdĩɲɐ ɐˈsaðɐ|L|ali|4|Sardinha assada no carvão.|Sardina asada al carbón.
Santo António|Santo António|ˈsɐ̃tu ɐ̃ˈtɔnju|S|ist|3|As festas de Santo António são em junho.|Las fiestas de Santo António son en junio.
marchas populares|marchas populares|ˈmaɾʃɐʃ popuˈlaɾɨʃ|L|sve|3|As marchas populares dançam em junho.|Las marchas populares bailan en junio.
cidade invicta|ciudad invicta (Oporto)|siˈdaðɨ ĩˈviktɐ|L|cit|3|O Porto é a cidade invicta.|Oporto es la ciudad invicta.
sócios|socios (miembros)|ˈsɔsiuʃ|S|spt|2|O Benfica tem milhões de sócios.|El Benfica tiene millones de socios.
os três grandes|los tres grandes|uʃ tɾeʃ ɡɾɐ̃ˈdɨʃ|L|spt|3|Benfica, Sporting e Porto: os três grandes.|Benfica, Sporting y Porto: los tres grandes.
`);
/* v9.41 · base A1-B1 + pack plus B1-C2 (nível explícito): dicionário completo
   v9.43 · CEFR 16.000: parse preguiçoso com cache (ver lang-en.ts). */
let _ptDict: VocabWord[] | null = null;
export function getPTDict(): VocabWord[] {
  return (_ptDict ??= dedupMerge(PT_DICT_BASE, PT_PLUS, PT_MEGA));
}
