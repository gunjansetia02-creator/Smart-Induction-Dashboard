'use client'

import { useState } from 'react'
import { Pill } from '@/components/ui/Pill'
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

export function SchedulerClient({
  joiners,
  live,
  initialStatuses,
}: {
  joiners: Joiner[]
  live: boolean
  initialStatuses: Record<string, JoinerStatusEntry>
}) {
  const [statuses, setStatuses] = useState(initialStatuses)
  const [sendingAll, setSendingAll] = useState(false)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)

  function markSent(emails: string[]) {
    setStatuses(prev => {
      const next = { ...prev }
      for (const email of emails) {
        next[email] = { ...(next[email] ?? {
          materialsTotal: 0, materialsComplete: 0, materialsPercent: 0,
          openDoubts: 0, totalDoubts: 0, meetingInviteSent: false, inductionComplete: false,
        }), welcomeEmailSent: true }
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
      await sendTo(joiners.map(j => ({ name: j.name, email: j.email, department: j.dept })), live)
      markSent(joiners.map(j => j.email))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSendingAll(false)
    }
  }

  return (
    <>
      {!live && (
        <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-[11.5px] text-amber-900">
          ⚠️ Showing demo data — PMS is unreachable right now. Sending here will be simulated only.
        </div>
      )}

      <div className="flex justify-end mb-2">
        <button
          onClick={handleResendAll}
          disabled={sendingAll || joiners.length === 0}
          className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sendingAll ? 'Sending…' : 'Resend Dashboard Invite to All'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Name', 'Email', 'Dept', 'Dashboard Invite', ''].map((h, i) => (
                <th key={i} className="px-[13px] py-[9px] text-left text-[10.5px] font-bold tracking-[0.6px] uppercase text-faint bg-ground border-b border-bdr whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {joiners.map((j) => {
              const sent = statuses[j.email]?.welcomeEmailSent
              return (
                <tr key={j.id} className="hover:bg-[#F7FAFD]">
                  <td className="px-[13px] py-[11px] text-[13px] border-b border-ground"><strong>{j.name}</strong></td>
                  <td className="px-[13px] py-[11px] text-[12px] text-muted border-b border-ground">{j.email}</td>
                  <td className="px-[13px] py-[11px] text-[13px] border-b border-ground">{j.dept}</td>
                  <td className="px-[13px] py-[11px] border-b border-ground">
                    {sent ? <Pill variant="green">Sent</Pill> : <Pill variant="grey">Not Sent</Pill>}
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
            {joiners.length === 0 && (
              <tr><td colSpan={5} className="px-[13px] py-6 text-center text-[13px] text-muted">No joiners this week.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
