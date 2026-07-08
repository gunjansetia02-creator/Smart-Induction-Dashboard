import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Employee view: all of their own escalated questions, across all materials
export async function GET(req: NextRequest) {
  const employeeEmail = req.nextUrl.searchParams.get('employeeEmail')
  if (!employeeEmail) return NextResponse.json({ error: 'employeeEmail is required' }, { status: 422 })

  const { data: questions, error } = await supabase
    .from('material_questions')
    .select('*, materials(title)')
    .eq('escalated', true)
    .eq('employee_email', employeeEmail)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ questions })
}
