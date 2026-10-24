import type { VocabWord, WordCategory } from "./types";
import { VOCAB_EXTRA } from "./extra/vocabulary-extra";
import { DICT_PACKS } from "./dict";
import { IT_MEGA } from "./dict/lang-it-mega";

/* ── Vocabolario · learning dictionary (IT→ES) ────────────────────── */

const W = (
  id: string, it: string, es: string, pron: string,
  type: VocabWord["type"], cat: WordCategory, level: VocabWord["level"],
  example: { it: string; es: string },
  extra?: Partial<Omit<VocabWord, "id" | "it" | "es" | "pron" | "type" | "cat" | "level" | "example">>
): VocabWord => ({ id, it, es, pron, type, cat, level, example, ...extra });

export const VOCAB: VocabWord[] = [
  /* saluti */
  W("w-ciao", "ciao", "hola / chao", "cháo", "espressione", "saluti", "A1", { it: "Ciao, come stai?", es: "Hola, ¿cómo estás?" }, { syn: ["salve"], related: ["arrivederci"] }),
  W("w-buongiorno", "buongiorno", "buenos días", "buenyórno", "espressione", "saluti", "A1", { it: "Buongiorno, signora Rossi!", es: "¡Buenos días, señora Rossi!" }, { related: ["buonasera", "buonanotte"] }),
  W("w-buonasera", "buonasera", "buenas tardes/noches", "buenaséra", "espressione", "saluti", "A1", { it: "Buonasera, benvenuto!", es: "¡Buenas noches, bienvenido!" }),
  W("w-buonanotte", "buonanotte", "buenas noches (al dormir)", "buonanótte", "espressione", "saluti", "A1", { it: "Buonanotte, sogni d'oro!", es: "Buenas noches, ¡dulces sueños!" }),
  W("w-arrivederci", "arrivederci", "adiós (formal)", "arrivedérchi", "espressione", "saluti", "A1", { it: "Arrivederci e grazie!", es: "¡Adiós y gracias!" }, { related: ["ciao"] }),
  W("w-grazie", "grazie", "gracias", "grátsie", "espressione", "saluti", "A1", { it: "Grazie mille per l'aiuto!", es: "¡Muchas gracias por la ayuda!" }, { ant: ["prego (respuesta)"] }),
  W("w-prego", "prego", "de nada / por favor (invitación)", "prégo", "espressione", "saluti", "A1", { it: "Prego, si accomodi.", es: "Por favor, siéntese." }),
  W("w-scusa", "scusa", "perdón / disculpa", "eskúa", "espressione", "saluti", "A1", { it: "Scusa, dov'è la stazione?", es: "Disculpa, ¿dónde está la estación?" }, { related: ["scusi (formal)"] }),
  W("w-perfavore", "per favore", "por favor", "per favóre", "espressione", "saluti", "A1", { it: "Un caffè, per favore.", es: "Un café, por favor." }),
  W("w-comestai", "come stai?", "¿cómo estás?", "kome stái", "espressione", "saluti", "A1", { it: "Ciao Marco, come stai?", es: "Hola Marco, ¿cómo estás?" }, { related: ["come sta? (formal)"] }),

  /* famiglia */
  W("w-madre", "madre", "madre", "mádre", "sostantivo", "famiglia", "A1", { it: "Mia madre cucina molto bene.", es: "Mi madre cocina muy bien." }, { gender: "f", plural: "madri", syn: ["mamma"] }),
  W("w-padre", "padre", "padre", "pádre", "sostantivo", "famiglia", "A1", { it: "Mio padre lavora a Milano.", es: "Mi padre trabaja en Milán." }, { gender: "m", plural: "padri", syn: ["papà"] }),
  W("w-fratello", "fratello", "hermano", "fratéllo", "sostantivo", "famiglia", "A1", { it: "Ho un fratello e due sorelle.", es: "Tengo un hermano y dos hermanas." }, { gender: "m", plural: "fratelli" }),
  W("w-sorella", "sorella", "hermana", "soréla", "sostantivo", "famiglia", "A1", { it: "Mia sorella si chiama Laura.", es: "Mi hermana se llama Laura." }, { gender: "f", plural: "sorelle" }),
  W("w-figlio", "figlio", "hijo", "fíyo", "sostantivo", "famiglia", "A1", { it: "Il loro figlio ha cinque anni.", es: "Su hijo tiene cinco años." }, { gender: "m", plural: "figli", ant: ["genitore"] }),
  W("w-nonna", "nonna", "abuela", "nónna", "sostantivo", "famiglia", "A1", { it: "La nonna prepara la pasta.", es: "La abuela prepara la pasta." }, { gender: "f", plural: "nonne" }),
  W("w-nonno", "nonno", "abuelo", "nónno", "sostantivo", "famiglia", "A1", { it: "Il nonno racconta storie belle.", es: "El abuelo cuenta historias bonitas." }, { gender: "m", plural: "nonni" }),
  W("w-moglie", "moglie", "esposa / mujer", "mólye", "sostantivo", "famiglia", "A2", { it: "Mia moglie è medico.", es: "Mi esposa es médica." }, { gender: "f", plural: "mogli", ant: ["marito"] }),
  W("w-marito", "marito", "esposo / marido", "márito", "sostantivo", "famiglia", "A2", { it: "Su marito è simpatico.", es: "Su marido es simpático." }, { gender: "m", plural: "mariti" }),

  /* casa */
  W("w-casa", "casa", "casa", "káza", "sostantivo", "casa", "A1", { it: "La mia casa è piccola ma accogliente.", es: "Mi casa es pequeña pero acogedora." }, { gender: "f", plural: "case" }),
  W("w-cucina", "cucina", "cocina", "kuchína", "sostantivo", "casa", "A1", { it: "La cucina è il cuore della casa.", es: "La cocina es el corazón de la casa." }, { gender: "f", plural: "cucine" }),
  W("w-camera", "camera", "habitación / cuarto", "kámara", "sostantivo", "casa", "A1", { it: "La mia camera ha una finestra grande.", es: "Mi habitación tiene una ventana grande." }, { gender: "f", plural: "camere" }),
  W("w-bagno", "bagno", "baño", "bányo", "sostantivo", "casa", "A1", { it: "Dov'è il bagno, per favore?", es: "¿Dónde está el baño, por favor?" }, { gender: "m", plural: "bagni" }),
  W("w-porta", "porta", "puerta", "pórta", "sostantivo", "casa", "A1", { it: "Chiudi la porta, per favore!", es: "¡Cierra la puerta, por favor!" }, { gender: "f", plural: "porte", syn: ["portone (portón)"] }),
  W("w-tavolo", "tavolo", "mesa", "távolo", "sostantivo", "casa", "A1", { it: "Il libro è sul tavolo.", es: "El libro está sobre la mesa." }, { gender: "m", plural: "tavoli" }),
  W("w-chiave", "chiave", "llave", "kiáve", "sostantivo", "casa", "A1", { it: "Ho perso le chiavi di casa!", es: "¡He perdido las llaves de casa!" }, { gender: "f", plural: "chiavi" }),
  W("w-letto", "letto", "cama", "létto", "sostantivo", "casa", "A1", { it: "Vado a letto presto.", es: "Me voy a la cama temprano." }, { gender: "m", plural: "letti" }),

  /* alimentazione */
  W("w-pane", "pane", "pan", "páne", "sostantivo", "alimentazione", "A1", { it: "Un chilo di pane, per favore.", es: "Un kilo de pan, por favor." }, { gender: "m", plural: "pani" }),
  W("w-acqua", "acqua", "agua", "ákua", "sostantivo", "alimentazione", "A1", { it: "Un bicchiere d'acqua, per favore.", es: "Un vaso de agua, por favor." }, { gender: "f", plural: "acque" }),
  W("w-caffe", "caffè", "café", "kaffé", "sostantivo", "alimentazione", "A1", { it: "Il caffè italiano è famoso nel mondo.", es: "El café italiano es famoso en el mundo." }, { gender: "m", plural: "caffè" }),
  W("w-formaggio", "formaggio", "queso", "formáyyo", "sostantivo", "alimentazione", "A1", { it: "Il parmigiano è un formaggio eccellente.", es: "El parmesano es un queso excelente." }, { gender: "m", plural: "formaggi" }),
  W("w-vino", "vino", "vino", "víno", "sostantivo", "alimentazione", "A1", { it: "Un bicchiere di vino rosso.", es: "Una copa de vino tinto." }, { gender: "m", plural: "vini" }),
  W("w-frutta", "frutta", "fruta", "frútta", "sostantivo", "alimentazione", "A1", { it: "Mangio frutta ogni giorno.", es: "Como fruta cada día." }, { gender: "f" }),
  W("w-carne", "carne", "carne", "kárne", "sostantivo", "alimentazione", "A2", { it: "Non mangio carne.", es: "No como carne." }, { gender: "f" }),
  W("w-pesce", "pesce", "pescado / pez", "péshe", "sostantivo", "alimentazione", "A2", { it: "Il pesce fresco del mercato.", es: "El pescado fresco del mercado." }, { gender: "m", plural: "pesci", note: "Animal vivo = pez (i pesci del mare); como alimento = pescado (il pesce al forno)." }),

  /* ristorante */
  W("w-ristorante", "ristorante", "restaurante", "ristoránte", "sostantivo", "ristorante", "A1", { it: "Prenoto un tavolo al ristorante.", es: "Reservo una mesa en el restaurante." }, { gender: "m", plural: "ristoranti" }),
  W("w-menu", "menù", "menú / carta", "menú", "sostantivo", "ristorante", "A1", { it: "Posso vedere il menù?", es: "¿Puedo ver el menú?" }, { gender: "m", plural: "menù" }),
  W("w-cameriere", "cameriere", "camarero / mesero", "kameriére", "sostantivo", "ristorante", "A1", { it: "Cameriere, il conto per favore!", es: "¡Camarero, la cuenta por favor!" }, { gender: "m", plural: "camerieri" }),
  W("w-conto", "conto", "cuenta", "kónto", "sostantivo", "ristorante", "A1", { it: "Il conto, per favore.", es: "La cuenta, por favor." }, { gender: "m", plural: "conti" }),
  W("w-antipasto", "antipasto", "entrante / aperitivo", "antipásto", "sostantivo", "ristorante", "A2", { it: "Da antipasto prendo un bruschetta.", es: "De entrante pido una bruscheta." }, { gender: "m", plural: "antipasti", related: ["primo", "secondo", "dolce"] }),
  W("w-primo", "primo", "primer plato (pasta/arroz)", "prímo", "sostantivo", "ristorante", "A2", { it: "Per primo mangio gli spaghetti.", es: "De primero como espaguetis." }, { gender: "m", plural: "primi" }),
  W("w-dolce", "dolce", "postre", "dólche", "sostantivo", "ristorante", "A2", { it: "Che dolce c'è oggi?", es: "¿Qué postre hay hoy?" }, { gender: "m", plural: "dolci", ant: ["amaro"] }),
  W("w-forchetta", "forchetta", "tenedor", "forkétta", "sostantivo", "ristorante", "A1", { it: "Mi passi la forchetta?", es: "¿Me pasas el tenedor?" }, { gender: "f", plural: "forchette", related: ["coltello", "cucchiaio"] }),

  /* compras */
  W("w-negozio", "negozio", "tienda", "neyótsio", "sostantivo", "compras", "A1", { it: "Il negozio apre alle nove.", es: "La tienda abre a las nueve." }, { gender: "m", plural: "negozi" }),
  W("w-prezzo", "prezzo", "precio", "prétso", "sostantivo", "compras", "A1", { it: "Qual è il prezzo di questo?", es: "¿Cuál es el precio de esto?" }, { gender: "m", plural: "prezzi", syn: ["costo"] }),
  W("w-comprare", "comprare", "comprar", "kompráre", "verbo", "compras", "A1", { it: "Voglio comprare un regalo.", es: "Quiero comprar un regalo." }, { ant: ["vendere"] }),
  W("w-costare", "costare", "costar", "kostáre", "verbo", "compras", "A1", { it: "Quanto costa questo cappello?", es: "¿Cuánto cuesta este sombrero?" }),
  W("w-sconto", "sconto", "descuento", "skónto", "sostantivo", "compras", "A2", { it: "C'è uno sconto del 20%.", es: "Hay un descuento del 20%." }, { gender: "m", plural: "sconti" }),
  W("w-pagare", "pagare", "pagar", "pagáre", "verbo", "compras", "A1", { it: "Pago in contanti.", es: "Pago en efectivo." }, { related: ["contanti", "carta di credito"] }),
  W("w-mercato", "mercato", "mercado", "merkáto", "sostantivo", "compras", "A1", { it: "Al mercato la frutta è più fresca.", es: "En el mercado la fruta es más fresca." }, { gender: "m", plural: "mercati" }),

  /* transporte */
  W("w-treno", "treno", "tren", "tréno", "sostantivo", "transporte", "A1", { it: "Il treno per Roma parte alle otto.", es: "El tren a Roma sale a las ocho." }, { gender: "m", plural: "treni" }),
  W("w-autobus", "autobus", "autobús", "áutobus", "sostantivo", "transporte", "A1", { it: "L'autobus è in ritardo.", es: "El autobús va con retraso." }, { gender: "m", plural: "autobus" }),
  W("w-biglietto", "biglietto", "billete / boleto", "bilyétto", "sostantivo", "transporte", "A1", { it: "Un biglietto per Firenze, per favore.", es: "Un billete para Florencia, por favor." }, { gender: "m", plural: "biglietti" }),
  W("w-stazione", "stazione", "estación", "statsióne", "sostantivo", "transporte", "A1", { it: "La stazione è vicino all'hotel.", es: "La estación está cerca del hotel." }, { gender: "f", plural: "stazioni" }),
  W("w-macchina", "macchina", "coche / carro", "mákina", "sostantivo", "transporte", "A1", { it: "La macchina è parcheggiata qui.", es: "El coche está aparcado aquí." }, { gender: "f", plural: "macchine", syn: ["automobile"] }),
  W("w-strada", "strada", "calle / carretera", "stráda", "sostantivo", "transporte", "A1", { it: "Questa strada è molto trafficata.", es: "Esta calle tiene mucho tráfico." }, { gender: "f", plural: "strade" }),
  W("w-fermata", "fermata", "parada", "fermáta", "sostantivo", "transporte", "A2", { it: "Scendo alla prossima fermata.", es: "Me bajo en la próxima parada." }, { gender: "f", plural: "fermate" }),

  /* viaggi */
  W("w-viaggio", "viaggio", "viaje", "viáyyo", "sostantivo", "viaggi", "A2", { it: "Buon viaggio!", es: "¡Buen viaje!" }, { gender: "m", plural: "viaggi" }),
  W("w-valigia", "valigia", "maleta", "valíya", "sostantivo", "viaggi", "A2", { it: "Ho fatto la valigia ieri sera.", es: "Hice la maleta anoche." }, { gender: "f", plural: "valigie" }),
  W("w-aeroporto", "aeroporto", "aeropuerto", "aeropórto", "sostantivo", "viaggi", "A2", { it: "L'aeroporto è lontano dal centro.", es: "El aeropuerto está lejos del centro." }, { gender: "m", plural: "aeroporti" }),
  W("w-volo", "volo", "vuelo", "vólo", "sostantivo", "viaggi", "A2", { it: "Il volo è in ritardo di un'ora.", es: "El vuelo se retrasa una hora." }, { gender: "m", plural: "voli" }),
  W("w-passaporto", "passaporto", "pasaporte", "pasapórto", "sostantivo", "viaggi", "A2", { it: "Il passaporto, per favore.", es: "El pasaporte, por favor." }, { gender: "m", plural: "passaporti" }),
  W("w-prenotare", "prenotare", "reservar", "prenotáre", "verbo", "viaggi", "A2", { it: "Voglio prenotare una camera.", es: "Quiero reservar una habitación." }, { syn: ["riservare"] }),

  /* hotel */
  W("w-albergo", "albergo", "hotel", "albérgo", "sostantivo", "hotel", "A2", { it: "L'albergo ha vista sul mare.", es: "El hotel tiene vistas al mar." }, { gender: "m", plural: "alberghi", syn: ["hotel"] }),
  W("w-prenotazione", "prenotazione", "reserva", "prenotatsióne", "sostantivo", "hotel", "A2", { it: "Ho una prenotazione a nome Rossi.", es: "Tengo una reserva a nombre Rossi." }, { gender: "f", plural: "prenotazioni" }),
  W("w-colazione", "colazione", "desayuno", "kolatsióne", "sostantivo", "hotel", "A2", { it: "La colazione è inclusa?", es: "¿Está incluido el desayuno?" }, { gender: "f", plural: "colazioni" }),
  W("w-camerasingola", "camera singola", "habitación individual", "kámara síngola", "espressione", "hotel", "A2", { it: "Vorrei una camera singola.", es: "Querría una habitación individual." }),
  W("w-reception", "reception", "recepción", "richépyon", "sostantivo", "hotel", "A2", { it: "Chiedo alla reception.", es: "Pregunto en recepción." }, { gender: "f" }),

  /* salud */
  W("w-medico", "medico", "médico / doctor", "médiko", "sostantivo", "salud", "A2", { it: "Devo andare dal medico.", es: "Tengo que ir al médico." }, { gender: "m", plural: "medici", related: ["dottore"] }),
  W("w-farmacia", "farmacia", "farmacia", "farmácha", "sostantivo", "salud", "A2", { it: "C'è una farmacia qui vicino?", es: "¿Hay una farmacia aquí cerca?" }, { gender: "f", plural: "farmacie" }),
  W("w-malato", "malato", "enfermo", "maláto", "aggettivo", "salud", "A2", { it: "Mi sento malato, oggi non vado al lavoro.", es: "Me siento enfermo, hoy no voy al trabajo." }, { ant: ["sano"] }),
  W("w-dolore", "dolore", "dolor", "dolóre", "sostantivo", "salud", "A2", { it: "Ho un forte dolore alla testa.", es: "Tengo un dolor de cabeza fuerte." }, { gender: "m", plural: "dolori" }),
  W("w-febbre", "febbre", "fiebre", "fébbre", "sostantivo", "salud", "A2", { it: "Ho la febbre a 38 gradi.", es: "Tengo 38 grados de fiebre." }, { gender: "f" }),
  W("w-medicina", "medicina", "medicina (fármaco)", "medichína", "sostantivo", "salud", "A2", { it: "Prendo la medicina dopo pranzo.", es: "Tomo la medicina después de comer." }, { gender: "f", plural: "medicine" }),

  /* lavoro */
  W("w-lavoro", "lavoro", "trabajo", "lavóro", "sostantivo", "lavoro", "B1", { it: "Cerco un lavoro a Roma.", es: "Busco un trabajo en Roma." }, { gender: "m", plural: "lavori" }),
  W("w-riunione", "riunione", "reunión", "riunióne", "sostantivo", "lavoro", "B1", { it: "La riunione comincia alle dieci.", es: "La reunión empieza a las diez." }, { gender: "f", plural: "riunioni", syn: ["meeting"] }),
  W("w-collega", "collega", "colega", "kóllega", "sostantivo", "lavoro", "B1", { it: "Il mio collega è in ferie.", es: "Mi colega está de vacaciones." }, { gender: "m", plural: "colleghi" }),
  W("w-stipendio", "stipendio", "sueldo / salario", "stipéndio", "sostantivo", "lavoro", "B1", { it: "Lo stipendio non è alto.", es: "El sueldo no es alto." }, { gender: "m", plural: "stipendi", syn: ["salario"] }),
  W("w-colloquio", "colloquio", "entrevista (de trabajo)", "kolókio", "sostantivo", "lavoro", "B1", { it: "Domani ho un colloquio di lavoro.", es: "Mañana tengo una entrevista de trabajo." }, { gender: "m", plural: "colloqui" }),
  W("w-contratto", "contratto", "contrato", "kontrátto", "sostantivo", "lavoro", "B1", { it: "Ho firmato un contratto di un anno.", es: "He firmado un contrato de un año." }, { gender: "m", plural: "contratti" }),

  /* studi */
  W("w-scuola", "scuola", "escuela", "skuóla", "sostantivo", "studi", "A1", { it: "I bambini vanno a scuola a piedi.", es: "Los niños van a la escuela a pie." }, { gender: "f", plural: "scuole" }),
  W("w-universita", "università", "universidad", "universitá", "sostantivo", "studi", "A2", { it: "Studio all'università di Bologna.", es: "Estudio en la universidad de Bolonia." }, { gender: "f", plural: "università" }),
  W("w-studente", "studente", "estudiante", "studénte", "sostantivo", "studi", "A1", { it: "Sono uno studente di italiano.", es: "Soy un estudiante de italiano." }, { gender: "m", plural: "studenti" }),
  W("w-insegnante", "insegnante", "maestro / profesor", "inseñánte", "sostantivo", "studi", "A1", { it: "L'insegnante è molto paziente.", es: "El profesor es muy paciente." }, { gender: "m", plural: "insegnanti", syn: ["professore", "maestro"] }),
  W("w-esame", "esame", "examen", "esáme", "sostantivo", "studi", "A2", { it: "L'esame di grammatica è difficile.", es: "El examen de gramática es difícil." }, { gender: "m", plural: "esami" }),
  W("w-lezione", "lezione", "lección", "letsióne", "sostantivo", "studi", "A1", { it: "La lezione dura un'ora.", es: "La lección dura una hora." }, { gender: "f", plural: "lezioni" }),
  W("w-libro", "libro", "libro", "líbro", "sostantivo", "studi", "A1", { it: "Questo libro è interessante.", es: "Este libro es interesante." }, { gender: "m", plural: "libri" }),

  /* citta */
  W("w-citta", "città", "ciudad", "chitá", "sostantivo", "citta", "A1", { it: "Roma è una città eterna.", es: "Roma es una ciudad eterna." }, { gender: "f", plural: "città" }),
  W("w-piazza", "piazza", "plaza", "piátsa", "sostantivo", "citta", "A1", { it: "Ci vediamo in piazza.", es: "Nos vemos en la plaza." }, { gender: "f", plural: "piazze" }),
  W("w-museo", "museo", "museo", "muséo", "sostantivo", "citta", "A1", { it: "Il museo è chiuso il lunedì.", es: "El museo está cerrado los lunes." }, { gender: "m", plural: "musei" }),
  W("w-chiesa", "chiesa", "iglesia", "kiéza", "sostantivo", "citta", "A1", { it: "La chiesa è del XIII secolo.", es: "La iglesia es del siglo XIII." }, { gender: "f", plural: "chiese" }),
  W("w-centro", "centro", "centro", "chéntro", "sostantivo", "citta", "A1", { it: "Abito in centro storico.", es: "Vivo en el centro histórico." }, { gender: "m", plural: "centri" }),
  W("w-ponte", "ponte", "puente", "pónte", "sostantivo", "citta", "A2", { it: "Il Ponte Vecchio è a Firenze.", es: "El Ponte Vecchio está en Florencia." }, { gender: "m", plural: "ponti" }),

  /* clima */
  W("w-sole", "sole", "sol", "sóle", "sostantivo", "clima", "A1", { it: "Oggi c'è il sole.", es: "Hoy hace sol." }, { gender: "m", plural: "soli" }),
  W("w-pioggia", "pioggia", "lluvia", "pyóyya", "sostantivo", "clima", "A1", { it: "La pioggia è arrivata all'improvviso.", es: "La lluvia llegó de repente." }, { gender: "f", plural: "piogge" }),
  W("w-neve", "neve", "nieve", "néve", "sostantivo", "clima", "A1", { it: "In montagna c'è tanta neve.", es: "En la montaña hay mucha nieve." }, { gender: "f" }),
  W("w-vento", "vento", "viento", "vénto", "sostantivo", "clima", "A1", { it: "Che vento forte oggi!", es: "¡Qué viento tan fuerte hoy!" }, { gender: "m", plural: "venti" }),
  W("w-caldo", "caldo", "calor / caliente", "kálido", "aggettivo", "clima", "A1", { it: "Che caldo! Ho sete.", es: "¡Qué calor! Tengo sed." }, { ant: ["freddo"] }),
  W("w-freddo", "freddo", "frío", "fréddo", "aggettivo", "clima", "A1", { it: "In inverno fa molto freddo.", es: "En invierno hace mucho frío." }, { ant: ["caldo"] }),

  /* ropa */
  W("w-camicia", "camicia", "camisa", "kamícha", "sostantivo", "ropa", "A2", { it: "Questa camicia è di cotone.", es: "Esta camisa es de algodón." }, { gender: "f", plural: "camicie" }),
  W("w-pantaloni", "pantaloni", "pantalones", "pantalóni", "sostantivo", "ropa", "A2", { it: "Questi pantaloni sono stretti.", es: "Estos pantalones están apretados." }, { gender: "m", plural: "pantaloni" }),
  W("w-vestito", "vestito", "vestido", "vestíto", "sostantivo", "ropa", "A2", { it: "Che bel vestito!", es: "¡Qué vestido tan bonito!" }, { gender: "m", plural: "vestiti" }),
  W("w-scarpe", "scarpe", "zapatos", "skárpe", "sostantivo", "ropa", "A1", { it: "Queste scarpe sono comode.", es: "Estos zapatos son cómodos." }, { gender: "f", plural: "scarpe" }),
  W("w-maglione", "maglione", "suéter", "malyóne", "sostantivo", "ropa", "A2", { it: "D'inverno metto il maglione.", es: "En invierno me pongo el suéter." }, { gender: "m", plural: "maglioni" }),
  W("w-borsa", "borsa", "bolso / bolsa", "bórsa", "sostantivo", "ropa", "A1", { it: "Ho perso la borsa!", es: "¡He perdido el bolso!" }, { gender: "f", plural: "borse" }),

  /* tecnologia */
  W("w-computer", "computer", "computadora / ordenador", "kompyúter", "sostantivo", "tecnologia", "A2", { it: "Il mio computer è lento.", es: "Mi computadora es lenta." }, { gender: "m", plural: "computer" }),
  W("w-telefono", "telefono", "teléfono", "teléfoño", "sostantivo", "tecnologia", "A1", { it: "Il mio telefono non ha batteria.", es: "Mi teléfono no tiene batería." }, { gender: "m", plural: "telefoni", syn: ["cellulare (móvil)"] }),
  W("w-messaggio", "messaggio", "mensaje", "mesáyyo", "sostantivo", "tecnologia", "A2", { it: "Ti ho mandato un messaggio.", es: "Te he mandado un mensaje." }, { gender: "m", plural: "messaggi" }),
  W("w-password", "password", "contraseña", "pássuord", "sostantivo", "tecnologia", "A2", { it: "Ho dimenticato la password.", es: "He olvidado la contraseña." }, { gender: "f", plural: "password" }),
  W("w-internet", "Internet", "internet", "ínternet", "sostantivo", "tecnologia", "A1", { it: "Il wifi non funziona, cerco internet.", es: "El wifi no funciona, busco internet." }, { gender: "m" }),

  /* sport */
  W("w-calcio", "calcio", "fútbol", "kálcho", "sostantivo", "sport", "A2", { it: "Il calcio è lo sport nazionale.", es: "El fútbol es el deporte nacional." }, { gender: "m" }),
  W("w-partita", "partita", "partido", "partíta", "sostantivo", "sport", "A2", { it: "Stasera c'è la partita!", es: "¡Esta noche hay partido!" }, { gender: "f", plural: "partite" }),
  W("w-squadra", "squadra", "equipo", "skuádra", "sostantivo", "sport", "A2", { it: "La mia squadra ha vinto!", es: "¡Mi equipo ha ganado!" }, { gender: "f", plural: "squadre" }),
  W("w-giocare", "giocare", "jugar", "yokáre", "verbo", "sport", "A1", { it: "I bambini giocano al parco.", es: "Los niños juegan en el parque." }),
  W("w-correre", "correre", "correr", "kórrere", "verbo", "sport", "A2", { it: "Corro ogni mattina al parco.", es: "Corro cada mañana en el parque." }),
  W("w-palestra", "palestra", "gimnasio", "paléstra", "sostantivo", "sport", "A2", { it: "Vado in palestra tre volte a settimana.", es: "Voy al gimnasio tres veces por semana." }, { gender: "f", plural: "palestre" }),

  /* musica */
  W("w-musica", "musica", "música", "músika", "sostantivo", "musica", "A1", { it: "Ascolto musica italiana.", es: "Escucho música italiana." }, { gender: "f" }),
  W("w-canzone", "canzone", "canción", "kantsóne", "sostantivo", "musica", "A2", { it: "Questa canzone è bellissima.", es: "Esta canción es bellísima." }, { gender: "f", plural: "canzoni" }),
  W("w-cantante", "cantante", "cantante", "kantánte", "sostantivo", "musica", "A2", { it: "Il cantante ha una voce incredibile.", es: "El cantante tiene una voz increíble." }, { gender: "m", plural: "cantanti" }),
  W("w-concerto", "concerto", "concierto", "konchérto", "sostantivo", "musica", "A2", { it: "Andiamo al concerto stasera?", es: "¿Vamos al concierto esta noche?" }, { gender: "m", plural: "concerti" }),
  W("w-ascoltare", "ascoltare", "escuchar", "ashkoltáre", "verbo", "musica", "A1", { it: "Ascolto un podcast in italiano.", es: "Escucho un podcast en italiano." }, { related: ["sentire"] }),

  /* cinema */
  W("w-film", "film", "película", "film", "sostantivo", "cinema", "A2", { it: "Stasera guardo un film italiano.", es: "Esta noche veo una película italiana." }, { gender: "m", plural: "film" }),
  W("w-attore", "attore", "actor", "attóre", "sostantivo", "cinema", "B1", { it: "L'attore ha vinto un premio.", es: "El actor ha ganado un premio." }, { gender: "m", plural: "attori", ant: ["attrice (actriz)"] }),
  W("w-regista", "regista", "director (de cine)", "reyísta", "sostantivo", "cinema", "B1", { it: "Il regista è famoso in tutto il mondo.", es: "El director es famoso en todo el mundo." }, { gender: "m", plural: "registi" }),
  W("w-trama", "trama", "trama / argumento", "tráma", "sostantivo", "cinema", "B1", { it: "La trama del film è avvincente.", es: "La trama de la película es apasionante." }, { gender: "f", plural: "trame" }),
  W("w-sottotitoli", "sottotitoli", "subtítulos", "sottotítoli", "sostantivo", "cinema", "B1", { it: "Guardo i film con i sottotitoli.", es: "Veo las películas con subtítulos." }, { gender: "m", plural: "sottotitoli" }),

  /* relazioni */
  W("w-amico", "amico", "amigo", "amíko", "sostantivo", "relazioni", "A1", { it: "Il mio amico si chiama Luca.", es: "Mi amigo se llama Luca." }, { gender: "m", plural: "amici", ant: ["nemico"] }),
  W("w-amore", "amore", "amor", "amóre", "sostantivo", "relazioni", "A1", { it: "L'amore è paziente.", es: "El amor es paciente." }, { gender: "m", plural: "amori", ant: ["odio"] }),
  W("w-fidanzato", "fidanzato", "novio", "fidantsáto", "sostantivo", "relazioni", "A2", { it: "Il mio fidanzato vive a Torino.", es: "Mi novio vive en Turín." }, { gender: "m", plural: "fidanzati" }),
  W("w-appuntamento", "appuntamento", "cita / encuentro", "appuntaménto", "sostantivo", "relazioni", "A2", { it: "Ho un appuntamento alle sei.", es: "Tengo una cita a las seis." }, { gender: "m", plural: "appuntamenti", syn: ["impegno"] }),
  W("w-invitare", "invitare", "invitar", "invitáre", "verbo", "relazioni", "A2", { it: "Ti invito a cena.", es: "Te invito a cenar." }),
  W("w-sposarsi", "sposarsi", "casarse", "spósarsi", "verbo", "relazioni", "B1", { it: "Si sposano a settembre.", es: "Se casan en septiembre." }),

  /* finanze */
  W("w-soldi", "soldi", "dinero", "sóldi", "sostantivo", "finanze", "A2", { it: "Non ho abbastanza soldi.", es: "No tengo suficiente dinero." }, { gender: "m", plural: "soldi", syn: ["denaro"] }),
  W("w-banca", "banca", "banco", "bánka", "sostantivo", "finanze", "A2", { it: "Devo passare in banca.", es: "Tengo que pasar por el banco." }, { gender: "f", plural: "banche" }),
  W("w-contocorrente", "conto corrente", "cuenta bancaria", "kónto korrénte", "sostantivo", "finanze", "B1", { it: "Vorrei aprire un conto corrente.", es: "Querría abrir una cuenta corriente." }, { gender: "m", plural: "conti correnti" }),
  W("w-prelievo", "prelievo", "retiro (de dinero)", "preliévo", "sostantivo", "finanze", "B1", { it: "Faccio un prelievo al bancomat.", es: "Hago un retiro en el cajero." }, { gender: "m", plural: "prelievi" }),
  W("w-risparmiare", "risparmiare", "ahorrar", "risparmiáre", "verbo", "finanze", "B1", { it: "Risparmio per un viaggio.", es: "Ahorro para un viaje." }, { ant: ["sprecare"] }),

  /* professioni */
  W("w-ingegnere", "ingegnere", "ingeniero", "inyenyére", "sostantivo", "professioni", "A2", { it: "Mio fratello è ingegnere.", es: "Mi hermano es ingeniero." }, { gender: "m", plural: "ingegneri" }),
  W("w-avvocato", "avvocato", "abogado", "avvokáto", "sostantivo", "professioni", "A2", { it: "L'avvocato difende l'imputato.", es: "El abogado defiende al acusado." }, { gender: "m", plural: "avvocati" }),
  W("w-cuoco", "cuoco", "cocinero / chef", "kuóko", "sostantivo", "professioni", "A2", { it: "Il cuoco prepara i tortellini.", es: "El cocinero prepara los tortellini." }, { gender: "m", plural: "cuochi" }),
  W("w-giornalista", "giornalista", "periodista", "yornalísta", "sostantivo", "professioni", "B1", { it: "La giornalista intervista il sindaco.", es: "La periodista entrevista al alcalde." }, { gender: "m", plural: "giornalisti" }),
  W("w-infermiere", "infermiere", "enfermero", "infermiére", "sostantivo", "professioni", "B1", { it: "L'infermiere lavora in ospedale.", es: "El enfermero trabaja en el hospital." }, { gender: "m", plural: "infermieri" }),

  /* attualita */
  W("w-notizia", "notizia", "noticia", "notítsia", "sostantivo", "attualita", "B1", { it: "Hai sentito l'ultima notizia?", es: "¿Has oído la última noticia?" }, { gender: "f", plural: "notizie", syn: ["novità"] }),
  W("w-giornale", "giornale", "periódico", "yornále", "sostantivo", "attualita", "A2", { it: "Leggo il giornale ogni mattina.", es: "Leo el periódico cada mañana." }, { gender: "m", plural: "giornali" }),
  W("w-ambiente", "ambiente", "medio ambiente", "ambiénte", "sostantivo", "attualita", "B1", { it: "Dobbiamo proteggere l'ambiente.", es: "Debemos proteger el medio ambiente." }, { gender: "m", plural: "ambienti" }),
  W("w-economia", "economia", "economía", "ekonomía", "sostantivo", "attualita", "B2", { it: "L'economia italiana sta crescendo.", es: "La economía italiana está creciendo." }, { gender: "f" }),
  W("w-inquinamento", "inquinamento", "contaminación", "inkuinaménto", "sostantivo", "attualita", "B2", { it: "L'inquinamento delle città è un problema serio.", es: "La contaminación de las ciudades es un problema serio." }, { gender: "m", plural: "inquinamenti" }),

  /* scienza */
  W("w-scienza", "scienza", "ciencia", "shiéntsa", "sostantivo", "scienza", "B2", { it: "La scienza richiede pazienza.", es: "La ciencia requiere paciencia." }, { gender: "f", plural: "scienze" }),
  W("w-ricerca", "ricerca", "investigación", "rikérka", "sostantivo", "scienza", "B2", { it: "La ricerca scientifica avanza.", es: "La investigación científica avanza." }, { gender: "f", plural: "ricerche" }),
  W("w-esperimento", "esperimento", "experimento", "esperiménto", "sostantivo", "scienza", "B2", { it: "L'esperimento ha dato risultati sorprendenti.", es: "El experimento dio resultados sorprendentes." }, { gender: "m", plural: "esperimenti" }),
  W("w-scienziato", "scienziato", "científico", "shientsiáto", "sostantivo", "scienza", "B2", { it: "Lo scienziato studia il DNA.", es: "El científico estudia el ADN." }, { gender: "m", plural: "scienziati" }),

  /* letteratura */
  W("w-romanzo", "romanzo", "novela", "romántso", "sostantivo", "letteratura", "B2", { it: "Ho letto un romanzo di Elena Ferrante.", es: "He leído una novela de Elena Ferrante." }, { gender: "m", plural: "romanzi" }),
  W("w-poeta", "poeta", "poeta", "poéta", "sostantivo", "letteratura", "C1", { it: "Dante è il poeta della Divina Commedia.", es: "Dante es el poeta de la Divina Comedia." }, { gender: "m", plural: "poeti" }),
  W("w-poesia", "poesia", "poesía", "poesía", "sostantivo", "letteratura", "B2", { it: "Questa poesia è di Leopardi.", es: "Esta poesía es de Leopardi." }, { gender: "f", plural: "poesie" }),
  W("w-scrittore", "scrittore", "escritor", "skrittóre", "sostantivo", "letteratura", "B2", { it: "Lo scrittore italiano ha vinto il premio.", es: "El escritor italiano ha ganado el premio." }, { gender: "m", plural: "scrittori" }),
  W("w-capitolo", "capitolo", "capítulo", "kapítoło", "sostantivo", "letteratura", "B2", { it: "Il primo capitolo è avvincente.", es: "El primer capítulo es apasionante." }, { gender: "m", plural: "capitoli" }),
];

