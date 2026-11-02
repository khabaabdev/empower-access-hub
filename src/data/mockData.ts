// OpenAccess Hub - shared data models, taxonomy and small helpers.

export const CATEGORIES = [
  { id: "essential-services", label: "Essential Services", short: "Free basics" },
  { id: "accommodated-work", label: "Accommodated Work", short: "Flexible gigs" },
  { id: "training-workshops", label: "Training & Workshops", short: "Skill building" },
  { id: "healthcare-wellness", label: "Healthcare & Wellness", short: "Care access" },
  { id: "crisis-support", label: "Crisis Support", short: "Help now" },
] as const;

export type CategoryType = (typeof CATEGORIES)[number]["id"];

export const ACCESSIBILITY_TAGS = [
  { id: "wheelchair-accessible", label: "Wheelchair accessible", plain: "Step-free entry, wide doors, accessible restroom." },
  { id: "sensory-friendly", label: "Sensory friendly", plain: "Low noise, soft light, calm room available." },
  { id: "no-resume", label: "No resume needed", plain: "You can start without a CV or interview." },
  { id: "no-id-required", label: "No ID required", plain: "No documents or paperwork needed." },
  { id: "asl-available", label: "ASL interpreter", plain: "American Sign Language support on site." },
  { id: "public-transit-adjacent", label: "Near transit", plain: "A short walk from a bus or train stop." },
  { id: "quiet-space", label: "Quiet space", plain: "A low-stimulus room you can step into." },
  { id: "flexible-hours", label: "Flexible hours", plain: "Choose shifts or drop in when you can." },
  { id: "service-animals-welcome", label: "Service animals welcome", plain: "Trained service animals are always admitted." },
  { id: "multilingual-staff", label: "Multilingual staff", plain: "Staff speak more than one language." },
] as const;

export type AccessibilityTagId = (typeof ACCESSIBILITY_TAGS)[number]["id"];

export type NoiseLevel = "Low" | "Medium" | "High";
export type LightLevel = "Soft" | "Natural" | "Fluorescent";

export interface AccommodationItem {
  label: string;
  verified: boolean;
}

export interface ResourceListing {
  id: string;
  title: string;
  organization: string;
  category: CategoryType;
  description: string;
  plainSummary: string;
  address: string;
  neighborhood: string;
  mapX: number;
  mapY: number;
  distanceMiles: number;
  hours: string;
  isOpenNow: boolean;
  phone: string;
  email: string;
  website: string;
  accessibilityTags: AccessibilityTagId[];
  accommodations: AccommodationItem[];
  sensoryProfile: { noise: NoiseLevel; lighting: LightLevel; crowd: NoiseLevel };
  transit: string[];
  compensation?: string;
  requirements?: string;
  contactMethod: string;
  isVerified: boolean;
  verifiedBy: string;
  verifiedDate: string;
  isCommunitySubmitted?: boolean;
}

export interface AccessibilityPreferences {
  fontScale: "normal" | "large" | "xlarge";
  highContrast: boolean;
  sensoryCalm: boolean;
  dyslexiaFont: boolean;
  voiceReader: boolean;
  theme: "light" | "dark";
}

export type RequestStatus = "submitted" | "reviewing" | "connected";

export interface ConnectionRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  organization: string;
  message: string;
  accommodations: string;
  status: RequestStatus;
  createdAt: string;
}

export type SortKey = "nearest" | "recent" | "value" | "alpha";

export type ViewMode = "grid" | "list" | "map";

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "nearest", label: "Nearest first" },
  { id: "recent", label: "Recently verified" },
  { id: "value", label: "Highest value" },
  { id: "alpha", label: "Alphabetical" },
];

export const REQUEST_STATUS_META: Record<RequestStatus, { label: string; note: string }> = {
  submitted: { label: "Submitted", note: "Your request reached the coordinator." },
  reviewing: { label: "Coordinator reviewing", note: "A staff member is checking accommodations." },
  connected: { label: "Connected", note: "You are matched. Expect a direct call or message." },
};

export const NEED_WIZARD: { id: string; label: string; category: CategoryType | null; tags: AccessibilityTagId[] }[] = [
  { id: "food-today", label: "I need free food today", category: "essential-services", tags: ["no-id-required"] },
  { id: "accessible-work", label: "I need wheelchair-accessible work", category: "accommodated-work", tags: ["wheelchair-accessible"] },
  { id: "low-noise", label: "I need a low-noise environment", category: null, tags: ["sensory-friendly", "quiet-space"] },
  { id: "quiet-study", label: "I need a quiet place to study", category: "training-workshops", tags: ["quiet-space"] },
  { id: "health-care", label: "I need no-cost health care", category: "healthcare-wellness", tags: ["no-id-required"] },
];

