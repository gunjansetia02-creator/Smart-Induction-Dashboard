'use client'

import { useEffect, useState } from 'react'

interface FeedbackRow {
  id: string
  rating: number | null
  feedback_text: string
}

export function InductionFeedbackCard({
  employeeEmail,
  employeeName,
}: {
  employeeEmail: string
  employeeName: string
}) {
  const [existing, setExisting] = useState<FeedbackRow | null | undefined>(undefined)
  const [rating, setRating] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/joiners/induction-feedback?employeeEmail=${encodeURIComponent(employeeEmail)}`)
      .then(r => r.json())
      .then(d => setExisting(d.feedback ?? null))
      .catch(() => setExisting(null))
  }, [employeeEmail])

  async function submit() {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/joiners/induction-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeEmail, employeeName, rating: rating ?? undefined, feedbackText: text.trim() }),
      })
      const data = await res.json()
      if (res.ok) setExisting(data.feedback)
    } finally {
      setSubmitting(false)
    }
  }

  // Still loading the existing-submission check — render nothing rather
  // than flash the form and immediately replace it with the thank-you state.
  if (existing === undefined) return null

  if (existing) {
    return (
      <div className="bg-kgreen-dim border border-kgreen/20 rounded-[6px] p-[15px_17px] mb-5">
        <div className="text-[13.5px] font-bold text-navy mb-1">🎉 Thanks for your feedback!</div>
        {existing.rating && <div className="text-[15px] mb-1">{'⭐'.repeat(existing.rating)}{'☆'.repeat(5 - existing.rating)}</div>}
        <div className="text-[12.5px] text-muted whitespace-pre-wrap">{existing.feedback_text}</div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-bdr rounded-[6px] p-[15px_17px] mb-5">
      <div className="text-[13.5px] font-bold text-navy mb-1">🎉 You&apos;ve completed your induction — how was it?</div>
      <div className="text-[12px] text-muted mb-3">Your feedback goes straight to HR — any suggestions to make this better for the next joiner?</div>

      <div className="flex gap-1.5 mb-3">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className="text-[22px] leading-none cursor-pointer bg-transparent border-none p-0"
            aria-label={`${n} star${n !== 1 ? 's' : ''}`}
          >
            {rating !== null && n <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="How was the induction process? Any suggestions?"
        className="w-full border border-bdr rounded px-2.5 py-1.5 text-[13px] min-h-[70px] mb-2.5"
      />
      <button
        onClick={submit}
        disabled={submitting || !text.trim()}
        className="px-[14px] py-[7px] text-[12.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? 'Sending…' : 'Submit Feedback'}
      </button>
    </div>
  )
}