/* Paquete de expansión v1.1 + Dizionario didattico v2.0/3.0 · estándares
   internacionales (MCER/CEFR A1–C2, IPA, bandas de frecuencia tipo De Mauro,
   registro, colocaciones, notas contrastivas y falsos amigos IT–ES).
   Dedup por lema: conserva la entrada base (referenciada por vocabIds de
   cursos y SRS), la enriquece con los campos del paquete y mantiene un
   mapa de alias para que los ids eliminados sigan resolviendo. */
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
const byLemma = new Map<string, VocabWord>();
for (const w of VOCAB) byLemma.set(norm(w.it), w);
const aliasById = new Map<string, VocabWord>();

function mergePacks(packs: VocabWord[]): VocabWord[] {
  const out: VocabWord[] = [];
  for (const w of packs) {
    const base = byLemma.get(norm(w.it));
    if (base) {
      // enriquece la entrada superviviente con los campos lexicográficos del paquete
      base.ipa = base.ipa ?? w.ipa;
      base.freq = base.freq ?? w.freq;
      base.register = base.register ?? w.register;
      base.note = base.note ?? w.note;
      base.collo = base.collo ?? w.collo;
      if (!base.syn?.length && w.syn?.length) base.syn = w.syn;
      if (!base.ant?.length && w.ant?.length) base.ant = w.ant;
      if (!base.plural && w.plural) base.plural = w.plural;
      if (!base.gender && w.gender) base.gender = w.gender;
      if (base.id !== w.id) aliasById.set(w.id, base);
      continue;
    }
    byLemma.set(norm(w.it), w);
    out.push(w);
  }
  return out;
}

