import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Shared FAQ: only HR-vetted answers (confirmed correct or corrected) — not
// raw AI answers nobody has reviewed yet, since this is shown to every future
// employee before they even ask.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await supabase
    .from('verified_answers')
    .select('id, question, ai_answer:answer')
    .eq('material_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ faq: data })
}
