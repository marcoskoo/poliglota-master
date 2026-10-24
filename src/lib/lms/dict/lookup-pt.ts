import type { VocabWord, WordType } from "../types";
import { getPTDict } from "./lang-pt";

/* ═══ PT lemmatizer didáctico · português europeu → español ══════════
   Espejo del italiano/inglés (dict/lookup.ts, lookup-en.ts): heurística
   didáctica, no un lematizador completo. Orden: limpieza → clíticos →
   exacto → suplemento → irregulares → reglas (plural -s/-es/-ões,
   verbos -ar/-er/-ir, gerúndio -ndo, particípio -ado/-ido,
   feminino -a→-o).                                                */

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
  for (const w of getPTDict()) {
    const key = norm(w.it);
    if (!IDX.has(key)) IDX.set(key, w);
  }
  return IDX;
}

function find(form: string): VocabWord | undefined {
  return index().get(norm(form));
}

/* ── clíticos enclíticos: chamo-me, levanto-me, vê-lo ────────────── */
const CLITICS = ["lhes", "los", "las", "lhe", "nos", "vos", "me", "te", "se", "o", "a", "os", "as"];

function stripClitic(w: string): { stem: string; had: boolean } {
  const parts = w.split("-");
  if (parts.length === 2 && CLITICS.includes(parts[1])) return { stem: parts[0], had: true };
  if (parts.length === 3 && CLITICS.includes(parts[1]) && CLITICS.includes(parts[2])) return { stem: parts[0], had: true };
  return { stem: w, had: false };
}

