import type { CefrLevel, WordCategory } from "../types";

/* ═══ v9.18 · Tipos del diccionario de interfaz por lengua ═══════════
   La UI (chrome, fichas, enunciados, botones) se renderiza en la lengua
   de estudio activa. `.it` reproduce EXACTAMENTE los textos históricos
   (cero regresión para el curso de italiano); `.en` es inglés americano;
   pt/fr/de aportan el esqueleto (nav/shell/search/fichas/quiz) hasta
   que llegue su contenido.                                        */

export interface UiNavStrings {
  groups: { ruta: string; cursos: string; destrezas: string; herramientas: string; plugins: string; evaluacion: string; sistema: string };
  items: Partial<Record<string, string>>;   // ViewId → etiqueta (solo vistas no IT_ONLY)
}

export interface UiShellStrings {
  studying: string;
  tagline: string;
  search: string; searchAria: string; searchTitle: string;
  xpTitle: string; streakTitle: string; levelTitle: string;
  hello: string;
  closeMenu: string; goHome: string;
  adminTitle: string; sessionTitle: string;
  logout: string; loginAria: string; loginTitle: string; signIn: string;
  themeToLight: string; themeToDark: string; titleLight: string; titleDark: string;
  footer: string;
  more: string;
  loginHeading: string; loginSub: string; userLabel: string; passLabel: string;
  userPh: string; checking: string; enter: string; loginErr: string; loginNote: string;
  dueBadge: (n: number) => string;
  navAria: string; quickNavAria: string; langAria: string; menuAria: string;
}

export interface UiSearchStrings {
  placeholder: string; aria: string; dialogAria: string;
  empty: (q: string) => string;
  gVista: string; gParola: string; gGrammatica: string;
  navHint: string; results: (n: number) => string;
}

export interface UiCommonStrings {
  showEs: string; hideEs: string;
  prev: string; next: string; stop: string;
  exact: string; wrongMark: string;
  answerIs: (x: string) => string;
  passed: string;
  needMore: (n: number) => string;
  answeredCount: (a: number, t: number) => string;
  hoverHint: string;
  unitNotFound: string;
  retry: string;
  studyLangName: string;   // "italiano" / "English" / "português"…
  country: string;         // "Italia" / "the United States"…
}

export interface UiHomeStrings {
  heroChip: string; greetWord: string; greetTail: string;
  namePh: string; nameAria: string; save: string; cancel: string; changeName: string;
  askName: string; nameSaved: (n: string) => string;
  heroDescA: string; heroDescB: string;
  testCta: string; continueCta: (t: string) => string; exploreCta: string; tutorCta: string;
  xpTotal: string; streak: string; streakF: (n: number) => string;
  coins: string; coinsSpin: string; cards: string;
  freezeNote: (n: number) => string;
  missionTitle: string; missionsDone: (xp: number) => string; missionsHint: (xp: number) => string; dailyGoalDone: string;
  wordOfDay: string;
  weakTitle: string; weakDesc: string;
  exploreTitle: string;
  pluginsTitle: string; pluginsNote: string;
  levelsTitle: string; levelsDesc: (n: number) => string;
  fromZero: string; fromZeroDesc: string;
  levelOff: string; unlockWith: (p: string) => string;
  commUnits: (n: number) => string;
  levelLabels: Record<CefrLevel, string>;
  quick: Record<string, { label: string; tag: string; desc: string }>;
}

export interface UiCoursesStrings {
  kicker: string;                 // "Percorso comunicativo · metodologia Cambridge"
  heroTitle: string;
  heroDesc: (n: number, country: string) => string;
  chipUnits: (n: number) => string; chipSteps: string; chipDone: (d: number, t: number) => string;
  profileTitle: string; profileChip: (lv: string) => string;
  skillNames: Record<string, string>;
  skillDescs: Record<string, Record<string, string>>;
  yourLevel: string; paidContent: (p: string) => string;
  units: (n: number) => string; hours: (h: number) => string; doneCheck: (d: number, t: number) => string;
  zeroTitle: string; zeroDesc: string; zeroLessons: (n: number) => string;
  sequenceTipA: string; sequenceTipB: string;
  backPath: string; goal: string;
  levelMeta: (n: number, h: number, d: number) => string;
  unitN: (n: number) => string; completed: string; stepsOf: (s: number) => string; xpPerStep: string;
  allCourses: string; lessons: (n: number) => string; words: (n: number) => string; exercises: (n: number) => string;
  lessonBase: string; lessonDoneAria: string;
}