export const EMERGENCY_LINES = [
  { name: "988 Suicide & Crisis Lifeline", detail: "Call or text 988, 24/7, free and confidential.", phone: "988" },
  { name: "Warm Line (non-emergency talk)", detail: "Peer support for when you just need someone to listen.", phone: "1-800-555-0146" },
  { name: "Emergency Food Hotline", detail: "Same-day pantry delivery and hot meals.", phone: "1-800-555-0173" },
  { name: "Accessible Transit Dispatch", detail: "Door-to-door paratransit rides, book 2 hours ahead.", phone: "1-800-555-0192" },
];

export type ViewKey =
  | "directory"
  | "scanner"
  | "transit"
  | "emergency"
  | "saved";

export function tagLabel(id: string): string {
  const found = ACCESSIBILITY_TAGS.find((tag) => tag.id === id);
  return found ? found.label : id;
}

export function tagPlain(id: string): string {
  const found = ACCESSIBILITY_TAGS.find((tag) => tag.id === id);
  return found ? found.plain : "";
}

export function categoryLabel(id: CategoryType): string {
  const found = CATEGORIES.find((cat) => cat.id === id);
  return found ? found.label : id;
}

export function speakText(text: string): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

/* ============================================================
   Accessibility Passport — a reusable, shareable needs profile
   ============================================================ */
export type MobilityNeed = "none" | "wheelchair" | "mobility-aid" | "low-fatigue";
export type CommunicationPref = "verbal" | "written" | "text-only" | "asl" | "translation";
export type AssistanceNeed = "independent" | "guide" | "companion" | "quiet-start";

export interface AccessibilityPassport {
  id: string;
  name: string;
  mobility: MobilityNeed;
  communication: CommunicationPref;
  assistance: AssistanceNeed;
  sensory: { noise: boolean; light: boolean; crowd: boolean; scent: boolean };
  serviceAnimal: boolean;
  languages: string;
  notes: string;
  updatedAt: string;
}

export const MOBILITY_OPTIONS: { id: MobilityNeed; label: string; hint: string }[] = [
  { id: "none", label: "No mobility aid", hint: "I walk without support." },
  { id: "wheelchair", label: "Wheelchair or scooter", hint: "I need step-free entry and wide paths." },
  { id: "mobility-aid", label: "Cane, walker or crutches", hint: "I need places to sit and short distances." },
  { id: "low-fatigue", label: "Limited stamina", hint: "I need rest breaks and slower pacing." },
];

export const COMMUNICATION_OPTIONS: { id: CommunicationPref; label: string; hint: string }[] = [
  { id: "verbal", label: "Spoken words", hint: "Talking in person or by phone works." },
  { id: "written", label: "Written only", hint: "Please give instructions in writing." },
  { id: "text-only", label: "Text or chat", hint: "I prefer not to speak on the phone." },
  { id: "asl", label: "Sign language (ASL)", hint: "I use ASL interpreters." },
  { id: "translation", label: "Interpreter needed", hint: "I need a spoken-language interpreter." },
];

export const ASSISTANCE_OPTIONS: { id: AssistanceNeed; label: string; hint: string }[] = [
  { id: "independent", label: "I am on my own", hint: "No extra helper needed." },
  { id: "guide", label: "A guide helps me", hint: "Someone walks me through spaces." },
  { id: "companion", label: "I bring a support person", hint: "A friend assists me." },
  { id: "quiet-start", label: "I need a calm start", hint: "A quiet check-in away from lines." },
];

export const SENSORY_FLAGS: { key: keyof AccessibilityPassport["sensory"]; label: string }[] = [
  { key: "noise", label: "Sensitive to noise" },
  { key: "light", label: "Sensitive to bright light" },
  { key: "crowd", label: "Overwhelmed by crowds" },
  { key: "scent", label: "Sensitive to strong scents" },
];

export function defaultPassport(): AccessibilityPassport {
  return {
    id: "passport",
    name: "",
    mobility: "none",
    communication: "verbal",
    assistance: "independent",
    sensory: { noise: false, light: false, crowd: false, scent: false },
    serviceAnimal: false,
    languages: "",
    notes: "",
    updatedAt: "",
  };
}

export function passportLineText(p: AccessibilityPassport): string {
  const parts: string[] = [];
  parts.push(MOBILITY_OPTIONS.find((o) => o.id === p.mobility)?.label ?? "");
  parts.push(COMMUNICATION_OPTIONS.find((o) => o.id === p.communication)?.label ?? "");
  parts.push(ASSISTANCE_OPTIONS.find((o) => o.id === p.assistance)?.label ?? "");
  const sensory = SENSORY_FLAGS.filter((f) => p.sensory[f.key]).map((f) => f.label.toLowerCase());
  if (sensory.length) parts.push(`sensory: ${sensory.join(", ")}`);
  if (p.serviceAnimal) parts.push("service animal accompanies me");
  if (p.languages.trim()) parts.push(`languages: ${p.languages.trim()}`);
  if (p.notes.trim()) parts.push(p.notes.trim());
  return parts.filter(Boolean).join(" · ");
}

