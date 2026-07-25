'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'

interface DoubtQuestion {
  id: string
  employee_email: string
  employee_name: string | null
  question: string
  ai_answer: string | null
  hr_answer: string | null
  resolved: boolean
  escalated: boolean
  ai_confirmed: boolean
  created_at: string
  materials?: { title: string }
}

interface BookingRequest {
  id: string
  employee_email: string
  employee_name: string | null
  slot_start: string
  slot_end: string
  status: string
}

function fmtSlot(startIso: string, endIso: string) {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const day = start.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  const t1 = start.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })
  const t2 = end.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' })
  return `${day} · ${t1}–${t2} IST`
}

function BookingRequestRow({ b, onDecided }: { b: BookingRequest; onDecided: (id: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function decide(action: 'accept' | 'decline') {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/doubt-booking/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      onDecided(b.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-white rounded p-2.5 border border-amber-100">
      <div className="flex-1">
        <div className="text-[12.5px] text-navy font-medium">{b.employee_name ?? b.employee_email}</div>
        <div className="text-[11px] text-muted mt-0.5">{fmtSlot(b.slot_start, b.slot_end)}</div>
        {error && <div className="text-[11px] text-red-600 mt-0.5">{error}</div>}
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button onClick={() => decide('accept')} disabled={busy} className="px-[9px] py-[4px] text-[11px] font-semibold bg-kgreen text-white rounded cursor-pointer hover:opacity-85 disabled:opacity-40">Accept</button>
        <button onClick={() => decide('decline')} disabled={busy} className="px-[9px] py-[4px] text-[11px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85 disabled:opacity-40">Decline</button>
      </div>
    </div>
  )
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function DoubtCard({
  d,
  onAnswered,
  onConfirmed,
}: {
  d: DoubtQuestion
  onAnswered: (id: string, hrAnswer: string) => void
  onConfirmed: (id: string) => void
}) {
  const [answer, setAnswer] = useState('')
  const [correcting, setCorrecting] = useState(false)
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const needsReview = Boolean(d.ai_answer) && !d.ai_confirmed && !d.hr_answer

  async function send() {
    if (!answer.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/materials/questions/${d.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hrAnswer: answer.trim() }),
      })
      if (res.ok) onAnswered(d.id, answer.trim())
    } finally {
      setSending(false)
    }
  }

  async function confirm() {
    setConfirming(true)
    try {
      const res = await fetch(`/api/materials/questions/${d.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiConfirmed: true }),
      })
      if (res.ok) onConfirmed(d.id)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="py-3 border-b border-ground last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-[13px] text-navy font-medium">{d.question}</div>
          <div className="text-[11.5px] text-muted mt-0.5">
            {d.employee_name ?? d.employee_email} · on &ldquo;{d.materials?.title ?? 'a material'}&rdquo; · {timeAgo(d.created_at)}
            {d.escalated && d.ai_answer && ' · AI answered, employee needed more help'}
          </div>
        </div>
        <Pill variant={d.hr_answer || d.ai_confirmed ? 'green' : needsReview ? 'blue' : 'amber'}>
          {d.hr_answer ? 'Corrected' : d.ai_confirmed ? 'Confirmed' : needsReview ? 'Needs review' : 'Pending'}
        </Pill>
      </div>

      {d.ai_answer && (
        <div className="mt-2 bg-sky-dim rounded-[4px] p-2.5 text-[12.5px] text-navy">
          <strong>🤖 AI Suggested Answer:</strong> {d.ai_answer}
        </div>
      )}

      {d.hr_answer ? (
        <div className="mt-2 bg-kgreen-dim rounded-[4px] p-2.5 text-[12.5px] text-navy">
          <strong>Your answer:</strong> {d.hr_answer}
        </div>
      ) : d.ai_confirmed ? (
        <div className="mt-1.5 text-[11px] text-kgreen">✓ You confirmed this is correct</div>
      ) : correcting || !d.ai_answer ? (
        <div className="mt-2 flex gap-2">
          <input
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Type your answer…"
            className="flex-1 border border-bdr rounded px-2.5 py-1.5 text-[12.5px]"
          />
          <button onClick={send} disabled={sending || !answer.trim()} className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85 disabled:opacity-40 whitespace-nowrap">
            {sending ? 'Sending…' : 'Send Answer'}
          </button>
        </div>
      ) : (
        <div className="mt-2 flex gap-2">
          <button onClick={confirm} disabled={confirming} className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-kgreen text-white rounded cursor-pointer hover:opacity-85 disabled:opacity-40">
            ✅ Confirm correct
          </button>
          <button onClick={() => { setAnswer(d.ai_answer ?? ''); setCorrecting(true) }} className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">
            ✏️ Correct it
          </button>
        </div>
      )}
    </div>
  )
}

export function DoubtSession() {
  const [questions, setQuestions] = useState<DoubtQuestion[] | null>(null)
  const [bookings, setBookings] = useState<BookingRequest[] | null>(null)
  const [stats, setStats] = useState<{ total: number; aiHandled: number; awaitingReview: number; aiConfirmed: number } | null>(null)

  useEffect(() => {
    fetch('/api/materials/questions?all=true')
      .then(r => r.json())
      .then(d => setQuestions(d.questions ?? []))
      .catch(() => setQuestions([]))

    fetch('/api/doubt-booking?scope=pending')
      .then(r => r.json())
      .then(d => setBookings(d.bookings ?? []))
      .catch(() => setBookings([]))

    fetch('/api/materials/questions/stats')
      .then(r => r.json())
      .then(d => setStats({ total: d.total ?? 0, aiHandled: d.aiHandled ?? 0, awaitingReview: d.awaitingReview ?? 0, aiConfirmed: d.aiConfirmed ?? 0 }))
      .catch(() => setStats(null))
  }, [])

  function removeBooking(id: string) {
    setBookings(prev => (prev ?? []).filter(b => b.id !== id))
  }

  function markAnswered(id: string, hrAnswer: string) {
    setQuestions(prev => (prev ?? []).map(q => (q.id === id ? { ...q, hr_answer: hrAnswer, resolved: true } : q)))
  }

  function markConfirmed(id: string) {
    setQuestions(prev => (prev ?? []).map(q => (q.id === id ? { ...q, ai_confirmed: true } : q)))
  }

  // Needs HR's attention: a genuine escalation with no HR answer yet, or an
  // AI answer nobody has confirmed/corrected — independent of whether the
  // employee themselves already clicked "this helped".
  function needsAttention(q: DoubtQuestion) {
    if (q.escalated) return !q.resolved
    return Boolean(q.ai_answer) && !q.ai_confirmed && !q.hr_answer
  }

  const pending = (questions ?? []).filter(needsAttention)
  const answered = (questions ?? []).filter(q => !needsAttention(q))

  return (
    <div>
      {bookings && bookings.length > 0 && (
        <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-[12px] font-bold text-amber-900 mb-2">📅 {bookings.length} 1:1 booking request{bookings.length !== 1 ? 's' : ''} awaiting your response</div>
          <div className="flex flex-col gap-2">
            {bookings.map(b => <BookingRequestRow key={b.id} b={b} onDecided={removeBooking} />)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-[1fr_280px] gap-[18px]">
      <Card title="Doubts from Materials" noPad>
        <div className="px-[17px]">
          {questions === null ? (
            <div className="text-center py-10 text-muted text-[13px]">Loading…</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-10 text-muted text-[13px]">No doubts have come in yet — they&apos;ll show up here as soon as an employee asks a question.</div>
          ) : (
            <>
              {pending.length === 0 && (
                <div className="text-center py-6 text-muted text-[12.5px]">Nothing needs your attention right now — every AI answer has been reviewed.</div>
              )}
              {pending.map(d => <DoubtCard key={d.id} d={d} onAnswered={markAnswered} onConfirmed={markConfirmed} />)}
              {answered.length > 0 && (
                <>
                  <div className="text-[10.5px] font-bold tracking-[0.6px] uppercase text-faint pt-3">Already Reviewed</div>
                  {answered.map(d => <DoubtCard key={d.id} d={d} onAnswered={markAnswered} onConfirmed={markConfirmed} />)}
                </>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        <Card title="Summary">
          <div className="grid grid-cols-2 gap-[10px]">
            {[
              { val: stats?.total ?? '—', lbl: 'Total Asked' },
              { val: stats?.aiHandled ?? '—', lbl: 'AI Auto-Resolved' },
              { val: stats?.awaitingReview ?? '—', lbl: 'Awaiting Your Review' },
              { val: stats?.aiConfirmed ?? '—', lbl: 'AI Confirmed Correct' },
            ].map((s) => (
              <div key={s.lbl} className="bg-ground rounded-[4px] p-3 text-center">
                <div className="text-[22px] font-extrabold text-navy tabular">{s.val}</div>
                <div className="text-[11px] text-muted mt-0.5">{s.lbl}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      </div>
    </div>
  )
}
