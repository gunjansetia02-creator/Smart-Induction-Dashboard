const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_MODEL = 'claude-sonnet-5'

export function aiConfigured(): boolean {
  return Boolean(ANTHROPIC_API_KEY)
}

export async function answerMaterialQuestion(opts: {
  materialTitle: string
  materialDescription: string
  materialType: 'video' | 'pdf'
  question: string
}): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  const system = `You are the induction assistant for new employees at Koenig Solutions. An employee is going through their onboarding material and asked a question about it. Answer helpfully and concisely (2-4 sentences) using only the material's title and description as context. If the material's description doesn't contain enough information to answer confidently, say so plainly and suggest they escalate the question to HR — do not make up specifics you don't know.`

  const userMessage = `Material: "${opts.materialTitle}" (${opts.materialType})
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
