import { NextRequest, NextResponse } from 'next/server'
import { getJoinerStatuses } from '@/lib/data/get-joiner-statuses'

export type { JoinerStatusEntry } from '@/lib/data/get-joiner-statuses'

export async function POST(req: NextRequest) {
  let body: { emails?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const statuses = await getJoinerStatuses(body.emails ?? [])
  return NextResponse.json({ statuses })
}
