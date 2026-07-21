import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let body: { title?: string; description?: string; type?: string; url?: string; duration?: string; day?: number | null; subject?: string | null; sortOrder?: number | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (body.title !== undefined) update.title = body.title
  if (body.description !== undefined) update.description = body.description
  if (body.type !== undefined) update.type = body.type
  if (body.url !== undefined) update.url = body.url
  if (body.duration !== undefined) update.duration = body.duration
  if (body.day !== undefined) update.day = body.day
  if (body.subject !== undefined) update.subject = body.subject
  if (body.sortOrder !== undefined) update.sort_order = body.sortOrder

  const { data, error } = await supabase.from('materials').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ material: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabase.from('materials').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
