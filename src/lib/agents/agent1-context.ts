"use client";

import type { ContextProfile, SectionType } from "@/types";
import { detectLanguage } from "@/lib/utils/language";

const INDUSTRY_NICHES: Record<string, { tags: string[]; mood: string; audience: string }> = {
  fintech: {
    tags: ["fintech", "finance", "banking", "invest", "payment", "money", "crypto", "blockchain", "wallet", "lending", "insurance", "wealth", "stock", "trading", "keuangan", "bank", "investasi", "uang", "kripto"],
    mood: "trust",
    audience: "financial professionals and modern investors",
  },
  saas: {
    tags: ["saas", "b2b", "enterprise", "software", "cloud", "platform", "workflow", "automation", "productivity", "tool", "dashboard", "analytics", "integration", "api", "subscription"],
    mood: "professional",
    audience: "forward-thinking business teams",
  },
  wellness: {
    tags: ["yoga", "meditation", "wellness", "health", "fitness", "mindfulness", "spa", "selfcare", "mental", "breath", "holistic", "kesehatan", "yoga", "meditasi"],
    mood: "calm",
    audience: "wellness seekers and mindful professionals",
  },
  education: {
    tags: ["education", "course", "learn", "teach", "tutorial", "class", "academy", "training", "online course", "elearning", "school", "student", "skill", "knowledge", "pendidikan", "belajar", "kursus", "pelatihan", "sekolah"],
    mood: "growth",
    audience: "lifelong learners and ambitious students",
  },
  ecommerce: {
    tags: ["ecommerce", "shop", "store", "product", "buy", "sell", "marketplace", "retail", "dropship", "wholesale", "fashion", "brand", "merchant", "belanja", "toko", "jual", "produk"],
    mood: "energetic",
    audience: "shoppers and modern consumers",
  },
  creative: {
    tags: ["design", "art", "portfolio", "creative", "branding", "photography", "studio", "illustration", "graphic", "visual", "artist", "desain", "seni", "kreatif", "fotografi"],
    mood: "playful",
    audience: "creative professionals and artists",
  },
  healthtech: {
    tags: ["healthtech", "medical", "patient", "doctor", "clinic", "telehealth", "healthcare", "hospital", "diagnostic", "wellness tech", "fitness tech", "kesehatan", "medis", "dokter", "klinik"],
    mood: "trust",
    audience: "healthcare providers and patients",
  },
  food: {
    tags: ["restaurant", "cafe", "bakery", "food", "catering", "vegan", "cooking", "recipe", "delivery", "kuliner", "makanan", "restoran", "kafe", "masakan"],
    mood: "warm",
    audience: "food lovers and culinary enthusiasts",
  },
  agency: {
    tags: ["agency", "consulting", "service", "freelance", "professional", "studio", "marketing", "growth", "strategy", "consultant", "agency", "konsultan", "jasa", "freelance"],
    mood: "confident",
    audience: "businesses seeking expert partners",
  },
  realestate: {
    tags: ["property", "real estate", "apartment", "rent", "buy", "home", "housing", "mortgage", "investasi properti", "rumah", "apartemen", "sewa", "jual properti"],
    mood: "stable",
    audience: "property seekers and real estate investors",
  },
  nonprofit: {
    tags: ["nonprofit", "charity", "donate", "foundation", "community", "volunteer", "social", "ngo", "yayasan", "donasi", "amal", "sosial", "relawan"],
    mood: "compassionate",
    audience: "donors and community supporters",
  },
  tech: {
    tags: ["tech", "startup", "ai", "artificial intelligence", "machine learning", "data", "developer", "devops", "cloud", "cyber", "security", "app", "mobile", "web", "digital", "teknologi", "aplikasi", "digital"],
    mood: "balanced",
    audience: "tech-savvy innovators and early adopters",
  },
  travel: {
    tags: ["travel", "tourism", "hotel", "vacation", "destination", "trip", "wanderlust", "booking", "hospitality", "wisata", "liburan", "hotel", "perjalanan", "destinasi"],
    mood: "energetic",
    audience: "adventurers and travel enthusiasts",
  },
  saas_b2c: {
    tags: ["productivity app", "lifestyle app", "social", "messaging", "dating", "entertainment", "streaming", "music", "gaming", "consumer app"],
    mood: "playful",
    audience: "everyday consumers",
  },
  gaming: {
    tags: ["gaming", "game", "esports", "streamer", "roblox", "minecraft", "fortnite", "steam", "playstation", "xbox", "nintendo", "indie game", "game store", "rare items", "in-game", "skins", "battle royale", "mmo", "rpg"],
    mood: "playful",
    audience: "gamers and esports enthusiasts",
  },
  crypto_web3: {
    tags: ["web3", "defi", "nft", "blockchain", "ethereum", "solana", "bitcoin", "token", "dao", "metaverse", "decentralized"],
    mood: "confident",
    audience: "crypto-native users and web3 builders",
  },
  luxury_brand: {
    tags: ["luxury", "premium", "high-end", "exclusive", "boutique", "designer", "couture", "artisan", "bespoke", "handcrafted"],
    mood: "confident",
    audience: "discerning luxury consumers",
  },
  fitness: {
    tags: ["gym", "fitness", "workout", "training", "muscle", "personal trainer", "crossfit", "pilates", "exercise", "athlete", "sport"],
    mood: "energetic",
    audience: "fitness enthusiasts and athletes",
  },
  automotive: {
    tags: ["car", "auto", "vehicle", "motor", "truck", "dealership", "garage", "ev", "electric vehicle", "drive"],
    mood: "confident",
    audience: "car enthusiasts and buyers",
  },
  music: {
    tags: ["music", "band", "artist", "album", "song", "concert", "festival", "vinyl", "record", "studio", "producer", "dj", "playlist"],
    mood: "playful",
    audience: "music lovers and artists",
  },
};