export interface UiUnitStrings {
  steps: Record<string, string>;
  back: (lv: string, n: number) => string;
  kicker: (lv: string, n: number) => string;
  completedBadge: string;
  stepsAria: string;
  tScenario: string; tAscolto: string; tComprensione: string; tVocabolario: string;
  tGrammatica: (f: string) => string; tPronuncia: (f: string) => string; tParlato: string;
  tLettura: string; tScrittura: string; tCultura: (f: string) => string;
  tMissione: (f: string) => string; tAutovalutazione: string;
  goalsTitle: string; candoChip: string; candoNote: (lv: string) => string; compareScale: string;
  listenDialogue: string; tipListen: string;
  chunksNoteA: string; chunksNoteB: string;
  observe: string; theRule: string; fullExplain: string; moreExamples: string; ruleTables: string;
  putToTest: string; chooseUse: string; extraTransform: string; fixError: string; fullTopic: string;
  kindCtrl: string; kindSemi: string; kindComm: string; kindAuth: string;
  extReading: string; show: string; hide: string; continueReading: string;
  courseReading: string; openFull: string; readQuestion: string;
  minWords: (n: number) => string; writePh: string; wordsCount: (a: number, b: number) => string;
  hideModel: string; viewModel: string; modelTitle: string;
  cultureNote: string;
  checklist: string;
  selfIntroA: string; selfIntroB: (lv: string) => string;
  candoConfirmed: string; candoComplete: string; reviewQuiz: string;
  unitDone: (n: number) => string; unitDoneSub: string; claimDiploma: string;
  alreadyDone: string; reviewAnytime: string;
  prev: string; next: string; stepCount: (s: number, n: number) => string;
  doneScenario: string; doneAscolto: string; doneVocab: string; donePron: string;
  doneParlato: string; doneLettura: string; doneScrittura: string; doneCultura: string;
  doneMissione: string; doneSection: string;
  quizEsatto: string; quizRespuesta: (x: string) => string; quizSuperato: string;
  quizNeedMore: (n: number) => string; quizAnswered: (a: number, t: number) => string;
}

export interface UiQuizStrings {
  noExercises: string; great: string; almost: string;
  scoreLine: (s: number, t: number, p: number) => string;
  passedMsg: string; failedMsg: string; retry: string;
  typeMc: string; typeTf: string; typeFill: string; typeOrder: string; typeDict: string; typeTranslate: string;
  true: string; false: string;
  listenAgain: (r: number) => string; writeExactly: string;
  dictPh: string; answerPh: string; correctAnswer: string; correctOrder: string;
  tapOrder: string; check: string; finish: string; next: string;
  correctXp: (n: number) => string; incorrect: string;
  currentScore: string; ofN: (t: number) => string;
  optionAria: (i: number, o: string) => string; answerAria: string;
}

export interface UiClozeStrings {
  kicker: (m: number) => string;
  gapAria: (n: number) => string; completeGap: (n: number) => string;
  notThat: (x: string) => string;
  readingDone: (n: number) => string; deduceNote: string;
  progressHint: (s: number, t: number) => string;
  sectionTitle: string; doneCount: (c: number, t: number) => string;
  intro: string;
  readingTab: (i: number) => string; allDone: string; allDoneSub: string;
  tabsAria: string;
}

