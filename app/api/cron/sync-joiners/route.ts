import { NextRequest, NextResponse } from 'next/server'
import { fetchAllEmployees, filterTodaysJoiners } from '@/lib/automation/pms-client'
import { sendWelcomeEmail }   from '@/lib/automation/welcome-email'
import { addToMondayMeeting } from '@/lib/automation/meeting-invite'

// Called by Vercel Cron daily at 9 AM IST (3:30 AM UTC).
// Can also be triggered manually with Authorization: Bearer <WEBHOOK_SECRET>
export async function GET(req: NextRequest) {
  const auth   = req.headers.get('authorization') ?? ''
  const cronSecret    = process.env.CRON_SECRET
  const webhookSecret = process.env.WEBHOOK_SECRET

  const ok = (cronSecret && auth === `Bearer ${cronSecret}`) ||
             (webhookSecret && auth === `Bearer ${webhookSecret}`)

  if (!ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let allEmployees
  try {
    allEmployees = await fetchAllEmployees()
  } catch (err) {
    return NextResponse.json({ error: `PMS fetch failed: ${(err as Error).message}` }, { status: 502 })
  }

  const newJoiners = filterTodaysJoiners(allEmployees)

  if (newJoiners.length === 0) {
    return NextResponse.json({ message: 'No new joiners today', processed: 0 })
  }

  const results = await Promise.all(
    newJoiners.map(async emp => {
      const name  = emp['Name']         ?? 'New Joiner'
      const email = emp['Office Email'] ?? emp['Personal Email'] ?? null
      const dept  = emp['Department']   ?? undefined

      if (!email) {
        return { name, status: 'skipped', reason: 'no email in PMS' }
      }

      const joiner = { name, email, department: dept }

      const [emailRes, meetingRes] = await Promise.allSettled([
        sendWelcomeEmail(joiner),
        addToMondayMeeting(joiner),
      ])

      return {
        name,
        email,
        email_sent:   emailRes.status   === 'fulfilled' ? true : (emailRes   as PromiseRejectedResult).reason?.message,
        meeting_sent: meetingRes.status === 'fulfilled' ? true : (meetingRes as PromiseRejectedResult).reason?.message,
      }
    })
  )

  return NextResponse.json({
    message:   `Processed ${newJoiners.length} joiner(s)`,
    processed: newJoiners.length,
    results,
  })
}
