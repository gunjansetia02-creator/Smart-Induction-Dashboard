import { NextRequest, NextResponse } from 'next/server'
import { fetchAllEmployees, filterRecentJoiners, parseDOJ, businessDaysBetween } from '@/lib/automation/pms-client'
import { isIndiaBasedLocation } from '@/lib/automation/india-location'
import { sendWeek1CheckinEmail } from '@/lib/automation/week1-checkin-email'
import { supabase } from '@/lib/supabase'

const BUSINESS_DAYS_THRESHOLD = 5 // ~1 working week

export async function GET(req: NextRequest) {
  const auth          = req.headers.get('authorization') ?? ''
  const cronSecret    = process.env.CRON_SECRET
  const webhookSecret = process.env.WEBHOOK_SECRET

  const ok = (cronSecret && auth === `Bearer ${cronSecret}`) ||
             (webhookSecret && auth === `Bearer ${webhookSecret}`)
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let allEmployees
  try {
    allEmployees = await fetchAllEmployees()
  } catch (err) {
    return NextResponse.json({ error: `PMS fetch failed: ${(err as Error).message}` }, { status: 502 })
  }

  // A wide window (45 days), not "exactly 5 business days" — so a missed run
  // still catches anyone who's crossed the threshold and hasn't been sent
  // one yet, guarded below by week1_checkin_sent_at.
  const recentJoiners = filterRecentJoiners(allEmployees, 45)
    .filter(emp => isIndiaBasedLocation(emp['Base Location']))
    .filter(emp => {
      const doj = parseDOJ(emp['DOJ'])
      return doj && businessDaysBetween(doj, new Date()) >= BUSINESS_DAYS_THRESHOLD
    })

  const candidates = recentJoiners
    .map(emp => ({ name: emp['Name'] ?? 'New Joiner', email: emp['Office Email'] ?? emp['Personal Email'] ?? '' }))
    .filter(j => j.email !== '')

  if (candidates.length === 0) {
    return NextResponse.json({ message: 'No one has crossed the 1-week mark today', processed: 0 })
  }

  const { data: alreadySent } = await supabase
    .from('joiner_communications')
    .select('employee_email')
    .in('employee_email', candidates.map(c => c.email))
    .not('week1_checkin_sent_at', 'is', null)

  const sentEmails = new Set((alreadySent ?? []).map(r => r.employee_email.toLowerCase()))
  const toSend = candidates.filter(j => !sentEmails.has(j.email.toLowerCase()))

  if (toSend.length === 0) {
    return NextResponse.json({ message: `${candidates.length} joiner(s) past 1 week, all already checked in on`, processed: 0 })
  }

  const results = await Promise.allSettled(toSend.map(j => sendWeek1CheckinEmail(j)))

  const now = new Date().toISOString()
  await Promise.all(
    toSend.map((j, i) =>
      results[i].status === 'fulfilled'
        ? supabase.from('joiner_communications').upsert(
            { employee_email: j.email, week1_checkin_sent_at: now, updated_at: now },
            { onConflict: 'employee_email' }
          )
        : null
    )
  )

  return NextResponse.json({
    processed: toSend.length,
    results: toSend.map((j, i) => ({
      name: j.name,
      email: j.email,
      sent: results[i].status === 'fulfilled' ? true : (results[i] as PromiseRejectedResult).reason?.message,
    })),
  })
}
