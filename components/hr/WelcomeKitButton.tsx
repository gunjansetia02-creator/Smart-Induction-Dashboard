'use client'

import { useState } from 'react'
import type { Joiner } from '@/lib/types'

type KitResult = { name: string; email: string; email_sent: string | boolean; meeting_sent: string }

async function callSendWelcomeKit(joiners: { name: string; email: string; department?: string }[], opts: { dryRun?: boolean; skipEmail?: boolean }) {
  const res = await fetch('/api/joiners/send-welcome-kit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ joiners, ...opts }),
  })
  const data = await res.json()
  return data.results as KitResult[]
}

function ResultRow({ r }: { r: KitResult }) {
  const emailOk = r.email_sent === true
  const emailText =
    r.email_sent === 'skipped' ? '— skipped' :
    typeof r.email_sent === 'string' && r.email_sent.startsWith('simulated') ? '🧪 simulated' :
    emailOk ? '✅ sent' : `❌ ${r.email_sent}`
  const meetingOk = r.meeting_sent === 'invited'
  const meetingText =
    typeof r.meeting_sent === 'string' && r.meeting_sent.startsWith('simulated') ? '🧪 simulated' :
    meetingOk ? '✅ invited' : `❌ ${r.meeting_sent}`

  return (
    <div className="flex items-center justify-between text-[12px] py-[7px] border-b border-ground last:border-0">
      <div>
        <div className="font-semibold text-navy">{r.name}</div>
        <div className="text-faint text-[11px]">{r.email}</div>
      </div>
      <div className="text-right">
        <div className="text-muted">Email: {emailText}</div>
        <div className="text-muted">Meeting: {meetingText}</div>
      </div>
    </div>
  )
}

export function WelcomeKitButton({ joiners, live, hrEmail }: { joiners: Joiner[]; live: boolean; hrEmail: string }) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState<KitResult[] | null>(null)
  const [testStatus, setTestStatus] = useState<string | null>(null)
  const [testSending, setTestSending] = useState(false)

  async function handleSend() {
    setSending(true)
    try {
      const r = await callSendWelcomeKit(
        joiners.map(j => ({ name: j.name, email: j.email, department: j.dept })),
        { dryRun: !live }
      )
      setResults(r)
    } finally {
      setSending(false)
    }
  }

  async function handleTestInvite() {
    setTestSending(true)
    setTestStatus(null)
    try {
      const r = await callSendWelcomeKit(
        [{ name: 'Gunjan Setia (Test)', email: hrEmail }],
        { skipEmail: true, dryRun: false }
      )
      const meeting = r[0]?.meeting_sent
      setTestStatus(meeting === 'invited' ? `✅ Real Monday meeting invite sent to ${hrEmail}` : `❌ ${meeting}`)
    } catch (e) {
      setTestStatus(`❌ ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setTestSending(false)
    }
  }

  function closeAndReset() {
    setOpen(false)
    setResults(null)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85 whitespace-nowrap"
      >
        📧 Send Welcome Kit
      </button>

      {open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onClick={closeAndReset}>
          <div
            className="bg-white rounded-[8px] shadow-lg w-full max-w-[440px] max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-ground">
              <div className="text-[14px] font-bold text-navy">Send Welcome Kit</div>
              <div className="text-[11.5px] text-muted mt-0.5">
                Welcome email + Monday 12 PM Teams meeting invite, for {joiners.length} joiner{joiners.length !== 1 ? 's' : ''} in the current filter.
              </div>
            </div>

            {!live && (
              <div className="mx-4 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-[11.5px] text-amber-900">
                ⚠️ You're viewing demo data, not real employees. Sending here will be <strong>simulated only</strong> — no real email or calendar invite will be created.
              </div>
            )}

            <div className="p-4 overflow-y-auto flex-1">
              {!results ? (
                <div className="flex flex-col">
                  {joiners.map(j => (
                    <div key={j.id} className="flex items-center justify-between text-[12.5px] py-[6px] border-b border-ground last:border-0">
                      <span className="font-medium text-navy">{j.name}</span>
                      <span className="text-muted">{j.email}</span>
                    </div>
                  ))}
                  {joiners.length === 0 && (
                    <div className="text-center text-muted text-[12.5px] py-6">No joiners in the current filter.</div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col">
                  {results.map(r => <ResultRow key={r.email} r={r} />)}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-ground flex justify-end gap-2">
              <button
                onClick={closeAndReset}
                className="px-[12px] py-[7px] text-[12px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85"
              >
                {results ? 'Close' : 'Cancel'}
              </button>
              {!results && (
                <button
                  onClick={handleSend}
                  disabled={sending || joiners.length === 0}
                  className="px-[12px] py-[7px] text-[12px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending…' : live ? 'Confirm & Send' : 'Simulate Send'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="absolute right-0 top-full mt-1 whitespace-nowrap text-right z-10">
        <button
          onClick={handleTestInvite}
          disabled={testSending}
          className="text-[10.5px] text-sky hover:underline cursor-pointer disabled:opacity-50 bg-transparent border-none p-0"
        >
          {testSending ? 'Sending real test invite…' : `🧪 Send a real test meeting invite to ${hrEmail}`}
        </button>
        {testStatus && <div className="text-[10.5px] text-muted mt-0.5">{testStatus}</div>}
      </div>
    </div>
  )
}