const FALLBACK = { tags: ["general", "business"], mood: "balanced", audience: "professionals and entrepreneurs" };

const COLOR_PSYCHOLOGY: Record<string, { primary: string; secondary: string; accent: string; reason: string }> = {
  trust: { primary: "#1E40AF", secondary: "#06B6D4", accent: "#F59E0B", reason: "Deep blue = trust + authority; teal = clarity" },
  professional: { primary: "#0F172A", secondary: "#6366F1", accent: "#8B5CF6", reason: "Dark slate = executive; indigo = innovation" },
  calm: { primary: "#8B9D6E", secondary: "#D4C5A9", accent: "#C17817", reason: "Earthy sage = grounding; warm beige = comfort" },
  growth: { primary: "#059669", secondary: "#10B981", accent: "#F97316", reason: "Emerald = growth; amber = energy" },
  energetic: { primary: "#DC2626", secondary: "#F59E0B", accent: "#84CC16", reason: "Red = urgency; gold = optimism" },
  playful: { primary: "#EC4899", secondary: "#8B5CF6", accent: "#06B6D4", reason: "Pink = creative; purple = imagination; cyan = fun" },
  warm: { primary: "#D97706", secondary: "#F59E0B", accent: "#DC2626", reason: "Amber = warmth; coral = appetite" },
  confident: { primary: "#7C3AED", secondary: "#3B82F6", accent: "#F97316", reason: "Purple = premium; blue = dependable" },
  stable: { primary: "#1E40AF", secondary: "#2563EB", accent: "#059669", reason: "Navy = stability; green = growth" },
  compassionate: { primary: "#BE185D", secondary: "#DB2777", accent: "#F59E0B", reason: "Rose = care; pink = compassion" },
  balanced: { primary: "#6E56CF", secondary: "#00C4B4", accent: "#FF7E33", reason: "Purple = wisdom; teal = clarity; orange = action" },
  creative: { primary: "#EC4899", secondary: "#06B6D4", accent: "#8B5CF6", reason: "Hot pink = bold; cyan = fresh; purple = imaginative" },
  gaming: { primary: "#00FFFF", secondary: "#FF006E", accent: "#39FF14", reason: "Cyan neon = digital; hot pink = energy; green = matrix" },
  crypto: { primary: "#6366F1", secondary: "#00C4B4", accent: "#F59E0B", reason: "Indigo = tech; teal = blockchain; gold = value" },
  luxury: { primary: "#1A1A2E", secondary: "#C9A96E", accent: "#FFFFFF", reason: "Deep navy = exclusivity; gold = premium" },
  food: { primary: "#D97706", secondary: "#DC2626", accent: "#059669", reason: "Amber = appetite; red = passion; green = fresh" },
  medical: { primary: "#0891B2", secondary: "#059669", accent: "#F59E0B", reason: "Teal = clinical; green = health; amber = warmth" },
  kids: { primary: "#F59E0B", secondary: "#EC4899", accent: "#06B6D4", reason: "Yellow = happy; pink = playful; cyan = fun" },
};

