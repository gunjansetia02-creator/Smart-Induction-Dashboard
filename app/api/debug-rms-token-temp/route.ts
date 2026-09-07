import { getRMSToken } from '@/lib/automation/rms-client'

export async function GET() {
  try {
    const token = await getRMSToken()
    return Response.json({ ok: true, username: token.Username, role: token.Role })
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : String(e) })
  }
}