/* ============================================================
   Barrier reports — corrections residents can file
   ============================================================ */
export type BarrierType =
  | "entrance"
  | "restroom"
  | "elevator"
  | "sensory"
  | "staff"
  | "hours"
  | "other";

export const BARRIER_TYPES: { id: BarrierType; label: string }[] = [
  { id: "entrance", label: "Entrance is not step-free" },
  { id: "restroom", label: "Accessible restroom unusable" },
  { id: "elevator", label: "Elevator or lift is out" },
  { id: "sensory", label: "Noise or light not as described" },
  { id: "staff", label: "Staff could not help with access" },
  { id: "hours", label: "Hours or address have changed" },
  { id: "other", label: "Something else" },
];

export interface BarrierReport {
  id: string;
  listingId: string;
  listingTitle: string;
  type: BarrierType;
  detail: string;
  createdAt: string;
  status: "sent" | "reviewing";
}

export function barrierTypeLabel(id: BarrierType): string {
  const found = BARRIER_TYPES.find((t) => t.id === id);
  return found ? found.label : id;
}

/* ============================================================
   Interactive Demo Video — simulated 2m48s product walkthrough
   ============================================================ */
export interface DemoChapter {
  id: string;
  start: number;
  end: number;
  time: string;
  title: string;
  narration: string;
  caption: string;
  scene: string[];
  characterId: string;
}

export const DEMO_DURATION = 72;

/** Primary demo clip: real-people footage showing diverse individuals navigating daily life. */
export const DEMO_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

/** Second source the browser falls back to when the primary clip cannot load. */
export const DEMO_VIDEO_FALLBACK =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

export const DEMO_CHAPTERS: DemoChapter[] = [
  {
    id: "problem",
    start: 0,
    end: 12,
    time: "0:00",
    title: "Maya's Morning",
    narration:
      "Maya wakes up in her wheelchair-accessible apartment and needs groceries before her daughter's school pickup. The nearest pantry has stairs at the entrance, no listed restroom access, and a form written at a college reading level. She drives past it. Forty-three percent of people like Maya skip a service every month because the access details are missing.",
    caption: "Help exists, but barriers keep people like Maya from reaching it.",
    scene: ["Maya uses a power wheelchair, needs step-free entry", "Skipped 3 pantry visits this month due to unknown access", "Forms written at a college reading level"],
    characterId: "maya",
  },
  {
    id: "discovery",
    start: 12,
    end: 24,
    time: "0:12",
    title: "Marcus Finds His Route",
    narration:
      "Marcus is blind and uses a screen reader to navigate his city. OpenAccess Hub reads every listing aloud in plain language, tags each place with step-free entry, ASL interpreters, and quiet rooms. He filters by what he actually needs and finds a free job-training workshop with a tactile floor map and audio guidance.",
    caption: "Marcus filters by screen-reader compatible, audio-guided, no ID required.",
    scene: ["Plain-language summary on every card, read aloud", "Ten accessibility tags Marcus can trust", "Screen reader announces every filter result"],
    characterId: "marcus",
  },
  {
    id: "scanner",
    start: 24,
    end: 36,
    time: "0:24",
    title: "Elena Scans a Job Posting",
    narration:
      "Elena is autistic and her son Lucas has ADHD. A job listing demands standing for 8 hours in a loud open-plan office. The scanner rewrites it at a fifth-grade level, flags the sensory barriers, and shows Elena that she can request a seated position and noise-reducing headphones as accommodations.",
    caption: "Elena pastes a complex posting, gets plain English and barrier flags.",
    scene: ["Fifth-grade rewrite in one tap, no jargon", "Sensory barrier flags: loud office, standing required", "Accommodation suggestions: seated role, quiet station"],
    characterId: "elena",
  },
  {
    id: "transit",
    start: 36,
    end: 48,
    time: "0:36",
    title: "David Plans a Quiet Trip",
    narration:
      "David is a 72-year-old veteran with PTSD and limited mobility. He needs to reach the VA clinic but dreads the crowded bus. The transit planner shows him a step-free route with low crowd levels, the quietest travel window, and turn-by-turn sensory checkpoints he prints and folds into his jacket pocket.",
    caption: "David gets a step-free route with quiet times and sensory checkpoints.",
    scene: ["Ramp and elevator status shown before boarding", "Quietest travel window: 9 to 11 AM, low crowd", "Printable turn-by-turn with sensory warnings"],
    characterId: "david",
  },
  {
    id: "emergency",
    start: 48,
    end: 60,
    time: "0:48",
    title: "Aisha Builds Her Safety Card",
    narration:
      "Aisha is Deaf and uses ASL. She is traveling to a city where she does not know anyone. She builds a printable emergency wallet card with her crisis lines, her access passport, her interpreter contacts, and her saved resources. The card works offline, needs no signal, and she keeps it in her purse.",
    caption: "Aisha exports a printable wallet card, saved offline on her device.",
    scene: ["One-click low-ink printable card with ASL contacts", "Crisis lines plus access passport in plain text", "Download as text for offline, no-signal use"],
    characterId: "aisha",
  },
  {
    id: "ledger",
    start: 60,
    end: 72,
    time: "1:00",
    title: "The Community Verifies",
    narration:
      "Jordan, Sam, and Lia are community auditors. They physically check ramps, elevators, and interpreter schedules at local clinics and job centers. Each report is stamped with a confidence score and timestamp. The whole platform meets WCAG AAA contrast and works with a keyboard, a screen reader, and a slow connection.",
    caption: "Live community audits. WCAG AAA contrast. No account ever.",
    scene: ["Jordan checks the ramp at the clinic, confidence 96%", "Sam flags a broken elevator at the rail station", "Lia confirms ASL interpreter schedule, verified today"],
    characterId: "community",
  },
];

