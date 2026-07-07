import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// HR view: all unresolved, escalated questions across all materials
export async function GET() {
  const { data: questions, error } = await supabase
    .from('material_questions')
    .select('*, materials(title)')
    .eq('escalated', true)
    .eq('resolved', false)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ questions })
}
