import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Supabase not configured: set SUPABASE_URL and SUPABASE_ANON_KEY in your environment.')
}

// Server-only client. Never import this from a 'use client' component —
// the key is read from process.env and must not reach the browser bundle.
export const supabase = createClient(url, key)

export interface MaterialRow {
  id: string
  title: string
  description: string
  type: 'video' | 'pdf'
  url: string
  duration: string | null
  day: number | null
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
  resolved: boolean
  escalated: boolean
  created_at: string
}
