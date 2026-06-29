import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail }      from '@/lib/automation/welcome-email'
import { addAllToMondayMeeting } from '@/lib/automation/meeting-invite'

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  if (WEBHOOK_SECRET && auth !== `Bearer ${WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { joiners?: Array<{ name: string; email: string; department?: string }> }
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

  // Personalised welcome email per joiner, ONE shared meeting for all
  const emailResults  = await Promise.allSettled(joiners.map(j => sendWelcomeEmail(j)))
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

  const allOk = emailResults.every(r => r.status === 'fulfilled') && meetingResult === 'invited'
  return NextResponse.json({ processed: joiners.length, meeting: meetingResult, results }, { status: allOk ? 200 : 207 })
}