/* ── suplemento: funcionales, contrações, números, dias, meses ────── */
type SupKind = "fw" | "sup";
interface SupInfo { es: string; type: WordType; exIt?: string; exEs?: string; note?: string }
const SUPPLEMENT: Record<string, SupInfo> = {
  há: { es: "hay (haver)", type: "verbo", exIt: "Há sopa hoje?", exEs: "¿Hay sopa hoy?" },
  haver: { es: "haber (impersonal: hay)", type: "verbo", exIt: "Há muita luz.", exEs: "Hay mucha luz." },
  às: { es: "a + las (a las…)", type: "preposizione", exIt: "Chego às nove.", exEs: "Llego a las nueve." },
  aos: { es: "a + los / a los…", type: "preposizione", exIt: "Vou aos sábados ao mercado.", exEs: "Voy los sábados al mercado." },
  dos: { es: "de + los", type: "preposizione", exIt: "As ruas dos bairros antigos.", exEs: "Las calles de los barrios antiguos." },
  das: { es: "de + las", type: "preposizione", exIt: "A porta da casa é antiga.", exEs: "La puerta de la casa es antigua." },
  nos: { es: "en + los / nos (a nosotros)", type: "preposizione", exIt: "Nos mercados há fruta.", exEs: "En los mercados hay fruta." },
  nas: { es: "en + las", type: "preposizione", exIt: "Nas paredes há azulejos.", exEs: "En las paredes hay azulejos." },
  pelo: { es: "por + el", type: "preposizione", exIt: "Passeio pelo parque.", exEs: "Paseo por el parque." },
  pela: { es: "por + la", type: "preposizione", exIt: "O elétrico passa pela Alfama.", exEs: "El elétrico pasa por la Alfama." },
  pelos: { es: "por + los", type: "preposizione", exIt: "Pelos telhados vê-se o mar.", exEs: "Por los tejados se ve el mar." },
  pelas: { es: "por + las", type: "preposizione", exIt: "Pelas ruas há cheiro a café.", exEs: "Por las calles huele a café." },
  num: { es: "en + un", type: "preposizione", exIt: "Trabalho numa livraria.", exEs: "Trabajo en una librería." },
  numa: { es: "en + una", type: "preposizione", exIt: "Moro numa casa antiga.", exEs: "Vivo en una casa antigua." },
  dum: { es: "de + un", type: "preposizione", exIt: "O cheiro dum café.", exEs: "El olor de un café." },
  duma: { es: "de + una", type: "preposizione", exIt: "A porta duma tasca.", exEs: "La puerta de una tasca." },
  senhor: { es: "señor", type: "sostantivo", exIt: "O senhor é de Espanha?", exEs: "¿Usted es de España?" },
  senhora: { es: "señora", type: "sostantivo", exIt: "A senhora deseja algo?", exEs: "¿La señora desea algo?" },
  dona: { es: "doña (trato cariñoso)", type: "sostantivo", exIt: "A Dona Helena é professora.", exEs: "Doña Helena es profesora." },
  coisa: { es: "cosa", type: "sostantivo", exIt: "Guardo muita coisa no quarto.", exEs: "Guardo mucha cosa en el cuarto." },
  vezes: { es: "veces", type: "sostantivo", exIt: "Muitas vezes por dia.", exEs: "Muchas veces al día." },
  gente: { es: "gente", type: "sostantivo", exIt: "Há muita gente na fila.", exEs: "Hay mucha gente en la cola." },
  "gente boa": { es: "buena gente", type: "espressione", exIt: "Os vizinhos são gente boa.", exEs: "Los vecinos son buena gente." },
  desejar: { es: "desear", type: "verbo", exIt: "Deseja algo mais?", exEs: "¿Desea algo más?" },
  "bem-vindo": { es: "bienvenido", type: "aggettivo", exIt: "Bem-vindo ao Porto!", exEs: "¡Bienvenido a Oporto!" },
  "bem-vinda": { es: "bienvenida", type: "aggettivo", exIt: "Bem-vinda a Lisboa!", exEs: "¡Bienvenida a Lisboa!" },
  dois: { es: "dos", type: "numerale", exIt: "Dois cafés, por favor.", exEs: "Dos cafés, por favor." },
  duas: { es: "dos (fem.)", type: "numerale", exIt: "Duas postas de bacalhau.", exEs: "Dos tajadas de bacalao." },
  três: { es: "tres", type: "numerale", exIt: "São três euros.", exEs: "Son tres euros." },
  quatro: { es: "cuatro", type: "numerale", exIt: "Quatro queijos.", exEs: "Cuatro quesos." },
  cinco: { es: "cinco", type: "numerale", exIt: "Cinco minutos a pé.", exEs: "Cinco minutos a pie." },
  seis: { es: "seis", type: "numerale", exIt: "Acordo às seis.", exEs: "Me despierto a las seis." },
  sete: { es: "siete", type: "numerale", exIt: "Abre às sete.", exEs: "Abre a las siete." },
  oito: { es: "ocho", type: "numerale", exIt: "Às oito em ponto.", exEs: "A las ocho en punto." },
  nove: { es: "nueve", type: "numerale", exIt: "A aula começa às nove.", exEs: "La clase empieza a las nueve." },
  dez: { es: "diez", type: "numerale", exIt: "Dez minutos.", exEs: "Diez minutos." },
  onze: { es: "once", type: "numerale", exIt: "O jogo é às onze.", exEs: "El partido es a las once." },
  doze: { es: "doce", type: "numerale", exIt: "São doze euros.", exEs: "Son doce euros." },
  treze: { es: "trece", type: "numerale", exIt: "Almoço à uma e treze?", exEs: "¿Almuerzo a la una y trece?" },
  catorze: { es: "catorce", type: "numerale", exIt: "Catorze euros.", exEs: "Catorce euros." },
  quinze: { es: "quince", type: "numerale", exIt: "O banco fecha às quinze.", exEs: "El banco cierra a las quince." },
  dezassete: { es: "diecisiete", type: "numerale", exIt: "Fecha às dezassete e meia.", exEs: "Cierra a las 17:30." },
  dezanove: { es: "diecinueve", type: "numerale", exIt: "Tem dezanove anos.", exEs: "Tiene diecinueve años." },
  vinte: { es: "veinte", type: "numerale", exIt: "Vinte euros.", exEs: "Veinte euros." },
  trinta: { es: "treinta", type: "numerale", exIt: "Trinta minutos a pé.", exEs: "Treinta minutos a pie." },
  quarenta: { es: "cuarenta", type: "numerale", exIt: "Quarenta euros.", exEs: "Cuarenta euros." },
  cinquenta: { es: "cincuenta", type: "numerale", exIt: "Cinquenta cêntimos.", exEs: "Cincuenta céntimos." },
  sessenta: { es: "sesenta", type: "numerale", exIt: "Meu pai tem sessenta anos.", exEs: "Mi padre tiene sesenta años." },
  setenta: { es: "setenta", type: "numerale", exIt: "Setenta euros.", exEs: "Setenta euros." },
  oitenta: { es: "ochenta", type: "numerale", exIt: "Oitenta euros.", exEs: "Ochenta euros." },
  noventa: { es: "noventa", type: "numerale", exIt: "Noventa por cento de desconto.", exEs: "Noventa por ciento de descuento." },
  cem: { es: "cien", type: "numerale", exIt: "Cem receitas de bacalhau.", exEs: "Cien recetas de bacalao." },
  duzentos: { es: "doscientos", type: "numerale", exIt: "Duzentos euros.", exEs: "Doscientos euros." },
  quinhentos: { es: "quinientos", type: "numerale", exIt: "A renda é quinhentos euros.", exEs: "El alquiler es de quinientos euros." },
  mil: { es: "mil", type: "numerale", exIt: "Mil receitas.", exEs: "Mil recetas." },
  segunda: { es: "lunes (segunda-feira)", type: "sostantivo", exIt: "De segunda a sexta trabalho.", exEs: "De lunes a viernes trabajo." },
  terça: { es: "martes (terça-feira)", type: "sostantivo", exIt: "Terça tem fado na tasca.", exEs: "El martes hay fado en la tasca." },
  quarta: { es: "miércoles (quarta-feira)", type: "sostantivo", exIt: "Quarta vou ao mercado.", exEs: "El miércoles voy al mercado." },
  quinta: { es: "jueves (quinta-feira)", type: "sostantivo", exIt: "Quinta-feira jantamos fora.", exEs: "El jueves cenamos fuera." },
  sexta: { es: "viernes (sexta-feira)", type: "sostantivo", exIt: "Sexta é o dia do peixe.", exEs: "El viernes es el día del pescado." },
  sábado: { es: "sábado", type: "sostantivo", exIt: "Ao sábado durmo até tarde.", exEs: "El sábado duermo hasta tarde." },
  domingo: { es: "domingo", type: "sostantivo", exIt: "Ao domingo almoço com a família.", exEs: "El domingo almuerzo con la familia." },
  janeiro: { es: "enero", type: "sostantivo", exIt: "Os saldos são em janeiro.", exEs: "Las rebajas son en enero." },
  fevereiro: { es: "febrero", type: "sostantivo", exIt: "Fevereiro é frio no norte.", exEs: "Febrero es frío en el norte." },
  março: { es: "marzo", type: "sostantivo", exIt: "Em março há menos turistas.", exEs: "En marzo hay menos turistas." },
  abril: { es: "abril", type: "sostantivo", exIt: "Abril traz as flores.", exEs: "Abril trae las flores." },
  maio: { es: "mayo", type: "sostantivo", exIt: "Maio é bonito em Lisboa.", exEs: "Mayo es bonito en Lisboa." },
  julho: { es: "julio", type: "sostantivo", exIt: "Julho é o mês das férias.", exEs: "Julio es el mes de las vacaciones." },
  agosto: { es: "agosto", type: "sostantivo", exIt: "Agosto é quente.", exEs: "Agosto es caluroso." },
  setembro: { es: "septiembre", type: "sostantivo", exIt: "Setembro é regresso às aulas.", exEs: "Septiembre es vuelta a clases." },
  outubro: { es: "octubre", type: "sostantivo", exIt: "Outubro traz a chuva.", exEs: "Octubre trae la lluvia." },
  novembro: { es: "noviembre", type: "sostantivo", exIt: "Novembro é tranquilo.", exEs: "Noviembre es tranquilo." },
  dezembro: { es: "diciembre", type: "sostantivo", exIt: "Dezembro tem luzes na rua.", exEs: "Diciembre tiene luces en la calle." },
  horas: { es: "horas", type: "sostantivo", exIt: "A que horas chegas?", exEs: "¿A qué horas llegas?" },
  quilo: { es: "kilo", type: "sostantivo", exIt: "Dois euros o quilo.", exEs: "Dos euros el kilo." },
  litro: { es: "litro", type: "sostantivo", exIt: "Meio litro de leite.", exEs: "Medio litro de leche." },
  dúzia: { es: "docena", type: "sostantivo", exIt: "Uma dúzia de ovos.", exEs: "Una docena de huevos." },
  posta: { es: "tajada (de pescado)", type: "sostantivo", exIt: "Duas postas de bacalhau.", exEs: "Dos tajadas de bacalao." },
  ninguém: { es: "nadie", type: "pronome", exIt: "Ninguém está a olhar.", exEs: "Nadie está mirando." },
  alguma: { es: "alguna", type: "aggettivo", exIt: "Mais alguma coisa?", exEs: "¿Alguna cosa más?" },
  "alguma coisa": { es: "algo", type: "pronome", exIt: "Queres alguma coisa?", exEs: "¿Quieres algo?" },
  toda: { es: "toda", type: "aggettivo", exIt: "Toda a gente fala comigo.", exEs: "Toda la gente habla conmigo." },
  esteira: { es: "cinta (de andar)", type: "sostantivo", exIt: "Corro na esteira.", exEs: "Corro en la cinta." },
  ontem: { es: "ayer", type: "avverbio", exIt: "Ontem fui ao mercado.", exEs: "Ayer fui al mercado." },
  quando: { es: "cuándo / cuando", type: "pronome", exIt: "Quando partes?", exEs: "¿Cuándo sales?" },
};