export interface UiMindStrings {
  kinds: { literal: string; inferential: string; critical: string };
  justification: string; correctWas: (v: string) => string;
  checkIdeas: string; ideasLegend: string;
  intruderTag: string; wellSpotted: string; intruderWrong: string;
  checkOrder: string; orderCount: (n: number, t: number) => string;
  perfectSeq: string; almostSeq: string; greenNumbers: string;
  listening: string; listenAudio: string; hideText: string; showText: string;
  topicLine: string; readText: string; goodPrediction: string; predictionBtn: string;
  quizTitle: string; quizHint: string; vfTitle: string; vfHint: string;
  ideasTitle: string; ideasHint: string; intruderTitle: string;
  seqTitle: string; listenTitle: string; listenHint: string;
  readingComplete: string; strategiesLine: string; completeToClose: string;
  sectionTitle: string; sectionIntro: string; strategyChips: string[];
  readingTab: (i: number) => string; allDone: string; allDoneSub: string;
  doneCount: (c: number, t: number) => string;
  collectionName: string; collectionDesc: (n: number) => string; completedLabel: string;
  searchPh: string; searchAria: string; allTopics: string; cefrChip: string;
  countLine: (n: number) => string; searchTag: string;
  noResults: (q: string) => string; noResultsHint: string; clearFilters: string;
  prev: string; next: string; libDone: (n: number, t: number) => string;
  minPar: (m: number, p: number) => string; unitN: (n: number) => string; readingOf: (i: number) => string;
  themeLabels: Record<string, string>;
}

export interface UiQuadroStrings {
  heroTitle: string; heroSub: string; heroDesc: string;
  chipUnits: (n: number, country: string) => string;
  chipVocabIt: string; chipVocab: (n: string, lang: string) => string;
  chipGrammarIt: string; chipGrammar: (n: number) => string;
  chipReadings: (n: number) => string;
  chipCert: (name: string, country: string) => string;
  yourLevel: string; placementLevel: string; noTestYet: string;
  guidedHours: (label: string, h: number) => string;
  retakeTest: string; takeTest: string;
  selfTitle: string; gridChip: string; markSkills: string; skillsMarked: (n: number) => string; skillsMin3: string; goToGrid: string;
  candoTitle: string; candoSub: string;
  compareIntro: (a: string, b: string) => string;
  compareUp: string; compareDown: string; compareEqual: string;
  gridTitle: string; gridIntro: string; clear: string; markDescriptor: string;
  gridResult: string; suggested: string; suggestedNote: string; continueAt: (lv: string) => string;
  scaleTitle: string; scaleIntro: string; yourLevelTag: string; guidedH: (a: number, b: number) => string;
  covUnits: string; covGrammar: string; covEntries: string; covReadings: string; covDone: (d: number, t: number) => string;
  covTitle: string; covIntro: string;
  th: { level: string; units: string; grammar: string; vocab: string; classic: string; themed: string; cloze: string; cando: string };
  covNote: string;
  certsTitle: (variant: string) => string; certsIntro: (lang: string, country: string) => string; prepIncluded: string;
  intlTitle: string; intlIntro: string; thCefr: string; thActfl: string; thIlr: string; rigorNoteA: string; rigorNoteB: string;
  applyTitle: string; applyIntro: string;
  compliance: { point: string; detail: string }[];
  backToPath: string;
}

/* ═══ v9.45 · Vista Letture multilingüe (biblioteca clásica) ═══════ */
export interface UiLettureStrings {
  all: string;                       // filtro "todas las categorías"
  levelsAll: string;                 // etiqueta del filtro de nivel (MCER/CEFR…)
  countLine: (n: number) => string;  // "n letture disponibles · audio…"
  meta: (n: number, dialogue: boolean, minutes: number, questions: number) => string;
  mindTitle: string; mindBadge: string; mindDesc: string; explore: string;
  backToList: string; backToText: string;
  listenAll: string; stop: string; speedAria: string; subsLabel: string;
  playPara: (i: number) => string; stopPara: (i: number) => string;
  playLine: (speaker: string) => string; stopLine: (speaker: string) => string;
  voiceWarning: string;
  glossary: string; listenPron: string;
  quizButton: (n: number) => string;
  comprehension: (title: string) => string; quizLabel: (title: string) => string;
  completed: (score: number, total: number, coins: number) => string; afterQuiz: string;
  discussTitle: string; discussIntro: string; discussWithTutor: string;
  doneTitle: string;
}

/* ═══ v9.19 · Lookups de datos compartidos entre vistas ═════════════
   Los datos de gamificación (logros, ligas, temas…) viven en módulos
   lib con valores históricos. El render usa u.data.X[key] ?? fallback:
   it lleva los diccionarios VACÍOS (el fallback ES el histórico, byte
   idéntico); en añade el mapeo completo. pt/fr/de heredan it.        */
