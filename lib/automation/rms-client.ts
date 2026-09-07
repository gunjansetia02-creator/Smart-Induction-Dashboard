// RMS (Resource Management System) integration — same underlying Koenig
// "Kites/Operator" API family as pms-client.ts (same base URL, same
// GetToken flow), but a separate, least-privilege credential scoped
// specifically to "Create one on one feedback", provided directly by HR.

const RMS_BASE     = 'https://api.koenig-solutions.com'
const RMS_API_KEY  = process.env.RMS_API_KEY
const RMS_USERNAME = process.env.RMS_USERNAME
const RMS_PASSWORD = process.env.RMS_PASSWORD
const RMS_ROLE     = process.env.RMS_ROLE

function requireCredentials() {
  if (!RMS_API_KEY || !RMS_USERNAME || !RMS_PASSWORD || !RMS_ROLE) {
    throw new Error('RMS credentials missing: set RMS_API_KEY, RMS_USERNAME, RMS_PASSWORD, RMS_ROLE in your environment.')
  }
}

interface RMSTokenContent {
  accessToken: string
  deviceToken: string
  Username: string
  Role: string
}

export async function getRMSToken(): Promise<RMSTokenContent> {
  requireCredentials()

  const maxRetries = 3
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${RMS_BASE}/api/Kites/Operator/GetToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Koenig-Induction-Dashboard/1.0' },
        body: JSON.stringify({
          userName:     RMS_USERNAME,
          userPassword: RMS_PASSWORD,
          userRole:     RMS_ROLE,
        }),
      })

      if (!res.ok) {
        console.warn(`[RMS] Token request failed (attempt ${attempt}/${maxRetries}): HTTP ${res.status}`)
        if (attempt < maxRetries) { await new Promise(r => setTimeout(r, 1000 * attempt)); continue }
        throw new Error(`RMS token request failed: ${res.status}`)
      }

      const data = await res.json()
      if (data.statuscode !== 200) {
        console.warn(`[RMS] Token error (attempt ${attempt}/${maxRetries}): ${data.message}`)
        if (attempt < maxRetries) { await new Promise(r => setTimeout(r, 1000 * attempt)); continue }
        throw new Error(`RMS token error: ${data.message}`)
      }

      return data.content as RMSTokenContent
    } catch (error) {
      if (attempt === maxRetries) throw error
      console.warn(`[RMS] Retry attempt ${attempt + 1}/${maxRetries}`)
    }
  }

  throw new Error('RMS token failed after all retries')
}

export interface CreateOneOnOneFeedbackResult {
  ok: boolean
  rawResponse: string
}

// Confidential's exact expected wire format wasn't specified by the API doc
// HR was given (it's a checkbox in the RMS UI, not documented at the API
// level) — this is a best guess (lowercase boolean string), logged verbatim
// in rms_feedback_log for every submission so it's a one-line fix if wrong.
const CONFIDENTIAL_TRUE_VALUE = 'true'

export async function createOneOnOneFeedback(opts: {
  empId: string
  mngrId: string
  answerStrength: string
}): Promise<CreateOneOnOneFeedbackResult> {
  const { accessToken, deviceToken } = await getRMSToken()

  const url = `${RMS_BASE}/api/Kites/Operator/common?apikey=${RMS_API_KEY}&accessToken=${encodeURIComponent(accessToken)}&deviceToken=${encodeURIComponent(deviceToken)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Empid:          opts.empId,
      Mngrid:         opts.mngrId,
      AnswerStrength: opts.answerStrength,
      Confidential:   CONFIDENTIAL_TRUE_VALUE,
    }),
  })

  const text = await res.text()
  if (!res.ok) throw new Error(`RMS feedback submission failed: HTTP ${res.status} — ${text}`)

  let data: { statuscode?: number; message?: string }
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`RMS feedback submission returned non-JSON response: ${text}`)
  }

  if (data.statuscode !== 200) {
    throw new Error(`RMS feedback error: ${data.message ?? 'unknown error'} — ${text}`)
  }

  return { ok: true, rawResponse: text }
}
