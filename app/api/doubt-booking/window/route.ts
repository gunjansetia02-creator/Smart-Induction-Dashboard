import { NextRequest, NextResponse } from 'next/server'
import { getRecentJoiners } from '@/lib/data/get-joiners'

export async function GET(req: NextRequest) {
  const employeeEmail = req.nextUrl.searchParams.get('employeeEmail')
  if (!employeeEmail) return NextResponse.json({ error: 'employeeEmail is required' }, { status: 422 })

  const joiners = await getRecentJoiners(3650)
  const joiner = joiners.find(j => j.email.toLowerCase() === employeeEmail.toLowerCase())

  if (!joiner) {
    return NextResponse.json({ error: 'No joiner record found for this email — DOJ unknown' }, { status: 404 })
  }

  const doj = new Date(joiner.doj)
  const windowEnd = new Date(doj)
  windowEnd.setDate(windowEnd.getDate() + 6)
  windowEnd.setHours(23, 59, 59, 999)

  const isOpen = Date.now() <= windowEnd.getTime()

  return NextResponse.json({
    doj: joiner.doj,
    windowStart: doj.toISOString().substring(0, 10),
    windowEnd: windowEnd.toISOString().substring(0, 10),
    isOpen,
  })
}
