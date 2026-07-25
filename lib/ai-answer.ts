const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_MODEL = 'claude-sonnet-5'

export function aiConfigured(): boolean {
  return Boolean(ANTHROPIC_API_KEY)
}

// Capped well under the model's context window — this is per-question, so it
// stays cheap and fast even for the longer documents (e.g. Kites-G).
const MAX_CONTENT_CHARS = 12000

export async function answerMaterialQuestion(opts: {
  materialTitle: string
  materialDescription: string
  materialType: 'video' | 'pdf'
  materialContent?: string | null
  question: string
  // HR-verified Q&A pairs already confirmed correct (or corrected) for this
  // material — take precedence over generating a fresh answer, so a mistake
  // HR has already fixed once doesn't get repeated for the next joiner.
  verifiedAnswers?: { question: string; answer: string }[]
}): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  const hasFullContent = Boolean(opts.materialContent && opts.materialContent.trim())
  const hasVerified = Boolean(opts.verifiedAnswers && opts.verifiedAnswers.length > 0)

  const verifiedBlock = hasVerified
    ? `\n\nHR has already verified the correct answers to these previously-asked questions about this material. If the employee's new question is asking essentially the same thing (even if worded differently), use the verified answer — do not contradict it or make up a different answer:\n${opts
        .verifiedAnswers!.map((v, i) => `${i + 1}. Q: ${v.question}\n   A: ${v.answer}`)
        .join('\n')}`
    : ''

  const system = hasFullContent
    ? `You are the induction assistant for new employees at Koenig Solutions. An employee asked a question about one of their induction materials. Answer helpfully and concisely (2-4 sentences) using ONLY the full document content provided below — it is the actual text of the material. If the answer genuinely isn't in the document, say so plainly and suggest they escalate the question to HR — do not make up specifics that aren't there.${verifiedBlock}`
    : `You are the induction assistant for new employees at Koenig Solutions. An employee is going through their onboarding material and asked a question about it. Answer helpfully and concisely (2-4 sentences) using only the material's title and description as context. If the material's description doesn't contain enough information to answer confidently, say so plainly and suggest they escalate the question to HR — do not make up specifics you don't know.${verifiedBlock}`

  const userMessage = hasFullContent
    ? `Material: "${opts.materialTitle}" (${opts.materialType})

Full document content:
"""
${opts.materialContent!.slice(0, MAX_CONTENT_CHARS)}
"""

Employee question: ${opts.question}`
    : `Material: "${opts.materialTitle}" (${opts.materialType})
Description: ${opts.materialDescription || '(no description provided)'}

Employee question: ${opts.question}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 400,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error: ${res.status} ${err}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text
  if (!text) throw new Error('Anthropic API returned no answer text')
  return text as string
}