export interface UiDataStrings {
  skills: Record<string, string>;                     // ascolto/lettura… (radar, statistiche)
  topics: Record<string, string>;                     // TOPIC_LABELS (debilidades, statistiche)
  ranks: Record<string, string>;                      // XP_RANKS por nombre histórico
  leagues: Record<string, string>;                    // LEAGUES por id
  plans: Record<string, { tagline: string; badge?: string; features: string[] }>;
  categories: Record<string, string>;                 // CATEGORY_META por key
  freq: Record<string, { label: string; desc: string }>;
  register: Record<string, string>;
  types: Record<string, string>;                      // TYPE_LABELS (sostantivo…)
  wheel: Record<string, string>;                      // WHEEL_PRIZES por id
  shopTitles: Record<string, { name: string; desc: string }>;
  month: Record<string, (t: number) => string>;       // MONTH_TEMPLATES por type
  achCats: Record<string, string>;                    // ACHIEVEMENT_CATS por cat
  achievements: Record<string, { name: string; desc: string }>;
  badges: Record<string, { name: string; desc: string }>;
}

/* v9.19 · componentes de plan (plan-badge.tsx) */
export interface UiPlanStrings {
  unlockWith: (p: string) => string;
  availableFrom: (p: string) => string;
  bannerChip: string;
  bannerTitleA: string;          // "Sblocca" / "Unlock" (resto es marca)
  bannerDesc: string;
  bannerCta: string;
  bannerFrom: string;
}

/* v9.19 · Mi progreso (progress.tsx) */
export interface UiProgressStrings {
  skills: Record<string, string>;                     // etiquetas del radar (SKILL_LABELS)
  kpis: { xp: string; streak: string; level: string; accuracy: string };
  noTest: string; testDone: string; takeTest: string;
  daysUnit: (n: number) => string;
  todayOf: (xp: number, goal: number) => string;
  testsDone: (n: number) => string;
  missingForNext: (n: number) => string;
  radarTitle: string; radarDesc: string;
  radarLocked: { title: string; bullets: string[] };
  calTitle: string; calDesc: string; calAria: string;
  legend: { goal: string; partial: string; rest: string };
  calLocked: { title: string; bullets: string[] };
  srsTitle: string;
  srsLabels: { mastered: string; learning: string; due: string };
  goReview: string;
  lessonsTitle: string; fromZero: string;
  lessonsTotal: (done: number, all: number) => string;
  adaptiveTitle: string; adaptiveDesc: string;
  noData: string; noWeak: string;
  adaptiveLocked: { title: string; bullets: string[] };
  achTitle: (unlocked: number, total: number) => string;
  achIntro: string;
  unlockedTag: string;
  classicBadges: string;
  historyTitle: string;
}

/* v9.19 · Statistiche (statistiche.tsx) */
export interface UiStatsStrings {
  kpis: { xp: string; week: (n: number) => string; avg: string; goalDay: (n: number) => string; streak: string; freezes: (n: number) => string; noFreeze: string; streakUnit: (n: number) => string; quizAcc: string; plays: (n: number) => string };
  barsTitle: string; goalHits: (n: number) => string; barsAria: string; today: string;
  calTitle: string; calAria: string; dow: string[];
  activeDays: (n: number) => string;
  recordLine: (xp: number, date: string) => string;
  srsTitle: string; srsAria: string;
  srsEmptyA: string; srsEmptyVocab: string; srsEmptyMid: string; srsEmptyDict: string; srsEmptyPost: string;
  srsLabels: { due: string; fresh: string; learning: string; mastered: string };
  reviewNow: (n: number) => string;
  skillsTitle: string;
  gamesTitle: string; gamesEmpty: string;
  weakTitle: string; weakEmpty: string; weakErrors: (pct: number) => string;
  targeted: string;
  records: { lessons: string; diplomas: string; writings: string; srsWords: string; recordXp: string; activeDays: string };
  privacyNote: string;
}

