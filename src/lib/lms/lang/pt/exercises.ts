import type { Exercise } from "../../types";

/* ═══ PT · Banco de ejercicios de comprensión (v9.39 · ex-pt) ═══════
   Português EUROPEO de Portugal. 42 preguntas de comprensión atadas al
   contenido real de lang/pt: 3 por tarea de PT_LISTENING, 2 por texto
   de PT_READINGS y 2 por situación de PT_SITUATIONS. Convención de ids
   (espejo del espacio EN): pt-ex-ls-<nº>-<n> para escucha, pt-ex-rd-<nº>-<n>
   para lectura y pt-ex-sit-<slug>-<n> para situaciones. prompt/explain
   en español con tuteo; options en portugués de Portugal; answer 0-3
   con la solución citada del propio texto. getExercises (banco IT) aún
   no conoce estos ids: el registro de PT_EXERCISES en el resolvedor
   global lo cablea el orquestador.                                   */

export const PT_EXERCISES: Exercise[] = [
  /* ═══ Escucha · pt-ls-1 · Na pastelaria (A1) ═══ */
  { id: "pt-ex-ls-1-1", type: "mc", level: "A1", topic: "ascolto", prompt: "En el diálogo de la pastelería: ¿qué pide el cliente?",
    options: ["Um chá e uma tosta mista", "Um sumo de laranja e um croissant", "Um café e um pastel de nata", "Dois cafés e um croissant"], answer: 2,
    explain: "Dice: «Um café e um pastel de nata, se faz favor». Se faz favor es el «por favor» suave y cotidiano de Portugal." },
  { id: "pt-ex-ls-1-2", type: "mc", level: "A1", topic: "ascolto", prompt: "¿Cuánto cuesta el pedido del cliente?",
    options: ["Dois euros e dezoito cêntimos", "Dois euros e oitenta cêntimos", "Quatro euros e vinte cêntimos", "Três euros e oitenta cêntimos"], answer: 1,
    explain: "«São dois euros e oitenta cêntimos». Ojo: 4,20 € es lo que cuesta el café con tosta mista de la situación de la pastelería." },
  { id: "pt-ex-ls-1-3", type: "mc", level: "A1", topic: "ascolto", prompt: "Con «Posso pagar com multibanco?», el cliente pregunta si…",
    options: ["O café é grande ou pequeno", "Pode sentar-se ao balcão", "O pastel está quente", "Pode pagar com cartão"], answer: 3,
    explain: "Multibanco es la red de tarjetas portuguesa: pregunta si puede pagar con tarjeta. La funcionaria responde «Pode, sim» y le da el talão (el recibo)." },

  /* ═══ Escucha · pt-ls-2 · No comboio do Porto para Lisboa (A2) ═══ */
  { id: "pt-ex-ls-2-1", type: "mc", level: "A2", topic: "ascolto", prompt: "En el comboio Porto–Lisboa: ¿a qué hora llega el tren a Lisboa?",
    options: ["Às vinte e trinta", "Às sete em ponto", "Às cinco e meia", "Às dezanove horas"], answer: 0,
    explain: "«Chega ao Santa Apolónia às vinte e trinta, se não houver atrasos na linha»: a las 20:30, si no hay retrasos." },
  { id: "pt-ex-ls-2-2", type: "mc", level: "A2", topic: "ascolto", prompt: "El revisor aconseja ir ya al coche-restaurante porque…",
    options: ["Está cheio de passageiros", "Só serve bebidas", "Encerra às sete", "Fica noutro comboio"], answer: 2,
    explain: "«Está, mas encerra às sete. Se quiser jantar, convém ir já»: cierra a las siete, así que conviene cenar pronto." },
  { id: "pt-ex-ls-2-3", type: "mc", level: "A2", topic: "ascolto", prompt: "Según el revisor, ¿qué tienen todos los asientos del Alfa Pendular?",
    options: ["Um carro-restaurante aberto toda a noite", "Tomadas junto aos lugares", "Lugares sempre à janela", "Um revisor em cada carro"], answer: 1,
    explain: "«Há tomadas em todos os lugares do Alfa Pendular»: hay enchufes junto a todos los asientos de ese tren." },

  /* ═══ Escucha · pt-ls-3 · Erasmus em Coimbra (B1) ═══ */
  { id: "pt-ex-ls-3-1", type: "mc", level: "B1", topic: "ascolto", prompt: "En la entrevista radiofónica: ¿cómo surgió la aventura de Inés en Coimbra?",
    options: ["Com uma bolsa da universidade", "Por convite de uma amiga portuguesa", "Através do programa Erasmus da faculdade", "Encontrou o programa na internet"], answer: 3,
    explain: "«Surgiu por acaso: encontrei o programa na internet, candidatei-me e, dois meses depois, estava instalada numa residência junto ao Mondego»." },
  { id: "pt-ex-ls-3-2", type: "mc", level: "B1", topic: "ascolto", prompt: "¿Qué le resultó difícil a Inés al principio?",
    options: ["Os professores falavam depressa e o sotaque do norte", "A residência ficava longe da universidade", "As aulas eram todas em inglês", "Os colegas nunca a corrigiam"], answer: 0,
    explain: "«Os professores falavam depressa e o sotaque do norte pareceu-me difícil». Con las correcciones de los colegas, en tres meses ya seguía las clases sin problemas." },
  { id: "pt-ex-ls-3-3", type: "mc", level: "B1", topic: "ascolto", prompt: "¿Qué aconseja Inés a quien quiera venir a estudiar?",
    options: ["Vir em setembro e participar na recepção aos caloiros", "Vir em janeiro, no início do semestre", "Ficar na residência até conhecer gente", "Falar só com espanhóis no primeiro mês"], answer: 0,
    explain: "«Aconselho que venham em setembro (…) e que participem na recepção aos caloiros»: es la forma más rápida de hacer amistades. Caloiros = novatos." },

  /* ═══ Escucha · pt-ls-4 · Fado em Alfama (B2) ═══ */
  { id: "pt-ex-ls-4-1", type: "mc", level: "B2", topic: "ascolto", prompt: "En la conversación sobre fado: ¿cómo se llama la guitarra de sonido tan brillante?",
    options: ["A viola", "A guitarra portuguesa", "A gaita de foles", "O bandolim"], answer: 1,
    explain: "«É a guitarra portuguesa, a de Lisboa; a de Coimbra é ligeiramente diferente»: la de Coimbra es ligeramente distinta." },
  { id: "pt-ex-ls-4-2", type: "mc", level: "B2", topic: "ascolto", prompt: "¿Qué instrumento acompaña a la guitarra y sostiene el ritmo?",
    options: ["O piano", "A guitarra de Coimbra", "O contrabaixo", "A viola"], answer: 3,
    explain: "«Acompanha-a a viola, que sustenta o ritmo». Trampa clásica del fado: la guitarra portuguesa lleva la melodía; a viola, el ritmo." },
  { id: "pt-ex-ls-4-3", type: "mc", level: "B2", topic: "ascolto", prompt: "Según la fadista, la saudade es…",
    options: ["A falta de alguém, de um tempo, de um destino que podia ter acontecido", "Uma festa popular do mês de junho", "Um instrumento de doze cordas", "A nostalgia dos descobrimentos"], answer: 0,
    explain: "«A saudade é o motor do fado: é a falta de alguém, de um tempo, de um destino que podia ter acontecido e não aconteceu». Por eso el fado «se canta para curar, não para chorar»." },

  /* ═══ Escucha · pt-ls-5 · Mesa-redonda: que turismo quer Lisboa? (C1) ═══ */
  { id: "pt-ex-ls-5-1", type: "mc", level: "C1", topic: "ascolto", prompt: "Según el urbanista, sin los visitantes…",
    options: ["Os museus fechariam ao público", "Boa parte do casario histórico se teria degradado", "Os hotéis do centro iriam à falência", "A cidade perderia os autocarros de turismo"], answer: 1,
    explain: "«Sem os visitantes, boa parte do casario histórico se teria degradado há décadas». Fíjate en la mesóclise culta «se teria degradado»." },
  { id: "pt-ex-ls-5-2", type: "mc", level: "C1", topic: "ascolto", prompt: "¿Qué dicen los estudios recientes sobre el centro de Lisboa?",
    options: ["O centro perdeu milhares de moradores entre 2011 e 2021", "O centro ganhou milhares de moradores", "As rendas desceram no centro histórico", "Os turistas passaram a morar no centro"], answer: 0,
    explain: "«Entre 2011 e 2021, o centro perdeu milhares de moradores». Si las rentas siguen subiendo, a los barrios solo les quedará «uma beleza de fachada»." },
  { id: "pt-ex-ls-5-3", type: "mc", level: "C1", topic: "ascolto", prompt: "¿Cómo concluye la historiadora el debate?",
    options: ["Lisboa deve fechar-se aos visitantes", "Lisboa é um cenário para fotografar", "Lisboa não é um cenário, é uma casa", "Lisboa vive apenas do turismo"], answer: 2,
    explain: "«Lisboa não é um cenário, é uma casa»: hay que saber equilibrar lo que la ciudad recibe con lo que preserva." },

  /* ═══ Escucha · pt-ls-6 · Ditado: a língua da saudade (C2) ═══ */
  { id: "pt-ex-ls-6-1", type: "mc", level: "C2", topic: "ascolto", prompt: "Según la primera frase del dictado, la saudade es…",
    options: ["Uma nostalgia doce acompanhada de desejo", "Uma tristeza profunda sem consolo", "Um sentimento de culpa", "Uma alegria repentina"], answer: 0,
    explain: "«A saudade é, segundo os dicionários, uma nostalgia doce acompanhada de desejo»." },
  { id: "pt-ex-ls-6-2", type: "mc", level: "C2", topic: "ascolto", prompt: "«Tivesse eu tempo…»: ¿qué haría el hablante?",
    options: ["Ficaria em Lisboa a ouvir fado", "Viajaria de comboio até ao Porto", "Escreveria um livro sobre a saudade", "Percorreria a Costa Vicentina a pé, de Sagres até Odeceixe"], answer: 3,
    explain: "«Tivesse eu tempo, percorreria a Costa Vicentina a pé»: hipótesis irreal con el conjuntivo-imperfeito antepuesto + condicional, sin la conjunción «se»." },
  { id: "pt-ex-ls-6-3", type: "mc", level: "C2", topic: "ascolto", prompt: "El proverbio del dictado «Quem não tem cão caça com gato» significa que…",
    options: ["Quem não tem sorte não deve insistir", "Quem não tem os meios ideais arranja-se com o que tem", "Quem não tem cão deve comprar um", "Quem caça sozinho apanha mais"], answer: 2,
    explain: "Si te faltan los medios ideales, te las arreglas con lo que tienes. El dictado lo remata: «e quem não tem mestre aprende sozinho»." },

  /* ═══ Lectura · pt-rd-1 · Um postal do Porto (A1) ═══ */
  { id: "pt-ex-rd-1-1", type: "mc", level: "A1", topic: "vocabolario", prompt: "En la postal de Susana: ¿con quién llegó a Oporto?",
    options: ["Com o irmão", "Com a Beatriz", "Sozinha", "Com um grupo de amigos"], answer: 0,
    explain: "«Cheguei ao Porto ontem com o meu irmão». Ojo: Beatriz es la destinataria de la postal, no su compañera de viaje." },
  { id: "pt-ex-rd-1-2", type: "mc", level: "A1", topic: "vocabolario", prompt: "¿Qué visitaron en Vila Nova de Gaia?",
    options: ["A Rua das Flores", "A ponte de D. Luís", "As caves do vinho do Porto", "A estação de São Bento"], answer: 2,
    explain: "«Atravessámos a ponte de D. Luís e visitámos as caves do vinho do Porto, em Vila Nova de Gaia». Al día siguiente cogen el comboio para Lisboa." },

  /* ═══ Lectura · pt-rd-2 · A feira de Barcelos (A2) ═══ */
  { id: "pt-ex-rd-2-1", type: "mc", level: "A2", topic: "vocabolario", prompt: "Según el texto, ¿cuándo hay mercado en Barcelos?",
    options: ["Todos os sábados", "Todas as quintas-feiras", "Uma vez por mês", "Só no verão"], answer: 1,
    explain: "«Todas as quintas-feiras, a cidade de Barcelos acorda mais cedo: é dia de feira», uno de los más antiguos de Portugal, con siete siglos de historia." },
  { id: "pt-ex-rd-2-2", type: "mc", level: "A2", topic: "vocabolario", prompt: "Según la leyenda, el gallo asado…",
    options: ["Guiou os peregrinos até ao Porto", "Foi o primeiro animal vendido na feira", "Deu sorte a um rei de Portugal", "Cantou para salvar um inocente"], answer: 3,
    explain: "«Conta a lenda que um galo assado cantou para salvar um inocente»: por eso o galo de Barcelos vigila en casi todas las bancas." },

  /* ═══ Lectura · pt-rd-3 · A Costa Vicentina (B1) ═══ */
  { id: "pt-ex-rd-3-1", type: "mc", level: "B1", topic: "vocabolario", prompt: "¿Cuántos kilómetros tiene la Rota Vicentina?",
    options: ["Mais de trezentos e quarenta quilómetros", "Cento e quarenta quilómetros", "Trinta e quatro quilómetros", "Setecentos quilómetros"], answer: 0,
    explain: "«A Rota Vicentina, com mais de trezentos e quarenta quilómetros, liga Santiago do Cacém a São Vicente» por aldeas de pescadores y casas encaladas." },
  { id: "pt-ex-rd-3-2", type: "mc", level: "B1", topic: "vocabolario", prompt: "Para quien recorre la costa despacio, el mayor lujo de la región es…",
    options: ["O silêncio", "As praias de areia dourada", "Os restaurantes de peixe", "Os hotéis de luxo"], answer: 0,
    explain: "«O maior luxo da região: o silêncio, cada vez mais raro, interrompido apenas pelo vento e pelas gaivotas»." },

  /* ═══ Lectura · pt-rd-4 · Os azulejos (B2) ═══ */
  { id: "pt-ex-rd-4-1", type: "mc", level: "B2", topic: "vocabolario", prompt: "La palabra «azulejo» viene del árabe al-zulaic y significa…",
    options: ["Pedra pintada", "Azul fixo", "Pedra polida", "Casa brilhante"], answer: 2,
    explain: "Viene del árabe «al-zulaic», «pedra polida». La técnica llegó con los mouros y los primeros ejemplares entraron en el siglo XV, venidos de Sevilha." },
  { id: "pt-ex-rd-4-2", type: "mc", level: "B2", topic: "vocabolario", prompt: "¿Qué papel inesperado tuvieron los azulejos tras el terremoto de 1755?",
    options: ["Passaram a ser importados de Sevilha", "Foram proibidos nas fachadas", "Desapareceram das estações", "Reconstruíram a cara de Lisboa, por serem um revestimento barato e resistente"], answer: 3,
    explain: "«Como revestimento barato e resistente, reconstruiu a cara de Lisboa». En São Bento, no Porto, veinte mil piezas de Jorge Colaço cuentan la historia del país." },

  /* ═══ Lectura · pt-rd-5 · Os heterónimos de Pessoa (C1) ═══ */
  { id: "pt-ex-rd-5-1", type: "mc", level: "C1", topic: "vocabolario", prompt: "¿Qué heterónimo grita en «Tabacaria» «Não sou nada. Nunca serei nada.»?",
    options: ["Ricardo Reis", "Alberto Caeiro", "O próprio Pessoa, o «ortónimo»", "Álvaro de Campos"], answer: 3,
    explain: "Álvaro de Campos, el ingeniero naval «poeta de máquina e tédio». Caeiro enseña a ver sin pensar; Reis escribe odas a la medida de Horácio." },
  { id: "pt-ex-rd-5-2", type: "mc", level: "C1", topic: "vocabolario", prompt: "En el texto, Ricardo Reis es…",
    options: ["Um engenheiro naval fascinado pela máquina", "Um médico monárquico que escreve odes à medida de Horácio", "Um mestre camponês que ensina a ver sem pensar", "Um crítico literário de Lisboa"], answer: 1,
    explain: "«Ricardo Reis, médico monárquico, escreve odes à medida de Horácio». Cada heterónimo encarna una filosofía: los críticos hablan de «dramas em gente»." },

  /* ═══ Lectura · pt-rd-6 · A sintaxe de Saramago (C2) ═══ */
  { id: "pt-ex-rd-6-1", type: "mc", level: "C2", topic: "vocabolario", prompt: "En la prosa de Saramago, las mayúsculas anuncian…",
    options: ["O início de uma citação", "Quem fala", "Uma pausa longa", "O fim do parágrafo"], answer: 1,
    explain: "Frases interminables puntuadas solo con comas: «as maiúsculas anunciam quem fala», porque los travessões de diálogo desaparecen." },
  { id: "pt-ex-rd-6-2", type: "mc", level: "C2", topic: "vocabolario", prompt: "«Se podes olhar, vê. Se podes ver, repara» es, según el ensayo…",
    options: ["Uma crítica aos maus leitores", "Uma regra de boa educação", "Um conselho médico", "Um programa de leitura do próprio estilo"], answer: 3,
    explain: "«É também um programa de leitura: o estilo de Saramago não se decora, contempla-se». Leerlo en voz alta obliga a respirar con el texto." },

  /* ═══ Situación · pt-sit-pastelaria · Na pastelaria (A1) ═══ */
  { id: "pt-ex-sit-pastelaria-1", type: "mc", level: "A1", topic: "situazioni", prompt: "En la situación de la pastelería: ¿qué quiere el cliente?",
    options: ["Um chá e um sumo de laranja", "Um café e um pastel de nata", "Um café e uma tosta mista", "Uma tosta mista e um sumo de laranja"], answer: 2,
    explain: "«Queria um café e uma tosta mista, se faz favor». Quería + infinitivo es la forma cortés de pedir: aquí, café + tosta mixta." },
  { id: "pt-ex-sit-pastelaria-2", type: "mc", level: "A1", topic: "situazioni", prompt: "El cliente quiere el pedido…",
    options: ["Para levar", "Para comer na pastelaria", "Para entregar em casa", "Para comer amanhã"], answer: 0,
    explain: "«Para levar, por favor». En la escucha A1 era «para aqui»: la pregunta del mostrador siempre es «para aqui ou para levar?»." },

  /* ═══ Situación · pt-sit-comboio · Na bilheteira do comboio (A2) ═══ */
  { id: "pt-ex-sit-comboio-1", type: "mc", level: "A2", topic: "situazioni", prompt: "¿De qué andén sale el próximo Alfa Pendular?",
    options: ["Da plataforma dois", "Da plataforma seis", "Da plataforma cinco", "Da plataforma dez"], answer: 1,
    explain: "«O próximo Alfa Pendular sai às cinco e meia, da plataforma seis»: a las 17:30 desde el andén seis." },
  { id: "pt-ex-sit-comboio-2", type: "mc", level: "A2", topic: "situazioni", prompt: "El billete de ida y vuelta cuesta…",
    options: ["Trinta e dois euros", "Vinte e seis euros", "Setenta e dois euros", "Sessenta e dois euros"], answer: 3,
    explain: "«São sessenta e dois euros, lugar junto à janela no carro seis», con regreso el domingo por la tarde y llegada a las 20:30." },

  /* ═══ Situación · pt-sit-feira · Na feira de Barcelos (A2) ═══ */
  { id: "pt-ex-sit-feira-1", type: "mc", level: "A2", topic: "situazioni", prompt: "En el puesto de loza: ¿cuánto cuesta el conjunto de dos platos grandes y el gallo?",
    options: ["Dez euros", "Quinze euros", "Vinte e dois euros", "Dezoito euros"], answer: 2,
    explain: "«Faço-lhe o conjunto — dois pratos e o galo — por vinte e dois»: dos platos (15 € con descuento) más el galo (10 €), todo por 22 €." },
  { id: "pt-ex-sit-feira-2", type: "mc", level: "A2", topic: "situazioni", prompt: "Al final, la clienta pide a la vendedora que…",
    options: ["Faça um desconto maior", "Pague com multibanco", "Embrulhe tudo para viagem", "Guarde o galo para a neta"], answer: 2,
    explain: "«Pode embrulhar para viagem, se faz favor?». El galo se lo lleva porque a su nieta le encanta la lenda." },

  /* ═══ Situación · pt-sit-farmacia · Na farmácia (A2) ═══ */
  { id: "pt-ex-sit-farmacia-1", type: "mc", level: "A2", topic: "situazioni", prompt: "Según la farmacéutica, ¿cómo debe tomar el jarabe el cliente?",
    options: ["Um comprimido de manhã em jejum", "Uma colher de sopa, três vezes ao dia, depois das refeições", "Duas colheres antes de dormir", "Meio copo ao almoço"], answer: 1,
    explain: "«Uma colher de sopa, três vezes ao dia, depois das refeições», junto con un analgésico. Colher de sopa = cuchara sopera." },
  { id: "pt-ex-sit-farmacia-2", type: "mc", level: "A2", topic: "situazioni", prompt: "Si no mejora en dos días, el cliente debe…",
    options: ["Voltar à farmácia no dia seguinte", "Tomar o dobro da dose", "Ligar para o médico de família", "Ir ao centro de saúde"], answer: 3,
    explain: "«Se não melhorar em dois dias, vá ao centro de saúde». Y recuerda la trampa del falso amigo: «constipação» en Portugal es el resfriado." },

  /* ═══ Situación · pt-sit-coimbra · Na Universidade de Coimbra (B1) ═══ */
  { id: "pt-ex-sit-coimbra-1", type: "mc", level: "B1", topic: "situazioni", prompt: "Después de la matrícula, ¿qué único trámite le falta al estudiante?",
    options: ["Pagar a propina do primeiro semestre", "Escolher as disciplinas no portal até sexta-feira", "Entregar a carta de aceitação", "Pedir uma bolsa Erasmus"], answer: 1,
    explain: "«Falta-lhe apenas escolher as disciplinas no portal até sexta-feira»: la propina la pagó la semana pasada y la carta ya está entregada." },
  { id: "pt-ex-sit-coimbra-2", type: "mc", level: "B1", topic: "situazioni", prompt: "Después de inscribir las asignaturas, el estudiante va a…",
    options: ["Visitar a Biblioteca Joanina", "Ir à praxe dos caloiros", "Tomar um café no bar da faculdade", "Conhecer o centro de Coimbra"], answer: 0,
    explain: "«Vou já inscrever as disciplinas e depois visitar a Biblioteca Joanina», la biblioteca barroca más famosa de la universidad." },

  /* ═══ Situación · pt-sit-aluguer · Arrendar um quarto em Lisboa (B1) ═══ */
  { id: "pt-ex-sit-aluguer-1", type: "mc", level: "B1", topic: "situazioni", prompt: "La renta de 500 euros incluye…",
    options: ["Todas as despesas, água e luz", "As despesas de água", "O internet e o gás", "Nenhuma despesa"], answer: 1,
    explain: "«Certo, com as despesas de água incluídas»: solo el agua. El cuarto está mobiliado y tiene vista para o rio." },
  { id: "pt-ex-sit-aluguer-2", type: "mc", level: "B1", topic: "situazioni", prompt: "El cuarto de baño de la habitación de Alfama es…",
    options: ["Privativo, só para o quarto", "Partilhado com a senhoria", "Inexistente no andar", "Partilhado com mais dois inquilinos"], answer: 3,
    explain: "«É partilhada com mais dois inquilinos». Además: caução de dos meses y contrato de un año renovable." },

  /* ═══ v9.47 · 14 situaciones nuevas (pt-sit-*) ═══ */

  /* pt-sit-padaria · Na padaria (A1) */
  { id: "pt-ex-sit-padaria-1", type: "mc", level: "A1", topic: "situazioni", prompt: "En la panadería: ¿qué compra la clienta?",
    options: ["Uma broa de milho e dois pães alentejanos", "Dois pães de mistura e um bolo", "Uma broa e dois bolos de laranja", "Três pães alentejanos"], answer: 0,
    explain: "«Uma broa de milho e dois pães alentejanos, se faz favor»: pan de maíz + dos panes alentejanos, y aún añade una porción de bizcocho de naranja." },
  { id: "pt-ex-sit-padaria-2", type: "mc", level: "A1", topic: "situazioni", prompt: "¿Cuánto cuesta y qué hace la clienta al pagar?",
    options: ["Dois euros; paga exato", "Dois euros e trinta; dá cinco euros e deixa o troco", "Trinta euros; paga com multibanco", "Doze euros; pede fatura"], answer: 1,
    explain: "«São dois euros e trinta cêntimos» y «Aqui tem cinco euros. Fique com o troco»: paga con cinco y deja el cambio (propina simbólica al padeiro)." },

  /* pt-sit-autocarro · No autocarro (A1) */
  { id: "pt-ex-sit-autocarro-1", type: "mc", level: "A1", topic: "situazioni", prompt: "¿Hacia dónde va el autobús y cuánto cuesta el título a bordo?",
    options: ["Para a Baixa; dois euros", "Para São Bento; três euros", "Para a Casa da Música; um euro", "Para o aeroporto; cinco euros"], answer: 0,
    explain: "«Este autocarro vai para a Baixa?» — «Vai, sim» y el billete a bordo cuesta «dois euros», validado en la máquina de entrada." },
  { id: "pt-ex-sit-autocarro-2", type: "mc", level: "A1", topic: "situazioni", prompt: "¿Cuántas paradas faltan para São Bento?",
    options: ["Uma", "Duas", "Três", "Quatro"], answer: 2,
    explain: "«Três. Aviso-o quando chegarmos»: faltan tres y el conductor avisa al llegar. Paragem = parada." },

  /* pt-sit-quiosque · No quiosque (A1) */
  { id: "pt-ex-sit-quiosque-1", type: "mc", level: "A1", topic: "situazioni", prompt: "¿Qué edición del periódico queda y qué más compra el cliente?",
    options: ["A edição de manhã; uma revista", "A edição da tarde; um boletim do Euromilhões", "A edição de ontem; um carimbo", "A edição especial; dois boletins"], answer: 1,
    explain: "«Só ficou a edição da tarde» y pide «um boletim do Euromilhões, com duas chaves»: edición de la tarde + boleto con dos combinaciones." },
  { id: "pt-ex-sit-quiosque-2", type: "mc", level: "A1", topic: "situazioni", prompt: "¿Cómo quiere los números del boleto y cuánto paga en total?",
    options: ["Escolhidos por ele; seis euros", "Ao acaso; seis euros", "Ao acaso; cinco euros", "Da data de nascimento; sete euros"], answer: 1,
    explain: "«Ao acaso, por favor» (al azar) y «São seis euros ao todo»: 1 € el periódico + 5 € el boleto." },

  /* pt-sit-taxi · De táxi no Porto (A2) */
  { id: "pt-ex-sit-taxi-1", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Qué ruta sugiere el taxista y por qué?",
    options: ["O túnel, porque é mais rápido", "A ponte, porque tem uma vista linda", "A marginal, porque evita trânsito", "O centro, porque está calmo"], answer: 1,
    explain: "«Quer que vá pela ponte ou pelo túnel? A ponte tem uma vista linda»: sugiere el puente por las vistas (¡la de D. Luís I!)." },
  { id: "pt-ex-sit-taxi-2", type: "mc", level: "A2", topic: "situazioni", prompt: "¿De dónde viene la clienta y cuánto marca el taxímetro?",
    options: ["De um jantar; nove euros", "De um concerto na Casa da Música; nove euros e quarenta", "Do aeroporto; dez euros", "Do teatro; dezassete euros"], answer: 1,
    explain: "«Vim de um concerto na Casa da Música» y «O taxímetro marca nove euros e quarenta»: concierto + 9,40 €, pagando con diez y pidiendo recibo." },

  /* pt-sit-centro-saude · No centro de saúde (A2) */
  { id: "pt-ex-sit-centro-saude-1", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Qué síntomas describe el usuario?",
    options: ["Febre e uma tosse seca, com dores no corpo e cansaço", "Dores de cabeça e vertigens", "Uma tosse com expectoração", "Febre alta e vómitos"], answer: 0,
    explain: "«Ando com febre e uma tosse seca» y luego «Dores no corpo e cansaço. Já estou assim há quatro dias»: fiebre, tos seca, dolores y cansancio de 4 días." },
  { id: "pt-ex-sit-centro-saude-2", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Qué le aconseja la recepcionista si la fiebre sube y qué pide él?",
    options: ["Tomar um banho; uma receita", "Ir à farmácia; um exame", "Ir à urgência; um atestado para o trabalho", "Esperar mais uma semana; nada"], answer: 2,
    explain: "«Se a febre subir, vá à urgência» y él pide «um atestado para o trabalho»: urgencias si empeora + justificante médico." },

  /* pt-sit-tasca · Jantar na tasca (A2) */
  { id: "pt-ex-sit-tasca-1", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Cuál es el plato del día y qué incluye la couvert?",
    options: ["Bacalhau à Brás; pão, azeitonas e queijo", "Francesinha; pão e manteiga", "Bacalhau com natas; azeitonas só", "Polvo à lagareiro; sopa"], answer: 0,
    explain: "«Bacalhau à Brás com batata palha» y «a couvert: pão, azeitonas e queijo»: bacalao a la Brás y couvert de pan, aceitunas y queso." },
  { id: "pt-ex-sit-tasca-2", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Qué pide de beber y cómo cierra la cena?",
    options: ["Uma cerveja; pede a conta", "Um jarro de vinho da casa; dois cafés com a conta", "Água com gás; um chá", "Vinho verde; uma sobremesa para levar"], answer: 1,
    explain: "«Um jarro de vinho da casa» y «dois cafés com a conta, se faz favor»: jarra de vino de la casa y dos cafés junto con la cuenta." },

  /* pt-sit-museu · No museu (A2) */
  { id: "pt-ex-sit-museu-1", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Qué está incluido en la entrada y dónde empieza la exposición?",
    options: ["A audioguia; sala três à direita", "A visita guiada; sala um", "O guarda-roupa; ala dos azulejos", "Nada; entrada principal"], answer: 0,
    explain: "«A audioguia está incluída na entrada» y la exposición empieza «na sala três, à direita», aunque recomienda empezar por el ala del siglo XVIII." },
  { id: "pt-ex-sit-museu-2", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Con qué condición se puede fotografiar y qué oferta adicional hay?",
    options: ["Com flash; uma loja", "Sem flash; uma visita guiada às quinze", "Só com licença; um workshop", "Proibido; um café"], answer: 1,
    explain: "«Sem flash, sim» y «Há uma visita guiada às quinze»: sin flash y visita guiada a las tres." },

  /* pt-sit-emprego · Entrevista de emprego (B1) */
  { id: "pt-ex-sit-emprego-1", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Qué experiencia tiene el candidato y qué idiomas habla?",
    options: ["Quatro anos de atendimento, coordenação de cinco pessoas; português, espanhol e inglês", "Dois anos de vendas; português e inglês", "Cinco anos de gestão; português só", "Três anos de marketing; quatro línguas"], answer: 0,
    explain: "«Trabalhei quatro anos no atendimento ao cliente e coordenei uma equipa de cinco pessoas» y «Falo português, espanhol e inglês»." },
  { id: "pt-ex-sit-emprego-2", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Dónde se ve en cinco años y qué se hablará en la segunda entrevista?",
    options: ["A abrir empresa própria; o horário", "Num papel de maior responsabilidade, a liderar a expansão ibérica; a remuneração", "No mesmo cargo; as férias", "A estudar fora; a formação"], answer: 1,
    explain: "«Num papel de maior responsabilidade, a liderar a equipa de expansão ibérica» y la reclutadora: «Falamos da remuneração na segunda entrevista»." },

  /* pt-sit-ctt · Nos CTT (B1) */
  { id: "pt-ex-sit-ctt-1", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Cuánto pesa el paquete y cuánto cuesta cada opción?",
    options: ["Dois quilos; normal dez euros, registado quinze", "Dois quilos e meio; normal doze euros, registado dezassete", "Três quilos; normal doze euros, registado vinte", "Dois quilos e meio; normal dezassete euros, registado doze"], answer: 1,
    explain: "«Dois quilos e meio» en la balanza; envío normal «doze euros» y certificado «dezassete»: 2,5 kg, 12 € o 17 €." },
  { id: "pt-ex-sit-ctt-2", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Qué elige el cliente y cuánto tarda?",
    options: ["Normal, com seguro; cinco a dez dias", "Registado; três a cinco dias úteis", "Registado; um dia útil", "Normal; três a cinco dias úteis"], answer: 1,
    explain: "Elige «registado» (hay libros dentro) y tarda «entre três e cinco dias úteis», con código de rastreio y seguro." },

  /* pt-sit-banco · No banco (B1) */
  { id: "pt-ex-sit-banco-1", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Qué quiere hacer el cliente y qué necesita?",
    options: ["Levantar dinheiro; o cartão", "Uma transferência para Espanha; o IBAN do destinatário", "Abrir uma conta; um comprovativo", "Trocar dinheiro; o passaporte"], answer: 1,
    explain: "«Queria fazer uma transferência para uma conta espanhola» y el funcionário pide «o IBAN do destinatário»." },
  { id: "pt-ex-sit-banco-2", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Qué comisiones hay y qué producto intenta vender el empleado?",
    options: ["Nenhuma na zona Euro; um depósito a prazo", "Cinco euros; um cartão de crédito", "Um por cento; um seguro de saúde", "Dez euros; uma conta conjunta"], answer: 0,
    explain: "«Para a zona Euro, nenhuma» comisión y al final ofrece «um depósito a prazo com boa taxa»: ningún coste e intenta colocar un depósito a plazo." },

  /* pt-sit-imobiliaria · Comprar casa (B2) */
  { id: "pt-ex-sit-imobiliaria-1", type: "mc", level: "B2", topic: "situazioni", prompt: "¿Cómo se formaliza la propuesta y cuánto es la señal?",
    options: ["Por palavra; cinco por cento", "Por escrito com valor e prazo; dez por cento depositado num advogado", "Por email; vinte por cento", "Verbalmente; um mês de renda"], answer: 1,
    explain: "«Uma proposta de compra por escrito, com o valor e o prazo» y la señal es «dez por cento, depositado num advogado»." },
  { id: "pt-ex-sit-imobiliaria-2", type: "mc", level: "B2", topic: "situazioni", prompt: "¿De cuánto deben contar los gastos de escritura y qué incluye?",
    options: ["Cinco por cento, só o imposto", "Sete por cento do valor: imposto e honorários do notário", "Dez por cento, com registos", "Três por cento, só o notário"], answer: 1,
    explain: "«Conte com o imposto e os honorários do notário, uns sete por cento do valor»: impuesto (IMT) + notario ≈ 7 %." },

  /* pt-sit-reuniao · Reunião de equipa (B2) */
  { id: "pt-ex-sit-reuniao-1", type: "mc", level: "B2", topic: "situazioni", prompt: "¿Qué desviación detecta el colega en su hoja de cálculo y qué sugiere?",
    options: ["Oito por cento; adiar a compra de equipamento", "Dezoito por cento; cortar salários", "Oito por cento; cancelar o projeto", "Cinco por cento; pedir um orçamento novo"], answer: 0,
    explain: "«Há um desvio de oito por cento. Sugiro adiar a compra de equipamento»: desviación del 8 % y propone aplazar la compra." },
  { id: "pt-ex-sit-reuniao-2", type: "mc", level: "B2", topic: "situazioni", prompt: "¿Qué decisión se toma y qué se pide al final?",
    options: ["Cancelar a compra; que se registe na ata", "Negociar com o fornecedor até quinta e apresentar a proposta na sexta; que alguém registe na ata", "Adiar tudo para o próximo mês; um novo orçamento", "Comprar já o equipamento; uma pausa"], answer: 1,
    explain: "«Negocie até quinta e apresentamos a proposta na sexta» y el colega pregunta «Alguém regista isto na ata?»: negociar + acta." },

  /* pt-sit-conferencia · Conferência académica (C1) */
  { id: "pt-ex-sit-conferencia-1", type: "mc", level: "C1", topic: "situazioni", prompt: "¿Cuál es la cuestión metodológica de la investigadora?",
    options: ["Que os dados são fabricados", "Que a amostra é pequena para generalizar os resultados", "Que a revisão por pares é desnecessária", "Que o painel é parcial"], answer: 1,
    explain: "«A amostra não é pequena para generalizar os resultados?»: ¿la muestra no es pequeña para generalizar? El orador la reconoce como «pergunta justíssima»." },
  { id: "pt-ex-sit-conferencia-2", type: "mc", level: "C1", topic: "situazioni", prompt: "¿Cómo responde el ponente y qué promete?",
    options: ["Diz que são dados finais; nada", "Reconhece que são dados preliminares com limitações, mas o padrão é consistente; discutirá as limitações na publicação", "Rejeita a pergunta; termina a sessão", "Promete nova amostra; uma segunda conferência"], answer: 1,
    explain: "«São dados preliminares, com as limitações que referiu, mas o padrão é consistente» y «volto a este painel na publicação para discutir as limitações em detalhe»." },

  /* pt-sit-debate · Debate no rádio (C1) */
  { id: "pt-ex-sit-debate-1", type: "mc", level: "C1", topic: "situazioni", prompt: "¿Qué matiz añade la invitada al panorama?",
    options: ["Que os números pioraram", "Que os números melhoraram, mas a recuperação é desigual", "Que não há dados", "Que tudo depende do governo"], answer: 1,
    explain: "«Permita-me que acrescente um matiz: os números melhoraram, mas a recuperação é desigual»: mejora desigual. Fórmula cortés para introducir un matiz." },
  { id: "pt-ex-sit-debate-2", type: "mc", level: "C1", topic: "situazioni", prompt: "¿Por qué discrepa parcialmente el invitado?",
    options: ["A estatística citada não inclui as regiões do interior", "Os dados são de há dez anos", "A convidada não entende de números", "O locutor é parcial"], answer: 0,
    explain: "«A estatística que citou não inclui as regiões do interior, e aí o ponto essencial muda»: la estadística excluye las regiones del interior." },
];
