import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Shared FAQ: AI-answered questions other employees found helpful (resolved, has an answer)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await supabase
    .from('material_questions')
    .select('id, question, ai_answer')
    .eq('material_id', id)
    .eq('resolved', true)
    .not('ai_answer', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ faq: data })
}
