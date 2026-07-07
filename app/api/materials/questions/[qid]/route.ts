import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ qid: string }> }) {
  const { qid } = await params
  let body: { resolved?: boolean; escalated?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (body.resolved !== undefined) update.resolved = body.resolved
  if (body.escalated !== undefined) update.escalated = body.escalated

  const { data, error } = await supabase.from('material_questions').update(update).eq('id', qid).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ question: data })
}
