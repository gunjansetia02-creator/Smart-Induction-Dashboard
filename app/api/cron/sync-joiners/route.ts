import { NextRequest, NextResponse } from 'next/server'
import { fetchAllEmployees, filterTodaysJoiners } from '@/lib/automation/pms-client'
import { sendWelcomeEmail }      from '@/lib/automation/welcome-email'
import { addAllToMondayMeeting } from '@/lib/automation/meeting-invite'
import { isIndiaBasedLocation }  from '@/lib/automation/india-location'

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

  const newJoiners = filterTodaysJoiners(allEmployees)
  if (newJoiners.length === 0) {
    return NextResponse.json({ message: 'No new joiners today', processed: 0 })
  }

  // Only India-based joiners get the auto welcome email + meeting invite —
  // overseas offices are handled separately.
  const indiaJoiners = newJoiners.filter(emp => isIndiaBasedLocation(emp['Base Location']))
  const skippedOverseas = newJoiners.length - indiaJoiners.length

  // Map PMS employees to joiner objects, skip anyone with no email
  const joiners = indiaJoiners
    .map(emp => ({
      name:       emp['Name']         ?? 'New Joiner',
      email:      emp['Office Email'] ?? emp['Personal Email'] ?? '',
      department: emp['Department']   ?? undefined,
    }))
    .filter(j => j.email !== '')

  if (joiners.length === 0) {
    return NextResponse.json({
      message: skippedOverseas > 0
        ? `${skippedOverseas} new joiner(s) found but all are overseas — no India-based joiners to email today`
        : 'Joiners found but none have an email in PMS',
      processed: 0,
    })
  }

  // Send personalised welcome email to each joiner
  const emailResults = await Promise.allSettled(joiners.map(j => sendWelcomeEmail(j)))

  // Add ALL joiners to ONE shared Monday meeting
  const meetingResult = await addAllToMondayMeeting(joiners)
    .then(() => 'invited' as const)
    .catch((e: Error) => `failed: ${e.message}`)

  const results = joiners.map((j, i) => ({
    name:         j.name,
    email:        j.email,
    email_sent:   emailResults[i].status === 'fulfilled'
                    ? true
                    : (emailResults[i] as PromiseRejectedResult).reason?.message,
    meeting_sent: meetingResult,
  }))

  return NextResponse.json({
    message:   `Processed ${joiners.length} joiner(s) — 1 shared meeting${skippedOverseas > 0 ? ` (${skippedOverseas} overseas joiner(s) skipped)` : ''}`,
    processed: joiners.length,
    skippedOverseas,
    meeting:   meetingResult,
    results,
  })
}
