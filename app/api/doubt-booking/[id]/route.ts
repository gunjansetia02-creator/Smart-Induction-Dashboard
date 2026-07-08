import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createDoubtSessionEvent } from '@/lib/automation/doubt-booking'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let body: { action?: 'accept' | 'decline' }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { data: booking, error: fetchError } = await supabase.from('doubt_bookings').select('*').eq('id', id).single()
  if (fetchError || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  if (body.action === 'decline') {
    const { data, error } = await supabase.from('doubt_bookings').update({ status: 'declined' }).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ booking: data })
  }

  if (body.action === 'accept') {
    try {
      const eventId = await createDoubtSessionEvent({
        employeeEmail: booking.employee_email,
        employeeName: booking.employee_name ?? booking.employee_email,
        slotStart: booking.slot_start,
        slotEnd: booking.slot_end,
      })
      const { data, error } = await supabase
        .from('doubt_bookings')
        .update({ status: 'confirmed', graph_event_id: eventId })
        .eq('id', id)
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ booking: data })
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to create calendar event' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'action must be "accept" or "decline"' }, { status: 422 })
}
