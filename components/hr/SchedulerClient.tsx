'use client'

import { useMemo, useState } from 'react'
import { Pill } from '@/components/ui/Pill'
import { DateRangeFilter, type DateRange } from './DateRangeFilter'
import type { Joiner } from '@/lib/types'
import type { JoinerStatusEntry } from '@/app/api/joiners/status/route'

async function sendTo(joiners: { name: string; email: string; department?: string }[], live: boolean) {
  const res = await fetch('/api/joiners/send-welcome-kit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ joiners, dryRun: !live }),
  })
  if (!res.ok && res.status !== 207) throw new Error(`Send failed (${res.status})`)
  return res.json()
}

const EMPTY_STATUS: JoinerStatusEntry = {
  materialsTotal: 0, materialsComplete: 0, materialsPercent: 0,
  openDoubts: 0, totalDoubts: 0, welcomeEmailSent: false, meetingInviteSent: false,
  loggedIn: false, inductionComplete: false,
}

export function SchedulerClient({
  joiners,
  live,
  initialStatuses,
}: {
  joiners: Joiner[]
  live: boolean
  initialStatuses: Record<string, JoinerStatusEntry>
}) {
  // 'pending' until DateRangeFilter's mount effect supplies the real default
  // range — computing a Date-based range during the initial render would run
  // at SSR time too, and server (UTC) vs client (local) time can disagree on
  // which joiners fall in range, breaking hydration for the whole list.
  const [range, setRange] = useState<DateRange | 'pending'>('pending')
  const [rangeLabel, setRangeLabel] = useState('Loading…')
  const [statuses, setStatuses] = useState(initialStatuses)
  const [sendingAll, setSendingAll] = useState(false)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (range === 'pending') return []
    if (!range) return joiners
    return joiners.filter(j => {
      const d = new Date(j.doj)
      return d >= range.from && d <= range.to
    })
  }, [joiners, range])

  function markSent(emails: string[]) {
    setStatuses(prev => {
      const next = { ...prev }
      for (const email of emails) {
        next[email] = { ...(next[email] ?? EMPTY_STATUS), welcomeEmailSent: true }
      }
      return next
    })
  }

  async function handleResendOne(j: Joiner) {
    setSendingEmail(j.email)
    try {
      await sendTo([{ name: j.name, email: j.email, department: j.dept }], live)
      markSent([j.email])
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSendingEmail(null)
    }
  }

  async function handleResendAll() {
    setSendingAll(true)
    try {
      await sendTo(filtered.map(j => ({ name: j.name, email: j.email, department: j.dept })), live)
      markSent(filtered.map(j => j.email))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSendingAll(false)
    }
  }

  return (
    <>
      <DateRangeFilter initialPreset="7d" onChange={(r, label) => { setRange(r); setRangeLabel(label) }} />

      {!live && (
        <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-[11.5px] text-amber-900">
          ⚠️ Showing demo data — PMS is unreachable right now. Sending here will be simulated only.
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="text-[12px] text-muted">
          {range === 'pending' ? 'Loading…' : `${filtered.length} joiner${filtered.length !== 1 ? 's' : ''} · ${rangeLabel}`}
        </div>
        <button
          onClick={handleResendAll}
          disabled={sendingAll || filtered.length === 0}
          className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sendingAll ? 'Sending…' : 'Resend Dashboard Invite to All'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Name', 'Email', 'Dept', 'Dashboard Invite', 'Dashboard Login', ''].map((h, i) => (
                <th key={i} className="px-[13px] py-[9px] text-left text-[10.5px] font-bold tracking-[0.6px] uppercase text-faint bg-ground border-b border-bdr whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {range !== 'pending' && filtered.map((j) => {
              const s = statuses[j.email]
              const sent = s?.welcomeEmailSent
              const loggedIn = s?.loggedIn
              return (
                <tr key={j.id} className="hover:bg-[#F7FAFD]">
                  <td className="px-[13px] py-[11px] text-[13px] border-b border-ground"><strong>{j.name}</strong></td>
                  <td className="px-[13px] py-[11px] text-[12px] text-muted border-b border-ground">{j.email}</td>
                  <td className="px-[13px] py-[11px] text-[13px] border-b border-ground">{j.dept}</td>
                  <td className="px-[13px] py-[11px] border-b border-ground">
                    {sent ? <Pill variant="green">Sent</Pill> : <Pill variant="grey">Not Sent</Pill>}
                  </td>
                  <td className="px-[13px] py-[11px] border-b border-ground">
                    {loggedIn ? <Pill variant="green">Logged In</Pill> : <Pill variant="amber">Not Yet</Pill>}
                  </td>
                  <td className="px-[13px] py-[11px] border-b border-ground">
                    <button
                      onClick={() => handleResendOne(j)}
                      disabled={sendingEmail === j.email || !j.email}
                      className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sendingEmail === j.email ? 'Sending…' : sent ? 'Resend' : 'Send'}
                    </button>
                  </td>
                </tr>
              )
            })}
            {range !== 'pending' && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-[13px] py-6 text-center text-[13px] text-muted">No joiners match this date range.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