export interface DemoLanguage {
  code: string;
  label: string;
  native: string;
  flag: string;
}

export const DEMO_LANGUAGES: DemoLanguage[] = [
  { code: "en-US", label: "English", native: "English", flag: "🇺🇸" },
  { code: "es-ES", label: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr-FR", label: "French", native: "Français", flag: "🇫🇷" },
  { code: "de-DE", label: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "sw-KE", label: "Swahili", native: "Kiswahili", flag: "🇰🇪" },
  { code: "ja-JP", label: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "zh-CN", label: "Mandarin", native: "中文", flag: "🇨🇳" },
  { code: "ar-SA", label: "Arabic", native: "العربية", flag: "🇸🇦" },
];

/** Localized chapter captions (subtitles + spoken narration). Order matches DEMO_CHAPTERS. */
export const DEMO_CAPTIONS: Record<string, string[]> = {
  "en-US": [
    "Maya skips services because barriers are invisible.",
    "Marcus filters by screen-reader, audio, no ID.",
    "Elena scans a job post, gets plain English and flags.",
    "David plans a quiet, step-free route to his clinic.",
    "Aisha exports a printable offline emergency card.",
    "Community auditors verify ramps and elevators live.",
  ],
  "es-ES": [
    "La ayuda existe, pero las barreras lo impiden.",
    "Filtra por acceso sin escalones, silencio, lenguaje de señas, sin identificación.",
    "Pega un formulario complejo y obtén lenguaje claro y una lista.",
    "Rutas sin escalones con horarios tranquilos y estado de rampas.",
    "Tarjeta imprimible guardada sin conexión en tu dispositivo.",
    "Auditorías comunitarias en vivo. Contraste WCAG AAA. Sin cuenta.",
  ],
  "fr-FR": [
    "L'aide existe, mais les barrières bloquent l'accès.",
    "Filtrez par accès de plain-pied, calme, langue des signes, sans pièce d'identité.",
    "Collez un formulaire complexe et obtenez un langage clair et une liste.",
    "Des itinéraires sans marches, des horaires calmes et l'état des rampes.",
    "Une carte imprimable enregistrée hors ligne sur votre appareil.",
    "Des audits communautaires en direct. Contraste WCAG AAA. Sans compte.",
  ],
  "de-DE": [
    "Hilfe gibt es, doch Barrieren versperren den Weg.",
    "Filter nach stufenlosem Zugang, Ruhe, Gebärdensprache, ohne Ausweis.",
    "Formular einfügen und klare Sprache sowie eine Checkliste erhalten.",
    "Stufenlose Routen mit ruhigen Zeiten und Rampenstatus.",
    "Druckbare Karte, offline auf Ihrem Gerät gespeichert.",
    "Live-Gemeinschaftsprüfungen. WCAG-AAA-Kontrast. Nie ein Konto.",
  ],
  "sw-KE": [
    "Msaada upo, lakini vikwazo huwazuia watu kuufikia.",
    "Chuja kwa njia isiyo na ngazi, utulivu, lugha ya ishara, bila kitambulisho.",
    "Bandika fomu ngumu upate lugha rahisi na orodha ya ukaguzi.",
    "Njia zisizo na ngazi zenye nyakati tulivu na hali ya njia panda.",
    "Kadi ya kuchapisha iliyohifadhiwa bila mtandao kwenye kifaa chako.",
    "Ukaguzi wa jamii moja kwa moja. Utofautishaji wa WCAG AAA. Bila akaunti.",
  ],
  "ja-JP": [
    "支援はあっても、障壁が人を遠ざけます。",
    "段差なし、静けさ、手話、身分証不要で絞り込み。",
    "複雑な書類を貼り付けて、やさしい言葉とチェックリストに。",
    "段差なしの経路、静かな時間帯、スロープの状況。",
    "印刷できるカードを端末にオフライン保存。",
    "地域のライブ監査。WCAG AAA コントラスト。アカウント不要。",
  ],
  "zh-CN": [
    "资源就在那里，但障碍让人难以获得。",
    "按无障碍、安静、手语、免证件筛选。",
    "粘贴复杂表格，获得通俗语言和清单。",
    "无障碍路线，含安静时段与坡道状态。",
    "可打印卡片，离线保存在你的设备上。",
    "社区实时审核。WCAG AAA 对比度。无需账户。",
  ],
  "ar-SA": [
    "المساعدة موجودة لكن العوائق تمنع الوصول إليها.",
    "تصفَّح حسب الدخول بدون درج، الهدوء، لغة الإشارة، دون هوية.",
    "الصق نموذجاً معقداً واحصل على لغة مبسطة وقائمة.",
    "مسارات بدون درج مع أوقات هادئة وحالة المنحدرات.",
    "بطاقة قابلة للطباعة محفوظة دون اتصال على جهازك.",
    "تدقيق مجتمعي مباشر. تباين WCAG AAA. دون أي حساب.",
  ],
};

/* ============================================================
   Demo Characters: realistic human personas with diverse needs
   ============================================================ */
export interface DemoCharacter {
  id: string;
  name: string;
  role: string;
  avatar: string;
  accessibilityNeeds: string[];
  story: string;
}

export const DEMO_CHARACTERS: DemoCharacter[] = [
  {
    id: "maya",
    name: "Maya",
    role: "Wheelchair User & Single Mother",
    avatar: "‍♺️",
    accessibilityNeeds: ["Step-free entry", "Accessible restroom", "Wide doorways"],
    story: "Needs a grocery pantry that she can enter without stairs and use the restroom independently.",
  },
  {
    id: "marcus",
    name: "Marcus",
    role: "Blind Job Seeker",
    avatar: "‍",
    accessibilityNeeds: ["Screen reader compatible", "Audio guidance", "No visual-only info"],
    story: "Uses a screen reader to find accessible job-training workshops with audio descriptions.",
  },
  {
    id: "elena",
    name: "Elena",
    role: "Autistic Parent, Neurodivergent Household",
    avatar: "‍",
    accessibilityNeeds: ["Sensory-friendly", "Quiet space", "Plain language", "Flexible hours"],
    story: "Navigates job postings for her and her ADHD son, filtering for sensory-safe workplaces.",
  },
  {
    id: "david",
    name: "David",
    role: "Low-Income Veteran & Senior",
    avatar: "‍",
    accessibilityNeeds: ["Limited mobility", "Low-noise routes", "No ID required", "Rest breaks"],
    story: "Plans quiet, step-free transit to his VA clinic appointments without crowds or loud announcements.",
  },
  {
    id: "aisha",
    name: "Aisha",
    role: "Deaf Traveler & Community Organizer",
    avatar: "‍",
    accessibilityNeeds: ["ASL interpreter", "Visual alerts", "Text-only communication", "Service animal"],
    story: "Builds offline emergency cards with interpreter contacts for travel to unfamiliar cities.",
  },
  {
    id: "community",
    name: "Community Auditors",
    role: "Volunteer Access Checkers",
    avatar: "",
    accessibilityNeeds: ["Real-time verification", "Confidence scoring", "Accessibility expertise"],
    story: "Jordan, Sam, and Lia physically check ramps, elevators, and interpreter schedules at local services.",
  },
];

/** Rich-media still for each chapter, keyed by chapter id. */
export const DEMO_IMAGES: Record<string, string> = {
  problem:
    "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/3b9fc387-9989-4783-8783-0877d59dec36/problem-8cb84576-1793426108228.webp",
  discovery:
    "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/3b9fc387-9989-4783-8783-0877d59dec36/discovery-971cf8ab-1793426108541.webp",
  scanner:
    "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/3b9fc387-9989-4783-8783-0877d59dec36/scanner-7fac8598-1793426107556.webp",
  transit:
    "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/3b9fc387-9989-4783-8783-0877d59dec36/transit-9d756939-1793426107969.webp",
  emergency:
    "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/3b9fc387-9989-4783-8783-0877d59dec36/emergency-fc81ebfd-1793426107390.webp",
  ledger:
    "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/3b9fc387-9989-4783-8783-0877d59dec36/ledger-2734c5b1-1793426110955.webp",
};

/** Speak text in a given language, picking a matching installed voice when available. */
export function speakMultilingual(text: string, lang: string, rate = 0.92): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const base = lang.split("-")[0].toLowerCase();
    const match =
      voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(base));
    if (match) utterance.voice = match;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export interface TranscriptLine {
  id: string;
  at: number;
  time: string;
  speaker: string;
  text: string;
}

