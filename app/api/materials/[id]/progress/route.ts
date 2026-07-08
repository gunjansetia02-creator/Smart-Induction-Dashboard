import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let body: {
    employeeEmail?: string
    employeeName?: string
    status?: 'not-started' | 'in-progress' | 'complete' | 'has-doubt'
    watchedPercent?: number
    lastPositionSeconds?: number
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.employeeEmail) {
    return NextResponse.json({ error: 'employeeEmail is required' }, { status: 422 })
  }

  const update: Record<string, unknown> = {
    material_id: id,
    employee_email: body.employeeEmail,
    employee_name: body.employeeName ?? null,
    updated_at: new Date().toISOString(),
  }
  if (body.status !== undefined) update.status = body.status
  if (body.watchedPercent !== undefined) update.watched_percent = Math.max(0, Math.min(100, Math.round(body.watchedPercent)))
  if (body.lastPositionSeconds !== undefined) update.last_position_seconds = Math.max(0, body.lastPositionSeconds)

  const { data, error } = await supabase
    .from('material_progress')
    .upsert(update, { onConflict: 'material_id,employee_email' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ progress: data })
}
