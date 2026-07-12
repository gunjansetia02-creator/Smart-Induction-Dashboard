import { supabase } from '@/lib/supabase'

export interface JoinerStatusEntry {
  materialsTotal: number
  materialsComplete: number
  materialsPercent: number
  openDoubts: number
  totalDoubts: number
  welcomeEmailSent: boolean
  meetingInviteSent: boolean
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

  const [{ count: materialsTotal }, { data: progress }, { data: questions }, { data: comms }] = await Promise.all([
    supabase.from('materials').select('id', { count: 'exact', head: true }),
    supabase.from('material_progress').select('employee_email, status').in('employee_email', clean),
    supabase.from('material_questions').select('employee_email, resolved').in('employee_email', clean),
    supabase.from('joiner_communications').select('*').in('employee_email', clean),
  ])

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
      inductionComplete: total > 0 && materialsComplete === total && openDoubts === 0,
    }
  }

  return statuses
}