VOCAB.push(...mergePacks(VOCAB_EXTRA), ...mergePacks(DICT_PACKS), ...mergePacks(IT_MEGA));

export const VOCAB_BY_ID: Record<string, VocabWord> = Object.fromEntries(VOCAB.map((w) => [w.id, w]));
/* alias: ids eliminados por dedup siguen resolviendo (cursos, SRS, admin) */
export const VOCAB_ALIASES: ReadonlyMap<string, VocabWord> = aliasById;
export function applyVocabAliases(target: Record<string, VocabWord>): void {
  for (const [aliasId, w] of aliasById) if (!target[aliasId]) target[aliasId] = w;
}
applyVocabAliases(VOCAB_BY_ID);

export const VOCAB_CATEGORIES = Object.keys(
  VOCAB.reduce<Record<string, boolean>>((acc, w) => ({ ...acc, [w.cat]: true }), {})
) as WordCategory[];

export function wordsByCategory(cat: WordCategory): VocabWord[] {
  return VOCAB.filter((w) => w.cat === cat);
}

/* Normalización para búsqueda insensible a acentos (citta → città). */
export function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function searchVocab(query: string): VocabWord[] {
  const q = normalizeSearch(query);
  if (!q) return [];
  return VOCAB.filter(
    (w) =>
      normalizeSearch(w.it).includes(q) ||
      normalizeSearch(w.es).includes(q) ||
      normalizeSearch(w.example.it).includes(q) ||
      (w.ipa ? normalizeSearch(w.ipa).includes(q) : false) ||
      (w.note ? normalizeSearch(w.note).includes(q) : false) ||
      (w.collocations ? w.collocations.some((c) => normalizeSearch(c).includes(q)) : false) ||
      (w.syn ? w.syn.some((s) => normalizeSearch(s).includes(q)) : false) ||
      (w.ant ? w.ant.some((s) => normalizeSearch(s).includes(q)) : false) ||
      (w.alt ? w.alt.some((s) => normalizeSearch(s).includes(q)) : false)
  );
}
