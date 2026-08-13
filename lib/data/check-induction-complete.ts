import { supabase } from '@/lib/supabase'
import { notifyHRInductionComplete } from '@/lib/automation/induction-complete-email'

// Called after any material_progress write that could flip someone to 100%
// (the plain progress route, and the quiz-attempt route, which upserts
// progress directly on a pass). Fires the HR notification exactly once per
// joiner, guarded by induction_complete_notified_at.
export async function checkAndNotifyInductionComplete(employeeEmail: string, employeeName: string | null): Promise<void> {
  const [{ count: total }, { data: progress }] = await Promise.all([
    supabase.from('materials').select('id', { count: 'exact', head: true }),
    supabase.from('material_progress').select('status').eq('employee_email', employeeEmail),
  ])

  const totalCount = total ?? 0
  if (totalCount === 0) return

  const completeCount = (progress ?? []).filter(p => p.status === 'complete').length
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
