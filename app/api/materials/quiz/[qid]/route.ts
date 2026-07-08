import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ qid: string }> }) {
  const { qid } = await params
  let body: { question?: string; options?: string[]; correctIndex?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (body.question !== undefined) update.question = body.question
  if (body.options !== undefined) update.options = body.options
  if (body.correctIndex !== undefined) update.correct_index = body.correctIndex

  const { data, error } = await supabase.from('material_quiz_questions').update(update).eq('id', qid).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ question: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ qid: string }> }) {
  const { qid } = await params
  const { error } = await supabase.from('material_quiz_questions').delete().eq('id', qid)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
