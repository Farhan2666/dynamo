export function extractJsonFromResponse(text: string): string {
  const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) return codeMatch[1].trim();
  let first = text.indexOf("{");
  const bracket = text.indexOf("[");
  if (bracket !== -1 && (first === -1 || bracket < first)) first = bracket;
  if (first === -1) return text.trim();
  const openChar = text[first];
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0, end = -1;
  for (let i = first; i < text.length; i++) {
    if (text[i] === openChar) depth++;
    if (text[i] === closeChar) { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end !== -1) return text.slice(first, end).trim();
  return text.trim();
}
