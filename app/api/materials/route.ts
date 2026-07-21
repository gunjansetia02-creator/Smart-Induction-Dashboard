import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const employeeEmail = req.nextUrl.searchParams.get('employeeEmail')

  const { data: materials, error } = await supabase
    .from('materials')
    .select('*')
    .order('day', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!employeeEmail) {
    return NextResponse.json({ materials })
  }

  const materialIds = materials.map(m => m.id)

  const [{ data: progress }, { data: questions }] = await Promise.all([
    supabase.from('material_progress').select('*').eq('employee_email', employeeEmail).in('material_id', materialIds),
    supabase.from('material_questions').select('material_id, resolved, escalated').in('material_id', materialIds),
  ])

  const progressByMaterial = new Map((progress ?? []).map(p => [p.material_id, p]))
  const openQuestionsByMaterial = new Map<string, number>()
  for (const q of questions ?? []) {
    if (!q.resolved) {
      openQuestionsByMaterial.set(q.material_id, (openQuestionsByMaterial.get(q.material_id) ?? 0) + 1)
    }
  }

  const enriched = materials.map(m => ({
    ...m,
    progress: progressByMaterial.get(m.id) ?? null,
    openQuestions: openQuestionsByMaterial.get(m.id) ?? 0,
  }))

  return NextResponse.json({ materials: enriched })
}

export async function POST(req: NextRequest) {
  let body: { title?: string; description?: string; type?: string; url?: string; duration?: string; day?: number | null; subject?: string | null; sortOrder?: number | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.title || !body.type || !body.url) {
    return NextResponse.json({ error: 'title, type, and url are required' }, { status: 422 })
  }
  if (body.type !== 'video' && body.type !== 'pdf') {
    return NextResponse.json({ error: 'type must be "video" or "pdf"' }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('materials')
    .insert({
      title: body.title,
      description: body.description ?? '',
      type: body.type,
      url: body.url,
      duration: body.duration ?? null,
      day: body.day ?? null,
      subject: body.subject ?? null,
      sort_order: body.sortOrder ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ material: data }, { status: 201 })
}
