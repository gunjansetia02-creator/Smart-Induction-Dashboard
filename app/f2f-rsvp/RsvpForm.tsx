'use client'

import { useState } from 'react'

const EVENT_LABEL = 'F2F - 21 August 2026'

export default function RsvpForm({ response }: { response: 'confirmed' | 'change' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isConfirmed = response === 'confirmed'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/f2f-rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, response, eventLabel: EVENT_LABEL }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Something went wrong')
      }
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="text-center">
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white ${
            isConfirmed ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {isConfirmed ? '✓' : '✕'}
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Thanks, {name.split(' ')[0]}!</h2>
        <p className="text-sm text-gray-600">
          {isConfirmed
            ? 'Your attendance for the F2F on 21st August 2026 is confirmed. We’ll see you there.'
            : 'Thanks for letting us know. We’ve recorded that your plan has changed and you won’t be attending the F2F on 21st August 2026.'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Full Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Your full name"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="you@koenig-solutions.com"
        />
      </div>

      {status === 'error' && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
          isConfirmed ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {status === 'submitting' ? 'Submitting…' : isConfirmed ? 'Confirm Attendance' : 'Confirm Change of Plan'}
      </button>
    </form>
  )
}
