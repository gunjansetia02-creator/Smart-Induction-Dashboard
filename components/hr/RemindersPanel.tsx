'use client'

import { useEffect, useState } from 'react'
import type { ReminderCandidate } from '@/lib/automation/completion-reminder'

interface PlanResponse { autoEnabled: boolean; schedule: number[]; plan: ReminderCandidate[]; error?: string }

// Completion reminders: auto on/off switch, who still has materials pending,
// and per-joiner "preview to me" / "send now".
export function RemindersPanel() {
  const [data, setData] = useState<PlanResponse | null>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/reminders')
    setData(await res.json())
  }
  useEffect(() => { load().catch(() => {}) }, [])

  async function toggleAuto() {
    if (!data) return
    const next = !data.autoEnabled
    if (next && !confirm('Turn on automatic reminders? Joiners with pending materials will be emailed at 9:30 AM on working days, as per the schedule shown.')) return
    setBusy('toggle')
    await fetch('/api/reminders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autoEnabled: next }) })
    await load()
    setBusy(null)
  }

  async function send(c: ReminderCandidate, preview: boolean) {
    if (!preview && !confirm(`Email a reminder to ${c.name} now?`)) return
    setBusy(c.email + (preview ? ':p' : ''))
    setNote(null)
    const res = await fetch('/api/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: c.email, preview }) })
    const d = await res.json()
    setNote(!res.ok ? `⚠️ ${d.error}` : preview ? `Preview of ${c.name}'s reminder #${d.reminderNo} sent to ${d.previewSentTo}` : `Reminder #${d.reminderNo} sent to ${c.name}`)
    if (!preview && res.ok) await load()
    setBusy(null)
  }

  const pending = data?.plan ?? []
  const dueToday = pending.filter(c => c.nextReminderNo !== null).length

  return (
    <div className="bg-white border border-bdr rounded-[10px] mb-4">
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <div className="text-[13px] font-bold text-navy">🔔 Completion reminders</div>
          <div className="text-[11.5px] text-muted mt-0.5">
            {!data ? 'Loading…' : data.error ? `Couldn't load: ${data.error}` :
              `${pending.length} recent joiner${pending.length === 1 ? '' : 's'} with pending materials · ${dueToday} due today · sent on working day ${data.schedule.join(', ')} after joining, at 9:30 AM`}
          </div>
        </div>
        {data && !data.error && (
          <button onClick={toggleAuto} disabled={busy === 'toggle'}
            className={`px-[10px] py-[5px] text-[11.5px] font-semibold rounded cursor-pointer border ${data.autoEnabled ? 'bg-kgreen-dim text-emerald-700 border-emerald-200' : 'bg-ground text-muted border-bdr'}`}>
            Auto: {data.autoEnabled ? 'ON' : 'OFF'}
          </button>
        )}
        <button onClick={() => setOpen(o => !o)} className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">
          {open ? 'Hide list' : 'Show list'}
        </button>
      </div>

      {note && <div className="mx-4 mb-3 px-3 py-2 text-[11.5px] rounded bg-sky-dim text-blue-800">{note}</div>}

      {open && data && !data.error && (
        <div className="border-t border-bdr overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-[0.5px] text-muted bg-ground">
                <th className="px-4 py-2">Joiner</th><th className="px-2 py-2">Joined</th><th className="px-2 py-2">Done</th>
                <th className="px-2 py-2">Reminders sent</th><th className="px-2 py-2">Next</th><th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-muted">Everyone who joined in the last 30 days has finished their materials 🎉</td></tr>}
              {pending.map(c => (
                <tr key={c.email} className="border-t border-bdr">
                  <td className="px-4 py-2"><div className="font-semibold text-navy">{c.name}</div><div className="text-[10.5px] text-faint">{c.email}</div></td>
                  <td className="px-2 py-2 whitespace-nowrap">{c.doj} <span className="text-faint">({c.workingDays} working days)</span></td>
                  <td className="px-2 py-2 whitespace-nowrap">{c.materialsComplete}/{c.materialsTotal}</td>
                  <td className="px-2 py-2">{c.remindersSent} of {data.schedule.length}</td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {c.nextReminderNo ? <span className="text-amber-800 font-semibold">#{c.nextReminderNo} due today</span>
                      : c.remindersSent >= data.schedule.length ? <span className="text-faint">All sent</span>
                      : <span className="text-faint">Day {data.schedule[c.remindersSent]}</span>}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <button onClick={() => send(c, true)} disabled={busy !== null}
                      className="px-2 py-[3px] text-[11px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85 mr-1.5">
                      {busy === c.email + ':p' ? 'Sending…' : 'Preview to me'}
                    </button>
                    <button onClick={() => send(c, false)} disabled={busy !== null}
                      className="px-2 py-[3px] text-[11px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85">
                      {busy === c.email ? 'Sending…' : 'Send now'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
