import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { notifyHRNewDoubt } from '@/lib/automation/doubt-email'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ qid: string }> }) {
  const { qid } = await params
  let body: { resolved?: boolean; escalated?: boolean; hrAnswer?: string; aiConfirmed?: boolean }
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
  if (body.aiConfirmed !== undefined) update.ai_confirmed = body.aiConfirmed

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

  // Both paths feed the verified-answers table, which is what makes future
  // AI answers for this material better: confirming reinforces a good
  // answer, correcting replaces a bad one — either way, the next joiner who
  // asks something similar gets the trusted answer instead of a fresh guess.
  if (body.aiConfirmed === true && data.ai_answer) {
    await supabase.from('verified_answers').insert({
      material_id: data.material_id,
      question: data.question,
      answer: data.ai_answer,
      source: 'ai_confirmed',
      source_question_id: data.id,
    })
  } else if (body.hrAnswer !== undefined) {
    await supabase.from('verified_answers').insert({
      material_id: data.material_id,
      question: data.question,
      answer: body.hrAnswer,
      source: 'hr_corrected',
      source_question_id: data.id,
    })
  }

  return NextResponse.json({ question: data })
}
