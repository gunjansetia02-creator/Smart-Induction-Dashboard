import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { notifyInductionFeedback } from '@/lib/automation/induction-feedback-email'

// One feedback submission per joiner — this is an end-of-induction survey,
// not an ongoing thread, so GET just tells the client whether they've
// already submitted (and what they said) rather than a full history.
export async function GET(req: NextRequest) {
  const employeeEmail = req.nextUrl.searchParams.get('employeeEmail')
  if (!employeeEmail) return NextResponse.json({ error: 'employeeEmail is required' }, { status: 422 })

  const { data, error } = await supabase
    .from('induction_feedback')
    .select('*')
    .eq('employee_email', employeeEmail)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ feedback: data })
}

export async function POST(req: NextRequest) {
  let body: { employeeEmail?: string; employeeName?: string; rating?: number; feedbackText?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.employeeEmail || !body.feedbackText?.trim()) {
    return NextResponse.json({ error: 'employeeEmail and feedbackText are required' }, { status: 422 })
  }
  if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
    return NextResponse.json({ error: 'rating must be between 1 and 5' }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('induction_feedback')
    .insert({
      employee_email: body.employeeEmail,
      employee_name: body.employeeName ?? null,
      rating: body.rating ?? null,
      feedback_text: body.feedbackText.trim(),
    })
    .select()
    .single()

  if (error) {
    // Unique violation — they already submitted once. Return the existing
    // row instead of erroring, so a double-click/refresh doesn't confuse
    // the employee or double-email HR.
    if (error.code === '23505') {
      const { data: existing } = await supabase.from('induction_feedback').select('*').eq('employee_email', body.employeeEmail).single()
      return NextResponse.json({ feedback: existing })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  notifyInductionFeedback({
    employeeEmail: body.employeeEmail,
    employeeName: body.employeeName ?? null,
    rating: body.rating ?? null,
    feedbackText: body.feedbackText.trim(),
  }).catch(e => console.error('[Induction Feedback] Failed to notify HR:', e instanceof Error ? e.message : String(e)))

  return NextResponse.json({ feedback: data }, { status: 201 })
}