export const DEMO_TRANSCRIPT: TranscriptLine[] = [
  { id: "t1", at: 0, time: "0:00", speaker: "Maya", text: "I need groceries before school pickup, but the pantry has stairs and no one lists if the restroom fits my chair." },
  { id: "t2", at: 6, time: "0:06", speaker: "Narrator", text: "Forty-three percent of people skip a service because of access barriers like Maya's." },
  { id: "t3", at: 12, time: "0:12", speaker: "Marcus", text: "My screen reader announces every listing in plain language. I filter by audio guidance and no ID required." },
  { id: "t4", at: 18, time: "0:18", speaker: "Marcus", text: "I found a job-training workshop with a tactile floor map. No visual-only information anywhere." },
  { id: "t5", at: 24, time: "0:24", speaker: "Elena", text: "This job posting says I must stand for eight hours in a loud office. Let me scan it." },
  { id: "t6", at: 30, time: "0:30", speaker: "Elena", text: "The scanner flags the sensory barriers and suggests I can request a seated position and quiet station." },
  { id: "t7", at: 36, time: "0:36", speaker: "David", text: "I need to get to the VA clinic without the crowded bus. The transit planner shows me a quiet window." },
  { id: "t8", at: 42, time: "0:42", speaker: "David", text: "Step-free route, low crowd, and I can print the sensory checkpoints to fold in my pocket." },
  { id: "t9", at: 48, time: "0:48", speaker: "Aisha", text: "I am traveling to a city where I know no one. My emergency card has my interpreter contacts and crisis lines." },
  { id: "t10", at: 54, time: "0:54", speaker: "Aisha", text: "It works offline. No signal needed. I keep it in my purse next to my ASL directory." },
  { id: "t11", at: 60, time: "1:00", speaker: "Jordan", text: "I checked the ramp at the clinic this morning. Working, confidence 96 percent. Stamped and verified." },
  { id: "t12", at: 66, time: "1:06", speaker: "Narrator", text: "The whole platform meets WCAG AAA contrast, and no account is ever required." },
];

