import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

// Lazy on purpose: Next.js evaluates route modules at build time to collect
// page data, so throwing here at import time (rather than on first real use)
// would break the production build whenever these env vars aren't set yet.
function getClient(): SupabaseClient {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase not configured: set SUPABASE_URL and SUPABASE_ANON_KEY in your environment.')
  }
  client = createClient(url, key)
  return client
}

// Server-only client. Never import this from a 'use client' component —
// the key is read from process.env and must not reach the browser bundle.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getClient()[prop as keyof SupabaseClient]
  },
})

export interface MaterialRow {
  id: string
  title: string
  description: string
  type: 'video' | 'pdf'
  url: string
  duration: string | null
  day: number | null
  // Materials sharing the same (day, subject) are shown clubbed together under
  // one heading in the employee view, e.g. "Onboarding" grouping a PPT + video.
  subject: string | null
  sort_order: number | null
  // Full extracted document text, used to ground the AI's answers instead of
  // just the short description — set manually per material as HR provides it.
  content_text: string | null
  // When set, only employees whose PMS Department matches (case-insensitive)
  // see this material at all, and it's excluded from everyone else's
  // completion total — e.g. a Sales-only sales-enablement deck.
  required_department: string | null
  created_at: string
}

export interface MaterialProgressRow {
  id: string
  material_id: string
  employee_email: string
  employee_name: string | null
  status: 'not-started' | 'in-progress' | 'complete' | 'has-doubt'
  watched_percent: number
  updated_at: string
}

export interface MaterialQuestionRow {
  id: string
  material_id: string
  employee_email: string
  employee_name: string | null
  question: string
  ai_answer: string | null
  hr_answer: string | null
  hr_answered_at: string | null
  resolved: boolean
  escalated: boolean
  // HR reviewed the AI's answer and confirmed it was correct as-is (distinct
  // from hr_answer, which means HR replaced/corrected it).
  ai_confirmed: boolean
  created_at: string
}

// HR-verified Q&A pairs, fed back into future AI answers for the same
// material so a mistake — once corrected — doesn't get made twice.
export interface VerifiedAnswerRow {
  id: string
  material_id: string
  question: string
  answer: string
  source: 'ai_confirmed' | 'hr_corrected'
  source_question_id: string | null
  created_at: string
}

// Private HR-only notes about a joiner's induction progress — never shown to
// the employee.
export interface JoinerFeedbackRow {
  id: string
  employee_email: string
  employee_name: string | null
  feedback_text: string
  created_at: string
}

// The joiner's own feedback on the induction process itself, submitted once
// they've completed it — the reverse direction of JoinerFeedbackRow.
export interface InductionFeedbackRow {
  id: string
  employee_email: string
  employee_name: string | null
  rating: number | null
  feedback_text: string
  created_at: string
}
