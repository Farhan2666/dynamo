const ID_PATTERNS = /\b(di|ke|dan|yang|untuk|dengan|dapat|tidak|akan|dari|ini|itu|saya|kamu|kami|mereka|ada|sudah|belum|bisa|akan|telah|lebih|sangat|juga|atau|karena| jika|kalau|tentang|antara|setelah|seperti|oleh|pada|sebagai|bagi|tentang|tanpa|hingga|serta|namun|meski|walaupun|sehingga|maka|yakni|yaitu|bahwa|siapa|mana|kapan|berapa|bagaimana|mengapa|apakah|hal|hal|buat|bikin|butuh|ingin|mau|liat|lihat|tahu|pake|pakai|kasih|beri|tolong|minta|makasih|terima|kasih|iya|nanti|sekarang|udah|gak|ga|enggak|nggak|iya|ya|sih|dong|kok|kah|lah|pun|pernah|lagi|baru|selalu|biasanya|sering|jarang|paling|sekali|banget|terlalu|kurang|agak|cukup|begitu|demikian|dulu|saja|terus|langsung|akhir|awal|mulai|sejak|selama|sambil|biar|supaya|agar|walaupun|meskipun|kecuali|asal|seandainya|anda|beliau|ia|dia|mereka|kami|kalian|para|si|sang|ni|tu|anu)\b/i;

export function detectLanguage(text: string): string {
  const lower = text.trim();
  if (!lower) return "en";

  const idScore = (lower.match(ID_PATTERNS) || []).length;
  const words = lower.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount === 0) return "en";

  const idRatio = idScore / wordCount;
  if (idRatio > 0.15) return "id";
  if (idRatio > 0.08 && wordCount >= 3) return "id";

  const enArticles = (lower.match(/\b(the|a|an|is|are|was|were|been|have|has|had|do|does|did|will|would|can|could|shall|should|may|might|must|this|that|these|those|with|from|what|which|who|whom|when|where|why|how|about|into|through|during|before|after|above|below|between|under|again|further|then|once|here|there|all|each|every|both|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|just|because|as|until|while|of|at|by|for|to|in|out|on|off|over)\b/gi) || []).length;
  const enRatio = enArticles / wordCount;
  if (enRatio > 0.2) return "en";

  return wordCount >= 3 ? "en" : "en";
}
