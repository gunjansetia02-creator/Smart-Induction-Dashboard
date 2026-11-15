import { supabase } from '@/lib/supabase'
import { notifyHRInductionComplete } from '@/lib/automation/induction-complete-email'
import { fetchAllEmployees } from '@/lib/automation/pms-client'
import { countsForJoiner } from './material-applicability'

// Called after any material_progress write that could flip someone to 100%
// (the plain progress route, and the quiz-attempt route, which upserts
// progress directly on a pass). Records materials_complete_at the first time
// (so materials added later never reopen their induction) and fires the HR
// notification exactly once per joiner, guarded by induction_complete_notified_at.
export async function checkAndNotifyInductionComplete(employeeEmail: string, employeeName: string | null): Promise<void> {
  const [{ data: materials }, { data: progress }, { data: comms }] = await Promise.all([
    supabase.from('materials').select('id, required_department, created_at'),
    supabase.from('material_progress').select('material_id, status').eq('employee_email', employeeEmail),
    supabase.from('joiner_communications')
      .select('induction_complete_notified_at, materials_complete_at')
      .eq('employee_email', employeeEmail)
      .maybeSingle(),
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
    (materials ?? []).filter(m => countsForJoiner(m, myDept, comms?.materials_complete_at)).map(m => m.id)
  )
  const totalCount = applicableIds.size
  if (totalCount === 0) return

  const completeCount = (progress ?? []).filter(p => p.status === 'complete' && applicableIds.has(p.material_id)).length
  if (completeCount < totalCount) return

  const now = new Date().toISOString()
  if (!comms?.materials_complete_at) {
    await supabase.from('joiner_communications').upsert(
      { employee_email: employeeEmail, materials_complete_at: now, updated_at: now },
      { onConflict: 'employee_email' }
    )
  }

  if (comms?.induction_complete_notified_at) return

  await notifyHRInductionComplete({ employeeEmail, employeeName })

  await supabase.from('joiner_communications').upsert(
    { employee_email: employeeEmail, induction_complete_notified_at: now, updated_at: now },
    { onConflict: 'employee_email' }
  )
}
