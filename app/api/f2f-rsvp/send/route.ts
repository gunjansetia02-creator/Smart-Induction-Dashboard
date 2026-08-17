import { NextRequest, NextResponse } from 'next/server'
import { sendF2FConfirmationEmail } from '@/lib/automation/f2f-confirmation-email'

export async function POST(req: NextRequest) {
  let body: { to?: string[]; bcc?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const to = body.to ?? []
  const bcc = body.bcc ?? []
  if (to.length === 0) {
    return NextResponse.json({ error: 'to (array of at least one address) is required' }, { status: 422 })
  }

  try {
    await sendF2FConfirmationEmail({ to, bcc })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'send failed' }, { status: 500 })
  }

  return NextResponse.json({ sent: true, to, bccCount: bcc.length })
}
