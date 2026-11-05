import { NextRequest, NextResponse } from 'next/server'
import {
  REMINDER_SCHEDULE, getReminderSettings, logReminder, planReminders, sendCompletionReminder, setReminderAutoEnabled,
} from '@/lib/automation/completion-reminder'

const HR_EMAIL = process.env.HR_EMAIL ?? 'Gunjan.setia@koenig-solutions.com'

// HR-only (gated in proxy.ts): the reminder plan, the auto on/off switch, and
// sending one reminder now — to the joiner, or as a preview to HR only.
export async function GET() {
  try {
    const [plan, settings] = await Promise.all([planReminders(), getReminderSettings()])
    return NextResponse.json({ ...settings, schedule: REMINDER_SCHEDULE, plan })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 })
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (typeof body.autoEnabled !== 'boolean') return NextResponse.json({ error: 'autoEnabled (boolean) is required' }, { status: 422 })
  await setReminderAutoEnabled(body.autoEnabled)
  return NextResponse.json({ autoEnabled: body.autoEnabled })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { email?: string; preview?: boolean }
  if (!body.email) return NextResponse.json({ error: 'email is required' }, { status: 422 })

  const plan = await planReminders()
  const c = plan.find(p => p.email.toLowerCase() === body.email!.toLowerCase())
  if (!c) return NextResponse.json({ error: 'This joiner has no pending materials (or joined over 30 days ago)' }, { status: 404 })

  const reminderNo = Math.min(c.remindersSent + 1, REMINDER_SCHEDULE.length)
  try {
    if (body.preview) {
      await sendCompletionReminder(c, reminderNo, HR_EMAIL)
      return NextResponse.json({ previewSentTo: HR_EMAIL, reminderNo })
    }
    await sendCompletionReminder(c, reminderNo)
    await logReminder(c, reminderNo, 'hr')
    return NextResponse.json({ sentTo: c.email, reminderNo })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 })
  }
}
