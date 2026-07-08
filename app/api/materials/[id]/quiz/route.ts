import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Employee fetch (default) omits correct_index to avoid trivial cheating.
// HR admin fetch (?admin=true) includes it for editing.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = req.nextUrl.searchParams.get('admin') === 'true'

  const { data, error } = await supabase
    .from('material_quiz_questions')
    .select(admin ? '*' : 'id, question, options')
    .eq('material_id', id)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ questions: data })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let body: { question?: string; options?: string[]; correctIndex?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.question || !Array.isArray(body.options) || body.options.length < 2 || body.correctIndex === undefined) {
    return NextResponse.json({ error: 'question, options (2+), and correctIndex are required' }, { status: 422 })
  }
  if (body.correctIndex < 0 || body.correctIndex >= body.options.length) {
    return NextResponse.json({ error: 'correctIndex out of range' }, { status: 422 })
  }

  const { count } = await supabase.from('material_quiz_questions').select('id', { count: 'exact', head: true }).eq('material_id', id)

  const { data, error } = await supabase
    .from('material_quiz_questions')
    .insert({ material_id: id, question: body.question, options: body.options, correct_index: body.correctIndex, sort_order: count ?? 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ question: data }, { status: 201 })
}
