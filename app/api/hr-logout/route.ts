import { NextResponse } from 'next/server'
import { HR_COOKIE } from '@/lib/hr-auth'

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL('/hr-login', req.url), 303)
  res.cookies.delete(HR_COOKIE)
  return res
}
