import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Full picture across every question ever asked, not just the ones escalated
// to HR — so HR can see how much the AI is handling on its own vs. how much
// still lands on their plate.
export async function GET() {
  const [{ count: total }, { count: aiHandled }, { count: pendingForHR }, { count: answeredByHR }] = await Promise.all([
    supabase.from('material_questions').select('id', { count: 'exact', head: true }),
    supabase.from('material_questions').select('id', { count: 'exact', head: true }).eq('escalated', false).eq('resolved', true),
    supabase.from('material_questions').select('id', { count: 'exact', head: true }).eq('escalated', true).eq('resolved', false),
    supabase.from('material_questions').select('id', { count: 'exact', head: true }).eq('escalated', true).eq('resolved', true),
  ])

  return NextResponse.json({
    total: total ?? 0,
    aiHandled: aiHandled ?? 0,
    pendingForHR: pendingForHR ?? 0,
    answeredByHR: answeredByHR ?? 0,
  })
}