export const DEMO_ARTIFACTS = [
  { id: "repo", label: "Code Repository", detail: "React, TypeScript, Framer Motion, zero backend", href: "https://github.com" },
  { id: "deck", label: "Project Pitch Deck", detail: "Problem, impact model and roadmap", href: "https://github.com" },
  { id: "checklist", label: "Submission Checklist", detail: "Hackathon judging criteria covered", href: "https://github.com" },
];

/* ============================================================
   Document Scanner — sample documents and plain-language output
   ============================================================ */
export interface BarrierWarning {
  kind: "sensory" | "physical" | "cognitive" | "cost";
  label: string;
  note: string;
}

export interface SampleDocument {
  id: string;
  label: string;
  raw: string;
  plain: string;
  eligibility: { text: string; met: "yes" | "no" | "check" }[];
  barriers: BarrierWarning[];
  matches: { title: string; reason: string }[];
}

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: "medicaid",
    label: "Complex Medicaid Flyer",
    raw:
      "Pursuant to 42 CFR Part 435, applicants must furnish documentary evidence of categorical eligibility and attest under penalty of perjury that household income does not exceed 138% of the Federal Poverty Level. Failure to remediate deficiencies within thirty (30) calendar days shall result in procedural termination of benefits notwithstanding good cause.",
    plain:
      "You can get free health coverage if your household earns less than about $2,000 a month for one person. Bring proof of your income. If anything is missing, you have 30 days to fix it. If you do not, your coverage can end, but you can always re-apply.",
    eligibility: [
      { text: "Household income under 138% of poverty line", met: "check" },
      { text: "Photo ID is NOT required to apply", met: "yes" },
      { text: "Proof of income (pay stub or letter)", met: "check" },
      { text: "30 days to add missing paperwork", met: "yes" },
    ],
    barriers: [
      { kind: "physical", label: "In-person office visit", note: "Some offices are not step-free. Call ahead to ask for a curb-side or home visit." },
      { kind: "sensory", label: "Busy waiting room", note: "Peak hours are crowded and loud. Ask for a quiet appointment early morning." },
      { kind: "cognitive", label: "Dense legal wording", note: "The form uses college-level language. Bring this plain summary with you." },
    ],
    matches: [
      { title: "Community Health Navigation Clinic", reason: "No-cost enrollment help with a plain-language worker" },
      { title: "Legal Aid Benefits Desk", reason: "Free help fixing 30-day deficiency notices" },
    ],
  },
  {
    id: "job",
    label: "Restrictive Job Posting",
    raw:
      "Candidates must possess a minimum of five years of relevant experience, a four-year degree, and the ability to lift 50 pounds unassisted and stand for extended periods during a fast-paced, open-plan shift. Successful applicants will be subject to a mandatory pre-employment background screening and drug panel.",
    plain:
      "This job asks for a lot: five years of experience, a degree, lifting 50 pounds, standing a long time, and a loud open office. Many of these rules can be changed if you ask for an accommodation. It is okay to apply and request help.",
    eligibility: [
      { text: "Lifting 50 pounds can be an accommodation request", met: "check" },
      { text: "Standing requirements can often be adjusted", met: "check" },
      { text: "Degree may be waived with equivalent experience", met: "check" },
      { text: "Background screening required", met: "no" },
    ],
    barriers: [
      { kind: "physical", label: "Lift and standing demands", note: "Ask whether the role can be done seated or with assistive equipment." },
      { kind: "sensory", label: "Fast-paced open plan", note: "Open offices are noisy. Ask about a quieter station or remote option." },
      { kind: "cognitive", label: "Rigid experience gate", note: "Apply anyway and note transferable skills in plain language." },
    ],
    matches: [
      { title: "Inclusive Hiring Cooperative", reason: "No-resume, seated-friendly gig placements" },
      { title: "Workplace Accommodation Advocates", reason: "Free help requesting lifting and sensory changes" },
    ],
  },
  {
    id: "utility",
    label: "Utility Assistance Form",
    raw:
      "To qualify for the Low Income Home Energy Assistance Program, the applicant shall submit a current utility bill, proof of residency, and a signed authorization permitting third-party verification of financial assets. Delinquent accounts require a payment plan agreement executed prior to disbursement of credit.",
    plain:
      "This program helps pay your electric or gas bill if money is tight. Bring your latest bill and proof you live here. You sign a form letting them check your account. If your bill is overdue, you may need a small payment plan first, but you still qualify for help.",
    eligibility: [
      { text: "Current utility bill", met: "check" },
      { text: "Proof of address (not necessarily ID)", met: "check" },
      { text: "Overdue bill needs a simple payment plan", met: "yes" },
      { text: "No income tax return required", met: "yes" },
    ],
    barriers: [
      { kind: "cost", label: "Payment plan up front", note: "You can ask for the plan to be interest-free due to hardship." },
      { kind: "cognitive", label: "Third-party authorization", note: "Ask a coordinator to read the authorization aloud before signing." },
    ],
    matches: [
      { title: "Energy Hardship Helpline", reason: "Same-week bill help, no ID required" },
      { title: "Neighborhood Resource Center", reason: "Quiet desk with staff who fill forms with you" },
    ],
  },
];

