import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { fetchAllEmployees } from '@/lib/automation/pms-client'
import { createOneOnOneFeedback } from '@/lib/automation/rms-client'

export async function GET(req: NextRequest) {
  const employeeEmail = req.nextUrl.searchParams.get('employeeEmail')
  if (!employeeEmail) return NextResponse.json({ error: 'employeeEmail is required' }, { status: 422 })

  const { data, error } = await supabase
    .from('rms_feedback_log')
    .select('*')
    .eq('employee_email', employeeEmail)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ log: data })
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

  const employeeEmail = body.employeeEmail
  const feedbackText = body.feedbackText.trim()

  async function logAndReturn(status: 'sent' | 'failed', opts: { empId?: string; mngrId?: string; errorMessage?: string; rmsResponse?: string }) {
    await supabase.from('rms_feedback_log').insert({
      employee_email: employeeEmail,
      employee_name: body.employeeName ?? null,
      feedback_text: feedbackText,
      emp_id: opts.empId ?? null,
      mngr_id: opts.mngrId ?? null,
      status,
      error_message: opts.errorMessage ?? null,
      rms_response: opts.rmsResponse ?? null,
    })
  }

  let allEmployees
  try {
    allEmployees = await fetchAllEmployees()
  } catch (e) {
    const msg = `Could not reach PMS to look up employee/manager IDs: ${e instanceof Error ? e.message : String(e)}`
    await logAndReturn('failed', { errorMessage: msg })
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  const employee = allEmployees.find(emp => emp['Office Email']?.toLowerCase() === employeeEmail.toLowerCase())
  if (!employee || !employee['Emp Code']) {
    const msg = `Could not find this employee in PMS (or they have no Emp Code) — cannot submit to RMS.`
    await logAndReturn('failed', { errorMessage: msg })
    return NextResponse.json({ error: msg }, { status: 404 })
  }

  const managerEmail = employee['Reporting Manager Email']
  const manager = managerEmail
    ? allEmployees.find(emp => emp['Office Email']?.toLowerCase() === managerEmail.toLowerCase())
    : null

  if (!manager || !manager['Emp Code']) {
    const msg = `Could not find this employee's reporting manager in PMS (looked for "${managerEmail ?? 'no manager email on file'}") — cannot submit to RMS without a manager ID.`
    await logAndReturn('failed', { empId: employee['Emp Code'], errorMessage: msg })
    return NextResponse.json({ error: msg }, { status: 404 })
  }

  const empId = employee['Emp Code']
  const mngrId = manager['Emp Code']

  try {
    const result = await createOneOnOneFeedback({ empId, mngrId, answerStrength: feedbackText })
    await logAndReturn('sent', { empId, mngrId, rmsResponse: result.rawResponse })
    return NextResponse.json({ ok: true, empId, mngrId })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await logAndReturn('failed', { empId, mngrId, errorMessage: msg })
    return NextResponse.json({ error: `RMS submission failed: ${msg}` }, { status: 502 })
  }
}
