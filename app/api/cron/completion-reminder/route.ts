import { NextRequest, NextResponse } from 'next/server'
import { getReminderSettings, logReminder, planReminders, sendCompletionReminder } from '@/lib/automation/completion-reminder'

// Weekday cron. Sends whatever reminder is due today to joiners who haven't
// finished their materials — but only while HR has auto-reminders switched
// on (Profiles page). Otherwise, and with ?dryRun=1, it just reports the plan.
export async function GET(req: NextRequest) {
  const auth          = req.headers.get('authorization') ?? ''
  const cronSecret    = process.env.CRON_SECRET
  const webhookSecret = process.env.WEBHOOK_SECRET
  const ok = (cronSecret && auth === `Bearer ${cronSecret}`) ||
             (webhookSecret && auth === `Bearer ${webhookSecret}`)
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let plan
  try {
    plan = await planReminders()
  } catch (err) {
    return NextResponse.json({ error: `Could not build reminder plan: ${(err as Error).message}` }, { status: 502 })
  }
  const due = plan.filter(c => c.nextReminderNo !== null)

  const { autoEnabled } = await getReminderSettings()
  if (!autoEnabled || req.nextUrl.searchParams.get('dryRun') === '1') {
    return NextResponse.json({
      sent: 0,
      reason: autoEnabled ? 'dry run' : 'auto-reminders are switched off',
      wouldSend: due.map(c => ({ name: c.name, email: c.email, reminderNo: c.nextReminderNo, progress: `${c.materialsComplete}/${c.materialsTotal}` })),
    })
  }

  const results = []
  for (const c of due) {
    try {
      await sendCompletionReminder(c, c.nextReminderNo!)
      await logReminder(c, c.nextReminderNo!, 'auto')
      results.push({ name: c.name, email: c.email, reminderNo: c.nextReminderNo, sent: true })
    } catch (err) {
      results.push({ name: c.name, email: c.email, reminderNo: c.nextReminderNo, sent: (err as Error).message })
    }
  }
  return NextResponse.json({ sent: results.filter(r => r.sent === true).length, results })
}