const FONT_PAIRS: Record<string, { primary: string; secondary: string; reason: string }> = {
  trust: { primary: "IBM Plex Sans", secondary: "Lexend", reason: "Corporate trust + accessibility" },
  professional: { primary: "Plus Jakarta Sans", secondary: "DM Sans", reason: "Modern professional + clean body" },
  calm: { primary: "Lora", secondary: "Raleway", reason: "Organic serif curves + elegant sans" },
  growth: { primary: "Space Grotesk", secondary: "DM Sans", reason: "Tech-forward heading + readable body" },
  energetic: { primary: "Bebas Neue", secondary: "Source Sans 3", reason: "Bold impact headline + clean body" },
  playful: { primary: "Fredoka", secondary: "Nunito", reason: "Rounded fun + friendly body" },
  warm: { primary: "Playfair Display", secondary: "Karla", reason: "Elegant serif + warm sans" },
  confident: { primary: "Syne", secondary: "Manrope", reason: "Avant-garde heading + modern body" },
  stable: { primary: "Cinzel", secondary: "Josefin Sans", reason: "Luxury serif authority + geometric body" },
  compassionate: { primary: "Cormorant", secondary: "Montserrat", reason: "Refined serif + geometric precision" },
  balanced: { primary: "Outfit", secondary: "Work Sans", reason: "Geometric modern + versatile body" },
  creative: { primary: "Space Grotesk", secondary: "Inter", reason: "Distinctive tech heading + neutral body" },
  gaming: { primary: "Russo One", secondary: "Chakra Petch", reason: "Impact display + techy body" },
  crypto: { primary: "Orbitron", secondary: "Exo 2", reason: "Futuristic display + readable body" },
  luxury: { primary: "Bodoni Moda", secondary: "Jost", reason: "High contrast elegance + geometric body" },
  food: { primary: "Playfair Display SC", secondary: "Karla", reason: "Small caps menu style + warm body" },
  medical: { primary: "Figtree", secondary: "Noto Sans", reason: "Clean accessible + universal fallback" },
  kids: { primary: "Baloo 2", secondary: "Comic Neue", reason: "Fun bubbly + readable comic style" },
};

const LAYOUT_PRIORITIES: Record<string, SectionType[]> = {
  trust: ["hero", "logos", "stats", "testimonials", "features", "cta"],
  professional: ["hero", "features", "comparison", "pricing", "testimonials", "faq", "cta"],
  calm: ["hero", "testimonials", "features", "gallery", "cta"],
  growth: ["hero", "stats", "features", "testimonials", "cta", "faq"],
  energetic: ["hero", "cta", "features", "testimonials", "pricing", "cta"],
  playful: ["hero", "gallery", "features", "testimonials", "cta"],
  warm: ["hero", "features", "testimonials", "cta", "contact"],
  confident: ["hero", "stats", "testimonials", "features", "pricing", "cta"],
  stable: ["hero", "stats", "features", "testimonials", "cta"],
  compassionate: ["hero", "testimonials", "features", "cta", "contact"],
  balanced: ["hero", "features", "testimonials", "pricing", "faq", "cta"],
};

export function analyzeContext(prompt: string): ContextProfile {
  const lower = prompt.toLowerCase();
  const language = detectLanguage(prompt);

  let bestNiche = "general";
  let bestScore = 0;
  const matchedTags: string[] = [];

  for (const [niche, data] of Object.entries(INDUSTRY_NICHES)) {
    let score = 0;
    for (const tag of data.tags) {
      const regex = new RegExp(tag.replace(/\s+/g, "\\s*"), "i");
      if (regex.test(lower)) {
        score += tag.length > 5 ? 2 : 1;
        matchedTags.push(tag);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestNiche = niche;
    }
  }

  const nicheData = INDUSTRY_NICHES[bestNiche] || FALLBACK;
  const mood = nicheData.mood || "balanced";
  const colors = COLOR_PSYCHOLOGY[mood] || COLOR_PSYCHOLOGY.balanced;
  const fonts = FONT_PAIRS[mood] || FONT_PAIRS.balanced;
  const layoutPriority = LAYOUT_PRIORITIES[mood] || LAYOUT_PRIORITIES.balanced;

  const tags = nicheData.tags
    .filter((t) => new RegExp(t.replace(/\s+/g, "\\s*"), "i").test(lower))
    .slice(0, 5);

  const persona = language === "id"
    ? `Pengguna dan profesional di bidang ${bestNiche}`
    : nicheData.audience || `professionals in ${bestNiche}`;

  return {
    niche: bestNiche,
    industryTags: tags.length > 0 ? tags : [bestNiche],
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    accentColor: colors.accent,
    primaryFont: fonts.primary,
    secondaryFont: fonts.secondary,
    layoutPriority,
    audiencePersona: persona,
    moodProfile: mood,
    language,
  };
}