export const BARRIER_KIND_LABEL: Record<BarrierWarning["kind"], string> = {
  sensory: "Sensory",
  physical: "Physical",
  cognitive: "Reading level",
  cost: "Cost",
};

/* ============================================================
   Transit Planner — sensory-aware step-free routes
   ============================================================ */
export type RampStatus = "open" | "caution" | "closed";

export interface TransitStep {
  instruction: string;
  checkpoint: string;
  sensory: string;
}

export interface TransitRoute {
  id: string;
  name: string;
  destination: string;
  duration: string;
  stepFree: boolean;
  ramp: RampStatus;
  steps: number;
  crowd: NoiseLevel;
  quietWindow: string;
  notes: string;
  legs: TransitStep[];
}

export const RAMP_META: Record<RampStatus, { label: string; tone: "good" | "warn" | "bad" }> = {
  open: { label: "Ramp working", tone: "good" },
  caution: { label: "Ramp needs assistance", tone: "warn" },
  closed: { label: "Ramp out of service", tone: "bad" },
};

export const TRANSIT_ROUTES: TransitRoute[] = [
  {
    id: "r12",
    name: "Bus 12 — Step-Free",
    destination: "Community Health Navigation Clinic",
    duration: "18 min",
    stepFree: true,
    ramp: "open",
    steps: 0,
    crowd: "Low",
    quietWindow: "9:00 AM – 11:00 AM",
    notes: "Low-floor bus with a deployed ramp at every stop.",
    legs: [
      { instruction: "Board at the front door and tell the driver you need the ramp.", checkpoint: "Front door", sensory: "Driver announces each stop, no sudden chimes." },
      { instruction: "Ride 6 stops. Sit near the middle to reduce sway.", checkpoint: "Stop 4 – Maple Ave", sensory: "Quietest stretch of the route, windows tinted." },
      { instruction: "Pull the ramp request cord one stop early.", checkpoint: "Stop 6 – Health Center", sensory: "Cord is within reach of seated position." },
      { instruction: "Ramp deploys at curb; roll straight to the step-free entrance.", checkpoint: "Clinic plaza", sensory: "Plaza is level, soft evening light, low foot traffic." },
    ],
  },
  {
    id: "rl",
    name: "Light Rail — Line L",
    destination: "Inclusive Hiring Cooperative",
    duration: "24 min",
    stepFree: true,
    ramp: "caution",
    steps: 2,
    crowd: "Medium",
    quietWindow: "1:00 PM – 3:00 PM",
    notes: "Gap at the platform edge; staff can bring a portable ramp on request.",
    legs: [
      { instruction: "Enter through the gate with the wide accessible lane.", checkpoint: "Station gate", sensory: "Gate beep is short and quiet." },
      { instruction: "Wait at the marked ramp zone and flag an attendant.", checkpoint: "North platform", sensory: "Platform is open-air, wind noise possible." },
      { instruction: "Board car 2, the quietest car, and face forward.", checkpoint: "Car 2", sensory: "Car 2 has no overhead announcements on weekends." },
      { instruction: "Exit at Cooperative Way; use the elevator, not the 2 stairs.", checkpoint: "Cooperative Way", sensory: "Elevator lobby is calm and well-lit." },
    ],
  },
  {
    id: "rp",
    name: "Paratransit Door-to-Door",
    destination: "Neighborhood Resource Center",
    duration: "35 min",
    stepFree: true,
    ramp: "open",
    steps: 0,
    crowd: "Low",
    quietWindow: "Any time, book 2 hrs ahead",
    notes: "Curbside van with lift; no transfers and no waiting rooms.",
    legs: [
      { instruction: "Call dispatch two hours ahead and note your sensory needs.", checkpoint: "Phone booking", sensory: "You can request no music and a quiet driver." },
      { instruction: "Van lifts you curbside; stay seated in your own chair.", checkpoint: "Home curb", sensory: "Lift is slow and steady, no jolt." },
      { instruction: "Direct ride, no stops, straight to the accessible entrance.", checkpoint: "Resource Center", sensory: "Single occupant cabin, dimmable light." },
    ],
  },
];

