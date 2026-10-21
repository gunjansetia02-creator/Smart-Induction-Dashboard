import { NextResponse, type NextRequest } from 'next/server'
import { HR_COOKIE, isValidHrSession } from '@/lib/hr-auth'

// Everything a joiner's /employee?email=... page needs stays open. The HR
// Admin pages, and every API call only HR makes, need an HR session.
// Shared routes are gated by method or by the HR-only query they carry.
function needsHr(req: NextRequest): boolean {
  const { pathname: p, searchParams: q } = req.nextUrl
  const m = req.method

  if (p === '/hr' || p.startsWith('/hr/')) return true

  if (p.startsWith('/api/joiners/feedback'))         return true
  if (p === '/api/joiners/rms-feedback')             return true
  if (p === '/api/joiners/send-welcome-kit')         return true
  if (p === '/api/joiners/status')                   return true
  if (p === '/api/sync-pms-data')                    return true
  if (p === '/api/materials/upload')                 return true
  if (p.startsWith('/api/materials/quiz/'))          return true
  if (p === '/api/materials/questions/stats')        return true
  if (p === '/api/materials/questions')              return true // all joiners' questions; joiners use /questions/mine

  if (p === '/api/materials' && m !== 'GET')         return true
  if (/^\/api\/materials\/[^/]+$/.test(p) && (m === 'PATCH' || m === 'DELETE')) return true
  if (/^\/api\/materials\/[^/]+\/quiz$/.test(p) && (m !== 'GET' || q.has('admin'))) return true

  if (/^\/api\/doubt-booking\/[^/]+$/.test(p) && !['availability', 'window'].includes(p.split('/').pop()!)) return true
  if (p === '/api/doubt-booking' && m === 'GET' && q.get('scope') !== 'mine') return true

  return false
}

export async function proxy(req: NextRequest) {
  if (!needsHr(req)) return NextResponse.next()
  if (await isValidHrSession(req.cookies.get(HR_COOKIE)?.value)) return NextResponse.next()

  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'HR sign-in required' }, { status: 401 })
  }
  const login = new URL('/hr-login', req.url)
  login.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search)
  return NextResponse.redirect(login)
}

export const config = {
  matcher: ['/hr', '/hr/:path*', '/api/:path*'],
}
