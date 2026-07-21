import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { answerMaterialQuestion, aiConfigured } from '@/lib/ai-answer'
import { notifyHRNewDoubt } from '@/lib/automation/doubt-email'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const employeeEmail = req.nextUrl.searchParams.get('employeeEmail')

  let query = supabase.from('material_questions').select('*').eq('material_id', id).order('created_at', { ascending: true })
  if (employeeEmail) query = query.eq('employee_email', employeeEmail)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ questions: data })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let body: { question?: string; employeeEmail?: string; employeeName?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.question || !body.employeeEmail) {
    return NextResponse.json({ error: 'question and employeeEmail are required' }, { status: 422 })
  }

  const { data: material, error: materialError } = await supabase.from('materials').select('*').eq('id', id).single()
  if (materialError || !material) return NextResponse.json({ error: 'Material not found' }, { status: 404 })

  let aiAnswer: string | null = null
  let escalated = false

  if (aiConfigured()) {
    try {
      aiAnswer = await answerMaterialQuestion({
        materialTitle: material.title,
        materialDescription: material.description,
        materialType: material.type,
        materialContent: material.content_text,
        question: body.question,
      })
    } catch (e) {
      aiAnswer = null
      escalated = true
      console.error('[AI] Failed to answer material question:', e instanceof Error ? e.message : String(e))
    }
  } else {
    escalated = true
  }

  const { data, error } = await supabase
    .from('material_questions')
    .insert({
      material_id: id,
      employee_email: body.employeeEmail,
      employee_name: body.employeeName ?? null,
      question: body.question,
      ai_answer: aiAnswer,
      resolved: false,
      escalated,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Only escalated questions need Gunjan's own answer — don't email her for
  // every AI-handled question, only ones that actually land in her queue.
  if (escalated) {
    notifyHRNewDoubt({
      employeeEmail: body.employeeEmail,
      employeeName: body.employeeName ?? null,
      materialTitle: material.title,
      question: body.question,
      aiAttempted: aiConfigured(),
    }).catch(e => console.error('[Doubt Email] Failed to notify HR:', e instanceof Error ? e.message : String(e)))
  }

  return NextResponse.json({ question: data, aiAvailable: aiConfigured() }, { status: 201 })
}