/* v9.19 · Classifica (classifica.tsx) */
export interface UiClassificaStrings {
  guestTitle: string;
  guestA: string; guestStrongA: string; guestB: string; guestStrongB: string; guestC: string;
  cta: string; hint: string;
  leagueOf: (i: number, n: number) => string;
  howTitle: string;
  howRules: { pre: string; strong?: string; post?: string }[];
  myLeague: string;
  leagueLabel: (name: string) => string;
  studentsIn: (n: number) => string;
  closing: string;
  refreshAria: string; refreshTitle: string;
  positionTitle: string;
  weekLineA: (xp: number) => string;
  weekLineB: (streak: number) => string;
  zeroHint: string;
  loadError: string; unavailable: string;
  you: string; promo: string; demo: string; firstAria: string;
  xpTotal: (xp: number) => string;
  allLeagues: string;
  weekRulesTitle: string;
  weekRules: string[];
}

/* v9.19 · Premi & Sfide (premi.tsx) */
export interface UiPremiStrings {
  balance: string;
  boost: (m: number, s: number) => string;
  freezes: (n: number, max: number) => string;
  bought: (name: string, price: number) => string;
  buyFail: string;
  wheelTitle: string; wheelDesc: string;
  spin: string; spinning: string; tomorrow: string;
  prize: (emoji: string, label: string) => string;
  monthTitle: (mk: string) => string;
  monthDesc: string;
  progressOf: (cur: string, target: string) => string;
  daysLeft: (n: number) => string;
  claim: string; claimed: string;
  claimMsg: (coins: number, xp: number) => string;
  notYet: string;
  completeFor: (coins: number, xp: number) => string;
  shopTitle: string; shopDesc: string;
  freezeName: string; freezeDesc: string; freezeFull: string; freezeBuyName: string;
  boostName: string; boostDesc: string; boostBuyName: string;
  titleCard: (name: string) => string;
  titleBuy: (name: string) => string;
  alreadyYours: string;
  equip: string; equipped: string;
  buy: string;
  need: (n: number) => string;
  unavailable: string;
}

/* v9.19 · Piani PRO (pricing.tsx) */
export interface UiPricingStrings {
  disabledTitle: string; disabledDesc: string; disabledCta: string;
  heroChip: string;
  heroGreet: (name: string) => string;
  activePlan: (name: string) => string;
  monthly: string; yearly: string; off: string; billingAria: string;
  decimalDot: boolean;   // true → 7.99 (EN); false → 7,99 (IT/ES)
  cardsAria: string;
  matrixTitle: string; matrixDesc: string; matrixTh: string;
  matrixRows: string[];
  /* valores localizables de la matriz (fila corrección IA y demás) */
  corr2: string; corr5: string; unlimited: string;
  freeForever: string;
  perMonth: (price: string, cur: string) => string;
  perMonthShort: string;
  perYear: (y: number, cur: string) => string;
  saveYear: string;
  orYear: (y: number, cur: string) => string;
  faqTitle: string;
  faq: { q: string; a: string }[];
  faqDemoNote: string;
  checkoutAria: (name: string) => string;
  planOf: (name: string) => string;
  billingLabel: string;
  billingMonthly: string; billingYearly: string;
  priceLabel: string;
  totalYear: string; totalMonth: string;
  moreFeatures: (n: number) => string;
  payNote: string; demoNoteShort: string;
  cancel: string;
  toPayment: string;
  activateOf: (name: string) => string;
  paymentTitle: (name: string) => string;
  paymentSub: string;
  payRefLabel: string;
  copyAria: (l: string) => string;
  netBase: string;
  vat: (r: number) => string;
  totalLabel: string;
  methodLabel: string;
  methodBank: string;
  methodBankIbanHint: string; methodBankSwiftHint: string;
  methodPaypal: string; methodCard: string;
  methodCardHint: (provider: string) => string;
  bankBeneficiary: string; bankName: string; bankAddress: string;
  bankAccount: (cur: string) => string; bankAccountPlain: string;
  bankIban: string;
  bankDataIban: string; bankDataIntl: string;
  bankAccountNote: (cur: string) => string;
  paypalSendTo: string;
  paypalNote: (ref: string) => string;
  cardDemoNote: string;
  back: string;
  paidActivate: (name: string) => string;
  demoWarning: string;
  processing: string; processingSub: (name: string) => string;
  success: (name: string) => string;
  successSub: (name: string, user: string) => string;
  start: string;
  closeAria: string; backAria: string;
  planActive: string;
  toFree: string;
  switchTo: (name: string) => string;
}

