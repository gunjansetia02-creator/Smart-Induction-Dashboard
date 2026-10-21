import { NextResponse } from 'next/server'
import { HR_COOKIE, HR_SESSION_DAYS, createHrSession, hrPasswordMatches } from '@/lib/hr-auth'

// Only same-site paths, so the login form can't be used as an open redirect.
function safeNext(value: FormDataEntryValue | null): string {
  const s = typeof value === 'string' ? value : ''
  return s.startsWith('/') && !s.startsWith('//') ? s : '/hr'
}

export async function POST(req: Request) {
  const form = await req.formData()
  const next = safeNext(form.get('next'))
  const password = String(form.get('password') ?? '')

  if (!hrPasswordMatches(password)) {
    await new Promise(resolve => setTimeout(resolve, 1000)) // slow down guessing
    const back = new URL('/hr-login', req.url)
    back.searchParams.set('error', '1')
    back.searchParams.set('next', next)
    return NextResponse.redirect(back, 303)
  }

  const res = NextResponse.redirect(new URL(next, req.url), 303)
  res.cookies.set(HR_COOKIE, await createHrSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: HR_SESSION_DAYS * 86_400,
  })
  return res
}
