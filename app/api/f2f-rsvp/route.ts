import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('f2f_rsvp')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ responses: data })
}

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; response?: string; eventLabel?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 422 })
  }
  if (body.response !== 'confirmed' && body.response !== 'change') {
    return NextResponse.json({ error: "response must be 'confirmed' or 'change'" }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('f2f_rsvp')
    .insert({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      response: body.response,
      ...(body.eventLabel ? { event_label: body.eventLabel } : {}),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ rsvp: data }, { status: 201 })
}
