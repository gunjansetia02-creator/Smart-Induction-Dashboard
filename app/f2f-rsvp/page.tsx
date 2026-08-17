'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const EVENT_LABEL = 'F2F - 21 August 2026'

function RsvpForm() {
  const searchParams = useSearchParams()
  const responseParam = searchParams.get('response')
  const response: 'confirmed' | 'change' = responseParam === 'change' ? 'change' : 'confirmed'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

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

  const isConfirmed = response === 'confirmed'

  if (status === 'done') {
    return (
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-md">
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white ${
            isConfirmed ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {isConfirmed ? '✓' : '✕'}
        </div>
        <h1 className="mb-2 text-lg font-semibold text-gray-900">Thanks, {name.split(' ')[0]}!</h1>
        <p className="text-sm text-gray-600">
          {isConfirmed
            ? 'Your attendance for the F2F on 21st August 2026 is confirmed. We’ll see you there.'
            : 'Thanks for letting us know. We’ve recorded that your plan has changed and you won’t be attending the F2F on 21st August 2026.'}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
      <p
        className={`mb-1 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${
          isConfirmed ? 'bg-green-600' : 'bg-red-600'
        }`}
      >
        {isConfirmed ? "Confirmed, I'll Attend" : 'Change of Plan'}
      </p>
      <h1 className="mb-1 mt-3 text-lg font-semibold text-gray-900">F2F &mdash; 21st August 2026</h1>
      <p className="mb-6 text-sm text-gray-600">
        Please confirm your name and email so we can match your response for logistics planning.
      </p>

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
    </div>
  )
}

export default function F2FRsvpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense fallback={null}>
        <RsvpForm />
      </Suspense>
    </main>
  )
}
