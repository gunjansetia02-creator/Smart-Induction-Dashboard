import { NextRequest, NextResponse } from 'next/server'
import { getJoinerStatuses } from '@/lib/data/get-joiner-statuses'

export type { JoinerStatusEntry } from '@/lib/data/get-joiner-statuses'

export async function POST(req: NextRequest) {
  let body: { emails?: string[]; joiners?: { email: string; dept?: string }[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Accept the older `emails`-only shape too (no department, so department-
  // restricted materials won't be excluded from that caller's totals) so any
  // client not yet updated to send `joiners` doesn't break outright.
  const joiners = body.joiners ?? (body.emails ?? []).map(email => ({ email }))
  const statuses = await getJoinerStatuses(joiners)
  return NextResponse.json({ statuses })
}
