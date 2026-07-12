import { supabase } from '@/lib/supabase'

// Records the first time a joiner opens their dashboard link. Only sets
// first_login_at once — later visits must not overwrite it. Returns true
// when this call is what just set it (i.e. a genuine first visit), so the
// caller can show the one-time dashboard walkthrough.
export async function markJoinerLogin(email: string): Promise<boolean> {
  if (!email) return false
  const { data: existing } = await supabase
    .from('joiner_communications')
    .select('first_login_at')
    .eq('employee_email', email)
    .maybeSingle()

  if (existing?.first_login_at) return false

  await supabase
    .from('joiner_communications')
    .upsert({ employee_email: email, first_login_at: new Date().toISOString() }, { onConflict: 'employee_email' })

  return true
}
