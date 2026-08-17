import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export async function GET() {
  const { data, error } = await supabase
    .from('f2f_rsvp')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data ?? []
  const header = ['Name', 'Email', 'Response', 'Event', 'Submitted At']
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.name),
        csvEscape(r.email),
        csvEscape(r.response === 'confirmed' ? 'Confirmed - Attending' : 'Change of Plan - Not Attending'),
        csvEscape(r.event_label ?? ''),
        csvEscape(new Date(r.created_at).toLocaleString('en-IN')),
      ].join(',')
    )
  }
  const csv = lines.join('\r\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="f2f-rsvp-responses.csv"`,
    },
  })
}
