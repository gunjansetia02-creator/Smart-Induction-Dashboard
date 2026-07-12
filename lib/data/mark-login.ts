import { supabase } from '@/lib/supabase'

// Records the first time a joiner opens their dashboard link (fire-and-forget,
// called from app/employee/page.tsx). Only sets first_login_at once — later
// visits must not overwrite it.
export async function markJoinerLogin(email: string): Promise<void> {
  if (!email) return
  const { data: existing } = await supabase
    .from('joiner_communications')
    .select('first_login_at')
    .eq('employee_email', email)
    .maybeSingle()

  if (existing?.first_login_at) return

  await supabase
    .from('joiner_communications')
    .upsert({ employee_email: email, first_login_at: new Date().toISOString() }, { onConflict: 'employee_email' })
}
