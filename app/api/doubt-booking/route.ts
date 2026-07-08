import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getRecentJoiners } from '@/lib/data/get-joiners'
import { getDaySlotsWithAvailability, sendBookingRequestEmail } from '@/lib/automation/doubt-booking'

export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get('scope') ?? 'pending'
  const employeeEmail = req.nextUrl.searchParams.get('employeeEmail')

  let query = supabase.from('doubt_bookings').select('*').order('slot_start', { ascending: true })

  if (scope === 'mine') {
    if (!employeeEmail) return NextResponse.json({ error: 'employeeEmail is required for scope=mine' }, { status: 422 })
    query = query.eq('employee_email', employeeEmail).in('status', ['pending', 'confirmed'])
  } else {
    query = query.eq('status', 'pending')
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bookings: data })
}

export async function POST(req: NextRequest) {
  let body: { employeeEmail?: string; employeeName?: string; slotStart?: string; slotEnd?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.employeeEmail || !body.slotStart || !body.slotEnd) {
    return NextResponse.json({ error: 'employeeEmail, slotStart, and slotEnd are required' }, { status: 422 })
  }

  // Re-validate the first-week window server-side — never trust the client on this
  const joiners = await getRecentJoiners(3650)
  const joiner = joiners.find(j => j.email.toLowerCase() === body.employeeEmail!.toLowerCase())
  if (!joiner) return NextResponse.json({ error: 'No joiner record found — cannot verify eligibility' }, { status: 404 })

  const doj = new Date(joiner.doj)
  const windowEnd = new Date(doj)
  windowEnd.setDate(windowEnd.getDate() + 6)
  windowEnd.setHours(23, 59, 59, 999)

  const slotStart = new Date(body.slotStart)
  if (slotStart < doj || slotStart > windowEnd) {
    return NextResponse.json({ error: 'That date is outside your first-week booking window' }, { status: 403 })
  }

  // Re-check the slot is genuinely still free (defends against a race between two tabs/requests)
  const dateStr = body.slotStart.substring(0, 10)
  const daySlots = await getDaySlotsWithAvailability(dateStr)
  const matching = daySlots.find(s => s.slot.start === new Date(body.slotStart!).toISOString())
  if (!matching?.free) {
    return NextResponse.json({ error: 'That slot is no longer available — please pick another' }, { status: 409 })
  }

  const { data: existingSameSlot } = await supabase
    .from('doubt_bookings')
    .select('id')
    .in('status', ['pending', 'confirmed'])
    .eq('slot_start', new Date(body.slotStart).toISOString())
  if (existingSameSlot && existingSameSlot.length > 0) {
    return NextResponse.json({ error: 'That slot was just taken — please pick another' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('doubt_bookings')
    .insert({
      employee_email: body.employeeEmail,
      employee_name: body.employeeName ?? null,
      slot_start: body.slotStart,
      slot_end: body.slotEnd,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    await sendBookingRequestEmail({ employeeEmail: body.employeeEmail, employeeName: body.employeeName ?? body.employeeEmail, slotStart: body.slotStart })
  } catch (e) {
    console.error('[doubt-booking] Failed to send HR notification email:', e instanceof Error ? e.message : e)
  }

  return NextResponse.json({ booking: data }, { status: 201 })
}
