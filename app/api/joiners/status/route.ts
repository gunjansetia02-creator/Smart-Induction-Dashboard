import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(req: NextRequest) {
  let body: { emails?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const emails = (body.emails ?? []).filter(Boolean)
  if (emails.length === 0) return NextResponse.json({ statuses: {} })

  const [{ count: materialsTotal }, { data: progress }, { data: questions }, { data: comms }] = await Promise.all([
    supabase.from('materials').select('id', { count: 'exact', head: true }),
    supabase.from('material_progress').select('employee_email, status').in('employee_email', emails),
    supabase.from('material_questions').select('employee_email, resolved').in('employee_email', emails),
    supabase.from('joiner_communications').select('*').in('employee_email', emails),
  ])

  const total = materialsTotal ?? 0
  const statuses: Record<string, JoinerStatusEntry> = {}

  for (const email of emails) {
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

  return NextResponse.json({ statuses })
}
