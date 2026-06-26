import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail }  from '@/lib/automation/welcome-email'
import { addToMondayMeeting } from '@/lib/automation/meeting-invite'

// PMS will POST to /api/webhook/new-joiner with a shared secret in the Authorization header
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  // Verify shared secret
  const auth = req.headers.get('authorization') ?? ''
  if (WEBHOOK_SECRET && auth !== `Bearer ${WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { name?: string; email?: string; department?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, department } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 422 })
  }

  const joiner = { name, email, department }

  const results = await Promise.allSettled([
    sendWelcomeEmail(joiner),
    addToMondayMeeting(joiner),
  ])

  const [emailResult, meetingResult] = results

  const response = {
    email:   emailResult.status   === 'fulfilled' ? 'sent'    : `failed: ${(emailResult   as PromiseRejectedResult).reason?.message}`,
    meeting: meetingResult.status === 'fulfilled' ? 'invited' : `failed: ${(meetingResult as PromiseRejectedResult).reason?.message}`,
  }

  const allOk = results.every(r => r.status === 'fulfilled')
  return NextResponse.json(response, { status: allOk ? 200 : 207 })
}
