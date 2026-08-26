// Answers straightforward "what is X" questions directly from a material's
// own document text — no AI call needed. Several of our source documents
// (Kites-G especially) contain a structured "TERM : Definition." glossary,
// so a question like "what is PIR?" can be answered deterministically by
// finding "PIR" in the text rather than waiting on a live LLM (which also
// means this keeps working even when ANTHROPIC_API_KEY isn't configured).
const GLOSSARY_ENTRY = /\b([A-Z][A-Za-z0-9']{1,9})\s*:\s*([^.\n]+\.)/g

export function extractGlossaryTerms(contentText: string): Map<string, string> {
  const terms = new Map<string, string>()
  for (const match of contentText.matchAll(GLOSSARY_ENTRY)) {
    const term = match[1].trim()
    const definition = match[2].trim()
    // Keep the first definition seen for a term — glossaries don't repeat
    // themselves, and if a term happens to appear twice the first mention is
    // almost always the canonical one.
    if (!terms.has(term.toUpperCase())) terms.set(term.toUpperCase(), `${term}: ${definition}`)
  }
  return terms
}

export function lookupGlossaryAnswer(question: string, contentText: string | null | undefined): string | null {
  if (!contentText) return null
  const terms = extractGlossaryTerms(contentText)
  if (terms.size === 0) return null

  // Longer tokens first — if a question mentions both "PIR" and a shorter
  // incidental match, prefer the more specific one.
  const tokens = (question.match(/[A-Za-z][A-Za-z0-9']*/g) ?? [])
    .filter(t => t.length >= 2)
    .sort((a, b) => b.length - a.length)

  for (const token of tokens) {
    const hit = terms.get(token.toUpperCase())
    if (hit) return hit
  }
  return null
}