/* v9.19 · Dizionario (dictionary.tsx) */
export interface UiDizionarioStrings {
  entries: string;      // "voci" / "entries"
  back: string;
  ffTag: string;
  ffTitle: string;
  inFav: string; fav: string;
  addFavAria: string; removeFavAria: string;
  addToReview: string; inReview: string;
  catGram: string; catTheme: string;
  example: string;
  collocations: string;
  useNote: string;
  syn: string; ant: string; related: string;
  genderM: string; genderF: string;
  artM: string; artF: string;
  variants: string;
  pluralShort: string;
  panelTitle: string;
  statsLine: (total: number) => string;
  hideStats: string; showStats: string;
  covNote: (cov: number, target: number) => string;
  ipaChip: (pct: number) => string;
  freqChip: (n: number) => string;
  collocChip: (n: number) => string;
  notesChip: (n: number) => string;
  ffChip: (n: number) => string;
  freqDot: string;
  searchPh: string;
  searchAria: string;
  favorites: string;
  reviewFavs: (n: number) => string;
  history: string;
  allLevels: string;
  highFreq: string;
  onlyFf: string; onlyHf: string;
  catAria: string; typeAria: string;
  allCats: string; allTypes: string;
  resultsFor: (n: number, q: string) => string;
  resultsN: (n: number) => string;
  empty: string;
  emptyHint: (total: number) => string;
  openAria: (w: string) => string;
  loadMore: (n: number, visible: number, total: number) => string;
  cefrChip: string;
  inReviewDot: string;
  registerLabel: string;
  freqLabel: string;
}

/* v9.19 · Importatore (importer.tsx) */
export interface UiImportatoreStrings {
  demoText: string;
  noTitle: string; pastedTitle: string;
  introTitle: string; introDesc: string;
  known: (known: string, total: string, pct: number) => string;
  pasteTab: string; urlTab: string;
  pastePh: string; pasteAria: string;
  convert: string; tryDemo: string;
  urlPh: string; urlAria: string;
  importing: string; importBtn: string;
  netError: string;
  tip: string;
  savedTitle: (n: number, max: number) => string;
  wordsOf: (n: string) => string;
  deleteAria: (t: string) => string;
  stWords: string; stLemmas: string; stDict: string; stReview: string;
  recTitle: string;
  addAll: (lv: string) => string;
  bulkNone: string;
  bulkDone: (n: number) => string;
  legendUnmarked: string; legendReview: string; legendMissing: string;
  closeAria: string; closeCardAria: string;
  textAria: string;
  notFoundHint: string;
  analyzerHint: string;
  inflected: (w: string, form: string) => string;
  wcInReview: string;
  wcAdd: string;
  importError: string;
}

/* v9.19 · Pomodoro (plugins2.tsx) */
export interface UiPomodoroStrings {
  tag: string; title: string; desc: string;
  count: (n: number) => string;
  modes: { label: string; desc: string }[];   // mismo orden que POMODORO_MODES
  modesAria: string;
  focus: string; pause: string;
  start: string; pauseBtn: string; reset: string;
  timerAria: (mm: string, ss: string) => string;
  modeLine: (label: string, f: number, p: number) => string;
  today: (n: number) => string;
  xpEarned: (n: number) => string;
  tip: string;
  voiceBreak: string;
  voiceResume: string;
}