/* ============================================================
   Community Auditor — live crowd-sourced access check-ins
   ============================================================ */
export type AuditAspect = "ramp" | "elevator" | "noise" | "asl" | "restroom" | "entry";
export type AuditStatus = "working" | "partial" | "blocked";

export interface AuditCheckIn {
  id: string;
  location: string;
  aspect: AuditAspect;
  status: AuditStatus;
  note: string;
  reporter: string;
  confidence: number;
  ago: string;
  verified: boolean;
}

export const AUDIT_ASPECT_LABEL: Record<AuditAspect, string> = {
  ramp: "Wheelchair ramp",
  elevator: "Elevator / lift",
  noise: "Sensory noise level",
  asl: "ASL interpreter",
  restroom: "Accessible restroom",
  entry: "Step-free entry",
};

export const AUDIT_STATUS_META: Record<AuditStatus, { label: string; tone: "good" | "warn" | "bad" }> = {
  working: { label: "Working", tone: "good" },
  partial: { label: "Partial", tone: "warn" },
  blocked: { label: "Blocked", tone: "bad" },
};

export const SEED_AUDITS: AuditCheckIn[] = [
  { id: "a1", location: "Community Health Navigation Clinic", aspect: "entry", status: "working", note: "Automatic door unlocked all day, no step.", reporter: "coordinator_maya", confidence: 96, ago: "2 hrs ago", verified: true },
  { id: "a2", location: "Cooperative Way Station", aspect: "elevator", status: "partial", note: "Elevator works but call button is high; ask staff for help.", reporter: "jordan.t", confidence: 78, ago: "5 hrs ago", verified: true },
  { id: "a3", location: "Downtown Job Fair Hall", aspect: "noise", status: "blocked", note: "PA system very loud, no quiet room on this floor.", reporter: "sam_okafor", confidence: 88, ago: "1 day ago", verified: false },
  { id: "a4", location: "Neighborhood Resource Center", aspect: "asl", status: "working", note: "Interpreter on site Tuesdays and Thursdays, 10-2.", reporter: "lia.w", confidence: 92, ago: "3 hrs ago", verified: true },
  { id: "a5", location: "Eastside Pantry", aspect: "restroom", status: "partial", note: "Grab bars installed, door width is tight for power chairs.", reporter: "coordinator_ren", confidence: 71, ago: "6 hrs ago", verified: false },
];

/* ============================================================
   Match Wizard — 3-question accommodation fit
   ============================================================ */
export interface WizardAnswers {
  mobility: MobilityNeed;
  sensory: "calm" | "any" | "outdoor";
  documents: "none" | "simple" | "assisted";
}

export const WIZARD_SENSORY_OPTIONS: { id: WizardAnswers["sensory"]; label: string; hint: string }[] = [
  { id: "calm", label: "Quiet and low-stimulus", hint: "Soft light, few people, no sudden noise." },
  { id: "any", label: "No sensory preference", hint: "I am comfortable in most settings." },
  { id: "outdoor", label: "Open and airy", hint: "I prefer outdoor or large open spaces." },
];

export const WIZARD_DOC_OPTIONS: { id: WizardAnswers["documents"]; label: string; hint: string }[] = [
  { id: "none", label: "No ID or paperwork", hint: "I want places that ask for nothing." },
  { id: "simple", label: "Simple form I can fill", hint: "A short form is okay if it is plain." },
  { id: "assisted", label: "Someone helps me apply", hint: "I want staff to fill forms with me." },
];