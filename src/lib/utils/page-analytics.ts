/**
 * Page Analytics Utility
 * Reading time, word count, headline scoring, A/B testing
 */

export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function estimateReadingTime(text: string, wpm = 200): number {
  const words = countWords(text);
  return Math.max(1, Math.ceil(words / wpm));
}

export function countAllSectionWords(sections: Array<{ content: Record<string, string> }>): number {
  let total = 0;
  for (const section of sections) {
    for (const val of Object.values(section.content)) {
      if (val && typeof val === "string") total += countWords(val);
    }
  }
  return total;
}

export interface HeadlineScore {
  text: string;
  score: number;
  reasons: string[];
}

export function scoreHeadline(headline: string): HeadlineScore {
  if (!headline) return { text: "", score: 0, reasons: ["Empty headline"] };
  const reasons: string[] = [];
  let score = 0;
  const len = headline.length;
  const words = headline.split(/\s+/);

  // Length scoring (ideal: 6-12 words, 30-70 chars)
  if (len >= 30 && len <= 70) { score += 25; reasons.push("Ideal length"); }
  else if (len >= 15 && len <= 100) { score += 15; reasons.push("Acceptable length"); }
  else { score += 5; reasons.push(len < 15 ? "Too short" : "Too long"); }

  // Word count scoring
  if (words.length >= 6 && words.length <= 12) { score += 20; reasons.push("Good word count"); }
  else if (words.length >= 3 && words.length <= 18) { score += 10; }

  // Contains power words
  const powerWords = ["free", "new", "instantly", "guaranteed", "proven", "exclusive", "limited", "secret", "discover", "transform", "unlock", "master", "effortless", "powerful", "ultimate", "revolutionary", "breakthrough"];
  const idPowerWords = ["gratis", "baru", "langsung", "terbukti", "eksklusif", "terbatas", "rahasia", "temukan", "ubah", "buka", "kuasai", "mudah", "powerful", "terbaik", "hebat"];
  const allPower = [...powerWords, ...idPowerWords];
  const hasPower = allPower.some((w) => headline.toLowerCase().includes(w));
  if (hasPower) { score += 20; reasons.push("Power word detected"); }

  // Contains number
  if (/\d/.test(headline)) { score += 15; reasons.push("Contains number"); }

  // Emotional trigger (questions, exclamation)
  if (headline.includes("?")) { score += 10; reasons.push("Question engages curiosity"); }
  if (headline.includes("!")) { score += 5; reasons.push("Exclamation adds energy"); }

  // Specificity (contains specific details)
  if (/\d+%|\d+x|\$\d+|Rp\d+/i.test(headline)) { score += 15; reasons.push("Specific metric/value"); }

  // Avoid generic AI phrases
  const genericPhrases = ["cutting-edge", "next-gen", "state-of-the-art", "game-changer", "revolutionary", "innovative solution"];
  const isGeneric = genericPhrases.some((p) => headline.toLowerCase().includes(p));
  if (isGeneric) { score -= 20; reasons.push("Generic AI buzzword"); }

  return { text: headline, score: Math.max(0, Math.min(100, score)), reasons };
}

export function generateHeadlineVariants(base: string): string[] {
  if (!base) return [];
  const variants: string[] = [base];
  
  // Variant: Add a number
  if (!/\d/.test(base)) {
    variants.push(`3 Ways to ${base.charAt(0).toLowerCase() + base.slice(1)}`);
  }
  
  // Variant: Question format
  if (!base.includes("?")) {
    const q = `What if You Could ${base.charAt(0).toLowerCase() + base.slice(1)}?`;
    variants.push(q);
  }
  
  // Variant: Add power word
  if (!base.toLowerCase().includes("free") && !base.toLowerCase().includes("gratis")) {
    variants.push(`${base} — Try Free Today`);
  }

  return variants.slice(0, 4);
}
