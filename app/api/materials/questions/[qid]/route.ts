import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { notifyHRNewDoubt } from '@/lib/automation/doubt-email'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ qid: string }> }) {
  const { qid } = await params
  let body: { resolved?: boolean; escalated?: boolean; hrAnswer?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (body.resolved !== undefined) update.resolved = body.resolved
  if (body.escalated !== undefined) update.escalated = body.escalated
  if (body.hrAnswer !== undefined) {
    update.hr_answer = body.hrAnswer
    update.hr_answered_at = new Date().toISOString()
    update.resolved = true
  }

  const { data, error } = await supabase
    .from('material_questions')
    .update(update)
    .eq('id', qid)
    .select('*, materials(title)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // The employee clicked "Still need help" on an AI answer — this is the
  // second path into HR's queue (the first is a brand-new question the AI
  // couldn't handle at all, handled in the [id]/questions POST route).
  if (body.escalated === true) {
    notifyHRNewDoubt({
      employeeEmail: data.employee_email,
      employeeName: data.employee_name,
      materialTitle: data.materials?.title ?? 'a material',
      question: data.question,
      aiAttempted: Boolean(data.ai_answer),
    }).catch(e => console.error('[Doubt Email] Failed to notify HR:', e instanceof Error ? e.message : String(e)))
  }

  return NextResponse.json({ question: data })
}
