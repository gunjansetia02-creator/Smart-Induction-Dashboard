import { timingSafeEqual } from 'crypto'
import { fetchAllEmployeesDirect } from '@/lib/automation/pms-client'

// Full PMS employee list for a trusted caller — the local dev copy, whose IP
// PMS doesn't whitelist, fetches through here instead (see PMS_PROXY_URL in
// pms-client.ts). Locked to a shared secret: the records include personal
// emails, phone numbers, UAN and PIP status.
function authorized(req: Request): boolean {
  const secret = process.env.PMS_PROXY_SECRET
  if (!secret) return false
  const given = Buffer.from(req.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const employees = await fetchAllEmployeesDirect()
    return Response.json({ employees }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 })
  }
}
