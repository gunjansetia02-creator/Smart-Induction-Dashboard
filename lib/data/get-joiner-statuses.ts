import { supabase } from '@/lib/supabase'

export interface JoinerStatusEntry {
  materialsTotal: number
  materialsComplete: number
  materialsPercent: number
  openDoubts: number
  totalDoubts: number
  welcomeEmailSent: boolean
  meetingInviteSent: boolean
  loggedIn: boolean
  inductionComplete: boolean
}

// Real, Supabase-backed induction status per joiner — the single source of truth
// for "how far along is this person," used by both the HR API route and any
// server component that needs it (Overview, Profiles). Never derive this from
// days-since-DOJ; that produces a status disconnected from actual material
// completion and was the source of a "100% complete, 0% materials" bug.
export async function getJoinerStatuses(emails: string[]): Promise<Record<string, JoinerStatusEntry>> {
  const clean = emails.filter(Boolean)
  if (clean.length === 0) return {}

  // Fetch these tables in full rather than filtering with .in('employee_email', clean):
  // with 500+ real joiners, that filter serializes into a URL long enough to fail
  // silently (the client here doesn't check `error`), which was returning empty
  // results for every joiner. These tables only ever hold one row per joiner
  // interaction, so an unfiltered select stays small.
  const [{ count: materialsTotal }, { data: progress, error: progressErr }, { data: questions, error: questionsErr }, { data: comms, error: commsErr }] = await Promise.all([
    supabase.from('materials').select('id', { count: 'exact', head: true }),
    supabase.from('material_progress').select('employee_email, status'),
    supabase.from('material_questions').select('employee_email, resolved'),
    supabase.from('joiner_communications').select('*'),
  ])

  if (progressErr) console.error('[getJoinerStatuses] material_progress error:', progressErr.message)
  if (questionsErr) console.error('[getJoinerStatuses] material_questions error:', questionsErr.message)
  if (commsErr) console.error('[getJoinerStatuses] joiner_communications error:', commsErr.message)

  const total = materialsTotal ?? 0
  const statuses: Record<string, JoinerStatusEntry> = {}

  for (const email of clean) {
    const myProgress = (progress ?? []).filter(p => p.employee_email === email)
    const myQuestions = (questions ?? []).filter(q => q.employee_email === email)
    const myComms = (comms ?? []).find(c => c.employee_email === email)

    const materialsComplete = myProgress.filter(p => p.status === 'complete').length
    const openDoubts = myQuestions.filter(q => !q.resolved).length

    statuses[email] = {
      materialsTotal: total,
      materialsComplete,
      materialsPercent: total > 0 ? Math.round((materialsComplete / total) * 100) : 0,
      openDoubts,
      totalDoubts: myQuestions.length,
      welcomeEmailSent: Boolean(myComms?.welcome_email_sent_at),
      meetingInviteSent: Boolean(myComms?.meeting_invite_sent_at),
      loggedIn: Boolean(myComms?.first_login_at),
      inductionComplete: total > 0 && materialsComplete === total && openDoubts === 0,
    }
  }

  return statuses
}
