import { NextRequest, NextResponse } from 'next/server'
import { markJoinerLogin } from '@/lib/data/mark-login'

// Deliberately a client-triggered POST, not something that runs during SSR of
// the employee page itself: chat apps and messaging clients commonly
// auto-fetch (GET) a shared link to generate a preview card, which would
// silently consume the one-time "first visit" flag before the real person
// ever opens it. A POST fired from real browser JS after hydration is immune
// to that, since preview bots don't execute page scripts.
export async function POST(req: NextRequest) {
  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.email) {
    return NextResponse.json({ error: 'email is required' }, { status: 422 })
  }

  const isFirstVisit = await markJoinerLogin(body.email).catch(() => false)
  return NextResponse.json({ isFirstVisit })
}
