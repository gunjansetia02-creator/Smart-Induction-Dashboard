import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const employeeEmail = req.nextUrl.searchParams.get('employeeEmail')

  let query = supabase.from('joiner_feedback').select('*').order('created_at', { ascending: false })
  if (employeeEmail) query = query.eq('employee_email', employeeEmail)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ feedback: data })
}

export async function POST(req: NextRequest) {
  let body: { employeeEmail?: string; employeeName?: string; feedbackText?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.employeeEmail || !body.feedbackText?.trim()) {
    return NextResponse.json({ error: 'employeeEmail and feedbackText are required' }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('joiner_feedback')
    .insert({
      employee_email: body.employeeEmail,
      employee_name: body.employeeName ?? null,
      feedback_text: body.feedbackText.trim(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ feedback: data }, { status: 201 })
}
