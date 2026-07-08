'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'

interface BookingWindow { doj: string; windowStart: string; windowEnd: string; isOpen: boolean }
interface Booking { id: string; slot_start: string; slot_end: string; status: 'pending' | 'confirmed' | 'declined' | 'cancelled' }
interface Slot { start: string; end: string }

function fmtDay(d: Date) {
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })
}
function isoDate(d: Date) {
  return d.toISOString().substring(0, 10)
}

export function BookSession({ employeeEmail, employeeName }: { employeeEmail: string; employeeName: string }) {
  const [bookingWindow, setBookingWindow] = useState<BookingWindow | null | 'error'>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/doubt-booking/window?employeeEmail=${encodeURIComponent(employeeEmail)}`)
      .then(r => r.json())
      .then(d => setBookingWindow(d.error ? 'error' : d))
      .catch(() => setBookingWindow('error'))

    fetch(`/api/doubt-booking?scope=mine&employeeEmail=${encodeURIComponent(employeeEmail)}`)
      .then(r => r.json())
      .then(d => setBooking((d.bookings ?? [])[0] ?? null))
      .catch(() => {})
  }, [employeeEmail])

  function selectDay(dateStr: string) {
    setSelectedDate(dateStr)
    setSlots(null)
    setLoadingSlots(true)
    fetch(`/api/doubt-booking/availability?date=${dateStr}`)
      .then(r => r.json())
      .then(d => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }

  async function book(slot: Slot) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/doubt-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeEmail, employeeName, slotStart: slot.start, slotEnd: slot.end }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Booking failed')
      setBooking(data.booking)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (bookingWindow === null) {
    return <Card title="Book a 1:1 with HR"><div className="text-center py-6 text-muted text-[13px]">Loading…</div></Card>
  }

  if (bookingWindow === 'error') {
    return <Card title="Book a 1:1 with HR"><div className="text-center py-6 text-muted text-[13px]">Couldn&apos;t determine your joining date, so booking isn&apos;t available yet. Ask HR directly.</div></Card>
  }

  if (booking) {
    return (
      <Card title="Book a 1:1 with HR">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-navy font-semibold">
              {new Date(booking.slot_start).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · {fmtTime(booking.slot_start)}–{fmtTime(booking.slot_end)} IST
            </div>
            <div className="text-[11.5px] text-muted mt-0.5">
              {booking.status === 'pending' ? 'Waiting for Gunjan to accept' : booking.status === 'confirmed' ? 'Confirmed — check your inbox for the Teams invite' : 'This request was declined'}
            </div>
          </div>
          <Pill variant={booking.status === 'confirmed' ? 'green' : booking.status === 'declined' ? 'red' : 'amber'}>
            {booking.status === 'confirmed' ? 'Confirmed' : booking.status === 'declined' ? 'Declined' : 'Pending'}
          </Pill>
        </div>
      </Card>
    )
  }

  if (!bookingWindow.isOpen) {
    return (
      <Card title="Book a 1:1 with HR">
        <div className="text-center py-6 text-muted text-[13px]">
          Your first-week booking window ({new Date(bookingWindow.windowStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}–{new Date(bookingWindow.windowEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}) has closed. Reach out to HR directly if you still need a 1:1.
        </div>
      </Card>
    )
  }

  const days: Date[] = []
  const start = new Date(bookingWindow.windowStart)
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  const today = isoDate(new Date())

  return (
    <Card title="Book a 1:1 with HR">
      <div className="text-[11.5px] text-muted mb-3">Open through your first week only — pick a day to see Gunjan&apos;s real availability.</div>
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {days.map(d => {
          const dateStr = isoDate(d)
          const inPast = dateStr < today
          return (
            <button
              key={dateStr}
              disabled={inPast}
              onClick={() => selectDay(dateStr)}
              className={[
                'px-[10px] py-[7px] rounded text-[11.5px] font-semibold border cursor-pointer',
                inPast ? 'bg-ground text-faint border-bdr cursor-not-allowed opacity-50' :
                selectedDate === dateStr ? 'bg-sky text-white border-sky' : 'bg-white text-navy border-bdr hover:opacity-85',
              ].join(' ')}
            >
              {fmtDay(d)}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div>
          {loadingSlots ? (
            <div className="text-[12.5px] text-muted py-2">Checking availability…</div>
          ) : slots && slots.length === 0 ? (
            <div className="text-[12.5px] text-muted py-2">No open slots that day — try another.</div>
          ) : (
            <div className="flex gap-1.5 flex-wrap">
              {(slots ?? []).map(s => (
                <button
                  key={s.start}
                  onClick={() => book(s)}
                  disabled={submitting}
                  className="px-[10px] py-[6px] text-[12px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:bg-sky hover:text-white hover:border-sky disabled:opacity-40"
                >
                  {fmtTime(s.start)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {error && <div className="text-[11.5px] text-red-600 mt-2">{error}</div>}
    </Card>
  )
}
