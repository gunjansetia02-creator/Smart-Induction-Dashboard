'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Joiner } from '@/lib/types'

interface FeedbackEntry {
  id: string
  employee_email: string
  employee_name: string | null
  feedback_text: string
  created_at: string
}

interface RMSLogEntry {
  id: string
  feedback_text: string
  status: 'sent' | 'failed'
  error_message: string | null
  created_at: string
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function FeedbackClient({ joiners, live, initialEmployeeEmail }: { joiners: Joiner[]; live: boolean; initialEmployeeEmail?: string }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Joiner | null>(null)
  const [entries, setEntries] = useState<FeedbackEntry[] | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const [rmsDraft, setRmsDraft] = useState('')
  const [rmsSending, setRmsSending] = useState(false)
  const [rmsLog, setRmsLog] = useState<RMSLogEntry[] | null>(null)
  const [rmsError, setRmsError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return joiners
    return joiners.filter(j => j.name.toLowerCase().includes(q) || j.designation.toLowerCase().includes(q) || j.dept.toLowerCase().includes(q))
  }, [joiners, search])

  // Auto-select the employee this page was deep-linked for — e.g. the
  // "give feedback" email sent when someone completes their induction.
  useEffect(() => {
    if (!initialEmployeeEmail || selected) return
    const match = joiners.find(j => j.email.toLowerCase() === initialEmployeeEmail.toLowerCase())
    if (match) setSelected(match)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmployeeEmail, joiners])

  useEffect(() => {
    if (!selected) { setEntries(null); setRmsLog(null); return }
    setEntries(null)
    setRmsLog(null)
    setRmsError(null)
    fetch(`/api/joiners/feedback?employeeEmail=${encodeURIComponent(selected.email)}`)
      .then(r => r.json())
      .then(d => setEntries(d.feedback ?? []))
      .catch(() => setEntries([]))
    fetch(`/api/joiners/rms-feedback?employeeEmail=${encodeURIComponent(selected.email)}`)
      .then(r => r.json())
      .then(d => setRmsLog(d.log ?? []))
      .catch(() => setRmsLog([]))
  }, [selected])