/* ── irregulares: formas → lema del diccionario ───────────────────── */
const IRREGULAR: Record<string, string> = {
  // ser
  sou: "ser", es: "ser", so: "ser", somos: "ser", sao: "ser",
  fui: "ser", foste: "ser", foi: "ser", fomos: "ser", foram: "ser",
  era: "ser", eras: "ser", eramos: "ser", eram: "ser",
  // estar
  estou: "estar", estas: "estar", esta: "estar", estamos: "estar", estao: "estar",
  estava: "estar", estavam: "estar",
  // ter
  tenho: "ter", tens: "ter", tem: "ter", temos: "ter",
  tinha: "ter", tinhas: "ter", tinhamos: "ter", tinham: "ter",
  terei: "ter",
  // ir
  vou: "ir", vais: "ir", vai: "ir", vamos: "ir", vao: "ir",
  ia: "ir", ias: "ir", iamos: "ir", iam: "ir",
  // fazer
  faco: "fazer", fazes: "fazer", faz: "fazer", fazemos: "fazer", fazem: "fazer",
  fiz: "fazer", fizeste: "fazer", fez: "fazer", fizemos: "fazer", fizeram: "fazer",
  // poder
  posso: "poder", podes: "poder", pode: "poder", podemos: "poder", podem: "poder",
  podia: "poder", podias: "poder", podiam: "poder",
  // querer
  quero: "querer", queres: "querer", quer: "querer", queremos: "querer", querem: "querer",
  queria: "querer", querias: "querer", queriamos: "querer", queriam: "querer",
  quis: "querer",
  // haver
  havido: "haver", houve: "haver",
  // dar
  dou: "dar", das: "dar", da: "dar", damos: "dar", dao: "dar",
  // dizer
  digo: "dizer", dizes: "dizer", diz: "dizer", dizemos: "dizer", dizem: "dizer",
  disse: "dizer", disseram: "dizer",
  // vir
  venho: "vir", vens: "vir", vem: "vir", vimos: "vir",
  // trazer
  trago: "trazer", trazes: "trazer", traz: "trazer", trazemos: "trazer", trazem: "trazer",
  // pedir
  peco: "pedir", pedes: "pedir", pede: "pedir", pedimos: "pedir", pedem: "pedir",
  // dormir
  durmo: "dormir", dormes: "dormir", dorme: "dormir", dormimos: "dormir", dormem: "dormir",
  // preferir
  prefiro: "preferir", preferes: "preferir", prefere: "preferir", preferimos: "preferir", preferem: "preferir",
  // saber
  sei: "saber", sabes: "saber", sabe: "saber", sabemos: "saber", sabem: "saber",
  // conhecer
  conheco: "conhecer", conheces: "conhecer", conhece: "conhecer", conhecemos: "conhecer", conhecem: "conhecer",
  // ouvir
  ouco: "ouvir", ouves: "ouvir", ouve: "ouvir", ouvimos: "ouvir", ouvem: "ouvir",
  // ver
  vejo: "ver", ves: "ver", ve: "ver", vemos: "ver", veem: "ver", vi: "ver", viram: "ver",
  // ler
  leio: "ler", les: "ler", le: "ler", lemos: "ler", leem: "ler",
  // escrever
  escrevo: "escrever", escreves: "escrever", escreve: "escrever", escrevemos: "escrever", escrevem: "escrever",
  // comer (reg -er pero 1sg como)
  como: "comer", comes: "comer", come: "comer", comemos: "comer", comem: "comer",
  // beber
  bebo: "beber", bebes: "beber", bebe: "beber", bebemos: "beber", bebem: "beber",
  // abrir
  abro: "abrir", abres: "abrir", abre: "abrir", abrimos: "abrir", abrem: "abrir",
  // partir
  parto: "partir", partes: "partir", parte: "partir", partimos: "partir", partem: "partir",
  // chegar
  chego: "chegar", chegas: "chegar", chega: "chegar", chegamos: "chegar", chegam: "chegar",
  cheguei: "chegar", chegaram: "chegar",
  // começar (ç)
  comeco: "começar", comecas: "começar", comeca: "começar", comecamos: "começar", comecam: "começar",
  // ficar
  fico: "ficar", ficas: "ficar", fica: "ficar", ficamos: "ficar", ficam: "ficar",
  // apanhar
  apanho: "apanhar", apanhas: "apanhar", apanha: "apanhar", apanhamos: "apanhar", apanham: "apanhar",
  // levar
  levo: "levar", levas: "levar", leva: "levar", levamos: "levar", levam: "levar",
  // responder
  respondo: "responder", responde: "responder", respondem: "responder",
  // pagar
  pago: "pagar", pagas: "pagar", paga: "pagar", pagamos: "pagar", pagam: "pagar",
  // morar
  moro: "morar", moras: "morar", mora: "morar", moramos: "morar", moram: "morar",
  // trabalhar
  trabalho: "trabalhar", trabalhas: "trabalhar", trabalha: "trabalhar", trabalhamos: "trabalhar", trabalham: "trabalhar",
  // estudar
  estudo: "estudar", estudas: "estudar", estuda: "estudar", estudamos: "estudar", estudam: "estudar",
  // comprar
  compro: "comprar", compras: "comprar", compra: "comprar", compramos: "comprar", compram: "comprar",
  // falar
  falo: "falar", falas: "falar", fala: "falar", falamos: "falar", falam: "falar",
  // gostar
  gosto: "gostar de", gostas: "gostar de", gosta: "gostar de", gostamos: "gostar de", gostam: "gostar de",
  // adorar
  adoro: "adorar", adoras: "adorar", adora: "adorar", adoramos: "adorar", adoram: "adorar",
  // precisar de
  preciso: "precisar de", precisas: "precisar de", precisa: "precisar de", precisamos: "precisar de", precisam: "precisar de",
  // chamar-se (con clítico el stem llega a chamar)
  chamo: "chamar-se", chamas: "chamar-se", chama: "chamar-se", chamamos: "chamar-se", chamam: "chamar-se",
  // levantar-se
  levanto: "levantar-se", levantas: "levantar-se", levanta: "levantar-se", levantamos: "levantar-se", levantam: "levantar-se",
  // deitar-se
  deito: "deitar-se", deitas: "deitar-se", deita: "deitar-se", deitamos: "deitar-se", deitam: "deitar-se",
  // perder(-se)
  perco: "perder", perdes: "perder", perde: "perder", perdemos: "perder", perdem: "perder",
  // sentir
  sinto: "sentir", sentes: "sentir", sente: "sentir", sentimos: "sentir", sentem: "sentir",
  // acordar
  acordo: "acordar", acordas: "acordar", acorda: "acordar", acordamos: "acordar", acordam: "acordar",
  // demorar
  demoro: "demorar", demoras: "demorar", demora: "demorar", demoramos: "demorar", demoram: "demorar",
  // cozinhar
  cozinho: "cozinhar", cozinhas: "cozinhar", cozinha: "cozinhar", cozinhamos: "cozinhar", cozinham: "cozinhar",
  // experimentar
  experimento: "experimentar", experimentas: "experimentar", experimenta: "experimentar", experimentamos: "experimentar", experimentam: "experimentar",
  // esperar
  espero: "esperar", esperas: "esperar", espera: "esperar", esperamos: "esperar", esperam: "esperar",
  // passar
  passo: "passar", passas: "passar", passa: "passar", passamos: "passar", passam: "passar",
  // subir / descer
  subo: "subir", sobe: "subir", subimos: "subir", sobem: "subir",
  desco: "descer", desces: "descer", desce: "descer", descemos: "descer", descem: "descer",
  // entrar / sair
  entro: "entrar", entras: "entrar", entra: "entrar", entramos: "entrar", entram: "entrar",
  saio: "sair", sais: "sair", sai: "sair", saimos: "sair", saem: "sair",
  // voltar
  volto: "voltar", voltas: "voltar", volta: "voltar", voltamos: "voltar", voltam: "voltar",
  // custar
  custo: "custar", custas: "custar", custa: "custar", custamos: "custar", custam: "custar",
  // jogar
  jogo: "jogar", jogas: "jogar", joga: "jogar", jogamos: "jogar", jogam: "jogar",
  // ganhar / perder ya arriba
  ganho: "ganhar", ganhas: "ganhar", ganha: "ganhar", ganhamos: "ganhar", ganham: "ganhar",
  // perguntar
  pergunto: "perguntar", perguntas: "perguntar", pergunta: "perguntar", perguntamos: "perguntar", perguntam: "perguntar",
  // ajudar
  ajudo: "ajudar", ajudas: "ajudar", ajuda: "ajudar", ajudamos: "ajudar", ajudam: "ajudar",
  // mostrar
  mostro: "mostrar", mostras: "mostrar", mostra: "mostrar", mostramos: "mostrar", mostram: "mostrar",
  // contar
  conto: "contar", contas: "contar", conta: "contar", contamos: "contar", contam: "contar",
  // explicar / significar
  explico: "explicar", explica: "explicar", explicam: "explicar",
  significa: "significar", significam: "significar",
  // ir a pie: vou a pé handled by words
};

