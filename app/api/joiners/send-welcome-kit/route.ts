import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, type NewJoiner } from '@/lib/automation/welcome-email'
import { addAllToMondayMeeting } from '@/lib/automation/meeting-invite'

interface RequestBody {
  joiners?: NewJoiner[]
  skipEmail?: boolean
  dryRun?: boolean
}

export async function POST(req: NextRequest) {
  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const joiners = body.joiners ?? []
  if (joiners.length === 0) {
    return NextResponse.json({ error: 'joiners array is required and must not be empty' }, { status: 422 })
  }
  if (joiners.some(j => !j.name || !j.email)) {
    return NextResponse.json({ error: 'Each joiner must have name and email' }, { status: 422 })
  }

  // Dry run: report exactly what would happen, without calling Microsoft Graph at all.
  // Used for demo/fallback data so a fake mock email never becomes a real calendar invitee.
  if (body.dryRun) {
    const results = joiners.map(j => ({
      name: j.name,
      email: j.email,
      email_sent: body.skipEmail ? 'skipped' : 'simulated (dry run — no real email sent)',
      meeting_sent: 'simulated (dry run — no real invite sent)',
    }))
    return NextResponse.json({ processed: joiners.length, dryRun: true, results })
  }

  const emailResults = body.skipEmail
    ? joiners.map(() => ({ status: 'fulfilled' as const, value: undefined }))
    : await Promise.allSettled(joiners.map(j => sendWelcomeEmail(j)))

  const meetingResult = await addAllToMondayMeeting(joiners)
    .then(() => 'invited' as const)
    .catch((e: Error) => `failed: ${e.message}`)

  const results = joiners.map((j, i) => ({
    name: j.name,
    email: j.email,
    email_sent: body.skipEmail
      ? 'skipped'
      : emailResults[i].status === 'fulfilled'
        ? true
        : (emailResults[i] as PromiseRejectedResult).reason?.message,
    meeting_sent: meetingResult,
  }))

  const allOk = (body.skipEmail || emailResults.every(r => r.status === 'fulfilled')) && meetingResult === 'invited'
  return NextResponse.json({ processed: joiners.length, meeting: meetingResult, results }, { status: allOk ? 200 : 207 })
}
