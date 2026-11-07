import type { Exercise } from "../../types";

/* ── Ejercicios de comprensión FR · quizzes de escucha/lectura/situaciones
   v9.39 · Preguntas de comprensión sobre los contenidos de skills.ts
   (FR_LISTENING y FR_READINGS) y de situations.ts (FR_SITUATIONS).
   Convención del proyecto: prompt y explain en español con tuteo;
   opciones en français de France con tipografía francesa (espacio
   antes de ? ! : ; y comillas « » con espacios). Esquema de ids:
   fr-ex-ls-<tarea>-<n> · fr-ex-rd-<lectura>-<n> · fr-ex-sit-<situación>-<n>.
   topic: ascolto = escucha · cultura = lectura · situazioni = situación. */

export const FR_EXERCISES: Exercise[] = [
  /* ═══ Escucha · fr-ls-1 « À la boulangerie » (A1) ═══ */
  { id: "fr-ex-ls-1-1", type: "mc", level: "A1", topic: "ascolto", prompt: "En el diálogo de la boulangerie: además de la baguette tradition, ¿qué pide el cliente?",
    options: ["Un café et un croissant", "Deux brioches", "Un croissant et un pain au chocolat", "Une autre baguette"], answer: 2, explain: "Justo después de la baguette oyes « Un croissant et un pain au chocolat »." },
  { id: "fr-ex-ls-1-2", type: "mc", level: "A1", topic: "ascolto", prompt: "¿Cuánto debe pagar el cliente en total?",
    options: ["Quatre euros soixante", "Quatre euros trente", "Trois euros quatre-vingts", "Six euros vingt"], answer: 0, explain: "La boulangère dice « Quatre euros soixante, s'il vous plaît »: 4,60 €." },
  { id: "fr-ex-ls-1-3", type: "mc", level: "A1", topic: "ascolto", prompt: "¿Con qué fórmula se despide el cliente?",
    options: ["Au revoir, à bientôt !", "Merci, bonne journée !", "Bonsoir, à demain !", "Merci et bon appétit !"], answer: 1, explain: "« Merci, bonne journée ! »: el cierre amable típico al salir de una tienda." },

  /* ═══ Escucha · fr-ls-2 « Les mots de politesse » (A1) ═══ */
  { id: "fr-ex-ls-2-1", type: "mc", level: "A1", topic: "ascolto", prompt: "En la lista de cortesía: ¿qué expresión usas para disculparte antes de pedir algo?",
    options: ["De rien", "À bientôt", "Bonne journée", "Excusez-moi"], answer: 3, explain: "« Excusez-moi » sirve para llamar la atención; « de rien » es la respuesta a un gracias." },
  { id: "fr-ex-ls-2-2", type: "mc", level: "A1", topic: "ascolto", prompt: "Si alguien te dice « Merci », ¿qué le respondes?",
    options: ["De rien", "Bonjour", "Au revoir", "S'il vous plaît"], answer: 0, explain: "« De rien » = de nada. « S'il vous plaît » acompaña a una petición, no a un agradecimiento." },

  /* ═══ Escucha · fr-ls-3 « Au marché de Lyon » (A2) ═══ */
  { id: "fr-ex-ls-3-1", type: "mc", level: "A2", topic: "ascolto", prompt: "En el mercado: la productora ofrece dos variedades de manzana, ¿cuál elige el cliente?",
    options: ["Les Reinettes", "Les Gala", "Les Golden", "Les Pink Lady"], answer: 1, explain: "« Les Gala ou les Reinettes ? — Les Gala. » Las Reinettes también son de la Drôme, pero no las elige." },
  { id: "fr-ex-ls-3-2", type: "mc", level: "A2", topic: "ascolto", prompt: "¿De dónde procede el poulet fermier que compra?",
    options: ["De la Drôme", "De Lyon", "De Bresse", "De Bretagne"], answer: 2, explain: "« Il est de Bresse, il est excellent »: el poulet de Bresse es una de las aves con denominación más célebres de Francia." },

  /* ═══ Escucha · fr-ls-4 « L'entretien d'embauche » (B1) ═══ */
  { id: "fr-ex-ls-4-1", type: "mc", level: "B1", topic: "ascolto", prompt: "En la entrevista: ¿cuánto tiempo lleva Daniel viviendo en Lyon?",
    options: ["Six mois", "Trois ans", "Cinq ans", "Deux ans"], answer: 3, explain: "« Je vis à Lyon depuis deux ans »: depuis + presente = desde hace dos años." },
  { id: "fr-ex-ls-4-2", type: "mc", level: "B1", topic: "ascolto", prompt: "¿Qué defecto reconoce el candidato?",
    options: ["Il est parfois trop exigeant envers lui-même", "Il arrive souvent en retard", "Il n'est pas organisé", "Il ne sait pas travailler en équipe"], answer: 0, explain: "Admite ser « parfois trop exigeant envers moi-même », el defecto-presentable clásico de las entrevistas francesas." },
  { id: "fr-ex-ls-4-3", type: "mc", level: "B1", topic: "ascolto", prompt: "¿Por qué se presentó a esta empresa?",
    options: ["Parce qu'elle est proche de chez lui", "Parce qu'elle est leader dans le secteur", "Parce que le salaire est élevé", "Parce qu'un ami y travaille"], answer: 1, explain: "« Parce que vous êtes leaders dans le secteur » y desea « développer ses compétences »." },

  /* ═══ Escucha · fr-ls-5 « Sur la terrasse d'un café » (B2) ═══ */
  { id: "fr-ex-ls-5-1", type: "mc", level: "B2", topic: "ascolto", prompt: "La clienta sabe que la terraza cuesta más: ¿por qué se queda ahí?",
    options: ["Parce que c'est moins cher en terrasse", "Parce que le comptoir est complet", "Parce que le soleil est trop agréable", "Parce qu'elle veut fumer"], answer: 2, explain: "« Je préfère rester en terrasse quand même, le soleil est trop agréable »: pese a la tarifa, se queda por el sol." },
  { id: "fr-ex-ls-5-2", type: "mc", level: "B2", topic: "ascolto", prompt: "Al pagar con cinco euros, ¿qué dice la clienta?",
    options: ["Gardez la monnaie", "Rendez-moi la monnaie, s'il vous plaît", "Je paie par carte", "Je n'ai pas de monnaie"], answer: 0, explain: "« Gardez la monnaie » = quédese el cambio: la manera discreta de dejar propina en Francia." },

  /* ═══ Escucha · fr-ls-6 « Dictée : la France en phrases » (C1) ═══ */
  { id: "fr-ex-ls-6-1", type: "mc", level: "C1", topic: "ascolto", prompt: "Según el dictado: ¿en cuánto tiempo une el TGV París y Lyon?",
    options: ["En deux heures et demie", "En moins de deux heures", "En trois heures", "En une heure"], answer: 1, explain: "« Le TGV relie Paris à Lyon en moins de deux heures. »" },
  { id: "fr-ex-ls-6-2", type: "mc", level: "C1", topic: "ascolto", prompt: "Según el dictado: ¿qué garantiza la laïcité en las escuelas públicas?",
    options: ["La gratuité des manuels", "L'uniforme obligatoire", "L'enseignement du latin", "La liberté de conscience"], answer: 3, explain: "« La laïcité garantit la liberté de conscience dans les écoles publiques. »" },

  /* ═══ Lectura · fr-rd-1 « Une carte postale de Paris » (A1) ═══ */
  { id: "fr-ex-rd-1-1", type: "mc", level: "A1", topic: "cultura", prompt: "En la postal de Carmen: ¿cuándo llegó a París?",
    options: ["Hier", "Il y a une semaine", "Le mois dernier", "Ce matin"], answer: 0, explain: "« Je suis arrivée à Paris hier » con su familia; las vacaciones duran una semana." },
  { id: "fr-ex-rd-1-2", type: "mc", level: "A1", topic: "cultura", prompt: "¿Qué le sorprende de la Joconde?",
    options: ["Elle est très grande", "Elle est cachée derrière une vitre", "Elle est plus petite qu'elle ne le pensait", "Elle a quitté le musée"], answer: 2, explain: "« La Joconde est plus petite que je pensais ! », se sorprende de su tamaño." },

  /* ═══ Lectura · fr-rd-2 « Je me présente » (A1) ═══ */
  { id: "fr-ex-rd-2-1", type: "mc", level: "A1", topic: "cultura", prompt: "Según Hugo: ¿qué estudia en la universidad?",
    options: ["La médecine", "Le droit", "L'histoire de l'art", "Les langues étrangères"], answer: 1, explain: "Está en « troisième année de droit » en la universidad de Lyon." },
  { id: "fr-ex-rd-2-2", type: "mc", level: "A1", topic: "cultura", prompt: "¿Qué hace Hugo los sábados?",
    options: ["Il joue au foot avec ses amis", "Il écoute de la chanson française", "Il visite le Vieux Lyon avec ses amis", "Il travaille dans une boulangerie"], answer: 3, explain: "« Le samedi, je travaille dans une boulangerie »: atiende a los clientes y arregla los escaparates. El fútbol es el fin de semana." },

  /* ═══ Lectura · fr-rd-3 « La boulangerie du quartier » (A2) ═══ */
  { id: "fr-ex-rd-3-1", type: "mc", level: "A2", topic: "cultura", prompt: "¿A qué hora abre el señor Fabre su boulangerie?",
    options: ["À sept heures", "À huit heures", "À six heures et demie", "À midi"], answer: 0, explain: "« Tous les matins, à sept heures, Monsieur Fabre ouvre sa boulangerie. »" },
  { id: "fr-ex-rd-3-2", type: "mc", level: "A2", topic: "cultura", prompt: "¿Cuál es « la plus belle récompense » del señor Fabre?",
    options: ["Gagner beaucoup d'argent", "Recevoir un prix du quartier", "Voir ses étagères presque vides à midi", "Se lever très tôt chaque matin"], answer: 2, explain: "« À midi, il ne reste presque rien sur les étagères. “C'est ma plus belle récompense” »: el pan agotado es su mejor premio." },

  /* ═══ Lectura · fr-rd-4 « Le TGV : de Paris à Lyon » (B1) ═══ */
  { id: "fr-ex-rd-4-1", type: "mc", level: "B1", topic: "cultura", prompt: "Cuando se inauguró en 1981, ¿cuánto duraba el trayecto?",
    options: ["Moins de deux heures", "Deux heures et quarante minutes", "Trois heures", "Deux heures et demie"], answer: 1, explain: "Al principio duraba « deux heures et quarante minutes »; hoy tarda menos de dos horas." },
  { id: "fr-ex-rd-4-2", type: "mc", level: "B1", topic: "cultura", prompt: "¿Quiénes son los « grands navetteurs »?",
    options: ["Les conducteurs de TGV", "Les touristes qui visitent Paris en un jour", "Les voyageurs sans réservation", "Ceux qui habitent à Lyon et travaillent à Paris, ou l'inverse"], answer: 3, explain: "Viven en una ciudad y trabajan en la otra: la alta velocidad hizo posible ese ir y venir diario." },
  { id: "fr-ex-rd-4-3", type: "mc", level: "B1", topic: "cultura", prompt: "Según el último párrafo, ¿qué crítica recibe el TGV?",
    options: ["Les petites gares perdent des trains et les billets restent chers", "Il est plus lent que le train classique", "Il ne circule que le week-end", "Il a rendu Lyon plus lointaine"], answer: 0, explain: "« Le TGV fait débat »: las estaciones pequeñas pierden trenes y los billets siguen caros." },

  /* ═══ Lectura · fr-rd-5 « Le Louvre » (B2) ═══ */
  { id: "fr-ex-rd-5-1", type: "mc", level: "B2", topic: "cultura", prompt: "¿Cuándo se convirtió el Louvre en museo nacional?",
    options: ["En 1989, avec la Pyramide", "Au dix-septième siècle", "En 1793, après la Révolution", "En 1850, sous Napoléon III"], answer: 2, explain: "Fue residencia de los reyes durante siglos; solo tras la Revolución, en 1793, abrió como museo « ouvert à tous les citoyens »." },
  { id: "fr-ex-rd-5-2", type: "mc", level: "B2", topic: "cultura", prompt: "¿Qué consejo dan los habitués para visitar el museo?",
    options: ["Venir le lundi matin à l'ouverture", "Venir un mercredi soir et passer par la Porte des Lions", "Réserver un guide privé", "Se contenter de voir la Pyramide"], answer: 1, explain: "El consejo de los habituales: « venir un mercredi soir, passer par la Porte des Lions… et laisser La Joconde aux amateurs de selfies »." },

  /* ═══ Lectura · fr-rd-6 « Lyon, capitale de la gastronomie » (C1) ═══ */
  { id: "fr-ex-rd-6-1", type: "mc", level: "C1", topic: "cultura", prompt: "¿Quiénes fueron las « mères lyonnaises »?",
    options: ["Des reines de France installées à Lyon", "Des religieuses dirigeant des écoles hôtelières", "Des écrivaines gastronomiques du XIXe siècle", "Des cuisinières d'origine modeste qui firent de la cuisine un art populaire"], answer: 3, explain: "Cocineras de origen humilde que, entre los siglos XIX y XX, transformaron la cocina burguesa en arte popular." },
  { id: "fr-ex-rd-6-2", type: "mc", level: "C1", topic: "cultura", prompt: "¿Qué récord logró la mère Brazier?",
    options: ["Six étoiles", "Trois étoiles", "Dix étoiles", "Le premier restaurant étoilé de Lyon"], answer: 0, explain: "« obtint six étoiles — un record qui impressionna même le Tout-Paris »." },
  { id: "fr-ex-rd-6-3", type: "mc", level: "C1", topic: "cultura", prompt: "Según el texto, ¿qué se vende en el mercado de la Croix-Rousse?",
    options: ["Des souvenirs et des affiches vintage", "Le poulet de Bresse, les saint-marcellin et les pommes de la Drôme", "Des vins de Bordeaux exclusivement", "Des spécialités de Marseille"], answer: 1, explain: "El sábado por la mañana los productores venden allí « le poulet de Bresse, les saint-marcellin et les pommes de la Drôme »: el terroir en versión viva." },

  /* ═══ Situación · fr-sit-boulangerie « À la boulangerie du quartier » (A1) ═══ */
  { id: "fr-ex-sit-boulangerie-1", type: "mc", level: "A1", topic: "situazioni", prompt: "En el diálogo de la boulangerie: ¿qué pide el cliente al principio?",
    options: ["Deux traditions et un croissant", "Un pain au chocolat et une brioche", "Une tradition et deux croissants", "Trois baguettes et une brioche"], answer: 2, explain: "« Une tradition et deux croissants, s'il vous plaît. » El pain au chocolat lo pide después." },
  { id: "fr-ex-sit-boulangerie-2", type: "mc", level: "A1", topic: "situazioni", prompt: "¿Cuánto cuesta toda la compra?",
    options: ["Quatre euros trente", "Quatre euros soixante", "Cinq euros trente", "Trois euros quatre-vingts"], answer: 0, explain: "« Ça fera quatre euros trente »: el cliente paga con cinco euros." },

  /* ═══ Situación · fr-sit-cafe « En terrasse de café » (A1) ═══ */
  { id: "fr-ex-sit-cafe-1", type: "mc", level: "A1", topic: "situazioni", prompt: "Según el camarero, ¿dónde es más barato tomar el café?",
    options: ["En terrasse", "Au comptoir", "En salle", "À l'étage"], answer: 1, explain: "« C'est moins cher au comptoir »: en la barra se paga menos que en la terraza o la sala." },
  { id: "fr-ex-sit-cafe-2", type: "mc", level: "A1", topic: "situazioni", prompt: "¿Cómo pide la cuenta la clienta?",
    options: ["Le menu, s'il vous plaît", "La carte, s'il vous plaît", "Le pourboire, s'il vous plaît", "L'addition, s'il vous plaît"], answer: 3, explain: "« L'addition » es la cuenta; además dice « Gardez la monnaie » y deja el cambio como propina." },

  /* ═══ Situación · fr-sit-marche-lyon « Au marché de Lyon » (A2) ═══ */
  { id: "fr-ex-sit-marche-lyon-1", type: "mc", level: "A2", topic: "situazioni", prompt: "Después de probar la manzana, ¿qué decide el cliente?",
    options: ["Il en prend deux kilos", "Il en prend un demi-kilo", "Il n'en prend pas", "Il en prend cinq kilos"], answer: 0, explain: "« J'en prends deux kilos »: el pronombre en sustituye a las manzanas que acaba de probar." },
  { id: "fr-ex-sit-marche-lyon-2", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Qué añade a la compra al final del diálogo?",
    options: ["Un camembert bien affiné", "Un kilo de pommes de plus", "Deux saint-marcellin", "Un poulet de Bresse"], answer: 2, explain: "La productora ofrece « des saint-marcellin bien affinés » y el cliente responde « Alors deux saint-marcellin »." },

  /* ═══ Situación · fr-sit-tgv « Le TGV Paris-Lyon » (A2) ═══ */
  { id: "fr-ex-sit-tgv-1", type: "mc", level: "A2", topic: "situazioni", prompt: "En la taquilla: ¿qué tipo de billete compra la viajera?",
    options: ["Un aller-retour", "Un abonnement hebdomadaire", "Un billet première classe", "Un aller simple"], answer: 3, explain: "A la pregunta « Aller simple ou aller-retour ? » responde « Aller simple »: solo ida." },
  { id: "fr-ex-sit-tgv-2", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Desde qué andén sale el próximo TGV?",
    options: ["Le quai onze", "Le quai cinq", "Le quai douze", "Le quai numéro un"], answer: 0, explain: "« Gare de Lyon, quai onze »: sale a las catorce y llega a la Part-Dieu a las quince cincuenta y cinco." },
  { id: "fr-ex-sit-tgv-3", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Dónde está la voiture-bar del tren?",
    options: ["En voiture onze", "En voiture cinq", "Dans la gare de Lyon", "En tête du train"], answer: 1, explain: "« La voiture-bar est en voiture cinq »: cuidado, el once era el andén, no el coche." },

  /* ═══ Situación · fr-sit-louvre « Au musée du Louvre » (B1) ═══ */
  { id: "fr-ex-sit-louvre-1", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Qué propone el agente como alternativa a hacer cola?",
    options: ["Acheter un billet coupe-file au guichet", "Revenir le mercredi soir", "Réserver un créneau en ligne", "Entrer par la Porte des Lions"], answer: 2, explain: "« Sinon, vous pouvez réserver un créneau en ligne »: comprar en internet con horario reservado." },
  { id: "fr-ex-sit-louvre-2", type: "mc", level: "B1", topic: "situazioni", prompt: "Según el agente, ¿dónde se encuentra la Joconde?",
    options: ["Dans l'aile Denon, au premier étage", "Dans l'aile Richelieu, au rez-de-chaussée", "Sous la Pyramide de verre", "Dans l'exposition temporaire"], answer: 0, explain: "« Dans l'aile Denon, au premier étage. Suivez la foule, vous ne pouvez pas vous tromper ! »" },

  /* ═══ Situación · fr-sit-logement « Louer un appartement à Paris » (B2) ═══ */
  { id: "fr-ex-sit-logement-1", type: "mc", level: "B2", topic: "situazioni", prompt: "El loyer es de novecientos euros: ¿qué incluyen esas cifras?",
    options: ["Le dépôt de garantie", "Les charges", "L'assurance habitation", "Les frais d'agence"], answer: 1, explain: "« Le loyer est de neuf cents euros, charges comprises »: los gastos comunitarios van incluidos." },
  { id: "fr-ex-sit-logement-2", type: "mc", level: "B2", topic: "situazioni", prompt: "¿A cuánto asciende el dépôt de garantie?",
    options: ["À deux mois de loyer, charges comprises", "À trois mois de loyer", "À un mois de loyer, hors charges", "Il n'y a pas de dépôt de garantie"], answer: 2, explain: "« À un mois de loyer, hors charges »: la fianza equivale a un mes de alquiler sin los gastos." },
  { id: "fr-ex-sit-logement-3", type: "mc", level: "B2", topic: "situazioni", prompt: "¿Quién puede actuar como garant de la candidata?",
    options: ["Son employeur", "Sa banque", "Un ami parisien", "Ses parents"], answer: 3, explain: "« Mes parents peuvent se porter garants »: sus padres se ofrecen como avalistas del expediente." },

  /* ═══ v9.47 · 14 situaciones nuevas (fr-sit-*) ═══ */

  /* fr-sit-fromagerie · À la fromagerie (A1) */
  { id: "fr-ex-sit-fromagerie-1", type: "mc", level: "A1", topic: "situazioni", prompt: "En la quesería: ¿qué pide la clienta y en qué cantidad?",
    options: ["Un morceau de comté de deux cents grammes et un petit chèvre", "Un camembert entier et un chèvre", "Trois cents grammes de comté", "Un plateau de fromages complet"], answer: 0,
    explain: "« Je voudrais un morceau de comté » con « Deux cents grammes » y « un petit chèvre pour le soir »: 200 g de comté y un cabra pequeño." },
  { id: "fr-ex-sit-fromagerie-2", type: "mc", level: "A1", topic: "situazioni", prompt: "¿Cuánto tiempo está madurado el comté y qué propone el quesero al final?",
    options: ["Dix mois; une baguette", "Dix-huit mois; un camembert bien affiné pour le plateau", "Vingt-quatre mois; un reblochon", "Six mois; du beurre"], answer: 1,
    explain: "« Il est affiné dix-huit mois » y sugiere « un camembert bien affiné pour votre plateau »: madurado 18 meses y un camembert para la tabla." },

  /* fr-sit-kiosque · Au kiosque à journaux (A1) */
  { id: "fr-ex-sit-kiosque-1", type: "mc", level: "A1", topic: "situazioni", prompt: "¿Qué compra el cliente en el quiosco?",
    options: ["Le Monde du jour, un hebdomadaire économique et un carnet de timbres", "Un hebdomadaire et deux journaux", "Le Monde et une carte postale", "Un journal et un paquet de timbres"], answer: 0,
    explain: "« Le Monde du jour », « un hebdomadaire économique » y « un carnet de timbres »: el periódico, un semanario y un bloc de sellos." },
  { id: "fr-ex-sit-kiosque-2", type: "mc", level: "A1", topic: "situazioni", prompt: "¿Cuánto cuesta y cómo paga?",
    options: ["Huit euros soixante; par carte", "Huit euros soixante; avec dix euros en monnaie", "Six euros quatre-vingts; exact", "Dix euros soixante; avec vingt euros"], answer: 1,
    explain: "« Ça vous fera huit euros soixante » y paga « Voici dix euros » pidiendo cambio (« Vous faites de la monnaie ? »)." },

  /* fr-sit-epicerie · À l'épicerie du coin (A1) */
  { id: "fr-ex-sit-epicerie-1", type: "mc", level: "A1", topic: "situazioni", prompt: "¿Qué pide la clienta en la ultramarinos?",
    options: ["Une baguette tradition et une bouteille de rouge", "Deux baguettes et de l'eau", "Une baguette et un journal", "Une bouteille de blanc et du fromage"], answer: 0,
    explain: "« Une baguette tradition et une bouteille de rouge, s'il vous plaît »: barra tradicional y tinto, con la propuesta del patrón aceptada tras probar." },
  { id: "fr-ex-sit-epicerie-2", type: "mc", level: "A1", topic: "situazioni", prompt: "¿Prueba el vino antes de comprarlo y cuánto paga?",
    options: ["Non; sept euros", "Oui, et elle prend la bouteille; sept euros quatre-vingts", "Oui, mais elle refuse; huit euros", "Non; six euros quatre-vingts"], answer: 1,
    explain: "El épicier ofrece « Vous goûtez ? », ella responde « Volontiers… Je la prends » y el total es « sept euros quatre-vingts » (7,80 €)." },

  /* fr-sit-bus · Dans le bus parisien (A2) */
  { id: "fr-ex-sit-bus-1", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Hacia dónde va el bus y qué debe hacer la pasajera al subir?",
    options: ["À Nation; valider son ticket à la borne", "À Republique; acheter un ticket au conducteur", "Au terminus; composter son billet", "À Bastille; rien"], answer: 0,
    explain: "« Ce bus va bien à Nation ? — Oui » y « validez votre ticket à la borne »: va a Nation y hay que validar en la máquina." },
  { id: "fr-ex-sit-bus-2", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Dónde está el transbordo con el metro y qué pide el conductor?",
    options: ["À Nation; de descendre", "À Republique; de pousser vers le fond et de céder sa place", "À Bastille; de garder le silence", "À Lyon; de composter"], answer: 1,
    explain: "« Republique » es la correspondance y el conductor pide « poussez vers le fond » (empujen al fondo) y que alguien « cède sa place » a una señora." },

  /* fr-sit-gare · À la gare (A2) */
  { id: "fr-ex-sit-gare-1", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Qué billete compra y qué rama queda disponible?",
    options: ["Un aller simple; la rame de 14h07", "Un aller-retour pour Lyon; la rame de 14h07", "Un aller-retour pour Paris; la rame de 15h", "Un billet de première; la rame de 14h07"], answer: 1,
    explain: "« Un aller-retour pour Lyon » y como « l'heure de pointe est complète », queda « la rame de 14h07 »." },
  { id: "fr-ex-sit-gare-2", type: "mc", level: "A2", topic: "situazioni", prompt: "¿De qué vía sale y qué no debe olvidar?",
    options: ["Voie A; acheter un sandwich", "Voie B; composter son billet", "Voie B; réserver un siège", "Voie C; rien"], answer: 1,
    explain: "« Voie B » (verificando el anuncio, puede cambiar) y « N'oubliez pas de composter votre billet »: validar el billete." },

  /* fr-sit-medecin · Chez le médecin (A2) */
  { id: "fr-ex-sit-medecin-1", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Qué síntomas tiene la paciente?",
    options: ["Mal à la gorge depuis trois jours, toux et un peu de fièvre (38 degrés)", "Mal de tête et fatigue", "Mal au ventre et fièvre haute", "Toux sèche sans fièvre"], answer: 0,
    explain: "« J'ai mal à la gorge depuis trois jours et je tousse beaucoup » con « Un peu, 38 degrés hier soir »: garganta, tos y fiebre leve." },
  { id: "fr-ex-sit-medecin-2", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Cuál es el diagnóstico y el tratamiento?",
    options: ["Une grippe; des antibiotiques", "Une angine virale; un sirop et du repos", "Une allergie; un spray", "Un rhume; rien du tout"], answer: 1,
    explain: "« C'est une angine virale. Je vous fais une ordonnance : un sirop et du repos »: angina vírica, jarabe y reposo. Y pregunta por el reembolso automático." },

  /* fr-sit-bricolage · Au magasin de bricolage (A2) */
  { id: "fr-ex-sit-bricolage-1", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Qué busca el cliente y qué pregunta clave hace el vendedor?",
    options: ["Des vis et des chevilles pour une étagère; « pour du plâtre ou du béton ? »", "Un foret et de la peinture; « quelle couleur ? »", "Une étagère complète; « quel budget ? »", "Une perceuse; « quelle marque ? »"], answer: 0,
    explain: "« Des vis et des chevilles pour fixer une étagère » y la pregunta clave: « Pour du plâtre ou du béton ? » — cambia el taco según la pared." },
  { id: "fr-ex-sit-bricolage-2", type: "mc", level: "A2", topic: "situazioni", prompt: "¿Qué consejo de pro da el vendedor y qué ofrece gratis?",
    options: ["Percer doucement pour ne pas fissurer; le devis pour la peinture", "Acheter deux kits; la livraison", "Peindre d'abord; un foret gratuit", "Louer une perceuse; rien"], answer: 0,
    explain: "« Percez doucement pour ne pas fissurer » (taladre despacio para no agrietar) y « le devis pour la peinture est gratuit »." },

  /* fr-sit-entretien · L'entretien d'embauche (B1) */
  { id: "fr-ex-sit-entretien-1", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Cuál es la trayectoria del candidato?",
    options: ["Cinq ans en marketing digital, dont deux comme chef de projet", "Trois ans en vente, puis manager", "Deux ans comme chef de projet seulement", "Cinq ans dans la finance"], answer: 0,
    explain: "« J'ai travaillé cinq ans dans le marketing digital, dont deux comme chef de projet »: 5 años, 2 como jefe de proyecto. « Dont » = de los cuales." },
  { id: "fr-ex-sit-entretien-2", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Qué tipo de contrato se ofrece y con qué condición?",
    options: ["Un CDD d'un an; sans période d'essai", "Un CDI avec une période d'essai de deux mois", "Un stage; six mois d'essai", "Un CDI; sans essai"], answer: 1,
    explain: "« Le poste est en CDI avec une période d'essai de deux mois »: contrato indefinido con 2 meses de prueba." },

  /* fr-sit-restaurant · Réserver au restaurant (B1) */
  { id: "fr-ex-sit-restaurant-1", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Para cuándo y cuántas personas es la reserva?",
    options: ["Samedi, deux personnes", "Dimanche, quatre personnes", "Samedi, quatre personnes", "Vendredi, deux personnes"], answer: 0,
    explain: "« Réserver une table pour samedi, deux personnes »: sábado para dos, a las 20 horas (también había terraza a las 19)." },
  { id: "fr-ex-sit-restaurant-2", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Qué necesidad alimentaria especial se anota?",
    options: ["Végétarien", "Sans gluten", "Allergie aux fruits secs", "Sans lactose"], answer: 1,
    explain: "« L'un de nous mange sans gluten » y el camarero: « le chef adaptera le menu du marché »: cocina sin gluten." },

  /* fr-sit-banque · À la banque (B1) */
  { id: "fr-ex-sit-banque-1", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Por qué necesita el RIB tan rápido el cliente?",
    options: ["Pour voyager", "Il vient d'arriver en France pour travailler", "Pour un achat en ligne", "Pour un crédit"], answer: 1,
    explain: "« Je viens d'arriver en France pour travailler. Il me faut un RIB vite »: acaba de llegar a trabajar y necesita los datos bancarios (para la nómina)." },
  { id: "fr-ex-sit-banque-2", type: "mc", level: "B1", topic: "situazioni", prompt: "¿Cuánto cuesta la apertura y qué tarjeta sugiere la asesora?",
    options: ["Vingt euros; une carte classique", "Gratuite; la carte premium avec découvert autorisé", "Cinquante euros; une carte à débit différé", "Gratuite; aucune carte"], answer: 1,
    explain: "« L'ouverture est gratuite » y aconseja « la carte premium avec découvert autorisé »: apertura gratis + tarjeta premium con descubierto." },

  /* fr-sit-assurance · À l'agence d'assurance (B2) */
  { id: "fr-ex-sit-assurance-1", type: "mc", level: "B2", topic: "situazioni", prompt: "¿Qué tipo de siniestro declara el cliente y qué documento pide el agente?",
    options: ["Un accident de voiture; la facture du garage", "Un dégât des eaux; le constat rempli avec le voisin", "Un vol; la plainte", "Un incendie; les photos"], answer: 1,
    explain: "« J'ai eu un dégât des eaux » (daño por agua) y el agente pregunta por « le constat » firmado por ambas partes." },
  { id: "fr-ex-sit-assurance-2", type: "mc", level: "B2", topic: "situazioni", prompt: "¿De cuánto es la franquicia y cuándo pasa el perito?",
    options: ["Cinquante euros; sous trois jours", "Cent cinquante euros; sous cinq jours ouvrés", "Deux cents euros; sous dix jours", "Aucune franchise; immédiatement"], answer: 1,
    explain: "« Cent cinquante euros » de franchise y « L'expert passera évaluer les dégâts sous cinq jours ouvrés »: 150 € y 5 días hábiles." },

  /* fr-sit-reunion · La réunion de travail (B2) */
  { id: "fr-ex-sit-reunion-1", type: "mc", level: "B2", topic: "situazioni", prompt: "¿Qué desviación presupuestaria se detecta y qué se propone?",
    options: ["Six pour cent sur la communication; reporter la campagne", "Six pour cent sur les salaires; licencier", "Seize pour cent; annuler le projet", "Deux pour cent; rien"], answer: 0,
    explain: "« Un dépassement de six pour cent sur la communication. Je propose de reporter la campagne »: desviación del 6 % y aplazar la campaña." },
  { id: "fr-ex-sit-reunion-2", type: "mc", level: "B2", topic: "situazioni", prompt: "¿Cuál es la síntesis final de la reunión?",
    options: ["Renégociation jeudi, validation vendredi, compte rendu lundi", "Validation jeudi, renégociation vendredi", "Tout est annulé", "Décision reportée au mois prochain"], answer: 0,
    explain: "« En synthèse : renégociation jeudi, validation vendredi, compte rendu lundi »: la responsible cierra con el calendario completo." },

  /* fr-sit-colloque · Le colloque universitaire (C1) */
  { id: "fr-ex-sit-colloque-1", type: "mc", level: "C1", topic: "situazioni", prompt: "¿Cuál es la crítica metodológica de la interviniente?",
    options: ["Le corpus est trop étroit pour conclure", "Les résultats sont faux", "Le chercheur n'est pas crédible", "La méthodologie est parfaite"], answer: 0,
    explain: "« Votre corpus n'est-il pas trop étroit pour conclure ? »: ¿el corpus no es demasiado estrecho? Pregunta en estilo interrogativo culto con inversión." },
  { id: "fr-ex-sit-colloque-2", type: "mc", level: "C1", topic: "situazioni", prompt: "¿Cómo matiza el investigador su afirmación?",
    options: ["Il refuse tout débat", "« À chaud, je dirais tendance forte plutôt que règle »", "Il retire sa communication", "Il attaque l'intervenante"], answer: 1,
    explain: "« J'accepte la nuance : à chaud, je dirais « tendance forte » plutôt que « règle » »: acepta el matiz y reformula con « plutôt que » (en vez de)." },

  /* fr-sit-debat · Le débat radiophonique (C1) */
  { id: "fr-ex-sit-debat-1", type: "mc", level: "C1", topic: "situazioni", prompt: "¿Qué subraya la experta sobre las cifras oficiales?",
    options: ["Elles sont fausses", "La tendance est à la baisse, mais lente", "Elles ne sortent que demain", "Elle refuse de les commenter"], answer: 1,
    explain: "« Permettez-moi d'insister sur les chiffres officiels : la tendance est à la baisse, mais lente »: baja lenta. La fórmula permite-moi d'insister refuerza con cortesía." },
  { id: "fr-ex-sit-debat-2", type: "mc", level: "C1", topic: "situazioni", prompt: "¿Por qué no zanja la experta en antena y qué propone?",
    options: ["Elle n'a pas de données; elle conclut", "Elle n'a pas le droit; elle raccroche", "Elle ne peut trancher sur l'antenne, mais les deux lectures sont compatibles avec les données trimestrielles", "Elle attend l'avis du modérateur"], answer: 2,
    explain: "« Je ne peux trancher sur l'antenne, mais les deux lectures sont compatibles si l'on regarde les données trimestrielles »: las dos lecturas son compatibles con los datos trimestrales." },
];