/* v9.19 · Impostazioni (SettingsView, exams.tsx) */
export interface UiImpostazioniStrings {
  planOf: (name: string) => string;
  activeSince: (d: string) => string;
  billingM: string; billingY: string;
  manage: string; toFree: string;
  sure: string; yes: string; no: string;
  supportTitle: string; supportSub: string;
  secTitle: string;
  pinOn: string; pinOff: string;
  secDesc: string;
  changePin: string; disablePin: string; lockNow: string;
  curPin: string; newPin: string; repeat: string;
  savePin: string; verifying: string; deactivate: string;
  autoLock: string;
  never: string; min1: string; min5: string; min15: string;
  lockOnStart: string;
  activatePin: string; activateBtn: string; activating: string;
  cancel: string;
  newPinFull: string; repeatPin: string;
  curPinConfirm: string;
  pinMustMatch: string; pinMustMatchNew: string;
  noPinActive: string; wrongCurrent: string;
  pinActivated: string; pinUpdated: string; pinRemoved: string;
  privacyMode: string; privacyModeDesc: string;
  payTitle: string; payDesc: string;
  payEmpty: string;
  payDone: string; payWaiting: string;
  copyRefAria: string;
  payMethods: Record<string, string>;
  profileTitle: string; nameLabel: string; save: string; nameAria: string;
  lookTitle: string; theme: string; light: string; dark: string;
  textSize: string;
  audioTitle: string;
  rate: string; rateHint: string;
  goal: string; perDay: string;
  subtitles: string;
  notifTitle: string; notifDesc: string;
  notifOn: string; notifTest: string; notifOff: string;
  notifDenied: string; notifUnsupported: string; notifChecking: string;
  notifEnable: string;
  msgOn: string; msgOff: string;
  msgTest: (m: string) => string;
  msgDenied: string; msgUnsupported: string; msgNokey: string; msgFail: string;
  dataTitle: string; dataDesc: string;
  backupBtn: string; restoreBtn: string;
  fileAria: string;
  platinumPack: (n: number) => string;
  packLocked: string;
  resetBtn: string;
  yesReset: string;
  backupOk: string;
  backupRestored: (xp: number, cards: number, streak: number) => string;
  invalidFile: (msg: string) => string;
  formatErr: string;
  dataNote: string;
  a11yTitle: string;
  a11y: string[];
}

/* ═══ v9.27 · Plan de estudio semanal del Home en la lengua de estudio ═
   generateWeeklyPlan() recibe este bloque y produce días/focos/
   actividades localizados (antes: hardcode italiano).                    */
export interface UiWeeklyStrings {
  title: string;
  subtitle: (level: string, due: number) => string;
  /** lunes→domingo, 7 elementos */
  days: string[];
  /** bandera de la cultura de la lengua (🇮🇹/🇺🇸/🇵🇹/🇫🇷/🇩🇪) */
  flag: string;
  focus: {
    mon: string;
    tueWeak: (w: string) => string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
  };
  act: {
    lesson: (lv: string) => string;
    due: (n: number) => string;
    addWords: string;
    reinforce: (w: string) => string;
    grammarNew: string;
    listen: string;
    dictation: string;
    vowelLab: string;
    writing: string;
    reading: string;
    conversation: string;
    tutor: string;
    culture: string;
    bonus: string;
    game: string;
    quickReview: string;
    preview: string;
  };
}

/* ═══ v9.28 · Radiogiornale (vista Notizie) en la lengua de estudio ══
   La vista notizie.tsx consume este bloque para TODO su cromo (tarjeta
   del método VOA, filtros, tarjetas, reproductor, quiz, debate).
   Convenciones: en methodIntro «§…§» delimita el segmento que se renderiza
   en negrita (el nombre de la lengua de estudio); rates es paralelo a
   NEWS_RATES (4 velocidades). .it migra a italiano los textos
   explicativos que estaban en español (inmersión total, criterio v9.27). */
export interface UiNewsStrings {
  methodTitle: string;
  methodIntro: (lang: string) => string;
  steps: { t: string; d: (lang: string) => string }[];
  all: string;
  cefr: string;
  count: (n: number) => string;
  completed: string;
  edition: (place: string, level: string) => string;
  cardMeta: (w: number, min: number, q: number) => string;
  listenCta: (n: number) => string;
  backToAll: string;
  backToNews: string;
  dateline: (place: string, level: string) => string;
  wordsTitle: string;
  wordsIntro: string;
  wordTip: string;
  playAll: string;
  stop: string;
  prevSentence: string;
  nextSentence: string;
  speedsAria: string;
  voiceChange: string;
  voicePrefix: string;
  systemVoice: string;
  soloAudio: string;
  soloAudioTip: string;
  subsEs: string;
  playerStatus: (rate: string, n: number, hidden: boolean) => string;
  listening: (cur: number, total: number) => string;
  sentenceOf: (n: number, total: number) => string;
  soloIntro: string;
  soloDesc: string;
  revealText: string;
  sentenceAria: (n: number) => string;
  sentenceHint: string;
  quizTitle: (t: string) => string;
  quizLabel: (t: string) => string;
  quizDone: (score: number, total: number) => string;
  quizDoneSub: string;
  answerCta: (n: number) => string;
  footerNote: (level: string) => string;
  discussTitle: string;
  discussIntro: string;
  discussCta: string;
  rates: string[];
}