  async function addFeedback() {
    if (!selected || !draft.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/joiners/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeEmail: selected.email, employeeName: selected.name, feedbackText: draft.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setEntries(prev => [data.feedback, ...(prev ?? [])])
        setDraft('')
      }
    } finally {
      setSaving(false)
    }
  }

  async function deleteFeedback(id: string) {
    if (!confirm('Delete this feedback entry?')) return
    const res = await fetch(`/api/joiners/feedback/${id}`, { method: 'DELETE' })
    if (res.ok) setEntries(prev => (prev ?? []).filter(e => e.id !== id))
  }

  async function sendRmsFeedback() {
    if (!selected || !rmsDraft.trim()) return
    setRmsSending(true)
    setRmsError(null)
    try {
      const res = await fetch('/api/joiners/rms-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeEmail: selected.email, employeeName: selected.name, feedbackText: rmsDraft.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setRmsDraft('')
        fetch(`/api/joiners/rms-feedback?employeeEmail=${encodeURIComponent(selected.email)}`)
          .then(r => r.json())
          .then(d => setRmsLog(d.log ?? []))
          .catch(() => {})
      } else {
        setRmsError(data.error ?? 'Failed to submit to RMS')
      }
    } catch {
      setRmsError('Failed to reach the server')
    } finally {
      setRmsSending(false)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <div className="text-[14px] font-bold text-navy">Employee Feedback</div>
        <div className="text-[12px] text-muted mt-0.5">
          Private notes only you can see — {live ? 'live data from PMS' : 'demo data (PMS unreachable)'}
        </div>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-[18px]">
        {/* Employee picker */}
        <div className="bg-white border border-bdr rounded-[8px] overflow-hidden flex flex-col" style={{ maxHeight: 560 }}>
          <div className="p-2.5 border-b border-ground">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employees…"
              className="w-full border border-bdr rounded px-2.5 py-1.5 text-[12.5px]"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-muted text-[12.5px]">No matches.</div>
            ) : (
              filtered.map(j => (
                <button
                  key={j.id}
                  onClick={() => setSelected(j)}
                  className={`w-full text-left px-3 py-2.5 border-b border-ground last:border-0 cursor-pointer hover:bg-ground ${selected?.id === j.id ? 'bg-sky-dim' : 'bg-white'}`}
                >
                  <div className="text-[12.5px] font-semibold text-navy">{j.name}</div>
                  <div className="text-[11px] text-muted mt-0.5">{j.designation}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Feedback panel */}
        <div className="bg-white border border-bdr rounded-[8px] p-4">
          {!selected ? (
            <div className="text-center py-16 text-muted text-[13px]">Select an employee on the left to view or add feedback.</div>
          ) : (
            <div>
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-ground">
                <div
                  className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                  style={{ background: selected.avatarColor }}
                >
                  {selected.initials}
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-navy">{selected.name}</div>
                  <div className="text-[11.5px] text-muted">{selected.designation} · {selected.dept}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-3">
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder={`Add a private note about ${selected.name.split(' ')[0]}'s induction progress…`}
                  className="border border-bdr rounded px-2.5 py-1.5 text-[13px] min-h-[70px]"
                />
                <button
                  onClick={addFeedback}
                  disabled={saving || !draft.trim()}
                  className="self-end px-[12px] py-[6px] text-[12px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : '+ Add Feedback'}
                </button>
              </div>

              <div className="text-[10.5px] font-bold tracking-[0.6px] uppercase text-faint mb-2">History</div>
              {entries === null ? (
                <div className="text-center py-6 text-muted text-[12.5px]">Loading…</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-6 text-muted text-[12.5px]">No feedback added yet for {selected.name}.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {entries.map(e => (
                    <div key={e.id} className="bg-ground rounded-[5px] p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[13px] text-navy whitespace-pre-wrap flex-1">{e.feedback_text}</div>
                        <button onClick={() => deleteFeedback(e.id)} className="text-[11px] text-red-600 hover:underline cursor-pointer bg-transparent border-none p-0 whitespace-nowrap">Delete</button>
                      </div>
                      <div className="text-[11px] text-faint mt-1">{fmt(e.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-ground">
                <div className="text-[13px] font-bold text-navy mb-1">RMS One-on-One Feedback</div>
                <div className="text-[11.5px] text-muted mb-3">
                  This gets recorded on the RMS reporting-feedback panel (as confidential), attributed to {selected.name.split(' ')[0]}&apos;s reporting manager — not just kept here.
                </div>

                <div className="flex flex-col gap-2 mb-3">
                  <textarea
                    value={rmsDraft}
                    onChange={e => setRmsDraft(e.target.value)}
                    placeholder={`Feedback on ${selected.name.split(' ')[0]}'s induction performance…`}
                    className="border border-bdr rounded px-2.5 py-1.5 text-[13px] min-h-[70px]"
                  />
                  {rmsError && <div className="text-[11.5px] text-red-600">{rmsError}</div>}
                  <button
                    onClick={sendRmsFeedback}
                    disabled={rmsSending || !rmsDraft.trim()}
                    className="self-end px-[12px] py-[6px] text-[12px] font-semibold bg-navy text-white rounded cursor-pointer hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {rmsSending ? 'Sending to RMS…' : 'Send to RMS'}
                  </button>
                </div>

                {rmsLog !== null && rmsLog.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {rmsLog.map(r => (
                      <div key={r.id} className="bg-ground rounded-[5px] p-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[13px] text-navy whitespace-pre-wrap flex-1">{r.feedback_text}</div>
                          <span className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${r.status === 'sent' ? 'bg-kgreen-dim text-emerald-700' : 'bg-kred-dim text-red-700'}`}>
                            {r.status === 'sent' ? '✓ Sent to RMS' : '✗ Failed'}
                          </span>
                        </div>
                        {r.status === 'failed' && r.error_message && (
                          <div className="text-[11px] text-red-600 mt-1">{r.error_message}</div>
                        )}
                        <div className="text-[11px] text-faint mt-1">{fmt(r.created_at)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
