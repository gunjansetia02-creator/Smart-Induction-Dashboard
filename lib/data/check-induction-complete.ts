import { supabase } from '@/lib/supabase'
import { notifyHRInductionComplete } from '@/lib/automation/induction-complete-email'
import { fetchAllEmployees } from '@/lib/automation/pms-client'

// Called after any material_progress write that could flip someone to 100%
// (the plain progress route, and the quiz-attempt route, which upserts
// progress directly on a pass). Fires the HR notification exactly once per
// joiner, guarded by induction_complete_notified_at.
export async function checkAndNotifyInductionComplete(employeeEmail: string, employeeName: string | null): Promise<void> {
  const [{ data: materials }, { data: progress }] = await Promise.all([
    supabase.from('materials').select('id, required_department'),
    supabase.from('material_progress').select('material_id, status').eq('employee_email', employeeEmail),
  ])

  // Department-restricted materials (e.g. a Sales-only deck) only count
  // toward this joiner's total if their PMS department actually matches —
  // look it up the same lazy, cached way the rest of the app does.
  let myDept = ''
  try {
    const employees = await fetchAllEmployees()
    myDept = (employees.find(e => e['Office Email']?.toLowerCase() === employeeEmail.toLowerCase())?.['Department'] ?? '').trim().toLowerCase()
  } catch (e) {
    console.error('[Induction Complete] Could not look up department from PMS:', e instanceof Error ? e.message : String(e))
  }

  const applicableIds = new Set(
    (materials ?? [])
      .filter(m => !m.required_department || m.required_department.trim().toLowerCase() === myDept)
      .map(m => m.id)
  )
  const totalCount = applicableIds.size
  if (totalCount === 0) return

  const completeCount = (progress ?? []).filter(p => p.status === 'complete' && applicableIds.has(p.material_id)).length
  if (completeCount < totalCount) return

  const { data: comms } = await supabase
    .from('joiner_communications')
    .select('induction_complete_notified_at')
    .eq('employee_email', employeeEmail)
    .maybeSingle()

  if (comms?.induction_complete_notified_at) return

  await notifyHRInductionComplete({ employeeEmail, employeeName })

  await supabase.from('joiner_communications').upsert(
    { employee_email: employeeEmail, induction_complete_notified_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { onConflict: 'employee_email' }
  )
}
