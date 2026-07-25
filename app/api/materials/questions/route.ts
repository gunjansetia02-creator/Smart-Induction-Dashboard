import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// HR view: every question across all materials, newest first — escalated
// ones need HR's own answer, AI-answered ones need HR to confirm or correct.
// ?all=true also includes ones HR has already fully dealt with (resolved
// escalations, or AI answers already confirmed/corrected).
export async function GET(req: NextRequest) {
  const showAll = req.nextUrl.searchParams.get('all') === 'true'

  let query = supabase
    .from('material_questions')
    .select('*, materials(title)')
    .order('created_at', { ascending: false })

  if (!showAll) {
    // Needs attention: either genuinely unresolved (escalated, no HR answer
    // yet) or an AI answer nobody has reviewed yet.
    query = query.or('and(escalated.eq.true,resolved.eq.false),and(escalated.eq.false,ai_confirmed.eq.false,hr_answer.is.null,ai_answer.not.is.null)')
  }

  const { data: questions, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ questions })
}
