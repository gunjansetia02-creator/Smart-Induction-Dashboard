import { NextRequest, NextResponse } from 'next/server'
import { getDaySlotsWithAvailability } from '@/lib/automation/doubt-booking'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date=YYYY-MM-DD is required' }, { status: 422 })
  }

  try {
    const slots = await getDaySlotsWithAvailability(date)

    // Also exclude slots already requested/confirmed through our own booking system,
    // since a 'pending' request isn't on HR's real calendar yet.
    const dayStart = `${date}T00:00:00.000Z`
    const dayEnd = `${date}T23:59:59.999Z`
    const { data: existing } = await supabase
      .from('doubt_bookings')
      .select('slot_start')
      .in('status', ['pending', 'confirmed'])
      .gte('slot_start', dayStart)
      .lte('slot_start', dayEnd)

    const takenStarts = new Set((existing ?? []).map(b => new Date(b.slot_start).toISOString()))

    const available = slots
      .filter(s => s.free && !takenStarts.has(s.slot.start))
      .map(s => s.slot)

    return NextResponse.json({ slots: available })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to load availability' }, { status: 500 })
  }
}