/* ═══ v9.41 · Juegos: nombres, tarjetas y UI interna por lengua ══════
   Los juegos se muestran en la lengua de estudio activa (igual que
   nav/títulos desde v9.40): cartas, botones, marcadores y notas del
   ahorcado/memoria/ordenar/quiz. `cats` localiza las categorías de
   vocabulario dentro de los juegos.                                    */
export interface UiGameCard { t: string; sub: string; d: string; }
export interface UiGamesStrings {
  off: { title: string; body: string; back: string };
  back: string;
  play: string;
  cards: { memoria: UiGameCard; quiz: UiGameCard; impiccato: UiGameCard; ordinare: UiGameCard };
  memory: {
    chooseCat: string; changeCat: string;
    pairs: (n: number) => string;
    moves: (n: number) => string;
    restart: string;
    won: (m: number, s: number) => string;
    covered: string;
    ariaCat: (c: string) => string;
  };
  hangman: {
    title: string;
    round: (r: number, w: number) => string;
    errors: (w: number, max: number) => string;
    guess: string;
    hintCost: string;
    hintLine: (es: string, cat: string) => string;
    won: (w: string, es: string, hint: boolean, xp: number) => string;
    lost: (w: string, es: string) => string;
    listen: string;
    next: string;
    note: (level: string) => string;
    letter: (l: string) => string;
  };
  order: {
    tap: string; check: string; perfect: string; almost: string;
    listen: string; next: string; of: (i: number, n: number) => string;
  };
  quiz: {
    question: (n: number) => string;
    points: (n: number) => string;
    streak: (n: number) => string;
    correct: string;
    say: (x: string) => string;
    srOk: string;
    srKo: (x: string) => string;
    score: (pct: number) => string;
    best: (n: number) => string;
    again: string;
    msg: [string, string, string, string];
    option: (l: string, o: string) => string;
  };
  cats: Record<WordCategory, string>;
}

export interface UiStrings {
  common: UiCommonStrings;
  nav: UiNavStrings;
  /** títulos de vista (header) por ViewId — opcional, fallback VIEW_TITLES */
  titles?: Partial<Record<string, { title: string; sub: string }>>;
  shell: UiShellStrings;
  search: UiSearchStrings;
  home: UiHomeStrings;
  /** v9.27 · plan de estudio semanal (sección premium del Home) */
  weekly: UiWeeklyStrings;
  /** v9.28 · vista Notizie · Radiogiornale (método VOA) */
  news: UiNewsStrings;
  courses: UiCoursesStrings;
  unit: UiUnitStrings;
  quiz: UiQuizStrings;
  cloze: UiClozeStrings;
  mind: UiMindStrings;
  quadro: UiQuadroStrings;
  letture: UiLettureStrings;
  /** v9.19 · interiores de las vistas de herramientas */
  data: UiDataStrings;
  plan: UiPlanStrings;
  progress: UiProgressStrings;
  stats: UiStatsStrings;
  classifica: UiClassificaStrings;
  premi: UiPremiStrings;
  pricing: UiPricingStrings;
  dizionario: UiDizionarioStrings;
  importatore: UiImportatoreStrings;
  pomodoro: UiPomodoroStrings;
  impostazioni: UiImpostazioniStrings;
  /** v9.41 · vista Giochi por lengua de estudio */
  games: UiGamesStrings;
  /** etiquetas de misión diaria por tipo (clave = QuestType) */
  questLabels: Record<string, (t: number) => string>;
}
