import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const PASS_THRESHOLD = 0.7

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let body: { employeeEmail?: string; employeeName?: string; answers?: number[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.employeeEmail || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: 'employeeEmail and answers are required' }, { status: 422 })
  }

  const { data: questions, error: qError } = await supabase
    .from('material_quiz_questions')
    .select('id, correct_index')
    .eq('material_id', id)
    .order('sort_order', { ascending: true })

  if (qError) return NextResponse.json({ error: qError.message }, { status: 500 })
  if (!questions || questions.length === 0) return NextResponse.json({ error: 'This material has no quiz' }, { status: 422 })

  const total = questions.length
  const score = questions.reduce((acc, q, i) => acc + (body.answers![i] === q.correct_index ? 1 : 0), 0)
  const passed = score / total >= PASS_THRESHOLD

  const { error: attemptError } = await supabase
    .from('material_quiz_attempts')
    .insert({ material_id: id, employee_email: body.employeeEmail, score, total, passed })

  if (attemptError) return NextResponse.json({ error: attemptError.message }, { status: 500 })

  if (passed) {
    await supabase.from('material_progress').upsert(
      {
        material_id: id,
        employee_email: body.employeeEmail,
        employee_name: body.employeeName ?? null,
        status: 'complete',
        watched_percent: 100,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'material_id,employee_email' }
    )
  }

  return NextResponse.json({ score, total, passed, threshold: PASS_THRESHOLD })
}