/* ── síntesis de entrada suplemento (cuando el lema no está en PT_DICT) ── */
/* ── pre-check raw: acentos que distinguen significado ──────────────
   «está» (verbo) vs «esta» (demostrativo), «é» (ser) vs «e» (y),
   «às» (a+as) vs «as» (artículo). La clave conserva los acentos.   */
const RAW_PRECHECK: Record<string, string> = {
  "é": "ser", "és": "ser", "são": "ser",
  "está": "estar", "estás": "estar", "estão": "estar",
  "às": "às", "à": "à",
};

/* v9.23 · alias normalizados del SUPPLEMENT: las claves con diacríticos
   (há, três, terça, sábado, março, dúzia, ninguém) nunca casaban con la
   búsqueda normalizada. La clave literal conserva prioridad.        */
let SUP_NORM: Map<string, SupInfo> | null = null;
function supNorm(): Map<string, SupInfo> {
  if (SUP_NORM) return SUP_NORM;
  SUP_NORM = new Map<string, SupInfo>();
  for (const [k, v] of Object.entries(SUPPLEMENT)) {
    const nk = norm(k);
    if (!SUP_NORM.has(nk)) SUP_NORM.set(nk, v);
  }
  return SUP_NORM;
}

function synthEntry(lemma: string, info: SupInfo, kind: SupKind): VocabWord {
  return {
    id: `pt-${kind}-${norm(lemma).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    it: lemma,
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

/** Busca la entrada del diccionario PT para una forma flexionada. */
export function lookupWordPt(form: string): VocabWord | undefined {
  const raw = form.trim();
  if (!raw) return undefined;

  // 0 · limpiar puntuación extrema (comillas, guiones de diálogo, símbolos)
  let w = raw.toLowerCase().replace(/^[^a-zà-ÿ-]+|[^a-zà-ÿ-]+$/g, "");
  if (!w) return undefined;

  // 1 · separar clítico: chamo-me → chamo (+me)
  const { stem: stem0 } = stripClitic(w);
  w = stem0;
  if (!w) return undefined;

  // 1.bis · pre-check raw (acento distintivo): está/é/às antes del índice normalizado
  let hit: VocabWord | undefined;
  const rawPre = RAW_PRECHECK[w];
  if (rawPre) {
    if (rawPre === "às") {
      const s = SUPPLEMENT["às"];
      if (s) return synthEntry("às", s, "fw");
    } else {
      hit = find(rawPre);
      if (hit) return hit;
    }
  }

  // 2 · forma exacta (con y sin clítico ya resuelto)
  hit = find(w);
  if (hit) return hit;

  // 2.bis · suplemento exacto
  const n = norm(w);
  const sup = supNorm().get(n);
  if (sup) return synthEntry(n, sup, ["às", "aos", "dos", "das", "nos", "nas", "pelo", "pela", "pelos", "pelas", "num", "numa", "dum", "duma", "há"].includes(n) ? "fw" : "sup");

  // 3 · irregulares (clave normalizada sin acentos)
  const irr = IRREGULAR[n];
  if (irr) {
    hit = find(irr);
    if (hit) return hit;
    // lema con guion (gostar de, chamar-se, precisar de)
    const supIrr = supNorm().get(norm(irr));
    if (supIrr) return synthEntry(irr, supIrr, "sup");
  }

  // 4 · plurales de sustantivos: -s / -es / -ões→-ão / -ães→-ão
  const PLURAL_RULES: [RegExp, (m: string) => string[]][] = [
    [/ões$/, (m) => [m.slice(0, -4) + "ão"]],
    [/ães$/, (m) => [m.slice(0, -4) + "ão"]],
    [/aes$/, (m) => [m.slice(0, -4) + "ão"]],
    [/ais$/, (m) => [m.slice(0, -3) + "al"]],
    [/eis$/, (m) => [m.slice(0, -3) + "el", m.slice(0, -3) + "eu"]],
    [/óis$/, (m) => [m.slice(0, -3) + "ol"]],
    [/is$/, (m) => [m.slice(0, -2) + "l"]],
    [/es$/, (m) => [m.slice(0, -2)]],
    [/s$/, (m) => [m.slice(0, -1)]],
  ];
  for (const [re, mk] of PLURAL_RULES) {
    if (re.test(n)) {
      for (const c of mk(n)) {
        hit = find(c) ?? find(c.replace(/ões$/, "ão"));
        if (hit) return hit;
        // probar también el masculino singular desde el femenino plural: laranjas→laranja ✓
        if (/as$/.test(n)) {
          const masc = c.replace(/a$/, "o");
          hit = find(masc);
          if (hit) return hit;
        }
        const supP = supNorm().get(c);
        if (supP) return synthEntry(c, supP, "sup");
      }
    }
  }

  // 5 · femeninos singulares: vendedora→vendedor, nova→novo, boa→bom, portuguesa→português
  if (/a$/.test(n) && n.length > 3) {
    const cands = [
      n.replace(/ora$/, "or"),     // vendedora → vendedor
      n.replace(/eira$/, "eiro"),  // cozinheira → cozinheiro
      n.replace(/ana$/, "ano"),    // portuense... (raro)
      n.slice(0, -1) + "o",        // nova → novo
      n.slice(0, -1),              // maria → mari? no; mas "professora"→"professor"
      n.replace(/esa$/, "ês"),     // portuguesa → português
    ];
    for (const c of cands) {
      hit = find(c);
      if (hit) return hit;
    }
  }

  // 6 · formas verbales regulares: falo/falas/fala/falamos/falam → falar
  const VERB_ENDINGS: [string, string][] = [
    // 1ª conjugación -ar
    ["amos", "ar"], ["am", "ar"], ["o", "ar"], ["as", "ar"], ["a", "ar"],
    // 2ª -er
    ["emos", "er"], ["em", "er"], ["o", "er"], ["es", "er"], ["e", "er"],
    // 3ª -ir
    ["imos", "ir"], ["em", "ir"], ["o", "ir"], ["is", "ir"], ["e", "ir"],
  ];

  // presente de indicativo regular
  for (const [end, inf] of VERB_ENDINGS) {
    if (n.endsWith(end) && n.length > end.length + 1) {
      const stem = n.slice(0, -end.length);
      // reconstruir infinitivo: stem + terminación de infinitivo
      const cands = [stem + inf];
      // alternancia c/ç: comec- → começar
      cands.push(stem.replace(/c$/, "ç") + "ar");
      // alternancia e/i, o/u (regulares en pt: pedir→peço irregular ya arriba)
      for (const c of cands) {
        hit = find(c);
        if (hit) return hit;
        const supV = supNorm().get(c);
        if (supV) return synthEntry(c, supV, "sup");
      }
    }
  }

  // 7 · gerúndio: falando→falar, comendo→comer, partindo→partir
  if (n.endsWith("ndo") && n.length > 5) {
    const stem = n.slice(0, -3);
    for (const c of [stem + "ar", stem + "er", stem + "ir"]) {
      hit = find(c);
      if (hit) return hit;
    }
  }

  // 8 · particípio: falado→falar, comido→comer, partido→partir
  if (n.endsWith("ado") && n.length > 5) {
    const stem = n.slice(0, -3);
    hit = find(stem + "ar");
    if (hit) return hit;
  }
  if (n.endsWith("ido") && n.length > 5) {
    const stem = n.slice(0, -3);
    for (const c of [stem + "er", stem + "ir"]) {
      hit = find(c);
      if (hit) return hit;
    }
  }

  // 9 · imperfecto: falava→falar, comia→comer
  if (n.endsWith("ava") && n.length > 5) {
    const stem = n.slice(0, -3);
    for (const c of [stem + "ar"]) {
      hit = find(c);
      if (hit) return hit;
    }
  }
  if (n.endsWith("ia") && n.length > 4) {
    const stem = n.slice(0, -2);
    for (const c of [stem + "er", stem + "ir"]) {
      hit = find(c);
      if (hit) return hit;
    }
  }

  return undefined;
}
